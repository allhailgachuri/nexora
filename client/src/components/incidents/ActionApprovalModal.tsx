import React from 'react';
import { Modal } from '../common/Modal';
import { IncidentAction } from '../../types';
import { AlertOctagon, CheckCircle2 } from 'lucide-react';
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
      title="Safety Gate: Human Authorization Required"
      subtitle="Critical physical actuator or high-consequence containment policy"
      maxWidth="md"
    >
      <div className="space-y-4 text-xs">
        {/* Warning Banner */}
        <div className="p-4 rounded-2xl bg-[#E85D04]/15 border border-[#E85D04]/30 text-[#F4F2EC] space-y-2">
          <div className="flex items-center gap-2 font-bold text-sm text-[#E85D04]">
            <AlertOctagon className="w-5 h-5 text-[#E85D04]" />
            <span>High-Consequence Response Action Flagged</span>
          </div>
          <p className="text-[11px] text-[#CBD4CF] leading-relaxed">
            By policy, physical actions on critical municipal water actuators, energy breakers, or pressure valves cannot execute autonomously without explicit analyst digital signature sign-off.
          </p>
        </div>

        {/* Action Details */}
        <div className="p-4 rounded-2xl bg-[#142019] border border-[#26372E] space-y-2.5">
          <div className="flex items-center justify-between">
            <span className="text-[#708A7C] font-semibold font-mono">Action Type</span>
            <span className="font-mono text-[#CC5833] font-bold">{action.actionType}</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-[#708A7C] font-semibold font-mono">Target Node</span>
            <span className="font-mono text-white">{action.description}</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-[#708A7C] font-semibold font-mono">Authorized Signer</span>
            <span className="text-[#30D158] font-semibold">{currentUser.name} ({currentUser.role})</span>
          </div>
        </div>

        <div className="flex items-center justify-end gap-3 pt-3 border-t border-[#26372E]">
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2.5 rounded-full bg-[#142019] text-[#CBD4CF] hover:bg-[#1E2622] font-semibold border border-[#26372E]"
          >
            Cancel / Abort
          </button>
          <button
            type="button"
            disabled={isApproving}
            onClick={handleApprove}
            className="magnetic-btn flex items-center gap-2 px-6 py-2.5 rounded-full bg-[#E85D04] hover:bg-[#D65203] text-white font-semibold shadow-sm disabled:opacity-50"
          >
            <CheckCircle2 className="w-4 h-4" />
            <span>{isApproving ? 'Authorizing...' : 'Grant Sign-Off & Execute'}</span>
          </button>
        </div>
      </div>
    </Modal>
  );
};
