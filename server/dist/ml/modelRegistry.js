"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.modelRegistry = exports.AnomalyModelRegistry = void 0;
const database_1 = require("../db/database");
class AnomalyModelRegistry {
    static instance;
    constructor() { }
    static getInstance() {
        if (!AnomalyModelRegistry.instance) {
            AnomalyModelRegistry.instance = new AnomalyModelRegistry();
        }
        return AnomalyModelRegistry.instance;
    }
    getActiveModelForDeviceType(deviceTypeId) {
        for (const model of database_1.db.anomalyModels.values()) {
            if (model.deviceTypeId === deviceTypeId && model.activeStatus === 'ACTIVE') {
                return model;
            }
        }
        return undefined;
    }
    getAllModels() {
        return Array.from(database_1.db.anomalyModels.values());
    }
    recordAnalystFeedback(modelId, disposition) {
        const model = database_1.db.anomalyModels.get(modelId);
        if (!model)
            return;
        if (disposition === 'FALSE_POSITIVE') {
            // Slightly increase drift score to reflect model misclassification
            model.driftScore = Math.min(1.0, parseFloat((model.driftScore + 0.015).toFixed(3)));
            model.baselineMetrics.precision = Math.max(0.80, parseFloat((model.baselineMetrics.precision - 0.005).toFixed(3)));
        }
        else {
            // Confirmed threat validates model accuracy
            model.driftScore = Math.max(0.01, parseFloat((model.driftScore - 0.005).toFixed(3)));
            model.baselineMetrics.precision = Math.min(0.99, parseFloat((model.baselineMetrics.precision + 0.002).toFixed(3)));
        }
        database_1.db.anomalyModels.set(model.id, model);
    }
}
exports.AnomalyModelRegistry = AnomalyModelRegistry;
exports.modelRegistry = AnomalyModelRegistry.getInstance();
