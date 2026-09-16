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
    <div className="space-y-5">
      {/* Header Bar */}
      <div className="organic-glass-card p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-2xl bg-[#CC5833]/15 text-[#CC5833] border border-[#CC5833]/30">
            <AlertTriangle className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-base font-bold text-white tracking-tight">
              SOC Incident Triage & Case Queue
            </h2>
            <p className="text-xs text-[#94A39B]">
              {filtered.length} Active Incidents Requiring Human/Automated Triage
            </p>
          </div>
        </div>

        <button
          onClick={() => setIsCreateOpen(true)}
          className="magnetic-btn flex items-center gap-2 px-5 py-2.5 rounded-full bg-[#142019] hover:bg-[#1E2622] text-[#F4F2EC] text-xs font-semibold border border-[#26372E] shadow-sm transition-all"
        >
          <Plus className="w-4 h-4 text-[#CC5833]" />
          <span>Manual Incident Case</span>
        </button>
      </div>

      {/* Filter Row */}
      <div className="organic-glass p-3 rounded-[2rem] grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
        <div className="relative">
          <Search className="w-3.5 h-3.5 text-[#708A7C] absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search incident title or ID..."
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            className="w-full bg-[#142019] border border-[#26372E] rounded-full pl-9 pr-3 py-2 text-[#F4F2EC] placeholder-[#708A7C] focus:outline-none focus:border-[#CC5833]"
          />
        </div>

        <div>
          <select
            value={statusFilter}
            onChange={e => setStatusFilter(e.target.value)}
            className="w-full bg-[#142019] text-[#CBD4CF] border border-[#26372E] rounded-full px-3.5 py-2 focus:outline-none focus:border-[#CC5833] cursor-pointer"
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
            className="w-full bg-[#142019] text-[#CBD4CF] border border-[#26372E] rounded-full px-3.5 py-2 focus:outline-none focus:border-[#CC5833] cursor-pointer"
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
      <div className="organic-glass-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-[#CBD4CF]">
            <thead className="bg-[#142019] text-[10px] font-mono uppercase tracking-wider text-[#708A7C] border-b border-[#26372E]">
              <tr>
                <th className="py-3.5 px-5">Case Title & ID</th>
                <th className="py-3.5 px-5">Severity</th>
                <th className="py-3.5 px-5">Status</th>
                <th className="py-3.5 px-5">Evidence Linked</th>
                <th className="py-3.5 px-5">Playbooks</th>
                <th className="py-3.5 px-5">Created</th>
                <th className="py-3.5 px-5 text-right">Triage</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#26372E] font-mono">
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={7} className="text-center py-12 text-[#708A7C] font-sans">
                    No open incidents matching filter criteria.
                  </td>
                </tr>
              ) : (
                filtered.map(inc => (
                  <tr
                    key={inc.id}
                    onClick={() => onSelectIncident(inc.id)}
                    className="hover:bg-[#1C2B22]/60 transition-colors group cursor-pointer"
                  >
                    <td className="py-3.5 px-5">
                      <div className="font-sans font-bold text-white group-hover:text-[#CC5833] transition-colors">
                        {inc.title}
                      </div>
                      <div className="text-[11px] text-[#708A7C] font-mono">{inc.id}</div>
                    </td>

                    <td className="py-3.5 px-5">
                      <SeverityBadge severity={inc.severity} />
                    </td>

                    <td className="py-3.5 px-5">
                      <StatusBadge status={inc.status} />
                    </td>

                    <td className="py-3.5 px-5 font-sans text-[11px]">
                      <div className="text-white font-medium">{inc.securityEventIds.length} Security Alerts</div>
                      <div className="text-[#708A7C]">{inc.anomalyEventIds.length} ML Anomalies</div>
                    </td>

                    <td className="py-3.5 px-5">
                      <span className="font-mono text-[#30D158]">{inc.actions.length} Executed</span>
                    </td>

                    <td className="py-3.5 px-5 text-[#708A7C] text-[11px]">
                      {new Date(inc.createdAt).toLocaleString()}
                    </td>

                    <td className="py-3.5 px-5 text-right font-sans">
                      <button
                        onClick={() => onSelectIncident(inc.id)}
                        className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#142019] hover:bg-[#1E2622] text-xs text-[#CBD4CF] hover:text-white font-semibold border border-[#26372E] transition-all"
                      >
                        <span>Investigate</span>
                        <ChevronRight className="w-3.5 h-3.5 text-[#CC5833]" />
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
            <label className="block text-[#CBD4CF] font-semibold mb-1.5">Incident Title</label>
            <input
              type="text"
              required
              placeholder="e.g. Unusual Out-of-Band Telemetry Spike on Farm Probe"
              value={title}
              onChange={e => setTitle(e.target.value)}
              className="w-full bg-[#142019] border border-[#26372E] rounded-full px-4 py-2.5 text-white focus:outline-none focus:border-[#CC5833]"
            />
          </div>

          <div>
            <label className="block text-[#CBD4CF] font-semibold mb-1.5">Severity Level</label>
            <select
              value={severity}
              onChange={e => setSeverity(e.target.value)}
              className="w-full bg-[#142019] border border-[#26372E] rounded-full px-4 py-2.5 text-white focus:outline-none focus:border-[#CC5833] cursor-pointer"
            >
              <option value="CRITICAL" className="bg-[#171C19]">CRITICAL (Direct breach or compromised actuator)</option>
              <option value="HIGH" className="bg-[#171C19]">HIGH (Cloned certificate or topic violation)</option>
              <option value="MEDIUM" className="bg-[#171C19]">MEDIUM (Sensor drift or unusual cadence)</option>
              <option value="LOW" className="bg-[#171C19]">LOW (Informational deviation)</option>
            </select>
          </div>

          <div>
            <label className="block text-[#CBD4CF] font-semibold mb-1.5">Description & Initial Findings</label>
            <textarea
              rows={3}
              placeholder="Provide background context for the SOC analyst..."
              value={description}
              onChange={e => setDescription(e.target.value)}
              className="w-full bg-[#142019] border border-[#26372E] rounded-2xl p-3 text-white focus:outline-none focus:border-[#CC5833] resize-none"
            />
          </div>

          <div className="flex items-center justify-end gap-3 pt-3 border-t border-[#26372E]">
            <button
              type="button"
              onClick={() => setIsCreateOpen(false)}
              className="px-5 py-2.5 rounded-full bg-[#142019] text-[#CBD4CF] hover:bg-[#1E2622] font-semibold border border-[#26372E]"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="magnetic-btn px-6 py-2.5 rounded-full bg-[#CC5833] hover:bg-[#B54926] text-white font-semibold disabled:opacity-50 shadow-clay-glow"
            >
              {isSubmitting ? 'Opening Case...' : 'Create Incident'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
