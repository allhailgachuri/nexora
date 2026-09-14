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
    { name: 'Active', value: stats?.activeDevices || 0, color: '#10b981' },
    { name: 'Suspected', value: stats?.suspectedDevices || 0, color: '#f59e0b' },
    { name: 'Quarantined', value: stats?.quarantinedDevices || 0, color: '#ef4444' },
    { name: 'Revoked', value: stats?.revokedDevices || 0, color: '#8b5cf6' }
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
          accentColor="cyan"
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
          title="Suspected / Under Review"
          value={stats?.suspectedDevices || 0}
          subtitle="Behavioral Drift Detected"
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
          title="Open Incidents"
          value={stats?.openIncidents || 0}
          subtitle="Assigned SOC Cases"
          icon={Activity}
          accentColor="purple"
          onClick={() => onNavigateTab('incidents')}
        />
        <StatCard
          title="Certificates Expiring"
          value={stats?.expiringCertsCount || 0}
          subtitle="< 30 Days Left in Validity"
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
        <div className="glass-panel rounded-2xl p-5 flex flex-col justify-between border border-slate-800">
          <div>
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <h3 className="text-sm font-bold uppercase tracking-wider text-white">Fleet Integrity Posture</h3>
              <span className="text-xs font-mono font-bold text-emerald-400">
                {stats?.fleetHealthScore || 95}% Health
              </span>
            </div>

            <div className="h-48 mt-2">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={statusPieData}
                    cx="50%"
                    cy="50%"
                    innerRadius={50}
                    outerRadius={75}
                    paddingAngle={4}
                    dataKey="value"
                  >
                    {statusPieData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} stroke="#0a0d14" strokeWidth={2} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{ backgroundColor: '#101522', borderColor: '#334155', borderRadius: '8px', fontSize: '12px' }}
                    itemStyle={{ color: '#f8fafc' }}
                  />
                  <Legend
                    verticalAlign="bottom"
                    iconSize={8}
                    wrapperStyle={{ fontSize: '11px', color: '#94a3b8' }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="pt-4 border-t border-slate-800 grid grid-cols-2 gap-3 text-center">
            <div className="p-2.5 rounded-xl bg-[#0c101a] border border-slate-800">
              <div className="text-[11px] text-slate-400">Mutual TLS Enforced</div>
              <div className="text-sm font-bold text-cyan-400 font-mono mt-0.5">100% (2048-bit)</div>
            </div>
            <div className="p-2.5 rounded-xl bg-[#0c101a] border border-slate-800">
              <div className="text-[11px] text-slate-400">Topic ACL Guard</div>
              <div className="text-sm font-bold text-emerald-400 font-mono mt-0.5">STRICT</div>
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
