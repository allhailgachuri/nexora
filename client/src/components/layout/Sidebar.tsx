import React from 'react';
import {
  LayoutDashboard,
  Server,
  AlertTriangle,
  BrainCircuit,
  KeyRound,
  Cpu,
  FileCode2,
  Crosshair,
  ScrollText
} from 'lucide-react';
import { FleetStats } from '../../types';

export type TabType =
  | 'overview'
  | 'devices'
  | 'incidents'
  | 'ml-anomalies'
  | 'pki'
  | 'firmware'
  | 'schemas'
  | 'sandbox'
  | 'audit';

interface SidebarProps {
  activeTab: TabType;
  setActiveTab: (tab: TabType) => void;
  stats: FleetStats | null;
}

export const Sidebar: React.FC<SidebarProps> = ({ activeTab, setActiveTab, stats }) => {
  const navItems = [
    { id: 'overview', label: 'SOC Fleet Command', icon: LayoutDashboard },
    {
      id: 'devices',
      label: 'Device Registry',
      icon: Server,
      badge: stats?.totalDevices
    },
    {
      id: 'incidents',
      label: 'Security & Incidents',
      icon: AlertTriangle,
      badge: stats?.openIncidents,
      badgeColor: 'bg-rose-900/80 text-rose-300 border-rose-700/60'
    },
    {
      id: 'ml-anomalies',
      label: 'ML Anomaly & SHAP',
      icon: BrainCircuit,
      badge: stats?.anomalyEventsCount,
      badgeColor: 'bg-purple-900/80 text-purple-300 border-purple-700/60'
    },
    {
      id: 'pki',
      label: 'PKI & Certificates',
      icon: KeyRound,
      badge: stats?.expiringCertsCount ? `${stats.expiringCertsCount} exp` : undefined,
      badgeColor: 'bg-amber-900/80 text-amber-300 border-amber-700/60'
    },
    { id: 'firmware', label: 'Firmware & OTA', icon: Cpu },
    { id: 'schemas', label: 'Telemetry Schemas', icon: FileCode2 },
    { id: 'sandbox', label: 'Attack Sandbox', icon: Crosshair },
    { id: 'audit', label: 'Immutable Audit Log', icon: ScrollText }
  ];

  return (
    <aside className="w-64 border-r border-slate-800/80 bg-[#0c101a] flex flex-col justify-between p-3 min-h-[calc(100vh-4rem)]">
      <div className="space-y-1">
        <div className="px-3 py-2 text-[11px] font-bold uppercase tracking-wider text-slate-400">
          Command Hub
        </div>
        {navItems.map(item => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id as TabType)}
              className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-semibold tracking-wide transition-all ${
                isActive
                  ? 'bg-gradient-to-r from-cyan-950/80 to-blue-950/40 text-cyan-400 border border-cyan-500/40 shadow-cyber-glow'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/40 border border-transparent'
              }`}
            >
              <div className="flex items-center gap-3">
                <Icon className={`w-4 h-4 ${isActive ? 'text-cyan-400' : 'text-slate-400'}`} />
                <span>{item.label}</span>
              </div>
              {item.badge !== undefined && (
                <span
                  className={`text-[10px] font-mono font-bold px-1.5 py-0.5 rounded-full border ${
                    item.badgeColor || 'bg-slate-800 text-slate-300 border-slate-700'
                  }`}
                >
                  {item.badge}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* Tenant info footer */}
      <div className="p-3 rounded-xl border border-slate-800/80 bg-[#101522]/80 mt-6">
        <div className="flex items-center justify-between text-[11px] text-slate-400">
          <span>Active Tenant</span>
          <span className="text-[10px] font-mono text-cyan-400">ORG-PROD</span>
        </div>
        <p className="text-xs font-semibold text-white truncate mt-1">Nexora Enterprise IoT</p>
        <div className="flex items-center gap-1.5 mt-2 text-[10px] text-emerald-400">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
          <span>PKI / mTLS Guard Active</span>
        </div>
      </div>
    </aside>
  );
};
