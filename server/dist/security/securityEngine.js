"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SecurityEngine = void 0;
const database_1 = require("../db/database");
const incidentManager_1 = require("./incidentManager");
const auditLog_1 = require("./auditLog");
class SecurityEngine {
    static ipUsageLedger = new Map(); // certFingerprint -> { ip, lastSeenMs }
    /**
     * Evaluates security violations, logs SecurityEvent, and raises Incidents when necessary
     */
    static reportSecurityEvent(params) {
        let calculatedSeverity = params.severity || 'MEDIUM';
        if (params.eventType === 'CERT_REUSE' || params.eventType === 'REVOKED_CERT_USAGE') {
            calculatedSeverity = 'CRITICAL';
        }
        else if (params.eventType === 'ROGUE_TOPIC_ATTEMPT' || params.eventType === 'REPLAY_ATTACK') {
            calculatedSeverity = 'HIGH';
        }
        const device = params.deviceId ? database_1.db.getDeviceById(params.deviceId) : undefined;
        const eventId = `sec-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
        const secEvent = {
            id: eventId,
            deviceId: params.deviceId,
            deviceSerialNumber: device?.serialNumber,
            orgId: params.orgId,
            siteId: params.siteId || device?.siteId,
            timestamp: new Date().toISOString(),
            eventType: params.eventType,
            severity: calculatedSeverity,
            clientIp: params.clientIp,
            attemptedTopic: params.attemptedTopic,
            certificateFingerprint: params.certificateFingerprint,
            details: params.details,
            rawTelemetrySnippet: params.rawSnippet,
            status: 'NEW'
        };
        database_1.db.recordSecurityEvent(secEvent);
        // Auto-create or link to an Incident if severity is HIGH or CRITICAL
        if (calculatedSeverity === 'HIGH' || calculatedSeverity === 'CRITICAL') {
            const title = `[SOC ALERT] ${params.eventType.replace(/_/g, ' ')} on ${device?.serialNumber || params.deviceId || 'Unknown Device'}`;
            incidentManager_1.IncidentManager.createIncident({
                orgId: params.orgId,
                siteId: secEvent.siteId,
                deviceId: params.deviceId,
                title,
                description: params.details,
                severity: calculatedSeverity,
                securityEventIds: [secEvent.id]
            });
        }
        auditLog_1.AuditLogService.logAction({
            orgId: params.orgId,
            actorId: 'security-engine',
            actorEmail: 'defense-agent@nexora.internal',
            actorRole: 'SECURITY_ANALYST',
            action: `SECURITY_EVENT_${params.eventType}`,
            resourceType: 'DEVICE',
            resourceId: params.deviceId || 'unknown',
            details: {
                eventType: params.eventType,
                severity: calculatedSeverity,
                clientIp: params.clientIp,
                details: params.details
            },
            ipAddress: params.clientIp
        });
        return secEvent;
    }
    /**
     * Tracks certificate reuse across disparate IP addresses (Cloning & Credential Theft Detection)
     */
    static checkCertificateConcurrence(certFingerprint, clientIp, deviceId, orgId) {
        const now = Date.now();
        const existing = this.ipUsageLedger.get(certFingerprint);
        if (existing && existing.ip !== clientIp && now - existing.lastSeenMs < 120000) {
            // Same certificate concurrently active from 2 distinct IP addresses!
            this.reportSecurityEvent({
                eventType: 'CERT_REUSE',
                deviceId,
                orgId,
                clientIp,
                certificateFingerprint: certFingerprint,
                severity: 'CRITICAL',
                details: `Cryptographic Credential Cloning Detected: Certificate ${certFingerprint.substring(0, 16)}... used simultaneously from IP ${existing.ip} and IP ${clientIp}`
            });
            return false; // Reject or flag
        }
        this.ipUsageLedger.set(certFingerprint, { ip: clientIp, lastSeenMs: now });
        return true;
    }
}
exports.SecurityEngine = SecurityEngine;
