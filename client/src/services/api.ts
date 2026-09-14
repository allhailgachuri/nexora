import {
  FleetStats,
  Device,
  Site,
  DeviceType,
  Incident,
  SecurityEvent,
  AnomalyEvent,
  AuditLogEntry,
  FirmwareVersion,
  DeviceShadow,
  TelemetryReading,
  User,
  ActionType
} from '../types';

const BACKEND_URL = (import.meta as any).env?.VITE_API_URL || '';
const API_BASE = BACKEND_URL ? `${BACKEND_URL.replace(/\/$/, '')}/api` : '/api';

export class ApiService {
  public static async getFleetStats(): Promise<FleetStats> {
    const res = await fetch(`${API_BASE}/devices/stats`);
    const data = await res.json();
    return data.stats;
  }

  public static async getDevices(filters?: { siteId?: string; state?: string; typeId?: string; search?: string }): Promise<Device[]> {
    const params = new URLSearchParams();
    if (filters?.siteId) params.append('siteId', filters.siteId);
    if (filters?.state) params.append('state', filters.state);
    if (filters?.typeId) params.append('typeId', filters.typeId);
    if (filters?.search) params.append('search', filters.search);

    const res = await fetch(`${API_BASE}/devices?${params.toString()}`);
    const data = await res.json();
    return data.devices;
  }

  public static async getDeviceDetail(id: string): Promise<{
    device: Device;
    deviceType: DeviceType;
    site: Site;
    certificate?: any;
    shadow?: DeviceShadow;
    recentTelemetry: TelemetryReading[];
    anomalies: AnomalyEvent[];
    securityEvents: SecurityEvent[];
  }> {
    const res = await fetch(`${API_BASE}/devices/${id}`);
    const data = await res.json();
    return data;
  }

