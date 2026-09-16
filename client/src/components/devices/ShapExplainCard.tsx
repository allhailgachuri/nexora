import React from 'react';
import { AnomalyEvent, ShapValue } from '../../types';
import { BrainCircuit, Info } from 'lucide-react';

interface ShapExplainCardProps {
  anomaly: AnomalyEvent;
}

export const ShapExplainCard: React.FC<ShapExplainCardProps> = ({ anomaly }) => {
  return (
    <div className="organic-glass-card p-6 border-[#CC5833]/30">
      <div className="flex items-center justify-between pb-4 border-b border-[#26372E]">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-2xl bg-[#CC5833]/15 text-[#CC5833] border border-[#CC5833]/30">
            <BrainCircuit className="w-5 h-5" />
          </div>
          <div>
            <h4 className="text-sm font-bold text-white tracking-tight">Tier 2 ML Explainability & SHAP Vectors</h4>
            <p className="text-[11px] text-[#94A39B] mt-0.5">
              Model: <span className="font-mono text-[#F4F2EC]">{anomaly.modelVersion}</span> ({anomaly.anomalyType})
            </p>
          </div>
        </div>
        <div className="text-right">
          <div className="text-[10px] uppercase font-mono font-semibold text-[#708A7C]">Anomaly Score</div>
          <div className="text-base font-bold font-mono text-[#CC5833]">
            {(anomaly.anomalyScore * 100).toFixed(1)}%
          </div>
        </div>
      </div>

      <div className="mt-4 space-y-3">
        <div className="text-xs text-[#CBD4CF] flex items-center gap-2">
          <Info className="w-4 h-4 text-[#708A7C]" />
          <span>Feature contribution weights toward anomalous classification:</span>
        </div>

        {anomaly.shapValues.map((shap: ShapValue) => (
          <div key={shap.feature} className="p-3.5 rounded-2xl bg-[#142019] border border-[#26372E] text-xs">
            <div className="flex items-center justify-between mb-2">
              <span className="font-mono font-semibold text-[#F4F2EC]">{shap.feature}</span>
              <div className="flex items-center gap-3">
                <span className="text-[#708A7C] text-[11px] font-mono">
                  Val: <span className="text-white font-mono">{shap.value}</span> (Baseline: {shap.baseline})
                </span>
                <span className={`font-mono font-bold ${shap.isMajorDriver ? 'text-[#CC5833]' : 'text-[#30D158]'}`}>
                  {shap.contributionPercent}%
                </span>
              </div>
            </div>

            {/* Progress bar */}
            <div className="w-full h-2 bg-[#26372E] rounded-full overflow-hidden">
              <div
                className={`h-full rounded-full ${
                  shap.isMajorDriver
                    ? 'bg-gradient-to-r from-[#CC5833] to-[#E85D04]'
                    : 'bg-gradient-to-r from-[#2E4036] to-[#708A7C]'
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
