import React from 'react';
import { DeviceLifecycleState, SeverityLevel, IncidentStatus } from '../../types';

export const StateBadge: React.FC<{ state: DeviceLifecycleState }> = ({ state }) => {
  const map: Record<DeviceLifecycleState, { label: string; bg: string; text: string; border: string; dot: string }> = {
    REGISTERED: { label: 'Registered', bg: 'bg-blue-950/40', text: 'text-blue-400', border: 'border-blue-700/50', dot: 'bg-blue-400' },
    PROVISIONED: { label: 'Provisioned', bg: 'bg-cyan-950/40', text: 'text-cyan-400', border: 'border-cyan-700/50', dot: 'bg-cyan-400' },
    ACTIVE: { label: 'Active', bg: 'bg-emerald-950/40', text: 'text-emerald-400', border: 'border-emerald-700/50', dot: 'bg-emerald-400' },
    SUSPECTED: { label: 'Suspected', bg: 'bg-amber-950/40', text: 'text-amber-400', border: 'border-amber-700/50', dot: 'bg-amber-400' },
    QUARANTINED: { label: 'Quarantined', bg: 'bg-rose-950/40', text: 'text-rose-400', border: 'border-rose-700/50', dot: 'bg-rose-400' },
    REVOKED: { label: 'Revoked', bg: 'bg-purple-950/40', text: 'text-purple-400', border: 'border-purple-700/50', dot: 'bg-purple-400' },
    DECOMMISSIONED: { label: 'Decommissioned', bg: 'bg-slate-800/40', text: 'text-slate-400', border: 'border-slate-700/50', dot: 'bg-slate-500' }
  };

  const style = map[state] || map.REGISTERED;

  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium border ${style.bg} ${style.text} ${style.border}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${style.dot} ${state === 'ACTIVE' ? 'animate-pulse' : ''}`}></span>
      {style.label}
    </span>
  );
};

export const SeverityBadge: React.FC<{ severity: SeverityLevel }> = ({ severity }) => {
  const map: Record<SeverityLevel, { bg: string; text: string; border: string }> = {
    LOW: { bg: 'bg-slate-800/60', text: 'text-slate-300', border: 'border-slate-700' },
    MEDIUM: { bg: 'bg-blue-950/60', text: 'text-blue-400', border: 'border-blue-700/60' },
    HIGH: { bg: 'bg-amber-950/60', text: 'text-amber-400', border: 'border-amber-700/60' },
    CRITICAL: { bg: 'bg-red-950/70', text: 'text-red-400', border: 'border-red-600/70' }
  };

  const style = map[severity] || map.LOW;

  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded text-[11px] font-semibold uppercase tracking-wide border ${style.bg} ${style.text} ${style.border}`}>
      {severity}
    </span>
  );
};

export const StatusBadge: React.FC<{ status: IncidentStatus }> = ({ status }) => {
  const map: Record<IncidentStatus, { bg: string; text: string; border: string }> = {
    OPEN: { bg: 'bg-red-950/40', text: 'text-red-400', border: 'border-red-800/50' },
    TRIAGED: { bg: 'bg-amber-950/40', text: 'text-amber-400', border: 'border-amber-800/50' },
    INVESTIGATING: { bg: 'bg-cyan-950/40', text: 'text-cyan-400', border: 'border-cyan-800/50' },
    RESOLVED: { bg: 'bg-emerald-950/40', text: 'text-emerald-400', border: 'border-emerald-800/50' },
    CLOSED: { bg: 'bg-slate-900/60', text: 'text-slate-400', border: 'border-slate-700/50' }
  };

  const style = map[status] || map.OPEN;

  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium border ${style.bg} ${style.text} ${style.border}`}>
      {status}
    </span>
  );
};
