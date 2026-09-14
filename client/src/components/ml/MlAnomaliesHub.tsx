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
      setActionMessage(`Analyst feedback recorded (${disposition}). Model drift metrics updated.`);
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
      <div className="glass-panel rounded-2xl p-5 border border-purple-500/30 bg-purple-950/10">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-purple-800/40">
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-xl bg-purple-500/20 border border-purple-500/40 text-purple-400">
              <BrainCircuit className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base font-bold text-white tracking-wide">
                  Tier 2 ML Anomaly Detection & SHAP Explainability Engine
                </h2>
                <span className="px-2 py-0.5 rounded bg-purple-950 text-purple-300 border border-purple-800 text-[10px] font-bold">
                  Isolation Forest + Autoencoders
                </span>
              </div>
              <p className="text-slate-300 text-[11px] mt-0.5">
                Surfaces behavioral drift, stuck sensors, and peer fleet divergence beyond static rule thresholds with full feature-level SHAP attributions.
              </p>
            </div>
          </div>
        </div>

        {actionMessage && (
          <div className="mt-3 p-3 rounded-xl bg-purple-950/50 border border-purple-500/50 text-purple-200">
            {actionMessage}
          </div>
        )}
      </div>

      {/* Grid: Events List & SHAP Detail */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Col: Anomaly Events List */}
        <div className="glass-panel rounded-2xl p-5 border border-slate-800 space-y-3">
          <div className="flex items-center justify-between pb-3 border-b border-slate-800">
            <h3 className="text-sm font-bold uppercase tracking-wider text-white">
              Flagged ML Anomalies ({filtered.length})
            </h3>
            <span className="text-[11px] font-mono text-slate-400">Versioned Models</span>
          </div>

          {/* Search & Filter */}
          <div className="space-y-2">
            <div className="relative">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search device or feature..."
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
                className="w-full bg-[#0c101a] border border-slate-800 rounded-lg pl-8 pr-3 py-1.5 text-slate-200 focus:outline-none focus:border-purple-500"
              />
            </div>
          </div>

          <div className="space-y-2.5 max-h-[500px] overflow-y-auto pr-1">
            {filtered.length === 0 ? (
              <div className="text-center py-8 text-slate-400">No anomaly events matching criteria.</div>
            ) : (
              filtered.map(anom => {
                const isSelected = selectedAnomaly?.id === anom.id;
                const dev = devices.find(d => d.id === anom.deviceId);
                return (
                  <div
                    key={anom.id}
                    onClick={() => setSelectedAnomaly(anom)}
                    className={`p-3 rounded-xl border cursor-pointer transition-all ${
                      isSelected
                        ? 'bg-purple-950/40 border-purple-500/60 shadow-lg text-white'
                        : 'bg-[#0c101a] border-slate-800 text-slate-300 hover:border-slate-700'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-sm font-sans">{anom.anomalyType.replace(/_/g, ' ')}</span>
                        <SeverityBadge severity={anom.severity} />
                      </div>
                      <span className="font-mono text-purple-400 font-bold">
                        {(anom.anomalyScore * 100).toFixed(0)}%
                      </span>
                    </div>

                    <div className="flex items-center justify-between text-[11px] text-slate-400 mt-1.5 font-mono">
                      <span className="text-cyan-400">{dev?.serialNumber || anom.deviceId}</span>
                      <span>{new Date(anom.timestamp).toLocaleTimeString()}</span>
                    </div>

                    <div className="text-[10px] text-slate-400 mt-1 truncate">
                      Drivers: {anom.contributingFeatures.join(', ')}
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Right 2 Cols: Selected Anomaly SHAP Inspector & Feedback Loop */}
        <div className="lg:col-span-2 space-y-4">
          {selectedAnomaly ? (
            <div className="space-y-4">
              <ShapExplainCard anomaly={selectedAnomaly} />

              {/* Analyst Disposition Feedback Loop */}
              <div className="glass-panel rounded-2xl p-5 border border-slate-800 space-y-3">
                <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                  <div className="flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-purple-400" />
                    <h3 className="text-sm font-bold uppercase tracking-wider text-white">
                      Analyst Ground Truth Feedback Loop
                    </h3>
                  </div>
                  <span className="text-[10px] text-slate-400 font-mono">
                    Status: <strong className="text-cyan-300">{selectedAnomaly.status}</strong>
                  </span>
                </div>

                <p className="text-[11px] text-slate-300">
                  Submitting disposition dynamically calibrates the active model precision/drift metrics and logs training feedback to the ML registry.
                </p>

                <div className="flex items-center gap-3 pt-2">
                  <button
                    onClick={() => handleDisposition(selectedAnomaly.id, 'CONFIRMED_THREAT')}
                    className="flex-1 flex items-center justify-center gap-2 py-2 rounded-xl bg-emerald-950/60 hover:bg-emerald-900/80 border border-emerald-500/40 text-emerald-300 font-semibold transition-all"
                  >
                    <CheckCircle2 className="w-4 h-4" />
                    <span>Confirm Threat / True Anomaly</span>
                  </button>

                  <button
                    onClick={() => handleDisposition(selectedAnomaly.id, 'FALSE_POSITIVE')}
                    className="flex-1 flex items-center justify-center gap-2 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-300 font-semibold transition-all"
                  >
                    <XCircle className="w-4 h-4" />
                    <span>Tag False Positive (Harmless)</span>
                  </button>
                </div>
              </div>
            </div>
          ) : (
            <div className="text-center py-12 glass-panel rounded-2xl text-slate-400">
              Select an anomaly from the left panel to inspect SHAP feature attributions.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
