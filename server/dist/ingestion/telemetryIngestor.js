"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.TelemetryIngestor = void 0;
const database_1 = require("../db/database");
const schemaValidator_1 = require("./schemaValidator");
const tier1RuleEngine_1 = require("./tier1RuleEngine");
const anomalyEngine_1 = require("../ml/anomalyEngine");
class TelemetryIngestor {
    /**
     * Pipeline: Schema Validate -> Tier 1 Inline Rules -> Time-Series Write -> Tier 2 ML Scoring
     */
    static processTelemetryMessage(params) {
        const device = database_1.db.getDeviceById(params.deviceId);
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
        const deviceType = database_1.db.deviceTypes.get(device.deviceTypeId);
        if (!deviceType) {
            return {
                success: false,
                tier1Status: 'ANOMALOUS',
                tier1Violations: ['Invalid device type schema definition'],
                rejectionReason: 'Missing device type schema'
            };
        }
        // 1. Schema Validation
        const validation = schemaValidator_1.TelemetrySchemaValidator.validate(params.payload, deviceType.telemetrySchema);
        if (!validation.isValid) {
            return {
                success: false,
                tier1Status: 'ANOMALOUS',
                tier1Violations: validation.errors,
                rejectionReason: `Schema validation failed: ${validation.errors.join('; ')}`
            };
        }
        const currentTimestamp = params.timestamp || new Date().toISOString();
        const history = database_1.db.getTelemetryHistory(device.id, 10);
        // 2. Tier 1 Fast Inline Rule Evaluation
        const tier1 = tier1RuleEngine_1.Tier1RuleEngine.evaluate(validation.sanitizedValues, currentTimestamp, deviceType.telemetrySchema, history);
        // 3. Persist Telemetry to Time-Series Store
        const reading = {
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
        database_1.db.recordTelemetry(reading);
        // 4. Tier 2 ML Anomaly Evaluation
        const anomalyEvent = anomalyEngine_1.Tier2AnomalyEngine.evaluate(device, reading, history);
        return {
            success: true,
            reading,
            tier1Status: reading.tier1Status,
            tier1Violations: reading.tier1Violations,
            anomalyEventId: anomalyEvent?.id
        };
    }
}
exports.TelemetryIngestor = TelemetryIngestor;
