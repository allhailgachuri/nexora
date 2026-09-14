import { db } from '../db/database';
import {
  Incident,
  IncidentAction,
  ActionType,
  IncidentStatus,
  SeverityLevel
} from '../types';
import { certManager } from '../pki/certManager';
import { AuditLogService } from './auditLog';

export class PlaybookEngine {
  /**
   * Executes or queues a response action on a device/incident with human safety gating
   */
  public static executeAction(params: {
    incidentId: string;
    actionType: ActionType;
    actorId: string;
    actorEmail: string;
    actorRole: string;
    isAutomated?: boolean;
    forceApproval?: boolean;
  }): { action: IncidentAction; requiresHumanApproval: boolean } {
    const incident = db.getIncidentById(params.incidentId);
    if (!incident) {
      throw new Error(`Incident ${params.incidentId} not found`);
    }

    const device = incident.deviceId ? db.getDeviceById(incident.deviceId) : undefined;
    const deviceType = device ? db.deviceTypes.get(device.deviceTypeId) : undefined;

    // Safety Gate Check: Actuator devices (e.g. municipal water valves) require human approval
    const isCriticalActuator = deviceType?.isActuatorOrCritical ?? false;
    const isDestructive = ['QUARANTINE_DEVICE', 'REVOKE_CERTIFICATE', 'FORCE_OTA_UPDATE'].includes(params.actionType);
    const requiresHumanApproval = (isCriticalActuator && isDestructive) || Boolean(params.forceApproval);

    const actionId = `act-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
    const action: IncidentAction = {
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
    db.saveIncident(incident);

    AuditLogService.logAction({
      orgId: incident.orgId,
      actorId: params.actorId,
      actorEmail: params.actorEmail,
      actorRole: params.actorRole as any,
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
  public static approveGatedAction(params: {
    incidentId: string;
    actionId: string;
    approverId: string;
    approverEmail: string;
    approverRole: string;
  }): { success: boolean; action?: IncidentAction; error?: string } {
    const incident = db.getIncidentById(params.incidentId);
    if (!incident) return { success: false, error: 'Incident not found' };

    const action = incident.actions.find(a => a.id === params.actionId);
    if (!action) return { success: false, error: 'Action not found' };

    if (action.status !== 'PENDING_APPROVAL') {
      return { success: false, error: `Action is already in status ${action.status}` };
    }

    const device = incident.deviceId ? db.getDeviceById(incident.deviceId) : undefined;
    action.status = 'EXECUTED';
    action.approvedBy = params.approverEmail;
    action.executedAt = new Date().toISOString();

    this.applyActionStateChanges(action, device, incident, params.approverEmail);
    db.saveIncident(incident);

    AuditLogService.logAction({
      orgId: incident.orgId,
      actorId: params.approverId,
      actorEmail: params.approverEmail,
      actorRole: params.approverRole as any,
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

  private static applyActionStateChanges(
    action: IncidentAction,
    device: any,
    incident: Incident,
    actor: string
  ): void {
    if (!device) return;

    if (action.actionType === 'QUARANTINE_DEVICE') {
      db.updateDeviceState(device.id, 'QUARANTINED', `Incident ${incident.id}: Security Quarantine Action`);
      action.resultDetails = `Device ${device.serialNumber} transitioned to QUARANTINED. Broker ACLs closed.`;
    } else if (action.actionType === 'REVOKE_CERTIFICATE') {
      if (device.certificateId) {
        const cert = certManager.getCertificateById(device.certificateId);
        if (cert) {
          certManager.revokeCertificate({
            serialNumberOrFingerprint: cert.serialNumber,
            reason: 'KEY_COMPROMISE',
            revokedBy: actor
          });
        }
      }
      db.updateDeviceState(device.id, 'REVOKED', 'Certificate revoked via Security Incident Playbook');
      action.resultDetails = `Device X.509 certificate revoked and added to CRL ledger.`;
    } else if (action.actionType === 'REINSTATE_DEVICE') {
      db.updateDeviceState(device.id, 'ACTIVE');
      action.resultDetails = `Device ${device.serialNumber} reinstated to ACTIVE state.`;
    } else if (action.actionType === 'ROTATE_CERTIFICATE') {
      const site = db.sites.get(device.siteId);
      const org = db.organizations.get(device.orgId);
      if (site && org) {
        const { newCert } = certManager.rotateDeviceCertificate({
          deviceId: device.id,
          serialNumber: device.serialNumber,
          orgSlug: org.slug,
          siteCode: site.code,
          actor
        });
        device.certificateId = newCert.id;
        db.saveDevice(device);
        action.resultDetails = `Certificate rotated. New cert serial: ${newCert.serialNumber}.`;
      }
    } else if (action.actionType === 'DISPATCH_TECHNICIAN') {
      action.resultDetails = `Field work order dispatched for site ${device.siteId}.`;
    }
  }
}
