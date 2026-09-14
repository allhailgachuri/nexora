import { db } from '../db/database';
import { AnomalyModelInfo } from '../types';

export class AnomalyModelRegistry {
  private static instance: AnomalyModelRegistry;

  private constructor() {}

  public static getInstance(): AnomalyModelRegistry {
    if (!AnomalyModelRegistry.instance) {
      AnomalyModelRegistry.instance = new AnomalyModelRegistry();
    }
    return AnomalyModelRegistry.instance;
  }

  public getActiveModelForDeviceType(deviceTypeId: string): AnomalyModelInfo | undefined {
    for (const model of db.anomalyModels.values()) {
      if (model.deviceTypeId === deviceTypeId && model.activeStatus === 'ACTIVE') {
        return model;
      }
    }
    return undefined;
  }

  public getAllModels(): AnomalyModelInfo[] {
    return Array.from(db.anomalyModels.values());
  }

  public recordAnalystFeedback(modelId: string, disposition: 'CONFIRMED_THREAT' | 'FALSE_POSITIVE'): void {
    const model = db.anomalyModels.get(modelId);
    if (!model) return;

    if (disposition === 'FALSE_POSITIVE') {
      // Slightly increase drift score to reflect model misclassification
      model.driftScore = Math.min(1.0, parseFloat((model.driftScore + 0.015).toFixed(3)));
      model.baselineMetrics.precision = Math.max(0.80, parseFloat((model.baselineMetrics.precision - 0.005).toFixed(3)));
    } else {
      // Confirmed threat validates model accuracy
      model.driftScore = Math.max(0.01, parseFloat((model.driftScore - 0.005).toFixed(3)));
      model.baselineMetrics.precision = Math.min(0.99, parseFloat((model.baselineMetrics.precision + 0.002).toFixed(3)));
    }

    db.anomalyModels.set(model.id, model);
  }
}

export const modelRegistry = AnomalyModelRegistry.getInstance();
