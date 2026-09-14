"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuditLogService = void 0;
const database_1 = require("../db/database");
class AuditLogService {
    static logAction(params) {
        const entry = database_1.db.appendAuditLog(params);
        return entry;
    }
    static getLogs(limit = 100) {
        return database_1.db.auditLogs.slice(-limit).reverse();
    }
    static verifyIntegrity() {
        const result = database_1.db.verifyAuditChainIntegrity();
        return {
            isValid: result.isValid,
            brokenAtLogId: result.brokenAtLogId,
            totalLogs: database_1.db.auditLogs.length
        };
    }
}
exports.AuditLogService = AuditLogService;
