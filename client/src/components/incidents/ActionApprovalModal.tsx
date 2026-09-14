import React from 'react';
import { Modal } from '../common/Modal';
import { IncidentAction } from '../../types';
import { AlertOctagon, CheckCircle2, ShieldAlert } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

interface ActionApprovalModalProps {
  isOpen: boolean;
  onClose: () => void;
  action: IncidentAction | null;
  onApprove: (actionId: string) => Promise<void>;
}

export const ActionApprovalModal: React.FC<ActionApprovalModalProps> = ({
  isOpen,
  onClose,
  action,
  onApprove
}) => {
  const { currentUser } = useAuth();
  const [isApproving, setIsApproving] = React.useState(false);

  if (!action) return null;

  const handleApprove = async () => {
    setIsApproving(true);
    try {
      await onApprove(action.id);
      onClose();
    } finally {
      setIsApproving(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Safety Gate: Human-in-the-Loop Approval Required"
      subtitle="Critical physical actuator or high-consequence infrastructure containment policy"
      maxWidth="md"
    >
      <div className="space-y-4 text-xs">
        {/* Warning Banner */}
        <div className="p-4 rounded-xl bg-amber-950/40 border border-amber-500/40 text-amber-200 space-y-2">
          <div className="flex items-center gap-2 font-bold text-sm text-amber-300">
            <AlertOctagon className="w-5 h-5 text-amber-400" />
            <span>High-Consequence Response Action Flagged</span>
          </div>
          <p className="text-[11px] leading-relaxed">
            By policy, destructive or isolation actions on critical municipal water actuators, energy meters, or physical valves cannot be automated without explicit analyst confirmation.
          </p>
        </div>

        {/* Action Details */}
        <div className="p-3 rounded-xl bg-[#0c101a] border border-slate-800 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-slate-400 font-semibold">Action Type</span>
            <span className="font-mono text-cyan-400 font-bold">{action.actionType}</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-slate-400 font-semibold">Target Node</span>
            <span className="font-mono text-white">{action.description}</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-slate-400 font-semibold">Authorized Approver</span>
            <span className="text-emerald-400 font-semibold">{currentUser.name} ({currentUser.role})</span>
          </div>
        </div>

        <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-800">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-lg bg-slate-800 text-slate-300 hover:bg-slate-700 font-semibold"
          >
            Cancel / Abort
          </button>
          <button
            type="button"
            disabled={isApproving}
            onClick={handleApprove}
            className="flex items-center gap-1.5 px-4 py-2 rounded-lg bg-gradient-to-r from-amber-600 to-rose-600 hover:from-amber-500 hover:to-rose-500 text-white font-semibold shadow-danger-glow disabled:opacity-50"
          >
            <CheckCircle2 className="w-4 h-4" />
            <span>{isApproving ? 'Authorizing...' : 'Grant Sign-Off & Execute'}</span>
          </button>
        </div>
      </div>
    </Modal>
  );
};
