import React, { useState, useEffect } from 'react';
import { ApiService } from '../../services/api';
import { AuditLogEntry } from '../../types';
import { ScrollText, ShieldCheck, AlertOctagon, CheckCircle2, RefreshCw, Hash, UserCheck } from 'lucide-react';
import { Modal } from '../common/Modal';

export const AuditExplorer: React.FC = () => {
  const [logs, setLogs] = useState<AuditLogEntry[]>([]);
  const [verification, setVerification] = useState<any>(null);
  const [isVerifying, setIsVerifying] = useState(false);
  const [selectedLog, setSelectedLog] = useState<AuditLogEntry | null>(null);

  const loadLogs = async () => {
    try {
      const logList = await ApiService.getAuditLogs(150);
      setLogs(logList);
    } catch {
      // ignore
    }
  };

  useEffect(() => {
    loadLogs();
  }, []);

  const handleVerifyChain = async () => {
    setIsVerifying(true);
    try {
      const res = await ApiService.verifyAuditChain();
      setVerification(res);
    } finally {
      setIsVerifying(false);
    }
  };

  return (
    <div className="space-y-6 text-xs">
      {/* Header & Verification Bar */}
      <div className="organic-glass-card p-6 border-[#30D158]/30">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-[#26372E]">
          <div className="flex items-center gap-4">
            <div className="p-3.5 rounded-2xl bg-[#2E4036] border border-[#708A7C]/30 text-[#30D158]">
              <ScrollText className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-3">
                <h2 className="text-base font-bold text-white tracking-tight">
                  Tamper-Evident SHA-256 Audit Ledger
                </h2>
                <span className="px-3 py-0.5 rounded-full bg-[#2E4036] text-[#30D158] border border-[#708A7C]/30 text-[10px] font-bold font-mono">
                  SHA-256 Hash Chain
                </span>
              </div>
              <p className="text-[#94A39B] text-xs mt-1">
                Immutable cryptographic ledger recording every certificate lifecycle event, shadow delta update, and safety-gated execution.
              </p>
            </div>
          </div>

          <button
            onClick={handleVerifyChain}
            disabled={isVerifying}
            className="magnetic-btn flex items-center gap-2 px-5 py-2.5 rounded-full bg-[#CC5833] hover:bg-[#B54926] text-white font-semibold shadow-clay-glow transition-all self-start md:self-auto disabled:opacity-50"
          >
            {isVerifying ? <RefreshCw className="w-4 h-4 animate-spin" /> : <ShieldCheck className="w-4 h-4" />}
            <span>Verify SHA-256 Chain Integrity</span>
          </button>
        </div>

        {/* Verification Status Output */}
        {verification && (
          <div className={`mt-4 p-4 rounded-2xl border flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${
            verification.isValid
              ? 'bg-[#30D158]/15 border-[#30D158]/30 text-[#30D158]'
              : 'bg-[#E30000]/15 border-[#E30000]/30 text-[#E30000]'
          }`}>
            <div className="flex items-center gap-3">
              {verification.isValid ? <CheckCircle2 className="w-5 h-5 text-[#30D158] shrink-0" /> : <AlertOctagon className="w-5 h-5 text-[#E30000] shrink-0" />}
              <div>
                <div className="font-bold text-sm text-white">
                  {verification.isValid ? 'Cryptographic Hash Chain Verified Intact' : 'Audit Chain Broken / Tampered'}
                </div>
                <div className="text-[11px] opacity-80 mt-0.5">
                  {verification.isValid
                    ? `Verified all ${verification.totalLogs} block hashes and predecessor links without cryptographic discrepancies.`
                    : `Discrepancy detected at entry ID ${verification.brokenAtLogId}`}
                </div>
              </div>
            </div>
            <span className="text-xs font-mono font-bold px-3 py-1 rounded-full bg-[#142019] border border-current">{verification.totalLogs} Blocks Checked</span>
          </div>
        )}
      </div>

      {/* Audit Log Table */}
      <div className="organic-glass-card overflow-hidden">
        <div className="p-5 border-b border-[#26372E] flex items-center justify-between">
          <h3 className="text-xs font-bold uppercase tracking-wider text-white font-mono">
            Immutable Audit Trail ({logs.length} Entries)
          </h3>
          <span className="text-[11px] font-mono text-[#708A7C]">Append-Only Cryptographic Store</span>
        </div>

        <div className="overflow-x-auto max-h-[550px]">
          <table className="w-full text-left text-xs text-[#CBD4CF]">
            <thead className="bg-[#142019] text-[10px] font-mono uppercase tracking-wider text-[#708A7C] border-b border-[#26372E] sticky top-0">
              <tr>
                <th className="py-3.5 px-4">Timestamp</th>
                <th className="py-3.5 px-4">Actor</th>
                <th className="py-3.5 px-4">Action</th>
                <th className="py-3.5 px-4">Resource</th>
                <th className="py-3.5 px-4">SHA-256 Hash</th>
                <th className="py-3.5 px-4 text-right">Payload</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#26372E] font-mono">
              {logs.map(log => (
                <tr
                  key={log.id}
                  onClick={() => setSelectedLog(log)}
                  className="hover:bg-[#1C2B22]/60 transition-colors cursor-pointer"
                >
                  <td className="py-3 px-4 text-[11px] text-[#708A7C]">
                    {new Date(log.timestamp).toLocaleString()}
                  </td>

                  <td className="py-3 px-4 font-sans">
                    <div className="font-bold text-white">{log.actorEmail}</div>
                    <div className="text-[10px] text-[#30D158] font-mono">{log.actorRole}</div>
                  </td>

                  <td className="py-3 px-4">
                    <span className="px-2.5 py-0.5 rounded-full bg-[#142019] border border-[#26372E] text-white text-[11px]">
                      {log.action}
                    </span>
                  </td>

                  <td className="py-3 px-4 font-sans text-[#CBD4CF]">
                    <span className="text-[10px] font-bold text-[#708A7C]">{log.resourceType}:</span>{' '}
                    <span className="font-mono text-[#F4F2EC]">{log.resourceId}</span>
                  </td>

                  <td className="py-3 px-4 text-[11px] text-[#708A7C] select-all max-w-xs truncate">
                    {log.hash}
                  </td>

                  <td className="py-3 px-4 text-right font-sans">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelectedLog(log);
                      }}
                      className="px-3 py-1 rounded-full bg-[#142019] hover:bg-[#1E2622] text-[#CBD4CF] hover:text-white text-[11px] border border-[#26372E]"
                    >
                      View Diff
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Audit Detail Modal */}
      <Modal
        isOpen={Boolean(selectedLog)}
        onClose={() => setSelectedLog(null)}
        title="Audit Block Inspection"
        subtitle={`Block ID: ${selectedLog?.id}`}
        maxWidth="lg"
      >
        {selectedLog && (
          <div className="space-y-4 font-mono text-xs">
            <div className="grid grid-cols-2 gap-3">
              <div className="p-4 rounded-2xl bg-[#142019] border border-[#26372E]">
                <span className="text-[#708A7C] block mb-1 font-sans">Actor Email / Role</span>
                <span className="text-white font-bold">{selectedLog.actorEmail} ({selectedLog.actorRole})</span>
              </div>
              <div className="p-4 rounded-2xl bg-[#142019] border border-[#26372E]">
                <span className="text-[#708A7C] block mb-1 font-sans">Target Resource</span>
                <span className="text-[#30D158] font-bold">{selectedLog.resourceType} - {selectedLog.resourceId}</span>
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-[#142019] border border-[#26372E] space-y-2">
              <div className="text-[#708A7C]">Previous Block Hash (Parent):</div>
              <div className="text-[11px] text-[#708A7C] truncate select-all">{selectedLog.prevHash}</div>
              <div className="text-[#708A7C] pt-1">Current Block Hash:</div>
              <div className="text-[11px] text-[#30D158] truncate select-all font-bold">{selectedLog.hash}</div>
            </div>

            <div>
              <span className="text-[#708A7C] block mb-1.5 font-bold font-sans">Action Details & State Payload</span>
              <pre className="p-4 rounded-2xl bg-[#0E1411] border border-[#26372E] text-[11px] text-[#30D158] overflow-x-auto max-h-56">
                {JSON.stringify(selectedLog.details, null, 2)}
              </pre>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};
