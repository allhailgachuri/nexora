import React, { useState } from 'react';
import { Device, Site, DeviceType } from '../../types';
import { StateBadge } from '../common/Badge';
import { Modal } from '../common/Modal';
import {
  Server,
  Plus,
  Search,
  KeyRound,
  Flame,
  ShieldCheck,
  ChevronRight,
  Filter
} from 'lucide-react';

interface DeviceListProps {
  devices: Device[];
  sites: Site[];
  deviceTypes: DeviceType[];
  onSelectDevice: (deviceId: string) => void;
  onStateChange: (deviceId: string, state: string, reason?: string) => Promise<void>;
  onProvisionDevice: (payload: any) => Promise<void>;
}

export const DeviceList: React.FC<DeviceListProps> = ({
  devices,
  sites,
  deviceTypes,
  onSelectDevice,
  onStateChange,
  onProvisionDevice
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedSite, setSelectedSite] = useState('');
  const [selectedState, setSelectedState] = useState('');
  const [selectedType, setSelectedType] = useState('');
  const [isProvisionOpen, setIsProvisionOpen] = useState(false);

  // Provision Form State
  const [newDeviceName, setNewDeviceName] = useState('');
  const [newDeviceSerial, setNewDeviceSerial] = useState('');
  const [newDeviceSiteId, setNewDeviceSiteId] = useState(sites[0]?.id || '');
  const [newDeviceTypeId, setNewDeviceTypeId] = useState(deviceTypes[0]?.id || '');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Filtered devices
  const filtered = devices.filter(d => {
    if (selectedSite && d.siteId !== selectedSite) return false;
    if (selectedState && d.lifecycleState !== selectedState) return false;
    if (selectedType && d.deviceTypeId !== selectedType) return false;
    if (searchTerm) {
      const q = searchTerm.toLowerCase();
      return (
        d.name.toLowerCase().includes(q) ||
        d.serialNumber.toLowerCase().includes(q) ||
        d.ipAddress?.toLowerCase().includes(q)
      );
    }
    return true;
  });

  const handleProvisionSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newDeviceName || !newDeviceSerial) return;
    setIsSubmitting(true);
    try {
      await onProvisionDevice({
        name: newDeviceName,
        serialNumber: newDeviceSerial,
        siteId: newDeviceSiteId || sites[0]?.id,
        deviceTypeId: newDeviceTypeId || deviceTypes[0]?.id
      });
      setIsProvisionOpen(false);
      setNewDeviceName('');
      setNewDeviceSerial('');
    } catch {
      // error handled in parent
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-4">
      {/* Header & Controls Bar */}
      <div className="glass-panel rounded-2xl p-4 border border-slate-800 flex flex-col md:flex-row md:items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <Server className="w-5 h-5 text-cyan-400" />
          <h2 className="text-base font-bold text-white uppercase tracking-wider">
            IoT Device Master Registry
          </h2>
          <span className="text-xs font-mono px-2 py-0.5 rounded bg-slate-800 text-slate-300">
            {filtered.length} of {devices.length} Nodes
          </span>
        </div>

        <button
          onClick={() => setIsProvisionOpen(true)}
          className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white text-xs font-semibold shadow-cyber-glow transition-all"
        >
          <Plus className="w-4 h-4" />
          <span>Provision New Device (PKI mTLS)</span>
        </button>
      </div>

      {/* Filter Row */}
      <div className="glass-panel rounded-xl p-3 border border-slate-800 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3 text-xs">
        {/* Search */}
        <div className="relative">
          <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search serial, name, or IP..."
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            className="w-full bg-[#0c101a] border border-slate-800 rounded-lg pl-8 pr-3 py-1.5 text-slate-200 focus:outline-none focus:border-cyan-500"
          />
        </div>

        {/* Site Filter */}
        <div className="relative">
          <select
            value={selectedSite}
            onChange={e => setSelectedSite(e.target.value)}
            className="w-full bg-[#0c101a] text-slate-300 border border-slate-800 rounded-lg px-3 py-1.5 focus:outline-none focus:border-cyan-500"
          >
            <option value="">All Deployment Sites</option>
            {sites.map(s => (
              <option key={s.id} value={s.id}>{s.name}</option>
            ))}
          </select>
        </div>

        {/* State Filter */}
        <div className="relative">
          <select
            value={selectedState}
            onChange={e => setSelectedState(e.target.value)}
            className="w-full bg-[#0c101a] text-slate-300 border border-slate-800 rounded-lg px-3 py-1.5 focus:outline-none focus:border-cyan-500"
          >
            <option value="">All Lifecycle States</option>
            <option value="ACTIVE">ACTIVE</option>
            <option value="SUSPECTED">SUSPECTED</option>
            <option value="QUARANTINED">QUARANTINED</option>
            <option value="REVOKED">REVOKED</option>
            <option value="PROVISIONED">PROVISIONED</option>
          </select>
        </div>

        {/* Device Type Filter */}
        <div className="relative">
          <select
            value={selectedType}
            onChange={e => setSelectedType(e.target.value)}
            className="w-full bg-[#0c101a] text-slate-300 border border-slate-800 rounded-lg px-3 py-1.5 focus:outline-none focus:border-cyan-500"
          >
            <option value="">All Device Schemas</option>
            {deviceTypes.map(t => (
              <option key={t.id} value={t.id}>{t.name}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Device Table */}
      <div className="glass-panel rounded-2xl border border-slate-800 overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-300">
            <thead className="bg-[#0c101a] text-[11px] uppercase tracking-wider text-slate-400 border-b border-slate-800">
              <tr>
                <th className="py-3 px-4">Device Name / Serial</th>
                <th className="py-3 px-4">State</th>
                <th className="py-3 px-4">Device Type & Site</th>
                <th className="py-3 px-4">PKI Identity</th>
                <th className="py-3 px-4">Firmware</th>
                <th className="py-3 px-4">IP / Transport</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 font-mono">
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={7} className="text-center py-10 text-slate-400 font-sans">
                    No devices match the active search filters.
                  </td>
                </tr>
              ) : (
                filtered.map(device => {
                  const type = deviceTypes.find(t => t.id === device.deviceTypeId);
                  const site = sites.find(s => s.id === device.siteId);
                  const isOutdatedFw = type && device.firmwareVersion !== type.currentFirmwareVersion;

                  return (
                    <tr
                      key={device.id}
                      className="hover:bg-slate-800/30 transition-colors group cursor-pointer"
                      onClick={() => onSelectDevice(device.id)}
                    >
                      <td className="py-3 px-4">
                        <div className="font-sans font-bold text-white group-hover:text-cyan-400 transition-colors">
                          {device.name}
                        </div>
                        <div className="text-[11px] text-cyan-400">{device.serialNumber}</div>
                      </td>

                      <td className="py-3 px-4">
                        <StateBadge state={device.lifecycleState} />
                      </td>

                      <td className="py-3 px-4 font-sans">
                        <div className="text-slate-200">{type?.name || 'Custom'}</div>
                        <div className="text-[11px] text-slate-400">{site?.name || 'Site'}</div>
                      </td>

                      <td className="py-3 px-4">
                        <div className="flex items-center gap-1.5 text-[11px] text-emerald-400">
                          <KeyRound className="w-3.5 h-3.5" />
                          <span>mTLS Valid</span>
                        </div>
                      </td>

                      <td className="py-3 px-4">
                        <span className={`px-2 py-0.5 rounded text-[11px] ${
                          isOutdatedFw
                            ? 'bg-amber-950/60 text-amber-300 border border-amber-600/50'
                            : 'bg-slate-800 text-slate-300'
                        }`}>
                          {device.firmwareVersion}
                        </span>
                      </td>

                      <td className="py-3 px-4 text-[11px]">
                        <div>{device.ipAddress || '10.0.0.x'}</div>
                        <div className="text-slate-400">{device.connectivityType}</div>
                      </td>

                      <td className="py-3 px-4 text-right" onClick={e => e.stopPropagation()}>
                        <div className="flex items-center justify-end gap-2">
                          {device.lifecycleState !== 'QUARANTINED' ? (
                            <button
                              onClick={() => onStateChange(device.id, 'QUARANTINED', 'Quarantine from Registry Table')}
                              className="p-1.5 rounded-lg bg-rose-950/40 hover:bg-rose-900 border border-rose-500/30 text-rose-300 transition-colors"
                              title="Quarantine Device"
                            >
                              <Flame className="w-3.5 h-3.5" />
                            </button>
                          ) : (
                            <button
                              onClick={() => onStateChange(device.id, 'ACTIVE')}
                              className="p-1.5 rounded-lg bg-emerald-950/40 hover:bg-emerald-900 border border-emerald-500/30 text-emerald-300 transition-colors"
                              title="Reinstate Device"
                            >
                              <ShieldCheck className="w-3.5 h-3.5" />
                            </button>
                          )}
                          <button
                            onClick={() => onSelectDevice(device.id)}
                            className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors"
                            title="Inspect Details"
                          >
                            <ChevronRight className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Provision Modal */}
      <Modal
        isOpen={isProvisionOpen}
        onClose={() => setIsProvisionOpen(false)}
        title="Provision New IoT Fleet Node"
        subtitle="Generates cryptographic 2048-bit X.509 client certificate and configures mTLS topic ACLs"
        maxWidth="md"
      >
        <form onSubmit={handleProvisionSubmit} className="space-y-4 text-xs">
          <div>
            <label className="block text-slate-300 font-semibold mb-1">Device Friendly Name</label>
            <input
              type="text"
              required
              placeholder="e.g. South Orchard Soil Probe #71"
              value={newDeviceName}
              onChange={e => setNewDeviceName(e.target.value)}
              className="w-full bg-[#0c101a] border border-slate-700 rounded-lg p-2.5 text-white focus:outline-none focus:border-cyan-500"
            />
          </div>

          <div>
            <label className="block text-slate-300 font-semibold mb-1">Hardware Serial Number</label>
            <input
              type="text"
              required
              placeholder="e.g. SOIL-N-071 or WATR-V-041"
              value={newDeviceSerial}
              onChange={e => setNewDeviceSerial(e.target.value)}
              className="w-full bg-[#0c101a] border border-slate-700 rounded-lg p-2.5 text-white font-mono focus:outline-none focus:border-cyan-500"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-slate-300 font-semibold mb-1">Deployment Site</label>
              <select
                value={newDeviceSiteId}
                onChange={e => setNewDeviceSiteId(e.target.value)}
                className="w-full bg-[#0c101a] border border-slate-700 rounded-lg p-2.5 text-white focus:outline-none focus:border-cyan-500"
              >
                {sites.map(s => (
                  <option key={s.id} value={s.id}>{s.name}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-slate-300 font-semibold mb-1">Device Schema / Type</label>
              <select
                value={newDeviceTypeId}
                onChange={e => setNewDeviceTypeId(e.target.value)}
                className="w-full bg-[#0c101a] border border-slate-700 rounded-lg p-2.5 text-white focus:outline-none focus:border-cyan-500"
              >
                {deviceTypes.map(t => (
                  <option key={t.id} value={t.id}>{t.name}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="p-3 rounded-lg bg-cyan-950/40 border border-cyan-500/30 text-[11px] text-cyan-300">
            Upon creation, the Nexora PKI Authority will immediately issue an X.509 certificate with short-lived 90-day validity and configure broker topic permissions.
          </div>

          <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-800">
            <button
              type="button"
              onClick={() => setIsProvisionOpen(false)}
              className="px-4 py-2 rounded-lg bg-slate-800 text-slate-300 hover:bg-slate-700 font-semibold"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-4 py-2 rounded-lg bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 text-white font-semibold disabled:opacity-50"
            >
              {isSubmitting ? 'Issuing PKI Certificate...' : 'Issue Certificate & Provision'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