  public static async provisionDevice(payload: {
    name: string;
    serialNumber: string;
    siteId: string;
    deviceTypeId: string;
    connectivityType?: string;
    actorEmail?: string;
  }): Promise<Device> {
    const res = await fetch(`${API_BASE}/devices`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    const data = await res.json();
    if (!data.success) throw new Error(data.error || 'Failed to provision device');
    return data.device;
  }

  public static async updateDeviceState(deviceId: string, state: string, reason?: string, actorEmail?: string): Promise<Device> {
    const res = await fetch(`${API_BASE}/devices/${deviceId}/state`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ state, reason, actorEmail })
    });
    const data = await res.json();
    return data.device;
  }

  public static async updateDeviceShadow(deviceId: string, desiredState: Record<string, any>, actorEmail?: string): Promise<DeviceShadow> {
    const res = await fetch(`${API_BASE}/devices/${deviceId}/shadow`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ desiredState, actorEmail })
    });
    const data = await res.json();
    return data.shadow;
  }

  public static async getSites(): Promise<Site[]> {
    const res = await fetch(`${API_BASE}/devices/meta/sites`);
    const data = await res.json();
    return data.sites;
  }

  public static async getDeviceTypes(): Promise<DeviceType[]> {
    const res = await fetch(`${API_BASE}/devices/meta/types`);
    const data = await res.json();
    return data.types;
  }

  public static async saveDeviceType(payload: any): Promise<DeviceType> {
    const res = await fetch(`${API_BASE}/devices/meta/types`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    const data = await res.json();
    if (!data.success) throw new Error(data.error);
    return data.deviceType;
  }

  public static async getIncidents(filters?: { status?: string; severity?: string; siteId?: string }): Promise<Incident[]> {
    const params = new URLSearchParams();
    if (filters?.status) params.append('status', filters.status);
    if (filters?.severity) params.append('severity', filters.severity);
    if (filters?.siteId) params.append('siteId', filters.siteId);

    const res = await fetch(`${API_BASE}/incidents?${params.toString()}`);
    const data = await res.json();
    return data.incidents;
  }

  public static async getIncidentDetail(id: string): Promise<{
    incident: Incident;
    device?: Device;
    securityEvents: SecurityEvent[];
    anomalyEvents: AnomalyEvent[];
  }> {
    const res = await fetch(`${API_BASE}/incidents/${id}`);
    const data = await res.json();
    return data;
  }

  public static async createIncident(payload: any): Promise<Incident> {
    const res = await fetch(`${API_BASE}/incidents`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    const data = await res.json();
    return data.incident;
  }

  public static async executeIncidentAction(incidentId: string, actionType: ActionType, actor: any, forceApproval?: boolean): Promise<any> {
    const res = await fetch(`${API_BASE}/incidents/${incidentId}/actions`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        actionType,
        actorId: actor?.id,
        actorEmail: actor?.email,
        actorRole: actor?.role,
        forceApproval
      })
    });
    return res.json();
  }

  public static async approveGatedAction(incidentId: string, actionId: string, approver: any): Promise<any> {
    const res = await fetch(`${API_BASE}/incidents/${incidentId}/actions/${actionId}/approve`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        approverId: approver?.id,
        approverEmail: approver?.email,
        approverRole: approver?.role
      })
    });
    return res.json();
  }

  public static async addIncidentComment(incidentId: string, comment: string, user: User): Promise<any> {
    const res = await fetch(`${API_BASE}/incidents/${incidentId}/comments`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        comment,
        userId: user.id,
        userName: user.name
      })
    });
    return res.json();
  }

  public static async updateIncidentStatus(incidentId: string, status: string, rootCause?: string, actorEmail?: string): Promise<Incident> {
    const res = await fetch(`${API_BASE}/incidents/${incidentId}/status`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status, rootCauseAnalysis: rootCause, actorEmail })
    });
    const data = await res.json();
    return data.incident;
  }

  public static async getSecurityEvents(): Promise<SecurityEvent[]> {
    const res = await fetch(`${API_BASE}/incidents/events/security`);
    const data = await res.json();
    return data.events;
  }

  public static async getAnomalyEvents(): Promise<AnomalyEvent[]> {
    const res = await fetch(`${API_BASE}/incidents/events/anomalies`);
    const data = await res.json();
    return data.events;
  }

  public static async submitAnomalyDisposition(id: string, disposition: 'CONFIRMED_THREAT' | 'FALSE_POSITIVE'): Promise<any> {
    const res = await fetch(`${API_BASE}/incidents/anomalies/${id}/disposition`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ disposition })
    });
    return res.json();
  }

  public static async getRootCA(): Promise<any> {
    const res = await fetch(`${API_BASE}/pki/root-ca`);
    const data = await res.json();
    return data.rootCA;
  }

  public static async getCertificates(): Promise<any[]> {
    const res = await fetch(`${API_BASE}/pki/certificates`);
    const data = await res.json();
    return data.certificates;
  }

  public static async getCRL(): Promise<any[]> {
    const res = await fetch(`${API_BASE}/pki/crl`);
    const data = await res.json();
    return data.crl;
  }

  public static async rotateCertificate(deviceId: string, actorEmail?: string): Promise<any> {
    const res = await fetch(`${API_BASE}/pki/rotate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ deviceId, actorEmail })
    });
    return res.json();
  }

  public static async revokeCertificate(serialOrFingerprint: string, reason: string, actorEmail?: string): Promise<any> {
    const res = await fetch(`${API_BASE}/pki/revoke`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ serialOrFingerprint, reason, actorEmail })
    });
    return res.json();
  }

  public static async getFirmwareCatalog(): Promise<FirmwareVersion[]> {
    const res = await fetch(`${API_BASE}/firmware`);
    const data = await res.json();
    return data.firmwares;
  }

  public static async getFirmwareCompliance(): Promise<any> {
    const res = await fetch(`${API_BASE}/firmware/compliance`);
    const data = await res.json();
    return data.compliance;
  }

  public static async triggerOta(deviceId: string, targetVersion: string, actorEmail?: string): Promise<any> {
    const res = await fetch(`${API_BASE}/firmware/ota`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ deviceId, targetVersion, actorEmail })
    });
    return res.json();
  }

  public static async getAuditLogs(limit: number = 100): Promise<AuditLogEntry[]> {
    const res = await fetch(`${API_BASE}/audit?limit=${limit}`);
    const data = await res.json();
    return data.logs;
  }

  public static async verifyAuditChain(): Promise<{ isValid: boolean; brokenAtLogId?: string; totalLogs: number }> {
    const res = await fetch(`${API_BASE}/audit/verify`);
    const data = await res.json();
    return data.verification;
  }

  public static async getSimulatorStatus(): Promise<any> {
    const res = await fetch(`${API_BASE}/simulator/status`);
    const data = await res.json();
    return data.status;
  }

  public static async toggleSimulator(start: boolean): Promise<any> {
    const res = await fetch(`${API_BASE}/simulator/${start ? 'start' : 'stop'}`, { method: 'POST' });
    return res.json();
  }

  public static async injectSimulatorAnomaly(endpoint: string, payload: any): Promise<any> {
    const res = await fetch(`${API_BASE}/simulator/${endpoint}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    return res.json();
  }

  public static async getUsers(): Promise<User[]> {
    const res = await fetch(`${API_BASE}/auth/users`);
    const data = await res.json();
    return data.users;
  }
}

// Real-Time WebSocket Event Bus Client
type WsCallback = (type: string, data: any) => void;

class WebSocketClient {
  private ws: WebSocket | null = null;
  private listeners: Set<WsCallback> = new Set();
  private reconnectTimer: any = null;

  public connect(): void {
    const wsEnvUrl = (import.meta as any).env?.VITE_WS_URL;
    let url = wsEnvUrl;
    if (!url) {
      const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
      const host = window.location.host;
      url = `${protocol}//${host}/ws`;
    }

    try {
      this.ws = new WebSocket(url);

      this.ws.onmessage = (event) => {
        try {
          const parsed = JSON.parse(event.data);
          this.notify(parsed.type || 'UNKNOWN', parsed.data || parsed);
        } catch {
          // ignore
        }
      };

      this.ws.onclose = () => {
        this.reconnect();
      };

      this.ws.onerror = () => {
        if (this.ws) this.ws.close();
      };
    } catch {
      this.reconnect();
    }
  }

  private reconnect(): void {
    if (this.reconnectTimer) return;
    this.reconnectTimer = setTimeout(() => {
      this.reconnectTimer = null;
      this.connect();
    }, 3000);
  }

  public subscribe(cb: WsCallback): () => void {
    this.listeners.add(cb);
    return () => this.listeners.delete(cb);
  }

  private notify(type: string, data: any): void {
    for (const cb of this.listeners) {
      cb(type, data);
    }
  }
}

export const wsClient = new WebSocketClient();
