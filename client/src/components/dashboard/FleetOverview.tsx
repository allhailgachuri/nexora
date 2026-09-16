import React from 'react';
import {
  Server,
  ShieldCheck,
  AlertTriangle,
  Flame,
  Activity,
  KeyRound
} from 'lucide-react';
import { FleetStats, Site, SecurityEvent, AnomalyEvent } from '../../types';
import { StatCard } from '../common/StatCard';
import { GeoFleetMap } from './GeoFleetMap';
import { LiveAlertTicker } from './LiveAlertTicker';
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Tooltip,
  Legend
} from 'recharts';

interface FleetOverviewProps {
  stats: FleetStats | null;
  sites: Site[];
  securityEvents: SecurityEvent[];
  anomalyEvents: AnomalyEvent[];
  onSelectSite?: (siteId: string) => void;
  onSelectDevice?: (deviceId: string) => void;
  onNavigateTab: (tab: any) => void;
}

export const FleetOverview: React.FC<FleetOverviewProps> = ({
  stats,
  sites,
  securityEvents,
  anomalyEvents,
  onSelectSite,
  onSelectDevice,
  onNavigateTab
}) => {
  // Device Lifecycle Breakdown data for Pie Chart
  const statusPieData = [
    { name: 'Active', value: stats?.activeDevices || 0, color: '#30D158' },
    { name: 'Suspected', value: stats?.suspectedDevices || 0, color: '#E85D04' },
    { name: 'Quarantined', value: stats?.quarantinedDevices || 0, color: '#E30000' },
    { name: 'Revoked', value: stats?.revokedDevices || 0, color: '#9D65C9' }
  ].filter(d => d.value > 0);

  return (
    <div className="space-y-6">
      {/* Top SOC Metrics Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
        <StatCard
          title="Fleet Nodes"
          value={stats?.totalDevices || 0}
          subtitle="Provisioned IoT Devices"
          icon={Server}
          accentColor="moss"
          onClick={() => onNavigateTab('devices')}
        />
        <StatCard
          title="Active & Healthy"
          value={stats?.activeDevices || 0}
          subtitle="Streaming Valid Telemetry"
          icon={ShieldCheck}
          accentColor="emerald"
          onClick={() => onNavigateTab('devices')}
        />
        <StatCard
          title="Suspected Drift"
          value={stats?.suspectedDevices || 0}
          subtitle="Behavioral Variance"
          icon={AlertTriangle}
          accentColor="amber"
          onClick={() => onNavigateTab('devices')}
        />
        <StatCard
          title="Quarantined"
          value={stats?.quarantinedDevices || 0}
          subtitle="Network ACLs Isolated"
          icon={Flame}
          accentColor="rose"
          onClick={() => onNavigateTab('devices')}
        />
        <StatCard
          title="Open Cases"
          value={stats?.openIncidents || 0}
          subtitle="Assigned SOC Incidents"
          icon={Activity}
          accentColor="clay"
          onClick={() => onNavigateTab('incidents')}
        />
        <StatCard
          title="Cert Expiring"
          value={stats?.expiringCertsCount || 0}
          subtitle="< 30 Days in Policy"
          icon={KeyRound}
          accentColor="amber"
          onClick={() => onNavigateTab('pki')}
        />
      </div>

      {/* Main Interactive Map & Fleet Health Gauge */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <GeoFleetMap sites={sites} onSelectSite={onSelectSite} />
        </div>

        {/* Fleet Posture & Status Breakdown */}
        <div className="organic-glass-card p-6 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-4 border-b border-[#26372E]">
              <h3 className="text-xs font-bold uppercase tracking-wider text-white font-mono">Fleet Integrity Posture</h3>
              <span className="text-xs font-mono font-bold text-[#30D158] bg-[#30D158]/10 px-2.5 py-1 rounded-full border border-[#30D158]/30">
                {stats?.fleetHealthScore || 95}% Health
              </span>
            </div>

            <div className="h-48 mt-3">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={statusPieData}
                    cx="50%"
                    cy="50%"
                    innerRadius={52}
                    outerRadius={78}
                    paddingAngle={4}
                    dataKey="value"
                  >
                    {statusPieData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} stroke="#171C19" strokeWidth={3} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{ backgroundColor: '#171C19', borderColor: '#2E4036', borderRadius: '14px', fontSize: '12px', color: '#F4F2EC' }}
                    itemStyle={{ color: '#F4F2EC' }}
                  />
                  <Legend
                    verticalAlign="bottom"
                    iconSize={8}
                    wrapperStyle={{ fontSize: '11px', color: '#94A39B' }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="pt-4 border-t border-[#26372E] grid grid-cols-2 gap-3 text-center">
            <div className="p-3 rounded-2xl bg-[#142019] border border-[#26372E]">
              <div className="text-[11px] text-[#708A7C]">Mutual TLS Enforced</div>
              <div className="text-xs font-bold text-[#30D158] font-mono mt-0.5">100% (2048-bit)</div>
            </div>
            <div className="p-3 rounded-2xl bg-[#142019] border border-[#26372E]">
              <div className="text-[11px] text-[#708A7C]">Topic ACL Guard</div>
              <div className="text-xs font-bold text-[#CC5833] font-mono mt-0.5">STRICT REGEX</div>
            </div>
          </div>
        </div>
      </div>

      {/* Live Threat Activity Stream */}
      <LiveAlertTicker
        securityEvents={securityEvents}
        anomalyEvents={anomalyEvents}
        onSelectDevice={onSelectDevice}
      />
    </div>
  );
};
