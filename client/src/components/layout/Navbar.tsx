import React from 'react';
import { Shield, Radio, Bell, UserCircle, Cpu } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { FleetStats } from '../../types';

interface NavbarProps {
  stats: FleetStats | null;
  wsConnected: boolean;
  onOpenSimulator: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({ stats, wsConnected, onOpenSimulator }) => {
  const { currentUser, users, switchUser } = useAuth();

  const threatColor = {
    NOMINAL: 'bg-emerald-950/60 text-emerald-400 border-emerald-500/40',
    ELEVATED: 'bg-blue-950/60 text-blue-400 border-blue-500/40',
    HIGH: 'bg-amber-950/60 text-amber-400 border-amber-500/40',
    CRITICAL: 'bg-rose-950/70 text-rose-400 border-rose-600/60 animate-pulse'
  }[stats?.threatLevel || 'NOMINAL'];

  return (
    <header className="sticky top-0 z-40 h-16 border-b border-slate-800 bg-[#0a0d14]/90 backdrop-blur-xl px-4 sm:px-6 flex items-center justify-between">
      {/* Brand & Platform Identity */}
      <div className="flex items-center gap-3">
        <div className="relative flex items-center justify-center w-10 h-10 rounded-xl bg-gradient-to-br from-slate-900 to-slate-950 border border-cyan-500/30 shadow-cyber-glow overflow-hidden p-1">
          <img src="/nexora.png" alt="NEXORA Logo" className="w-full h-full object-contain" />
          <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full bg-emerald-400 border-2 border-[#0a0d14]" />
        </div>
        <div>
          <div className="flex items-center gap-2">
            <span className="text-lg font-black tracking-wider text-white font-mono">NEXORA</span>
            <span className="text-[10px] font-semibold uppercase px-1.5 py-0.5 rounded bg-cyan-950/80 text-cyan-400 border border-cyan-700/50">
              Fleet Defense
            </span>
          </div>
          <p className="text-[11px] text-slate-400 tracking-tight hidden sm:block">
            IoT Security & Anomaly Observability Platform
          </p>
        </div>
      </div>

      {/* Center Status Indicators */}
      <div className="hidden md:flex items-center gap-4">
        {/* Threat Level Badge */}
        <div className={`flex items-center gap-2 px-3 py-1 rounded-lg border text-xs font-semibold uppercase tracking-wider ${threatColor}`}>
          <span className="w-2 h-2 rounded-full bg-current animate-ping" />
          <span>Threat Posture: {stats?.threatLevel || 'NOMINAL'}</span>
        </div>

        {/* Live MQTT WebSocket Stream */}
        <div className="flex items-center gap-2 px-2.5 py-1 rounded-lg border border-slate-800 bg-[#101522] text-xs text-slate-300">
          <Radio className={`w-3.5 h-3.5 ${wsConnected ? 'text-emerald-400 animate-pulse' : 'text-slate-500'}`} />
          <span className="text-[11px] font-mono text-slate-400">Broker mTLS / Bus:</span>
          <span className={`font-semibold ${wsConnected ? 'text-emerald-400' : 'text-rose-400'}`}>
            {wsConnected ? 'LIVE' : 'CONNECTING'}
          </span>
        </div>
      </div>

      {/* Right Controls & User Role Switcher */}
      <div className="flex items-center gap-3">
        {/* Simulator Attack Sandbox Button */}
        <button
          onClick={onOpenSimulator}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium text-cyan-300 bg-cyan-950/50 hover:bg-cyan-900/60 border border-cyan-500/40 hover:border-cyan-400 shadow-sm transition-all"
        >
          <Cpu className="w-4 h-4 text-cyan-400" />
          <span className="hidden sm:inline">Attack Sandbox</span>
        </button>

        {/* User Role Switcher */}
        <div className="relative flex items-center gap-2 pl-2 border-l border-slate-800">
          <UserCircle className="w-5 h-5 text-slate-400" />
          <div className="text-left">
            <select
              value={currentUser.id}
              onChange={(e) => switchUser(e.target.value)}
              className="bg-[#101522] text-xs font-medium text-white border border-slate-700/80 rounded-md px-2 py-1 focus:outline-none focus:border-cyan-500 cursor-pointer"
            >
              {users.map(u => (
                <option key={u.id} value={u.id}>
                  {u.name} ({u.role.replace('_', ' ')})
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>
    </header>
  );
};
