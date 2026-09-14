"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.CONFIG = void 0;
const path_1 = __importDefault(require("path"));
exports.CONFIG = {
    PORT: process.env.PORT ? parseInt(process.env.PORT, 10) : 4000,
    WS_PATH: '/ws',
    MQTT_WS_PATH: '/mqtt',
    JWT_SECRET: process.env.JWT_SECRET || 'nexora-secret-token-iot-security-key-2026',
    CA_COMMON_NAME: 'Nexora Platform Root CA - Production Fleet G1',
    CA_ORG: 'Nexora IoT Security Ltd.',
    CA_COUNTRY: 'US',
    CA_VALIDITY_DAYS: 3650, // 10 years for Root CA
    DEVICE_CERT_VALIDITY_DAYS: 90, // Short-lived 90-day certs per security requirements
    ROTATION_WINDOW_DAYS: 15, // Flag rotation needed if < 15 days left
    DATA_DIR: path_1.default.join(__dirname, '../../data'),
    SIMULATOR_TICK_MS: 3000, // Background telemetry generation interval
    MAX_TELEMETRY_HISTORY_PER_DEVICE: 300,
    TIER1_RATE_LIMIT_PER_MIN: 60, // Max 60 messages/min per device
};
