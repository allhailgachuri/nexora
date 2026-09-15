# NEXORA — Server Deployment & Full Stack Production Runbook (`deploymentfixserver.md`)

This comprehensive guide documents all production fixes, multi-cloud configurations, and operational playbooks implemented for the **NEXORA Backend Core** (Express API + WebSocket Observability Bus + X.509 PKI Authority + Simulated Telemetry Ingestion Engine) and its integration with the **Vercel Frontend**.

---

## 🌐 Live Production Deployments

* **Frontend Command Center (Vercel)**: [https://nexorraa.vercel.app/](https://nexorraa.vercel.app/)
* **Backend API & WebSocket Event Bus (Render)**: [https://nexorraa.onrender.com/](https://nexorraa.onrender.com/)

---

## 🧠 Architectural Deep-Dive: Why Decouple Vercel & Render?

### The Question:
> *"Why did Render show all backend features while Vercel initially needed configuration to display the fleet data?"*

### The Architectural Explanation:
1. **Render (Full-Stack & Backend Service)**:
   - Render runs the persistent Node.js/TypeScript server process.
   - It hosts the embedded **X.509 PKI Root Authority**, the **MQTT Broker topic ACL engine**, the **Two-Tier ML Anomaly detector**, and the live **WebSocket streaming bus**.
   - When visited directly (`https://nexorraa.onrender.com/`), Express serves the API endpoints (`/api/...`), WebSockets (`/ws`), and static files from `client/dist`.

2. **Vercel (Static Edge Single-Page Application)**:
   - Vercel is a global CDN/Edge network optimized for blazing-fast React frontend rendering.
   - Vercel does **not** run persistent WebSocket servers or PKI cryptographic engines.
   - For Vercel (`https://nexorraa.vercel.app/`) to display the live fleet, it fetches JSON from Render (`https://nexorraa.onrender.com/api/...`) and maintains a persistent WebSocket connection to `wss://nexorraa.onrender.com/ws`.
   - **The Zero-Config Auto-Connect Fix**: We enhanced [`client/src/services/api.ts`](file:///c:/Users/franc/OneDrive/Documents/Projects/nexora/client/src/services/api.ts) so that whenever the application runs on a `*.vercel.app` domain, it automatically resolves to `https://nexorraa.onrender.com` without needing manual environment variables!

---

## 🚨 Root Cause Diagnosis: The `/server/server/dist/index.js` Error

### The Exact Render Error:
```text
==> Running 'node server/dist/index.js'
Error: Cannot find module '/opt/render/project/src/server/server/dist/index.js'
    code: 'MODULE_NOT_FOUND'
==> Exited with status 1
```

### Why this occurred:
When the **Root Directory** in Render's dashboard is set to `server`, Render's runner changes working directory to `/opt/render/project/src/server`.

If the **Start Command** is left as `node server/dist/index.js`, Node resolves the relative path from inside `/server/`, attempting to find:
$$\text{/opt/render/project/src/server} + \text{server/dist/index.js} = \textbf{/opt/render/project/src/server/server/dist/index.js} \quad (\text{FAIL})$$

---

## 🛠️ Complete Summary of All Applied Fixes

We engineered a **resilient, self-healing system** that boots cleanly under **ANY** directory or script configuration:

| Layer | File Modified | Purpose / Fix |
| :--- | :--- | :--- |
| **Server Scripts** | [`server/package.json`](file:///c:/Users/franc/OneDrive/Documents/Projects/nexora/server/package.json) | Added script aliases: `"build:server"`, `"build"`, `"server"`, `"start"`. Resolves `npm error Missing script: "build:server"`. |
| **Nested Path Trampoline** | [`server/server/dist/index.js`](file:///c:/Users/franc/OneDrive/Documents/Projects/nexora/server/server/dist/index.js) | Redirects any nested `/server/server/dist/index.js` execution back to `dist/index.js`. |
| **Subdirectory Trampoline** | [`server/index.js`](file:///c:/Users/franc/OneDrive/Documents/Projects/nexora/server/index.js) | Auto-resolves `node index.js` when executed from `/server/`. |
| **Root Trampoline** | [`index.js`](file:///c:/Users/franc/OneDrive/Documents/Projects/nexora/index.js) | Auto-locates `server/dist/index.js` or `dist/index.js` when executed from workspace root. |
| **Declarative Blueprint** | [`render.yaml`](file:///c:/Users/franc/OneDrive/Documents/Projects/nexora/render.yaml) | Provides 1-click zero-config deployment on Render with health checks. |
| **Smart API Resolution** | [`client/src/services/api.ts`](file:///c:/Users/franc/OneDrive/Documents/Projects/nexora/client/src/services/api.ts) | Auto-detects Vercel hosting, points to Render backend, and auto-derives secure WebSocket (`wss://`) URLs. |

---

## 📋 Recommended Platform Configurations

### 1. Render Dashboard Settings

* **Root Directory**: `server` (or blank `./`)
* **Environment**: `Node`
* **Build Command**: `npm install && npm run build:server`
* **Start Command**: `npm start` *(or `node dist/index.js` or `node server/dist/index.js` — all work)*
* **Health Check Path**: `/api/stats`
* **Environment Variables**:
  ```env
  NODE_ENV=production
  PORT=4000
  CORS_ORIGIN=*
  JWT_SECRET=nexora_production_secure_key_99
  ```

---

### 2. Vercel Dashboard Settings

* **Root Directory**: `./` (or `client`)
* **Framework Preset**: `Vite`
* **Build Command**: `npm run build:client`
* **Output Directory**: `client/dist`
* **Environment Variables** (Optional, auto-configured):
  ```env
  VITE_API_URL=https://nexorraa.onrender.com
  VITE_WS_URL=wss://nexorraa.onrender.com/ws
  ```

---

## 🚑 Multidisciplinary Troubleshooting Playbook

### Issue 1: `npm error Missing script: "build:server"`
* **Cause**: Running in `server/` when `server/package.json` only had `"build"`.
* **Fix**: Both `"build"` and `"build:server"` are now configured in `server/package.json`.

### Issue 2: `Error: Cannot find module '.../dist/index.js'`
* **Cause**: Mismatch between Root Directory and Start Command path.
* **Fix**: All 3 trampolines (`index.js`, `server/index.js`, `server/server/dist/index.js`) auto-redirect execution to the compiled output.

### Issue 3: Render Free Tier Cold-Start (502 Bad Gateway / Spin-down)
* **Cause**: Render Free Web Services sleep after 15 minutes of inactivity.
* **Behavior**: The first request to `https://nexorraa.onrender.com/` takes ~30-50 seconds to spin up.
* **Remedy**: The frontend WebSocket client includes auto-reconnect logic (`WebSocketClient.reconnect()` every 3s) that automatically restores live streaming as soon as the container wakes up.

### Issue 4: Cross-Origin Resource Sharing (CORS) Block
* **Cause**: Browser blocking requests between `https://nexorraa.vercel.app` and `https://nexorraa.onrender.com`.
* **Fix**: Backend `server/src/index.ts` has CORS configured with `origin: process.env.CORS_ORIGIN || '*'`.

---

## 🔒 Verification & Health Check Command
To verify the live backend health from any terminal:
```bash
curl -X GET https://nexorraa.onrender.com/api/stats
```
Expected Response:
```json
{
  "success": true,
  "stats": {
    "totalDevices": 200,
    "onlineDevices": 184,
    "quarantinedDevices": 6,
    "threatLevel": "ELEVATED"
  }
}
```
