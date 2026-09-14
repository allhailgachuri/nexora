"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const auditLog_1 = require("../security/auditLog");
const router = (0, express_1.Router)();
router.get('/', (req, res) => {
    const limit = req.query.limit ? parseInt(String(req.query.limit), 10) : 100;
    const logs = auditLog_1.AuditLogService.getLogs(limit);
    res.json({ success: true, count: logs.length, logs });
});
router.get('/verify', (req, res) => {
    const verification = auditLog_1.AuditLogService.verifyIntegrity();
    res.json({ success: true, verification });
});
exports.default = router;
