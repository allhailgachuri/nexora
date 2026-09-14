"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.TelemetrySchemaValidator = void 0;
class TelemetrySchemaValidator {
    static validate(payload, schema) {
        const errors = [];
        const missingFields = [];
        const sanitizedValues = {};
        for (const field of schema.fields) {
            const val = payload[field.name];
            // Check required
            if (val === undefined || val === null) {
                if (field.required) {
                    missingFields.push(field.name);
                    errors.push(`Missing required telemetry field '${field.displayName || field.name}'`);
                }
                continue;
            }
            // Check type
            if (field.type === 'number') {
                const num = Number(val);
                if (isNaN(num) || typeof val === 'boolean') {
                    errors.push(`Field '${field.name}' expects number, received ${typeof val} (${val})`);
                    continue;
                }
                sanitizedValues[field.name] = num;
            }
            else if (field.type === 'boolean') {
                sanitizedValues[field.name] = Boolean(val);
            }
            else {
                sanitizedValues[field.name] = String(val);
            }
        }
        return {
            isValid: errors.length === 0,
            sanitizedValues,
            errors,
            missingFields
        };
    }
}
exports.TelemetrySchemaValidator = TelemetrySchemaValidator;
