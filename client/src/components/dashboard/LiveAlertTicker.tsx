import React from 'react';
import { SecurityEvent, AnomalyEvent } from '../../types';
import { SeverityBadge } from '../common/Badge';
import { ShieldAlert, AlertTriangle, ArrowRight } from 'lucide-react';

interface LiveAlertTickerProps {
  securityEvents: SecurityEvent[];
  anomalyEvents: AnomalyEvent[];
  onSelectIncident?: (id: string) => void;
  onSelectDevice?: (deviceId: string) => void;
}

export const LiveAlertTicker: React.FC<LiveAlertTickerProps> = ({
  securityEvents,
  anomalyEvents,
  onSelectDevice
}) => {
  const combined = [
    ...securityEvents.map(s => ({ ...s, kind: 'SECURITY' as const })),
    ...anomalyEvents.map(a => ({ ...a, kind: 'ANOMALY' as const }))
  ].sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()).slice(0, 8);

  return (
    <div className="glass-panel rounded-2xl p-5 border border-slate-800">
      <div className="flex items-center justify-between pb-3 border-b border-slate-800">
        <div className="flex items-center gap-2">
          <ShieldAlert className="w-4 h-4 text-cyan-400" />
          <h3 className="text-sm font-bold uppercase tracking-wider text-white">Live Threat & Anomaly Feed</h3>
        </div>
        <span className="text-[11px] font-mono text-slate-400">Real-Time Ingestion</span>
      </div>

      <div className="mt-3 space-y-2.5">
        {combined.length === 0 ? (
          <div className="text-center py-6 text-xs text-slate-400">
            No active threat events detected across fleet.
          </div>
        ) : (
          combined.map((item: any) => {
            const isSec = item.kind === 'SECURITY';
            return (
              <div
                key={item.id}
                className="flex items-center justify-between p-3 rounded-xl bg-[#0c101a] border border-slate-800/80 hover:border-slate-700 transition-all text-xs"
              >
                <div className="flex items-center gap-3">
                  <div className={`p-2 rounded-lg ${isSec ? 'bg-rose-950/40 text-rose-400' : 'bg-purple-950/40 text-purple-400'}`}>
                    {isSec ? <ShieldAlert className="w-4 h-4" /> : <AlertTriangle className="w-4 h-4" />}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-white">
                        {isSec ? item.eventType.replace(/_/g, ' ') : item.anomalyType.replace(/_/g, ' ')}
                      </span>
                      <SeverityBadge severity={item.severity} />
                    </div>
                    <p className="text-[11px] text-slate-400 mt-0.5 max-w-md truncate">
                      {isSec ? item.details : `Deviation score: ${(item.anomalyScore * 100).toFixed(0)}% (${item.contributingFeatures?.join(', ')})`}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <span className="text-[10px] font-mono text-slate-400">
                    {new Date(item.timestamp).toLocaleTimeString()}
                  </span>
                  {item.deviceId && (
                    <button
                      onClick={() => onSelectDevice && onSelectDevice(item.deviceId)}
                      className="p-1.5 rounded-lg text-slate-400 hover:text-cyan-400 hover:bg-slate-800 transition-colors"
                      title="Inspect Device"
                    >
                      <ArrowRight className="w-4 h-4" />
                    </button>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
