import React, { useState } from 'react';
import { DeviceShadow as DeviceShadowType } from '../../types';
import { Layers, Save, RefreshCw } from 'lucide-react';

interface DeviceShadowProps {
  shadow?: DeviceShadowType;
  onSaveDesired: (desired: Record<string, any>) => Promise<void>;
}

export const DeviceShadow: React.FC<DeviceShadowProps> = ({ shadow, onSaveDesired }) => {
  const [desiredJson, setDesiredJson] = useState(
    JSON.stringify(shadow?.desiredState || {}, null, 2)
  );
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!shadow) {
    return (
      <div className="p-8 text-center glass-panel rounded-xl text-slate-400 text-xs">
        <Layers className="w-8 h-8 text-slate-500 mx-auto mb-2" />
        No device shadow initialized.
      </div>
    );
  }

  const handleSave = async () => {
    try {
      setError(null);
      const parsed = JSON.parse(desiredJson);
      setIsSaving(true);
      await onSaveDesired(parsed);
      setIsSaving(false);
    } catch (err: any) {
      setError(`Invalid JSON syntax: ${err.message}`);
      setIsSaving(false);
    }
  };

  const hasDelta = shadow.delta && Object.keys(shadow.delta).length > 0;

  return (
    <div className="space-y-4 text-xs">
      {/* Shadow Status Header */}
      <div className="flex items-center justify-between p-3 rounded-xl bg-[#0c101a] border border-slate-800">
        <div className="flex items-center gap-3">
          <Layers className="w-4 h-4 text-cyan-400" />
          <div>
            <span className="font-bold text-white">Device Shadow Document</span>
            <span className="ml-2 text-[11px] font-mono text-slate-400">Version: {shadow.version}</span>
          </div>
        </div>
        <div className="flex items-center gap-2 text-[11px]">
          <span className="text-slate-400">Sync Status:</span>
          <span className={`font-semibold px-2 py-0.5 rounded ${
            hasDelta ? 'bg-amber-950/60 text-amber-400 border border-amber-700/50' : 'bg-emerald-950/60 text-emerald-400 border border-emerald-700/50'
          }`}>
            {hasDelta ? 'DELTA PENDING SYNC' : 'IN SYNC'}
          </span>
        </div>
      </div>

      {error && (
        <div className="p-2.5 rounded-lg bg-red-950/50 border border-red-500/50 text-red-300 text-xs">
          {error}
        </div>
      )}

      {/* Side-by-Side: Desired vs Reported vs Delta */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-3">
        {/* Desired State */}
        <div className="p-3 rounded-xl bg-[#0c101a] border border-slate-800 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-2 border-b border-slate-800 mb-2">
              <span className="font-bold text-cyan-400 text-[11px]">Desired Config</span>
              <span className="text-[10px] text-slate-400">{new Date(shadow.lastDesiredAt).toLocaleTimeString()}</span>
            </div>
            <textarea
              rows={8}
              value={desiredJson}
              onChange={(e) => setDesiredJson(e.target.value)}
              className="w-full bg-[#070a10] border border-slate-800 rounded-lg p-2 font-mono text-[11px] text-cyan-200 focus:outline-none focus:border-cyan-500 resize-none"
            />
          </div>
          <button
            onClick={handleSave}
            disabled={isSaving}
            className="mt-2 w-full flex items-center justify-center gap-1.5 py-1.5 rounded-lg bg-cyan-950 hover:bg-cyan-900 border border-cyan-500/50 text-cyan-300 font-semibold transition-all disabled:opacity-50"
          >
            {isSaving ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Save className="w-3.5 h-3.5" />}
            <span>Update Desired State</span>
          </button>
        </div>

        {/* Reported State */}
        <div className="p-3 rounded-xl bg-[#0c101a] border border-slate-800">
          <div className="flex items-center justify-between pb-2 border-b border-slate-800 mb-2">
            <span className="font-bold text-emerald-400 text-[11px]">Reported Telemetry State</span>
            <span className="text-[10px] text-slate-400">{new Date(shadow.lastReportedAt).toLocaleTimeString()}</span>
          </div>
          <pre className="p-2 bg-[#070a10] border border-slate-800 rounded-lg font-mono text-[11px] text-emerald-300 overflow-x-auto max-h-56">
            {JSON.stringify(shadow.reportedState, null, 2)}
          </pre>
        </div>

        {/* Delta State */}
        <div className="p-3 rounded-xl bg-[#0c101a] border border-slate-800">
          <div className="flex items-center justify-between pb-2 border-b border-slate-800 mb-2">
            <span className="font-bold text-amber-400 text-[11px]">Delta (Pending Difference)</span>
            <span className="text-[10px] text-slate-400">AWS IoT Shadow Model</span>
          </div>
          <pre className="p-2 bg-[#070a10] border border-slate-800 rounded-lg font-mono text-[11px] text-amber-300 overflow-x-auto max-h-56">
            {JSON.stringify(shadow.delta || {}, null, 2)}
          </pre>
        </div>
      </div>
    </div>
  );
};
