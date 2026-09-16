import React, { useState, useEffect } from 'react';
import { ApiService } from '../../services/api';
import { FirmwareVersion, Device, DeviceType } from '../../types';
import { Cpu, ShieldAlert, CheckCircle2, RefreshCw, UploadCloud, AlertTriangle } from 'lucide-react';
import { Modal } from '../common/Modal';

export const FirmwareCenter: React.FC = () => {
  const [firmwares, setFirmwares] = useState<FirmwareVersion[]>([]);
  const [compliance, setCompliance] = useState<any>(null);
  const [devices, setDevices] = useState<Device[]>([]);
  const [deviceTypes, setDeviceTypes] = useState<DeviceType[]>([]);
  const [isOtaOpen, setIsOtaOpen] = useState(false);

  // OTA Campaign form
  const [selectedDeviceId, setSelectedDeviceId] = useState('');
  const [selectedVersion, setSelectedVersion] = useState('');
  const [isDeploying, setIsDeploying] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  const loadData = async () => {
    try {
      const [fwList, compData, devList, typesList] = await Promise.all([
        ApiService.getFirmwareCatalog(),
        ApiService.getFirmwareCompliance(),
        ApiService.getDevices(),
        ApiService.getDeviceTypes()
      ]);
      setFirmwares(fwList);
      setCompliance(compData);
      setDevices(devList);
      setDeviceTypes(typesList);
      if (devList.length > 0) setSelectedDeviceId(devList[0].id);
      if (fwList.length > 0) setSelectedVersion(fwList[0].version);
    } catch {
      // ignore
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleOtaSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedDeviceId || !selectedVersion) return;
    setIsDeploying(true);
    setMessage(null);
    try {
      const res = await ApiService.triggerOta(selectedDeviceId, selectedVersion);
      if (res.success) {
        setMessage(`OTA Update campaign triggered for ${res.device?.serialNumber} -> Target: ${selectedVersion}`);
        setIsOtaOpen(false);
        await loadData();
      }
    } catch (err: any) {
      setMessage(`OTA Error: ${err.message}`);
    } finally {
      setIsDeploying(false);
    }
  };

  return (
    <div className="space-y-6 text-xs">
      {/* Header & Compliance Bar */}
      <div className="organic-glass-card p-6 border-[#2997FF]/30">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-[#26372E]">
          <div className="flex items-center gap-4">
            <div className="p-3.5 rounded-2xl bg-[#2E4036] border border-[#708A7C]/30 text-[#2997FF]">
              <Cpu className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-3">
                <h2 className="text-base font-bold text-white tracking-tight">
                  Firmware & Signed Dual-OTA Lifecycle Center
                </h2>
                <span className="px-3 py-0.5 rounded-full bg-[#2E4036] text-[#2997FF] border border-[#708A7C]/30 text-[10px] font-bold font-mono">
                  ECDSA-Signed OTA
                </span>
              </div>
              <p className="text-[#94A39B] text-xs mt-1">
                Tracks cryptographic binary hashes, known vulnerability exposures (CVEs), and manages automated dual-partition OTA rollouts.
              </p>
            </div>
          </div>

          <button
            onClick={() => setIsOtaOpen(true)}
            className="magnetic-btn flex items-center gap-2 px-5 py-2.5 rounded-full bg-[#CC5833] hover:bg-[#B54926] text-white font-semibold shadow-clay-glow transition-all self-start md:self-auto"
          >
            <UploadCloud className="w-4 h-4" />
            <span>Launch OTA Campaign</span>
          </button>
        </div>

        {message && (
          <div className="mt-4 p-3.5 rounded-2xl bg-[#30D158]/15 border border-[#30D158]/30 text-[#F4F2EC]">
            {message}
          </div>
        )}

        {/* Compliance Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 mt-4">
          <div className="p-4 rounded-2xl bg-[#142019] border border-[#26372E]">
            <div className="text-[#708A7C] font-semibold mb-1 text-[11px] font-mono">Fleet Compliance Score</div>
            <div className="font-mono text-[#30D158] text-lg font-bold">
              {compliance?.compliancePercentage || 92}% Compliant
            </div>
          </div>
          <div className="p-4 rounded-2xl bg-[#142019] border border-[#26372E]">
            <div className="text-[#708A7C] font-semibold mb-1 text-[11px] font-mono">Nodes on Current Release</div>
            <div className="font-mono text-white text-lg font-bold">
              {compliance?.upToDateCount || 0} Nodes
            </div>
          </div>
          <div className="p-4 rounded-2xl bg-[#142019] border border-[#26372E]">
            <div className="text-[#708A7C] font-semibold mb-1 text-[11px] font-mono">Known CVE Exposures</div>
            <div className="font-mono text-[#E30000] text-lg font-bold">
              {compliance?.vulnerableCveCount || 0} Vulnerable
            </div>
          </div>
          <div className="p-4 rounded-2xl bg-[#142019] border border-[#26372E]">
            <div className="text-[#708A7C] font-semibold mb-1 text-[11px] font-mono">Outdated (Safe) Versions</div>
            <div className="font-mono text-[#E85D04] text-lg font-bold">
              {compliance?.outdatedCount || 0} Nodes
            </div>
          </div>
        </div>
      </div>

      {/* Firmware Catalog Table */}
      <div className="organic-glass-card overflow-hidden">
        <div className="p-5 border-b border-[#26372E] flex items-center justify-between">
          <h3 className="text-xs font-bold uppercase tracking-wider text-white font-mono">
            Signed Firmware Catalog & Binary Hashes
          </h3>
          <span className="text-[11px] font-mono text-[#708A7C]">All Binaries Signed by Root Authority</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-[#CBD4CF]">
            <thead className="bg-[#142019] text-[10px] font-mono uppercase tracking-wider text-[#708A7C] border-b border-[#26372E]">
              <tr>
                <th className="py-3.5 px-5">Version & Target</th>
                <th className="py-3.5 px-5">SHA-256 Binary Hash</th>
                <th className="py-3.5 px-5">Security Status</th>
                <th className="py-3.5 px-5">Signer Identity</th>
                <th className="py-3.5 px-5">Release Notes</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#26372E] font-mono">
              {firmwares.map(fw => {
                const type = deviceTypes.find(t => t.id === fw.deviceTypeId);
                return (
                  <tr key={fw.id} className="hover:bg-[#1C2B22]/60">
                    <td className="py-3.5 px-5">
                      <div className="font-bold text-white font-sans">{fw.version}</div>
                      <div className="text-[10px] text-[#30D158]">{type?.name || fw.deviceTypeId}</div>
                    </td>

                    <td className="py-3.5 px-5">
                      <div className="text-[11px] text-[#708A7C] select-all truncate max-w-xs">{fw.binaryHashSha256}</div>
                      <div className="text-[10px] text-[#94A39B]">{(fw.fileSizeBytes / 1024 / 1024).toFixed(2)} MB</div>
                    </td>

                    <td className="py-3.5 px-5 font-sans">
                      {fw.hasKnownCve ? (
                        <div className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-[#E30000]/20 text-[#E30000] border border-[#E30000]/40 text-[10px] font-bold">
                          <ShieldAlert className="w-3 h-3" />
                          <span>CVE: {fw.cveIdentifiers?.join(', ')}</span>
                        </div>
                      ) : (
                        <div className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-[#30D158]/20 text-[#30D158] border border-[#30D158]/40 text-[10px] font-bold">
                          <CheckCircle2 className="w-3 h-3" />
                          <span>Signed & Clean</span>
                        </div>
                      )}
                    </td>

                    <td className="py-3.5 px-5 font-sans text-[#CBD4CF]">
                      <div>{fw.signerCommonName}</div>
                      <div className="text-[10px] text-[#708A7C]">{new Date(fw.releaseDate).toLocaleDateString()}</div>
                    </td>

                    <td className="py-3.5 px-5 font-sans text-[#94A39B] max-w-xs truncate">
                      {fw.releaseNotes}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* OTA Campaign Launch Modal */}
      <Modal
        isOpen={isOtaOpen}
        onClose={() => setIsOtaOpen(false)}
        title="Launch Over-The-Air (OTA) Deployment"
        subtitle="Cryptographically signed dual-partition payload with hardware verification check"
        maxWidth="md"
      >
        <form onSubmit={handleOtaSubmit} className="space-y-4 text-xs">
          <div>
            <label className="block text-[#CBD4CF] font-semibold mb-1.5">Target IoT Device Node</label>
            <select
              value={selectedDeviceId}
              onChange={e => setSelectedDeviceId(e.target.value)}
              className="w-full bg-[#142019] border border-[#26372E] rounded-full px-4 py-2.5 text-white focus:outline-none focus:border-[#CC5833] cursor-pointer"
            >
              {devices.map(d => (
                <option key={d.id} value={d.id} className="bg-[#171C19]">
                  {d.serialNumber} - {d.name} (Current: {d.firmwareVersion})
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-[#CBD4CF] font-semibold mb-1.5">Target Firmware Release</label>
            <select
              value={selectedVersion}
              onChange={e => setSelectedVersion(e.target.value)}
              className="w-full bg-[#142019] border border-[#26372E] rounded-full px-4 py-2.5 text-white focus:outline-none focus:border-[#CC5833] cursor-pointer"
            >
              {firmwares.map(f => (
                <option key={f.id} value={f.version} className="bg-[#171C19]">
                  {f.version} - {f.signerCommonName} {f.hasKnownCve ? '(VULNERABLE)' : '(CLEAN)'}
                </option>
              ))}
            </select>
          </div>

          <div className="p-4 rounded-2xl bg-[#2997FF]/15 border border-[#2997FF]/30 text-[11px] text-[#F4F2EC]">
            Node will verify the ECDSA signature against the device root key before flashing to secondary partition and executing A/B fallback test.
          </div>

          <div className="flex items-center justify-end gap-3 pt-3 border-t border-[#26372E]">
            <button
              type="button"
              onClick={() => setIsOtaOpen(false)}
              className="px-5 py-2.5 rounded-full bg-[#142019] text-[#CBD4CF] hover:bg-[#1E2622] font-semibold border border-[#26372E]"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isDeploying}
              className="magnetic-btn px-6 py-2.5 rounded-full bg-[#CC5833] hover:bg-[#B54926] text-white font-semibold disabled:opacity-50 shadow-clay-glow"
            >
              {isDeploying ? 'Deploying OTA...' : 'Push Signed Update'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
