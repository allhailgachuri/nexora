import { db } from '../db/database';
import { AuditLogEntry, UserRole } from '../types';

export class AuditLogService {
  public static logAction(params: {
    orgId: string;
    actorId: string;
    actorEmail: string;
    actorRole: UserRole;
    action: string;
    resourceType: AuditLogEntry['resourceType'];
    resourceId: string;
    details: Record<string, any>;
    ipAddress?: string;
  }): AuditLogEntry {
    const entry = db.appendAuditLog(params);
    return entry;
  }

  public static getLogs(limit: number = 100): AuditLogEntry[] {
    return db.auditLogs.slice(-limit).reverse();
  }

  public static verifyIntegrity(): { isValid: boolean; brokenAtLogId?: string; totalLogs: number } {
    const result = db.verifyAuditChainIntegrity();
    return {
      isValid: result.isValid,
      brokenAtLogId: result.brokenAtLogId,
      totalLogs: db.auditLogs.length
    };
  }
}
