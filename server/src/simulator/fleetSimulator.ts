import { db } from '../db/database';
import { certManager } from '../pki/certManager';
import { TelemetryIngestor } from '../ingestion/telemetryIngestor';
import { SecurityEngine } from '../security/securityEngine';
import { mqttBroker } from '../broker/mqttBroker';
import { CONFIG } from '../config';

export class FleetSimulator {
  private static instance: FleetSimulator;
  private isRunning: boolean = false;
  private timer: NodeJS.Timeout | null = null;
  private tickCount: number = 0;

  // Track injected anomalies per device
  private activeDrifts: Map<string, { field: string; rate: number; currentOffset: number }> = new Map();
  private frozenDevices: Map<string, Record<string, any>> = new Map();

  private constructor() {}

  public static getInstance(): FleetSimulator {
    if (!FleetSimulator.instance) {
      FleetSimulator.instance = new FleetSimulator();
    }
    return FleetSimulator.instance;
  }

  public start(): void {
    if (this.isRunning) return;
    this.isRunning = true;
    console.log('[SIMULATOR] Starting background fleet telemetry generator...');

    this.timer = setInterval(() => {
      this.tick();
    }, CONFIG.SIMULATOR_TICK_MS);
  }

  public stop(): void {
    if (this.timer) {
      clearInterval(this.timer);
      this.timer = null;
    }
    this.isRunning = false;
  }

  public getStatus(): { isRunning: boolean; tickCount: number; activeDrifts: number; frozenDevices: number } {
    return {
      isRunning: this.isRunning,
      tickCount: this.tickCount,
      activeDrifts: this.activeDrifts.size,
      frozenDevices: this.frozenDevices.size
    };
  }

  private tick(): void {
    this.tickCount++;
    const allDevices = db.getAllDevices().filter(d => d.lifecycleState === 'ACTIVE' || d.lifecycleState === 'SUSPECTED');
    if (allDevices.length === 0) return;

    // Pick a staggered batch of ~15-25 devices per tick to simulate distributed reporting
    const batchSize = Math.min(25, allDevices.length);
    const startIndex = (this.tickCount * 15) % allDevices.length;
    const batch = allDevices.slice(startIndex, startIndex + batchSize);

    for (const dev of batch) {
      const type = db.deviceTypes.get(dev.deviceTypeId);
      if (!type) continue;

      const payload = this.generateDeviceTelemetry(dev, type);

      const outcome = TelemetryIngestor.processTelemetryMessage({
        deviceId: dev.id,
        payload,
        timestamp: new Date().toISOString()
      });

      if (outcome.reading) {
        mqttBroker.broadcastToDashboards('TELEMETRY_STREAM', {
          deviceId: dev.id,
          reading: outcome.reading,
          anomalyEventId: outcome.anomalyEventId
        });
      }
    }
  }

  private generateDeviceTelemetry(device: any, type: any): Record<string, any> {
    // Check if frozen
    if (this.frozenDevices.has(device.id)) {
      return { ...this.frozenDevices.get(device.id) };
    }

    const t = this.tickCount;
    const values: Record<string, any> = {};

    if (type.category === 'AGRICULTURE') {
      const baseM = 38 + Math.sin((t + parseInt(device.id.replace(/\D/g, ''))) * 0.1) * 7;
      values['soil_moisture_pct'] = parseFloat((baseM + (Math.random() * 1.5 - 0.75)).toFixed(1));
      values['soil_temp_celsius'] = parseFloat((21 + Math.sin(t * 0.05) * 3 + (Math.random() * 0.6 - 0.3)).toFixed(1));
      values['soil_conductivity_us_cm'] = Math.round(680 + Math.random() * 30);
      values['battery_pct'] = parseFloat((94 - (t % 100) * 0.01).toFixed(1));
    } else if (type.category === 'WATER') {
      const baseF = 260 + Math.sin((t + parseInt(device.id.replace(/\D/g, ''))) * 0.15) * 35;
      values['flow_rate_liters_min'] = parseFloat((baseF + (Math.random() * 8 - 4)).toFixed(1));
      values['line_pressure_psi'] = parseFloat((68 + (Math.random() * 3 - 1.5)).toFixed(1));
      values['valve_aperture_pct'] = 75;
      values['water_temp_c'] = parseFloat((17.2 + Math.random() * 0.8).toFixed(1));
    } else {
      const baseP = 42 + Math.sin((t + parseInt(device.id.replace(/\D/g, ''))) * 0.2) * 12;
      values['active_power_kw'] = parseFloat((baseP + (Math.random() * 2 - 1)).toFixed(2));
      values['grid_voltage_v'] = parseFloat((231 + Math.random() * 1.8 - 0.9).toFixed(1));
      values['current_amp'] = parseFloat((values['active_power_kw'] * 4.32).toFixed(1));
      values['power_factor'] = parseFloat((0.97 + Math.random() * 0.01 - 0.005).toFixed(3));
      values['frequency_hz'] = parseFloat((60.0 + (Math.random() * 0.04 - 0.02)).toFixed(2));
    }

    // Apply active drift if present
    const drift = this.activeDrifts.get(device.id);
    if (drift && values[drift.field] !== undefined) {
      drift.currentOffset += drift.rate;
      values[drift.field] = parseFloat((values[drift.field] + drift.currentOffset).toFixed(2));
    }

    return values;
  }

