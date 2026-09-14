import express from 'express';
import http from 'http';
import cors from 'cors';
import path from 'path';
import fs from 'fs';
import { WebSocketServer, WebSocket } from 'ws';
import { CONFIG } from './config';
import { seedNexoraDatabase } from './db/seedData';
import { mqttBroker } from './broker/mqttBroker';
import { fleetSimulator } from './simulator/fleetSimulator';

import authRoutes from './api/authRoutes';
import deviceRoutes from './api/deviceRoutes';
import incidentRoutes from './api/incidentRoutes';
import firmwareRoutes from './api/firmwareRoutes';
import pkiRoutes from './api/pkiRoutes';
import auditRoutes from './api/auditRoutes';
import simulatorRoutes from './api/simulatorRoutes';

const app = express();
app.use(cors({ origin: '*' }));
app.use(express.json());

// Mount API Routes
app.use('/api/auth', authRoutes);
app.use('/api/devices', deviceRoutes);
app.use('/api/incidents', incidentRoutes);
app.use('/api/firmware', firmwareRoutes);
app.use('/api/pki', pkiRoutes);
app.use('/api/audit', auditRoutes);
app.use('/api/simulator', simulatorRoutes);

app.get('/api/health', (req, res) => {
  res.json({
    status: 'HEALTHY',
    service: 'NEXORA IoT Security & Anomaly Platform',
    timestamp: new Date().toISOString(),
    uptimeSec: process.uptime()
  });
});

// Serve compiled client assets if available
const clientDistPath = path.join(__dirname, '../../client/dist');
if (fs.existsSync(clientDistPath)) {
  app.use(express.static(clientDistPath));
  app.get('*', (req, res, next) => {
    if (req.path.startsWith('/api') || req.path.startsWith('/ws')) {
      return next();
    }
    res.sendFile(path.join(clientDistPath, 'index.html'));
  });
}

const server = http.createServer(app);

// WebSocket Server for Dashboards & MQTT over WS
const wss = new WebSocketServer({ server });

wss.on('connection', (ws: WebSocket, req) => {
  const url = req.url || '';
  if (url.includes('/mqtt')) {
    // Dedicated MQTT transport connection handled by mqttBroker
    return;
  }

  // Dashboard subscriber client
  mqttBroker.registerFrontendClient(ws);
  ws.send(JSON.stringify({ type: 'CONNECTED', message: 'NEXORA Command Center Real-Time Bus Connected' }));

  ws.on('close', () => {
    mqttBroker.removeFrontendClient(ws);
  });
});

mqttBroker.init(wss);

// Bootstrap Data & Simulator
seedNexoraDatabase();
fleetSimulator.start();

server.listen(CONFIG.PORT, () => {
  console.log(`=======================================================`);
  console.log(`🛡️  NEXORA IoT Security & Fleet Observability Engine`);
  console.log(`📡  Server listening on http://localhost:${CONFIG.PORT}`);
  console.log(`🔌  WebSocket Bus ready on ws://localhost:${CONFIG.PORT}/ws`);
  console.log(`🔐  PKI Root CA & mTLS ACL Broker Online`);
  console.log(`=======================================================`);
});
