import { db } from '../db/database';
import { Device, TelemetryReading, AnomalyEvent, SeverityLevel } from '../types';
import { modelRegistry } from './modelRegistry';
import { ShapExplainer } from './shapExplainer';

export class Tier2AnomalyEngine {
  /**
   * Evaluates multivariate sensor behavior and temporal fleet deviations
   */
  public static evaluate(
    device: Device,
    reading: TelemetryReading,
    recentHistory: TelemetryReading[]
  ): AnomalyEvent | null {
    const deviceType = db.deviceTypes.get(device.deviceTypeId);
    if (!deviceType) return null;

    const activeModel = modelRegistry.getActiveModelForDeviceType(deviceType.id);
    const modelVersion = activeModel ? activeModel.version : 'v1.0.0-fallback';
    const modelId = activeModel ? activeModel.id : 'model-generic';

    // 1. Compute Fleet Baselines for this site and device type
    const peerDevices = db.getAllDevices().filter(
      d => d.deviceTypeId === device.deviceTypeId && d.siteId === device.siteId && d.id !== device.id
    );

    const baselines: Record<string, { mean: number; stdDev: number; samples: number[] }> = {};
    for (const field of deviceType.telemetrySchema.fields) {
      if (field.type !== 'number') continue;
      baselines[field.name] = { mean: 0, stdDev: 1, samples: [] };
    }

    // Collect peer readings from the last 30 readings
    for (const peer of peerDevices.slice(0, 15)) {
      const peerHistory = db.getTelemetryHistory(peer.id, 5);
      for (const p of peerHistory) {
        for (const f of deviceType.telemetrySchema.fields) {
          if (f.type !== 'number') continue;
          const val = Number(p.values[f.name]);
          if (!isNaN(val)) {
            baselines[f.name].samples.push(val);
          }
        }
      }
    }

    // Calculate empirical mean & stdDev
    for (const k of Object.keys(baselines)) {
      const samples = baselines[k].samples;
      if (samples.length >= 3) {
        const sum = samples.reduce((a, b) => a + b, 0);
        const mean = sum / samples.length;
        const variance = samples.reduce((a, b) => a + Math.pow(b - mean, 2), 0) / samples.length;
        baselines[k].mean = mean;
        baselines[k].stdDev = Math.max(Math.sqrt(variance), 0.5);
      } else {
        const field = deviceType.telemetrySchema.fields.find(f => f.name === k);
        if (field && field.min !== undefined && field.max !== undefined) {
          baselines[k].mean = (field.min + field.max) / 2;
          baselines[k].stdDev = Math.max((field.max - field.min) / 6, 1);
        }
      }
    }

    // 2. Compute Multivariate Deviation Score (Mahalanobis / Isolation proxy)
    let maxZScore = 0;
    let sumZScore = 0;
    let numFeatures = 0;

    for (const field of deviceType.telemetrySchema.fields) {
      if (field.type !== 'number') continue;
      const val = Number(reading.values[field.name]);
      if (isNaN(val)) continue;

      const base = baselines[field.name];
      const z = Math.abs(val - base.mean) / (base.stdDev || 1);
      if (z > maxZScore) maxZScore = z;
      sumZScore += z;
      numFeatures++;
    }

    const avgZScore = numFeatures > 0 ? sumZScore / numFeatures : 0;
    // Non-linear sigmoid mapping to [0.0, 1.0] anomaly score
    const combinedScoreRaw = 0.5 * (maxZScore / 4.0) + 0.5 * (avgZScore / 3.0);
    const anomalyScore = parseFloat(Math.min(1.0, Math.max(0.0, 1 / (1 + Math.exp(-3 * (combinedScoreRaw - 0.9))))).toFixed(3));

    // Check for Sensor Drift (slope deviation over 10 points)
    let isDrifting = false;
    if (recentHistory.length >= 8) {
      const firstField = deviceType.telemetrySchema.fields.find(f => f.type === 'number');
      if (firstField) {
        const series = [...recentHistory.map(r => Number(r.values[firstField.name])), Number(reading.values[firstField.name])];
        const deltas = series.slice(1).map((val, idx) => val - series[idx]);
        const consistentPositive = deltas.every(d => d > 0.1);
        const consistentNegative = deltas.every(d => d < -0.1);
        if ((consistentPositive || consistentNegative) && Math.abs(series[series.length - 1] - series[0]) > 12) {
          isDrifting = true;
        }
      }
    }

    // Determine threshold trigger (> 0.70 is anomalous)
    const isAnomalous = anomalyScore >= 0.70 || isDrifting || (reading.tier1Violations && reading.tier1Violations.length > 0);

    if (!isAnomalous) {
      return null;
    }

    // Calculate SHAP explanation
    const { shapValues, majorDrivers } = ShapExplainer.computeShapValues(
      reading.values,
      baselines,
      deviceType.telemetrySchema
    );

    // Determine Severity
    let severity: SeverityLevel = 'LOW';
    if (anomalyScore >= 0.90 || reading.tier1Violations.length >= 2) {
      severity = 'CRITICAL';
    } else if (anomalyScore >= 0.80 || isDrifting) {
      severity = 'HIGH';
    } else if (anomalyScore >= 0.70) {
      severity = 'MEDIUM';
    }

    let anomalyType: AnomalyEvent['anomalyType'] = 'OUTLIER_DEVIATION';
    if (isDrifting) {
      anomalyType = 'SENSOR_DRIFT';
    } else if (reading.tier1Violations.some(v => v.includes('Rapid jump'))) {
      anomalyType = 'SUDDEN_SPIKE';
    } else if (reading.tier1Violations.some(v => v.includes('Stuck sensor'))) {
      anomalyType = 'FROZEN_STUCK_SENSOR';
    } else if (maxZScore > 4.5) {
      anomalyType = 'PEER_FLEET_DIVERGENCE';
    }

    const event: AnomalyEvent = {
      id: `anom-${device.id}-${Date.now()}`,
      deviceId: device.id,
      orgId: device.orgId,
      siteId: device.siteId,
      deviceTypeId: device.deviceTypeId,
      timestamp: reading.timestamp,
      anomalyScore,
      anomalyType,
      modelId,
      modelVersion,
      contributingFeatures: majorDrivers,
      shapValues,
      severity,
      status: 'UNREVIEWED',
      readingSnapshot: reading.values
    };

    db.recordAnomalyEvent(event);
    return event;
  }
}
