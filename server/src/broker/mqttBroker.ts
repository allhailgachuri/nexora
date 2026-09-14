import { WebSocketServer, WebSocket } from 'ws';
import { certManager } from '../pki/certManager';
import { TopicAclEngine } from './aclEngine';
import { TelemetryIngestor } from '../ingestion/telemetryIngestor';
import { SecurityEngine } from '../security/securityEngine';
import { db } from '../db/database';

export interface BrokerMessagePayload {
  type: 'CONNECT' | 'PUBLISH' | 'SUBSCRIBE' | 'PING';
  clientCertPem?: string;
  clientIp?: string;
  topic?: string;
  payload?: any;
  deviceId?: string;
  orgId?: string;
}

export class NexoraMqttBroker {
  private static instance: NexoraMqttBroker;
  private wsServer: WebSocketServer | null = null;
  private frontendClients: Set<WebSocket> = new Set();
  private authenticatedSessions: Map<WebSocket, { deviceId: string; orgId: string; certSerial: string; clientIp: string }> = new Map();

  private constructor() {}

  public static getInstance(): NexoraMqttBroker {
    if (!NexoraMqttBroker.instance) {
      NexoraMqttBroker.instance = new NexoraMqttBroker();
    }
    return NexoraMqttBroker.instance;
  }

  public init(wss: WebSocketServer): void {
    this.wsServer = wss;

    wss.on('connection', (ws: WebSocket, req) => {
      const clientIp = (req.socket.remoteAddress || '127.0.0.1').replace('::ffff:', '');

      ws.on('message', (data: string) => {
        try {
          const msg = JSON.parse(data.toString()) as BrokerMessagePayload;
          this.handleMessage(ws, msg, clientIp);
        } catch (err: any) {
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

  public registerFrontendClient(ws: WebSocket): void {
    this.frontendClients.add(ws);
  }

  public removeFrontendClient(ws: WebSocket): void {
    this.frontendClients.delete(ws);
  }

  /**
   * Broadcasts live updates (telemetry, alerts, incidents, stats) to connected frontend dashboards
   */
  public broadcastToDashboards(eventType: string, payload: any): void {
    const msg = JSON.stringify({ type: eventType, data: payload, timestamp: new Date().toISOString() });
    for (const client of this.frontendClients) {
      if (client.readyState === WebSocket.OPEN) {
        client.send(msg);
      }
    }
  }

  private handleMessage(ws: WebSocket, msg: BrokerMessagePayload, clientIp: string): void {
    if (msg.type === 'PING') {
      ws.send(JSON.stringify({ type: 'PONG', timestamp: Date.now() }));
      return;
    }

    if (msg.type === 'CONNECT') {
      // 1. Validate X.509 Client Certificate
      if (!msg.clientCertPem) {
        SecurityEngine.reportSecurityEvent({
          eventType: 'AUTH_FAILURE',
          orgId: msg.orgId || 'org-nexora-prod',
          clientIp,
          details: 'Connection attempt rejected: Missing X.509 Client Certificate (mTLS Enforced)'
        });
        ws.send(JSON.stringify({ type: 'CONNACK', returnCode: 'REFUSED_BAD_AUTHENTICATION_METHOD', reason: 'mTLS Client Certificate Required' }));
        ws.close();
        return;
      }

      const certVal = certManager.validateClientCertificate(msg.clientCertPem);
      if (!certVal.isValid || !certVal.deviceCert) {
        const dev = msg.deviceId ? db.getDeviceById(msg.deviceId) : undefined;
        const evType = certVal.isRevoked ? 'REVOKED_CERT_USAGE' : (certVal.isExpired ? 'EXPIRED_CERT_USAGE' : 'AUTH_FAILURE');

        SecurityEngine.reportSecurityEvent({
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
      const dev = db.getDeviceById(certVal.deviceCert.deviceId);
      if (!dev) {
        ws.send(JSON.stringify({ type: 'CONNACK', returnCode: 'REFUSED_IDENTIFIER_REJECTED', reason: 'Device not found' }));
        ws.close();
        return;
      }

      const isConcurrenceValid = SecurityEngine.checkCertificateConcurrence(
        certVal.deviceCert.fingerprintSha256,
        clientIp,
        dev.id,
        dev.orgId
      );

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
      const acl = TopicAclEngine.canDevicePublish(authDeviceId, authOrgId, msg.topic);
      if (!acl.allowed) {
        if (acl.isSpoofAttempt) {
          SecurityEngine.reportSecurityEvent({
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
      const outcome = TelemetryIngestor.processTelemetryMessage({
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

export const mqttBroker = NexoraMqttBroker.getInstance();
