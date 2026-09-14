import React, { useState } from 'react';
import { DeviceCertificate } from '../../types';
import { KeyRound, ShieldCheck, AlertOctagon, Copy, Check } from 'lucide-react';

interface CertViewerProps {
  certificate?: DeviceCertificate;
  onRotate?: () => void;
  onRevoke?: () => void;
}

export const CertViewer: React.FC<CertViewerProps> = ({ certificate, onRotate, onRevoke }) => {
  const [copied, setCopied] = useState(false);

  if (!certificate) {
    return (
      <div className="p-8 text-center glass-panel rounded-xl text-slate-400 text-xs">
        <KeyRound className="w-8 h-8 text-slate-500 mx-auto mb-2" />
        No X.509 certificate bound to this device record.
      </div>
    );
  }

  const isExpired = new Date() > new Date(certificate.expiresAt);
  const isRevoked = certificate.status === 'REVOKED';

  const copyPem = () => {
    navigator.clipboard.writeText(certificate.pem);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="space-y-4 text-xs">
      {/* Cert Status Banner */}
      <div className={`p-4 rounded-xl border flex items-center justify-between ${
        isRevoked
          ? 'bg-rose-950/30 border-rose-600/40 text-rose-300'
          : (isExpired ? 'bg-amber-950/30 border-amber-600/40 text-amber-300' : 'bg-emerald-950/30 border-emerald-600/40 text-emerald-300')
      }`}>
        <div className="flex items-center gap-3">
          {isRevoked ? <AlertOctagon className="w-5 h-5" /> : <ShieldCheck className="w-5 h-5" />}
          <div>
            <div className="font-bold text-sm">
              X.509 Device Certificate: {certificate.status}
            </div>
            <div className="text-[11px] opacity-80 mt-0.5">
              Subject CN: {certificate.subjectCommonName}
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {onRotate && (
            <button
              onClick={onRotate}
              className="px-3 py-1.5 rounded-lg bg-cyan-950 hover:bg-cyan-900 border border-cyan-500/50 text-cyan-300 font-semibold transition-all"
            >
              Rotate Key & Cert
            </button>
          )}
          {onRevoke && !isRevoked && (
            <button
              onClick={onRevoke}
              className="px-3 py-1.5 rounded-lg bg-rose-950 hover:bg-rose-900 border border-rose-500/50 text-rose-300 font-semibold transition-all"
            >
              Revoke (CRL)
            </button>
          )}
        </div>
      </div>

      {/* Metadata Table */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        <div className="p-3 rounded-xl bg-[#0c101a] border border-slate-800">
          <div className="text-slate-400 font-semibold mb-1 text-[11px]">Serial Number</div>
          <div className="font-mono text-white select-all">{certificate.serialNumber}</div>
        </div>

        <div className="p-3 rounded-xl bg-[#0c101a] border border-slate-800">
          <div className="text-slate-400 font-semibold mb-1 text-[11px]">SHA-256 Fingerprint</div>
          <div className="font-mono text-cyan-400 select-all truncate">{certificate.fingerprintSha256}</div>
        </div>

        <div className="p-3 rounded-xl bg-[#0c101a] border border-slate-800">
          <div className="text-slate-400 font-semibold mb-1 text-[11px]">Issued Valid From</div>
          <div className="font-mono text-slate-200">{new Date(certificate.issuedAt).toLocaleString()}</div>
        </div>

        <div className="p-3 rounded-xl bg-[#0c101a] border border-slate-800">
          <div className="text-slate-400 font-semibold mb-1 text-[11px]">Valid Until (90-Day Policy)</div>
          <div className="font-mono text-amber-300">{new Date(certificate.expiresAt).toLocaleString()}</div>
        </div>
      </div>

      {/* SAN Entries */}
      <div className="p-3 rounded-xl bg-[#0c101a] border border-slate-800">
        <div className="text-slate-400 font-semibold mb-1.5 text-[11px]">Subject Alternative Names (SANs)</div>
        <div className="flex flex-wrap gap-2">
          {certificate.subjectAltNames?.map((san, idx) => (
            <span key={idx} className="px-2 py-0.5 rounded bg-slate-800 border border-slate-700 font-mono text-[11px] text-cyan-300">
              {san}
            </span>
          ))}
        </div>
      </div>

      {/* Raw PEM Viewer */}
      <div className="relative p-3 rounded-xl bg-[#070a10] border border-slate-800">
        <div className="flex items-center justify-between pb-2 border-b border-slate-800/80 mb-2">
          <span className="text-[11px] font-bold text-slate-400 font-mono">X.509 PEM Certificate Payload</span>
          <button
            onClick={copyPem}
            className="flex items-center gap-1 text-[11px] text-cyan-400 hover:text-cyan-300 transition-colors"
          >
            {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
            <span>{copied ? 'Copied' : 'Copy PEM'}</span>
          </button>
        </div>
        <pre className="font-mono text-[10px] text-slate-400 overflow-x-auto max-h-36 p-1">
          {certificate.pem}
        </pre>
      </div>
    </div>
  );
};
