import React, { useState } from 'react';
import { Incident, Site } from '../../types';
import { SeverityBadge, StatusBadge } from '../common/Badge';
import { AlertTriangle, ChevronRight, Search, Plus } from 'lucide-react';
import { Modal } from '../common/Modal';

interface IncidentQueueProps {
  incidents: Incident[];
  sites: Site[];
  onSelectIncident: (id: string) => void;
  onCreateIncident: (payload: any) => Promise<void>;
}

export const IncidentQueue: React.FC<IncidentQueueProps> = ({
  incidents,
  sites,
  onSelectIncident,
  onCreateIncident
}) => {
  const [statusFilter, setStatusFilter] = useState('');
  const [severityFilter, setSeverityFilter] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [isCreateOpen, setIsCreateOpen] = useState(false);

  // New incident form
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [severity, setSeverity] = useState('HIGH');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const filtered = incidents.filter(i => {
    if (statusFilter && i.status !== statusFilter) return false;
    if (severityFilter && i.severity !== severityFilter) return false;
    if (searchTerm) {
      const q = searchTerm.toLowerCase();
      return (
        i.title.toLowerCase().includes(q) ||
        i.description.toLowerCase().includes(q) ||
        i.id.toLowerCase().includes(q)
      );
    }
    return true;
  });

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title) return;
    setIsSubmitting(true);
    try {
      await onCreateIncident({ title, description, severity });
      setIsCreateOpen(false);
      setTitle('');
      setDescription('');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-4">
      {/* Header Bar */}
      <div className="glass-panel rounded-2xl p-4 border border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <AlertTriangle className="w-5 h-5 text-rose-400" />
          <h2 className="text-base font-bold text-white uppercase tracking-wider">
            SOC Incident Triage & Case Queue
          </h2>
          <span className="text-xs font-mono px-2 py-0.5 rounded bg-rose-950 text-rose-300 border border-rose-800/60">
            {filtered.length} Active Cases
          </span>
        </div>

        <button
          onClick={() => setIsCreateOpen(true)}
          className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-white text-xs font-semibold border border-slate-700 transition-all"
        >
          <Plus className="w-4 h-4" />
          <span>Manual Incident</span>
        </button>
      </div>

      {/* Filter Row */}
      <div className="glass-panel rounded-xl p-3 border border-slate-800 grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
        <div className="relative">
          <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search incident title or ID..."
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            className="w-full bg-[#0c101a] border border-slate-800 rounded-lg pl-8 pr-3 py-1.5 text-slate-200 focus:outline-none focus:border-cyan-500"
          />
        </div>

        <div>
          <select
            value={statusFilter}
            onChange={e => setStatusFilter(e.target.value)}
            className="w-full bg-[#0c101a] text-slate-300 border border-slate-800 rounded-lg px-3 py-1.5 focus:outline-none focus:border-cyan-500"
          >
            <option value="">All Triage States</option>
            <option value="OPEN">OPEN</option>
            <option value="TRIAGED">TRIAGED</option>
            <option value="INVESTIGATING">INVESTIGATING</option>
            <option value="RESOLVED">RESOLVED</option>
            <option value="CLOSED">CLOSED</option>
          </select>
        </div>

        <div>
          <select
            value={severityFilter}
            onChange={e => setSeverityFilter(e.target.value)}
            className="w-full bg-[#0c101a] text-slate-300 border border-slate-800 rounded-lg px-3 py-1.5 focus:outline-none focus:border-cyan-500"
          >
            <option value="">All Severities</option>
            <option value="CRITICAL">CRITICAL</option>
            <option value="HIGH">HIGH</option>
            <option value="MEDIUM">MEDIUM</option>
            <option value="LOW">LOW</option>
          </select>
        </div>
      </div>

      {/* Incidents Table */}
      <div className="glass-panel rounded-2xl border border-slate-800 overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-300">
            <thead className="bg-[#0c101a] text-[11px] uppercase tracking-wider text-slate-400 border-b border-slate-800">
              <tr>
                <th className="py-3 px-4">Case Title & ID</th>
                <th className="py-3 px-4">Severity</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4">Linked Evidence</th>
                <th className="py-3 px-4">Actions Executed</th>
                <th className="py-3 px-4">Created</th>
                <th className="py-3 px-4 text-right">Triage</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 font-mono">
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={7} className="text-center py-10 text-slate-400 font-sans">
                    No open incidents matching filter criteria.
                  </td>
                </tr>
              ) : (
                filtered.map(inc => (
                  <tr
                    key={inc.id}
                    onClick={() => onSelectIncident(inc.id)}
                    className="hover:bg-slate-800/30 transition-colors group cursor-pointer"
                  >
                    <td className="py-3 px-4">
                      <div className="font-sans font-bold text-white group-hover:text-cyan-400 transition-colors">
                        {inc.title}
                      </div>
                      <div className="text-[11px] text-slate-400 font-mono">{inc.id}</div>
                    </td>

                    <td className="py-3 px-4">
                      <SeverityBadge severity={inc.severity} />
                    </td>

                    <td className="py-3 px-4">
                      <StatusBadge status={inc.status} />
                    </td>

                    <td className="py-3 px-4 font-sans text-[11px]">
                      <div>{inc.securityEventIds.length} Security Alerts</div>
                      <div className="text-slate-400">{inc.anomalyEventIds.length} ML Anomalies</div>
                    </td>

                    <td className="py-3 px-4">
                      <span className="font-mono text-cyan-300">{inc.actions.length} Playbooks</span>
                    </td>

                    <td className="py-3 px-4 text-slate-400 text-[11px]">
                      {new Date(inc.createdAt).toLocaleString()}
                    </td>

                    <td className="py-3 px-4 text-right font-sans">
                      <button
                        onClick={() => onSelectIncident(inc.id)}
                        className="inline-flex items-center gap-1 px-2.5 py-1 rounded bg-slate-800 hover:bg-cyan-950 hover:text-cyan-300 text-xs text-slate-300 font-semibold transition-all"
                      >
                        <span>Investigate</span>
                        <ChevronRight className="w-3.5 h-3.5" />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Manual Incident Modal */}
      <Modal
        isOpen={isCreateOpen}
        onClose={() => setIsCreateOpen(false)}
        title="Open Security Incident Case"
        subtitle="Manually declare a security incident and dispatch analyst queue"
        maxWidth="md"
      >
        <form onSubmit={handleCreate} className="space-y-4 text-xs">
          <div>
            <label className="block text-slate-300 font-semibold mb-1">Incident Title</label>
            <input
              type="text"
              required
              placeholder="e.g. Unusual Out-of-Band Telemetry Spike on Farm Probe"
              value={title}
              onChange={e => setTitle(e.target.value)}
              className="w-full bg-[#0c101a] border border-slate-700 rounded-lg p-2.5 text-white focus:outline-none focus:border-cyan-500"
            />
          </div>

          <div>
            <label className="block text-slate-300 font-semibold mb-1">Severity Level</label>
            <select
              value={severity}
              onChange={e => setSeverity(e.target.value)}
              className="w-full bg-[#0c101a] border border-slate-700 rounded-lg p-2.5 text-white focus:outline-none focus:border-cyan-500"
            >
              <option value="CRITICAL">CRITICAL (Direct breach or compromised actuator)</option>
              <option value="HIGH">HIGH (Cloned certificate or topic violation)</option>
              <option value="MEDIUM">MEDIUM (Sensor drift or unusual cadence)</option>
              <option value="LOW">LOW (Informational deviation)</option>
            </select>
          </div>

          <div>
            <label className="block text-slate-300 font-semibold mb-1">Description & Initial Findings</label>
            <textarea
              rows={3}
              placeholder="Provide background context for the SOC analyst..."
              value={description}
              onChange={e => setDescription(e.target.value)}
              className="w-full bg-[#0c101a] border border-slate-700 rounded-lg p-2.5 text-white focus:outline-none focus:border-cyan-500 resize-none"
            />
          </div>

          <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-800">
            <button
              type="button"
              onClick={() => setIsCreateOpen(false)}
              className="px-4 py-2 rounded-lg bg-slate-800 text-slate-300 font-semibold"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-4 py-2 rounded-lg bg-rose-600 hover:bg-rose-500 text-white font-semibold disabled:opacity-50"
            >
              {isSubmitting ? 'Opening Case...' : 'Create Incident'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
