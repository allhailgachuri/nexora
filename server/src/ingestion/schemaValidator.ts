import { TelemetrySchema } from '../types';

export interface ValidationResult {
  isValid: boolean;
  sanitizedValues: Record<string, any>;
  errors: string[];
  missingFields: string[];
}

export class TelemetrySchemaValidator {
  public static validate(payload: Record<string, any>, schema: TelemetrySchema): ValidationResult {
    const errors: string[] = [];
    const missingFields: string[] = [];
    const sanitizedValues: Record<string, any> = {};

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
      } else if (field.type === 'boolean') {
        sanitizedValues[field.name] = Boolean(val);
      } else {
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
