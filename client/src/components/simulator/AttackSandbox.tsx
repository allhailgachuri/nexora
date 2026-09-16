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
    addLog(`Simulator generator ${nextState ? 'STARTED' : 'PAUSED'}`, nextState ? 'success' : 'warn');
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
      {/* Header & Simulator Status */}
      <div className="organic-glass-card p-6 border-[#CC5833]/30">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-[#26372E]">
          <div className="flex items-center gap-4">
            <div className="p-3.5 rounded-2xl bg-[#CC5833]/15 border border-[#CC5833]/30 text-[#CC5833]">
              <Crosshair className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-3">
                <h2 className="text-base font-bold text-white tracking-tight">
                  Interactive Attack & Anomaly Injection Sandbox
                </h2>
                <span className="px-3 py-0.5 rounded-full bg-[#2E4036] text-[#30D158] border border-[#708A7C]/30 text-[10px] font-bold font-mono">
                  Live Telemetry Simulator
                </span>
              </div>
              <p className="text-[#94A39B] text-xs mt-1">
                Simulate realistic adversarial conditions, credential cloning, topic impersonation, and sensor drift to test real-time detection in action.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2.5 self-start md:self-auto">
            <button
              onClick={toggleSim}
              className={`magnetic-btn flex items-center gap-2 px-5 py-2.5 rounded-full font-semibold transition-all shadow-sm ${
                simStatus?.isRunning
                  ? 'bg-[#E85D04]/20 hover:bg-[#E85D04]/30 border border-[#E85D04]/40 text-[#E85D04]'
                  : 'bg-[#30D158]/20 hover:bg-[#30D158]/30 border border-[#30D158]/40 text-[#30D158]'
              }`}
            >
              {simStatus?.isRunning ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
              <span>{simStatus?.isRunning ? 'Pause Generator' : 'Resume Generator'}</span>
            </button>

            <button
              onClick={handleClearAll}
              className="magnetic-btn flex items-center gap-2 px-4 py-2.5 rounded-full bg-[#142019] hover:bg-[#1E2622] text-[#CBD4CF] hover:text-white font-semibold border border-[#26372E]"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Reset State</span>
            </button>
          </div>
        </div>

        {/* Status Pills */}
        <div className="flex flex-wrap items-center gap-4 mt-4 font-mono text-[11px]">
          <div className="flex items-center gap-2">
            <span className="text-[#708A7C]">Generator Heartbeat:</span>
            <span className={`font-bold ${simStatus?.isRunning ? 'text-[#30D158] animate-pulse' : 'text-[#708A7C]'}`}>
              {simStatus?.isRunning ? `TICK #${simStatus.tickCount} (3000ms)` : 'PAUSED'}
            </span>
          </div>
          <div className="text-[#26372E]">•</div>
          <div>
            <span className="text-[#708A7C]">Active Drifts:</span>{' '}
            <span className="text-[#CC5833] font-bold">{simStatus?.activeDrifts || 0}</span>
          </div>
          <div className="text-[#26372E]">•</div>
          <div>
            <span className="text-[#708A7C]">Frozen Sensors:</span>{' '}
            <span className="text-[#30D158] font-bold">{simStatus?.frozenDevices || 0}</span>
          </div>
        </div>
      </div>

      {/* Attack Control Matrix */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left Col: Anomaly Injectors */}
        <div className="space-y-4">
          {/* Target Selector */}
          <div className="organic-glass-card p-5 space-y-2.5">
            <label className="block text-white font-bold">Select Target Fleet Node</label>
            <select
              value={selectedDevice}
              onChange={e => setSelectedDevice(e.target.value)}
              className="w-full bg-[#142019] border border-[#26372E] rounded-full px-4 py-2.5 text-white font-mono focus:outline-none focus:border-[#CC5833] cursor-pointer"
            >
              {devices.map(d => (
                <option key={d.id} value={d.id} className="bg-[#171C19]">
                  {d.serialNumber} - {d.name} ({d.lifecycleState})
                </option>
              ))}
            </select>
          </div>

          {/* Injector 1: Sensor Drift */}
          <div className="organic-glass-card p-5 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-[#E85D04]" />
                <h4 className="font-bold text-white text-sm">1. Inject Sensor Drift Anomaly</h4>
              </div>
              <span className="text-[10px] text-[#CC5833] font-mono">Tier 2 ML Detection</span>
            </div>
            <p className="text-[#94A39B] text-xs">
              Applies a continuous subtle positive drift slope across ticks. Triggers ML Isolation Forest without tripping static hard limits.
            </p>
            <div className="flex gap-2">
              <input
                type="text"
                value={driftField}
                onChange={e => setDriftField(e.target.value)}
                placeholder="Field name"
                className="flex-1 bg-[#142019] border border-[#26372E] rounded-full px-4 py-2 text-white font-mono"
              />
              <button
                disabled={isExecuting}
                onClick={handleInjectDrift}
                className="magnetic-btn px-6 py-2 rounded-full bg-[#E85D04] hover:bg-[#D65203] text-white font-bold transition-all disabled:opacity-50 shadow-sm"
              >
                Inject Drift
              </button>
            </div>
          </div>

          {/* Injector 2: Outlier Spike */}
          <div className="organic-glass-card p-5 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Zap className="w-4 h-4 text-[#CC5833]" />
                <h4 className="font-bold text-white text-sm">2. Inject Extreme Outlier Spike</h4>
              </div>
              <span className="text-[10px] text-[#30D158] font-mono">Tier 1 Inline Rules</span>
            </div>
            <p className="text-[#94A39B] text-xs">
              Sends an immediate out-of-bounds telemetry spike that violates schema bounds and triggers instant inline rule violations.
            </p>
            <div className="flex gap-2">
              <input
                type="text"
                value={spikeField}
                onChange={e => setSpikeField(e.target.value)}
                placeholder="Field name"
                className="flex-1 bg-[#142019] border border-[#26372E] rounded-full px-4 py-2 text-white font-mono"
              />
              <input
                type="number"
                value={spikeVal}
                onChange={e => setSpikeVal(Number(e.target.value))}
                placeholder="Spike Value"
                className="w-24 bg-[#142019] border border-[#26372E] rounded-full px-3 py-2 text-white font-mono text-center"
              />
              <button
                disabled={isExecuting}
                onClick={handleInjectSpike}
                className="magnetic-btn px-6 py-2 rounded-full bg-[#CC5833] hover:bg-[#B54926] text-white font-bold transition-all disabled:opacity-50 shadow-clay-glow"
              >
                Inject Spike
              </button>
            </div>
          </div>

          {/* Injector 3: Stuck Sensor */}
          <div className="organic-glass-card p-5 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Snowflake className="w-4 h-4 text-[#30D158]" />
                <h4 className="font-bold text-white text-sm">3. Inject Frozen / Stuck Sensor</h4>
              </div>
              <span className="text-[10px] text-[#30D158] font-mono">Zero-Jitter Rule</span>
            </div>
            <p className="text-[#94A39B] text-xs">
              Fixes readings with zero natural sensor noise across multiple ticks to trigger frozen hardware detection.
            </p>
            <button
              disabled={isExecuting}
              onClick={handleInjectFreeze}
              className="magnetic-btn w-full py-2.5 rounded-full bg-[#142019] hover:bg-[#1E2622] border border-[#26372E] text-[#30D158] font-bold transition-all disabled:opacity-50"
            >
              Freeze Sensor Signals
            </button>
          </div>
        </div>

        {/* Right Col: Cyber Attacks & Live Sandbox Terminal */}
        <div className="space-y-4">
          {/* Cyber Attack 1: Cloned Cert */}
          <div className="organic-glass-card p-5 space-y-3 border-[#E30000]/30">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <ShieldAlert className="w-4 h-4 text-[#E30000]" />
                <h4 className="font-bold text-white text-sm">4. Cloned Certificate Attack (Concurrent IPs)</h4>
              </div>
              <span className="text-[10px] text-[#E30000] font-mono">PKI Identity Breach</span>
            </div>
            <p className="text-[#94A39B] text-xs">
              Simulates presentation of the target device's valid X.509 certificate simultaneously from an unauthorized external IP (<code className="text-[#30D158]">198.51.100.42</code>).
            </p>
            <button
              disabled={isExecuting}
              onClick={handleClonedCertAttack}
              className="magnetic-btn w-full py-2.5 rounded-full bg-[#E30000]/15 hover:bg-[#E30000]/25 border border-[#E30000]/40 text-[#E30000] font-bold transition-all disabled:opacity-50"
            >
              Simulate Cloned Credential Handshake
            </button>
          </div>

          {/* Cyber Attack 2: Rogue Topic Spoofing */}
          <div className="organic-glass-card p-5 space-y-3 border-[#E85D04]/30">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Lock className="w-4 h-4 text-[#E85D04]" />
                <h4 className="font-bold text-white text-sm">5. Cross-Device Topic Spoofing Attack</h4>
              </div>
              <span className="text-[10px] text-[#E85D04] font-mono">Broker ACL Violation</span>
            </div>
            <p className="text-[#94A39B] text-xs">
              Device A attempts to publish directly to Device B's telemetry namespace. The broker ACL engine denies the frame and flags an impersonation event.
            </p>
            <div className="space-y-2">
              <select
                value={selectedTargetDevice}
                onChange={e => setSelectedTargetDevice(e.target.value)}
                className="w-full bg-[#142019] border border-[#26372E] rounded-full px-4 py-2 text-white font-mono text-[11px] cursor-pointer"
              >
                {devices.map(d => (
                  <option key={d.id} value={d.id} className="bg-[#171C19]">
                    Target Namespace: {d.serialNumber} ({d.id})
                  </option>
                ))}
              </select>
              <button
                disabled={isExecuting}
                onClick={handleRogueTopicAttack}
                className="magnetic-btn w-full py-2.5 rounded-full bg-[#E85D04]/20 hover:bg-[#E85D04]/30 border border-[#E85D04]/40 text-[#E85D04] font-bold transition-all disabled:opacity-50"
              >
                Attempt Rogue Topic Publish
              </button>
            </div>
          </div>

          {/* Live Simulator Event Terminal */}
          <div className="organic-glass-card p-5 space-y-3">
            <div className="flex items-center justify-between pb-2 border-b border-[#26372E]">
              <div className="flex items-center gap-2">
                <Radio className="w-4 h-4 text-[#30D158] animate-pulse" />
                <span className="font-bold text-white uppercase text-[10px] font-mono">Sandbox Event Bus Console</span>
              </div>
              <span className="text-[10px] font-mono text-[#708A7C]">{terminalLogs.length} Events</span>
            </div>

            <div className="p-3 rounded-2xl bg-[#0E1411] border border-[#26372E] font-mono text-[11px] h-48 overflow-y-auto space-y-1.5">
              {terminalLogs.length === 0 ? (
                <div className="text-[#708A7C] text-center py-12 font-sans">
                  Ready. Trigger any attack vector above or let background generator stream...
                </div>
              ) : (
                terminalLogs.map((log, idx) => {
                  const color = {
                    danger: 'text-[#E30000]',
                    warn: 'text-[#E85D04]',
                    success: 'text-[#30D158]',
                    info: 'text-[#9DB3A6]'
                  }[log.kind as 'danger'] || 'text-[#CBD4CF]';

                  return (
                    <div key={idx} className="flex items-start gap-2">
                      <span className="text-[#708A7C] select-none">[{log.time}]</span>
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
