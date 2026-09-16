import React from 'react';
import { DeviceLifecycleState, SeverityLevel, IncidentStatus } from '../../types';

export const StateBadge: React.FC<{ state: DeviceLifecycleState }> = ({ state }) => {
  const map: Record<DeviceLifecycleState, { label: string; bg: string; text: string; border: string; dot: string }> = {
    REGISTERED: { label: 'Registered', bg: 'bg-[#2997FF]/15', text: 'text-[#2997FF]', border: 'border-[#2997FF]/30', dot: 'bg-[#2997FF]' },
    PROVISIONED: { label: 'Provisioned', bg: 'bg-[#708A7C]/20', text: 'text-[#9DB3A6]', border: 'border-[#708A7C]/40', dot: 'bg-[#708A7C]' },
    ACTIVE: { label: 'Active', bg: 'bg-[#30D158]/15', text: 'text-[#30D158]', border: 'border-[#30D158]/30', dot: 'bg-[#30D158]' },
    SUSPECTED: { label: 'Suspected', bg: 'bg-[#E85D04]/15', text: 'text-[#E85D04]', border: 'border-[#E85D04]/30', dot: 'bg-[#E85D04]' },
    QUARANTINED: { label: 'Quarantined', bg: 'bg-[#E30000]/15', text: 'text-[#E30000]', border: 'border-[#E30000]/30', dot: 'bg-[#E30000]' },
    REVOKED: { label: 'Revoked', bg: 'bg-[#9D65C9]/15', text: 'text-[#9D65C9]', border: 'border-[#9D65C9]/30', dot: 'bg-[#9D65C9]' },
    DECOMMISSIONED: { label: 'Decommissioned', bg: 'bg-[#142019]', text: 'text-[#708A7C]', border: 'border-[#26372E]', dot: 'bg-[#708A7C]' }
  };

  const style = map[state] || map.REGISTERED;

  return (
    <span className={`inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full text-[11px] font-medium border ${style.bg} ${style.text} ${style.border}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${style.dot} ${state === 'ACTIVE' ? 'animate-pulse' : ''}`}></span>
      {style.label}
    </span>
  );
};

export const SeverityBadge: React.FC<{ severity: SeverityLevel }> = ({ severity }) => {
  const map: Record<SeverityLevel, { bg: string; text: string; border: string }> = {
    LOW: { bg: 'bg-[#142019]', text: 'text-[#9DB3A6]', border: 'border-[#26372E]' },
    MEDIUM: { bg: 'bg-[#2997FF]/15', text: 'text-[#2997FF]', border: 'border-[#2997FF]/30' },
    HIGH: { bg: 'bg-[#E85D04]/15', text: 'text-[#E85D04]', border: 'border-[#E85D04]/30' },
    CRITICAL: { bg: 'bg-[#E30000]/20', text: 'text-[#E30000]', border: 'border-[#E30000]/40' }
  };

  const style = map[severity] || map.LOW;

  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold uppercase tracking-wider border ${style.bg} ${style.text} ${style.border}`}>
      {severity}
    </span>
  );
};

export const StatusBadge: React.FC<{ status: IncidentStatus }> = ({ status }) => {
  const map: Record<IncidentStatus, { bg: string; text: string; border: string }> = {
    OPEN: { bg: 'bg-[#CC5833]/20', text: 'text-[#CC5833]', border: 'border-[#CC5833]/40' },
    TRIAGED: { bg: 'bg-[#E85D04]/15', text: 'text-[#E85D04]', border: 'border-[#E85D04]/30' },
    INVESTIGATING: { bg: 'bg-[#2997FF]/15', text: 'text-[#2997FF]', border: 'border-[#2997FF]/30' },
    RESOLVED: { bg: 'bg-[#30D158]/15', text: 'text-[#30D158]', border: 'border-[#30D158]/30' },
    CLOSED: { bg: 'bg-[#142019]', text: 'text-[#708A7C]', border: 'border-[#26372E]' }
  };

  const style = map[status] || map.OPEN;

  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-medium border ${style.bg} ${style.text} ${style.border}`}>
      {status}
    </span>
  );
};
