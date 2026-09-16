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

  // Colors for dynamic chart lines (Organic tech palette)
  const lineColors = ['#30D158', '#CC5833', '#2997FF', '#E85D04', '#9D65C9'];
  const numericFields = deviceType.telemetrySchema.fields.filter(f => f.type === 'number');

  return (
    <div className="space-y-6">
      {/* Device Header Bar */}
      <div className="organic-glass-card p-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="p-3 rounded-2xl bg-[#2E4036] border border-[#708A7C]/30 text-[#30D158]">
              <Server className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-3">
                <h2 className="text-xl font-bold text-white tracking-tight">{device.name}</h2>
                <StateBadge state={device.lifecycleState} />
              </div>
              <div className="flex flex-wrap items-center gap-3 text-xs text-[#94A39B] mt-1.5 font-sans">
                <span className="font-mono text-[#F4F2EC]">{device.serialNumber}</span>
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
          <div className="flex items-center gap-2.5">
            {device.lifecycleState !== 'QUARANTINED' ? (
              <button
                onClick={() => onStateChange('QUARANTINED', 'Analyst manual containment')}
                className="magnetic-btn flex items-center gap-2 px-4 py-2 rounded-full bg-[#E30000]/15 hover:bg-[#E30000]/30 border border-[#E30000]/30 text-[#E30000] text-xs font-semibold transition-all"
              >
                <Flame className="w-3.5 h-3.5" />
                <span>Quarantine</span>
              </button>
            ) : (
              <button
                onClick={() => onStateChange('ACTIVE', 'Device cleared and reinstated')}
                className="magnetic-btn flex items-center gap-2 px-4 py-2 rounded-full bg-[#30D158]/15 hover:bg-[#30D158]/30 border border-[#30D158]/30 text-[#30D158] text-xs font-semibold transition-all"
              >
                <ShieldCheck className="w-3.5 h-3.5" />
                <span>Reinstate Node</span>
              </button>
            )}

            <button
              onClick={onRotateCert}
              className="magnetic-btn flex items-center gap-2 px-4 py-2 rounded-full bg-[#142019] hover:bg-[#1E2622] border border-[#26372E] text-[#9DB3A6] hover:text-white text-xs font-semibold transition-all"
            >
              <RotateCw className="w-3.5 h-3.5 text-[#CC5833]" />
              <span>Rotate Cert</span>
            </button>
          </div>
        </div>

        {/* Multi-Tab Navigation */}
        <div className="flex items-center gap-2 border-t border-[#26372E] mt-6 pt-4 overflow-x-auto">
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
                className={`flex items-center gap-2 px-4 py-2 rounded-full text-xs font-semibold transition-all ${
                  isActive
                    ? 'bg-[#2E4036] text-white border border-[#708A7C]/40 shadow-sm'
                    : 'text-[#94A39B] hover:text-white hover:bg-[#142019]'
                }`}
              >
                <Icon className={`w-4 h-4 ${isActive ? 'text-[#CC5833]' : 'text-[#708A7C]'}`} />
                <span>{tab.label}</span>
                {tab.count !== undefined && (
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-[#142019] text-[#CBD4CF] font-mono">
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
        <div className="organic-glass-card p-6 space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-[#26372E]">
            <h3 className="text-xs font-bold text-white uppercase tracking-wider font-mono">
              Time-Series Telemetry Stream
            </h3>
            <span className="text-xs font-mono text-[#30D158]">
              Timescale Hypertable Window ({recentTelemetry.length} samples)
            </span>
          </div>

          <div className="h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#26372E" />
                <XAxis dataKey="time" stroke="#708A7C" fontSize={10} tickLine={false} />
                <YAxis stroke="#708A7C" fontSize={10} tickLine={false} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#171C19', borderColor: '#2E4036', borderRadius: '12px', fontSize: '11px', color: '#F4F2EC' }}
                  itemStyle={{ color: '#F4F2EC' }}
                />
                <Legend iconSize={8} wrapperStyle={{ fontSize: '11px', color: '#94A39B' }} />
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
            <div className="p-10 text-center organic-glass-card text-[#708A7C] text-xs">
              <BrainCircuit className="w-8 h-8 text-[#2E4036] mx-auto mb-2" />
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
        <div className="organic-glass-card p-6 space-y-4">
          <h3 className="text-xs font-bold text-white uppercase tracking-wider pb-3 border-b border-[#26372E] font-mono">
            Security Violations & Transport Audit
          </h3>
          {securityEvents.length === 0 ? (
            <div className="text-center py-8 text-xs text-[#708A7C]">
              No security transport violations logged. Mutual TLS & Topic ACLs clean.
            </div>
          ) : (
            securityEvents.map(sec => (
              <div key={sec.id} className="p-3.5 rounded-2xl bg-[#142019] border border-[#26372E] flex items-center justify-between text-xs hover-lift">
                <div className="flex items-center gap-3">
                  <div className="p-2.5 rounded-2xl bg-[#E30000]/15 text-[#E30000]">
                    <ShieldAlert className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-white">{sec.eventType.replace(/_/g, ' ')}</span>
                      <SeverityBadge severity={sec.severity} />
                    </div>
                    <p className="text-[11px] text-[#94A39B] mt-0.5">{sec.details}</p>
                  </div>
                </div>
                <span className="text-[10px] font-mono text-[#708A7C]">
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
