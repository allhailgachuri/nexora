# NEXORA — Vercel & Production Deployment Guide (`deploymentfix.md`)

This guide provides deployment instructions to deploy the **NEXORA** frontend command center to **Vercel**, and connect it to the **NEXORA Backend Engine** (Render, Railway, Fly.io, AWS, or Docker).

---

## 1. Vercel Frontend Deployment Options

You can deploy the NEXORA client dashboard to Vercel using either **Option A (Root Repository)** or **Option B (Client Subdirectory)**.

### Option A: Deploy from Project Root (Recommended)

1. Import your Git repository into **Vercel**.
2. Keep the **Root Directory** as `./` (default).
3. In **Project Settings**:
   - **Framework Preset**: `Vite`
   - **Build Command**: `npm run build:client` (or `npx vite build client`)
   - **Output Directory**: `client/dist`
   - **Install Command**: `npm install`
4. Add **Environment Variables** (optional, for connecting to external backend):
   - `VITE_API_URL`: `https://your-backend-api.onrender.com` (or Railway URL)
   - `VITE_WS_URL`: `wss://your-backend-api.onrender.com/ws`
5. Click **Deploy**. Vercel will build and host the high-speed SPA with automated SSL and edge caching.

---

### Option B: Deploy with Root Directory Set to `client`

1. Import your Git repository into **Vercel**.
2. Set **Root Directory** to `client`.
3. In **Project Settings**:
   - **Framework Preset**: `Vite`
   - **Build Command**: `npm run build` (or `vite build`)
   - **Output Directory**: `dist`
   - **Install Command**: `npm install`
4. Add **Environment Variables**:
   - `VITE_API_URL`: `https://your-backend-api.onrender.com`
   - `VITE_WS_URL`: `wss://your-backend-api.onrender.com/ws`
5. Click **Deploy**.

---

## 2. Vercel SPA Routing & Rewrites (`vercel.json`)

Both `vercel.json` and `client/vercel.json` have been configured with single-page application (SPA) rewrites to ensure deep routing and tab refreshes work seamlessly:

```json
{
  "$schema": "https://openapi.vercel.sh/vercel.json",
  "buildCommand": "npm run build:client",
  "outputDirectory": "client/dist",
  "framework": "vite",
  "rewrites": [
    {
      "source": "/(.*)",
      "destination": "/index.html"
    }
  ]
}
```

---

## 3. Backend Deployment (Render / Railway / Docker / VPS)

Because the NEXORA backend hosts an embedded **X.509 PKI Root Certificate Authority**, an **MQTT/mTLS broker**, and a **live fleet telemetry generator**, it runs as a persistent Node.js / TypeScript service.

### Deploying to Render / Railway / Fly.io

1. **Build Command**: `npm install && npm run build`
2. **Start Command**: `node server/dist/index.js`
3. **Environment Variables**:
   ```env
   NODE_ENV=production
   PORT=4000
   JWT_SECRET=your-production-jwt-security-key
   ```
4. **CORS & Domain**: Set `CORS_ORIGIN=*` or your Vercel frontend domain.

---

## 4. Docker Deployment (All-in-One Full Stack)

You can run the entire platform as a single Docker container:

```dockerfile
# Dockerfile
FROM node:22-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build

FROM node:22-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production
ENV PORT=4000
COPY --from=builder /app/package*.json ./
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/server/dist ./server/dist
COPY --from=builder /app/client/dist ./client/dist

EXPOSE 4000
CMD ["node", "server/dist/index.js"]
```

Build and run:
```bash
docker build -t nexora-platform .
docker run -p 4000:4000 nexora-platform
```

---

## 5. Verification Checklist

- [x] `client/dist/index.html` builds without TypeScript or bundling warnings.
- [x] Client supports `VITE_API_URL` and `VITE_WS_URL` with automatic `/api` fallback.
- [x] `vercel.json` configured for SPA routing.
- [x] Static assets served by backend when running standalone on port `4000`.
- [x] WebSocket and mTLS MQTT channels active.
