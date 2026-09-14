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
      <div className="glass-panel rounded-2xl p-5 border border-slate-800">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-xl bg-cyan-950/60 border border-cyan-500/40 text-cyan-400">
              <ScrollText className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base font-bold text-white tracking-wide">
                  Tamper-Evident Cryptographic Audit Ledger
                </h2>
                <span className="px-2 py-0.5 rounded bg-cyan-950 text-cyan-300 border border-cyan-800 text-[10px] font-bold">
                  SHA-256 Hash Chain
                </span>
              </div>
              <p className="text-slate-400 text-[11px] mt-0.5">
                Immutable, non-repudiable audit logs recording all certificate issuances, state changes, and playbook actions.
              </p>
            </div>
          </div>

          <button
            onClick={handleVerifyChain}
            disabled={isVerifying}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 text-white font-semibold shadow-cyber-glow transition-all self-start md:self-auto disabled:opacity-50"
          >
            {isVerifying ? <RefreshCw className="w-4 h-4 animate-spin" /> : <ShieldCheck className="w-4 h-4" />}
            <span>Verify SHA-256 Chain Integrity</span>
          </button>
        </div>

        {/* Verification Status Output */}
        {verification && (
          <div className={`mt-4 p-3.5 rounded-xl border flex items-center justify-between ${
            verification.isValid
              ? 'bg-emerald-950/40 border-emerald-500/50 text-emerald-300'
              : 'bg-rose-950/40 border-rose-500/50 text-rose-300'
          }`}>
            <div className="flex items-center gap-2.5">
              {verification.isValid ? <CheckCircle2 className="w-5 h-5 text-emerald-400" /> : <AlertOctagon className="w-5 h-5 text-rose-400" />}
              <div>
                <div className="font-bold text-sm">
                  {verification.isValid ? 'Cryptographic Hash Chain Verified Valid' : 'Audit Chain Broken / Tampered'}
                </div>
                <div className="text-[11px] opacity-80 mt-0.5">
                  {verification.isValid
                    ? `Verified all ${verification.totalLogs} block hashes and predecessor links without discrepancies.`
                    : `Discrepancy detected at entry ID ${verification.brokenAtLogId}`}
                </div>
              </div>
            </div>
            <span className="text-xs font-mono font-bold">{verification.totalLogs} Blocks Checked</span>
          </div>
        )}
      </div>

      {/* Audit Log Table */}
      <div className="glass-panel rounded-2xl border border-slate-800 overflow-hidden shadow-xl">
        <div className="p-4 border-b border-slate-800 flex items-center justify-between">
          <h3 className="text-sm font-bold uppercase tracking-wider text-white">
            Immutable Audit Trail ({logs.length} Entries)
          </h3>
          <span className="text-[11px] font-mono text-slate-400">Append-Only Cryptographic Store</span>
        </div>

        <div className="overflow-x-auto max-h-[550px]">
          <table className="w-full text-left text-xs text-slate-300">
            <thead className="bg-[#0c101a] text-[11px] uppercase tracking-wider text-slate-400 border-b border-slate-800 sticky top-0">
              <tr>
                <th className="py-3 px-4">Timestamp</th>
                <th className="py-3 px-4">Actor</th>
                <th className="py-3 px-4">Action</th>
                <th className="py-3 px-4">Resource</th>
                <th className="py-3 px-4">Entry SHA-256 Hash</th>
                <th className="py-3 px-4 text-right">Payload</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800 font-mono">
              {logs.map(log => (
                <tr
                  key={log.id}
                  onClick={() => setSelectedLog(log)}
                  className="hover:bg-slate-800/30 transition-colors cursor-pointer"
                >
                  <td className="py-2.5 px-4 text-[11px] text-slate-400">
                    {new Date(log.timestamp).toLocaleString()}
                  </td>

                  <td className="py-2.5 px-4 font-sans">
                    <div className="font-bold text-slate-200">{log.actorEmail}</div>
                    <div className="text-[10px] text-cyan-400">{log.actorRole}</div>
                  </td>

                  <td className="py-2.5 px-4">
                    <span className="px-2 py-0.5 rounded bg-slate-800 text-slate-200 text-[11px]">
                      {log.action}
                    </span>
                  </td>

                  <td className="py-2.5 px-4 font-sans text-slate-300">
                    <span className="text-[10px] font-bold text-slate-400">{log.resourceType}:</span>{' '}
                    <span className="font-mono text-cyan-300">{log.resourceId}</span>
                  </td>

                  <td className="py-2.5 px-4 text-[11px] text-slate-400 select-all max-w-xs truncate">
                    {log.hash}
                  </td>

                  <td className="py-2.5 px-4 text-right font-sans">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelectedLog(log);
                      }}
                      className="px-2 py-1 rounded bg-slate-800 hover:bg-slate-700 text-cyan-300 text-[11px]"
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
        subtitle={`ID: ${selectedLog?.id}`}
        maxWidth="lg"
      >
        {selectedLog && (
          <div className="space-y-4 font-mono text-xs">
            <div className="grid grid-cols-2 gap-3">
              <div className="p-3 rounded-xl bg-[#0c101a] border border-slate-800">
                <span className="text-slate-400 block mb-1">Actor Email / Role</span>
                <span className="text-white font-bold">{selectedLog.actorEmail} ({selectedLog.actorRole})</span>
              </div>
              <div className="p-3 rounded-xl bg-[#0c101a] border border-slate-800">
                <span className="text-slate-400 block mb-1">Target Resource</span>
                <span className="text-cyan-400 font-bold">{selectedLog.resourceType} - {selectedLog.resourceId}</span>
              </div>
            </div>

            <div className="p-3 rounded-xl bg-[#0c101a] border border-slate-800 space-y-1.5">
              <div className="text-slate-400">Previous Block Hash (Parent):</div>
              <div className="text-[11px] text-slate-400 truncate select-all">{selectedLog.prevHash}</div>
              <div className="text-slate-400 pt-1">Current Block Hash:</div>
              <div className="text-[11px] text-cyan-300 truncate select-all font-bold">{selectedLog.hash}</div>
            </div>

            <div>
              <span className="text-slate-400 block mb-1.5 font-bold">Action Details & State Payload</span>
              <pre className="p-3 rounded-xl bg-[#070a10] border border-slate-800 text-[11px] text-emerald-300 overflow-x-auto max-h-56">
                {JSON.stringify(selectedLog.details, null, 2)}
              </pre>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};
