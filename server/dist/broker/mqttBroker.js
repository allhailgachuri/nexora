"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.mqttBroker = exports.NexoraMqttBroker = void 0;
const ws_1 = require("ws");
const certManager_1 = require("../pki/certManager");
const aclEngine_1 = require("./aclEngine");
const telemetryIngestor_1 = require("../ingestion/telemetryIngestor");
const securityEngine_1 = require("../security/securityEngine");
const database_1 = require("../db/database");
class NexoraMqttBroker {
    static instance;
    wsServer = null;
    frontendClients = new Set();
    authenticatedSessions = new Map();
    constructor() { }
    static getInstance() {
        if (!NexoraMqttBroker.instance) {
            NexoraMqttBroker.instance = new NexoraMqttBroker();
        }
        return NexoraMqttBroker.instance;
    }
    init(wss) {
        this.wsServer = wss;
        wss.on('connection', (ws, req) => {
            const clientIp = (req.socket.remoteAddress || '127.0.0.1').replace('::ffff:', '');
            ws.on('message', (data) => {
                try {
                    const msg = JSON.parse(data.toString());
                    this.handleMessage(ws, msg, clientIp);
                }
                catch (err) {
                    ws.send(JSON.stringify({ type: 'ERROR', message: `Malformed JSON frame: ${err.message}` }));
                }
            });
            ws.on('close', () => {
                this.authenticatedSessions.delete(ws);
                this.frontendClients.delete(ws);
            });
        });
        console.log('[BROKER] Nexora Secure MQTT & WebSocket Broker initialized.');
    }
    registerFrontendClient(ws) {
        this.frontendClients.add(ws);
    }
    removeFrontendClient(ws) {
        this.frontendClients.delete(ws);
    }
    /**
     * Broadcasts live updates (telemetry, alerts, incidents, stats) to connected frontend dashboards
     */
    broadcastToDashboards(eventType, payload) {
        const msg = JSON.stringify({ type: eventType, data: payload, timestamp: new Date().toISOString() });
        for (const client of this.frontendClients) {
            if (client.readyState === ws_1.WebSocket.OPEN) {
                client.send(msg);
            }
        }
    }
    handleMessage(ws, msg, clientIp) {
        if (msg.type === 'PING') {
            ws.send(JSON.stringify({ type: 'PONG', timestamp: Date.now() }));
            return;
        }
        if (msg.type === 'CONNECT') {
            // 1. Validate X.509 Client Certificate
            if (!msg.clientCertPem) {
                securityEngine_1.SecurityEngine.reportSecurityEvent({
                    eventType: 'AUTH_FAILURE',
                    orgId: msg.orgId || 'org-nexora-prod',
                    clientIp,
                    details: 'Connection attempt rejected: Missing X.509 Client Certificate (mTLS Enforced)'
                });
                ws.send(JSON.stringify({ type: 'CONNACK', returnCode: 'REFUSED_BAD_AUTHENTICATION_METHOD', reason: 'mTLS Client Certificate Required' }));
                ws.close();
                return;
            }
            const certVal = certManager_1.certManager.validateClientCertificate(msg.clientCertPem);
            if (!certVal.isValid || !certVal.deviceCert) {
                const dev = msg.deviceId ? database_1.db.getDeviceById(msg.deviceId) : undefined;
                const evType = certVal.isRevoked ? 'REVOKED_CERT_USAGE' : (certVal.isExpired ? 'EXPIRED_CERT_USAGE' : 'AUTH_FAILURE');
                securityEngine_1.SecurityEngine.reportSecurityEvent({
                    eventType: evType,
                    deviceId: dev?.id,
                    orgId: dev?.orgId || 'org-nexora-prod',
                    clientIp,
                    certificateFingerprint: certVal.deviceCert?.fingerprintSha256,
                    details: `mTLS Handshake Rejected: ${certVal.rejectionReason}`
                });
                ws.send(JSON.stringify({
                    type: 'CONNACK',
                    returnCode: 'REFUSED_NOT_AUTHORIZED',
                    reason: certVal.rejectionReason
                }));
                ws.close();
                return;
            }
            // Check for credential reuse from concurrent IPs
            const dev = database_1.db.getDeviceById(certVal.deviceCert.deviceId);
            if (!dev) {
                ws.send(JSON.stringify({ type: 'CONNACK', returnCode: 'REFUSED_IDENTIFIER_REJECTED', reason: 'Device not found' }));
                ws.close();
                return;
            }
            const isConcurrenceValid = securityEngine_1.SecurityEngine.checkCertificateConcurrence(certVal.deviceCert.fingerprintSha256, clientIp, dev.id, dev.orgId);
            if (!isConcurrenceValid) {
                ws.send(JSON.stringify({ type: 'CONNACK', returnCode: 'REFUSED_SERVER_UNAVAILABLE', reason: 'Certificate concurrency anomaly detected' }));
                ws.close();
                return;
            }
            // Successful mTLS connection
            this.authenticatedSessions.set(ws, {
                deviceId: dev.id,
                orgId: dev.orgId,
                certSerial: certVal.deviceCert.serialNumber,
                clientIp
            });
            ws.send(JSON.stringify({
                type: 'CONNACK',
                returnCode: 'ACCEPTED',
                sessionPresent: false,
                deviceId: dev.id,
                assignedTopicPrefix: `org/${dev.orgId}/site/${dev.siteId}/device/${dev.id}/`
            }));
            this.broadcastToDashboards('DEVICE_CONNECTED', { deviceId: dev.id, serialNumber: dev.serialNumber, ip: clientIp });
            return;
        }
        if (msg.type === 'PUBLISH') {
            const session = this.authenticatedSessions.get(ws);
            const authDeviceId = session ? session.deviceId : msg.deviceId;
            const authOrgId = session ? session.orgId : (msg.orgId || 'org-nexora-prod');
            if (!authDeviceId || !msg.topic) {
                ws.send(JSON.stringify({ type: 'PUBACK', status: 'REJECTED', reason: 'Unauthenticated or missing topic' }));
                return;
            }
            // Strict Topic ACL Check
            const acl = aclEngine_1.TopicAclEngine.canDevicePublish(authDeviceId, authOrgId, msg.topic);
            if (!acl.allowed) {
                if (acl.isSpoofAttempt) {
                    securityEngine_1.SecurityEngine.reportSecurityEvent({
                        eventType: 'ROGUE_TOPIC_ATTEMPT',
                        deviceId: authDeviceId,
                        orgId: authOrgId,
                        clientIp,
                        attemptedTopic: msg.topic,
                        details: acl.reason || 'Topic ACL Violation: Attempted to publish outside assigned topic namespace'
                    });
                }
                ws.send(JSON.stringify({ type: 'PUBACK', status: 'ACL_DENIED', reason: acl.reason }));
                return;
            }
            // Process Ingestion
            const outcome = telemetryIngestor_1.TelemetryIngestor.processTelemetryMessage({
                deviceId: authDeviceId,
                payload: msg.payload || {},
                timestamp: new Date().toISOString()
            });
            ws.send(JSON.stringify({
                type: 'PUBACK',
                status: outcome.success ? 'SUCCESS' : 'INGESTION_ERROR',
                tier1Status: outcome.tier1Status,
                violations: outcome.tier1Violations
            }));
            // Broadcast live telemetry & events to SOC dashboard
            if (outcome.reading) {
                this.broadcastToDashboards('TELEMETRY_STREAM', {
                    deviceId: authDeviceId,
                    reading: outcome.reading,
                    anomalyEventId: outcome.anomalyEventId
                });
            }
            return;
        }
    }
}
exports.NexoraMqttBroker = NexoraMqttBroker;
exports.mqttBroker = NexoraMqttBroker.getInstance();
