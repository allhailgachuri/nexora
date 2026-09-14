"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const http_1 = __importDefault(require("http"));
const cors_1 = __importDefault(require("cors"));
const path_1 = __importDefault(require("path"));
const fs_1 = __importDefault(require("fs"));
const ws_1 = require("ws");
const config_1 = require("./config");
const seedData_1 = require("./db/seedData");
const mqttBroker_1 = require("./broker/mqttBroker");
const fleetSimulator_1 = require("./simulator/fleetSimulator");
const authRoutes_1 = __importDefault(require("./api/authRoutes"));
const deviceRoutes_1 = __importDefault(require("./api/deviceRoutes"));
const incidentRoutes_1 = __importDefault(require("./api/incidentRoutes"));
const firmwareRoutes_1 = __importDefault(require("./api/firmwareRoutes"));
const pkiRoutes_1 = __importDefault(require("./api/pkiRoutes"));
const auditRoutes_1 = __importDefault(require("./api/auditRoutes"));
const simulatorRoutes_1 = __importDefault(require("./api/simulatorRoutes"));
const app = (0, express_1.default)();
app.use((0, cors_1.default)({ origin: '*' }));
app.use(express_1.default.json());
// Mount API Routes
app.use('/api/auth', authRoutes_1.default);
app.use('/api/devices', deviceRoutes_1.default);
app.use('/api/incidents', incidentRoutes_1.default);
app.use('/api/firmware', firmwareRoutes_1.default);
app.use('/api/pki', pkiRoutes_1.default);
app.use('/api/audit', auditRoutes_1.default);
app.use('/api/simulator', simulatorRoutes_1.default);
app.get('/api/health', (req, res) => {
    res.json({
        status: 'HEALTHY',
        service: 'NEXORA IoT Security & Anomaly Platform',
        timestamp: new Date().toISOString(),
        uptimeSec: process.uptime()
    });
});
// Serve compiled client assets if available
const clientDistPath = path_1.default.join(__dirname, '../../client/dist');
if (fs_1.default.existsSync(clientDistPath)) {
    app.use(express_1.default.static(clientDistPath));
    app.get('*', (req, res, next) => {
        if (req.path.startsWith('/api') || req.path.startsWith('/ws')) {
            return next();
        }
        res.sendFile(path_1.default.join(clientDistPath, 'index.html'));
    });
}
const server = http_1.default.createServer(app);
// WebSocket Server for Dashboards & MQTT over WS
const wss = new ws_1.WebSocketServer({ server });
wss.on('connection', (ws, req) => {
    const url = req.url || '';
    if (url.includes('/mqtt')) {
        // Dedicated MQTT transport connection handled by mqttBroker
        return;
    }
    // Dashboard subscriber client
    mqttBroker_1.mqttBroker.registerFrontendClient(ws);
    ws.send(JSON.stringify({ type: 'CONNECTED', message: 'NEXORA Command Center Real-Time Bus Connected' }));
    ws.on('close', () => {
        mqttBroker_1.mqttBroker.removeFrontendClient(ws);
    });
});
mqttBroker_1.mqttBroker.init(wss);
// Bootstrap Data & Simulator
(0, seedData_1.seedNexoraDatabase)();
fleetSimulator_1.fleetSimulator.start();
server.listen(config_1.CONFIG.PORT, () => {
    console.log(`=======================================================`);
    console.log(`🛡️  NEXORA IoT Security & Fleet Observability Engine`);
    console.log(`📡  Server listening on http://localhost:${config_1.CONFIG.PORT}`);
    console.log(`🔌  WebSocket Bus ready on ws://localhost:${config_1.CONFIG.PORT}/ws`);
    console.log(`🔐  PKI Root CA & mTLS ACL Broker Online`);
    console.log(`=======================================================`);
});
