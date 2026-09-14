import React, { useState, useEffect } from 'react';
import { ApiService } from '../../services/api';
import { Device } from '../../types';
import {
  Crosshair,
  Flame,
  Zap,
  Play,
  Pause,
  RotateCcw,
  Radio,
  Snowflake,
  TrendingUp,
  ShieldAlert,
  Lock
} from 'lucide-react';

export const AttackSandbox: React.FC = () => {
  const [devices, setDevices] = useState<Device[]>([]);
  const [simStatus, setSimStatus] = useState<any>(null);
  const [selectedDevice, setSelectedDevice] = useState<string>('');
  const [selectedTargetDevice, setSelectedTargetDevice] = useState<string>('');
  const [driftField, setDriftField] = useState('soil_moisture_pct');
  const [spikeField, setSpikeField] = useState('line_pressure_psi');
  const [spikeVal, setSpikeVal] = useState(320);
  const [terminalLogs, setTerminalLogs] = useState<Array<{ time: string; text: string; kind: string }>>([]);
  const [isExecuting, setIsExecuting] = useState(false);

  const loadData = async () => {
    try {
      const [devList, status] = await Promise.all([
        ApiService.getDevices(),
        ApiService.getSimulatorStatus()
      ]);
      setDevices(devList);
      setSimStatus(status);
      if (devList.length > 0 && !selectedDevice) {
        setSelectedDevice(devList[0].id);
        setSelectedTargetDevice(devList[1]?.id || devList[0].id);
      }
    } catch {
      // ignore
    }
  };

  useEffect(() => {
    loadData();
    const interval = setInterval(loadData, 4000);
    return () => clearInterval(interval);
  }, []);

  const addLog = (text: string, kind: 'info' | 'warn' | 'danger' | 'success' = 'info') => {
    setTerminalLogs(prev => [
      { time: new Date().toLocaleTimeString(), text, kind },
      ...prev.slice(0, 40)
    ]);
  };

  const toggleSim = async () => {
    const nextState = !simStatus?.isRunning;
    await ApiService.toggleSimulator(nextState);
    addLog(`Simulator background generator ${nextState ? 'STARTED' : 'PAUSED'}`, nextState ? 'success' : 'warn');
    await loadData();
  };

  const handleInjectDrift = async () => {
    setIsExecuting(true);
    try {
      const res = await ApiService.injectSimulatorAnomaly('inject/drift', {
        deviceId: selectedDevice,
        field: driftField,
        rate: 3.2
      });
      addLog(res.message || 'Sensor drift anomaly injected', 'warn');
    } finally {
      setIsExecuting(false);
    }
  };

  const handleInjectSpike = async () => {
    setIsExecuting(true);
    try {
      const res = await ApiService.injectSimulatorAnomaly('inject/spike', {
        deviceId: selectedDevice,
        field: spikeField,
        spikeValue: spikeVal
      });
      addLog(res.message || 'Extreme outlier spike injected', 'danger');
    } finally {
      setIsExecuting(false);
    }
  };

  const handleInjectFreeze = async () => {
    setIsExecuting(true);
    try {
      const res = await ApiService.injectSimulatorAnomaly('inject/freeze', {
        deviceId: selectedDevice
      });
      addLog(res.message || 'Frozen sensor anomaly injected', 'warn');
    } finally {
      setIsExecuting(false);
    }
  };

  const handleClonedCertAttack = async () => {
    setIsExecuting(true);
    try {
      const res = await ApiService.injectSimulatorAnomaly('attack/cloned-cert', {
        deviceId: selectedDevice
      });
      addLog(res.message || 'Cloned certificate attack simulated', 'danger');
    } finally {
      setIsExecuting(false);
    }
  };

  const handleRogueTopicAttack = async () => {
    setIsExecuting(true);
    try {
      const res = await ApiService.injectSimulatorAnomaly('attack/rogue-topic', {
        sourceDeviceId: selectedDevice,
        targetDeviceId: selectedTargetDevice
      });
      addLog(res.message || 'Rogue topic spoofing attack simulated', 'danger');
    } finally {
      setIsExecuting(false);
    }
  };

  const handleClearAll = async () => {
    await ApiService.injectSimulatorAnomaly('clear', {});
    addLog('Cleared all active simulation anomalies across fleet', 'info');
  };

  return (
    <div className="space-y-6 text-xs">
      {/* Header & Simulator Generator Status */}
      <div className="glass-panel rounded-2xl p-5 border border-cyan-500/30 bg-cyan-950/10">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-cyan-800/40">
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-xl bg-cyan-500/20 border border-cyan-500/40 text-cyan-400">
              <Crosshair className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base font-bold text-white tracking-wide">
                  Interactive Attack & Anomaly Injection Sandbox
                </h2>
                <span className="px-2 py-0.5 rounded bg-cyan-950 text-cyan-300 border border-cyan-800 text-[10px] font-bold">
                  Live Telemetry Simulator
                </span>
              </div>
              <p className="text-slate-300 text-[11px] mt-0.5">
                Simulate realistic adversarial conditions, credential cloning, topic impersonation, and sensor drift to test real-time detection in action.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 self-start md:self-auto">
            <button
              onClick={toggleSim}
              className={`flex items-center gap-1.5 px-4 py-2 rounded-xl font-semibold transition-all shadow-sm ${
                simStatus?.isRunning
                  ? 'bg-amber-950/60 hover:bg-amber-900 border border-amber-500/40 text-amber-300'
                  : 'bg-emerald-950/60 hover:bg-emerald-900 border border-emerald-500/40 text-emerald-300'
              }`}
            >
              {simStatus?.isRunning ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
              <span>{simStatus?.isRunning ? 'Pause Generator' : 'Resume Generator'}</span>
            </button>

            <button
              onClick={handleClearAll}
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold border border-slate-700"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Reset Anomalies</span>
            </button>
          </div>
        </div>

        {/* Status Pills */}
        <div className="flex flex-wrap items-center gap-4 mt-4 font-mono text-[11px]">
          <div className="flex items-center gap-2">
            <span className="text-slate-400">Generator Heartbeat:</span>
            <span className={`font-bold ${simStatus?.isRunning ? 'text-emerald-400 animate-pulse' : 'text-slate-500'}`}>
              {simStatus?.isRunning ? `TICK #${simStatus.tickCount} (3000ms)` : 'PAUSED'}
            </span>
          </div>
          <div>•</div>
          <div>
            <span className="text-slate-400">Active Drifts:</span>{' '}
            <span className="text-amber-400 font-bold">{simStatus?.activeDrifts || 0}</span>
          </div>
          <div>•</div>
          <div>
            <span className="text-slate-400">Frozen Sensors:</span>{' '}
            <span className="text-cyan-400 font-bold">{simStatus?.frozenDevices || 0}</span>
          </div>
        </div>
      </div>

      {/* Attack Control Matrix */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left Col: Anomaly Injectors */}
        <div className="space-y-4">
          {/* Target Selector */}
          <div className="glass-panel rounded-xl p-4 border border-slate-800 space-y-2">
            <label className="block text-slate-300 font-bold">Select Target Fleet Node</label>
            <select
              value={selectedDevice}
              onChange={e => setSelectedDevice(e.target.value)}
              className="w-full bg-[#0c101a] border border-slate-700 rounded-lg p-2.5 text-white font-mono focus:outline-none focus:border-cyan-500"
            >
              {devices.map(d => (
                <option key={d.id} value={d.id}>
                  {d.serialNumber} - {d.name} ({d.lifecycleState})
                </option>
              ))}
            </select>
          </div>

          {/* Injector 1: Sensor Drift */}
          <div className="glass-panel rounded-xl p-4 border border-slate-800 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-amber-400" />
                <h4 className="font-bold text-white text-sm">1. Inject Sensor Drift Anomaly</h4>
              </div>
              <span className="text-[10px] text-purple-300 font-mono">Tier 2 ML Detection</span>
            </div>
            <p className="text-slate-400 text-[11px]">
              Applies a continuous subtle positive drift slope across ticks. Triggers ML Isolation Forest without tripping static hard limits.
            </p>
            <div className="flex gap-2">
              <input
                type="text"
                value={driftField}
                onChange={e => setDriftField(e.target.value)}
                placeholder="Field name"
                className="flex-1 bg-[#0c101a] border border-slate-700 rounded-lg p-2 text-white font-mono"
              />
              <button
                disabled={isExecuting}
                onClick={handleInjectDrift}
                className="px-4 py-2 rounded-lg bg-amber-600 hover:bg-amber-500 text-white font-bold transition-all disabled:opacity-50"
              >
                Inject Drift
              </button>
            </div>
          </div>

          {/* Injector 2: Outlier Spike */}
          <div className="glass-panel rounded-xl p-4 border border-slate-800 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Zap className="w-4 h-4 text-rose-400" />
                <h4 className="font-bold text-white text-sm">2. Inject Extreme Outlier Spike</h4>
              </div>
              <span className="text-[10px] text-cyan-300 font-mono">Tier 1 Inline Rules</span>
            </div>
            <p className="text-slate-400 text-[11px]">
              Sends an immediate out-of-bounds telemetry spike that violates schema bounds and triggers instant inline rule violations.
            </p>
            <div className="flex gap-2">
              <input
                type="text"
                value={spikeField}
                onChange={e => setSpikeField(e.target.value)}
                placeholder="Field name"
                className="flex-1 bg-[#0c101a] border border-slate-700 rounded-lg p-2 text-white font-mono"
              />
              <input
                type="number"
                value={spikeVal}
                onChange={e => setSpikeVal(Number(e.target.value))}
                placeholder="Spike Value"
                className="w-24 bg-[#0c101a] border border-slate-700 rounded-lg p-2 text-white font-mono"
              />
              <button
                disabled={isExecuting}
                onClick={handleInjectSpike}
                className="px-4 py-2 rounded-lg bg-rose-600 hover:bg-rose-500 text-white font-bold transition-all disabled:opacity-50"
              >
                Inject Spike
              </button>
            </div>
          </div>

          {/* Injector 3: Stuck Sensor */}
          <div className="glass-panel rounded-xl p-4 border border-slate-800 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Snowflake className="w-4 h-4 text-cyan-400" />
                <h4 className="font-bold text-white text-sm">3. Inject Frozen / Stuck Sensor</h4>
              </div>
              <span className="text-[10px] text-cyan-300 font-mono">Zero-Jitter Rule</span>
            </div>
            <p className="text-slate-400 text-[11px]">
              Fixes readings with zero natural sensor noise across multiple ticks to trigger frozen hardware detection.
            </p>
            <button
              disabled={isExecuting}
              onClick={handleInjectFreeze}
              className="w-full py-2 rounded-lg bg-cyan-950 hover:bg-cyan-900 border border-cyan-500/50 text-cyan-300 font-bold transition-all disabled:opacity-50"
            >
              Freeze Sensor Signals
            </button>
          </div>
        </div>

        {/* Right Col: Cyber Attacks & Live Sandbox Terminal */}
        <div className="space-y-4">
          {/* Cyber Attack 1: Cloned Cert */}
          <div className="glass-panel rounded-xl p-4 border border-rose-500/40 bg-rose-950/10 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <ShieldAlert className="w-4 h-4 text-rose-400" />
                <h4 className="font-bold text-white text-sm">4. Cloned Certificate Attack (Concurrent IPs)</h4>
              </div>
              <span className="text-[10px] text-rose-300 font-mono">PKI Identity Breach</span>
            </div>
            <p className="text-slate-400 text-[11px]">
              Simulates presentation of the target device's valid X.509 certificate simultaneously from an unauthorized external IP (<code className="text-cyan-300">198.51.100.42</code>).
            </p>
            <button
              disabled={isExecuting}
              onClick={handleClonedCertAttack}
              className="w-full py-2 rounded-lg bg-rose-950 hover:bg-rose-900 border border-rose-500 text-rose-200 font-bold transition-all shadow-danger-glow disabled:opacity-50"
            >
              Simulate Cloned Credential Connection
            </button>
          </div>

          {/* Cyber Attack 2: Rogue Topic Spoofing */}
          <div className="glass-panel rounded-xl p-4 border border-amber-500/40 bg-amber-950/10 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Lock className="w-4 h-4 text-amber-400" />
                <h4 className="font-bold text-white text-sm">5. Cross-Device Topic Spoofing Attack</h4>
              </div>
              <span className="text-[10px] text-amber-300 font-mono">Broker ACL Violation</span>
            </div>
            <p className="text-slate-400 text-[11px]">
              Device A attempts to publish directly to Device B's telemetry namespace. The broker ACL engine denies the frame and flags an impersonation event.
            </p>
            <div className="space-y-2">
              <select
                value={selectedTargetDevice}
                onChange={e => setSelectedTargetDevice(e.target.value)}
                className="w-full bg-[#0c101a] border border-slate-700 rounded-lg p-2 text-white font-mono text-[11px]"
              >
                {devices.map(d => (
                  <option key={d.id} value={d.id}>
                    Target Topic: {d.serialNumber} ({d.id})
                  </option>
                ))}
              </select>
              <button
                disabled={isExecuting}
                onClick={handleRogueTopicAttack}
                className="w-full py-2 rounded-lg bg-amber-950 hover:bg-amber-900 border border-amber-500 text-amber-200 font-bold transition-all disabled:opacity-50"
              >
                Attempt Rogue Topic Publish
              </button>
            </div>
          </div>

          {/* Live Simulator Event Terminal */}
          <div className="glass-panel rounded-2xl p-4 border border-slate-800 space-y-2">
            <div className="flex items-center justify-between pb-2 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <Radio className="w-4 h-4 text-emerald-400 animate-pulse" />
                <span className="font-bold text-white uppercase text-[11px]">Sandbox Event Bus Console</span>
              </div>
              <span className="text-[10px] font-mono text-slate-400">{terminalLogs.length} Events</span>
            </div>

            <div className="p-2.5 rounded-lg bg-[#070a10] border border-slate-800 font-mono text-[11px] h-48 overflow-y-auto space-y-1">
              {terminalLogs.length === 0 ? (
                <div className="text-slate-500 text-center py-10 font-sans">
                  Ready. Trigger any attack above or let background generator stream...
                </div>
              ) : (
                terminalLogs.map((log, idx) => {
                  const color = {
                    danger: 'text-rose-400',
                    warn: 'text-amber-400',
                    success: 'text-emerald-400',
                    info: 'text-cyan-300'
                  }[log.kind as 'danger'] || 'text-slate-300';

                  return (
                    <div key={idx} className="flex items-start gap-2">
                      <span className="text-slate-500 select-none">[{log.time}]</span>
                      <span className={color}>{log.text}</span>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
