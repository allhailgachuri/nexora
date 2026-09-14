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
      <div className="glass-panel rounded-2xl p-5 border border-slate-800 flex flex-col md:flex-row md:items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="p-3 rounded-xl bg-cyan-950/60 border border-cyan-500/40 text-cyan-400">
            <FileCode2 className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-base font-bold text-white tracking-wide">
              Dynamic Telemetry Schema & Device Type Engine
            </h2>
            <p className="text-slate-400 text-[11px] mt-0.5">
              Generic, domain-agnostic schema definitions for data bounds, rate limits, and physical actuator safety rules.
            </p>
          </div>
        </div>

        <button
          onClick={() => setIsNewOpen(true)}
          className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 text-white font-semibold shadow-cyber-glow transition-all self-start md:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>New Device Type Schema</span>
        </button>
      </div>

      {statusMessage && (
        <div className="p-3 rounded-xl bg-cyan-950/50 border border-cyan-500/50 text-cyan-200">
          {statusMessage}
        </div>
      )}

      {/* Grid: Type Selector & Schema Details */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Col: Device Types List */}
        <div className="glass-panel rounded-2xl p-5 border border-slate-800 space-y-3">
          <h3 className="text-sm font-bold uppercase tracking-wider text-white pb-3 border-b border-slate-800">
            Registered Device Types ({deviceTypes.length})
          </h3>

          <div className="space-y-2">
            {deviceTypes.map(type => {
              const isSelected = selectedType?.id === type.id;
              return (
                <div
                  key={type.id}
                  onClick={() => setSelectedType(type)}
                  className={`p-3 rounded-xl border cursor-pointer transition-all ${
                    isSelected
                      ? 'bg-cyan-950/40 border-cyan-500/60 shadow-cyber-glow text-white'
                      : 'bg-[#0c101a] border-slate-800 text-slate-300 hover:border-slate-700'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-sm">{type.name}</span>
                    <span className="text-[10px] font-mono text-cyan-400">{type.code}</span>
                  </div>
                  <div className="flex items-center gap-2 text-[10px] text-slate-400 mt-1">
                    <span>{type.category}</span>
                    <span>•</span>
                    <span>{type.telemetrySchema?.fields?.length || 0} Telemetry Fields</span>
                    {type.isActuatorOrCritical && (
                      <span className="text-amber-400 font-bold">• Actuator (Gated)</span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right 2 Cols: Schema Inspector */}
        <div className="lg:col-span-2 glass-panel rounded-2xl p-5 border border-slate-800 space-y-4">
          {selectedType ? (
            <div>
              <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                <div>
                  <h3 className="text-sm font-bold text-white uppercase tracking-wider">
                    {selectedType.name} Schema Specification
                  </h3>
                  <p className="text-[11px] text-slate-400 mt-0.5">{selectedType.description}</p>
                </div>
                <div className="flex items-center gap-2">
                  <span className="px-2 py-0.5 rounded bg-slate-800 text-slate-300 font-mono text-[10px]">
                    v{selectedType.telemetrySchema.version}
                  </span>
                  {selectedType.isActuatorOrCritical && (
                    <span className="px-2 py-0.5 rounded bg-amber-950 text-amber-400 border border-amber-800 text-[10px] font-bold">
                      Critical Actuator Gate
                    </span>
                  )}
                </div>
              </div>

              {/* Fields Table */}
              <div className="mt-4 overflow-x-auto">
                <table className="w-full text-left text-xs text-slate-300">
                  <thead className="bg-[#0c101a] text-[11px] uppercase tracking-wider text-slate-400 border-b border-slate-800">
                    <tr>
                      <th className="py-2.5 px-3">Field Key / Label</th>
                      <th className="py-2.5 px-3">Type / Unit</th>
                      <th className="py-2.5 px-3">Min / Max Bounds</th>
                      <th className="py-2.5 px-3">Max Rate of Change</th>
                      <th className="py-2.5 px-3">Policy Rules</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800 font-mono">
                    {selectedType.telemetrySchema.fields.map(field => (
                      <tr key={field.name} className="hover:bg-slate-800/30">
                        <td className="py-2.5 px-3">
                          <div className="font-bold text-cyan-300">{field.name}</div>
                          <div className="text-[10px] font-sans text-slate-400">{field.displayName}</div>
                        </td>
                        <td className="py-2.5 px-3 font-sans">
                          <div>{field.type}</div>
                          <div className="text-[10px] text-slate-400 font-mono">{field.unit || 'n/a'}</div>
                        </td>
                        <td className="py-2.5 px-3">
                          {field.min !== undefined ? `${field.min} to ${field.max}` : 'Unbounded'}
                        </td>
                        <td className="py-2.5 px-3 text-amber-300">
                          {field.maxRateOfChange ? `±${field.maxRateOfChange} / tick` : 'None'}
                        </td>
                        <td className="py-2.5 px-3 font-sans">
                          {field.isCritical ? (
                            <span className="text-[10px] text-rose-400 font-bold">Actuator Gated</span>
                          ) : (
                            <span className="text-[10px] text-emerald-400">Sensor Telemetry</span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          ) : (
            <div className="text-center py-12 text-slate-400">
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
              <label className="block text-slate-300 font-semibold mb-1">Device Type Name</label>
              <input
                type="text"
                required
                placeholder="e.g. Ultrasonic Gas Flow Sensor"
                value={name}
                onChange={e => setName(e.target.value)}
                className="w-full bg-[#0c101a] border border-slate-700 rounded-lg p-2 text-white focus:outline-none focus:border-cyan-500"
              />
            </div>

            <div>
              <label className="block text-slate-300 font-semibold mb-1">Type Code</label>
              <input
                type="text"
                required
                placeholder="e.g. GAS-FLOW-ULTRASONIC"
                value={code}
                onChange={e => setCode(e.target.value)}
                className="w-full bg-[#0c101a] border border-slate-700 rounded-lg p-2 text-white font-mono focus:outline-none focus:border-cyan-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-slate-300 font-semibold mb-1">Category</label>
              <select
                value={category}
                onChange={e => setCategory(e.target.value as any)}
                className="w-full bg-[#0c101a] border border-slate-700 rounded-lg p-2 text-white focus:outline-none focus:border-cyan-500"
              >
                <option value="AGRICULTURE">AGRICULTURE</option>
                <option value="WATER">WATER</option>
                <option value="ENERGY">ENERGY</option>
                <option value="INDUSTRIAL">INDUSTRIAL</option>
                <option value="GATEWAY">GATEWAY</option>
                <option value="CUSTOM">CUSTOM</option>
              </select>
            </div>

            <div className="flex items-center gap-2 pt-6">
              <input
                type="checkbox"
                id="isActuator"
                checked={isActuator}
                onChange={e => setIsActuator(e.target.checked)}
                className="rounded border-slate-700 bg-[#0c101a] text-cyan-500 w-4 h-4 cursor-pointer"
              />
              <label htmlFor="isActuator" className="text-slate-300 font-semibold cursor-pointer">
                Critical Actuator (Requires Human Sign-off for Playbooks)
              </label>
            </div>
          </div>

          <div>
            <label className="block text-slate-300 font-semibold mb-1">Description</label>
            <input
              type="text"
              placeholder="e.g. High-pressure pipeline monitoring node"
              value={description}
              onChange={e => setDescription(e.target.value)}
              className="w-full bg-[#0c101a] border border-slate-700 rounded-lg p-2 text-white focus:outline-none focus:border-cyan-500"
            />
          </div>

          {/* Dynamic Field Builder */}
          <div className="p-3 rounded-xl bg-[#0c101a] border border-slate-800 space-y-3">
            <div className="flex items-center justify-between">
              <span className="font-bold text-white uppercase text-[11px]">Telemetry Fields Schema</span>
              <button
                type="button"
                onClick={addFieldRow}
                className="flex items-center gap-1 text-[11px] text-cyan-400 hover:text-cyan-300"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add Metric</span>
              </button>
            </div>

            <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
              {fields.map((f, idx) => (
                <div key={idx} className="grid grid-cols-6 gap-2 items-center bg-[#070a10] p-2 rounded-lg border border-slate-800">
                  <input
                    type="text"
                    placeholder="Field key"
                    value={f.name}
                    onChange={e => updateField(idx, 'name', e.target.value)}
                    className="bg-[#0c101a] border border-slate-700 rounded p-1 text-white font-mono text-[11px]"
                  />
                  <input
                    type="text"
                    placeholder="Label"
                    value={f.displayName}
                    onChange={e => updateField(idx, 'displayName', e.target.value)}
                    className="bg-[#0c101a] border border-slate-700 rounded p-1 text-white text-[11px]"
                  />
                  <input
                    type="text"
                    placeholder="Unit (e.g. %)"
                    value={f.unit || ''}
                    onChange={e => updateField(idx, 'unit', e.target.value)}
                    className="bg-[#0c101a] border border-slate-700 rounded p-1 text-white font-mono text-[11px]"
                  />
                  <input
                    type="number"
                    placeholder="Min"
                    value={f.min !== undefined ? f.min : ''}
                    onChange={e => updateField(idx, 'min', e.target.value ? Number(e.target.value) : undefined)}
                    className="bg-[#0c101a] border border-slate-700 rounded p-1 text-white font-mono text-[11px]"
                  />
                  <input
                    type="number"
                    placeholder="Max"
                    value={f.max !== undefined ? f.max : ''}
                    onChange={e => updateField(idx, 'max', e.target.value ? Number(e.target.value) : undefined)}
                    className="bg-[#0c101a] border border-slate-700 rounded p-1 text-white font-mono text-[11px]"
                  />
                  <div className="flex items-center justify-end">
                    <button
                      type="button"
                      onClick={() => removeFieldRow(idx)}
                      className="text-rose-400 hover:text-rose-300 p-1"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-800">
            <button
              type="button"
              onClick={() => setIsNewOpen(false)}
              className="px-4 py-2 rounded-lg bg-slate-800 text-slate-300 font-semibold"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSaving}
              className="px-4 py-2 rounded-lg bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 text-white font-semibold disabled:opacity-50"
            >
              {isSaving ? 'Registering...' : 'Save Schema'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
