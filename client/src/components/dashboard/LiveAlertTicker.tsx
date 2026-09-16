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
    <div className="organic-glass-card p-6">
      <div className="flex items-center justify-between pb-4 border-b border-[#26372E]">
        <div className="flex items-center gap-2.5">
          <ShieldAlert className="w-4 h-4 text-[#CC5833]" />
          <h3 className="text-xs font-bold uppercase tracking-wider text-white font-mono">Live Threat & Anomaly Feed</h3>
        </div>
        <span className="text-[11px] font-mono text-[#708A7C]">Sub-Second Ingestion</span>
      </div>

      <div className="mt-4 space-y-3">
        {combined.length === 0 ? (
          <div className="text-center py-8 text-xs text-[#708A7C]">
            No active threat events detected across fleet.
          </div>
        ) : (
          combined.map((item: any) => {
            const isSec = item.kind === 'SECURITY';
            return (
              <div
                key={item.id}
                className="flex items-center justify-between p-3.5 rounded-2xl bg-[#142019] border border-[#26372E] hover:border-[#CC5833]/40 transition-all text-xs hover-lift"
              >
                <div className="flex items-center gap-3.5">
                  <div className={`p-2.5 rounded-2xl ${isSec ? 'bg-[#E30000]/15 text-[#E30000]' : 'bg-[#CC5833]/15 text-[#CC5833]'}`}>
                    {isSec ? <ShieldAlert className="w-4 h-4" /> : <AlertTriangle className="w-4 h-4" />}
                  </div>
                  <div>
                    <div className="flex items-center gap-2.5">
                      <span className="font-semibold text-white">
                        {isSec ? item.eventType.replace(/_/g, ' ') : item.anomalyType.replace(/_/g, ' ')}
                      </span>
                      <SeverityBadge severity={item.severity} />
                    </div>
                    <p className="text-[11px] text-[#94A39B] mt-0.5 max-w-lg truncate">
                      {isSec ? item.details : `Deviation score: ${(item.anomalyScore * 100).toFixed(0)}% (${item.contributingFeatures?.join(', ')})`}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <span className="text-[10px] font-mono text-[#708A7C]">
                    {new Date(item.timestamp).toLocaleTimeString()}
                  </span>
                  {item.deviceId && (
                    <button
                      onClick={() => onSelectDevice && onSelectDevice(item.deviceId)}
                      className="p-2 rounded-full text-[#94A39B] hover:text-[#CC5833] hover:bg-[#1C2B22] transition-colors"
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
