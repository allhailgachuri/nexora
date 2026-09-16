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
      <div className="organic-glass-card p-6 border-[#30D158]/30">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-[#26372E]">
          <div className="flex items-center gap-4">
            <div className="p-3.5 rounded-2xl bg-[#2E4036] border border-[#708A7C]/30 text-[#30D158]">
              <KeyRound className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-3">
                <h2 className="text-base font-bold text-white tracking-tight">
                  Nexora Root Certificate Authority (PKI G1)
                </h2>
                <span className="px-3 py-0.5 rounded-full bg-[#2E4036] text-[#30D158] border border-[#708A7C]/30 text-[10px] font-bold font-mono">
                  RSA-2048 / SHA-256
                </span>
              </div>
              <p className="text-[#94A39B] text-xs mt-1">
                Issues unique, short-lived X.509 client credentials to all field sensor nodes (mTLS zero-trust enforcement).
              </p>
            </div>
          </div>

          <button
            onClick={handleCopyCa}
            className="magnetic-btn flex items-center gap-2 px-5 py-2.5 rounded-full bg-[#142019] hover:bg-[#1E2622] border border-[#26372E] text-[#9DB3A6] hover:text-white font-semibold transition-all self-start md:self-auto"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-[#30D158]" /> : <Copy className="w-3.5 h-3.5" />}
            <span>{copied ? 'Copied PEM' : 'Copy CA Cert PEM'}</span>
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mt-4">
          <div className="p-4 rounded-2xl bg-[#142019] border border-[#26372E]">
            <div className="text-[#708A7C] font-semibold mb-1 text-[11px] font-mono">Root CA SHA-256 Fingerprint</div>
            <div className="font-mono text-[#F4F2EC] truncate select-all">{rootCA?.fingerprintSha256 || 'Loading...'}</div>
          </div>
          <div className="p-4 rounded-2xl bg-[#142019] border border-[#26372E]">
            <div className="text-[#708A7C] font-semibold mb-1 text-[11px] font-mono">Active Issued Certificates</div>
            <div className="font-mono text-[#30D158] text-base font-bold">{certs.filter(c => c.status === 'ACTIVE').length} Active Nodes</div>
          </div>
          <div className="p-4 rounded-2xl bg-[#142019] border border-[#26372E]">
            <div className="text-[#708A7C] font-semibold mb-1 text-[11px] font-mono">Revocation List (CRL) Entries</div>
            <div className="font-mono text-[#CC5833] text-base font-bold">{crl.length} Revoked</div>
          </div>
        </div>
      </div>

      {/* Grid: Active Certificates & CRL Ledger */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: Issued Certificates Table */}
        <div className="lg:col-span-2 organic-glass-card p-6 space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-[#26372E]">
            <h3 className="text-xs font-bold uppercase tracking-wider text-white font-mono">
              Issued Device Certificates Ledger ({certs.length})
            </h3>
            <span className="text-[11px] font-mono text-[#708A7C]">90-Day Policy</span>
          </div>

          <div className="overflow-x-auto max-h-[500px]">
            <table className="w-full text-left text-xs text-[#CBD4CF]">
              <thead className="bg-[#142019] text-[10px] font-mono uppercase tracking-wider text-[#708A7C] sticky top-0">
                <tr>
                  <th className="py-3 px-4">Serial / CN</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4">Valid Until</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#26372E] font-mono">
                {certs.map(cert => (
                  <tr key={cert.id} className="hover:bg-[#1C2B22]/60">
                    <td className="py-3 px-4">
                      <div className="font-bold text-white select-all">{cert.serialNumber}</div>
                      <div className="text-[10px] text-[#708A7C] font-sans truncate max-w-xs">{cert.subjectCommonName}</div>
                    </td>
                    <td className="py-3 px-4">
                      <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                        cert.status === 'ACTIVE'
                          ? 'bg-[#30D158]/20 text-[#30D158] border border-[#30D158]/40'
                          : 'bg-[#E30000]/20 text-[#E30000] border border-[#E30000]/40'
                      }`}>
                        {cert.status}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-[#708A7C] text-[11px]">
                      {new Date(cert.expiresAt).toLocaleDateString()}
                    </td>
                    <td className="py-3 px-4 text-right font-sans">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => setSelectedCert(cert)}
                          className="p-1.5 rounded-full bg-[#142019] hover:bg-[#1E2622] text-[#CBD4CF]"
                          title="View Certificate Details"
                        >
                          <FileText className="w-3.5 h-3.5" />
                        </button>
                        {cert.status === 'ACTIVE' && (
                          <>
                            <button
                              onClick={() => handleRotate(cert.deviceId)}
                              className="p-1.5 rounded-full bg-[#142019] hover:bg-[#1E2622] text-[#30D158]"
                              title="Rotate Key & Certificate"
                            >
                              <RotateCw className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={() => setRevokeCertTarget(cert)}
                              className="p-1.5 rounded-full bg-[#E30000]/15 hover:bg-[#E30000]/30 text-[#E30000]"
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
        <div className="organic-glass-card p-6 space-y-4">
          <div className="flex items-center gap-2.5 pb-3 border-b border-[#26372E]">
            <AlertOctagon className="w-4 h-4 text-[#CC5833]" />
            <h3 className="text-xs font-bold uppercase tracking-wider text-white font-mono">
              Certificate Revocation List (CRL)
            </h3>
          </div>

          <p className="text-xs text-[#94A39B]">
            Enforced at the mTLS broker layer. Handshakes with revoked serials are terminated in &lt;1ms.
          </p>

          <div className="space-y-2.5 max-h-[420px] overflow-y-auto pr-1">
            {crl.length === 0 ? (
              <div className="text-center py-8 text-[#708A7C]">CRL ledger is currently empty.</div>
            ) : (
              crl.map(item => (
                <div key={item.serialNumber} className="p-3.5 rounded-2xl bg-[#142019] border border-[#26372E] text-xs space-y-1 font-mono">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-[#CC5833] select-all">{item.serialNumber}</span>
                    <span className="text-[10px] text-[#708A7C]">{new Date(item.revokedAt).toLocaleDateString()}</span>
                  </div>
                  <div className="text-[10px] text-[#E85D04] font-sans">Reason: {item.reason}</div>
                  <div className="text-[10px] text-[#708A7C] truncate">Fingerprint: {item.fingerprintSha256}</div>
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
          <div className="p-4 rounded-2xl bg-[#142019] border border-[#26372E]">
            <div className="text-[#708A7C] font-semibold mb-1 font-mono">Target Certificate Serial</div>
            <div className="font-mono text-[#CC5833] font-bold">{revokeCertTarget?.serialNumber}</div>
          </div>

          <div>
            <label className="block text-[#CBD4CF] font-semibold mb-1.5">Revocation Reason Code</label>
            <select
              value={revokeReason}
              onChange={e => setRevokeReason(e.target.value)}
              className="w-full bg-[#142019] border border-[#26372E] rounded-full px-4 py-2.5 text-white focus:outline-none focus:border-[#CC5833] cursor-pointer"
            >
              <option value="KEY_COMPROMISE" className="bg-[#171C19]">Key Compromise (Device private key extracted)</option>
              <option value="SUSPECTED_CLONING" className="bg-[#171C19]">Suspected Cloning (Concurrent IP usage detected)</option>
              <option value="ANOMALY_QUARANTINE" className="bg-[#171C19]">Anomaly Quarantine (Automated policy containment)</option>
              <option value="DECOMMISSIONED" className="bg-[#171C19]">Decommissioned (Device hardware retired)</option>
            </select>
          </div>

          <div className="flex items-center justify-end gap-3 pt-3 border-t border-[#26372E]">
            <button
              type="button"
              onClick={() => setRevokeCertTarget(null)}
              className="px-5 py-2.5 rounded-full bg-[#142019] text-[#CBD4CF] hover:bg-[#1E2622] font-semibold border border-[#26372E]"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isRevoking}
              className="magnetic-btn px-6 py-2.5 rounded-full bg-[#CC5833] hover:bg-[#B54926] text-white font-semibold disabled:opacity-50 shadow-clay-glow"
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
            <div className="p-3 rounded-2xl bg-[#142019] border border-[#26372E]">
              <span className="text-[#708A7C]">Fingerprint: </span>
              <span className="text-[#30D158]">{selectedCert.fingerprintSha256}</span>
            </div>
            <pre className="p-3 rounded-2xl bg-[#111614] border border-[#26372E] text-[10px] text-[#94A39B] overflow-x-auto max-h-60">
              {selectedCert.pem}
            </pre>
          </div>
        )}
      </Modal>
    </div>
  );
};
