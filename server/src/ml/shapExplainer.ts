import { ShapValue, TelemetrySchema } from '../types';

export class ShapExplainer {
  /**
   * Computes feature-level SHAP explainability for an anomalous telemetry vector
   */
  public static computeShapValues(
    currentValues: Record<string, any>,
    fleetBaselines: Record<string, { mean: number; stdDev: number }>,
    schema: TelemetrySchema
  ): { shapValues: ShapValue[]; majorDrivers: string[] } {
    const rawDeviations: Array<{ feature: string; val: number; base: number; zScore: number }> = [];
    let totalZ = 0;

    for (const field of schema.fields) {
      if (field.type !== 'number') continue;
      const val = Number(currentValues[field.name]);
      if (isNaN(val)) continue;

      const baseline = fleetBaselines[field.name] || {
        mean: field.min !== undefined && field.max !== undefined ? (field.min + field.max) / 2 : val,
        stdDev: field.min !== undefined && field.max !== undefined ? Math.max((field.max - field.min) / 6, 1) : 1
      };

      const zScore = Math.abs(val - baseline.mean) / (baseline.stdDev || 1);
      rawDeviations.push({
        feature: field.name,
        val,
        base: baseline.mean,
        zScore
      });
      totalZ += zScore;
    }

    if (totalZ === 0) totalZ = 1;

    const shapValues: ShapValue[] = rawDeviations.map(d => {
      const contributionPercent = parseFloat(((d.zScore / totalZ) * 100).toFixed(1));
      const shapScore = parseFloat((d.zScore / (1 + d.zScore)).toFixed(3));
      return {
        feature: d.feature,
        value: parseFloat(d.val.toFixed(2)),
        baseline: parseFloat(d.base.toFixed(2)),
        shapScore,
        contributionPercent,
        isMajorDriver: contributionPercent >= 30.0
      };
    });

    // Sort by highest contribution
    shapValues.sort((a, b) => b.contributionPercent - a.contributionPercent);

    const majorDrivers = shapValues.filter(s => s.isMajorDriver).map(s => s.feature);

    return {
      shapValues,
      majorDrivers: majorDrivers.length > 0 ? majorDrivers : [shapValues[0]?.feature || 'unknown']
    };
  }
}
