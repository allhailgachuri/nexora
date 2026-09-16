import React from 'react';
import { LucideIcon } from 'lucide-react';

interface StatCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon: LucideIcon;
  trend?: {
    value: string;
    isPositive: boolean;
  };
  accentColor?: 'cyan' | 'emerald' | 'amber' | 'rose' | 'purple' | 'clay' | 'moss';
  onClick?: () => void;
}

export const StatCard: React.FC<StatCardProps> = ({
  title,
  value,
  subtitle,
  icon: Icon,
  trend,
  accentColor = 'clay',
  onClick
}) => {
  const colorMap = {
    clay: 'border-[#CC5833]/30 hover:border-[#CC5833]/60 bg-[#171C19]/90',
    moss: 'border-[#2E4036] hover:border-[#708A7C]/60 bg-[#171C19]/90',
    cyan: 'border-[#2997FF]/30 hover:border-[#2997FF]/60 bg-[#171C19]/90',
    emerald: 'border-[#30D158]/30 hover:border-[#30D158]/60 bg-[#171C19]/90',
    amber: 'border-[#E85D04]/30 hover:border-[#E85D04]/60 bg-[#171C19]/90',
    rose: 'border-[#E30000]/30 hover:border-[#E30000]/60 bg-[#171C19]/90',
    purple: 'border-[#9D65C9]/30 hover:border-[#9D65C9]/60 bg-[#171C19]/90'
  };

  const iconColorMap = {
    clay: 'bg-[#CC5833]/15 text-[#CC5833] border-[#CC5833]/30',
    moss: 'bg-[#2E4036]/60 text-[#9DB3A6] border-[#708A7C]/30',
    cyan: 'bg-[#2997FF]/15 text-[#2997FF] border-[#2997FF]/30',
    emerald: 'bg-[#30D158]/15 text-[#30D158] border-[#30D158]/30',
    amber: 'bg-[#E85D04]/15 text-[#E85D04] border-[#E85D04]/30',
    rose: 'bg-[#E30000]/15 text-[#E30000] border-[#E30000]/30',
    purple: 'bg-[#9D65C9]/15 text-[#9D65C9] border-[#9D65C9]/30'
  };

  return (
    <div
      onClick={onClick}
      className={`relative overflow-hidden rounded-[2rem] border backdrop-blur-xl p-5 transition-all duration-300 shadow-organic-card hover:shadow-organic-hover hover-lift ${colorMap[accentColor]} ${onClick ? 'cursor-pointer' : ''}`}
    >
      <div className="flex items-center justify-between">
        <span className="text-[11px] font-semibold uppercase tracking-wider text-[#708A7C] font-mono">{title}</span>
        <div className={`p-2.5 rounded-2xl border ${iconColorMap[accentColor]}`}>
          <Icon className="w-4 h-4" />
        </div>
      </div>

      <div className="mt-3 flex items-baseline gap-2">
        <span className="text-2xl font-bold tracking-tight text-white font-mono">{value}</span>
        {trend && (
          <span className={`text-[11px] font-mono font-semibold ${trend.isPositive ? 'text-[#30D158]' : 'text-[#E30000]'}`}>
            {trend.value}
          </span>
        )}
      </div>

      {subtitle && (
        <p className="mt-1 text-xs text-[#94A39B] truncate">{subtitle}</p>
      )}
    </div>
  );
};
