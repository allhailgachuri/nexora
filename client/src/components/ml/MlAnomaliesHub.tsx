import React, { useState, useEffect } from 'react';
import { ApiService } from '../../services/api';
import { AnomalyEvent, Device } from '../../types';
import { ShapExplainCard } from '../devices/ShapExplainCard';
import { SeverityBadge } from '../common/Badge';
import { BrainCircuit, CheckCircle2, XCircle, Search, Sparkles } from 'lucide-react';

interface MlAnomaliesHubProps {
  onSelectDevice?: (deviceId: string) => void;
}

export const MlAnomaliesHub: React.FC<MlAnomaliesHubProps> = ({ onSelectDevice }) => {
  const [anomalies, setAnomalies] = useState<AnomalyEvent[]>([]);
  const [devices, setDevices] = useState<Device[]>([]);
  const [selectedAnomaly, setSelectedAnomaly] = useState<AnomalyEvent | null>(null);
  const [filterType, setFilterType] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [actionMessage, setActionMessage] = useState<string | null>(null);

  const loadData = async () => {
    try {
      const [anomList, devList] = await Promise.all([
        ApiService.getAnomalyEvents(),
        ApiService.getDevices()
      ]);
      setAnomalies(anomList);
      setDevices(devList);
      if (anomList.length > 0 && !selectedAnomaly) {
        setSelectedAnomaly(anomList[0]);
      }
    } catch {
      // ignore
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleDisposition = async (id: string, disposition: 'CONFIRMED_THREAT' | 'FALSE_POSITIVE') => {
    try {
      await ApiService.submitAnomalyDisposition(id, disposition);
      setActionMessage(`Analyst feedback recorded (${disposition}). Model baseline calibrated.`);
      await loadData();
    } catch (err: any) {
      setActionMessage(`Error: ${err.message}`);
    }
  };

  const filtered = anomalies.filter(a => {
    if (filterType && a.anomalyType !== filterType) return false;
    if (searchTerm) {
      const q = searchTerm.toLowerCase();
      return (
        a.id.toLowerCase().includes(q) ||
        a.deviceId.toLowerCase().includes(q) ||
        a.contributingFeatures.some(f => f.toLowerCase().includes(q))
      );
    }
    return true;
  });

  return (
    <div className="space-y-6 text-xs">
      {/* Header Banner */}
      <div className="organic-glass-card p-6 border-[#CC5833]/30">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-[#26372E]">
          <div className="flex items-center gap-4">
            <div className="p-3.5 rounded-2xl bg-[#CC5833]/15 border border-[#CC5833]/30 text-[#CC5833]">
              <BrainCircuit className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-3">
                <h2 className="text-base font-bold text-white tracking-tight">
                  Tier 2 ML Anomaly Detection & SHAP Explainability Engine
                </h2>
                <span className="px-3 py-0.5 rounded-full bg-[#2E4036] text-[#30D158] border border-[#708A7C]/30 text-[10px] font-bold font-mono">
                  Isolation Forest + SHAP
                </span>
              </div>
              <p className="text-[#94A39B] text-xs mt-1">
                Identifies gradual slope drift, sensor pinches, and peer fleet divergence beyond static rule thresholds with mathematical feature attribution.
              </p>
            </div>
          </div>
        </div>

        {actionMessage && (
          <div className="mt-4 p-3.5 rounded-2xl bg-[#CC5833]/15 border border-[#CC5833]/30 text-[#F4F2EC]">
            {actionMessage}
          </div>
        )}
      </div>

      {/* Grid: Events List & SHAP Detail */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Col: Anomaly Events List */}
        <div className="organic-glass-card p-6 space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-[#26372E]">
            <h3 className="text-xs font-bold uppercase tracking-wider text-white font-mono">
              Flagged ML Anomalies ({filtered.length})
            </h3>
            <span className="text-[11px] font-mono text-[#708A7C]">Active Models</span>
          </div>

          {/* Search & Filter */}
          <div className="space-y-2">
            <div className="relative">
              <Search className="w-3.5 h-3.5 text-[#708A7C] absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search device or feature..."
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
                className="w-full bg-[#142019] border border-[#26372E] rounded-full pl-9 pr-3 py-2 text-[#F4F2EC] placeholder-[#708A7C] focus:outline-none focus:border-[#CC5833]"
              />
            </div>
          </div>

          <div className="space-y-3 max-h-[520px] overflow-y-auto pr-1">
            {filtered.length === 0 ? (
              <div className="text-center py-10 text-[#708A7C]">No anomaly events matching criteria.</div>
            ) : (
              filtered.map(anom => {
                const isSelected = selectedAnomaly?.id === anom.id;
                const dev = devices.find(d => d.id === anom.deviceId);
                return (
                  <div
                    key={anom.id}
                    onClick={() => setSelectedAnomaly(anom)}
                    className={`p-4 rounded-2xl border cursor-pointer transition-all hover-lift ${
                      isSelected
                        ? 'bg-[#1C2B22] border-[#CC5833]/60 shadow-organic-hover text-white'
                        : 'bg-[#142019] border-[#26372E] text-[#CBD4CF] hover:border-[#708A7C]/50'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-sm font-sans">{anom.anomalyType.replace(/_/g, ' ')}</span>
                        <SeverityBadge severity={anom.severity} />
                      </div>
                      <span className="font-mono text-[#CC5833] font-bold">
                        {(anom.anomalyScore * 100).toFixed(0)}%
                      </span>
                    </div>

                    <div className="flex items-center justify-between text-[11px] text-[#708A7C] mt-2 font-mono">
                      <span className="text-[#30D158]">{dev?.serialNumber || anom.deviceId}</span>
                      <span>{new Date(anom.timestamp).toLocaleTimeString()}</span>
                    </div>

                    <div className="text-[10px] text-[#94A39B] mt-1 truncate">
                      Drivers: {anom.contributingFeatures.join(', ')}
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Right 2 Cols: Selected Anomaly SHAP Inspector & Feedback Loop */}
        <div className="lg:col-span-2 space-y-5">
          {selectedAnomaly ? (
            <div className="space-y-5">
              <ShapExplainCard anomaly={selectedAnomaly} />

              {/* Analyst Disposition Feedback Loop */}
              <div className="organic-glass-card p-6 space-y-4">
                <div className="flex items-center justify-between pb-3 border-b border-[#26372E]">
                  <div className="flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-[#CC5833]" />
                    <h3 className="text-xs font-bold uppercase tracking-wider text-white font-mono">
                      Analyst Ground Truth Feedback Loop
                    </h3>
                  </div>
                  <span className="text-[10px] text-[#708A7C] font-mono">
                    Status: <strong className="text-white">{selectedAnomaly.status}</strong>
                  </span>
                </div>

                <p className="text-xs text-[#94A39B]">
                  Submitting disposition dynamically calibrates the active model precision baseline and logs telemetry feedback to the ML registry.
                </p>

                <div className="flex flex-col sm:flex-row items-center gap-3 pt-2">
                  <button
                    onClick={() => handleDisposition(selectedAnomaly.id, 'CONFIRMED_THREAT')}
                    className="magnetic-btn w-full sm:flex-1 flex items-center justify-center gap-2 py-3 rounded-full bg-[#30D158]/20 hover:bg-[#30D158]/30 border border-[#30D158]/40 text-[#30D158] font-semibold transition-all"
                  >
                    <CheckCircle2 className="w-4 h-4" />
                    <span>Confirm Threat (True Anomaly)</span>
                  </button>

                  <button
                    onClick={() => handleDisposition(selectedAnomaly.id, 'FALSE_POSITIVE')}
                    className="magnetic-btn w-full sm:flex-1 flex items-center justify-center gap-2 py-3 rounded-full bg-[#142019] hover:bg-[#1E2622] border border-[#26372E] text-[#CBD4CF] font-semibold transition-all"
                  >
                    <XCircle className="w-4 h-4 text-[#708A7C]" />
                    <span>Tag False Positive (Harmless)</span>
                  </button>
                </div>
              </div>
            </div>
          ) : (
            <div className="text-center py-16 organic-glass-card text-[#708A7C]">
              Select an anomaly from the left panel to inspect SHAP feature attributions.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
