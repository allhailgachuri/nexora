import React, { useState, useEffect, useRef } from 'react';
import {
  Shield,
  Radio,
  Lock,
  KeyRound,
  BrainCircuit,
  AlertTriangle,
  Server,
  ScrollText,
  Crosshair,
  ArrowRight,
  CheckCircle2,
  Activity,
  ChevronRight,
  Layers,
  Sparkles,
  Database,
  Sliders,
  Cpu,
  Fingerprint,
  RefreshCw,
  Terminal,
  Zap,
  Globe,
  Award,
  Check
} from 'lucide-react';
import { TabType } from '../layout/Sidebar';
import { FleetStats } from '../../types';

interface LandingPageProps {
  onEnterApp: (tab?: TabType) => void;
  stats: FleetStats | null;
  wsConnected: boolean;
}

export const LandingPage: React.FC<LandingPageProps> = ({ onEnterApp, stats, wsConnected }) => {
  const [simulatingAttack, setSimulatingAttack] = useState<string | null>(null);
  const [simFeedback, setSimFeedback] = useState<string | null>(null);
  const [activeSector, setActiveSector] = useState<'agritech' | 'water' | 'energy'>('agritech');

  const handleSimulate = (name: string, description: string) => {
    setSimulatingAttack(name);
    setSimFeedback(`Injecting synthetic telemetry packet for ${name}...`);
    setTimeout(() => {
      setSimFeedback(`✓ Tier 1 Rate Limiter & Tier 2 Isolation Forest flagged anomaly (Latency: 2.8ms, SHAP Attribution: 95.4%).`);
      setTimeout(() => {
        setSimulatingAttack(null);
      }, 3500);
    }, 1100);
  };

  return (
    <div className="min-h-screen bg-[#111614] text-[#F4F2EC] font-sans selection:bg-[#CC5833]/30 selection:text-[#F4F2EC] overflow-x-hidden">
      {/* 1. Header Navigation Bar (Apple & Clinical Boutique floating pill header) */}
      <header className="sticky top-0 z-50 px-4 sm:px-8 pt-4 pb-2">
        <div className="max-w-7xl mx-auto rounded-full bg-[#171C19]/80 backdrop-blur-2xl border border-[#2E4036]/80 px-4 sm:px-6 h-16 flex items-center justify-between shadow-organic-card">
          {/* Brand Identity */}
          <div className="flex items-center gap-3 cursor-pointer" onClick={() => onEnterApp('overview')}>
            <div className="w-9 h-9 rounded-full bg-gradient-to-br from-[#2E4036] to-[#142019] border border-[#708A7C]/40 p-1.5 flex items-center justify-center shadow-sm">
              <img src="/nexora.png" alt="NEXORA Logo" className="w-full h-full object-contain" />
            </div>
            <div className="flex items-center gap-2">
              <span className="text-base font-bold tracking-tight text-white font-sans">NEXORA</span>
              <span className="hidden sm:inline-block text-[10px] uppercase font-mono tracking-wider px-2 py-0.5 rounded-full bg-[#2E4036]/60 text-[#9DB3A6] border border-[#2E4036]">
                Clinical Boutique
              </span>
            </div>
          </div>

          {/* Center Nav Links */}
          <nav className="hidden md:flex items-center gap-8 text-xs font-medium text-[#94A39B]">
            <a href="#features" className="hover:text-white transition-colors">Capabilities</a>
            <a href="#architecture" className="hover:text-white transition-colors">Zero-Trust PKI</a>
            <a href="#ml-detection" className="hover:text-white transition-colors">Behavioral ML</a>
            <a href="#sectors" className="hover:text-white transition-colors">Sectors</a>
            <a href="#sandbox-demo" className="hover:text-white transition-colors">Live Sandbox</a>
          </nav>

          {/* Right Action & Live Beacon */}
          <div className="flex items-center gap-3">
            <div className="hidden sm:flex items-center gap-2 px-3 py-1 rounded-full border border-[#2E4036] bg-[#142019]/90 text-[11px] font-mono text-[#9DB3A6]">
              <span className={`w-2 h-2 rounded-full ${wsConnected ? 'bg-[#30D158] animate-pulse' : 'bg-[#E85D04]'}`} />
              <span>{stats?.totalDevices || 200} Nodes Active</span>
            </div>

            <button
              onClick={() => onEnterApp('overview')}
              className="magnetic-btn group inline-flex items-center gap-2 px-5 py-2 rounded-full bg-[#CC5833] hover:bg-[#B54926] text-white font-semibold text-xs shadow-clay-glow transition-all"
            >
              <span>Launch Command Center</span>
              <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
            </button>
          </div>
        </div>
      </header>

      {/* 2. Hero Section: "[Concept noun] is the" / "[Power word]." */}
      <section className="relative pt-20 pb-28 md:pt-28 md:pb-36 overflow-hidden">
        {/* Ambient organic forest and clay glows */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[380px] bg-[#2E4036]/25 rounded-full blur-[160px] pointer-events-none" />
        <div className="absolute top-1/3 left-1/4 w-[450px] h-[280px] bg-[#CC5833]/15 rounded-full blur-[140px] pointer-events-none" />

        <div className="max-w-5xl mx-auto px-4 sm:px-6 text-center relative z-10">
          {/* Top Pill Tag */}
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#171C19]/90 border border-[#2E4036] text-xs font-medium text-[#9DB3A6] shadow-sm mb-10 hover-lift">
            <span className="flex h-2 w-2 rounded-full bg-[#CC5833] animate-ping" />
            <span>Organic Tech IoT Observability & Zero-Trust Defense</span>
            <ChevronRight className="w-3.5 h-3.5 text-[#CC5833]" />
          </div>

          {/* Hero Headline Pattern */}
          <h1 className="text-4xl sm:text-6xl md:text-7xl font-sans font-bold tracking-tight text-white leading-[1.06] max-w-4xl mx-auto">
            Behavioral telemetry is the{' '}
            <span className="font-drama font-normal text-[#F4F2EC] tracking-normal block sm:inline text-5xl sm:text-7xl md:text-8xl">
              Immunity.
            </span>
          </h1>

          {/* Subtitle */}
          <p className="mt-8 text-base sm:text-lg text-[#94A39B] max-w-2xl mx-auto font-normal leading-relaxed">
            Eliminate shared credentials with short-lived mutual TLS, enforce strict MQTT topic namespaces, and decode sensor anomalies with explainable multivariate machine learning.
          </p>

          {/* Hero CTAs (Magnetic Pill Buttons) */}
          <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
            <button
              onClick={() => onEnterApp('overview')}
              className="magnetic-btn w-full sm:w-auto px-8 py-4 rounded-full bg-[#F4F2EC] hover:bg-white text-[#111614] font-bold text-sm shadow-xl flex items-center justify-center gap-2.5 transition-all"
            >
              <span>Enter SOC Command Center</span>
              <ArrowRight className="w-4 h-4 text-[#111614]" />
            </button>

            <button
              onClick={() => onEnterApp('sandbox')}
              className="magnetic-btn w-full sm:w-auto px-7 py-4 rounded-full border border-[#2E4036] bg-[#171C19]/80 hover:bg-[#1E2622] text-[#F4F2EC] font-semibold text-sm flex items-center justify-center gap-2 transition-all"
            >
              <Crosshair className="w-4 h-4 text-[#CC5833]" />
              <span>Explore Attack Sandbox</span>
            </button>
          </div>

          {/* Hero Interactive Instrument Preview Showcase */}
          <div className="relative mt-20 max-w-5xl mx-auto">
            {/* Top Left Floating Pill */}
            <div className="hidden md:flex absolute -top-5 -left-6 z-20 items-center gap-3 px-4 py-2.5 rounded-2xl bg-[#171C19]/90 border border-[#2E4036] shadow-organic-card backdrop-blur-xl text-xs hover-lift">
              <div className="w-8 h-8 rounded-xl bg-[#2E4036]/60 border border-[#708A7C]/40 flex items-center justify-center text-[#9DB3A6]">
                <Fingerprint className="w-4 h-4 text-[#30D158]" />
              </div>
              <div className="text-left">
                <p className="font-semibold text-white">mTLS X.509</p>
                <p className="text-[10px] text-[#30D158] font-mono">2048-bit RSA Active</p>
              </div>
            </div>

            {/* Top Right Floating Pill */}
            <div className="hidden md:flex absolute -top-5 -right-6 z-20 items-center gap-3 px-4 py-2.5 rounded-2xl bg-[#171C19]/90 border border-[#2E4036] shadow-organic-card backdrop-blur-xl text-xs hover-lift">
              <div className="w-8 h-8 rounded-xl bg-[#CC5833]/20 border border-[#CC5833]/40 flex items-center justify-center text-[#CC5833]">
                <BrainCircuit className="w-4 h-4" />
              </div>
              <div className="text-left">
                <p className="font-semibold text-white">Isolation Forest ML</p>
                <p className="text-[10px] text-[#CC5833] font-mono">SHAP: 95.4% Precision</p>
              </div>
            </div>

            {/* Main Instrument Preview Card */}
            <div className="rounded-[2.5rem] border border-[#2E4036]/80 bg-gradient-to-b from-[#171C19] to-[#111614] p-3 sm:p-6 shadow-organic-hover overflow-hidden">
              {/* Window Header */}
              <div className="flex items-center justify-between px-4 py-3 border-b border-[#26372E] text-xs text-[#94A39B]">
                <div className="flex items-center gap-2">
                  <div className="flex gap-2">
                    <span className="w-3 h-3 rounded-full bg-[#CC5833]/80 inline-block" />
                    <span className="w-3 h-3 rounded-full bg-[#708A7C]/80 inline-block" />
                    <span className="w-3 h-3 rounded-full bg-[#30D158]/80 inline-block" />
                  </div>
                  <span className="font-mono text-[11px] text-[#708A7C] ml-3">nexora.network/command-hub</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-[#30D158] animate-pulse" />
                  <span className="text-[11px] font-mono text-[#30D158]">TELEMETRY BUS ENCRYPTED</span>
                </div>
              </div>

              {/* Showcase Inner Metrics Grid */}
              <div className="p-4 sm:p-6 grid grid-cols-1 md:grid-cols-3 gap-4 text-left">
                {/* Metric 1 */}
                <div className="p-5 rounded-[1.75rem] border border-[#26372E] bg-[#142019]/80">
                  <div className="flex items-center justify-between text-xs text-[#94A39B]">
                    <span>Fleet Nodes Online</span>
                    <Server className="w-4 h-4 text-[#708A7C]" />
                  </div>
                  <div className="mt-3 flex items-baseline gap-2">
                    <span className="text-3xl font-bold font-mono text-white">{stats?.activeDevices || 184}</span>
                    <span className="text-xs text-[#708A7C]">/ {stats?.totalDevices || 200} total</span>
                  </div>
                  <div className="w-full bg-[#26372E] rounded-full h-1.5 mt-4">
                    <div className="bg-[#30D158] h-1.5 rounded-full" style={{ width: '92%' }} />
                  </div>
                </div>

                {/* Metric 2 */}
                <div className="p-5 rounded-[1.75rem] border border-[#26372E] bg-[#142019]/80">
                  <div className="flex items-center justify-between text-xs text-[#94A39B]">
                    <span>Threat Posture</span>
                    <Shield className="w-4 h-4 text-[#CC5833]" />
                  </div>
                  <div className="mt-3 flex items-baseline gap-2">
                    <span className="text-3xl font-bold font-mono text-[#CC5833]">{stats?.threatLevel || 'ELEVATED'}</span>
                    <span className="text-xs text-[#94A39B]">({stats?.openIncidents || 3} Gated)</span>
                  </div>
                  <p className="text-[11px] text-[#708A7C] mt-3">All unauthenticated packets dropped at TLS layer.</p>
                </div>

                {/* Metric 3 */}
                <div className="p-5 rounded-[1.75rem] border border-[#26372E] bg-[#142019]/80">
                  <div className="flex items-center justify-between text-xs text-[#94A39B]">
                    <span>PKI Root Trust</span>
                    <KeyRound className="w-4 h-4 text-[#30D158]" />
                  </div>
                  <div className="mt-3 flex items-baseline gap-2">
                    <span className="text-3xl font-bold font-mono text-[#30D158]">100%</span>
                    <span className="text-xs text-[#708A7C]">mTLS Verified</span>
                  </div>
                  <p className="text-[11px] text-[#708A7C] mt-3">RSA 2048-bit with active 90-day automated rollover.</p>
                </div>

                {/* Interactive Stream Banner inside Showcase */}
                <div className="md:col-span-3 p-5 rounded-[1.75rem] border border-[#2E4036] bg-gradient-to-r from-[#171C19] via-[#1C2B22] to-[#171C19] flex flex-col sm:flex-row items-center justify-between gap-4">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-2xl bg-[#CC5833]/15 border border-[#CC5833]/30 flex items-center justify-center text-[#CC5833] shrink-0">
                      <BrainCircuit className="w-5 h-5" />
                    </div>
                    <div>
                      <h4 className="text-sm font-semibold text-white">Multivariate Isolation Forest & SHAP Stream</h4>
                      <p className="text-xs text-[#94A39B] mt-0.5">Continuous telemetry scoring with microsecond rate filtering and explainable root causes.</p>
                    </div>
                  </div>
                  <button
                    onClick={() => onEnterApp('ml-anomalies')}
                    className="magnetic-btn px-5 py-2.5 rounded-full bg-[#CC5833] hover:bg-[#B54926] text-white text-xs font-bold shrink-0 transition-colors"
                  >
                    Open ML Hub
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 3. Cryptographic Standards Trust Bar */}
      <section className="py-16 border-y border-[#26372E]/60 bg-[#142019]/60">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <p className="text-center text-[11px] font-mono uppercase tracking-widest text-[#708A7C] mb-8">
            Engineered According to Open Cryptographic & Industrial Telemetry Standards
          </p>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-4 items-center justify-center text-center">
            <div className="p-4 rounded-2xl border border-[#2E4036] bg-[#171C19] text-xs font-mono">
              <span className="text-[#30D158] font-bold block mb-1">RFC 5280</span>
              <span className="text-[#94A39B] text-[11px]">X.509 Authority</span>
            </div>
            <div className="p-4 rounded-2xl border border-[#2E4036] bg-[#171C19] text-xs font-mono">
              <span className="text-[#2997FF] font-bold block mb-1">MQTT 5.0</span>
              <span className="text-[#94A39B] text-[11px]">Strict Topic ACLs</span>
            </div>
            <div className="p-4 rounded-2xl border border-[#2E4036] bg-[#171C19] text-xs font-mono">
              <span className="text-[#CC5833] font-bold block mb-1">ML Engine</span>
              <span className="text-[#94A39B] text-[11px]">Isolation Forest</span>
            </div>
            <div className="p-4 rounded-2xl border border-[#2E4036] bg-[#171C19] text-xs font-mono">
              <span className="text-[#E85D04] font-bold block mb-1">OWASP</span>
              <span className="text-[#94A39B] text-[11px]">IoT Top 10</span>
            </div>
            <div className="p-4 rounded-2xl border border-[#2E4036] bg-[#171C19] text-xs font-mono">
              <span className="text-[#708A7C] font-bold block mb-1">SHA-256</span>
              <span className="text-[#94A39B] text-[11px]">Tamper Ledger</span>
            </div>
            <div className="p-4 rounded-2xl border border-[#2E4036] bg-[#171C19] text-xs font-mono">
              <span className="text-[#E30000] font-bold block mb-1">ECDSA</span>
              <span className="text-[#94A39B] text-[11px]">Signed Dual-OTA</span>
            </div>
          </div>
        </div>
      </section>

      {/* 4. Core Feature Pillars Grid (Clinical Boutique 6-Card Grid) */}
      <section id="features" className="py-28 max-w-6xl mx-auto px-4 sm:px-6">
        <div className="text-center max-w-3xl mx-auto mb-20">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#2E4036]/60 border border-[#708A7C]/40 text-[#9DB3A6] text-xs font-semibold mb-4">
            <Layers className="w-3.5 h-3.5 text-[#CC5833]" />
            <span>Comprehensive Fleet Protection</span>
          </div>
          <h2 className="text-3xl sm:text-5xl font-sans font-bold text-white tracking-tight leading-tight">
            Engineered for critical fleets.
          </h2>
          <p className="mt-4 text-[#94A39B] text-base font-normal">
            Every layer—from hardware certificate issuance to real-time physical actuator safety gating—is designed with mathematical rigor.
          </p>
        </div>

        {/* 6 Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Card 1: PKI & Identity */}
          <div
            onClick={() => onEnterApp('pki')}
            className="organic-glass-card group cursor-pointer p-7 flex flex-col justify-between hover:border-[#CC5833]/50"
          >
            <div>
              <div className="w-12 h-12 rounded-2xl bg-[#2E4036] border border-[#708A7C]/40 flex items-center justify-center text-[#30D158] mb-6 group-hover:scale-105 transition-transform">
                <KeyRound className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-white group-hover:text-[#F4F2EC] transition-colors">
                X.509 PKI & Identity Layer
              </h3>
              <p className="text-xs text-[#94A39B] mt-2.5 leading-relaxed">
                Short-lived 2048-bit RSA client certificates eliminate static passwords and enforce non-repudiation at the TLS handshake.
              </p>
            </div>
            <div className="mt-6 p-3.5 rounded-2xl bg-[#142019] border border-[#26372E] text-[11px] font-mono space-y-1.5">
              <div className="flex justify-between text-[#94A39B]">
                <span>Cert Subject:</span>
                <span className="text-[#9DB3A6]">CN=soil-04</span>
              </div>
              <div className="flex justify-between text-[#94A39B]">
                <span>Validity:</span>
                <span className="text-[#30D158]">90-Day Policy (Active)</span>
              </div>
            </div>
          </div>

          {/* Card 2: MQTT Topic ACLs */}
          <div
            onClick={() => onEnterApp('schemas')}
            className="organic-glass-card group cursor-pointer p-7 flex flex-col justify-between hover:border-[#CC5833]/50"
          >
            <div>
              <div className="w-12 h-12 rounded-2xl bg-[#2E4036] border border-[#708A7C]/40 flex items-center justify-center text-[#2997FF] mb-6 group-hover:scale-105 transition-transform">
                <Lock className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-white group-hover:text-[#F4F2EC] transition-colors">
                Strict Broker Topic ACLs
              </h3>
              <p className="text-xs text-[#94A39B] mt-2.5 leading-relaxed">
                Regex-level topic namespace isolation strictly binds each node to its tenant path, rejecting cross-site spoofing immediately.
              </p>
            </div>
            <div className="mt-6 p-3.5 rounded-2xl bg-[#142019] border border-[#26372E] text-[11px] font-mono space-y-1.5">
              <div className="text-[#94A39B] truncate">path: org/salinas/device/soil-04</div>
              <div className="flex items-center gap-1 text-[#30D158] font-bold">
                <Check className="w-3.5 h-3.5" />
                <span>ACL Rule Matched</span>
              </div>
            </div>
          </div>

          {/* Card 3: Two-Tier ML Engine */}
          <div
            onClick={() => onEnterApp('ml-anomalies')}
            className="organic-glass-card group cursor-pointer p-7 flex flex-col justify-between hover:border-[#CC5833]/50"
          >
            <div>
              <div className="w-12 h-12 rounded-2xl bg-[#2E4036] border border-[#708A7C]/40 flex items-center justify-center text-[#CC5833] mb-6 group-hover:scale-105 transition-transform">
                <BrainCircuit className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-white group-hover:text-[#F4F2EC] transition-colors">
                Multivariate ML & SHAP
              </h3>
              <p className="text-xs text-[#94A39B] mt-2.5 leading-relaxed">
                Combines microsecond rate-of-change filters with Isolation Forest scoring and feature-level SHAP vector explanations.
              </p>
            </div>
            <div className="mt-6 p-3.5 rounded-2xl bg-[#142019] border border-[#26372E] text-[11px] font-mono space-y-2">
              <div className="flex justify-between text-xs">
                <span className="text-[#94A39B]">soil_moisture_pct</span>
                <span className="text-[#CC5833] font-bold">68.4% SHAP</span>
              </div>
              <div className="w-full bg-[#26372E] rounded-full h-1.5">
                <div className="bg-[#CC5833] h-1.5 rounded-full" style={{ width: '68.4%' }} />
              </div>
            </div>
          </div>

          {/* Card 4: Device State Shadow */}
          <div
            onClick={() => onEnterApp('devices')}
            className="organic-glass-card group cursor-pointer p-7 flex flex-col justify-between hover:border-[#CC5833]/50"
          >
            <div>
              <div className="w-12 h-12 rounded-2xl bg-[#2E4036] border border-[#708A7C]/40 flex items-center justify-center text-[#708A7C] mb-6 group-hover:scale-105 transition-transform">
                <Sliders className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-white group-hover:text-[#F4F2EC] transition-colors">
                Device State Shadow Sync
              </h3>
              <p className="text-xs text-[#94A39B] mt-2.5 leading-relaxed">
                Bi-directional synchronization between desired configuration and reported hardware states with instant delta tracking.
              </p>
            </div>
            <div className="mt-6 p-3.5 rounded-2xl bg-[#142019] border border-[#26372E] text-[11px] font-mono space-y-1.5">
              <div className="flex justify-between text-[#94A39B]">
                <span>valve_aperture:</span>
                <span className="text-[#9DB3A6]">45% (Synced)</span>
              </div>
              <div className="text-[10px] text-[#30D158]">✓ Delta: 0.0% (In Sync)</div>
            </div>
          </div>

          {/* Card 5: Human-Gated Safety Gates */}
          <div
            onClick={() => onEnterApp('incidents')}
            className="organic-glass-card group cursor-pointer p-7 flex flex-col justify-between hover:border-[#CC5833]/50"
          >
            <div>
              <div className="w-12 h-12 rounded-2xl bg-[#2E4036] border border-[#708A7C]/40 flex items-center justify-center text-[#E85D04] mb-6 group-hover:scale-105 transition-transform">
                <AlertTriangle className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-white group-hover:text-[#F4F2EC] transition-colors">
                Human-in-the-Loop Safety Gates
              </h3>
              <p className="text-xs text-[#94A39B] mt-2.5 leading-relaxed">
                Automated quarantine on passive sensors, but strictly requires explicit digital signature sign-off before actuating valves or breakers.
              </p>
            </div>
            <div className="mt-6 p-3.5 rounded-2xl bg-[#142019] border border-[#26372E] text-[11px] font-mono space-y-1">
              <div className="text-[#E85D04] font-semibold">GATE: CANAL_VALVE_CLOSE</div>
              <div className="text-[10px] text-[#94A39B]">Digital Signature Authorization Required</div>
            </div>
          </div>

          {/* Card 6: SHA-256 Immutable Audit Ledger */}
          <div
            onClick={() => onEnterApp('audit')}
            className="organic-glass-card group cursor-pointer p-7 flex flex-col justify-between hover:border-[#CC5833]/50"
          >
            <div>
              <div className="w-12 h-12 rounded-2xl bg-[#2E4036] border border-[#708A7C]/40 flex items-center justify-center text-[#30D158] mb-6 group-hover:scale-105 transition-transform">
                <ScrollText className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-white group-hover:text-[#F4F2EC] transition-colors">
                SHA-256 Tamper Ledger
              </h3>
              <p className="text-xs text-[#94A39B] mt-2.5 leading-relaxed">
                Cryptographic hash chain logs every security incident, cert rotation, and incident action with 1-click verification.
              </p>
            </div>
            <div className="mt-6 p-3.5 rounded-2xl bg-[#142019] border border-[#26372E] text-[11px] font-mono space-y-1">
              <div className="text-[#94A39B] truncate">Hash: 8f3c9a...71e0</div>
              <div className="text-[10px] text-[#30D158]">✓ Chain Integrity Verified</div>
            </div>
          </div>
        </div>
      </section>

      {/* 5. Editorial Quote Banner (Programa & Mercury aesthetic) */}
      <section className="py-24 border-y border-[#26372E] bg-gradient-to-r from-[#142019] via-[#171C19] to-[#142019] relative">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 text-center">
          <span className="text-[#CC5833] text-5xl font-drama block mb-2">“</span>
          <blockquote className="text-2xl sm:text-3xl md:text-4xl font-drama text-[#F4F2EC] leading-snug">
            NEXORA transforms vulnerable distributed IoT sensors into self-defending digital instruments with mathematically provable cryptographic identity and sub-second anomaly mitigation.
          </blockquote>
          <p className="mt-6 text-xs font-mono uppercase tracking-widest text-[#708A7C]">
            — Enterprise Mission-Critical Fleet Mandate
          </p>
        </div>
      </section>

      {/* 6. Deep Dive Feature Spotlights */}
      <section id="architecture" className="py-28 max-w-6xl mx-auto px-4 sm:px-6 space-y-32">
        {/* Spotlight 1: mTLS Zero-Trust */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#2E4036]/60 border border-[#708A7C]/40 text-[#9DB3A6] text-xs font-semibold mb-4">
              <Lock className="w-3.5 h-3.5 text-[#30D158]" />
              <span>Zero-Trust Transport</span>
            </div>
            <h3 className="text-3xl sm:text-4xl font-sans font-bold text-white leading-tight">
              Cryptographic identity from edge to cloud.
            </h3>
            <p className="mt-5 text-[#94A39B] text-sm leading-relaxed">
              Every node is provisioned with a unique, short-lived X.509 client certificate generated by our integrated PKI authority. If a certificate expires, is revoked, or is presented from an unauthorized IP, the MQTT broker drops the TLS handshake immediately.
            </p>
            <ul className="mt-6 space-y-3 text-xs text-[#CBD4CF]">
              <li className="flex items-center gap-2.5">
                <CheckCircle2 className="w-4 h-4 text-[#30D158] shrink-0" />
                <span>Zero shared passwords or static API keys stored on flash memory</span>
              </li>
              <li className="flex items-center gap-2.5">
                <CheckCircle2 className="w-4 h-4 text-[#30D158] shrink-0" />
                <span>Automated 90-day key rollover with zero telemetric downtime</span>
              </li>
              <li className="flex items-center gap-2.5">
                <CheckCircle2 className="w-4 h-4 text-[#30D158] shrink-0" />
                <span>Integrated CRL revocation list checked on every single connection</span>
              </li>
            </ul>
            <button
              onClick={() => onEnterApp('pki')}
              className="magnetic-btn mt-8 px-6 py-3 rounded-full bg-[#171C19] border border-[#2E4036] hover:bg-[#1E2622] text-[#9DB3A6] text-xs font-bold flex items-center gap-2 transition-all"
            >
              <span>Inspect PKI Certificate Authority</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Visual Box */}
          <div className="rounded-[2rem] border border-[#2E4036] bg-[#142019] p-6 shadow-organic-card font-mono text-xs">
            <div className="flex items-center justify-between border-b border-[#26372E] pb-3 mb-4 text-[#94A39B]">
              <span>X.509 Certificate Inspector</span>
              <span className="text-[#30D158] text-[10px]">VERIFIED</span>
            </div>
            <div className="space-y-3 text-[11px]">
              <div className="p-3 rounded-xl bg-[#111614] border border-[#26372E]">
                <span className="text-[#708A7C] block text-[10px]">SUBJECT DISTINGUISHED NAME</span>
                <span className="text-[#F4F2EC]">CN=dev-agri-004, O=Nexora, OU=Salinas-Agri</span>
              </div>
              <div className="p-3 rounded-xl bg-[#111614] border border-[#26372E]">
                <span className="text-[#708A7C] block text-[10px]">ISSUER AUTHORITY</span>
                <span className="text-white">Nexora Root CA (G1) [2048-bit RSA]</span>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div className="p-3 rounded-xl bg-[#111614] border border-[#26372E]">
                  <span className="text-[#708A7C] block text-[10px]">TOPIC SAN</span>
                  <span className="text-[#9DB3A6]">org/salinas/*</span>
                </div>
                <div className="p-3 rounded-xl bg-[#111614] border border-[#26372E]">
                  <span className="text-[#708A7C] block text-[10px]">EXPIRATION</span>
                  <span className="text-[#E85D04]">90 Days (Auto)</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Spotlight 2: Explainable ML Detection */}
        <div id="ml-detection" className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          {/* Visual Box on Left */}
          <div className="order-2 lg:order-1 rounded-[2rem] border border-[#2E4036] bg-[#142019] p-6 shadow-organic-card font-mono text-xs">
            <div className="flex items-center justify-between border-b border-[#26372E] pb-3 mb-4 text-[#94A39B]">
              <span>SHAP Feature Attribution Matrix</span>
              <span className="text-[#CC5833] text-[10px]">ISOLATION FOREST</span>
            </div>
            <div className="space-y-3.5 text-[11px]">
              <div>
                <div className="flex justify-between text-[#F4F2EC] mb-1.5">
                  <span>soil_moisture_pct (Drift +48%)</span>
                  <span className="text-[#CC5833] font-bold">68.4%</span>
                </div>
                <div className="w-full bg-[#26372E] rounded-full h-2">
                  <div className="bg-[#CC5833] h-2 rounded-full" style={{ width: '68.4%' }} />
                </div>
              </div>

              <div>
                <div className="flex justify-between text-[#F4F2EC] mb-1.5">
                  <span>soil_temp_celsius (Variance)</span>
                  <span className="text-[#708A7C] font-bold">22.1%</span>
                </div>
                <div className="w-full bg-[#26372E] rounded-full h-2">
                  <div className="bg-[#708A7C] h-2 rounded-full" style={{ width: '22.1%' }} />
                </div>
              </div>

              <div>
                <div className="flex justify-between text-[#F4F2EC] mb-1.5">
                  <span>battery_voltage (Nominal)</span>
                  <span className="text-[#64726A] font-bold">9.5%</span>
                </div>
                <div className="w-full bg-[#26372E] rounded-full h-2">
                  <div className="bg-[#434E48] h-2 rounded-full" style={{ width: '9.5%' }} />
                </div>
              </div>
            </div>
            <div className="mt-5 p-3 rounded-xl bg-[#CC5833]/15 border border-[#CC5833]/30 text-[11px] text-[#F4F2EC]">
              ✓ Root Cause Verified: Irrigation line pressure deviation detected.
            </div>
          </div>

          <div className="order-1 lg:order-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#2E4036]/60 border border-[#708A7C]/40 text-[#9DB3A6] text-xs font-semibold mb-4">
              <BrainCircuit className="w-3.5 h-3.5 text-[#CC5833]" />
              <span>Explainable AI Defense</span>
            </div>
            <h3 className="text-3xl sm:text-4xl font-sans font-bold text-white leading-tight">
              No black-box alerts. Total mathematical clarity.
            </h3>
            <p className="mt-5 text-[#94A39B] text-sm leading-relaxed">
              Traditional anomaly detectors deliver opaque scores. NEXORA pairs microsecond Tier 1 rule filters with Tier 2 Multivariate Isolation Forest scoring equipped with feature-level SHAP attribution vectors, enabling SOC analysts to isolate the physical cause in seconds.
            </p>
            <button
              onClick={() => onEnterApp('ml-anomalies')}
              className="magnetic-btn mt-8 px-6 py-3 rounded-full bg-[#171C19] border border-[#2E4036] hover:bg-[#1E2622] text-[#9DB3A6] text-xs font-bold flex items-center gap-2 transition-all"
            >
              <span>Explore ML Anomaly Engine</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </section>

      {/* 7. Industry Deployment Showcase (3 Sectors) */}
      <section id="sectors" className="py-28 border-t border-[#26372E] bg-[#142019]/70">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <span className="text-xs font-mono uppercase tracking-widest text-[#708A7C]">Production Deployments</span>
            <h2 className="text-3xl sm:text-5xl font-sans font-bold text-white mt-2">
              Securing critical infrastructure.
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Sector 1: Agritech */}
            <div className="organic-glass-card p-6 flex flex-col justify-between">
              <div>
                <span className="text-[10px] font-mono px-2.5 py-1 rounded-full bg-[#2E4036] text-[#30D158] border border-[#708A7C]/30">
                  AGRITECH FLEET
                </span>
                <h4 className="text-lg font-bold text-white mt-4">Salinas Valley Probes</h4>
                <p className="text-xs text-[#94A39B] mt-2 leading-relaxed">
                  200+ Multi-depth capacitive soil sensors tracking moisture, salinity, and battery health over LoRaWAN & LTE-M.
                </p>
              </div>
              <div className="mt-8 pt-4 border-t border-[#26372E] text-[11px] font-mono text-[#CBD4CF] flex justify-between items-center">
                <span>Threat: NOMINAL</span>
                <span className="text-[#30D158]">98.4% Health</span>
              </div>
            </div>

            {/* Sector 2: Water Utilities */}
            <div className="organic-glass-card p-6 flex flex-col justify-between">
              <div>
                <span className="text-[10px] font-mono px-2.5 py-1 rounded-full bg-[#2E4036] text-[#2997FF] border border-[#708A7C]/30">
                  WATER UTILITIES
                </span>
                <h4 className="text-lg font-bold text-white mt-4">Aqueduct Station 4</h4>
                <p className="text-xs text-[#94A39B] mt-2 leading-relaxed">
                  Precision ultrasonic flowmeters and motorized canal gates with human-in-the-loop safety sign-off gates.
                </p>
              </div>
              <div className="mt-8 pt-4 border-t border-[#26372E] text-[11px] font-mono text-[#CBD4CF] flex justify-between items-center">
                <span>Threat: ELEVATED</span>
                <span className="text-[#E85D04]">Gate Active</span>
              </div>
            </div>

            {/* Sector 3: Smart Grid */}
            <div className="organic-glass-card p-6 flex flex-col justify-between">
              <div>
                <span className="text-[10px] font-mono px-2.5 py-1 rounded-full bg-[#2E4036] text-[#CC5833] border border-[#708A7C]/30">
                  ENERGY GRID
                </span>
                <h4 className="text-lg font-bold text-white mt-4">Metro Grid Sector 9</h4>
                <p className="text-xs text-[#94A39B] mt-2 leading-relaxed">
                  Three-phase smart electricity meters monitoring active power, voltage stability, and line impedance anomalies.
                </p>
              </div>
              <div className="mt-8 pt-4 border-t border-[#26372E] text-[11px] font-mono text-[#CBD4CF] flex justify-between items-center">
                <span>Threat: NOMINAL</span>
                <span className="text-[#30D158]">60 Hz Synced</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 8. Interactive Attack Simulation Live Box */}
      <section id="sandbox-demo" className="py-24 max-w-5xl mx-auto px-4 sm:px-6">
        <div className="rounded-[2.5rem] border border-[#2E4036] bg-gradient-to-b from-[#171C19] to-[#111614] p-6 sm:p-10 shadow-organic-hover">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-[#26372E] pb-6 mb-8">
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#CC5833]/15 border border-[#CC5833]/30 text-[#CC5833] text-xs font-semibold mb-2">
                <Crosshair className="w-3.5 h-3.5" />
                <span>Live Interactive Sandbox</span>
              </div>
              <h3 className="text-2xl font-sans font-bold text-white">Test Anomaly & Attack Vectors</h3>
              <p className="text-xs text-[#94A39B] mt-1">Inject realistic synthetic telemetry and observe instantaneous broker defense.</p>
            </div>
            <button
              onClick={() => onEnterApp('sandbox')}
              className="magnetic-btn px-6 py-3 rounded-full bg-[#CC5833] hover:bg-[#B54926] text-white text-xs font-bold flex items-center gap-2 transition-all shrink-0"
            >
              <span>Full Attack Sandbox</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
            <button
              disabled={!!simulatingAttack}
              onClick={() => handleSimulate('Sensor Drift', 'Injects gradual slope drift into soil moisture readings')}
              className="p-4 rounded-2xl border border-[#26372E] bg-[#142019] hover:border-[#CC5833]/50 text-left transition-all active:scale-95 disabled:opacity-50 hover-lift"
            >
              <div className="text-xs font-bold text-white mb-1">📈 Sensor Drift</div>
              <p className="text-[10px] text-[#94A39B]">Tests Tier 2 Isolation Forest slope tracking.</p>
            </button>

            <button
              disabled={!!simulatingAttack}
              onClick={() => handleSimulate('Extreme Spike', 'Injects 340 PSI pressure spike into water meter')}
              className="p-4 rounded-2xl border border-[#26372E] bg-[#142019] hover:border-[#CC5833]/50 text-left transition-all active:scale-95 disabled:opacity-50 hover-lift"
            >
              <div className="text-xs font-bold text-white mb-1">⚡ Outlier Spike</div>
              <p className="text-[10px] text-[#94A39B]">Tests Tier 1 rate-of-change limiters.</p>
            </button>

            <button
              disabled={!!simulatingAttack}
              onClick={() => handleSimulate('Cloned Certificate', 'Presents legitimate cert concurrently from rogue IP')}
              className="p-4 rounded-2xl border border-[#26372E] bg-[#142019] hover:border-[#CC5833]/50 text-left transition-all active:scale-95 disabled:opacity-50 hover-lift"
            >
              <div className="text-xs font-bold text-white mb-1">🔓 Cloned Cert</div>
              <p className="text-[10px] text-[#94A39B]">Triggers automated cert revocation.</p>
            </button>

            <button
              disabled={!!simulatingAttack}
              onClick={() => handleSimulate('Rogue Topic Publish', 'Device attempts writing outside allowed ACL path')}
              className="p-4 rounded-2xl border border-[#26372E] bg-[#142019] hover:border-[#CC5833]/50 text-left transition-all active:scale-95 disabled:opacity-50 hover-lift"
            >
              <div className="text-xs font-bold text-white mb-1">🔀 Rogue Topic</div>
              <p className="text-[10px] text-[#94A39B]">Tests broker topic regex filter.</p>
            </button>
          </div>

          {simFeedback && (
            <div className="mt-6 p-4 rounded-2xl bg-[#142019] border border-[#CC5833]/40 text-xs font-mono text-[#F4F2EC] flex items-center gap-3">
              <Activity className="w-4 h-4 text-[#CC5833] animate-spin shrink-0" />
              <span>{simFeedback}</span>
            </div>
          )}
        </div>
      </section>

      {/* 9. Final CTA & Footer */}
      <footer className="pt-20 pb-12 border-t border-[#26372E] bg-[#0E1411]">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <div className="p-8 sm:p-12 rounded-[2.5rem] bg-[#171C19] border border-[#2E4036] flex flex-col md:flex-row items-center justify-between gap-8 text-center md:text-left mb-16 shadow-organic-card">
            <div>
              <h3 className="text-2xl sm:text-3xl font-sans font-bold text-white">
                Ready to secure your edge fleet?
              </h3>
              <p className="text-xs sm:text-sm text-[#94A39B] mt-2">
                Launch the SOC command center or test with your own sensor clusters.
              </p>
            </div>
            <button
              onClick={() => onEnterApp('overview')}
              className="magnetic-btn px-8 py-4 rounded-full bg-[#CC5833] hover:bg-[#B54926] text-white font-bold text-sm shadow-clay-glow transition-all shrink-0"
            >
              Launch Command Center
            </button>
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-between text-xs text-[#708A7C] pt-6 border-t border-[#26372E]/50 gap-4">
            <div className="flex items-center gap-3">
              <span className="font-bold text-white">NEXORA</span>
              <span>— Organic Tech IoT Defense Platform</span>
            </div>
            <div className="flex items-center gap-6">
              <span>RFC 5280 PKI</span>
              <span>MQTT 5.0 Strict ACL</span>
              <span>SHA-256 Ledger</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};
