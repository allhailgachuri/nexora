"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.IncidentManager = void 0;
const database_1 = require("../db/database");
const auditLog_1 = require("./auditLog");
class IncidentManager {
    static createIncident(params) {
        const id = `inc-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
        const incident = {
            id,
            orgId: params.orgId,
            siteId: params.siteId,
            deviceId: params.deviceId,
            title: params.title,
            description: params.description,
            severity: params.severity,
            status: 'OPEN',
            securityEventIds: params.securityEventIds || [],
            anomalyEventIds: params.anomalyEventIds || [],
            actions: [],
            comments: [],
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
        };
        database_1.db.saveIncident(incident);
        auditLog_1.AuditLogService.logAction({
            orgId: params.orgId,
            actorId: 'system',
            actorEmail: params.actorEmail || 'soc-engine@nexora.internal',
            actorRole: 'SECURITY_ANALYST',
            action: 'CREATE_INCIDENT',
            resourceType: 'INCIDENT',
            resourceId: incident.id,
            details: {
                title: incident.title,
                severity: incident.severity,
                deviceId: incident.deviceId
            }
        });
        return incident;
    }
    static updateStatus(incidentId, status, actorEmail, rootCauseAnalysis) {
        const incident = database_1.db.getIncidentById(incidentId);
        if (!incident)
            throw new Error('Incident not found');
        const prevStatus = incident.status;
        incident.status = status;
        if (rootCauseAnalysis) {
            incident.rootCauseAnalysis = rootCauseAnalysis;
        }
        if (status === 'RESOLVED' || status === 'CLOSED') {
            incident.resolvedAt = new Date().toISOString();
        }
        database_1.db.saveIncident(incident);
        auditLog_1.AuditLogService.logAction({
            orgId: incident.orgId,
            actorId: 'user',
            actorEmail,
            actorRole: 'SECURITY_ANALYST',
            action: 'UPDATE_INCIDENT_STATUS',
            resourceType: 'INCIDENT',
            resourceId: incident.id,
            details: {
                prevStatus,
                newStatus: status,
                rootCauseAnalysis
            }
        });
        return incident;
    }
    static assignAnalyst(incidentId, analystId, actorEmail) {
        const incident = database_1.db.getIncidentById(incidentId);
        if (!incident)
            throw new Error('Incident not found');
        incident.assignedTo = analystId;
        incident.status = incident.status === 'OPEN' ? 'TRIAGED' : incident.status;
        database_1.db.saveIncident(incident);
        auditLog_1.AuditLogService.logAction({
            orgId: incident.orgId,
            actorId: 'user',
            actorEmail,
            actorRole: 'SECURITY_ANALYST',
            action: 'ASSIGN_INCIDENT',
            resourceType: 'INCIDENT',
            resourceId: incident.id,
            details: { assignedTo: analystId }
        });
        return incident;
    }
    static addComment(incidentId, userId, userName, comment) {
        const incident = database_1.db.getIncidentById(incidentId);
        if (!incident)
            throw new Error('Incident not found');
        const commentObj = {
            id: `comm-${Date.now()}`,
            incidentId,
            userId,
            userName,
            comment,
            createdAt: new Date().toISOString()
        };
        incident.comments.push(commentObj);
        database_1.db.saveIncident(incident);
        return commentObj;
    }
}
exports.IncidentManager = IncidentManager;
