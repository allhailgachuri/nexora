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
      <div className="glass-panel rounded-2xl p-5 border border-slate-800">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-3">
              <h2 className="text-lg font-bold text-white tracking-wide">{incident.title}</h2>
              <SeverityBadge severity={incident.severity} />
              <StatusBadge status={incident.status} />
            </div>
            <p className="text-xs text-slate-400 mt-1">{incident.description}</p>
            <div className="flex items-center gap-4 text-[11px] font-mono text-slate-400 mt-2">
              <span>ID: <strong className="text-white">{incident.id}</strong></span>
              <span>•</span>
              <span>Opened: {new Date(incident.createdAt).toLocaleString()}</span>
              {device && (
                <>
                  <span>•</span>
                  <span>Target: <strong className="text-cyan-400">{device.serialNumber}</strong> ({device.name})</span>
                </>
              )}
            </div>
          </div>

          {/* Status Transitions */}
          <div className="flex items-center gap-2">
            {incident.status === 'OPEN' && (
              <button
                onClick={() => onUpdateStatus('TRIAGED')}
                className="px-3 py-1.5 rounded-lg bg-amber-950/60 hover:bg-amber-900 border border-amber-500/40 text-amber-300 text-xs font-semibold"
              >
                Mark Triaged
              </button>
            )}
            {(incident.status === 'OPEN' || incident.status === 'TRIAGED') && (
              <button
                onClick={() => onUpdateStatus('INVESTIGATING')}
                className="px-3 py-1.5 rounded-lg bg-cyan-950/60 hover:bg-cyan-900 border border-cyan-500/40 text-cyan-300 text-xs font-semibold"
              >
                Begin Investigation
              </button>
            )}
            {incident.status !== 'RESOLVED' && incident.status !== 'CLOSED' && (
              <button
                onClick={() => onUpdateStatus('RESOLVED', rootCause)}
                className="px-3 py-1.5 rounded-lg bg-emerald-950/60 hover:bg-emerald-900 border border-emerald-500/40 text-emerald-300 text-xs font-semibold"
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
          <div className="glass-panel rounded-2xl p-5 border border-slate-800 space-y-3">
            <div className="flex items-center gap-2 pb-3 border-b border-slate-800">
              <ShieldAlert className="w-4 h-4 text-rose-400" />
              <h3 className="text-sm font-bold uppercase tracking-wider text-white">
                Correlated Transport & Identity Security Events ({securityEvents.length})
              </h3>
            </div>

            {securityEvents.length === 0 ? (
              <div className="text-center py-4 text-xs text-slate-400">No raw security events linked.</div>
            ) : (
              securityEvents.map(sec => (
                <div key={sec.id} className="p-3 rounded-xl bg-[#0c101a] border border-slate-800 text-xs space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-white">{sec.eventType.replace(/_/g, ' ')}</span>
                    <span className="font-mono text-[10px] text-slate-400">{new Date(sec.timestamp).toLocaleTimeString()}</span>
                  </div>
                  <p className="text-[11px] text-slate-300">{sec.details}</p>
                  {sec.clientIp && (
                    <div className="text-[10px] font-mono text-cyan-400">Attacker/Origin IP: {sec.clientIp}</div>
                  )}
                </div>
              ))
            )}
          </div>

          {/* Anomaly Events & SHAP Breakdown */}
          {anomalyEvents.length > 0 && (
            <div className="space-y-3">
              <div className="flex items-center gap-2 text-sm font-bold uppercase tracking-wider text-white">
                <BrainCircuit className="w-4 h-4 text-purple-400" />
                <span>Behavioral Anomaly & Explainability Evidence</span>
              </div>
              {anomalyEvents.map(anom => (
                <ShapExplainCard key={anom.id} anomaly={anom} />
              ))}
            </div>
          )}

          {/* Comments & Investigation Notes Thread */}
          <div className="glass-panel rounded-2xl p-5 border border-slate-800 space-y-4">
            <div className="flex items-center gap-2 pb-3 border-b border-slate-800">
              <MessageSquare className="w-4 h-4 text-cyan-400" />
              <h3 className="text-sm font-bold uppercase tracking-wider text-white">
                Analyst Timeline & Investigation Notes ({incident.comments.length})
              </h3>
            </div>

            <div className="space-y-3">
              {incident.comments.map(c => (
                <div key={c.id} className="p-3 rounded-xl bg-[#0c101a] border border-slate-800 text-xs">
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-semibold text-cyan-300">{c.userName}</span>
                    <span className="text-[10px] font-mono text-slate-400">{new Date(c.createdAt).toLocaleTimeString()}</span>
                  </div>
                  <p className="text-slate-200">{c.comment}</p>
                </div>
              ))}
            </div>

            <form onSubmit={handleCommentSubmit} className="flex gap-2 pt-2">
              <input
                type="text"
                placeholder="Add analyst note or evidence finding..."
                value={commentText}
                onChange={e => setCommentText(e.target.value)}
                className="flex-1 bg-[#0c101a] border border-slate-700 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-cyan-500"
              />
              <button
                type="submit"
                className="flex items-center gap-1.5 px-4 py-2 rounded-lg bg-cyan-950 hover:bg-cyan-900 border border-cyan-500/50 text-cyan-300 text-xs font-semibold"
              >
                <Send className="w-3.5 h-3.5" />
                <span>Post Note</span>
              </button>
            </form>
          </div>
        </div>

        {/* Right Col: Playbook Actions & Containment Controls */}
        <div className="space-y-5">
          {/* Response Playbook Engine */}
          <div className="glass-panel rounded-2xl p-5 border border-slate-800 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <Flame className="w-4 h-4 text-rose-400" />
                <h3 className="text-sm font-bold uppercase tracking-wider text-white">
                  Response Playbook
                </h3>
              </div>
              <span className="text-[10px] font-semibold px-2 py-0.5 rounded bg-cyan-950 text-cyan-300 border border-cyan-700/50">
                Safety-Gated
              </span>
            </div>

            <div className="space-y-2 text-xs">
              <button
                disabled={isActing}
                onClick={() => handleActionClick('QUARANTINE_DEVICE')}
                className="w-full flex items-center justify-between p-3 rounded-xl bg-rose-950/40 hover:bg-rose-900/60 border border-rose-500/40 text-rose-200 font-semibold transition-all disabled:opacity-50"
              >
                <div className="flex items-center gap-2">
                  <Flame className="w-4 h-4 text-rose-400" />
                  <span>Quarantine Node</span>
                </div>
                <Lock className="w-3.5 h-3.5 text-slate-400" />
              </button>

              <button
                disabled={isActing}
                onClick={() => handleActionClick('REVOKE_CERTIFICATE')}
                className="w-full flex items-center justify-between p-3 rounded-xl bg-purple-950/40 hover:bg-purple-900/60 border border-purple-500/40 text-purple-200 font-semibold transition-all disabled:opacity-50"
              >
                <div className="flex items-center gap-2">
                  <KeyRound className="w-4 h-4 text-purple-400" />
                  <span>Revoke X.509 Cert (CRL)</span>
                </div>
                <Lock className="w-3.5 h-3.5 text-slate-400" />
              </button>

              <button
                disabled={isActing}
                onClick={() => handleActionClick('ROTATE_CERTIFICATE')}
                className="w-full flex items-center justify-between p-3 rounded-xl bg-cyan-950/40 hover:bg-cyan-900/60 border border-cyan-500/40 text-cyan-200 font-semibold transition-all disabled:opacity-50"
              >
                <div className="flex items-center gap-2">
                  <RotateCw className="w-4 h-4 text-cyan-400" />
                  <span>Rotate Credentials</span>
                </div>
                <CheckCircle2 className="w-3.5 h-3.5 text-slate-400" />
              </button>

              <button
                disabled={isActing}
                onClick={() => handleActionClick('FORCE_OTA_UPDATE')}
                className="w-full flex items-center justify-between p-3 rounded-xl bg-blue-950/40 hover:bg-blue-900/60 border border-blue-500/40 text-blue-200 font-semibold transition-all disabled:opacity-50"
              >
                <div className="flex items-center gap-2">
                  <Cpu className="w-4 h-4 text-blue-400" />
                  <span>Force Signed OTA Patch</span>
                </div>
                <Lock className="w-3.5 h-3.5 text-slate-400" />
              </button>

              <button
                disabled={isActing}
                onClick={() => handleActionClick('DISPATCH_TECHNICIAN')}
                className="w-full flex items-center justify-between p-3 rounded-xl bg-slate-800/60 hover:bg-slate-700/60 border border-slate-700 text-slate-200 font-semibold transition-all disabled:opacity-50"
              >
                <div className="flex items-center gap-2">
                  <Wrench className="w-4 h-4 text-amber-400" />
                  <span>Dispatch Field Tech</span>
                </div>
                <CheckCircle2 className="w-3.5 h-3.5 text-slate-400" />
              </button>
            </div>
          </div>

          {/* Executed Actions Ledger */}
          <div className="glass-panel rounded-2xl p-5 border border-slate-800 space-y-3">
            <h3 className="text-sm font-bold uppercase tracking-wider text-white pb-3 border-b border-slate-800">
              Executed Action Ledger ({incident.actions.length})
            </h3>
            {incident.actions.length === 0 ? (
              <div className="text-center py-4 text-xs text-slate-400">No actions executed yet.</div>
            ) : (
              incident.actions.map(act => (
                <div key={act.id} className="p-3 rounded-xl bg-[#0c101a] border border-slate-800 text-xs space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="font-mono font-bold text-cyan-400">{act.actionType}</span>
                    <span className={`px-2 py-0.5 rounded text-[10px] font-semibold ${
                      act.status === 'EXECUTED' ? 'bg-emerald-950 text-emerald-400 border border-emerald-800' : 'bg-amber-950 text-amber-400 border border-amber-800'
                    }`}>
                      {act.status}
                    </span>
                  </div>
                  {act.resultDetails && (
                    <p className="text-[11px] text-slate-300">{act.resultDetails}</p>
                  )}
                  {act.status === 'PENDING_APPROVAL' && (
                    <button
                      onClick={() => setSelectedPendingAction(act)}
                      className="mt-2 w-full py-1.5 rounded bg-amber-600 hover:bg-amber-500 text-white font-bold text-xs"
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
