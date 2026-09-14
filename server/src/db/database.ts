import {
  Device,
  DeviceType,
  DeviceCertificate,
  DeviceShadow,
  TelemetryReading,
  AnomalyEvent,
  SecurityEvent,
  Incident,
  IncidentAction,
  FirmwareVersion,
  AuditLogEntry,
  Organization,
  Site,
  DeviceGroup,
  User,
  AnomalyModelInfo
} from '../types';
import { certManager } from '../pki/certManager';
import crypto from 'crypto';

class NexoraDatabase {
  private static instance: NexoraDatabase;

  // In-memory relational tables with indexing and query methods
  public organizations: Map<string, Organization> = new Map();
  public sites: Map<string, Site> = new Map();
  public deviceGroups: Map<string, DeviceGroup> = new Map();
  public deviceTypes: Map<string, DeviceType> = new Map();
  public devices: Map<string, Device> = new Map();
  public deviceShadows: Map<string, DeviceShadow> = new Map();
  public telemetrySeries: Map<string, TelemetryReading[]> = new Map(); // deviceId -> readings (time-series hypertable)
  public anomalyEvents: Map<string, AnomalyEvent> = new Map();
  public securityEvents: Map<string, SecurityEvent> = new Map();
  public incidents: Map<string, Incident> = new Map();
  public firmwareVersions: Map<string, FirmwareVersion> = new Map();
  public users: Map<string, User> = new Map();
  public auditLogs: AuditLogEntry[] = [];
  public anomalyModels: Map<string, AnomalyModelInfo> = new Map();

  private constructor() {}

  public static getInstance(): NexoraDatabase {
    if (!NexoraDatabase.instance) {
      NexoraDatabase.instance = new NexoraDatabase();
    }
    return NexoraDatabase.instance;
  }

  // ===================== DEVICE CRUD & INDEXES =====================
  public getDeviceById(id: string): Device | undefined {
    return this.devices.get(id);
  }

  public getDeviceBySerial(serial: string): Device | undefined {
    for (const dev of this.devices.values()) {
      if (dev.serialNumber === serial) return dev;
    }
    return undefined;
  }

  public getAllDevices(): Device[] {
    return Array.from(this.devices.values());
  }

  public saveDevice(device: Device): void {
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

  public updateDeviceState(deviceId: string, state: Device['lifecycleState'], reason?: string): void {
    const dev = this.devices.get(deviceId);
    if (dev) {
      dev.lifecycleState = state;
      if (state === 'QUARANTINED') {
        dev.isQuarantined = true;
        dev.quarantineReason = reason || 'Quarantined due to security anomaly';
      } else if (state === 'ACTIVE') {
        dev.isQuarantined = false;
        dev.quarantineReason = undefined;
      }
      this.saveDevice(dev);
    }
  }

  // ===================== TIME-SERIES TELEMETRY =====================
  public recordTelemetry(reading: TelemetryReading): void {
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
      const delta: Record<string, any> = {};
      for (const key of Object.keys(shadow.desiredState)) {
        if (shadow.desiredState[key] !== shadow.reportedState[key]) {
          delta[key] = shadow.desiredState[key];
        }
      }
      shadow.delta = delta;
    }
  }

  public getTelemetryHistory(deviceId: string, limit: number = 100): TelemetryReading[] {
    const series = this.telemetrySeries.get(deviceId) || [];
    return series.slice(-limit);
  }

  // ===================== DEVICE SHADOW =====================
  public getShadow(deviceId: string): DeviceShadow | undefined {
    return this.deviceShadows.get(deviceId);
  }

  public updateDesiredShadow(deviceId: string, desired: Record<string, any>): DeviceShadow {
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
    const delta: Record<string, any> = {};
    for (const key of Object.keys(shadow.desiredState)) {
      if (shadow.desiredState[key] !== shadow.reportedState[key]) {
        delta[key] = shadow.desiredState[key];
      }
    }
    shadow.delta = delta;
    return shadow;
  }

  // ===================== ANOMALY & SECURITY EVENTS =====================
  public recordAnomalyEvent(event: AnomalyEvent): void {
    this.anomalyEvents.set(event.id, event);
    // Mark device as SUSPECTED if severity is high/critical
    if (event.severity === 'HIGH' || event.severity === 'CRITICAL') {
      const dev = this.devices.get(event.deviceId);
      if (dev && dev.lifecycleState === 'ACTIVE') {
        dev.lifecycleState = 'SUSPECTED';
      }
    }
  }

  public recordSecurityEvent(event: SecurityEvent): void {
    this.securityEvents.set(event.id, event);
    if (event.deviceId) {
      const dev = this.devices.get(event.deviceId);
      if (dev && (event.severity === 'HIGH' || event.severity === 'CRITICAL')) {
        dev.lifecycleState = 'SUSPECTED';
      }
    }
  }

  // ===================== INCIDENT CASE MANAGEMENT =====================
  public saveIncident(incident: Incident): void {
    incident.updatedAt = new Date().toISOString();
    this.incidents.set(incident.id, incident);
  }

  public getIncidentById(id: string): Incident | undefined {
    return this.incidents.get(id);
  }

  public getAllIncidents(): Incident[] {
    return Array.from(this.incidents.values()).sort(
      (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
  }

  // ===================== AUDIT LOG (CRYPTOGRAPHIC CHAIN) =====================
  public appendAuditLog(entry: Omit<AuditLogEntry, 'id' | 'timestamp' | 'prevHash' | 'hash'>): AuditLogEntry {
    const prevLog = this.auditLogs.length > 0 ? this.auditLogs[this.auditLogs.length - 1] : null;
    const prevHash = prevLog ? prevLog.hash : '0000000000000000000000000000000000000000000000000000000000000000';
    const id = `audit-${Date.now()}-${crypto.randomBytes(4).toString('hex')}`;
    const timestamp = new Date().toISOString();

    const dataToHash = `${id}|${timestamp}|${entry.actorEmail}|${entry.action}|${entry.resourceType}|${entry.resourceId}|${JSON.stringify(entry.details)}|${prevHash}`;
    const hash = crypto.createHash('sha256').update(dataToHash).digest('hex');

    const fullEntry: AuditLogEntry = {
      id,
      timestamp,
      ...entry,
      prevHash,
      hash
    };

    this.auditLogs.push(fullEntry);
    return fullEntry;
  }

  public verifyAuditChainIntegrity(): { isValid: boolean; brokenAtLogId?: string } {
    let expectedPrevHash = '0000000000000000000000000000000000000000000000000000000000000000';
    for (const log of this.auditLogs) {
      if (log.prevHash !== expectedPrevHash) {
        return { isValid: false, brokenAtLogId: log.id };
      }
      const dataToHash = `${log.id}|${log.timestamp}|${log.actorEmail}|${log.action}|${log.resourceType}|${log.resourceId}|${JSON.stringify(log.details)}|${log.prevHash}`;
      const recomputed = crypto.createHash('sha256').update(dataToHash).digest('hex');
      if (recomputed !== log.hash) {
        return { isValid: false, brokenAtLogId: log.id };
      }
      expectedPrevHash = log.hash;
    }
    return { isValid: true };
  }
}

export const db = NexoraDatabase.getInstance();
