import React, { useState, useEffect } from 'react';
import { ApiService } from '../../services/api';
import { DeviceType, TelemetryFieldSchema } from '../../types';
import { FileCode2, Plus, Trash2, CheckCircle2, Sliders, ShieldCheck } from 'lucide-react';
import { Modal } from '../common/Modal';

export const SchemaEditor: React.FC = () => {
  const [deviceTypes, setDeviceTypes] = useState<DeviceType[]>([]);
  const [selectedType, setSelectedType] = useState<DeviceType | null>(null);
  const [isNewOpen, setIsNewOpen] = useState(false);

  // New Schema Form
  const [name, setName] = useState('');
  const [code, setCode] = useState('');
  const [category, setCategory] = useState<'AGRICULTURE' | 'WATER' | 'ENERGY' | 'INDUSTRIAL' | 'GATEWAY' | 'CUSTOM'>('CUSTOM');
  const [description, setDescription] = useState('');
  const [isActuator, setIsActuator] = useState(false);
  const [fields, setFields] = useState<TelemetryFieldSchema[]>([
    { name: 'temperature_c', displayName: 'Internal Temperature', type: 'number', unit: '°C', min: -20, max: 70, maxRateOfChange: 10, required: true }
  ]);
  const [isSaving, setIsSaving] = useState(false);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);

  const loadTypes = async () => {
    try {
      const types = await ApiService.getDeviceTypes();
      setDeviceTypes(types);
      if (types.length > 0 && !selectedType) {
        setSelectedType(types[0]);
      }
    } catch {
      // ignore
    }
  };

  useEffect(() => {
    loadTypes();
  }, []);

  const addFieldRow = () => {
    setFields([
      ...fields,
      { name: `metric_${fields.length + 1}`, displayName: `Sensor Metric ${fields.length + 1}`, type: 'number', min: 0, max: 100, maxRateOfChange: 20, required: true }
    ]);
  };

  const removeFieldRow = (idx: number) => {
    setFields(fields.filter((_, i) => i !== idx));
  };

  const updateField = (idx: number, key: keyof TelemetryFieldSchema, val: any) => {
    const updated = [...fields];
    updated[idx] = { ...updated[idx], [key]: val };
    setFields(updated);
  };

  const handleSaveType = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !code) return;
    setIsSaving(true);
    setStatusMessage(null);
    try {
      const newType = await ApiService.saveDeviceType({
        name,
        code,
        category,
        description,
        isActuatorOrCritical: isActuator,
        currentFirmwareVersion: 'v1.0.0',
        telemetrySchema: {
          version: '1.0.0',
          heartbeatIntervalSec: 60,
          maxHeartbeatToleranceSec: 180,
          fields
        }
      });
      setStatusMessage(`Device Type '${newType.name}' registered successfully!`);
      setIsNewOpen(false);
      setName('');
      setCode('');
      await loadTypes();
      setSelectedType(newType);
    } catch (err: any) {
      setStatusMessage(`Error: ${err.message}`);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="space-y-6 text-xs">
      {/* Header Bar */}
      <div className="organic-glass-card p-6 border-[#708A7C]/30">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-[#26372E]">
          <div className="flex items-center gap-4">
            <div className="p-3.5 rounded-2xl bg-[#2E4036] border border-[#708A7C]/30 text-[#30D158]">
              <FileCode2 className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-3">
                <h2 className="text-base font-bold text-white tracking-tight">
                  Dynamic Telemetry Schemas & Topic ACL Engine
                </h2>
                <span className="px-3 py-0.5 rounded-full bg-[#2E4036] text-[#30D158] border border-[#708A7C]/30 text-[10px] font-bold font-mono">
                  MQTT 5.0 ACL Contract
                </span>
              </div>
              <p className="text-[#94A39B] text-xs mt-1">
                Domain-agnostic validation rules, rate-of-change boundaries, and physical consequence gates enforced at ingestion.
              </p>
            </div>
          </div>

          <button
            onClick={() => setIsNewOpen(true)}
            className="magnetic-btn flex items-center gap-2 px-5 py-2.5 rounded-full bg-[#CC5833] hover:bg-[#B54926] text-white font-semibold shadow-clay-glow transition-all self-start md:self-auto"
          >
            <Plus className="w-4 h-4" />
            <span>New Schema Definition</span>
          </button>
        </div>

        {statusMessage && (
          <div className="mt-4 p-3.5 rounded-2xl bg-[#30D158]/15 border border-[#30D158]/30 text-[#F4F2EC]">
            {statusMessage}
          </div>
        )}
      </div>

      {/* Grid: Type Selector & Schema Details */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Col: Device Types List */}
        <div className="organic-glass-card p-6 space-y-4">
          <h3 className="text-xs font-bold uppercase tracking-wider text-white pb-3 border-b border-[#26372E] font-mono">
            Registered Device Types ({deviceTypes.length})
          </h3>

          <div className="space-y-3 max-h-[500px] overflow-y-auto pr-1">
            {deviceTypes.map(type => {
              const isSelected = selectedType?.id === type.id;
              return (
                <div
                  key={type.id}
                  onClick={() => setSelectedType(type)}
                  className={`p-4 rounded-2xl border cursor-pointer transition-all hover-lift ${
                    isSelected
                      ? 'bg-[#1C2B22] border-[#CC5833]/60 shadow-organic-hover text-white'
                      : 'bg-[#142019] border-[#26372E] text-[#CBD4CF] hover:border-[#708A7C]/50'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-sm">{type.name}</span>
                    <span className="text-[10px] font-mono text-[#30D158]">{type.code}</span>
                  </div>
                  <div className="flex items-center gap-2 text-[10px] text-[#708A7C] mt-2">
                    <span>{type.category}</span>
                    <span>•</span>
                    <span>{type.telemetrySchema?.fields?.length || 0} Telemetry Fields</span>
                    {type.isActuatorOrCritical && (
                      <span className="text-[#E85D04] font-bold">• Actuator (Gated)</span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right 2 Cols: Schema Inspector */}
        <div className="lg:col-span-2 organic-glass-card p-6 space-y-4">
          {selectedType ? (
            <div>
              <div className="flex items-center justify-between pb-3 border-b border-[#26372E]">
                <div>
                  <h3 className="text-xs font-bold text-white uppercase tracking-wider font-mono">
                    {selectedType.name} Schema Contract
                  </h3>
                  <p className="text-xs text-[#94A39B] mt-1">{selectedType.description}</p>
                </div>
                <div className="flex items-center gap-2">
                  <span className="px-3 py-0.5 rounded-full bg-[#142019] text-[#9DB3A6] font-mono text-[10px] border border-[#26372E]">
                    v{selectedType.telemetrySchema.version}
                  </span>
                  {selectedType.isActuatorOrCritical && (
                    <span className="px-3 py-0.5 rounded-full bg-[#E85D04]/20 text-[#E85D04] border border-[#E85D04]/40 text-[10px] font-bold">
                      Critical Actuator Gate
                    </span>
                  )}
                </div>
              </div>

              {/* Fields Table */}
              <div className="mt-4 overflow-x-auto">
                <table className="w-full text-left text-xs text-[#CBD4CF]">
                  <thead className="bg-[#142019] text-[10px] font-mono uppercase tracking-wider text-[#708A7C] border-b border-[#26372E]">
                    <tr>
                      <th className="py-3 px-4">Field Key / Label</th>
                      <th className="py-3 px-4">Type / Unit</th>
                      <th className="py-3 px-4">Min / Max Bounds</th>
                      <th className="py-3 px-4">Rate Limit</th>
                      <th className="py-3 px-4">Policy</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#26372E] font-mono">
                    {selectedType.telemetrySchema.fields.map(field => (
                      <tr key={field.name} className="hover:bg-[#1C2B22]/60">
                        <td className="py-3 px-4">
                          <div className="font-bold text-white font-mono">{field.name}</div>
                          <div className="text-[10px] font-sans text-[#708A7C]">{field.displayName}</div>
                        </td>
                        <td className="py-3 px-4 font-sans">
                          <div>{field.type}</div>
                          <div className="text-[10px] text-[#708A7C] font-mono">{field.unit || 'n/a'}</div>
                        </td>
                        <td className="py-3 px-4">
                          {field.min !== undefined ? `${field.min} to ${field.max}` : 'Unbounded'}
                        </td>
                        <td className="py-3 px-4 text-[#CC5833]">
                          {field.maxRateOfChange ? `±${field.maxRateOfChange} / tick` : 'None'}
                        </td>
                        <td className="py-3 px-4 font-sans">
                          {field.isCritical ? (
                            <span className="text-[10px] text-[#E30000] font-bold">Actuator Gated</span>
                          ) : (
                            <span className="text-[10px] text-[#30D158]">Sensor Telemetry</span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          ) : (
            <div className="text-center py-16 text-[#708A7C]">
              Select a device type to inspect its telemetry schema.
            </div>
          )}
        </div>
      </div>

      {/* New Device Type Modal */}
      <Modal
        isOpen={isNewOpen}
        onClose={() => setIsNewOpen(false)}
        title="Register New Device Type & Schema"
        subtitle="Define telemetry validation contracts, rate limits, and physical consequence gates"
        maxWidth="2xl"
      >
        <form onSubmit={handleSaveType} className="space-y-4 text-xs">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-[#CBD4CF] font-semibold mb-1.5">Device Type Name</label>
              <input
                type="text"
                required
                placeholder="e.g. Ultrasonic Gas Flow Sensor"
                value={name}
                onChange={e => setName(e.target.value)}
                className="w-full bg-[#142019] border border-[#26372E] rounded-full px-4 py-2.5 text-white focus:outline-none focus:border-[#CC5833]"
              />
            </div>

            <div>
              <label className="block text-[#CBD4CF] font-semibold mb-1.5">Type Code</label>
              <input
                type="text"
                required
                placeholder="e.g. GAS-FLOW-ULTRASONIC"
                value={code}
                onChange={e => setCode(e.target.value)}
                className="w-full bg-[#142019] border border-[#26372E] rounded-full px-4 py-2.5 text-white font-mono focus:outline-none focus:border-[#CC5833]"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-[#CBD4CF] font-semibold mb-1.5">Category</label>
              <select
                value={category}
                onChange={e => setCategory(e.target.value as any)}
                className="w-full bg-[#142019] border border-[#26372E] rounded-full px-4 py-2.5 text-white focus:outline-none focus:border-[#CC5833] cursor-pointer"
              >
                <option value="AGRICULTURE" className="bg-[#171C19]">AGRICULTURE</option>
                <option value="WATER" className="bg-[#171C19]">WATER</option>
                <option value="ENERGY" className="bg-[#171C19]">ENERGY</option>
                <option value="INDUSTRIAL" className="bg-[#171C19]">INDUSTRIAL</option>
                <option value="GATEWAY" className="bg-[#171C19]">GATEWAY</option>
                <option value="CUSTOM" className="bg-[#171C19]">CUSTOM</option>
              </select>
            </div>

            <div className="flex items-center gap-2 pt-6">
              <input
                type="checkbox"
                id="isActuator"
                checked={isActuator}
                onChange={e => setIsActuator(e.target.checked)}
                className="rounded border-[#26372E] bg-[#142019] text-[#CC5833] w-4 h-4 cursor-pointer"
              />
              <label htmlFor="isActuator" className="text-[#CBD4CF] font-semibold cursor-pointer">
                Critical Actuator (Requires Human Sign-off for Playbooks)
              </label>
            </div>
          </div>

          <div>
            <label className="block text-[#CBD4CF] font-semibold mb-1.5">Description</label>
            <input
              type="text"
              placeholder="e.g. High-pressure pipeline monitoring node"
              value={description}
              onChange={e => setDescription(e.target.value)}
              className="w-full bg-[#142019] border border-[#26372E] rounded-full px-4 py-2.5 text-white focus:outline-none focus:border-[#CC5833]"
            />
          </div>

          {/* Dynamic Field Builder */}
          <div className="p-4 rounded-2xl bg-[#142019] border border-[#26372E] space-y-3">
            <div className="flex items-center justify-between">
              <span className="font-bold text-white uppercase text-[10px] font-mono">Telemetry Fields Schema</span>
              <button
                type="button"
                onClick={addFieldRow}
                className="flex items-center gap-1.5 text-[11px] text-[#30D158] hover:underline"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add Metric Field</span>
              </button>
            </div>

            <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
              {fields.map((f, idx) => (
                <div key={idx} className="grid grid-cols-6 gap-2 items-center bg-[#111614] p-2.5 rounded-xl border border-[#26372E]">
                  <input
                    type="text"
                    placeholder="Field key"
                    value={f.name}
                    onChange={e => updateField(idx, 'name', e.target.value)}
                    className="bg-[#142019] border border-[#26372E] rounded-lg p-1.5 text-white font-mono text-[11px]"
                  />
                  <input
                    type="text"
                    placeholder="Label"
                    value={f.displayName}
                    onChange={e => updateField(idx, 'displayName', e.target.value)}
                    className="bg-[#142019] border border-[#26372E] rounded-lg p-1.5 text-white text-[11px]"
                  />
                  <input
                    type="text"
                    placeholder="Unit (e.g. %)"
                    value={f.unit || ''}
                    onChange={e => updateField(idx, 'unit', e.target.value)}
                    className="bg-[#142019] border border-[#26372E] rounded-lg p-1.5 text-white font-mono text-[11px]"
                  />
                  <input
                    type="number"
                    placeholder="Min"
                    value={f.min !== undefined ? f.min : ''}
                    onChange={e => updateField(idx, 'min', e.target.value ? Number(e.target.value) : undefined)}
                    className="bg-[#142019] border border-[#26372E] rounded-lg p-1.5 text-white font-mono text-[11px]"
                  />
                  <input
                    type="number"
                    placeholder="Max"
                    value={f.max !== undefined ? f.max : ''}
                    onChange={e => updateField(idx, 'max', e.target.value ? Number(e.target.value) : undefined)}
                    className="bg-[#142019] border border-[#26372E] rounded-lg p-1.5 text-white font-mono text-[11px]"
                  />
                  <div className="flex items-center justify-end">
                    <button
                      type="button"
                      onClick={() => removeFieldRow(idx)}
                      className="text-[#E30000] hover:text-rose-300 p-1"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="flex items-center justify-end gap-3 pt-3 border-t border-[#26372E]">
            <button
              type="button"
              onClick={() => setIsNewOpen(false)}
              className="px-5 py-2.5 rounded-full bg-[#142019] text-[#CBD4CF] hover:bg-[#1E2622] font-semibold border border-[#26372E]"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSaving}
              className="magnetic-btn px-6 py-2.5 rounded-full bg-[#CC5833] hover:bg-[#B54926] text-white font-semibold disabled:opacity-50 shadow-clay-glow"
            >
              {isSaving ? 'Registering...' : 'Save Schema'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
