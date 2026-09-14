# NEXORA — Server Deployment Fix & Production Guide (`deploymentfixserver.md`)

This guide diagnoses and eliminates **all deployment errors** on **Render**, **Railway**, **Fly.io**, **AWS**, and **Docker** when deploying the **NEXORA Backend Core** (Express API + WebSocket Observability Bus + X.509 PKI Authority + Simulated Telemetry Engine).

---

## 🚨 Root Cause Diagnosis: The `/server/server/dist/index.js` Error

### The Exact Log Output:
```text
==> Running 'node server/dist/index.js'
Error: Cannot find module '/opt/render/project/src/server/server/dist/index.js'
    code: 'MODULE_NOT_FOUND'
==> Exited with status 1
```

### Why this happens:
On Render or Railway, when you set the **Root Directory** field in the Web Service settings to `server`, the cloud host changes its current working directory to `/opt/render/project/src/server`.

If your **Start Command** is configured as `node server/dist/index.js`, Node resolves the path relative to `/server/`, resulting in:
$$\text{/opt/render/project/src/server} + \text{server/dist/index.js} = \textbf{/opt/render/project/src/server/server/dist/index.js} \quad (\text{FAIL})$$

---

## 🛠️ The 3 Instant Solutions

Choose **Solution 1 (Recommended)** or **Solution 2** depending on your Render dashboard configuration:

### 🌟 Solution 1: Deploy from Project Root (Recommended)

In your **Render Web Service Settings**:
1. **Root Directory**: Leave **BLANK** (or enter `./`).
2. **Environment**: `Node`
3. **Build Command**:
   ```bash
   npm install && npm run build:server
   ```
4. **Start Command**:
   ```bash
   npm run start
   ```
   *(or `node server/dist/index.js`)*
5. **Health Check Path**: `/api/stats`

---

### 🌟 Solution 2: Deploy with Root Directory set to `server`

If you specifically configured your Render service with **Root Directory** = `server`:
1. **Root Directory**: `server`
2. **Environment**: `Node`
3. **Build Command**:
   ```bash
   npm install && npm run build
   ```
4. **Start Command**:
   ```bash
   npm start
   ```
   *(or `node dist/index.js` or `node index.js`)*
5. **Health Check Path**: `/api/stats`

---

### 🌟 Solution 3: One-Click Render Blueprint (`render.yaml`)

We have pre-configured a declarative `render.yaml` at the root of the repository.

1. Go to your **Render Dashboard** → **Blueprints** → **New Blueprint Instance**.
2. Connect your `nexora` repository.
3. Render will automatically read `render.yaml` and provision `nexora-api` with the exact correct build scripts, port bindings, and health checks without manual typing.

```yaml
# render.yaml
services:
  - type: web
    name: nexora-api
    env: node
    plan: free
    buildCommand: npm install && npm run build:server
    startCommand: npm run start
    healthCheckPath: /api/stats
    envVars:
      - key: NODE_ENV
        value: production
      - key: PORT
        value: 4000
      - key: CORS_ORIGIN
        value: '*'
      - key: JWT_SECRET
        generateValue: true
```

---

## 🚂 Railway Deployment Instructions

1. Go to **Railway.app** → **New Project** → **Deploy from GitHub repo**.
2. Under **Service Settings**:
   - **Root Directory**: `/`
   - **Build Command**: `npm install && npm run build:server`
   - **Start Command**: `npm run start`
3. Under **Variables**:
   ```env
   NODE_ENV=production
   PORT=4000
   CORS_ORIGIN=*
   JWT_SECRET=your-secure-random-jwt-key
   ```
4. Railway will expose a public `https://...up.railway.app` URL.

---

## 🐳 Docker Container Deployment (All Environments)

To run the containerized backend anywhere (Render Docker runtime, Fly.io, AWS ECS, GCP Cloud Run):

### Standard `Dockerfile`:
```dockerfile
FROM node:22-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build:server

FROM node:22-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production
ENV PORT=4000
COPY --from=builder /app/package*.json ./
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/server/dist ./server/dist
COPY --from=builder /app/server ./server
COPY --from=builder /app/index.js ./index.js

EXPOSE 4000
CMD ["npm", "run", "start"]
```

Build and test locally:
```bash
docker build -t nexora-server .
docker run -p 4000:4000 nexora-server
```

---

## 🔑 Environment Variables Reference

Configure these in your cloud provider's dashboard:

| Variable | Recommended Value | Description |
| :--- | :--- | :--- |
| `NODE_ENV` | `production` | Enables production optimizations and disables debug logs |
| `PORT` | `4000` *(Render sets this automatically)* | Port the Express server & WebSocket bus listen on |
| `CORS_ORIGIN` | `*` *(or your Vercel frontend domain)* | Cross-Origin Resource Sharing policy |
| `JWT_SECRET` | `nexora_secret_jwt_sign_key_99` | Secret key used for signing security tokens |

---

## 🏥 Multidisciplinary Troubleshooting Matrix

### 1. `Error: Cannot find module '.../index.js'`
* **Cause**: Mismatched Root Directory and Start Command.
* **Fix**: Ensure that if Root Directory is blank/root, Start Command is `npm run start` or `node server/dist/index.js`. If Root Directory is `server`, Start Command is `node dist/index.js`.
* **Auto-Healing**: The repository now includes universal trampolines (`index.js` and `server/index.js`) that automatically search and locate the compiled `dist` directory regardless of working directory context.

### 2. `Port 4000 already in use` / `EADDRINUSE`
* **Cause**: Multiple Node processes binding the same port locally or in development.
* **Fix**: Cloud hosting platforms dynamically assign `process.env.PORT`. The NEXORA server listens on `process.env.PORT || 4000`, ensuring compatibility with Render's dynamically allocated ports.

### 3. `WebSocket connection to 'wss://...' failed: HTTP 502`
* **Cause**: Backend service sleeping (on free tier) or proxy timeout.
* **Fix**: Render Free instances spin down after 15 minutes of inactivity. When the frontend wakes it up, allow 30 seconds for cold-start. On paid tiers, the WebSocket connection remains permanently active.

### 4. `CORS Policy: No 'Access-Control-Allow-Origin' header`
* **Cause**: Frontend domain blocked by API CORS policy.
* **Fix**: Set `CORS_ORIGIN=*` in the Render environment variables, or set it to your explicit Vercel frontend URL: `https://nexora-app.vercel.app`.

### 5. `TypeScript Compilation Failed during Build`
* **Cause**: Missing `@types` dependencies.
* **Fix**: Run `npm install` before `npm run build:server`. All devDependencies and type declarations are pre-installed in the root `package.json`.

---

## 🔗 Connecting Frontend (Vercel) to Backend (Render)

Once your backend is deployed and green on Render (e.g., `https://nexora-api.onrender.com`):

1. Open your **Vercel Project Dashboard** (Frontend).
2. Go to **Settings** → **Environment Variables**.
3. Add:
   - `VITE_API_URL`: `https://nexora-api.onrender.com`
   - `VITE_WS_URL`: `wss://nexora-api.onrender.com/ws`
4. Trigger a **Redeploy** on Vercel.
5. Your frontend will connect to the live backend, streaming mTLS identities, telemetry anomalies, and certificate revocation events.

---

## ✅ Final Pre-Flight Checklist

- [x] Universal entrypoints `index.js` and `server/index.js` deployed.
- [x] `server/package.json` created with fallback scripts.
- [x] `render.yaml` Blueprint validated with `/api/stats` health check.
- [x] Dynamic `process.env.PORT` binding active on `0.0.0.0`.
- [x] WebSockets attached to HTTP server instance on `/ws`.
