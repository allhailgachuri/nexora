import React, { useState } from 'react';
import { Device, DeviceType, Site, DeviceShadow as DeviceShadowType, TelemetryReading, AnomalyEvent, SecurityEvent } from '../../types';
import { StateBadge, SeverityBadge } from '../common/Badge';
import { CertViewer } from './CertViewer';
import { DeviceShadow } from './DeviceShadow';
import { ShapExplainCard } from './ShapExplainCard';
import {
  Server,
  KeyRound,
  Layers,
  Activity,
  BrainCircuit,
  ShieldAlert,
  Flame,
  ShieldCheck,
  RotateCw
} from 'lucide-react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
  Legend
} from 'recharts';

interface DeviceDetailProps {
  device: Device;
  deviceType: DeviceType;
  site: Site;
  certificate?: any;
  shadow?: DeviceShadowType;
  recentTelemetry: TelemetryReading[];
  anomalies: AnomalyEvent[];
  securityEvents: SecurityEvent[];
  onStateChange: (state: string, reason?: string) => Promise<void>;
  onSaveDesiredShadow: (desired: Record<string, any>) => Promise<void>;
  onRotateCert: () => Promise<void>;
  onRevokeCert: () => Promise<void>;
}

export const DeviceDetail: React.FC<DeviceDetailProps> = ({
  device,
  deviceType,
  site,
  certificate,
  shadow,
  recentTelemetry,
  anomalies,
  securityEvents,
  onStateChange,
  onSaveDesiredShadow,
  onRotateCert,
  onRevokeCert
}) => {
  const [activeTab, setActiveTab] = useState<'telemetry' | 'pki' | 'shadow' | 'anomalies' | 'security'>('telemetry');

  // Prepare chart data from recent telemetry readings
  const chartData = [...recentTelemetry].slice(-30).map(t => ({
    time: new Date(t.timestamp).toLocaleTimeString(),
    ...t.values
  }));

  // Colors for dynamic chart lines
  const lineColors = ['#06b6d4', '#10b981', '#f59e0b', '#8b5cf6', '#ec4899'];
  const numericFields = deviceType.telemetrySchema.fields.filter(f => f.type === 'number');

  return (
    <div className="space-y-6">
      {/* Device Header Bar */}
      <div className="glass-panel rounded-2xl p-5 border border-slate-800">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-3.5">
            <div className="p-3 rounded-xl bg-cyan-950/60 border border-cyan-500/40 text-cyan-400">
              <Server className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2.5">
                <h2 className="text-lg font-bold text-white tracking-wide">{device.name}</h2>
                <StateBadge state={device.lifecycleState} />
              </div>
              <div className="flex flex-wrap items-center gap-3 text-xs text-slate-400 mt-1">
                <span className="font-mono text-cyan-300">{device.serialNumber}</span>
                <span>•</span>
                <span>{deviceType.name}</span>
                <span>•</span>
                <span>{site.name}</span>
                <span>•</span>
                <span className="font-mono">{device.ipAddress || 'No IP'}</span>
              </div>
            </div>
          </div>

          {/* Quick Lifecycle Action Buttons */}
          <div className="flex items-center gap-2">
            {device.lifecycleState !== 'QUARANTINED' ? (
              <button
                onClick={() => onStateChange('QUARANTINED', 'Analyst manual containment')}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-rose-950/60 hover:bg-rose-900/80 border border-rose-500/40 text-rose-300 text-xs font-semibold transition-all"
              >
                <Flame className="w-3.5 h-3.5" />
                <span>Quarantine</span>
              </button>
            ) : (
              <button
                onClick={() => onStateChange('ACTIVE', 'Device cleared and reinstated')}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-950/60 hover:bg-emerald-900/80 border border-emerald-500/40 text-emerald-300 text-xs font-semibold transition-all"
              >
                <ShieldCheck className="w-3.5 h-3.5" />
                <span>Reinstate Node</span>
              </button>
            )}

            <button
              onClick={onRotateCert}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-cyan-950/60 hover:bg-cyan-900/80 border border-cyan-500/40 text-cyan-300 text-xs font-semibold transition-all"
            >
              <RotateCw className="w-3.5 h-3.5" />
              <span>Rotate Cert</span>
            </button>
          </div>
        </div>

        {/* Multi-Tab Navigation */}
        <div className="flex items-center gap-2 border-t border-slate-800/80 mt-5 pt-3 overflow-x-auto">
          {[
            { id: 'telemetry', label: 'Telemetry Stream', icon: Activity, count: recentTelemetry.length },
            { id: 'pki', label: 'X.509 Identity & Cert', icon: KeyRound, count: certificate ? 'Valid' : 'None' },
            { id: 'shadow', label: 'Device Shadow', icon: Layers },
            { id: 'anomalies', label: 'ML Anomaly & SHAP', icon: BrainCircuit, count: anomalies.length },
            { id: 'security', label: 'Security Violations', icon: ShieldAlert, count: securityEvents.length }
          ].map(tab => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-semibold transition-all ${
                  isActive
                    ? 'bg-cyan-950 text-cyan-400 border border-cyan-500/40'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
                }`}
              >
                <Icon className="w-4 h-4" />
                <span>{tab.label}</span>
                {tab.count !== undefined && (
                  <span className="text-[10px] px-1.5 py-0.2 rounded bg-slate-800 text-slate-300 font-mono">
                    {tab.count}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Tab Contents */}
      {activeTab === 'telemetry' && (
        <div className="glass-panel rounded-2xl p-5 border border-slate-800 space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-800">
            <h3 className="text-sm font-bold text-white uppercase tracking-wider">
              Time-Series Telemetry Stream
            </h3>
            <span className="text-xs font-mono text-cyan-400">
              Timescale Hypertable Window ({recentTelemetry.length} samples)
            </span>
          </div>

          <div className="h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                <XAxis dataKey="time" stroke="#64748b" fontSize={10} tickLine={false} />
                <YAxis stroke="#64748b" fontSize={10} tickLine={false} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#101522', borderColor: '#334155', borderRadius: '8px', fontSize: '11px' }}
                  itemStyle={{ color: '#f8fafc' }}
                />
                <Legend iconSize={8} wrapperStyle={{ fontSize: '11px', color: '#94a3b8' }} />
                {numericFields.map((field, idx) => (
                  <Line
                    key={field.name}
                    type="monotone"
                    dataKey={field.name}
                    name={`${field.displayName || field.name} (${field.unit || ''})`}
                    stroke={lineColors[idx % lineColors.length]}
                    strokeWidth={2}
                    dot={{ r: 2 }}
                    activeDot={{ r: 4 }}
                  />
                ))}
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      {activeTab === 'pki' && (
        <CertViewer
          certificate={certificate}
          onRotate={onRotateCert}
          onRevoke={onRevokeCert}
        />
      )}

      {activeTab === 'shadow' && (
        <DeviceShadow
          shadow={shadow}
          onSaveDesired={onSaveDesiredShadow}
        />
      )}

      {activeTab === 'anomalies' && (
        <div className="space-y-4">
          {anomalies.length === 0 ? (
            <div className="p-8 text-center glass-panel rounded-xl text-slate-400 text-xs">
              <BrainCircuit className="w-8 h-8 text-slate-500 mx-auto mb-2" />
              No ML behavioral anomalies detected for this device. Normal baseline operation.
            </div>
          ) : (
            anomalies.map(anom => (
              <ShapExplainCard key={anom.id} anomaly={anom} />
            ))
          )}
        </div>
      )}

      {activeTab === 'security' && (
        <div className="glass-panel rounded-2xl p-5 border border-slate-800 space-y-3">
          <h3 className="text-sm font-bold text-white uppercase tracking-wider pb-3 border-b border-slate-800">
            Security Violations & Transport Audit
          </h3>
          {securityEvents.length === 0 ? (
            <div className="text-center py-6 text-xs text-slate-400">
              No security transport violations logged. Mutual TLS & Topic ACLs clean.
            </div>
          ) : (
            securityEvents.map(sec => (
              <div key={sec.id} className="p-3 rounded-xl bg-[#0c101a] border border-slate-800 flex items-center justify-between text-xs">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-rose-950/40 text-rose-400">
                    <ShieldAlert className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-white">{sec.eventType.replace(/_/g, ' ')}</span>
                      <SeverityBadge severity={sec.severity} />
                    </div>
                    <p className="text-[11px] text-slate-400 mt-0.5">{sec.details}</p>
                  </div>
                </div>
                <span className="text-[10px] font-mono text-slate-400">
                  {new Date(sec.timestamp).toLocaleString()}
                </span>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
};