  // ===================== INTERACTIVE ATTACK INJECTORS =====================

  public injectDrift(deviceId: string, field: string, rate: number = 2.5): { success: boolean; message: string } {
    const dev = db.getDeviceById(deviceId);
    if (!dev) return { success: false, message: 'Device not found' };

    this.activeDrifts.set(deviceId, { field, rate, currentOffset: 0 });
    return { success: true, message: `Sensor drift injected on ${dev.serialNumber} (Field: ${field}, Rate: +${rate}/tick)` };
  }

  public injectSpike(deviceId: string, field: string, spikeValue: number): { success: boolean; message: string } {
    const dev = db.getDeviceById(deviceId);
    if (!dev) return { success: false, message: 'Device not found' };
    const type = db.deviceTypes.get(dev.deviceTypeId);
    if (!type) return { success: false, message: 'Device type not found' };

    const payload = this.generateDeviceTelemetry(dev, type);
    payload[field] = spikeValue;

    const outcome = TelemetryIngestor.processTelemetryMessage({
      deviceId: dev.id,
      payload,
      timestamp: new Date().toISOString()
    });

    if (outcome.reading) {
      mqttBroker.broadcastToDashboards('TELEMETRY_STREAM', {
        deviceId: dev.id,
        reading: outcome.reading,
        anomalyEventId: outcome.anomalyEventId
      });
    }

    return {
      success: true,
      message: `Extreme Spike Injected: ${field} = ${spikeValue} on ${dev.serialNumber}. Tier1=${outcome.tier1Status}`
    };
  }

  public injectFrozenSensor(deviceId: string): { success: boolean; message: string } {
    const dev = db.getDeviceById(deviceId);
    if (!dev) return { success: false, message: 'Device not found' };
    const type = db.deviceTypes.get(dev.deviceTypeId);
    if (!type) return { success: false, message: 'Device type not found' };

    const frozen = this.generateDeviceTelemetry(dev, type);
    this.frozenDevices.set(deviceId, frozen);
    return { success: true, message: `Sensor signal frozen on ${dev.serialNumber}. Values fixed without natural jitter.` };
  }

  public simulateClonedCertAttack(deviceId: string): { success: boolean; message: string } {
    const dev = db.getDeviceById(deviceId);
    if (!dev) return { success: false, message: 'Device not found' };
    const cert = dev.certificateId ? certManager.getCertificateById(dev.certificateId) : undefined;
    if (!cert) return { success: false, message: 'No certificate associated with device' };

    // Trigger concurrent connection from rogue IP 198.51.100.42
    const rogueIp = '198.51.100.42';
    SecurityEngine.checkCertificateConcurrence(cert.fingerprintSha256, rogueIp, dev.id, dev.orgId);

    return {
      success: true,
      message: `Cloned Certificate Attack Simulated: Certificate for ${dev.serialNumber} presented from unauthorized IP ${rogueIp}`
    };
  }

  public simulateRogueTopicSpoof(sourceDeviceId: string, targetDeviceId: string): { success: boolean; message: string } {
    const sourceDev = db.getDeviceById(sourceDeviceId);
    const targetDev = db.getDeviceById(targetDeviceId);
    if (!sourceDev || !targetDev) return { success: false, message: 'Devices not found' };

    const rogueTopic = `org/${targetDev.orgId}/site/${targetDev.siteId}/device/${targetDev.id}/telemetry`;

    SecurityEngine.reportSecurityEvent({
      eventType: 'ROGUE_TOPIC_ATTEMPT',
      deviceId: sourceDev.id,
      orgId: sourceDev.orgId,
      siteId: sourceDev.siteId,
      clientIp: sourceDev.ipAddress || '10.14.2.19',
      attemptedTopic: rogueTopic,
      details: `Rogue Topic Spoofing: Device ${sourceDev.serialNumber} attempted to publish to ${targetDev.serialNumber}'s topic (${rogueTopic})`
    });

    return {
      success: true,
      message: `Rogue Topic Spoof Simulated: ${sourceDev.serialNumber} rejected trying to publish on ${targetDev.serialNumber}'s topic.`
    };
  }

  public clearAnomalies(deviceId?: string): { success: boolean; message: string } {
    if (deviceId) {
      this.activeDrifts.delete(deviceId);
      this.frozenDevices.delete(deviceId);
      return { success: true, message: `Cleared simulated anomalies for device ${deviceId}` };
    } else {
      this.activeDrifts.clear();
      this.frozenDevices.clear();
      return { success: true, message: 'Cleared all active simulation anomalies across fleet' };
    }
  }
}

export const fleetSimulator = FleetSimulator.getInstance();
