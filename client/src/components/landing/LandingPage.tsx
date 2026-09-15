import React, { useState } from 'react';
import {
  Shield,
  Radio,
  Cpu,
  Lock,
  KeyRound,
  BrainCircuit,
  AlertTriangle,
  Server,
  FileCode2,
  ScrollText,
  Crosshair,
  ArrowRight,
  CheckCircle2,
  Activity,
  Zap,
  ChevronRight,
  ExternalLink,
  Layers,
  Sparkles,
  Database,
  Terminal,
  Clock,
  Play,
  Check,
  Compass,
  Sliders,
  Users
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

  const handleSimulate = (name: string, description: string) => {
    setSimulatingAttack(name);
    setSimFeedback(`Simulating ${name}: Telemetry packet injected with modified signature.`);
    setTimeout(() => {
      setSimFeedback(`✓ Tier 1 & Tier 2 ML Engine flagged ${name} (Latency: 3.2ms, SHAP: 94.2%).`);
      setTimeout(() => {
        setSimulatingAttack(null);
      }, 3000);
    }, 1200);
  };

  return (
    <div className="min-h-screen bg-[#07090e] text-slate-100 font-sans selection:bg-cyan-500/30 selection:text-cyan-200">
      {/* 1. Header Navigation Bar */}
      <header className="sticky top-0 z-50 h-20 border-b border-slate-800/80 bg-[#07090e]/85 backdrop-blur-xl px-4 sm:px-8 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-slate-900 to-slate-950 border border-cyan-500/30 shadow-cyber-glow flex items-center justify-center p-1 overflow-hidden">
            <img src="/nexora.png" alt="NEXORA Logo" className="w-full h-full object-contain" />
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xl font-bold tracking-tight text-white font-mono">NEXORA</span>
            <span className="text-[10px] font-semibold uppercase px-2 py-0.5 rounded-full bg-cyan-950/80 text-cyan-400 border border-cyan-700/50 hidden sm:inline-block">
              Fleet Defense
            </span>
          </div>
        </div>

        {/* Center Nav Links */}
        <nav className="hidden lg:flex items-center gap-8 text-sm font-medium text-slate-300">
          <a href="#features" className="hover:text-cyan-400 transition-colors">Features</a>
          <a href="#architecture" className="hover:text-cyan-400 transition-colors">Architecture</a>
          <a href="#pki-security" className="hover:text-cyan-400 transition-colors">PKI Security</a>
          <a href="#ml-detection" className="hover:text-cyan-400 transition-colors">ML Detection</a>
          <a href="#deployments" className="hover:text-cyan-400 transition-colors">Sectors</a>
          <a href="#testimonials" className="hover:text-cyan-400 transition-colors">Reviews</a>
        </nav>

        {/* Right Action Buttons */}
        <div className="flex items-center gap-3">
          <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-lg border border-slate-800 bg-[#0f1422] text-xs font-mono text-slate-300">
            <span className={`w-2 h-2 rounded-full ${wsConnected ? 'bg-emerald-400 animate-pulse' : 'bg-amber-400'}`} />
            <span>{stats?.totalDevices || 200} Nodes Active</span>
          </div>

          <button
            onClick={() => onEnterApp('overview')}
            className="group relative inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-slate-950 font-bold text-xs sm:text-sm shadow-cyber-glow transition-all duration-200 active:scale-95"
          >
            <span>Launch Command Center</span>
            <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
          </button>
        </div>
      </header>

      {/* 2. Hero Section (Inspired by inspo/landing2.jpg) */}
      <section className="relative pt-16 pb-24 overflow-hidden border-b border-slate-800/60">
        {/* Ambient background glows */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[350px] bg-cyan-500/10 rounded-full blur-[140px] pointer-events-none" />
        <div className="absolute top-1/3 left-1/3 w-[400px] h-[300px] bg-blue-600/10 rounded-full blur-[120px] pointer-events-none" />

        <div className="max-w-6xl mx-auto px-4 sm:px-6 text-center relative z-10">
          {/* Top Pill Tag */}
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-slate-900/90 border border-cyan-500/30 text-xs font-medium text-cyan-300 shadow-sm mb-8">
            <span className="flex h-2 w-2 rounded-full bg-cyan-400 animate-ping" />
            <span>Next-Gen IoT Fleet Security & Behavioral ML v2.4 Live</span>
            <ChevronRight className="w-3.5 h-3.5 text-cyan-400" />
          </div>

          {/* Editorial Headline */}
          <h1 className="text-4xl sm:text-6xl md:text-7xl font-serif tracking-tight text-white max-w-4xl mx-auto leading-[1.08]">
            Intelligent fleet security for mission-critical IoT.
          </h1>

          {/* Subtitle */}
          <p className="mt-6 text-base sm:text-xl text-slate-300 max-w-2xl mx-auto font-light leading-relaxed">
            Eliminate shared credentials with mutual TLS, ingest high-throughput telemetry over strict topic ACLs, and detect behavioral anomalies with explainable machine learning.
          </p>

          {/* Hero CTAs */}
          <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-4">
            <button
              onClick={() => onEnterApp('overview')}
              className="w-full sm:w-auto px-7 py-3.5 rounded-xl bg-white hover:bg-slate-100 text-slate-950 font-bold text-sm shadow-xl flex items-center justify-center gap-2 transition-all active:scale-95"
            >
              <span>Enter SOC Command Center</span>
              <ArrowRight className="w-4 h-4 text-slate-950" />
            </button>

            <button
              onClick={() => onEnterApp('sandbox')}
              className="w-full sm:w-auto px-7 py-3.5 rounded-xl border border-slate-700 bg-slate-900/80 hover:bg-slate-800 text-slate-200 font-semibold text-sm flex items-center justify-center gap-2 transition-all active:scale-95"
            >
              <Crosshair className="w-4 h-4 text-cyan-400" />
              <span>Explore Attack Sandbox</span>
            </button>
          </div>

          {/* Floating Feature Pills (Surrounding Hero Mockup) */}
          <div className="relative mt-16 max-w-5xl mx-auto">
            {/* Top Left Badge */}
            <div className="hidden md:flex absolute -top-6 -left-6 z-20 items-center gap-2 px-3 py-2 rounded-xl bg-[#101522]/90 border border-slate-700/80 shadow-2xl backdrop-blur-md text-xs">
              <div className="w-7 h-7 rounded-lg bg-cyan-950/80 border border-cyan-700/50 flex items-center justify-center text-cyan-400">
                <Lock className="w-3.5 h-3.5" />
              </div>
              <div className="text-left">
                <p className="font-semibold text-white">mTLS X.509</p>
                <p className="text-[10px] text-emerald-400 font-mono">2048-bit RSA Active</p>
              </div>
            </div>

            {/* Top Right Badge */}
            <div className="hidden md:flex absolute -top-6 -right-6 z-20 items-center gap-2 px-3 py-2 rounded-xl bg-[#101522]/90 border border-slate-700/80 shadow-2xl backdrop-blur-md text-xs">
              <div className="w-7 h-7 rounded-lg bg-purple-950/80 border border-purple-700/50 flex items-center justify-center text-purple-400">
                <BrainCircuit className="w-3.5 h-3.5" />
              </div>
              <div className="text-left">
                <p className="font-semibold text-white">Isolation Forest ML</p>
                <p className="text-[10px] text-purple-400 font-mono">SHAP: 94.2% Precision</p>
              </div>
            </div>

            {/* Bottom Left Badge */}
            <div className="hidden md:flex absolute -bottom-6 -left-4 z-20 items-center gap-2 px-3 py-2 rounded-xl bg-[#101522]/90 border border-slate-700/80 shadow-2xl backdrop-blur-md text-xs">
              <div className="w-7 h-7 rounded-lg bg-amber-950/80 border border-amber-700/50 flex items-center justify-center text-amber-400">
                <Shield className="w-3.5 h-3.5" />
              </div>
              <div className="text-left">
                <p className="font-semibold text-white">Safety Gate</p>
                <p className="text-[10px] text-amber-400 font-mono">Human Sign-off Gated</p>
              </div>
            </div>

            {/* Bottom Right Badge */}
            <div className="hidden md:flex absolute -bottom-6 -right-4 z-20 items-center gap-2 px-3 py-2 rounded-xl bg-[#101522]/90 border border-slate-700/80 shadow-2xl backdrop-blur-md text-xs">
              <div className="w-7 h-7 rounded-lg bg-emerald-950/80 border border-emerald-700/50 flex items-center justify-center text-emerald-400">
                <ScrollText className="w-3.5 h-3.5" />
              </div>
              <div className="text-left">
                <p className="font-semibold text-white">Audit Ledger</p>
                <p className="text-[10px] text-emerald-400 font-mono">SHA-256 Chain Verified</p>
              </div>
            </div>

            {/* Main Interactive Screen Showcase Card */}
            <div className="relative rounded-2xl border border-slate-700/80 bg-gradient-to-b from-[#101524] to-[#0a0d14] p-2 sm:p-4 shadow-2xl overflow-hidden group">
              {/* Window Header */}
              <div className="flex items-center justify-between px-3 py-2 border-b border-slate-800 text-xs text-slate-400">
                <div className="flex items-center gap-2">
                  <div className="flex gap-1.5">
                    <span className="w-3 h-3 rounded-full bg-rose-500/80 inline-block" />
                    <span className="w-3 h-3 rounded-full bg-amber-500/80 inline-block" />
                    <span className="w-3 h-3 rounded-full bg-emerald-500/80 inline-block" />
                  </div>
                  <span className="font-mono text-[11px] text-slate-400 ml-2">https://nexorraa.onrender.com/soc</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                  <span className="text-[10px] font-mono text-emerald-400">SOC BUS ONLINE</span>
                </div>
              </div>

              {/* Showcase Inner View */}
              <div className="p-4 sm:p-6 grid grid-cols-1 md:grid-cols-3 gap-4 text-left">
                {/* Metric 1 */}
                <div className="p-4 rounded-xl border border-slate-800 bg-[#0d121f]/90">
                  <div className="flex items-center justify-between text-xs text-slate-400">
                    <span>Fleet Online Nodes</span>
                    <Server className="w-4 h-4 text-cyan-400" />
                  </div>
                  <div className="mt-2 flex items-baseline gap-2">
                    <span className="text-2xl font-bold font-mono text-white">{stats?.onlineDevices || 184}</span>
                    <span className="text-xs text-slate-400">/ {stats?.totalDevices || 200}</span>
                  </div>
                  <div className="w-full bg-slate-800 rounded-full h-1.5 mt-3">
                    <div className="bg-cyan-500 h-1.5 rounded-full" style={{ width: '92%' }} />
                  </div>
                </div>

                {/* Metric 2 */}
                <div className="p-4 rounded-xl border border-slate-800 bg-[#0d121f]/90">
                  <div className="flex items-center justify-between text-xs text-slate-400">
                    <span>Threat Posture</span>
                    <Shield className="w-4 h-4 text-amber-400" />
                  </div>
                  <div className="mt-2 flex items-baseline gap-2">
                    <span className="text-2xl font-bold font-mono text-amber-400">{stats?.threatLevel || 'ELEVATED'}</span>
                    <span className="text-xs text-rose-400 font-mono">({stats?.openIncidents || 3} Cases)</span>
                  </div>
                  <p className="text-[11px] text-slate-400 mt-2">Zero unauthenticated packets leaked.</p>
                </div>

                {/* Metric 3 */}
                <div className="p-4 rounded-xl border border-slate-800 bg-[#0d121f]/90">
                  <div className="flex items-center justify-between text-xs text-slate-400">
                    <span>PKI Root Authority</span>
                    <KeyRound className="w-4 h-4 text-emerald-400" />
                  </div>
                  <div className="mt-2 flex items-baseline gap-2">
                    <span className="text-2xl font-bold font-mono text-emerald-400">100%</span>
                    <span className="text-xs text-slate-400">mTLS Verified</span>
                  </div>
                  <p className="text-[11px] text-slate-400 mt-2">RSA 2048-bit with active CRL list.</p>
                </div>

                {/* Mini Action Banner inside Showcase */}
                <div className="md:col-span-3 p-4 rounded-xl border border-cyan-500/20 bg-gradient-to-r from-cyan-950/40 via-blue-950/30 to-purple-950/40 flex flex-col sm:flex-row items-center justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-lg bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-cyan-400 shrink-0">
                      <BrainCircuit className="w-5 h-5" />
                    </div>
                    <div>
                      <h4 className="text-xs font-semibold text-white">Live Multivariate Isolation Forest Stream</h4>
                      <p className="text-[11px] text-slate-400">Processing high-frequency sensor readings at sub-second intervals with SHAP explainability.</p>
                    </div>
                  </div>
                  <button
                    onClick={() => onEnterApp('ml-anomalies')}
                    className="px-4 py-2 rounded-lg bg-cyan-500 hover:bg-cyan-400 text-slate-950 text-xs font-bold shrink-0 transition-colors"
                  >
                    Open ML Hub
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 3. Industry Standards & Cryptographic Protocol Trust Bar */}
      <section className="py-12 border-b border-slate-800/60 bg-[#090d16]">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <p className="text-center text-xs font-mono uppercase tracking-widest text-slate-400 mb-8">
            Engineered According to Open Cryptographic & Industrial Telemetry Standards
          </p>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-6 items-center justify-center text-center">
            <div className="p-3 rounded-xl border border-slate-800/80 bg-[#0f1422] text-xs font-mono text-slate-300">
              <span className="text-cyan-400 font-bold block mb-1">RFC 5280</span>
              <span>X.509 PKI Authority</span>
            </div>
            <div className="p-3 rounded-xl border border-slate-800/80 bg-[#0f1422] text-xs font-mono text-slate-300">
              <span className="text-blue-400 font-bold block mb-1">MQTT 5.0</span>
              <span>Strict Topic ACLs</span>
            </div>
            <div className="p-3 rounded-xl border border-slate-800/80 bg-[#0f1422] text-xs font-mono text-slate-300">
              <span className="text-purple-400 font-bold block mb-1">ML Engine</span>
              <span>Isolation Forest + SHAP</span>
            </div>
            <div className="p-3 rounded-xl border border-slate-800/80 bg-[#0f1422] text-xs font-mono text-slate-300">
              <span className="text-amber-400 font-bold block mb-1">OWASP</span>
              <span>IoT Top 10 Defenses</span>
            </div>
            <div className="p-3 rounded-xl border border-slate-800/80 bg-[#0f1422] text-xs font-mono text-slate-300">
              <span className="text-emerald-400 font-bold block mb-1">SHA-256</span>
              <span>Immutable Ledger</span>
            </div>
            <div className="p-3 rounded-xl border border-slate-800/80 bg-[#0f1422] text-xs font-mono text-slate-300">
              <span className="text-rose-400 font-bold block mb-1">ECDSA</span>
              <span>Signed Dual-OTA</span>
            </div>
          </div>
        </div>
      </section>

      {/* 4. Core Features Grid (Inspired by inspo/landing2.jpg grid layout) */}
      <section id="features" className="py-24 max-w-6xl mx-auto px-4 sm:px-6">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-950/60 border border-cyan-800/50 text-cyan-400 text-xs font-semibold mb-4">
            <Layers className="w-3.5 h-3.5" />
            <span>Comprehensive Fleet Protection</span>
          </div>
          <h2 className="text-3xl sm:text-5xl font-serif tracking-tight text-white leading-tight">
            Built by and for mission-critical fleets.
          </h2>
          <p className="mt-4 text-slate-300 text-base font-light">
            Powerful cryptographic, telemetry, and machine learning engines designed to secure every sensor from factory provisioning to decommissioning.
          </p>
        </div>

        {/* 6 Feature Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Card 1: PKI & Identity */}
          <div
            onClick={() => onEnterApp('pki')}
            className="group cursor-pointer rounded-2xl border border-slate-800 hover:border-cyan-500/50 bg-[#0d121f] p-6 transition-all duration-300 hover:shadow-cyber-glow flex flex-col justify-between"
          >
            <div>
              <div className="w-12 h-12 rounded-xl bg-cyan-950/80 border border-cyan-700/50 flex items-center justify-center text-cyan-400 mb-6 group-hover:scale-110 transition-transform">
                <KeyRound className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-white group-hover:text-cyan-300 transition-colors">
                Cryptographic Device Identity & PKI
              </h3>
              <p className="text-xs text-slate-400 mt-2 leading-relaxed">
                Short-lived 2048-bit RSA X.509 client certificates eliminate shared credentials and enforce non-repudiation at the transport layer.
              </p>
            </div>
            {/* Visual Mini Mockup */}
            <div className="mt-6 p-3 rounded-xl bg-[#090d16] border border-slate-800/80 text-[11px] font-mono space-y-1">
              <div className="flex justify-between text-slate-400">
                <span>Cert Serial:</span>
                <span className="text-cyan-400">#8491-NX</span>
              </div>
              <div className="flex justify-between text-slate-400">
                <span>Validity:</span>
                <span className="text-emerald-400">90 Days (Active)</span>
              </div>
            </div>
          </div>

          {/* Card 2: MQTT Topic ACLs */}
          <div
            onClick={() => onEnterApp('schemas')}
            className="group cursor-pointer rounded-2xl border border-slate-800 hover:border-blue-500/50 bg-[#0d121f] p-6 transition-all duration-300 hover:shadow-cyber-glow flex flex-col justify-between"
          >
            <div>
              <div className="w-12 h-12 rounded-xl bg-blue-950/80 border border-blue-700/50 flex items-center justify-center text-blue-400 mb-6 group-hover:scale-110 transition-transform">
                <Lock className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-white group-hover:text-blue-300 transition-colors">
                Strict Broker Topic ACL Enforcement
              </h3>
              <p className="text-xs text-slate-400 mt-2 leading-relaxed">
                Regex-level topic authorization limits devices strictly to their own tenant namespace, instantly rejecting spoofed packets.
              </p>
            </div>
            {/* Visual Mini Mockup */}
            <div className="mt-6 p-3 rounded-xl bg-[#090d16] border border-slate-800/80 text-[11px] font-mono space-y-1">
              <div className="text-slate-400 truncate">topic: org/salinas/device/soil-04</div>
              <div className="flex items-center gap-1.5 text-emerald-400 font-bold">
                <Check className="w-3.5 h-3.5" />
                <span>ACL Rule Matched</span>
              </div>
            </div>
          </div>

          {/* Card 3: Two-Tier ML Engine */}
          <div
            onClick={() => onEnterApp('ml-anomalies')}
            className="group cursor-pointer rounded-2xl border border-slate-800 hover:border-purple-500/50 bg-[#0d121f] p-6 transition-all duration-300 hover:shadow-cyber-glow flex flex-col justify-between"
          >
            <div>
              <div className="w-12 h-12 rounded-xl bg-purple-950/80 border border-purple-700/50 flex items-center justify-center text-purple-400 mb-6 group-hover:scale-110 transition-transform">
                <BrainCircuit className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-white group-hover:text-purple-300 transition-colors">
                Two-Tier ML Anomaly & SHAP Vectors
              </h3>
              <p className="text-xs text-slate-400 mt-2 leading-relaxed">
                Inline microsecond rate checks paired with Multivariate Isolation Forest and feature-level SHAP root cause breakdowns.
              </p>
            </div>
            {/* Visual Mini Mockup */}
            <div className="mt-6 p-3 rounded-xl bg-[#090d16] border border-slate-800/80 text-[11px] font-mono space-y-1.5">
              <div className="flex justify-between text-xs">
                <span className="text-slate-400">soil_moisture_pct</span>
                <span className="text-purple-400 font-bold">68.4% SHAP</span>
              </div>
              <div className="w-full bg-slate-800 rounded-full h-1.5">
                <div className="bg-purple-500 h-1.5 rounded-full" style={{ width: '68%' }} />
              </div>
            </div>
          </div>

          {/* Card 4: Device State Shadow */}
          <div
            onClick={() => onEnterApp('devices')}
            className="group cursor-pointer rounded-2xl border border-slate-800 hover:border-cyan-500/50 bg-[#0d121f] p-6 transition-all duration-300 hover:shadow-cyber-glow flex flex-col justify-between"
          >
            <div>
              <div className="w-12 h-12 rounded-xl bg-cyan-950/80 border border-cyan-700/50 flex items-center justify-center text-cyan-400 mb-6 group-hover:scale-110 transition-transform">
                <Sliders className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-white group-hover:text-cyan-300 transition-colors">
                Device State Shadow Synchronization
              </h3>
              <p className="text-xs text-slate-400 mt-2 leading-relaxed">
                Bi-directional sync between desired state and reported hardware state with automated delta alerts and drift monitoring.
              </p>
            </div>
            {/* Visual Mini Mockup */}
            <div className="mt-6 p-3 rounded-xl bg-[#090d16] border border-slate-800/80 text-[11px] font-mono space-y-1">
              <div className="flex justify-between text-slate-400">
                <span>valve_aperture:</span>
                <span className="text-cyan-400">45% (Synced)</span>
              </div>
              <div className="text-[10px] text-emerald-400">✓ Delta: 0.0% (In Sync)</div>
            </div>
          </div>

          {/* Card 5: Human-Gated Safety Playbooks */}
          <div
            onClick={() => onEnterApp('incidents')}
            className="group cursor-pointer rounded-2xl border border-slate-800 hover:border-amber-500/50 bg-[#0d121f] p-6 transition-all duration-300 hover:shadow-cyber-glow flex flex-col justify-between"
          >
            <div>
              <div className="w-12 h-12 rounded-xl bg-amber-950/80 border border-amber-700/50 flex items-center justify-center text-amber-400 mb-6 group-hover:scale-110 transition-transform">
                <AlertTriangle className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-white group-hover:text-amber-300 transition-colors">
                Human-in-the-Loop Safety Gates
              </h3>
              <p className="text-xs text-slate-400 mt-2 leading-relaxed">
                Automated quarantine on passive sensors; strictly requires human digital approval before manipulating critical physical actuators.
              </p>
            </div>
            {/* Visual Mini Mockup */}
            <div className="mt-6 p-3 rounded-xl bg-[#090d16] border border-slate-800/80 text-[11px] font-mono space-y-1">
              <div className="text-amber-400 font-semibold">GATE: CANAL_VALVE_CLOSE</div>
              <div className="text-[10px] text-slate-400">Requires Analyst Digital Sign-off</div>
            </div>
          </div>

          {/* Card 6: SHA-256 Audit Ledger */}
          <div
            onClick={() => onEnterApp('audit')}
            className="group cursor-pointer rounded-2xl border border-slate-800 hover:border-emerald-500/50 bg-[#0d121f] p-6 transition-all duration-300 hover:shadow-cyber-glow flex flex-col justify-between"
          >
            <div>
              <div className="w-12 h-12 rounded-xl bg-emerald-950/80 border border-emerald-700/50 flex items-center justify-center text-emerald-400 mb-6 group-hover:scale-110 transition-transform">
                <ScrollText className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-white group-hover:text-emerald-300 transition-colors">
                Tamper-Evident SHA-256 Audit Ledger
              </h3>
              <p className="text-xs text-slate-400 mt-2 leading-relaxed">
                Immutable hash chain logs every security incident, cert rotation, and command execution with 1-click verification.
              </p>
            </div>
            {/* Visual Mini Mockup */}
            <div className="mt-6 p-3 rounded-xl bg-[#090d16] border border-slate-800/80 text-[11px] font-mono space-y-1">
              <div className="text-slate-400 truncate">Hash: 8f3c9a...71e0</div>
              <div className="text-[10px] text-emerald-400">✓ Cryptographic Chain Valid</div>
            </div>
          </div>
        </div>
      </section>

      {/* 5. Editorial Quote Banner */}
      <section className="py-20 border-y border-slate-800/80 bg-gradient-to-r from-[#0c101d] via-[#101524] to-[#0c101d] relative">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 text-center">
          <span className="text-cyan-400 text-4xl font-serif">“</span>
          <blockquote className="text-2xl sm:text-3xl md:text-4xl font-serif text-slate-100 leading-snug">
            NEXORA transforms vulnerable edge sensor networks into mathematically verifiable, self-defending infrastructure with cryptographic identity and sub-second anomaly mitigation.
          </blockquote>
          <p className="mt-6 text-xs font-mono uppercase tracking-widest text-cyan-400">
            — Enterprise IoT Security Mandate
          </p>
        </div>
      </section>

      {/* 6. Deep Dive Feature Spotlights (Alternating Left/Right) */}
      <section id="architecture" className="py-24 max-w-6xl mx-auto px-4 sm:px-6 space-y-28">
        {/* Spotlight 1: mTLS & Zero-Trust */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-950/60 border border-cyan-800/50 text-cyan-400 text-xs font-semibold mb-4">
              <Lock className="w-3.5 h-3.5" />
              <span>Zero-Trust Protocol Layer</span>
            </div>
            <h3 className="text-3xl sm:text-4xl font-serif text-white leading-tight">
              Cryptographic identity from edge to cloud.
            </h3>
            <p className="mt-4 text-slate-300 text-sm leading-relaxed">
              Every node is provisioned with a unique, short-lived X.509 client certificate generated by our integrated PKI authority. If a certificate expires, is revoked, or is presented from an unauthorized IP, the MQTT broker drops the TLS handshake immediately.
            </p>
            <ul className="mt-6 space-y-3 text-xs text-slate-300">
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-cyan-400 shrink-0" />
                <span>Zero shared passwords or static API keys stored on flash memory</span>
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-cyan-400 shrink-0" />
                <span>Automated 90-day key rollover with zero telemetric downtime</span>
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-cyan-400 shrink-0" />
                <span>Integrated CRL revocation list checked on every single connection</span>
              </li>
            </ul>
            <button
              onClick={() => onEnterApp('pki')}
              className="mt-8 px-5 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-cyan-400 text-xs font-bold flex items-center gap-2 transition-colors"
            >
              <span>Inspect PKI Certificate Authority</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Visual Box */}
          <div className="rounded-2xl border border-slate-800 bg-[#0d121f] p-6 shadow-2xl font-mono text-xs">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3 mb-4 text-slate-400">
              <span>X.509 Device Certificate Inspector</span>
              <span className="text-emerald-400 text-[10px]">VERIFIED</span>
            </div>
            <div className="space-y-2.5 text-[11px]">
              <div className="p-2.5 rounded-lg bg-[#07090e] border border-slate-800/80">
                <span className="text-slate-500 block text-[10px]">SUBJECT DISTINGUISHED NAME</span>
                <span className="text-cyan-300">CN=dev-agri-004, O=Nexora, OU=Salinas-Agri</span>
              </div>
              <div className="p-2.5 rounded-lg bg-[#07090e] border border-slate-800/80">
                <span className="text-slate-500 block text-[10px]">ISSUER</span>
                <span className="text-white">Nexora Root CA (G1) [2048-bit RSA]</span>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div className="p-2.5 rounded-lg bg-[#07090e] border border-slate-800/80">
                  <span className="text-slate-500 block text-[10px]">SAN / TOPIC ACL</span>
                  <span className="text-slate-300">org/salinas/device/*</span>
                </div>
                <div className="p-2.5 rounded-lg bg-[#07090e] border border-slate-800/80">
                  <span className="text-slate-500 block text-[10px]">EXPIRATION</span>
                  <span className="text-amber-400">90 Days (Auto-Rotate)</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Spotlight 2: ML Detection & Explainability */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          {/* Visual Box on Left */}
          <div className="order-2 lg:order-1 rounded-2xl border border-slate-800 bg-[#0d121f] p-6 shadow-2xl font-mono text-xs">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3 mb-4 text-slate-400">
              <span>SHAP Feature Attribution Matrix</span>
              <span className="text-purple-400 text-[10px]">ISOLATION FOREST</span>
            </div>
            <div className="space-y-3 text-[11px]">
              <div>
                <div className="flex justify-between text-slate-300 mb-1">
                  <span>soil_moisture_pct (Abnormal Jump +48%)</span>
                  <span className="text-purple-400 font-bold">68.4%</span>
                </div>
                <div className="w-full bg-slate-800 rounded-full h-2">
                  <div className="bg-gradient-to-r from-purple-500 to-indigo-500 h-2 rounded-full" style={{ width: '68.4%' }} />
                </div>
              </div>

              <div>
                <div className="flex justify-between text-slate-300 mb-1">
                  <span>soil_temp_celsius (Slight Variance)</span>
                  <span className="text-purple-400 font-bold">22.1%</span>
                </div>
                <div className="w-full bg-slate-800 rounded-full h-2">
                  <div className="bg-gradient-to-r from-purple-500 to-indigo-500 h-2 rounded-full" style={{ width: '22.1%' }} />
                </div>
              </div>

              <div>
                <div className="flex justify-between text-slate-300 mb-1">
                  <span>battery_voltage (Nominal)</span>
                  <span className="text-slate-500 font-bold">9.5%</span>
                </div>
                <div className="w-full bg-slate-800 rounded-full h-2">
                  <div className="bg-slate-600 h-2 rounded-full" style={{ width: '9.5%' }} />
                </div>
              </div>
            </div>
            <div className="mt-4 p-2.5 rounded-lg bg-purple-950/40 border border-purple-800/50 text-[10px] text-purple-300">
              ✓ Mathematically explainable: Root cause confirmed as irrigation pipeline breach.
            </div>
          </div>

          <div className="order-1 lg:order-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-purple-950/60 border border-purple-800/50 text-purple-400 text-xs font-semibold mb-4">
              <BrainCircuit className="w-3.5 h-3.5" />
              <span>Explainable AI Defense</span>
            </div>
            <h3 className="text-3xl sm:text-4xl font-serif text-white leading-tight">
              No black-box alerts. Total mathematical clarity.
            </h3>
            <p className="mt-4 text-slate-300 text-sm leading-relaxed">
              Traditional anomaly detectors give you an opaque number. NEXORA combines microsecond Tier 1 rule filters with Tier 2 Multivariate Isolation Forest scoring equipped with feature-level SHAP attribution vectors, allowing your security analysts to identify the physical root cause in seconds.
            </p>
            <button
              onClick={() => onEnterApp('ml-anomalies')}
              className="mt-8 px-5 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-purple-300 text-xs font-bold flex items-center gap-2 transition-colors"
            >
              <span>Explore ML Anomaly Engine</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </section>

      {/* 7. Industry Deployment Showcase (3 Sectors) */}
      <section id="deployments" className="py-24 border-t border-slate-800/80 bg-[#090d16]">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <span className="text-xs font-mono uppercase tracking-widest text-cyan-400">Production Environments</span>
            <h2 className="text-3xl sm:text-5xl font-serif text-white mt-2">
              Securing critical infrastructure across industries.
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Sector 1: Agriculture */}
            <div className="rounded-2xl border border-slate-800 bg-[#0d121f] p-6 flex flex-col justify-between">
              <div>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-950/80 text-emerald-400 border border-emerald-800/50">
                  AGRITECH FLEET
                </span>
                <h4 className="text-lg font-bold text-white mt-3">Salinas Valley Probes</h4>
                <p className="text-xs text-slate-400 mt-2">
                  200+ Multi-depth capacitive soil sensors measuring moisture, salinity, and battery health over LoRaWAN & LTE-M.
                </p>
              </div>
              <div className="mt-6 pt-4 border-t border-slate-800/80 text-[11px] font-mono text-slate-300 flex justify-between items-center">
                <span>Threat: NOMINAL</span>
                <span className="text-cyan-400">98.4% Health</span>
              </div>
            </div>

            {/* Sector 2: Water Utilities */}
            <div className="rounded-2xl border border-slate-800 bg-[#0d121f] p-6 flex flex-col justify-between">
              <div>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-blue-950/80 text-blue-400 border border-blue-800/50">
                  CRITICAL INFRASTRUCTURE
                </span>
                <h4 className="text-lg font-bold text-white mt-3">Aqueduct Station 4</h4>
                <p className="text-xs text-slate-400 mt-2">
                  Precision ultrasonic flowmeters and motorized canal gates with human-in-the-loop safety approval gates.
                </p>
              </div>
              <div className="mt-6 pt-4 border-t border-slate-800/80 text-[11px] font-mono text-slate-300 flex justify-between items-center">
                <span>Threat: ELEVATED</span>
                <span className="text-amber-400">Gate Active</span>
              </div>
            </div>

            {/* Sector 3: Smart Grid */}
            <div className="rounded-2xl border border-slate-800 bg-[#0d121f] p-6 flex flex-col justify-between">
              <div>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-purple-950/80 text-purple-400 border border-purple-800/50">
                  ENERGY & GRID
                </span>
                <h4 className="text-lg font-bold text-white mt-3">Metro Grid Sector 9</h4>
                <p className="text-xs text-slate-400 mt-2">
                  Three-phase smart electricity meters tracking active power, voltage stability, and line impedance anomalies.
                </p>
              </div>
              <div className="mt-6 pt-4 border-t border-slate-800/80 text-[11px] font-mono text-slate-300 flex justify-between items-center">
                <span>Threat: NOMINAL</span>
                <span className="text-purple-400">60 Hz Synced</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 8. Interactive Attack Simulation Live Box */}
      <section className="py-20 max-w-5xl mx-auto px-4 sm:px-6">
        <div className="rounded-2xl border border-cyan-500/30 bg-gradient-to-b from-[#101524] to-[#0a0d14] p-6 sm:p-8 shadow-2xl">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-800 pb-6 mb-6">
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-rose-950/60 border border-rose-800/50 text-rose-400 text-xs font-semibold mb-2">
                <Crosshair className="w-3.5 h-3.5" />
                <span>Live Interactive Sandbox</span>
              </div>
              <h3 className="text-2xl font-serif text-white">Test Anomaly & Attack Playbooks</h3>
              <p className="text-xs text-slate-400 mt-1">Inject realistic synthetic attacks and observe real-time broker defense and ML detection.</p>
            </div>
            <button
              onClick={() => onEnterApp('sandbox')}
              className="px-5 py-2.5 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 text-xs font-bold flex items-center gap-2 transition-colors shrink-0"
            >
              <span>Full Attack Sandbox</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
            <button
              disabled={!!simulatingAttack}
              onClick={() => handleSimulate('Sensor Drift', 'Injects gradual slope drift into soil moisture readings')}
              className="p-3.5 rounded-xl border border-slate-800 bg-[#0c101d] hover:border-cyan-500/40 text-left transition-all active:scale-95 disabled:opacity-50"
            >
              <div className="text-xs font-bold text-white mb-1">📈 Sensor Drift</div>
              <p className="text-[10px] text-slate-400">Tests Tier 2 Isolation Forest slope tracking.</p>
            </button>

            <button
              disabled={!!simulatingAttack}
              onClick={() => handleSimulate('Extreme Spike', 'Injects 340 PSI pressure spike into water meter')}
              className="p-3.5 rounded-xl border border-slate-800 bg-[#0c101d] hover:border-rose-500/40 text-left transition-all active:scale-95 disabled:opacity-50"
            >
              <div className="text-xs font-bold text-white mb-1">⚡ Outlier Spike</div>
              <p className="text-[10px] text-slate-400">Tests Tier 1 rate-of-change limiters.</p>
            </button>

            <button
              disabled={!!simulatingAttack}
              onClick={() => handleSimulate('Cloned Certificate', 'Presents legitimate cert concurrently from rogue IP')}
              className="p-3.5 rounded-xl border border-slate-800 bg-[#0c101d] hover:border-amber-500/40 text-left transition-all active:scale-95 disabled:opacity-50"
            >
              <div className="text-xs font-bold text-white mb-1">🔓 Cloned Cert</div>
              <p className="text-[10px] text-slate-400">Triggers automated cert revocation.</p>
            </button>

            <button
              disabled={!!simulatingAttack}
              onClick={() => handleSimulate('Rogue Topic Publish', 'Device attempts writing outside allowed ACL path')}
              className="p-3.5 rounded-xl border border-slate-800 bg-[#0c101d] hover:border-purple-500/40 text-left transition-all active:scale-95 disabled:opacity-50"
            >
              <div className="text-xs font-bold text-white mb-1">🔀 Rogue Topic</div>
              <p className="text-[10px] text-slate-400">Tests broker topic regex filter.</p>
            </button>
          </div>

          {simFeedback && (
            <div className="mt-4 p-3 rounded-xl bg-slate-900 border border-cyan-500/30 text-xs font-mono text-cyan-300 flex items-center gap-2 animate-fadeIn">
              <Activity className="w-4 h-4 text-cyan-400 animate-spin" />
              <span>{simFeedback}</span>
            </div>
          )}
        </div>
      </section>

      {/* 9. Testimonials & SOC Reviews (Editorial style) */}
      <section id="testimonials" className="py-24 max-w-6xl mx-auto px-4 sm:px-6">
        <div className="text-center max-w-2xl mx-auto mb-16">
          <span className="text-xs font-mono uppercase tracking-widest text-cyan-400">Industry Endorsements</span>
          <h2 className="text-3xl sm:text-5xl font-serif text-white mt-2">
            Trusted by lead security architects.
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="p-6 rounded-2xl border border-slate-800 bg-[#0d121f] flex flex-col justify-between">
            <p className="text-xs text-slate-300 leading-relaxed font-light">
              “NEXORA eliminated all shared credential risks across our 200 distributed telemetry nodes. Certificate rotation is completely transparent to our field team.”
            </p>
            <div className="mt-6 pt-4 border-t border-slate-800 flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-cyan-950 border border-cyan-700/50 flex items-center justify-center font-bold text-xs text-cyan-400">
                ER
              </div>
              <div>
                <p className="text-xs font-bold text-white">Elena Rostova</p>
                <p className="text-[10px] text-slate-400">Principal OT Security Architect</p>
              </div>
            </div>
          </div>

          <div className="p-6 rounded-2xl border border-slate-800 bg-[#0d121f] flex flex-col justify-between">
            <p className="text-xs text-slate-300 leading-relaxed font-light">
              “The human-in-the-loop safety approval gate saved us from accidental canal actuator shutdowns during sensor recalibrations. Critical infrastructure requires this level of care.”
            </p>
            <div className="mt-6 pt-4 border-t border-slate-800 flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-blue-950 border border-blue-700/50 flex items-center justify-center font-bold text-xs text-blue-400">
                AT
              </div>
              <div>
                <p className="text-xs font-bold text-white">Dr. Aris Thorne</p>
                <p className="text-[10px] text-slate-400">SCADA Operations Director</p>
              </div>
            </div>
          </div>

          <div className="p-6 rounded-2xl border border-slate-800 bg-[#0d121f] flex flex-col justify-between">
            <p className="text-xs text-slate-300 leading-relaxed font-light">
              “SHAP explainability transformed our alert triage time from 45 minutes to under 30 seconds. We pinpoint the exact physical metric before dispatching field technicians.”
            </p>
            <div className="mt-6 pt-4 border-t border-slate-800 flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-purple-950 border border-purple-700/50 flex items-center justify-center font-bold text-xs text-purple-400">
                MV
              </div>
              <div>
                <p className="text-xs font-bold text-white">Marcus Vance</p>
                <p className="text-[10px] text-slate-400">Lead Threat Analyst</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 10. Bottom Conversion Banner */}
      <section className="py-24 border-t border-slate-800/80 bg-gradient-to-b from-[#07090e] to-[#0e1322] text-center">
        <div className="max-w-4xl mx-auto px-4 sm:px-6">
          <h2 className="text-4xl sm:text-6xl font-serif text-white tracking-tight">
            Experience zero-trust IoT defense today.
          </h2>
          <p className="mt-4 text-base sm:text-lg text-slate-300 font-light max-w-xl mx-auto">
            Inspect live device telemetry, verify cryptographic certificates, and test attack playbooks in our real-time interactive command center.
          </p>
          <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-4">
            <button
              onClick={() => onEnterApp('overview')}
              className="px-8 py-4 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-slate-950 font-bold text-sm shadow-cyber-glow transition-all active:scale-95 flex items-center gap-2"
            >
              <span>Enter Live SOC Command Center</span>
              <ArrowRight className="w-4 h-4" />
            </button>
            <button
              onClick={() => onEnterApp('pki')}
              className="px-8 py-4 rounded-xl border border-slate-700 bg-slate-900/90 hover:bg-slate-800 text-slate-200 font-semibold text-sm transition-all active:scale-95"
            >
              <span>View PKI Authority</span>
            </button>
          </div>
        </div>
      </section>

      {/* 11. Footer */}
      <footer className="border-t border-slate-800/80 bg-[#05070a] py-12 px-4 sm:px-8 text-xs text-slate-400">
        <div className="max-w-6xl mx-auto grid grid-cols-2 md:grid-cols-5 gap-8">
          <div className="col-span-2 space-y-3">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg bg-slate-900 border border-cyan-500/30 flex items-center justify-center p-0.5">
                <img src="/nexora.png" alt="NEXORA Logo" className="w-full h-full object-contain" />
              </div>
              <span className="font-bold text-white font-mono text-sm">NEXORA</span>
            </div>
            <p className="text-slate-400 text-xs max-w-sm">
              Multi-tenant IoT device fleet security, certificate-based mTLS identity, and explainable behavioral anomaly detection.
            </p>
            <p className="text-slate-500 text-[11px]">
              © {new Date().getFullYear()} NEXORA Enterprise Security Platform. All rights reserved.
            </p>
          </div>

          <div>
            <h5 className="font-bold text-white uppercase text-[11px] mb-3">Platform</h5>
            <ul className="space-y-2 text-xs">
              <li><button onClick={() => onEnterApp('overview')} className="hover:text-cyan-400 transition-colors">SOC Command</button></li>
              <li><button onClick={() => onEnterApp('devices')} className="hover:text-cyan-400 transition-colors">Device Registry</button></li>
              <li><button onClick={() => onEnterApp('incidents')} className="hover:text-cyan-400 transition-colors">Incident Queue</button></li>
              <li><button onClick={() => onEnterApp('ml-anomalies')} className="hover:text-cyan-400 transition-colors">ML Engine</button></li>
            </ul>
          </div>

          <div>
            <h5 className="font-bold text-white uppercase text-[11px] mb-3">Security</h5>
            <ul className="space-y-2 text-xs">
              <li><button onClick={() => onEnterApp('pki')} className="hover:text-cyan-400 transition-colors">PKI Authority</button></li>
              <li><button onClick={() => onEnterApp('firmware')} className="hover:text-cyan-400 transition-colors">Signed OTA</button></li>
              <li><button onClick={() => onEnterApp('audit')} className="hover:text-cyan-400 transition-colors">Audit Ledger</button></li>
              <li><button onClick={() => onEnterApp('sandbox')} className="hover:text-cyan-400 transition-colors">Attack Sandbox</button></li>
            </ul>
          </div>

          <div>
            <h5 className="font-bold text-white uppercase text-[11px] mb-3">Deployments</h5>
            <ul className="space-y-2 text-xs">
              <li><a href="https://nexorraa.vercel.app/" target="_blank" rel="noreferrer" className="hover:text-cyan-400 transition-colors flex items-center gap-1">Vercel Edge <ExternalLink className="w-3 h-3" /></a></li>
              <li><a href="https://nexorraa.onrender.com/" target="_blank" rel="noreferrer" className="hover:text-cyan-400 transition-colors flex items-center gap-1">Render API <ExternalLink className="w-3 h-3" /></a></li>
              <li><a href="https://github.com/allhailgachuri/nexora" target="_blank" rel="noreferrer" className="hover:text-cyan-400 transition-colors flex items-center gap-1">GitHub Repo <ExternalLink className="w-3 h-3" /></a></li>
            </ul>
          </div>
        </div>
      </footer>
    </div>
  );
};
