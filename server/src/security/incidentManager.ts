import { db } from '../db/database';
import {
  Incident,
  IncidentComment,
  IncidentStatus,
  SeverityLevel
} from '../types';
import { AuditLogService } from './auditLog';

export class IncidentManager {
  public static createIncident(params: {
    orgId: string;
    siteId?: string;
    deviceId?: string;
    title: string;
    description: string;
    severity: SeverityLevel;
    securityEventIds?: string[];
    anomalyEventIds?: string[];
    actorEmail?: string;
  }): Incident {
    const id = `inc-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
    const incident: Incident = {
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

    db.saveIncident(incident);

    AuditLogService.logAction({
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

  public static updateStatus(
    incidentId: string,
    status: IncidentStatus,
    actorEmail: string,
    rootCauseAnalysis?: string
  ): Incident {
    const incident = db.getIncidentById(incidentId);
    if (!incident) throw new Error('Incident not found');

    const prevStatus = incident.status;
    incident.status = status;
    if (rootCauseAnalysis) {
      incident.rootCauseAnalysis = rootCauseAnalysis;
    }
    if (status === 'RESOLVED' || status === 'CLOSED') {
      incident.resolvedAt = new Date().toISOString();
    }

    db.saveIncident(incident);

    AuditLogService.logAction({
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

  public static assignAnalyst(incidentId: string, analystId: string, actorEmail: string): Incident {
    const incident = db.getIncidentById(incidentId);
    if (!incident) throw new Error('Incident not found');

    incident.assignedTo = analystId;
    incident.status = incident.status === 'OPEN' ? 'TRIAGED' : incident.status;
    db.saveIncident(incident);

    AuditLogService.logAction({
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

  public static addComment(incidentId: string, userId: string, userName: string, comment: string): IncidentComment {
    const incident = db.getIncidentById(incidentId);
    if (!incident) throw new Error('Incident not found');

    const commentObj: IncidentComment = {
      id: `comm-${Date.now()}`,
      incidentId,
      userId,
      userName,
      comment,
      createdAt: new Date().toISOString()
    };

    incident.comments.push(commentObj);
    db.saveIncident(incident);
    return commentObj;
  }
}
