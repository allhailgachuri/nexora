# NEXORA — Multi-Tenant IoT Device Fleet Security & Behavioral Observability Platform

<div align="center">

```
  _   _  _______  ______  _____            
 | \ | ||  ____/ \ \    / / __ \  _____    /\   
 |  \| || |__     \ \  / / |  | ||  __ \  /  \  
 | . ` ||  __|     \ \/ /| |  | || |__) |/ /\ \ 
 | |\  || |____     \  / | |__| ||  _  // ____ \
 |_| \_||______|     \/   \____/ |_| \_/_/    \_\
```

**Next-Generation Certificate-Based IoT Identity, Real-Time Telemetry Ingestion, and Explainable Behavioral ML Anomaly Defense**

[![Status](https://img.shields.io/badge/Status-Production--Ready-emerald?style=for-the-badge&logo=shield)](https://github.com/)
[![PKI Security](https://img.shields.io/badge/PKI-X.509%20mTLS%20%7C%202048--bit%20RSA-cyan?style=for-the-badge&logo=lock)](https://github.com/)
[![Broker ACL](https://img.shields.io/badge/Broker-Strict%20Topic%20ACL-blue?style=for-the-badge&logo=mqtt)](https://github.com/)
[![ML Engine](https://img.shields.io/badge/ML%20Engine-Isolation%20Forest%20%2B%20SHAP-purple?style=for-the-badge&logo=scikitlearn)](https://github.com/)
[![Audit Ledger](https://img.shields.io/badge/Audit-SHA--256%20Hash%20Chain-amber?style=for-the-badge&logo=blockchain)](https://github.com/)
[![Vercel Ready](https://img.shields.io/badge/Deploy-Vercel%20%2B%20Docker-black?style=for-the-badge&logo=vercel)](https://vercel.com/)

</div>

---

## 📖 Table of Contents
- [Executive Overview](#-executive-overview)
- [The Problem NEXORA Solves](#-the-problem-nexora-solves)
- [System Architecture](#-system-architecture)
- [16 Core System Engines](#-16-core-system-engines)
- [Device Identity & Cryptographic PKI Core](#-device-identity--cryptographic-pki-core)
- [MQTT Broker & Strict Topic ACL Enforcement](#-mqtt-broker--strict-topic-acl-enforcement)
- [Two-Tier Anomaly Detection Pipeline (Tier 1 & Tier 2 ML + SHAP)](#-two-tier-anomaly-detection-pipeline)
- [Incident Response & Human-Gated Safety Playbooks](#-incident-response--human-gated-safety-playbooks)
- [Signed Firmware Catalog & OTA Compliance](#-signed-firmware-catalog--ota-compliance)
- [Tamper-Evident SHA-256 Cryptographic Audit Ledger](#-tamper-evident-sha-256-cryptographic-audit-ledger)
- [Interactive Attack Sandbox & Fleet Simulator](#-interactive-attack-sandbox--fleet-simulator)
- [Role-Based Access Control (RBAC)](#-role-based-access-control-rbac)
- [REST API & WebSocket Documentation](#-rest-api--websocket-documentation)
- [Quickstart & Local Installation](#-quickstart--local-installation)
- [Production & Vercel Deployment Guide](#-production--vercel-deployment-guide)

---

## 🌟 Executive Overview

**NEXORA** is a multi-tenant IoT device fleet security and observability command center that gives organizations deploying distributed sensors (agricultural probes, water aqueduct meters, smart grid meters, industrial gateways, or any custom sensor fleet) real-time visibility into **every node's cryptographic identity, health, behavior, and security posture**.

Devices authenticate over **mutual TLS (mTLS)** using unique, short-lived X.509 client certificates issued by an integrated **PKI Root Authority**, eliminating shared credentials and enforcing cryptographic non-repudiation at the transport layer. Telemetry is streamed to an MQTT broker enforcing strict per-device topic ACLs, validated against dynamic per-device-type schemas, and evaluated in real time through a **two-tier detection pipeline**:
1. **Tier 1 (Fast Inline Rules)**: Microsecond bound checks, rate-of-change limits, timestamp replay/skew detection, and zero-jitter sensor freeze checks.
2. **Tier 2 (Behavioral ML & Explainability)**: Multivariate Isolation Forest, Autoencoder reconstruction loss, and Mahalanobis scoring equipped with **feature-level SHAP attribution vectors** and active model drift tracking.

Flagged deviations route into an integrated **SOC case-management subsystem** with safety playbooks (Quarantine, Certificate Revocation, Credential Rotation, Forced OTA), where **destructive or physically consequential actions on critical actuators (e.g., municipal water valves) are gated behind authorized human approval by policy**.

---

## 🎯 The Problem NEXORA Solves

> *"An enterprise deploys thousands of IoT devices across distributed geographic sites. They have no reliable way to know which devices are genuine, which are compromised or cloned, which are sending fabricated or drifting telemetry (sensor drift, tampering, spoofed readings), which are running outdated firmware with known CVEs, and which need a field engineer dispatched — until a failure or exploit has already caused physical damage or data loss."*

NEXORA replaces spreadsheets, proprietary vendor silos, and after-the-fact breach discovery with **one unified command pane of glass**:

```
Organization (Multi-Tenant)
 └── Site / Deployment Zone (Geographic: Farm Zone A, Water Cluster B, Smart Meter District C)
      └── Device Group / Fleet (North Orchards, Main Canal Gates, Metro Grid)
           └── Device (Permanent physical identity master record)
                ├── X.509 Device Certificate (Cryptographic PKI Identity)
                ├── Firmware Version (Installed vs. Signed Available vs. CVE Status)
                ├── Telemetry Stream (High-frequency time-series readings)
                ├── Device State Shadow (Desired vs. Reported delta sync)
                ├── Anomaly Event (Tier 2 ML-flagged behavioral deviation with SHAP)
                ├── Security Event (Auth failure, cert reuse, rogue topic attempt)
                ├── Incident (Assigned SOC case with investigation timeline)
                └── Response Action (Quarantine, Revoke Cert, Force OTA, Dispatch Tech)
