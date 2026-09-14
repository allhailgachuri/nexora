"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.db = void 0;
const crypto_1 = __importDefault(require("crypto"));
class NexoraDatabase {
    static instance;
    // In-memory relational tables with indexing and query methods
    organizations = new Map();
    sites = new Map();
    deviceGroups = new Map();
    deviceTypes = new Map();
    devices = new Map();
    deviceShadows = new Map();
    telemetrySeries = new Map(); // deviceId -> readings (time-series hypertable)
    anomalyEvents = new Map();
    securityEvents = new Map();
    incidents = new Map();
    firmwareVersions = new Map();
    users = new Map();
    auditLogs = [];
    anomalyModels = new Map();
    constructor() { }
    static getInstance() {
        if (!NexoraDatabase.instance) {
            NexoraDatabase.instance = new NexoraDatabase();
        }
        return NexoraDatabase.instance;
    }
    // ===================== DEVICE CRUD & INDEXES =====================
    getDeviceById(id) {
        return this.devices.get(id);
    }
    getDeviceBySerial(serial) {
        for (const dev of this.devices.values()) {
            if (dev.serialNumber === serial)
                return dev;
        }
        return undefined;
    }
    getAllDevices() {
        return Array.from(this.devices.values());
    }
    saveDevice(device) {
        device.updatedAt = new Date().toISOString();
        this.devices.set(device.id, device);
        // Initialize shadow if not present
        if (!this.deviceShadows.has(device.id)) {
            this.deviceShadows.set(device.id, {
                deviceId: device.id,
                version: 1,
                desiredState: { sampleRateSec: 60, reportMode: 'standard', ledIndicator: true },
                reportedState: {},
                delta: { sampleRateSec: 60, reportMode: 'standard', ledIndicator: true },
                lastReportedAt: new Date().toISOString(),
                lastDesiredAt: new Date().toISOString()
            });
        }
    }
    updateDeviceState(deviceId, state, reason) {
        const dev = this.devices.get(deviceId);
        if (dev) {
            dev.lifecycleState = state;
            if (state === 'QUARANTINED') {
                dev.isQuarantined = true;
                dev.quarantineReason = reason || 'Quarantined due to security anomaly';
            }
            else if (state === 'ACTIVE') {
                dev.isQuarantined = false;
                dev.quarantineReason = undefined;
            }
            this.saveDevice(dev);
        }
    }
    // ===================== TIME-SERIES TELEMETRY =====================
    recordTelemetry(reading) {
        let series = this.telemetrySeries.get(reading.deviceId);
        if (!series) {
            series = [];
            this.telemetrySeries.set(reading.deviceId, series);
        }
        series.push(reading);
        // Cap series history per device for memory efficiency while preserving analytical depth
        if (series.length > 500) {
            series.shift();
        }
        // Update lastSeen and heartbeat
        const dev = this.devices.get(reading.deviceId);
        if (dev) {
            dev.lastSeenAt = reading.timestamp;
            dev.lastHeartbeatAt = reading.timestamp;
            if (dev.lifecycleState === 'PROVISIONED' || dev.lifecycleState === 'REGISTERED') {
                dev.lifecycleState = 'ACTIVE';
            }
        }
        // Update shadow reported state
        const shadow = this.deviceShadows.get(reading.deviceId);
        if (shadow) {
            shadow.reportedState = { ...shadow.reportedState, ...reading.values };
            shadow.version += 1;
            shadow.lastReportedAt = reading.timestamp;
            // Recompute delta
            const delta = {};
            for (const key of Object.keys(shadow.desiredState)) {
                if (shadow.desiredState[key] !== shadow.reportedState[key]) {
                    delta[key] = shadow.desiredState[key];
                }
            }
            shadow.delta = delta;
        }
    }
    getTelemetryHistory(deviceId, limit = 100) {
        const series = this.telemetrySeries.get(deviceId) || [];
        return series.slice(-limit);
    }
    // ===================== DEVICE SHADOW =====================
    getShadow(deviceId) {
        return this.deviceShadows.get(deviceId);
    }
    updateDesiredShadow(deviceId, desired) {
        let shadow = this.deviceShadows.get(deviceId);
        if (!shadow) {
            shadow = {
                deviceId,
                version: 1,
                desiredState: desired,
                reportedState: {},
                delta: desired,
                lastReportedAt: new Date().toISOString(),
                lastDesiredAt: new Date().toISOString()
            };
            this.deviceShadows.set(deviceId, shadow);
            return shadow;
        }
        shadow.desiredState = { ...shadow.desiredState, ...desired };
        shadow.version += 1;
        shadow.lastDesiredAt = new Date().toISOString();
        // Recompute delta
        const delta = {};
        for (const key of Object.keys(shadow.desiredState)) {
            if (shadow.desiredState[key] !== shadow.reportedState[key]) {
                delta[key] = shadow.desiredState[key];
            }
        }
        shadow.delta = delta;
        return shadow;
    }
    // ===================== ANOMALY & SECURITY EVENTS =====================
    recordAnomalyEvent(event) {
        this.anomalyEvents.set(event.id, event);
        // Mark device as SUSPECTED if severity is high/critical
        if (event.severity === 'HIGH' || event.severity === 'CRITICAL') {
            const dev = this.devices.get(event.deviceId);
            if (dev && dev.lifecycleState === 'ACTIVE') {
                dev.lifecycleState = 'SUSPECTED';
            }
        }
    }
    recordSecurityEvent(event) {
        this.securityEvents.set(event.id, event);
        if (event.deviceId) {
            const dev = this.devices.get(event.deviceId);
            if (dev && (event.severity === 'HIGH' || event.severity === 'CRITICAL')) {
                dev.lifecycleState = 'SUSPECTED';
            }
        }
    }
    // ===================== INCIDENT CASE MANAGEMENT =====================
    saveIncident(incident) {
        incident.updatedAt = new Date().toISOString();
        this.incidents.set(incident.id, incident);
    }
    getIncidentById(id) {
        return this.incidents.get(id);
    }
    getAllIncidents() {
        return Array.from(this.incidents.values()).sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    }
    // ===================== AUDIT LOG (CRYPTOGRAPHIC CHAIN) =====================
    appendAuditLog(entry) {
        const prevLog = this.auditLogs.length > 0 ? this.auditLogs[this.auditLogs.length - 1] : null;
        const prevHash = prevLog ? prevLog.hash : '0000000000000000000000000000000000000000000000000000000000000000';
        const id = `audit-${Date.now()}-${crypto_1.default.randomBytes(4).toString('hex')}`;
        const timestamp = new Date().toISOString();
        const dataToHash = `${id}|${timestamp}|${entry.actorEmail}|${entry.action}|${entry.resourceType}|${entry.resourceId}|${JSON.stringify(entry.details)}|${prevHash}`;
        const hash = crypto_1.default.createHash('sha256').update(dataToHash).digest('hex');
        const fullEntry = {
            id,
            timestamp,
            ...entry,
            prevHash,
            hash
        };
        this.auditLogs.push(fullEntry);
        return fullEntry;
    }
    verifyAuditChainIntegrity() {
        let expectedPrevHash = '0000000000000000000000000000000000000000000000000000000000000000';
        for (const log of this.auditLogs) {
            if (log.prevHash !== expectedPrevHash) {
                return { isValid: false, brokenAtLogId: log.id };
            }
            const dataToHash = `${log.id}|${log.timestamp}|${log.actorEmail}|${log.action}|${log.resourceType}|${log.resourceId}|${JSON.stringify(log.details)}|${log.prevHash}`;
            const recomputed = crypto_1.default.createHash('sha256').update(dataToHash).digest('hex');
            if (recomputed !== log.hash) {
                return { isValid: false, brokenAtLogId: log.id };
            }
            expectedPrevHash = log.hash;
        }
        return { isValid: true };
    }
}
exports.db = NexoraDatabase.getInstance();
