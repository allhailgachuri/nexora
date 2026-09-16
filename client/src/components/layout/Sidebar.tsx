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
  ScrollText,
  Radio,
  ArrowLeft
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
  onGoToLanding?: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ activeTab, setActiveTab, stats, onGoToLanding }) => {
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
      badgeColor: 'bg-[#CC5833]/20 text-[#CC5833] border-[#CC5833]/40'
    },
    {
      id: 'ml-anomalies',
      label: 'ML Anomaly & SHAP',
      icon: BrainCircuit,
      badge: stats?.anomalyEventsCount,
      badgeColor: 'bg-[#708A7C]/20 text-[#9DB3A6] border-[#708A7C]/40'
    },
    {
      id: 'pki',
      label: 'PKI & Certificates',
      icon: KeyRound,
      badge: stats?.expiringCertsCount ? `${stats.expiringCertsCount} exp` : undefined,
      badgeColor: 'bg-[#E85D04]/20 text-[#E85D04] border-[#E85D04]/40'
    },
    { id: 'firmware', label: 'Firmware & Dual OTA', icon: Cpu },
    { id: 'schemas', label: 'Topic ACLs & Schemas', icon: FileCode2 },
    { id: 'sandbox', label: 'Attack Sandbox', icon: Crosshair },
    { id: 'audit', label: 'Tamper Audit Ledger', icon: ScrollText }
  ];

  return (
    <aside className="w-full md:w-64 p-3 md:pl-6 md:pr-2 shrink-0">
      <div className="rounded-[2.5rem] border border-[#26372E] bg-[#171C19]/90 backdrop-blur-2xl p-3 flex flex-col justify-between min-h-[calc(100vh-6.5rem)] shadow-organic-card">
        <div className="space-y-1.5">
          <div className="flex items-center justify-between px-4 py-3 text-[10px] font-bold uppercase tracking-widest text-[#708A7C]">
            <span>Navigation Modules</span>
            {onGoToLanding && (
              <button
                onClick={onGoToLanding}
                className="text-[11px] text-[#CC5833] hover:text-[#DC7351] font-semibold flex items-center gap-1 normal-case transition-colors"
              >
                <span>Landing</span>
                <span>→</span>
              </button>
            )}
          </div>
          {navItems.map(item => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id as TabType)}
                className={`w-full flex items-center justify-between px-4 py-3 rounded-full text-xs font-semibold tracking-wide transition-all ${
                  isActive
                    ? 'bg-[#2E4036] text-white shadow-moss-glow border border-[#708A7C]/40'
                    : 'text-[#94A39B] hover:text-[#F4F2EC] hover:bg-[#1C2B22]/70 border border-transparent'
                }`}
              >
                <div className="flex items-center gap-3">
                  <Icon className={`w-4 h-4 ${isActive ? 'text-[#CC5833]' : 'text-[#708A7C]'}`} />
                  <span>{item.label}</span>
                </div>
                {item.badge !== undefined && (
                  <span
                    className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded-full border ${
                      item.badgeColor || 'bg-[#142019] text-[#CBD4CF] border-[#26372E]'
                    }`}
                  >
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* Active Tenant / Zero-Trust Status Footer */}
        <div className="p-4 rounded-[1.75rem] border border-[#26372E] bg-[#142019]/80 mt-6">
          <div className="flex items-center justify-between text-[11px] text-[#708A7C]">
            <span>Active Tenant</span>
            <span className="text-[10px] font-mono text-[#CC5833] font-bold">ORG-PROD</span>
          </div>
          <p className="text-xs font-bold text-white truncate mt-1">Nexora Enterprise IoT</p>
          <div className="flex items-center gap-2 mt-2.5 text-[10px] text-[#30D158] font-mono">
            <span className="w-1.5 h-1.5 rounded-full bg-[#30D158] animate-pulse" />
            <span>mTLS Guard Active</span>
          </div>
        </div>
      </div>
    </aside>
  );
};
