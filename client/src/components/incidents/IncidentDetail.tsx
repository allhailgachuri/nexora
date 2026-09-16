import React, { useState } from 'react';
import { Incident, Device, SecurityEvent, AnomalyEvent, ActionType, IncidentAction } from '../../types';
import { SeverityBadge, StatusBadge } from '../common/Badge';
import { ShapExplainCard } from '../devices/ShapExplainCard';
import { ActionApprovalModal } from './ActionApprovalModal';
import { useAuth } from '../../context/AuthContext';
import {
  AlertTriangle,
  ShieldAlert,
  BrainCircuit,
  Flame,
  KeyRound,
  RotateCw,
  Cpu,
  Wrench,
  CheckCircle2,
  MessageSquare,
  Send,
  Lock
} from 'lucide-react';

interface IncidentDetailProps {
  incident: Incident;
  device?: Device;
  securityEvents: SecurityEvent[];
  anomalyEvents: AnomalyEvent[];
  onExecuteAction: (actionType: ActionType, forceApproval?: boolean) => Promise<any>;
  onApproveAction: (actionId: string) => Promise<void>;
  onAddComment: (comment: string) => Promise<void>;
  onUpdateStatus: (status: string, rootCause?: string) => Promise<void>;
}

export const IncidentDetail: React.FC<IncidentDetailProps> = ({
  incident,
  device,
  securityEvents,
  anomalyEvents,
  onExecuteAction,
  onApproveAction,
  onAddComment,
  onUpdateStatus
}) => {
  const { currentUser } = useAuth();
  const [commentText, setCommentText] = useState('');
  const [rootCause, setRootCause] = useState(incident.rootCauseAnalysis || '');
  const [selectedPendingAction, setSelectedPendingAction] = useState<IncidentAction | null>(null);
  const [isActing, setIsActing] = useState(false);

  const handleActionClick = async (actionType: ActionType) => {
    setIsActing(true);
    try {
      const res = await onExecuteAction(actionType);
      if (res.requiresHumanApproval) {
        setSelectedPendingAction(res.action);
      }
    } finally {
      setIsActing(false);
    }
  };

  const handleCommentSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!commentText.trim()) return;
    await onAddComment(commentText);
    setCommentText('');
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="organic-glass-card p-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-3">
              <h2 className="text-xl font-bold text-white tracking-tight">{incident.title}</h2>
              <SeverityBadge severity={incident.severity} />
              <StatusBadge status={incident.status} />
            </div>
            <p className="text-xs text-[#94A39B] mt-1.5">{incident.description}</p>
            <div className="flex flex-wrap items-center gap-4 text-[11px] font-mono text-[#708A7C] mt-2.5">
              <span>ID: <strong className="text-white">{incident.id}</strong></span>
              <span>•</span>
              <span>Opened: {new Date(incident.createdAt).toLocaleString()}</span>
              {device && (
                <>
                  <span>•</span>
                  <span>Target: <strong className="text-[#30D158]">{device.serialNumber}</strong> ({device.name})</span>
                </>
              )}
            </div>
          </div>

          {/* Status Transitions */}
          <div className="flex items-center gap-2.5">
            {incident.status === 'OPEN' && (
              <button
                onClick={() => onUpdateStatus('TRIAGED')}
                className="magnetic-btn px-4 py-2 rounded-full bg-[#E85D04]/20 hover:bg-[#E85D04]/30 border border-[#E85D04]/40 text-[#E85D04] text-xs font-semibold transition-all"
              >
                Mark Triaged
              </button>
            )}
            {(incident.status === 'OPEN' || incident.status === 'TRIAGED') && (
              <button
                onClick={() => onUpdateStatus('INVESTIGATING')}
                className="magnetic-btn px-4 py-2 rounded-full bg-[#2997FF]/20 hover:bg-[#2997FF]/30 border border-[#2997FF]/40 text-[#2997FF] text-xs font-semibold transition-all"
              >
                Begin Investigation
              </button>
            )}
            {incident.status !== 'RESOLVED' && incident.status !== 'CLOSED' && (
              <button
                onClick={() => onUpdateStatus('RESOLVED', rootCause)}
                className="magnetic-btn px-4 py-2 rounded-full bg-[#30D158]/20 hover:bg-[#30D158]/30 border border-[#30D158]/40 text-[#30D158] text-xs font-semibold transition-all"
              >
                Resolve Incident
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Grid: Playbook Actions & Evidence Timeline */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: Evidence & ML Attribution */}
        <div className="lg:col-span-2 space-y-5">
          {/* Security Events Linked */}
          <div className="organic-glass-card p-6 space-y-4">
            <div className="flex items-center gap-2.5 pb-3 border-b border-[#26372E]">
              <ShieldAlert className="w-4 h-4 text-[#CC5833]" />
              <h3 className="text-xs font-bold uppercase tracking-wider text-white font-mono">
                Correlated Transport & Identity Security Events ({securityEvents.length})
              </h3>
            </div>

            {securityEvents.length === 0 ? (
              <div className="text-center py-6 text-xs text-[#708A7C]">No raw security events linked.</div>
            ) : (
              securityEvents.map(sec => (
                <div key={sec.id} className="p-3.5 rounded-2xl bg-[#142019] border border-[#26372E] text-xs space-y-1.5 hover-lift">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-white">{sec.eventType.replace(/_/g, ' ')}</span>
                    <span className="font-mono text-[10px] text-[#708A7C]">{new Date(sec.timestamp).toLocaleTimeString()}</span>
                  </div>
                  <p className="text-[11px] text-[#94A39B]">{sec.details}</p>
                  {sec.clientIp && (
                    <div className="text-[10px] font-mono text-[#30D158]">Origin IP: {sec.clientIp}</div>
                  )}
                </div>
              ))
            )}
          </div>

          {/* Anomaly Events & SHAP Breakdown */}
          {anomalyEvents.length > 0 && (
            <div className="space-y-4">
              <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-white font-mono">
                <BrainCircuit className="w-4 h-4 text-[#CC5833]" />
                <span>Behavioral Anomaly & Explainability Evidence</span>
              </div>
              {anomalyEvents.map(anom => (
                <ShapExplainCard key={anom.id} anomaly={anom} />
              ))}
            </div>
          )}

          {/* Comments & Investigation Notes Thread */}
          <div className="organic-glass-card p-6 space-y-4">
            <div className="flex items-center gap-2.5 pb-3 border-b border-[#26372E]">
              <MessageSquare className="w-4 h-4 text-[#708A7C]" />
              <h3 className="text-xs font-bold uppercase tracking-wider text-white font-mono">
                Analyst Timeline & Investigation Notes ({incident.comments.length})
              </h3>
            </div>

            <div className="space-y-3">
              {incident.comments.map(c => (
                <div key={c.id} className="p-3.5 rounded-2xl bg-[#142019] border border-[#26372E] text-xs">
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-semibold text-white">{c.userName}</span>
                    <span className="text-[10px] font-mono text-[#708A7C]">{new Date(c.createdAt).toLocaleTimeString()}</span>
                  </div>
                  <p className="text-[#CBD4CF]">{c.comment}</p>
                </div>
              ))}
            </div>

            <form onSubmit={handleCommentSubmit} className="flex gap-2 pt-2">
              <input
                type="text"
                placeholder="Add analyst note or evidence finding..."
                value={commentText}
                onChange={e => setCommentText(e.target.value)}
                className="flex-1 bg-[#142019] border border-[#26372E] rounded-full px-4 py-2 text-xs text-white focus:outline-none focus:border-[#CC5833]"
              />
              <button
                type="submit"
                className="magnetic-btn flex items-center gap-1.5 px-5 py-2 rounded-full bg-[#142019] hover:bg-[#1E2622] border border-[#26372E] text-white text-xs font-semibold"
              >
                <Send className="w-3.5 h-3.5 text-[#CC5833]" />
                <span>Post Note</span>
              </button>
            </form>
          </div>
        </div>

        {/* Right Col: Playbook Actions & Containment Controls */}
        <div className="space-y-5">
          {/* Response Playbook Engine */}
          <div className="organic-glass-card p-6 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-[#26372E]">
              <div className="flex items-center gap-2">
                <Flame className="w-4 h-4 text-[#CC5833]" />
                <h3 className="text-xs font-bold uppercase tracking-wider text-white font-mono">
                  Response Playbook
                </h3>
              </div>
              <span className="text-[10px] font-semibold px-2.5 py-0.5 rounded-full bg-[#2E4036] text-[#30D158] border border-[#708A7C]/30">
                Safety-Gated
              </span>
            </div>

            <div className="space-y-2.5 text-xs">
              <button
                disabled={isActing}
                onClick={() => handleActionClick('QUARANTINE_DEVICE')}
                className="magnetic-btn w-full flex items-center justify-between p-3.5 rounded-2xl bg-[#E30000]/15 hover:bg-[#E30000]/25 border border-[#E30000]/30 text-[#E30000] font-semibold transition-all disabled:opacity-50"
              >
                <div className="flex items-center gap-2">
                  <Flame className="w-4 h-4" />
                  <span>Quarantine Node</span>
                </div>
                <Lock className="w-3.5 h-3.5 text-[#708A7C]" />
              </button>

              <button
                disabled={isActing}
                onClick={() => handleActionClick('REVOKE_CERTIFICATE')}
                className="magnetic-btn w-full flex items-center justify-between p-3.5 rounded-2xl bg-[#9D65C9]/15 hover:bg-[#9D65C9]/25 border border-[#9D65C9]/30 text-[#9D65C9] font-semibold transition-all disabled:opacity-50"
              >
                <div className="flex items-center gap-2">
                  <KeyRound className="w-4 h-4" />
                  <span>Revoke X.509 Cert (CRL)</span>
                </div>
                <Lock className="w-3.5 h-3.5 text-[#708A7C]" />
              </button>

              <button
                disabled={isActing}
                onClick={() => handleActionClick('ROTATE_CERTIFICATE')}
                className="magnetic-btn w-full flex items-center justify-between p-3.5 rounded-2xl bg-[#142019] hover:bg-[#1E2622] border border-[#26372E] text-white font-semibold transition-all disabled:opacity-50"
              >
                <div className="flex items-center gap-2">
                  <RotateCw className="w-4 h-4 text-[#30D158]" />
                  <span>Rotate Credentials</span>
                </div>
                <CheckCircle2 className="w-3.5 h-3.5 text-[#30D158]" />
              </button>

              <button
                disabled={isActing}
                onClick={() => handleActionClick('FORCE_OTA_UPDATE')}
                className="magnetic-btn w-full flex items-center justify-between p-3.5 rounded-2xl bg-[#2997FF]/15 hover:bg-[#2997FF]/25 border border-[#2997FF]/30 text-[#2997FF] font-semibold transition-all disabled:opacity-50"
              >
                <div className="flex items-center gap-2">
                  <Cpu className="w-4 h-4" />
                  <span>Force Signed Dual-OTA</span>
                </div>
                <Lock className="w-3.5 h-3.5 text-[#708A7C]" />
              </button>

              <button
                disabled={isActing}
                onClick={() => handleActionClick('DISPATCH_TECHNICIAN')}
                className="magnetic-btn w-full flex items-center justify-between p-3.5 rounded-2xl bg-[#142019] hover:bg-[#1E2622] border border-[#26372E] text-[#CBD4CF] font-semibold transition-all disabled:opacity-50"
              >
                <div className="flex items-center gap-2">
                  <Wrench className="w-4 h-4 text-[#E85D04]" />
                  <span>Dispatch Field Tech</span>
                </div>
                <CheckCircle2 className="w-3.5 h-3.5 text-[#708A7C]" />
              </button>
            </div>
          </div>

          {/* Executed Actions Ledger */}
          <div className="organic-glass-card p-6 space-y-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-white pb-3 border-b border-[#26372E] font-mono">
              Executed Action Ledger ({incident.actions.length})
            </h3>
            {incident.actions.length === 0 ? (
              <div className="text-center py-6 text-xs text-[#708A7C]">No actions executed yet.</div>
            ) : (
              incident.actions.map(act => (
                <div key={act.id} className="p-3.5 rounded-2xl bg-[#142019] border border-[#26372E] text-xs space-y-1.5">
                  <div className="flex items-center justify-between">
                    <span className="font-mono font-bold text-white">{act.actionType}</span>
                    <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-semibold ${
                      act.status === 'EXECUTED' ? 'bg-[#30D158]/20 text-[#30D158] border border-[#30D158]/40' : 'bg-[#E85D04]/20 text-[#E85D04] border border-[#E85D04]/40'
                    }`}>
                      {act.status}
                    </span>
                  </div>
                  {act.resultDetails && (
                    <p className="text-[11px] text-[#94A39B]">{act.resultDetails}</p>
                  )}
                  {act.status === 'PENDING_APPROVAL' && (
                    <button
                      onClick={() => setSelectedPendingAction(act)}
                      className="magnetic-btn mt-2 w-full py-2 rounded-full bg-[#E85D04] hover:bg-[#D65203] text-white font-bold text-xs shadow-sm"
                    >
                      Review & Approve Safety Gate
                    </button>
                  )}
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Safety Gate Modal */}
      <ActionApprovalModal
        isOpen={Boolean(selectedPendingAction)}
        onClose={() => setSelectedPendingAction(null)}
        action={selectedPendingAction}
        onApprove={onApproveAction}
      />
    </div>
  );
};
