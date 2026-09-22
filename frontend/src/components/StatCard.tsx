import React from 'react';
import { LucideIcon, TrendingUp, TrendingDown } from 'lucide-react';

interface StatCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  change?: string;
  isPositive?: boolean;
  icon: LucideIcon;
  iconColor?: string;
  bgColor?: string;
}

export const StatCard: React.FC<StatCardProps> = ({
  title,
  value,
  subtitle,
  change,
  isPositive = true,
  icon: Icon,
  iconColor = 'text-blue-400',
  bgColor = 'bg-blue-500/10 border-blue-500/20',
}) => {
  return (
    <div className="glass-panel p-5 rounded-2xl relative overflow-hidden transition-all duration-200 hover:border-slate-600 hover:shadow-lg hover:shadow-blue-500/5 group">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">{title}</p>
          <h3 className="text-2xl font-bold text-white mt-1.5 tracking-tight group-hover:text-blue-400 transition-colors">
            {value}
          </h3>
          {subtitle && <p className="text-xs text-slate-400 mt-1">{subtitle}</p>}
        </div>
        <div className={`p-3 rounded-xl border ${bgColor} flex items-center justify-center`}>
          <Icon className={`w-6 h-6 ${iconColor}`} />
        </div>
      </div>

      {change && (
        <div className="mt-3.5 flex items-center gap-1.5 text-xs font-medium">
          {isPositive ? (
            <span className="flex items-center text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20">
              <TrendingUp className="w-3.5 h-3.5 mr-1" />
              {change}
            </span>
          ) : (
            <span className="flex items-center text-rose-400 bg-rose-500/10 px-2 py-0.5 rounded-full border border-rose-500/20">
              <TrendingDown className="w-3.5 h-3.5 mr-1" />
              {change}
            </span>
          )}
          <span className="text-slate-400">vs last period</span>
        </div>
      )}
    </div>
  );
};
