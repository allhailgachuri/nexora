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
      <div className="p-10 text-center organic-glass-card text-[#708A7C] text-xs">
        <Layers className="w-8 h-8 text-[#2E4036] mx-auto mb-2" />
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
      <div className="flex items-center justify-between p-4 rounded-[2rem] bg-[#142019] border border-[#26372E]">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-xl bg-[#2E4036] text-[#9DB3A6]">
            <Layers className="w-4 h-4" />
          </div>
          <div>
            <span className="font-bold text-white">Device Shadow State Document</span>
            <span className="ml-2 text-[11px] font-mono text-[#708A7C]">Version: {shadow.version}</span>
          </div>
        </div>
        <div className="flex items-center gap-2 text-[11px]">
          <span className="text-[#708A7C]">Sync Status:</span>
          <span className={`font-semibold px-3 py-0.5 rounded-full font-mono ${
            hasDelta ? 'bg-[#E85D04]/20 text-[#E85D04] border border-[#E85D04]/40' : 'bg-[#30D158]/20 text-[#30D158] border border-[#30D158]/40'
          }`}>
            {hasDelta ? 'DELTA PENDING SYNC' : 'IN SYNC'}
          </span>
        </div>
      </div>

      {error && (
        <div className="p-3.5 rounded-2xl bg-[#E30000]/15 border border-[#E30000]/30 text-[#E30000] text-xs">
          {error}
        </div>
      )}

      {/* Side-by-Side: Desired vs Reported vs Delta */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Desired State */}
        <div className="p-4 rounded-[2rem] bg-[#142019] border border-[#26372E] flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-2.5 border-b border-[#26372E] mb-2.5">
              <span className="font-bold text-[#CC5833] text-[11px] font-mono">Desired Configuration</span>
              <span className="text-[10px] text-[#708A7C] font-mono">{new Date(shadow.lastDesiredAt).toLocaleTimeString()}</span>
            </div>
            <textarea
              rows={8}
              value={desiredJson}
              onChange={(e) => setDesiredJson(e.target.value)}
              className="w-full bg-[#111614] border border-[#26372E] rounded-2xl p-3 font-mono text-[11px] text-[#F4F2EC] focus:outline-none focus:border-[#CC5833] resize-none"
            />
          </div>
          <button
            onClick={handleSave}
            disabled={isSaving}
            className="magnetic-btn mt-3 w-full flex items-center justify-center gap-2 py-2.5 rounded-full bg-[#CC5833] hover:bg-[#B54926] text-white font-semibold transition-all disabled:opacity-50 shadow-clay-glow"
          >
            {isSaving ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Save className="w-3.5 h-3.5" />}
            <span>Update Desired State</span>
          </button>
        </div>

        {/* Reported State */}
        <div className="p-4 rounded-[2rem] bg-[#142019] border border-[#26372E]">
          <div className="flex items-center justify-between pb-2.5 border-b border-[#26372E] mb-2.5">
            <span className="font-bold text-[#30D158] text-[11px] font-mono">Reported Hardware State</span>
            <span className="text-[10px] text-[#708A7C] font-mono">{new Date(shadow.lastReportedAt).toLocaleTimeString()}</span>
          </div>
          <pre className="p-3 bg-[#111614] border border-[#26372E] rounded-2xl font-mono text-[11px] text-[#30D158] overflow-x-auto max-h-56">
            {JSON.stringify(shadow.reportedState, null, 2)}
          </pre>
        </div>

        {/* Delta State */}
        <div className="p-4 rounded-[2rem] bg-[#142019] border border-[#26372E]">
          <div className="flex items-center justify-between pb-2.5 border-b border-[#26372E] mb-2.5">
            <span className="font-bold text-[#E85D04] text-[11px] font-mono">Delta (Pending Deviation)</span>
            <span className="text-[10px] text-[#708A7C] font-mono">Shadow Model</span>
          </div>
          <pre className="p-3 bg-[#111614] border border-[#26372E] rounded-2xl font-mono text-[11px] text-[#E85D04] overflow-x-auto max-h-56">
            {JSON.stringify(shadow.delta || {}, null, 2)}
          </pre>
        </div>
      </div>
    </div>
  );
};
