import React from 'react';
import { Shield, Radio, Bell, UserCircle, Cpu, ArrowLeft } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { FleetStats } from '../../types';

interface NavbarProps {
  stats: FleetStats | null;
  wsConnected: boolean;
  onOpenSimulator: () => void;
  onGoToLanding?: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({ stats, wsConnected, onOpenSimulator, onGoToLanding }) => {
  const { currentUser, users, switchUser } = useAuth();

  const threatStyle = {
    NOMINAL: 'bg-[#2E4036]/60 text-[#30D158] border-[#708A7C]/40',
    ELEVATED: 'bg-[#CC5833]/15 text-[#CC5833] border-[#CC5833]/40',
    HIGH: 'bg-[#E85D04]/20 text-[#E85D04] border-[#E85D04]/40',
    CRITICAL: 'bg-[#E30000]/25 text-[#E30000] border-[#E30000]/50 animate-pulse'
  }[stats?.threatLevel || 'NOMINAL'];

  return (
    <header className="sticky top-0 z-40 px-4 sm:px-6 pt-3 pb-2">
      <div className="rounded-[2rem] bg-[#171C19]/85 backdrop-blur-2xl border border-[#26372E] px-4 sm:px-6 h-16 flex items-center justify-between shadow-organic-card">
        {/* Brand & Platform Identity */}
        <div
          onClick={onGoToLanding}
          className="flex items-center gap-3 cursor-pointer group"
          title="Click to view Landing Page"
        >
          <div className="relative flex items-center justify-center w-9 h-9 rounded-full bg-gradient-to-br from-[#2E4036] to-[#142019] border border-[#708A7C]/40 group-hover:border-[#CC5833] shadow-sm overflow-hidden p-1 transition-all">
            <img src="/nexora.png" alt="NEXORA Logo" className="w-full h-full object-contain" />
            <div className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full bg-[#30D158] border-2 border-[#111614]" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-base font-bold tracking-tight text-white font-sans group-hover:text-[#CC5833] transition-colors">NEXORA</span>
              <span className="text-[10px] font-semibold uppercase px-2 py-0.5 rounded-full bg-[#2E4036]/60 text-[#9DB3A6] border border-[#2E4036]">
                Command Hub
              </span>
            </div>
          </div>
        </div>

        {/* Center Status Indicators */}
        <div className="hidden md:flex items-center gap-4">
          {/* Threat Level Badge */}
          <div className={`flex items-center gap-2 px-3 py-1 rounded-full border text-xs font-semibold uppercase tracking-wider ${threatStyle}`}>
            <span className="w-2 h-2 rounded-full bg-current animate-ping" />
            <span>Threat Posture: {stats?.threatLevel || 'NOMINAL'}</span>
          </div>

          {/* Live MQTT WebSocket Stream */}
          <div className="flex items-center gap-2 px-3 py-1 rounded-full border border-[#26372E] bg-[#142019] text-xs text-[#94A39B]">
            <Radio className={`w-3.5 h-3.5 ${wsConnected ? 'text-[#30D158] animate-pulse' : 'text-[#708A7C]'}`} />
            <span className="text-[11px] font-mono text-[#708A7C]">mTLS Bus:</span>
            <span className={`font-semibold font-mono ${wsConnected ? 'text-[#30D158]' : 'text-[#CC5833]'}`}>
              {wsConnected ? 'ENCRYPTED' : 'CONNECTING'}
            </span>
          </div>
        </div>

        {/* Right Controls & User Switcher */}
        <div className="flex items-center gap-3">
          {/* Landing Page Button */}
          {onGoToLanding && (
            <button
              onClick={onGoToLanding}
              className="magnetic-btn flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-medium text-[#94A39B] bg-[#142019] hover:bg-[#1C2B22] border border-[#26372E] hover:text-white transition-all"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Landing</span>
            </button>
          )}

          {/* Simulator Attack Sandbox Button */}
          <button
            onClick={onOpenSimulator}
            className="magnetic-btn flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-medium text-white bg-[#CC5833] hover:bg-[#B54926] shadow-clay-glow transition-all"
          >
            <Cpu className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Attack Sandbox</span>
          </button>

          {/* User Role Switcher */}
          <div className="relative flex items-center gap-2 pl-2 border-l border-[#26372E]">
            <UserCircle className="w-5 h-5 text-[#708A7C]" />
            <div className="text-left">
              <select
                value={currentUser.id}
                onChange={(e) => switchUser(e.target.value)}
                className="bg-[#142019] text-xs font-medium text-[#F4F2EC] border border-[#26372E] rounded-full px-3 py-1 focus:outline-none focus:border-[#CC5833] cursor-pointer"
              >
                {users.map(u => (
                  <option key={u.id} value={u.id} className="bg-[#171C19] text-[#F4F2EC]">
                    {u.name} ({u.role.replace('_', ' ')})
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};
