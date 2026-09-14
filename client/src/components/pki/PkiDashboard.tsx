import React, { useState, useEffect } from 'react';
import { ApiService } from '../../services/api';
import { KeyRound, ShieldCheck, AlertOctagon, RotateCw, Copy, Check, FileText } from 'lucide-react';
import { Modal } from '../common/Modal';

export const PkiDashboard: React.FC = () => {
  const [rootCA, setRootCA] = useState<any>(null);
  const [certs, setCerts] = useState<any[]>([]);
  const [crl, setCrl] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);
  const [selectedCert, setSelectedCert] = useState<any>(null);

  // Revoke modal state
  const [revokeCertTarget, setRevokeCertTarget] = useState<any>(null);
  const [revokeReason, setRevokeReason] = useState('KEY_COMPROMISE');
  const [isRevoking, setIsRevoking] = useState(false);

  const loadPkiData = async () => {
    try {
      const [caData, certsData, crlData] = await Promise.all([
        ApiService.getRootCA(),
        ApiService.getCertificates(),
        ApiService.getCRL()
      ]);
      setRootCA(caData);
      setCerts(certsData);
      setCrl(crlData);
    } catch {
      // ignore
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadPkiData();
  }, []);

  const handleCopyCa = () => {
    if (rootCA?.certificatePem) {
      navigator.clipboard.writeText(rootCA.certificatePem);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleRevokeSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!revokeCertTarget) return;
    setIsRevoking(true);
    try {
      await ApiService.revokeCertificate(revokeCertTarget.serialNumber, revokeReason);
      setRevokeCertTarget(null);
      await loadPkiData();
    } finally {
      setIsRevoking(false);
    }
  };

  const handleRotate = async (deviceId: string) => {
    await ApiService.rotateCertificate(deviceId);
    await loadPkiData();
  };

  return (
    <div className="space-y-6 text-xs">
      {/* Root CA Banner */}
      <div className="glass-panel rounded-2xl p-5 border border-cyan-500/30 bg-cyan-950/10">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-cyan-800/40">
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-xl bg-cyan-500/20 border border-cyan-500/40 text-cyan-400">
              <KeyRound className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base font-bold text-white tracking-wide">
                  Nexora Root Certificate Authority (PKI G1)
                </h2>
                <span className="px-2 py-0.5 rounded bg-emerald-950 text-emerald-400 border border-emerald-800 text-[10px] font-bold">
                  RSA-2048 / SHA-256
                </span>
              </div>
              <p className="text-slate-300 text-[11px] mt-0.5">
                Issues unique, short-lived X.509 client credentials to all field sensor nodes (mTLS enforcement).
              </p>
            </div>
          </div>

          <button
            onClick={handleCopyCa}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-cyan-950 hover:bg-cyan-900 border border-cyan-500/50 text-cyan-300 font-semibold transition-all self-start md:self-auto"
          >
            {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
            <span>{copied ? 'Copied PEM' : 'Copy CA Cert PEM'}</span>
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mt-4">
          <div className="p-3 rounded-xl bg-[#0c101a] border border-slate-800">
            <div className="text-slate-400 font-semibold mb-1 text-[11px]">Root CA SHA-256 Fingerprint</div>
            <div className="font-mono text-cyan-400 truncate select-all">{rootCA?.fingerprintSha256 || 'Loading...'}</div>
          </div>
          <div className="p-3 rounded-xl bg-[#0c101a] border border-slate-800">
            <div className="text-slate-400 font-semibold mb-1 text-[11px]">Active Issued Certificates</div>
            <div className="font-mono text-emerald-400 text-base font-bold">{certs.filter(c => c.status === 'ACTIVE').length} Active</div>
          </div>
          <div className="p-3 rounded-xl bg-[#0c101a] border border-slate-800">
            <div className="text-slate-400 font-semibold mb-1 text-[11px]">Revocation List (CRL) Entries</div>
            <div className="font-mono text-rose-400 text-base font-bold">{crl.length} Revoked</div>
          </div>
        </div>
      </div>

      {/* Grid: Active Certificates & CRL Ledger */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: Issued Certificates Table */}
        <div className="lg:col-span-2 glass-panel rounded-2xl p-5 border border-slate-800 space-y-3">
          <div className="flex items-center justify-between pb-3 border-b border-slate-800">
            <h3 className="text-sm font-bold uppercase tracking-wider text-white">
              Issued Device Certificates Ledger ({certs.length})
            </h3>
            <span className="text-[11px] font-mono text-slate-400">90-Day Rotation Policy</span>
          </div>

          <div className="overflow-x-auto max-h-[500px]">
            <table className="w-full text-left text-xs text-slate-300">
              <thead className="bg-[#0c101a] text-[11px] uppercase tracking-wider text-slate-400 sticky top-0">
                <tr>
                  <th className="py-2.5 px-3">Serial / CN</th>
                  <th className="py-2.5 px-3">Status</th>
                  <th className="py-2.5 px-3">Valid Until</th>
                  <th className="py-2.5 px-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800 font-mono">
                {certs.map(cert => (
                  <tr key={cert.id} className="hover:bg-slate-800/30">
                    <td className="py-2.5 px-3">
                      <div className="font-bold text-white select-all">{cert.serialNumber}</div>
                      <div className="text-[10px] text-slate-400 font-sans truncate max-w-xs">{cert.subjectCommonName}</div>
                    </td>
                    <td className="py-2.5 px-3">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                        cert.status === 'ACTIVE'
                          ? 'bg-emerald-950 text-emerald-400 border border-emerald-800'
                          : 'bg-rose-950 text-rose-400 border border-rose-800'
                      }`}>
                        {cert.status}
                      </span>
                    </td>
                    <td className="py-2.5 px-3 text-slate-400 text-[11px]">
                      {new Date(cert.expiresAt).toLocaleDateString()}
                    </td>
                    <td className="py-2.5 px-3 text-right font-sans">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => setSelectedCert(cert)}
                          className="p-1 rounded bg-slate-800 hover:bg-slate-700 text-cyan-300"
                          title="View Certificate Details"
                        >
                          <FileText className="w-3.5 h-3.5" />
                        </button>
                        {cert.status === 'ACTIVE' && (
                          <>
                            <button
                              onClick={() => handleRotate(cert.deviceId)}
                              className="p-1 rounded bg-cyan-950 hover:bg-cyan-900 text-cyan-400"
                              title="Rotate Key & Certificate"
                            >
                              <RotateCw className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={() => setRevokeCertTarget(cert)}
                              className="p-1 rounded bg-rose-950 hover:bg-rose-900 text-rose-400"
                              title="Revoke Certificate (Add to CRL)"
                            >
                              <AlertOctagon className="w-3.5 h-3.5" />
                            </button>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Right Col: Certificate Revocation List (CRL) */}
        <div className="glass-panel rounded-2xl p-5 border border-slate-800 space-y-3">
          <div className="flex items-center gap-2 pb-3 border-b border-slate-800">
            <AlertOctagon className="w-4 h-4 text-rose-400" />
            <h3 className="text-sm font-bold uppercase tracking-wider text-white">
              Certificate Revocation List (CRL)
            </h3>
          </div>

          <p className="text-[11px] text-slate-400">
            Enforced at the mTLS broker layer. Handshakes with revoked credentials are immediately terminated.
          </p>

          <div className="space-y-2.5 max-h-[420px] overflow-y-auto pr-1">
            {crl.length === 0 ? (
              <div className="text-center py-6 text-slate-400">CRL ledger is empty.</div>
            ) : (
              crl.map(item => (
                <div key={item.serialNumber} className="p-3 rounded-xl bg-[#0c101a] border border-rose-900/40 text-xs space-y-1 font-mono">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-rose-400 select-all">{item.serialNumber}</span>
                    <span className="text-[10px] text-slate-400">{new Date(item.revokedAt).toLocaleDateString()}</span>
                  </div>
                  <div className="text-[10px] text-amber-300 font-sans">Reason: {item.reason}</div>
                  <div className="text-[10px] text-slate-400 truncate">Fingerprint: {item.fingerprintSha256}</div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Revoke Modal */}
      <Modal
        isOpen={Boolean(revokeCertTarget)}
        onClose={() => setRevokeCertTarget(null)}
        title="Revoke X.509 Device Certificate"
        subtitle="Immediately adds certificate serial to CRL; active sessions will be terminated"
        maxWidth="md"
      >
        <form onSubmit={handleRevokeSubmit} className="space-y-4 text-xs">
          <div className="p-3 rounded-xl bg-[#0c101a] border border-slate-800">
            <div className="text-slate-400 font-semibold mb-1">Target Certificate Serial</div>
            <div className="font-mono text-cyan-400 font-bold">{revokeCertTarget?.serialNumber}</div>
          </div>

          <div>
            <label className="block text-slate-300 font-semibold mb-1">Revocation Reason Code</label>
            <select
              value={revokeReason}
              onChange={e => setRevokeReason(e.target.value)}
              className="w-full bg-[#0c101a] border border-slate-700 rounded-lg p-2.5 text-white focus:outline-none focus:border-cyan-500"
            >
              <option value="KEY_COMPROMISE">Key Compromise (Device private key extracted)</option>
              <option value="SUSPECTED_CLONING">Suspected Cloning (Concurrent IP usage detected)</option>
              <option value="ANOMALY_QUARANTINE">Anomaly Quarantine (Automated policy containment)</option>
              <option value="DECOMMISSIONED">Decommissioned (Device hardware retired)</option>
            </select>
          </div>

          <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-800">
            <button
              type="button"
              onClick={() => setRevokeCertTarget(null)}
              className="px-4 py-2 rounded-lg bg-slate-800 text-slate-300 font-semibold"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isRevoking}
              className="px-4 py-2 rounded-lg bg-rose-600 hover:bg-rose-500 text-white font-semibold disabled:opacity-50"
            >
              {isRevoking ? 'Revoking in CRL...' : 'Add to CRL & Revoke'}
            </button>
          </div>
        </form>
      </Modal>

      {/* Certificate Viewer Modal */}
      <Modal
        isOpen={Boolean(selectedCert)}
        onClose={() => setSelectedCert(null)}
        title="X.509 Certificate Inspector"
        subtitle={selectedCert?.subjectCommonName}
        maxWidth="lg"
      >
        {selectedCert && (
          <div className="space-y-3 font-mono text-xs">
            <div className="p-3 rounded-lg bg-[#0c101a] border border-slate-800">
              <span className="text-slate-400">Fingerprint: </span>
              <span className="text-cyan-400">{selectedCert.fingerprintSha256}</span>
            </div>
            <pre className="p-3 rounded-lg bg-[#070a10] border border-slate-800 text-[10px] text-slate-300 overflow-x-auto max-h-60">
              {selectedCert.pem}
            </pre>
          </div>
        )}
      </Modal>
    </div>
  );
};
