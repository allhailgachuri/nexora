"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const firmwareManager_1 = require("../security/firmwareManager");
const router = (0, express_1.Router)();
router.get('/', (req, res) => {
    const firmwares = firmwareManager_1.FirmwareManager.getAllFirmware();
    res.json({ success: true, firmwares });
});
router.get('/compliance', (req, res) => {
    const summary = firmwareManager_1.FirmwareManager.getFleetComplianceSummary();
    res.json({ success: true, compliance: summary });
});
router.post('/ota', (req, res) => {
    const { deviceId, targetVersion, actorEmail } = req.body;
    if (!deviceId || !targetVersion) {
        return res.status(400).json({ success: false, error: 'Missing deviceId or targetVersion' });
    }
    const result = firmwareManager_1.FirmwareManager.triggerOtaUpdate({
        deviceId,
        targetVersion,
        actorEmail: actorEmail || 'admin@nexora.io'
    });
    if (!result.success) {
        return res.status(400).json(result);
    }
    res.json(result);
});
exports.default = router;
