"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const ca_1 = require("../pki/ca");
const certManager_1 = require("../pki/certManager");
const auditLog_1 = require("../security/auditLog");
const database_1 = require("../db/database");
const router = (0, express_1.Router)();
// Get Root CA Info
router.get('/root-ca', (req, res) => {
    const rootCA = ca_1.pkiAuthority.getRootCAInfo();
    res.json({ success: true, rootCA });
});
// Get all certificates in ledger
router.get('/certificates', (req, res) => {
    const certs = certManager_1.certManager.getAllCertificates();
    res.json({ success: true, count: certs.length, certificates: certs });
});
// Get CRL list
router.get('/crl', (req, res) => {
    const crl = certManager_1.certManager.getCRL();
    res.json({ success: true, count: crl.length, crl });
});
// Rotate Device Certificate
router.post('/rotate', (req, res) => {
    const { deviceId, actorEmail } = req.body;
    const dev = database_1.db.getDeviceById(deviceId);
    if (!dev)
        return res.status(404).json({ success: false, error: 'Device not found' });
    const site = database_1.db.sites.get(dev.siteId);
    const org = database_1.db.organizations.get(dev.orgId);
    if (!site || !org)
        return res.status(400).json({ success: false, error: 'Invalid site/org' });
    const { newCert } = certManager_1.certManager.rotateDeviceCertificate({
        deviceId: dev.id,
        serialNumber: dev.serialNumber,
        orgSlug: org.slug,
        siteCode: site.code,
        actor: actorEmail || 'admin@nexora.io'
    });
    dev.certificateId = newCert.id;
    database_1.db.saveDevice(dev);
    auditLog_1.AuditLogService.logAction({
        orgId: dev.orgId,
        actorId: 'user',
        actorEmail: actorEmail || 'admin@nexora.io',
        actorRole: 'FLEET_ADMIN',
        action: 'ROTATE_DEVICE_CERTIFICATE',
        resourceType: 'CERTIFICATE',
        resourceId: newCert.id,
        details: { deviceId: dev.id, newSerial: newCert.serialNumber, fingerprint: newCert.fingerprintSha256 }
    });
    res.json({ success: true, certificate: newCert });
});
// Revoke Certificate
router.post('/revoke', (req, res) => {
    const { serialOrFingerprint, reason, actorEmail } = req.body;
    if (!serialOrFingerprint) {
        return res.status(400).json({ success: false, error: 'Missing serialOrFingerprint' });
    }
    const result = certManager_1.certManager.revokeCertificate({
        serialNumberOrFingerprint: serialOrFingerprint,
        reason: reason || 'KEY_COMPROMISE',
        revokedBy: actorEmail || 'admin@nexora.io'
    });
    if (!result.success) {
        return res.status(400).json(result);
    }
    if (result.certificate) {
        const dev = database_1.db.getDeviceById(result.certificate.deviceId);
        if (dev) {
            database_1.db.updateDeviceState(dev.id, 'REVOKED', `Certificate revoked: ${reason}`);
        }
        auditLog_1.AuditLogService.logAction({
            orgId: dev?.orgId || 'org-nexora-prod',
            actorId: 'user',
            actorEmail: actorEmail || 'admin@nexora.io',
            actorRole: 'SECURITY_ANALYST',
            action: 'REVOKE_CERTIFICATE',
            resourceType: 'CERTIFICATE',
            resourceId: result.certificate.id,
            details: {
                serialNumber: result.certificate.serialNumber,
                reason,
                deviceId: result.certificate.deviceId
            }
        });
    }
    res.json(result);
});
exports.default = router;
