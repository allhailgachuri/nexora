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
      <div className="p-10 text-center organic-glass-card text-[#708A7C] text-xs">
        <KeyRound className="w-8 h-8 text-[#2E4036] mx-auto mb-2" />
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
      <div className={`p-5 rounded-[2rem] border flex flex-col sm:flex-row sm:items-center justify-between gap-4 ${
        isRevoked
          ? 'bg-[#E30000]/15 border-[#E30000]/30 text-[#E30000]'
          : (isExpired ? 'bg-[#E85D04]/15 border-[#E85D04]/30 text-[#E85D04]' : 'bg-[#30D158]/15 border-[#30D158]/30 text-[#30D158]')
      }`}>
        <div className="flex items-center gap-3.5">
          <div className="p-2.5 rounded-2xl bg-[#171C19] border border-current">
            {isRevoked ? <AlertOctagon className="w-5 h-5" /> : <ShieldCheck className="w-5 h-5" />}
          </div>
          <div>
            <div className="font-bold text-sm text-white">
              X.509 Device Certificate: {certificate.status}
            </div>
            <div className="text-[11px] opacity-80 mt-0.5 font-mono">
              Subject CN: {certificate.subjectCommonName}
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {onRotate && (
            <button
              onClick={onRotate}
              className="magnetic-btn px-4 py-2 rounded-full bg-[#142019] hover:bg-[#1E2622] border border-[#26372E] text-white font-semibold transition-all shadow-sm"
            >
              Rotate Key & Cert
            </button>
          )}
          {onRevoke && !isRevoked && (
            <button
              onClick={onRevoke}
              className="magnetic-btn px-4 py-2 rounded-full bg-[#E30000]/20 hover:bg-[#E30000]/30 border border-[#E30000]/40 text-[#E30000] font-semibold transition-all"
            >
              Revoke (CRL)
            </button>
          )}
        </div>
      </div>

      {/* Metadata Table */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        <div className="p-4 rounded-2xl bg-[#142019] border border-[#26372E]">
          <div className="text-[#708A7C] font-semibold mb-1 text-[11px] font-mono">Serial Number</div>
          <div className="font-mono text-white select-all">{certificate.serialNumber}</div>
        </div>

        <div className="p-4 rounded-2xl bg-[#142019] border border-[#26372E]">
          <div className="text-[#708A7C] font-semibold mb-1 text-[11px] font-mono">SHA-256 Fingerprint</div>
          <div className="font-mono text-[#30D158] select-all truncate">{certificate.fingerprintSha256}</div>
        </div>

        <div className="p-4 rounded-2xl bg-[#142019] border border-[#26372E]">
          <div className="text-[#708A7C] font-semibold mb-1 text-[11px] font-mono">Issued Valid From</div>
          <div className="font-mono text-[#CBD4CF]">{new Date(certificate.issuedAt).toLocaleString()}</div>
        </div>

        <div className="p-4 rounded-2xl bg-[#142019] border border-[#26372E]">
          <div className="text-[#708A7C] font-semibold mb-1 text-[11px] font-mono">Valid Until (90-Day Policy)</div>
          <div className="font-mono text-[#E85D04]">{new Date(certificate.expiresAt).toLocaleString()}</div>
        </div>
      </div>

      {/* SAN Entries */}
      <div className="p-4 rounded-2xl bg-[#142019] border border-[#26372E]">
        <div className="text-[#708A7C] font-semibold mb-2 text-[11px] font-mono">Subject Alternative Names (SANs / Topic ACL)</div>
        <div className="flex flex-wrap gap-2">
          {certificate.subjectAltNames?.map((san: string, idx: number) => (
            <span key={idx} className="px-3 py-1 rounded-full bg-[#171C19] border border-[#26372E] font-mono text-[11px] text-[#9DB3A6]">
              {san}
            </span>
          ))}
        </div>
      </div>

      {/* Raw PEM Viewer */}
      <div className="relative p-4 rounded-2xl bg-[#111614] border border-[#26372E]">
        <div className="flex items-center justify-between pb-3 border-b border-[#26372E] mb-3">
          <span className="text-[11px] font-bold text-[#708A7C] font-mono">X.509 PEM Certificate Payload</span>
          <button
            onClick={copyPem}
            className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#142019] hover:bg-[#1E2622] text-[11px] text-[#30D158] border border-[#26372E] transition-colors"
          >
            {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
            <span>{copied ? 'Copied' : 'Copy PEM'}</span>
          </button>
        </div>
        <pre className="font-mono text-[10px] text-[#94A39B] overflow-x-auto max-h-36 p-2 bg-[#0E1411] rounded-xl">
          {certificate.pem}
        </pre>
      </div>
    </div>
  );
};
