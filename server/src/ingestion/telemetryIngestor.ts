import { db } from '../db/database';
import { Device, TelemetryReading } from '../types';
import { TelemetrySchemaValidator } from './schemaValidator';
import { Tier1RuleEngine } from './tier1RuleEngine';
import { Tier2AnomalyEngine } from '../ml/anomalyEngine';

export interface IngestionOutcome {
  success: boolean;
  reading?: TelemetryReading;
  tier1Status: 'NORMAL' | 'ANOMALOUS';
  tier1Violations: string[];
  anomalyEventId?: string;
  rejectionReason?: string;
}

export class TelemetryIngestor {
  /**
   * Pipeline: Schema Validate -> Tier 1 Inline Rules -> Time-Series Write -> Tier 2 ML Scoring
   */
  public static processTelemetryMessage(params: {
    deviceId: string;
    payload: Record<string, any>;
    timestamp?: string;
  }): IngestionOutcome {
    const device = db.getDeviceById(params.deviceId);
    if (!device) {
      return {
        success: false,
        tier1Status: 'ANOMALOUS',
        tier1Violations: ['Device not found in registry'],
        rejectionReason: 'Device unregistered'
      };
    }

    if (device.lifecycleState === 'QUARANTINED' || device.lifecycleState === 'REVOKED') {
      return {
        success: false,
        tier1Status: 'ANOMALOUS',
        tier1Violations: [`Device is in ${device.lifecycleState} state - Ingestion blocked`],
        rejectionReason: `Device ${device.lifecycleState}`
      };
    }

    const deviceType = db.deviceTypes.get(device.deviceTypeId);
    if (!deviceType) {
      return {
        success: false,
        tier1Status: 'ANOMALOUS',
        tier1Violations: ['Invalid device type schema definition'],
        rejectionReason: 'Missing device type schema'
      };
    }

    // 1. Schema Validation
    const validation = TelemetrySchemaValidator.validate(params.payload, deviceType.telemetrySchema);
    if (!validation.isValid) {
      return {
        success: false,
        tier1Status: 'ANOMALOUS',
        tier1Violations: validation.errors,
        rejectionReason: `Schema validation failed: ${validation.errors.join('; ')}`
      };
    }

    const currentTimestamp = params.timestamp || new Date().toISOString();
    const history = db.getTelemetryHistory(device.id, 10);

    // 2. Tier 1 Fast Inline Rule Evaluation
    const tier1 = Tier1RuleEngine.evaluate(
      validation.sanitizedValues,
      currentTimestamp,
      deviceType.telemetrySchema,
      history
    );

    // 3. Persist Telemetry to Time-Series Store
    const reading: TelemetryReading = {
      id: `tel-${device.id}-${Date.now()}`,
      deviceId: device.id,
      orgId: device.orgId,
      siteId: device.siteId,
      deviceTypeId: device.deviceTypeId,
      timestamp: currentTimestamp,
      values: validation.sanitizedValues,
      rawPayloadSize: JSON.stringify(params.payload).length,
      tier1Status: tier1.isAnomalous ? 'ANOMALOUS' : 'NORMAL',
      tier1Violations: tier1.violations
    };

    db.recordTelemetry(reading);

    // 4. Tier 2 ML Anomaly Evaluation
    const anomalyEvent = Tier2AnomalyEngine.evaluate(device, reading, history);

    return {
      success: true,
      reading,
      tier1Status: reading.tier1Status,
      tier1Violations: reading.tier1Violations,
      anomalyEventId: anomalyEvent?.id
    };
  }
}
