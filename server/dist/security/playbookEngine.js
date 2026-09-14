"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PlaybookEngine = void 0;
const database_1 = require("../db/database");
const certManager_1 = require("../pki/certManager");
const auditLog_1 = require("./auditLog");
class PlaybookEngine {
    /**
     * Executes or queues a response action on a device/incident with human safety gating
     */
    static executeAction(params) {
        const incident = database_1.db.getIncidentById(params.incidentId);
        if (!incident) {
            throw new Error(`Incident ${params.incidentId} not found`);
        }
        const device = incident.deviceId ? database_1.db.getDeviceById(incident.deviceId) : undefined;
        const deviceType = device ? database_1.db.deviceTypes.get(device.deviceTypeId) : undefined;
        // Safety Gate Check: Actuator devices (e.g. municipal water valves) require human approval
        const isCriticalActuator = deviceType?.isActuatorOrCritical ?? false;
        const isDestructive = ['QUARANTINE_DEVICE', 'REVOKE_CERTIFICATE', 'FORCE_OTA_UPDATE'].includes(params.actionType);
        const requiresHumanApproval = (isCriticalActuator && isDestructive) || Boolean(params.forceApproval);
        const actionId = `act-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
        const action = {
            id: actionId,
            incidentId: incident.id,
            actionType: params.actionType,
            description: `Execution of ${params.actionType} on device ${device?.serialNumber || incident.deviceId || 'fleet'}`,
            isAutomated: Boolean(params.isAutomated),
            requiresApproval: requiresHumanApproval,
            status: requiresHumanApproval ? 'PENDING_APPROVAL' : 'EXECUTED',
            executedBy: params.actorEmail,
            executedAt: requiresHumanApproval ? undefined : new Date().toISOString()
        };
        if (!requiresHumanApproval) {
            this.applyActionStateChanges(action, device, incident, params.actorEmail);
        }
        incident.actions.push(action);
        database_1.db.saveIncident(incident);
        auditLog_1.AuditLogService.logAction({
            orgId: incident.orgId,
            actorId: params.actorId,
            actorEmail: params.actorEmail,
            actorRole: params.actorRole,
            action: requiresHumanApproval ? `ACTION_PENDING_APPROVAL_${params.actionType}` : `ACTION_EXECUTED_${params.actionType}`,
            resourceType: 'PLAYBOOK',
            resourceId: incident.id,
            details: {
                actionId: action.id,
                actionType: params.actionType,
                requiresHumanApproval,
                targetDeviceId: device?.id
            }
        });
        return { action, requiresHumanApproval };
    }
    /**
     * Approves a gated action (Human-in-the-Loop)
     */
    static approveGatedAction(params) {
        const incident = database_1.db.getIncidentById(params.incidentId);
        if (!incident)
            return { success: false, error: 'Incident not found' };
        const action = incident.actions.find(a => a.id === params.actionId);
        if (!action)
            return { success: false, error: 'Action not found' };
        if (action.status !== 'PENDING_APPROVAL') {
            return { success: false, error: `Action is already in status ${action.status}` };
        }
        const device = incident.deviceId ? database_1.db.getDeviceById(incident.deviceId) : undefined;
        action.status = 'EXECUTED';
        action.approvedBy = params.approverEmail;
        action.executedAt = new Date().toISOString();
        this.applyActionStateChanges(action, device, incident, params.approverEmail);
        database_1.db.saveIncident(incident);
        auditLog_1.AuditLogService.logAction({
            orgId: incident.orgId,
            actorId: params.approverId,
            actorEmail: params.approverEmail,
            actorRole: params.approverRole,
            action: `HUMAN_APPROVAL_GRANTED_${action.actionType}`,
            resourceType: 'PLAYBOOK',
            resourceId: incident.id,
            details: {
                actionId: action.id,
                actionType: action.actionType,
                targetDeviceId: device?.id
            }
        });
        return { success: true, action };
    }
    static applyActionStateChanges(action, device, incident, actor) {
        if (!device)
            return;
        if (action.actionType === 'QUARANTINE_DEVICE') {
            database_1.db.updateDeviceState(device.id, 'QUARANTINED', `Incident ${incident.id}: Security Quarantine Action`);
            action.resultDetails = `Device ${device.serialNumber} transitioned to QUARANTINED. Broker ACLs closed.`;
        }
        else if (action.actionType === 'REVOKE_CERTIFICATE') {
            if (device.certificateId) {
                const cert = certManager_1.certManager.getCertificateById(device.certificateId);
                if (cert) {
                    certManager_1.certManager.revokeCertificate({
                        serialNumberOrFingerprint: cert.serialNumber,
                        reason: 'KEY_COMPROMISE',
                        revokedBy: actor
                    });
                }
            }
            database_1.db.updateDeviceState(device.id, 'REVOKED', 'Certificate revoked via Security Incident Playbook');
            action.resultDetails = `Device X.509 certificate revoked and added to CRL ledger.`;
        }
        else if (action.actionType === 'REINSTATE_DEVICE') {
            database_1.db.updateDeviceState(device.id, 'ACTIVE');
            action.resultDetails = `Device ${device.serialNumber} reinstated to ACTIVE state.`;
        }
        else if (action.actionType === 'ROTATE_CERTIFICATE') {
            const site = database_1.db.sites.get(device.siteId);
            const org = database_1.db.organizations.get(device.orgId);
            if (site && org) {
                const { newCert } = certManager_1.certManager.rotateDeviceCertificate({
                    deviceId: device.id,
                    serialNumber: device.serialNumber,
                    orgSlug: org.slug,
                    siteCode: site.code,
                    actor
                });
                device.certificateId = newCert.id;
                database_1.db.saveDevice(device);
                action.resultDetails = `Certificate rotated. New cert serial: ${newCert.serialNumber}.`;
            }
        }
        else if (action.actionType === 'DISPATCH_TECHNICIAN') {
            action.resultDetails = `Field work order dispatched for site ${device.siteId}.`;
        }
    }
}
exports.PlaybookEngine = PlaybookEngine;