```

---

## 🏗 System Architecture

```
                    ┌────────────────────────────────────────────────────────┐
                    │      IoT Devices / Gateways / Edge Simulator           │
                    │   (Soil Probes, Water Flow Actuators, Smart Meters)    │
                    └──────────────────────────┬─────────────────────────────┘
                                               │
                                 mTLS + Topic ACLs over MQTT / WS
                                               │
                                               ▼
                    ┌────────────────────────────────────────────────────────┐
                    │             NEXORA BROKER & INGESTION CORE             │
                    │  - mTLS Authenticator & CRL Revocation Check           │
                    │  - Strict Topic ACL Enforcement (`org/.../device/...`)  │
                    │  - Schema Validation (JSON-Schema per Device Type)     │
                    │  - Tier 1 Fast Rule Engine (Rate/Range/Heartbeat/Replay│
                    └──────────┬───────────────────────────────┬─────────────┘
                               │                               │
                               ▼                               ▼
                 ┌───────────────────────────┐   ┌───────────────────────────┐
                 │    Time-Series Store      │   │  Tier 2 ML Anomaly Engine │
                 │  - Timescale-style series │   │  - Isolation Forest/Outlier│
                 │  - Downsampling & Rollups │   │  - SHAP Feature Attribution│
                 │  - Device State Shadows   │   │  - Identity/Cadence Drift │
                 └─────────────┬─────────────┘   └─────────────┬─────────────┘
                               │                               │
                               ▼                               ▼
                    ┌────────────────────────────────────────────────────────┐
                    │            SECURITY & INCIDENT RESPONSE HUB            │
                    │  - SecurityEvent & AnomalyEvent Aggregation            │
                    │  - Case Management / Analyst Queue                     │
                    │  - Playbook Engine (Auto & Human-Gated Approvals)      │
                    │  - Actions: Quarantine, Revoke Cert, Block Topic, OTA  │
                    └──────────────────────────┬─────────────────────────────┘
                                               │
                                               ▼
                    ┌────────────────────────────────────────────────────────┐
                    │         NEXORA COMMAND CENTER (React 18 + Vite)        │
                    │  - SOC Fleet Overview & Threat Level Matrix            │
                    │  - Geographic Interactive Map (Site/Fleet/Device)      │
                    │  - Device Deep-Dive: Identity, Shadow, Telemetry, SHAP │
                    │  - Incident Triage & Human Approval Modals             │
                    │  - PKI Management, Firmware Compliance & OTA Campaigns │
                    │  - Live Attack & Anomaly Injection Sandbox             │
                    │  - Immutable Cryptographic Audit Log                   │
                    └────────────────────────────────────────────────────────┘
```

---

## ⚙️ 16 Core System Engines

| # | Engine | Responsibility |
|---|---|---|
| **1** | **Organization & Tenant Engine** | Multi-tenant organization scoping, geographic sites, teams, and device groups. |
| **2** | **Device Registry Engine** | Permanent master records, hardware serials, MAC/IP, and full lifecycle state machines (`REGISTERED` $\rightarrow$ `PROVISIONED` $\rightarrow$ `ACTIVE` $\rightarrow$ `SUSPECTED` $\rightarrow$ `QUARANTINED` $\rightarrow$ `REVOKED` $\rightarrow$ `DECOMMISSIONED`). |
| **3** | **Identity & PKI Engine** | Real X.509 Root CA (RSA-2048 / SHA-256), client CSR signing, short-lived 90-day certificates, and Certificate Revocation List (CRL) validation. |
| **4** | **Provisioning & Onboarding Engine** | Cryptographic zero-touch or approved enrollment, generating device private keys and client certs. |
| **5** | **Telemetry Ingestion Engine** | MQTT / WebSocket broker interface, JSON-schema validation per device type, and routing to time-series storage. |
| **6** | **Time-Series Storage Engine** | Timescale-compatible hypertable store with window rollups, tiered retention, and history indexing. |
| **7** | **Device Shadow / State Engine** | AWS IoT-style desired vs. reported state synchronization with automatic delta diff calculation. |
| **8** | **Anomaly Detection Engine (Tier 2 ML)** | Multivariate Isolation Forest, Autoencoder reconstruction loss, Mahalanobis distance, and SHAP explainability. |
| **9** | **Security Detection Engine** | Real-time detection of auth failures, certificate reuse across concurrent IPs, rogue topic spoofing, and replay attacks. |
| **10** | **Firmware & Patch Management Engine** | Version tracking, ECDSA/SHA-256 binary verification, CVE exposure scanning, and signed OTA campaigns. |
| **11** | **Incident & Case Management Engine** | Complete human workflow: `OPEN` $\rightarrow$ `TRIAGED` $\rightarrow$ `INVESTIGATING` $\rightarrow$ `RESOLVED` $\rightarrow$ `CLOSED` with analyst assignment and investigation notes. |
| **12** | **Response Playbook Engine** | Automated & human-in-the-loop playbooks (`QUARANTINE_DEVICE`, `REVOKE_CERTIFICATE`, `ROTATE_CERTIFICATE`, `FORCE_OTA_UPDATE`, `DISPATCH_TECHNICIAN`). |
| **13** | **Notification & Escalation Engine** | Real-time WebSocket event bus, live alert ticker, and incident escalation. |
| **14** | **Fleet Command & Reporting Engine** | Dark-mode SOC dashboard, interactive Leaflet geographic drilldown, live Recharts streaming charts, and health posture scores. |
| **15** | **RBAC & Access Control Engine** | Scoped role-based access (Super Admin, Security Analyst, Fleet Admin, Field Tech, Auditor). |
| **16** | **Immutable Cryptographic Audit Engine** | Tamper-evident append-only SHA-256 hash-chained log with one-click cryptographic chain integrity verification. |

---

## 🔐 Device Identity & Cryptographic PKI Core

NEXORA treats device identity with PKI rigor:
- **Never a shared password or fleet token**: Every device possesses its own unique X.509 certificate and private key.
- **Short-Lived Validity (90-Day Policy)**: Certificates have short validity windows with automated rotation alerts before expiration.
- **Transport Handshake Enforcement**: Certificate validation occurs at the TLS/mTLS layer before any telemetry or application frame is accepted.
- **Certificate Revocation List (CRL)**: Revoked certificates (`KEY_COMPROMISE`, `SUSPECTED_CLONING`, `ANOMALY_QUARANTINE`) are recorded in the CRL ledger and rejected immediately.
- **Concurrent IP / Cloned Credential Detection**: If the same certificate is presented from two disparate IP subnets within a 60-second window, the security engine raises a critical `CERT_REUSE` threat event.

---

## 🛡️ MQTT Broker & Strict Topic ACL Enforcement

The embedded broker enforces strict per-device topic namespaces:

```
Publishing Allowed:
org/{orgId}/site/{siteId}/device/{deviceId}/telemetry
org/{orgId}/site/{siteId}/device/{deviceId}/state/reported
org/{orgId}/site/{siteId}/device/{deviceId}/events

Subscribing Allowed:
org/{orgId}/site/{siteId}/device/{deviceId}/state/desired
org/{orgId}/site/{siteId}/device/{deviceId}/ota
org/{orgId}/site/{siteId}/device/{deviceId}/commands
```

- **Cross-Device Impersonation Blocked**: If Device `SOIL-N-001` attempts to publish to `SOIL-N-002`'s topic namespace, the broker ACL immediately rejects the packet, drops the connection, and logs a `ROGUE_TOPIC_ATTEMPT` security event.
- **Wildcards Prohibited**: Wildcards (`#`, `+`) are strictly denied for field nodes.

---

## 🔬 Two-Tier Anomaly Detection Pipeline

```
Incoming Telemetry Frame
         │
         ▼
┌───────────────────────────────────────────────┐
│   TIER 1: FAST INLINE RULE EVALUATION         │  (Microsecond latency)
│   • Schema bounds check (min/max)             │
│   • Physical rate-of-change (Δ/tick)          │
│   • Timestamp replay / future clock skew      │
│   • Frozen sensor check (zero natural jitter) │
└───────────────────────┬───────────────────────┘
                        │
                        ▼
┌───────────────────────────────────────────────┐
│   TIER 2: MULTIVARIATE BEHAVIORAL ML ENGINE   │  (Batch / Window evaluation)
│   • Multi-feature Isolation Forest scoring    │
│   • Peer fleet divergence across site nodes   │
│   • Gradual slope drift detection             │
│   • Model versioning (`v2.2.0-iforest`)       │
│   • Feature-level SHAP explainability         │
└───────────────────────┬───────────────────────┘
                        │
                        ▼
             Flagged AnomalyEvent
         (Score, Drivers, SHAP Matrix)
```

### SHAP Explainability Matrix
Every model-generated event provides exact percentage contributions per feature (e.g. `soil_moisture_pct` contributing 68.4%, `soil_temp_celsius` contributing 22.1%), allowing SOC analysts to inspect the physical root cause rather than relying on a black-box score.

---

## 🚨 Incident Response & Human-Gated Safety Playbooks

### Configurable Playbook Matrix

| Trigger Condition | Automated Action | Safety-Gated Action |
|---|---|---|
| Revoked certificate presented | Broker auto-drops connection | — |
| Extreme rate-of-change on passive sensor (soil probe) | Flag `SUSPECTED` + Open Incident | Analyst executes `Quarantine Node` |
| **High anomaly score on critical actuator (water valve)** | **Never auto-isolated** | **Requires human analyst digital sign-off** |
| Known CVE on outdated firmware | Flag non-compliant | Admin approves forced signed OTA push |
| Concurrent IP certificate cloning | Auto-alert SOC + Open Critical Case | Analyst triggers cert revocation & CRL update |

---

## 📦 Signed Firmware Catalog & OTA Compliance

- All firmware images require ECDSA / SHA-256 cryptographic signatures.
- Devices verify signatures in local secure element hardware before applying updates to dual partitions.
- Automated compliance scanner flags devices running legacy firmware versions exposed to known CVEs (e.g., `CVE-2025-41982`).

---

## 📜 Tamper-Evident SHA-256 Cryptographic Audit Ledger

Every security event, certificate issuance, rotation, revocation, state change, and playbook execution is appended to an immutable cryptographic ledger:

$$\text{Hash}_n = \text{SHA-256}(\text{ID}_n \parallel \text{Timestamp}_n \parallel \text{Actor}_n \parallel \text{Action}_n \parallel \text{Resource}_n \parallel \text{Details}_n \parallel \text{Hash}_{n-1})$$

The UI includes a **"Verify SHA-256 Chain Integrity"** button that recomputes every single block hash from root to leaf, providing instant mathematical proof that audit records have never been altered.

---

## 🧪 Interactive Attack Sandbox & Fleet Simulator

NEXORA includes a built-in interactive simulator running **~200 live devices across 3 distinct sites and schemas**:
1. **Farm Zone A (Salinas Valley Agritech)**: Agritech Multi-Depth Soil Probes (`soil_moisture_pct`, `soil_temp_celsius`, `soil_conductivity_us_cm`, `battery_pct`).
2. **Water Point Cluster B (Aqueduct Station 4)**: Precision Ultrasonic Flowmeters & Motorized Gate Actuators (`flow_rate_liters_min`, `line_pressure_psi`, `valve_aperture_pct`, `water_temp_c`).
3. **Smart Meter District C (Metro Grid Sector 9)**: Three-Phase Smart Power Meters (`active_power_kw`, `grid_voltage_v`, `current_amp`, `power_factor`, `frequency_hz`).

### One-Click Attack Triggers
- 📈 **Inject Sensor Drift**: Injects systematic slope drift to test Tier 2 ML Isolation Forest.
- ⚡ **Inject Extreme Outlier Spike**: Injects 340 PSI pressure spike violating Tier 1 bounds.
- ❄️ **Freeze Sensor Signals**: Simulates stuck sensor with zero natural jitter.
- 🔓 **Simulate Cloned Certificate Attack**: Presents client certificate concurrently from rogue IP `198.51.100.42`.
- 🔀 **Attempt Rogue Topic Publish**: Device A attempts publishing to Device B's namespace.

---

## 👥 Role-Based Access Control (RBAC)

Switch between pre-configured enterprise personas dynamically in the navbar:

| Persona | Role | Permissions |
|---|---|---|
| **Elena Rostova** | `SUPER_ADMIN` | Global platform administration, Root CA management, cross-tenant policy override. |
| **Marcus Vance** | `SECURITY_ANALYST` | Triage security events, investigate incidents, approve safety gates, execute response playbooks. |
| **Sarah Chen** | `FLEET_ADMIN` | Provision devices, manage firmware catalog, initiate signed OTA campaigns. |
| **Carlos Mendez** | `FIELD_TECHNICIAN` | Scoped to assigned sites (Farm Zone A, Water Cluster B), view work orders, close tickets. |
| **Compliance Auditor** | `AUDITOR` | Read-only access to cryptographic audit ledger and chain verification. |

---

## 📡 REST API & WebSocket Documentation

### REST Endpoints

```http
# Authentication & Users
GET  /api/auth/users
POST /api/auth/login

# Fleet & Devices
GET  /api/devices/stats                  # Overall KPI counts, threat index, health score
GET  /api/devices                        # Query devices (filters: siteId, state, typeId, search)
GET  /api/devices/:id                    # Single device deep dive (Identity, Shadow, Telemetry)
POST /api/devices                        # Provision new device & issue X.509 cert
PUT  /api/devices/:id/state              # Update lifecycle state (Quarantine, Reinstate)
PUT  /api/devices/:id/shadow             # Update desired shadow state
GET  /api/devices/meta/sites             # Get sites with node counts
GET  /api/devices/meta/types             # Get device types and schemas
POST /api/devices/meta/types             # Register new device type schema

# Incidents & Security Events
GET  /api/incidents                      # Filterable incident case queue
GET  /api/incidents/:id                  # Incident investigation deep dive
POST /api/incidents                      # Create manual incident
PUT  /api/incidents/:id/status           # Transition status (TRIAGED, INVESTIGATING, RESOLVED)
POST /api/incidents/:id/actions          # Execute response playbook action
POST /api/incidents/:id/actions/:actionId/approve # Human safety approval sign-off
POST /api/incidents/:id/comments         # Add analyst investigation note
GET  /api/incidents/events/security      # Security violation stream
GET  /api/incidents/events/anomalies     # ML anomaly stream with SHAP
POST /api/incidents/anomalies/:id/disposition # Analyst feedback (CONFIRMED_THREAT / FALSE_POSITIVE)

# PKI Certificate Authority
GET  /api/pki/root-ca                    # Root CA PEM, fingerprint, serial
GET  /api/pki/certificates               # Active issued certificate ledger
GET  /api/pki/crl                        # Certificate Revocation List
POST /api/pki/rotate                     # Rotate device certificate
POST /api/pki/revoke                     # Revoke certificate and append to CRL

# Firmware & OTA Management
GET  /api/firmware                       # Signed firmware catalog
GET  /api/firmware/compliance            # Fleet compliance score and CVE exposure summary
POST /api/firmware/ota                   # Launch signed OTA campaign

# Immutable Cryptographic Audit Log
GET  /api/audit?limit=100                # Fetch append-only audit trail
GET  /api/audit/verify                   # Verify SHA-256 hash chain mathematical integrity

# Attack Sandbox & Simulator
GET  /api/simulator/status
POST /api/simulator/start | /stop
POST /api/simulator/inject/drift
POST /api/simulator/inject/spike
POST /api/simulator/inject/freeze
POST /api/simulator/attack/cloned-cert
POST /api/simulator/attack/rogue-topic
POST /api/simulator/clear
```

### WebSocket Real-Time Bus (`ws://localhost:4000/ws`)
- Broadcasts real-time events: `TELEMETRY_STREAM`, `DEVICE_CONNECTED`, `SECURITY_EVENT`, `ANOMALY_FLAGGED`, `INCIDENT_UPDATED`.

---

## 🚀 Quickstart & Local Installation

### Prerequisites
- **Node.js**: v18.0.0+ (v20 or v22 recommended)
- **npm**: v9.0.0+

### Step 1: Clone and Install
```bash
git clone https://github.com/your-org/nexora.git
cd nexora
npm install
```

### Step 2: Run in Development Mode
```bash
# Starts both the backend engine (port 4000) and Vite frontend (port 5173) with hot-reloading:
npm run dev
```

### Step 3: Run Production Build
```bash
# Builds server & frontend bundle, and launches on http://localhost:4000
npm run build
npm start
```
Open [http://localhost:4000](http://localhost:4000) in your browser.

---

## 🌐 Production & Vercel Deployment Guide

Please consult [`deploymentfix.md`](file:///c:/Users/franc/OneDrive/Documents/Projects/nexora/deploymentfix.md) for full deployment details.

### Vercel Deployment (Frontend)
1. Import the repository into **Vercel**.
2. Settings:
   - **Framework Preset**: `Vite`
   - **Build Command**: `npm run build:client`
   - **Output Directory**: `client/dist`
3. Optional Environment Variables:
   - `VITE_API_URL`: Your backend API URL (e.g., `https://nexora-api.onrender.com`)
   - `VITE_WS_URL`: Your WebSocket URL (e.g., `wss://nexora-api.onrender.com/ws`)
4. Click **Deploy**.

### Docker Deployment (Full Stack)
```bash
docker build -t nexora-platform .
docker run -p 4000:4000 nexora-platform
```

---

## 🔒 Security & Compliance Standard

NEXORA architecture adheres to:
- **OWASP IoT Top 10**: Mitigates weak credentials (enforces mTLS), insecure network services (per-device ACLs), and unauthenticated update mechanisms (cryptographic ECDSA OTA verification).
- **Zero Trust Architecture**: Never trusts self-reported device identifiers; the certificate is the cryptographic identity.
- **Human-in-the-Loop Safety**: Physically consequential actions on actuators require authorized analyst digital sign-off.

---

<div align="center">
  <sub>Built with ❤️ for Mission-Critical IoT Security & Observability. NEXORA Platform.</sub>
</div>
