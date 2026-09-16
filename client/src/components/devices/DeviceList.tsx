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
    <div className="space-y-5">
      {/* Header & Controls Bar */}
      <div className="organic-glass-card p-5 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-2xl bg-[#2E4036] border border-[#708A7C]/30 text-[#30D158]">
            <Server className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-base font-bold text-white tracking-tight">
              IoT Device Master Registry
            </h2>
            <p className="text-xs text-[#94A39B]">
              {filtered.length} of {devices.length} Total Nodes Synchronized
            </p>
          </div>
        </div>

        <button
          onClick={() => setIsProvisionOpen(true)}
          className="magnetic-btn flex items-center gap-2 px-5 py-2.5 rounded-full bg-[#CC5833] hover:bg-[#B54926] text-white text-xs font-semibold shadow-clay-glow transition-all"
        >
          <Plus className="w-4 h-4" />
          <span>Provision Node (PKI mTLS)</span>
        </button>
      </div>

      {/* Filter Row */}
      <div className="organic-glass p-3 rounded-[2rem] grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3 text-xs">
        {/* Search */}
        <div className="relative">
          <Search className="w-3.5 h-3.5 text-[#708A7C] absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search serial, name, or IP..."
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            className="w-full bg-[#142019] border border-[#26372E] rounded-full pl-9 pr-3 py-2 text-[#F4F2EC] placeholder-[#708A7C] focus:outline-none focus:border-[#CC5833]"
          />
        </div>

        {/* Site Filter */}
        <div className="relative">
          <select
            value={selectedSite}
            onChange={e => setSelectedSite(e.target.value)}
            className="w-full bg-[#142019] text-[#CBD4CF] border border-[#26372E] rounded-full px-3.5 py-2 focus:outline-none focus:border-[#CC5833] cursor-pointer"
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
            className="w-full bg-[#142019] text-[#CBD4CF] border border-[#26372E] rounded-full px-3.5 py-2 focus:outline-none focus:border-[#CC5833] cursor-pointer"
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
            className="w-full bg-[#142019] text-[#CBD4CF] border border-[#26372E] rounded-full px-3.5 py-2 focus:outline-none focus:border-[#CC5833] cursor-pointer"
          >
            <option value="">All Device Schemas</option>
            {deviceTypes.map(t => (
              <option key={t.id} value={t.id}>{t.name}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Device Table */}
      <div className="organic-glass-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-[#CBD4CF]">
            <thead className="bg-[#142019] text-[10px] font-mono uppercase tracking-wider text-[#708A7C] border-b border-[#26372E]">
              <tr>
                <th className="py-3.5 px-5">Device Name / Serial</th>
                <th className="py-3.5 px-5">State</th>
                <th className="py-3.5 px-5">Schema & Site</th>
                <th className="py-3.5 px-5">PKI Identity</th>
                <th className="py-3.5 px-5">Firmware</th>
                <th className="py-3.5 px-5">IP / Transport</th>
                <th className="py-3.5 px-5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#26372E] font-mono">
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={7} className="text-center py-12 text-[#708A7C] font-sans">
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
                      className="hover:bg-[#1C2B22]/60 transition-colors group cursor-pointer"
                      onClick={() => onSelectDevice(device.id)}
                    >
                      <td className="py-3.5 px-5">
                        <div className="font-sans font-bold text-white group-hover:text-[#CC5833] transition-colors">
                          {device.name}
                        </div>
                        <div className="text-[11px] text-[#9DB3A6]">{device.serialNumber}</div>
                      </td>

                      <td className="py-3.5 px-5">
                        <StateBadge state={device.lifecycleState} />
                      </td>

                      <td className="py-3.5 px-5 font-sans">
                        <div className="text-white font-medium">{type?.name || 'Custom'}</div>
                        <div className="text-[11px] text-[#708A7C]">{site?.name || 'Site'}</div>
                      </td>

                      <td className="py-3.5 px-5">
                        <div className="flex items-center gap-1.5 text-[11px] text-[#30D158]">
                          <KeyRound className="w-3.5 h-3.5" />
                          <span>mTLS Valid</span>
                        </div>
                      </td>

                      <td className="py-3.5 px-5">
                        <span className={`px-2.5 py-0.5 rounded-full text-[11px] ${
                          isOutdatedFw
                            ? 'bg-[#E85D04]/20 text-[#E85D04] border border-[#E85D04]/40'
                            : 'bg-[#142019] text-[#9DB3A6] border border-[#26372E]'
                        }`}>
                          {device.firmwareVersion}
                        </span>
                      </td>

                      <td className="py-3.5 px-5 text-[11px]">
                        <div>{device.ipAddress || '10.0.0.x'}</div>
                        <div className="text-[#708A7C]">{device.connectivityType}</div>
                      </td>

                      <td className="py-3.5 px-5 text-right" onClick={e => e.stopPropagation()}>
                        <div className="flex items-center justify-end gap-2">
                          {device.lifecycleState !== 'QUARANTINED' ? (
                            <button
                              onClick={() => onStateChange(device.id, 'QUARANTINED', 'Quarantine from Registry Table')}
                              className="p-2 rounded-full bg-[#E30000]/15 hover:bg-[#E30000]/30 border border-[#E30000]/30 text-[#E30000] transition-colors"
                              title="Quarantine Device"
                            >
                              <Flame className="w-3.5 h-3.5" />
                            </button>
                          ) : (
                            <button
                              onClick={() => onStateChange(device.id, 'ACTIVE')}
                              className="p-2 rounded-full bg-[#30D158]/15 hover:bg-[#30D158]/30 border border-[#30D158]/30 text-[#30D158] transition-colors"
                              title="Reinstate Device"
                            >
                              <ShieldCheck className="w-3.5 h-3.5" />
                            </button>
                          )}
                          <button
                            onClick={() => onSelectDevice(device.id)}
                            className="p-2 rounded-full bg-[#142019] hover:bg-[#1E2622] text-[#94A39B] hover:text-white transition-colors"
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
            <label className="block text-[#CBD4CF] font-semibold mb-1.5">Device Friendly Name</label>
            <input
              type="text"
              required
              placeholder="e.g. South Orchard Soil Probe #71"
              value={newDeviceName}
              onChange={e => setNewDeviceName(e.target.value)}
              className="w-full bg-[#142019] border border-[#26372E] rounded-full px-4 py-2.5 text-white focus:outline-none focus:border-[#CC5833]"
            />
          </div>

          <div>
            <label className="block text-[#CBD4CF] font-semibold mb-1.5">Hardware Serial Number</label>
            <input
              type="text"
              required
              placeholder="e.g. SOIL-N-071 or WATR-V-041"
              value={newDeviceSerial}
              onChange={e => setNewDeviceSerial(e.target.value)}
              className="w-full bg-[#142019] border border-[#26372E] rounded-full px-4 py-2.5 text-white font-mono focus:outline-none focus:border-[#CC5833]"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-[#CBD4CF] font-semibold mb-1.5">Deployment Site</label>
              <select
                value={newDeviceSiteId}
                onChange={e => setNewDeviceSiteId(e.target.value)}
                className="w-full bg-[#142019] border border-[#26372E] rounded-full px-4 py-2.5 text-white focus:outline-none focus:border-[#CC5833] cursor-pointer"
              >
                {sites.map(s => (
                  <option key={s.id} value={s.id} className="bg-[#171C19]">{s.name}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-[#CBD4CF] font-semibold mb-1.5">Device Schema / Type</label>
              <select
                value={newDeviceTypeId}
                onChange={e => setNewDeviceTypeId(e.target.value)}
                className="w-full bg-[#142019] border border-[#26372E] rounded-full px-4 py-2.5 text-white focus:outline-none focus:border-[#CC5833] cursor-pointer"
              >
                {deviceTypes.map(t => (
                  <option key={t.id} value={t.id} className="bg-[#171C19]">{t.name}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-[#CC5833]/15 border border-[#CC5833]/30 text-[11px] text-[#F4F2EC]">
            Upon creation, the Nexora PKI Authority will immediately issue an X.509 certificate with short-lived 90-day validity and configure broker topic permissions.
          </div>

          <div className="flex items-center justify-end gap-3 pt-3 border-t border-[#26372E]">
            <button
              type="button"
              onClick={() => setIsProvisionOpen(false)}
              className="px-5 py-2.5 rounded-full bg-[#142019] text-[#CBD4CF] hover:bg-[#1E2622] font-semibold border border-[#26372E]"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="magnetic-btn px-6 py-2.5 rounded-full bg-[#CC5833] hover:bg-[#B54926] text-white font-semibold disabled:opacity-50 shadow-clay-glow"
            >
              {isSubmitting ? 'Issuing PKI Certificate...' : 'Issue Certificate & Provision'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
