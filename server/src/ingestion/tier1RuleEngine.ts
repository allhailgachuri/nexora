import { TelemetrySchema, TelemetryReading } from '../types';

export interface Tier1CheckResult {
  isAnomalous: boolean;
  violations: string[];
  boundsExceeded: Array<{ field: string; value: number; min?: number; max?: number }>;
  rateOfChangeExceeded: Array<{ field: string; delta: number; maxAllowed: number }>;
  isReplayOrFuture: boolean;
  isStuckSensor: boolean;
}

export class Tier1RuleEngine {
  /**
   * Fast microsecond inline checks on incoming telemetry reading
   */
  public static evaluate(
    currentValues: Record<string, any>,
    currentTimestamp: string,
    schema: TelemetrySchema,
    recentHistory: TelemetryReading[]
  ): Tier1CheckResult {
    const violations: string[] = [];
    const boundsExceeded: Array<{ field: string; value: number; min?: number; max?: number }> = [];
    const rateOfChangeExceeded: Array<{ field: string; delta: number; maxAllowed: number }> = [];
    let isReplayOrFuture = false;
    let isStuckSensor = false;

    const prevReading = recentHistory.length > 0 ? recentHistory[recentHistory.length - 1] : undefined;
    const nowMs = Date.now();
    const readingMs = new Date(currentTimestamp).getTime();

    // 1. Timestamp future/replay check (skew > 90s)
    if (readingMs > nowMs + 90000) {
      isReplayOrFuture = true;
      violations.push(`Future timestamp detected (${Math.round((readingMs - nowMs) / 1000)}s ahead of server clock)`);
    } else if (prevReading) {
      const prevMs = new Date(prevReading.timestamp).getTime();
      if (readingMs <= prevMs) {
        isReplayOrFuture = true;
        violations.push(`Timestamp replay/rollback detected (Received <= previous reading timestamp)`);
      }
    }

    // 2. Bound checks & Rate-of-Change checks
    for (const field of schema.fields) {
      if (field.type !== 'number') continue;
      const currentVal = currentValues[field.name];
      if (typeof currentVal !== 'number') continue;

      // Bound checks
      if (field.min !== undefined && currentVal < field.min) {
        boundsExceeded.push({ field: field.name, value: currentVal, min: field.min, max: field.max });
        violations.push(`Field '${field.displayName || field.name}' value ${currentVal}${field.unit || ''} below minimum ${field.min}${field.unit || ''}`);
      }
      if (field.max !== undefined && currentVal > field.max) {
        boundsExceeded.push({ field: field.name, value: currentVal, min: field.min, max: field.max });
        violations.push(`Field '${field.displayName || field.name}' value ${currentVal}${field.unit || ''} exceeds maximum ${field.max}${field.unit || ''}`);
      }

      // Rate-of-change checks
      if (field.maxRateOfChange !== undefined && prevReading && prevReading.values[field.name] !== undefined) {
        const prevVal = Number(prevReading.values[field.name]);
        if (!isNaN(prevVal)) {
          const delta = Math.abs(currentVal - prevVal);
          if (delta > field.maxRateOfChange) {
            rateOfChangeExceeded.push({ field: field.name, delta, maxAllowed: field.maxRateOfChange });
            violations.push(`Rapid jump on '${field.displayName || field.name}': Δ=${delta.toFixed(2)} exceeds physical rate limit of ${field.maxRateOfChange}${field.unit || ''}/tick`);
          }
        }
      }
    }

    // 3. Stuck/Frozen Sensor Check (last 6 readings having identical values to 3 decimals)
    if (recentHistory.length >= 6) {
      const sampleFields = schema.fields.filter(f => f.type === 'number').map(f => f.name);
      let allFrozen = true;
      for (const f of sampleFields) {
        const lastVal = currentValues[f];
        if (typeof lastVal !== 'number') continue;
        const last6 = recentHistory.slice(-5).map(r => r.values[f]);
        const areAllEqual = last6.every(v => typeof v === 'number' && Math.abs(v - lastVal) < 0.0001);
        if (!areAllEqual) {
          allFrozen = false;
          break;
        }
      }
      if (allFrozen && sampleFields.length > 0) {
        isStuckSensor = true;
        violations.push(`Stuck sensor signal: Readings show zero natural jitter across 6 consecutive ticks (Frozen telemetry)`);
      }
    }

    return {
      isAnomalous: violations.length > 0,
      violations,
      boundsExceeded,
      rateOfChangeExceeded,
      isReplayOrFuture,
      isStuckSensor
    };
  }
}
