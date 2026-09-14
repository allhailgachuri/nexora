import React from 'react';
import { AnomalyEvent, ShapValue } from '../../types';
import { BrainCircuit, Info } from 'lucide-react';

interface ShapExplainCardProps {
  anomaly: AnomalyEvent;
}

export const ShapExplainCard: React.FC<ShapExplainCardProps> = ({ anomaly }) => {
  return (
    <div className="glass-panel rounded-xl p-5 border border-purple-500/30 bg-purple-950/10">
      <div className="flex items-center justify-between pb-3 border-b border-purple-800/40">
        <div className="flex items-center gap-2">
          <BrainCircuit className="w-5 h-5 text-purple-400" />
          <div>
            <h4 className="text-sm font-bold text-white">Tier 2 ML Explainability & SHAP Breakdown</h4>
            <p className="text-[11px] text-purple-300">
              Model: <span className="font-mono text-cyan-300">{anomaly.modelVersion}</span> ({anomaly.anomalyType})
            </p>
          </div>
        </div>
        <div className="text-right">
          <div className="text-xs font-semibold text-slate-400">Anomaly Score</div>
          <div className="text-base font-bold font-mono text-purple-400">
            {(anomaly.anomalyScore * 100).toFixed(1)}%
          </div>
        </div>
      </div>

      <div className="mt-4 space-y-3">
        <div className="text-xs text-slate-300 flex items-center gap-1.5">
          <Info className="w-4 h-4 text-cyan-400" />
          <span>Feature contribution weights toward anomalous classification:</span>
        </div>

        {anomaly.shapValues.map((shap: ShapValue) => (
          <div key={shap.feature} className="p-2.5 rounded-lg bg-[#0c101a] border border-slate-800 text-xs">
            <div className="flex items-center justify-between mb-1">
              <span className="font-mono font-semibold text-slate-200">{shap.feature}</span>
              <div className="flex items-center gap-3">
                <span className="text-slate-400 text-[11px]">
                  Val: <span className="text-white font-mono">{shap.value}</span> (Base: {shap.baseline})
                </span>
                <span className={`font-mono font-bold ${shap.isMajorDriver ? 'text-rose-400' : 'text-purple-300'}`}>
                  {shap.contributionPercent}%
                </span>
              </div>
            </div>

            {/* Progress bar */}
            <div className="w-full h-2 bg-slate-800 rounded-full overflow-hidden">
              <div
                className={`h-full rounded-full ${
                  shap.isMajorDriver
                    ? 'bg-gradient-to-r from-purple-500 to-rose-500'
                    : 'bg-gradient-to-r from-blue-500 to-purple-500'
                }`}
                style={{ width: `${Math.min(100, Math.max(5, shap.contributionPercent))}%` }}
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
