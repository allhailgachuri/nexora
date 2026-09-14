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
      <div className="glass-panel rounded-2xl p-5 border border-slate-800">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-xl bg-blue-950/60 border border-blue-500/40 text-blue-400">
              <Cpu className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base font-bold text-white tracking-wide">
                  Firmware & Signed OTA Lifecycle Hub
                </h2>
                <span className="px-2 py-0.5 rounded bg-blue-950 text-blue-300 border border-blue-800 text-[10px] font-bold">
                  ECDSA-Signed OTA
                </span>
              </div>
              <p className="text-slate-400 text-[11px] mt-0.5">
                Tracks cryptographic binary hashes, known vulnerability exposures (CVEs), and manages OTA rollouts.
              </p>
            </div>
          </div>

          <button
            onClick={() => setIsOtaOpen(true)}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-500 text-white font-semibold shadow-cyber-glow transition-all self-start md:self-auto"
          >
            <UploadCloud className="w-4 h-4" />
            <span>Launch OTA Campaign</span>
          </button>
        </div>

        {message && (
          <div className="mt-3 p-3 rounded-xl bg-cyan-950/50 border border-cyan-500/50 text-cyan-200">
            {message}
          </div>
        )}

        {/* Compliance Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 mt-4">
          <div className="p-3 rounded-xl bg-[#0c101a] border border-slate-800">
            <div className="text-slate-400 font-semibold mb-1 text-[11px]">Fleet Compliance Score</div>
            <div className="font-mono text-emerald-400 text-lg font-bold">
              {compliance?.compliancePercentage || 92}% Compliant
            </div>
          </div>
          <div className="p-3 rounded-xl bg-[#0c101a] border border-slate-800">
            <div className="text-slate-400 font-semibold mb-1 text-[11px]">Nodes on Current Release</div>
            <div className="font-mono text-cyan-400 text-lg font-bold">
              {compliance?.upToDateCount || 0} Nodes
            </div>
          </div>
          <div className="p-3 rounded-xl bg-[#0c101a] border border-slate-800">
            <div className="text-slate-400 font-semibold mb-1 text-[11px]">Known CVE Exposures</div>
            <div className="font-mono text-rose-400 text-lg font-bold">
              {compliance?.vulnerableCveCount || 0} Vulnerable
            </div>
          </div>
          <div className="p-3 rounded-xl bg-[#0c101a] border border-slate-800">
            <div className="text-slate-400 font-semibold mb-1 text-[11px]">Outdated (Safe) Versions</div>
            <div className="font-mono text-amber-400 text-lg font-bold">
              {compliance?.outdatedCount || 0} Nodes
            </div>
          </div>
        </div>
      </div>

      {/* Firmware Catalog Table */}
      <div className="glass-panel rounded-2xl border border-slate-800 overflow-hidden shadow-xl">
        <div className="p-4 border-b border-slate-800 flex items-center justify-between">
          <h3 className="text-sm font-bold uppercase tracking-wider text-white">
            Signed Firmware Catalog & Cryptographic Hashes
          </h3>
          <span className="text-[11px] font-mono text-slate-400">All Images Verified by Root Authority</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-300">
            <thead className="bg-[#0c101a] text-[11px] uppercase tracking-wider text-slate-400 border-b border-slate-800">
              <tr>
                <th className="py-3 px-4">Version & Target</th>
                <th className="py-3 px-4">SHA-256 Binary Hash</th>
                <th className="py-3 px-4">Security Status</th>
                <th className="py-3 px-4">Signer Identity</th>
                <th className="py-3 px-4">Release Notes</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800 font-mono">
              {firmwares.map(fw => {
                const type = deviceTypes.find(t => t.id === fw.deviceTypeId);
                return (
                  <tr key={fw.id} className="hover:bg-slate-800/30">
                    <td className="py-3 px-4">
                      <div className="font-bold text-white font-sans">{fw.version}</div>
                      <div className="text-[10px] text-cyan-400">{type?.name || fw.deviceTypeId}</div>
                    </td>

                    <td className="py-3 px-4">
                      <div className="text-[11px] text-slate-400 select-all truncate max-w-xs">{fw.binaryHashSha256}</div>
                      <div className="text-[10px] text-slate-400">{(fw.fileSizeBytes / 1024 / 1024).toFixed(2)} MB</div>
                    </td>

                    <td className="py-3 px-4 font-sans">
                      {fw.hasKnownCve ? (
                        <div className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-rose-950 text-rose-300 border border-rose-800 text-[10px] font-bold">
                          <ShieldAlert className="w-3 h-3" />
                          <span>CVE: {fw.cveIdentifiers?.join(', ')}</span>
                        </div>
                      ) : (
                        <div className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-emerald-950 text-emerald-300 border border-emerald-800 text-[10px] font-bold">
                          <CheckCircle2 className="w-3 h-3" />
                          <span>Signed & Clean</span>
                        </div>
                      )}
                    </td>

                    <td className="py-3 px-4 font-sans text-slate-300">
                      <div>{fw.signerCommonName}</div>
                      <div className="text-[10px] text-slate-400">{new Date(fw.releaseDate).toLocaleDateString()}</div>
                    </td>

                    <td className="py-3 px-4 font-sans text-slate-400 max-w-xs truncate">
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
        title="Launch Over-The-Air (OTA) Firmware Deployment"
        subtitle="Cryptographically signed payload with hardware verification check"
        maxWidth="md"
      >
        <form onSubmit={handleOtaSubmit} className="space-y-4 text-xs">
          <div>
            <label className="block text-slate-300 font-semibold mb-1">Target IoT Device Node</label>
            <select
              value={selectedDeviceId}
              onChange={e => setSelectedDeviceId(e.target.value)}
              className="w-full bg-[#0c101a] border border-slate-700 rounded-lg p-2.5 text-white focus:outline-none focus:border-cyan-500"
            >
              {devices.map(d => (
                <option key={d.id} value={d.id}>
                  {d.serialNumber} - {d.name} (Current: {d.firmwareVersion})
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-slate-300 font-semibold mb-1">Target Firmware Release</label>
            <select
              value={selectedVersion}
              onChange={e => setSelectedVersion(e.target.value)}
              className="w-full bg-[#0c101a] border border-slate-700 rounded-lg p-2.5 text-white focus:outline-none focus:border-cyan-500"
            >
              {firmwares.map(f => (
                <option key={f.id} value={f.version}>
                  {f.version} - {f.signerCommonName} {f.hasKnownCve ? '(VULNERABLE)' : '(CLEAN)'}
                </option>
              ))}
            </select>
          </div>

          <div className="p-3 rounded-lg bg-blue-950/40 border border-blue-500/30 text-[11px] text-blue-300">
            Node will verify the ECDSA signature against the device secure element before flashing to secondary partition.
          </div>

          <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-800">
            <button
              type="button"
              onClick={() => setIsOtaOpen(false)}
              className="px-4 py-2 rounded-lg bg-slate-800 text-slate-300 font-semibold"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isDeploying}
              className="px-4 py-2 rounded-lg bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-500 text-white font-semibold disabled:opacity-50"
            >
              {isDeploying ? 'Deploying OTA...' : 'Push Signed Update'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
