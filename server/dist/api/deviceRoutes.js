"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const database_1 = require("../db/database");
const certManager_1 = require("../pki/certManager");
const auditLog_1 = require("../security/auditLog");
const router = (0, express_1.Router)();
// Get fleet summary stats
router.get('/stats', (req, res) => {
    const devices = database_1.db.getAllDevices();
    const total = devices.length;
    const active = devices.filter(d => d.lifecycleState === 'ACTIVE').length;
    const suspected = devices.filter(d => d.lifecycleState === 'SUSPECTED').length;
    const quarantined = devices.filter(d => d.lifecycleState === 'QUARANTINED').length;
    const revoked = devices.filter(d => d.lifecycleState === 'REVOKED').length;
    const openIncidents = Array.from(database_1.db.incidents.values()).filter(i => i.status !== 'RESOLVED' && i.status !== 'CLOSED').length;
    const securityEvents = database_1.db.securityEvents.size;
    const anomalyEvents = database_1.db.anomalyEvents.size;
    const expiringCerts = certManager_1.certManager.getExpiringCertificatesCount(30);
    // Overall Fleet Health Score (0-100)
    const penalty = (suspected * 5) + (quarantined * 10) + (openIncidents * 15);
    const healthScore = Math.max(10, Math.min(100, Math.round(100 - (penalty / (total || 1)) * 50)));
    // Threat Index (LOW / ELEVATED / HIGH / CRITICAL)
    let threatLevel = 'NOMINAL';
    if (openIncidents >= 5 || quarantined >= 5)
        threatLevel = 'CRITICAL';
    else if (openIncidents >= 2 || quarantined >= 2)
        threatLevel = 'HIGH';
    else if (suspected >= 3)
        threatLevel = 'ELEVATED';
    res.json({
        success: true,
        stats: {
            totalDevices: total,
            activeDevices: active,
            suspectedDevices: suspected,
            quarantinedDevices: quarantined,
            revokedDevices: revoked,
            openIncidents,
            securityEventsCount: securityEvents,
            anomalyEventsCount: anomalyEvents,
            expiringCertsCount: expiringCerts,
            fleetHealthScore: healthScore,
            threatLevel
        }
    });
});
// Get all devices with optional query filters
router.get('/', (req, res) => {
    const { siteId, groupId, state, typeId, search } = req.query;
    let devices = database_1.db.getAllDevices();
    if (siteId)
        devices = devices.filter(d => d.siteId === siteId);
    if (groupId)
        devices = devices.filter(d => d.groupId === groupId);
    if (state)
        devices = devices.filter(d => d.lifecycleState === state);
    if (typeId)
        devices = devices.filter(d => d.deviceTypeId === typeId);
    if (search) {
        const q = String(search).toLowerCase();
        devices = devices.filter(d => d.name.toLowerCase().includes(q) || d.serialNumber.toLowerCase().includes(q));
    }
    res.json({ success: true, count: devices.length, devices });
});
// Get single device deep-dive
router.get('/:id', (req, res) => {
    const device = database_1.db.getDeviceById(req.params.id);
    if (!device)
        return res.status(404).json({ success: false, error: 'Device not found' });
    const deviceType = database_1.db.deviceTypes.get(device.deviceTypeId);
    const site = database_1.db.sites.get(device.siteId);
    const group = database_1.db.deviceGroups.get(device.groupId);
    const cert = device.certificateId ? certManager_1.certManager.getCertificateById(device.certificateId) : undefined;
    const shadow = database_1.db.getShadow(device.id);
    const recentTelemetry = database_1.db.getTelemetryHistory(device.id, 50);
    const anomalies = Array.from(database_1.db.anomalyEvents.values()).filter(a => a.deviceId === device.id).slice(-10);
    const securityEvents = Array.from(database_1.db.securityEvents.values()).filter(s => s.deviceId === device.id).slice(-10);
    res.json({
        success: true,
        device,
        deviceType,
        site,
        group,
        certificate: cert,
        shadow,
        recentTelemetry,
        anomalies,
        securityEvents
    });
});
// Provision new device
router.post('/', (req, res) => {
    const { name, serialNumber, siteId, groupId, deviceTypeId, connectivityType, actorEmail } = req.body;
    if (!name || !serialNumber || !siteId || !deviceTypeId) {
        return res.status(400).json({ success: false, error: 'Missing required fields' });
    }
    const site = database_1.db.sites.get(siteId);
    const org = database_1.db.organizations.get('org-nexora-prod');
    const type = database_1.db.deviceTypes.get(deviceTypeId);
    if (!site || !org || !type) {
        return res.status(400).json({ success: false, error: 'Invalid site or device type' });
    }
    const deviceId = `dev-${Date.now()}`;
    const cert = certManager_1.certManager.issueCertificateForDevice({
        deviceId,
        serialNumber,
        orgSlug: org.slug,
        siteCode: site.code
    });
    const device = {
        id: deviceId,
        serialNumber,
        orgId: org.id,
        siteId,
        groupId: groupId || 'group-default',
        deviceTypeId,
        name,
        lifecycleState: 'PROVISIONED',
        connectivityType: connectivityType || 'MQTT_TLS',
        ipAddress: `10.${site.code.includes('AGRI') ? '14' : '22'}.100.${Math.floor(Math.random() * 200) + 1}`,
        firmwareVersion: type.currentFirmwareVersion,
        consecutiveAuthFailures: 0,
        certificateId: cert.id,
        isQuarantined: false,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
    };
    database_1.db.saveDevice(device);
    auditLog_1.AuditLogService.logAction({
        orgId: org.id,
        actorId: 'admin',
        actorEmail: actorEmail || 'admin@nexora.io',
        actorRole: 'FLEET_ADMIN',
        action: 'PROVISION_DEVICE',
        resourceType: 'DEVICE',
        resourceId: device.id,
        details: { serialNumber, certSerial: cert.serialNumber, deviceTypeId }
    });
    res.json({ success: true, device, certificate: cert });
});
// Update device state (Quarantine / Reinstate / Decommission)
router.put('/:id/state', (req, res) => {
    const { state, reason, actorEmail } = req.body;
    const device = database_1.db.getDeviceById(req.params.id);
    if (!device)
        return res.status(404).json({ success: false, error: 'Device not found' });
    const prevState = device.lifecycleState;
    database_1.db.updateDeviceState(device.id, state, reason);
    auditLog_1.AuditLogService.logAction({
        orgId: device.orgId,
        actorId: 'user',
        actorEmail: actorEmail || 'analyst@nexora.io',
        actorRole: 'SECURITY_ANALYST',
        action: `CHANGE_DEVICE_STATE_${state}`,
        resourceType: 'DEVICE',
        resourceId: device.id,
        details: { prevState, newState: state, reason }
    });
    res.json({ success: true, device: database_1.db.getDeviceById(device.id) });
});
// Update Device Shadow Desired Config
router.put('/:id/shadow', (req, res) => {
    const { desiredState, actorEmail } = req.body;
    const device = database_1.db.getDeviceById(req.params.id);
    if (!device)
        return res.status(404).json({ success: false, error: 'Device not found' });
    const shadow = database_1.db.updateDesiredShadow(device.id, desiredState || {});
    auditLog_1.AuditLogService.logAction({
        orgId: device.orgId,
        actorId: 'user',
        actorEmail: actorEmail || 'admin@nexora.io',
        actorRole: 'FLEET_ADMIN',
        action: 'UPDATE_DEVICE_SHADOW',
        resourceType: 'DEVICE',
        resourceId: device.id,
        details: { desiredState, shadowVersion: shadow.version }
    });
    res.json({ success: true, shadow });
});
// Get Device Types
router.get('/meta/types', (req, res) => {
    const types = Array.from(database_1.db.deviceTypes.values());
    res.json({ success: true, types });
});
// Register or Update Device Type & Schema
router.post('/meta/types', (req, res) => {
    const { name, code, category, description, isActuatorOrCritical, telemetrySchema, currentFirmwareVersion } = req.body;
    if (!name || !code || !telemetrySchema) {
        return res.status(400).json({ success: false, error: 'Missing name, code, or schema' });
    }
    const id = `dtype-${code.toLowerCase().replace(/[^a-z0-9]/g, '-')}`;
    const deviceType = {
        id,
        name,
        code,
        category: category || 'CUSTOM',
        description: description || '',
        isActuatorOrCritical: Boolean(isActuatorOrCritical),
        currentFirmwareVersion: currentFirmwareVersion || 'v1.0.0',
        telemetrySchema: {
            ...telemetrySchema,
            id: `schema-${id}`,
            deviceTypeId: id
        }
    };
    database_1.db.deviceTypes.set(deviceType.id, deviceType);
    res.json({ success: true, deviceType });
});
// Get Sites
router.get('/meta/sites', (req, res) => {
    const sites = Array.from(database_1.db.sites.values()).map(site => {
        const devices = database_1.db.getAllDevices().filter(d => d.siteId === site.id);
        const active = devices.filter(d => d.lifecycleState === 'ACTIVE').length;
        const suspected = devices.filter(d => d.lifecycleState === 'SUSPECTED').length;
        const quarantined = devices.filter(d => d.lifecycleState === 'QUARANTINED').length;
        return {
            ...site,
            deviceCount: devices.length,
            activeCount: active,
            suspectedCount: suspected,
            quarantinedCount: quarantined
        };
    });
    res.json({ success: true, sites });
});
exports.default = router;
