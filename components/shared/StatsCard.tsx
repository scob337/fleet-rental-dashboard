import { LucideIcon } from 'lucide-react';
import { TrendingUp, TrendingDown } from 'lucide-react';

interface StatsCardProps {
  title: string;
  value: string | number;
  icon: LucideIcon;
  color?: 'blue' | 'green' | 'orange' | 'red' | 'purple' | 'teal';
  trend?: number; // percentage change
  subtitle?: string;
  loading?: boolean;
}

const colorConfig = {
  blue:   { bg: 'bg-blue-500/10',   icon: 'text-blue-500',   border: 'border-blue-500/20' },
  green:  { bg: 'bg-green-500/10',  icon: 'text-green-500',  border: 'border-green-500/20' },
  orange: { bg: 'bg-orange-500/10', icon: 'text-orange-500', border: 'border-orange-500/20' },
  red:    { bg: 'bg-red-500/10',    icon: 'text-red-500',    border: 'border-red-500/20' },
  purple: { bg: 'bg-purple-500/10', icon: 'text-purple-500', border: 'border-purple-500/20' },
  teal:   { bg: 'bg-teal-500/10',   icon: 'text-teal-500',   border: 'border-teal-500/20' },
};

export default function StatsCard({
  title,
  value,
  icon: Icon,
  color = 'blue',
  trend,
  subtitle,
  loading = false,
}: StatsCardProps) {
  const colors = colorConfig[color];

  if (loading) {
    return (
      <div className="bg-card border border-border rounded-2xl p-5 card-shadow">
        <div className="flex items-center justify-between mb-4">
          <div className="skeleton h-4 w-24 rounded" />
          <div className="skeleton h-10 w-10 rounded-xl" />
        </div>
        <div className="skeleton h-8 w-32 rounded mb-2" />
        <div className="skeleton h-3 w-20 rounded" />
      </div>
    );
  }

  return (
    <div className={`bg-card border ${colors.border} rounded-2xl p-5 card-shadow stat-card-glow cursor-default
      transition-all duration-300 hover:-translate-y-0.5 hover:shadow-lg group`}>
      {/* Header row */}
      <div className="flex items-center justify-between mb-4">
        <p className="text-sm font-medium text-muted-foreground">{title}</p>
        <div className={`${colors.bg} p-2.5 rounded-xl transition-transform duration-300 group-hover:scale-110`}>
          <Icon size={20} className={colors.icon} />
        </div>
      </div>

      {/* Value */}
      <p className="text-3xl font-black text-foreground mb-1 tabular-nums">
        {value}
      </p>

      {/* Trend + subtitle */}
      <div className="flex items-center gap-2 mt-1">
        {trend !== undefined && (
          <div className={`flex items-center gap-1 text-xs font-semibold
            ${trend >= 0 ? 'text-green-500' : 'text-red-500'}`}>
            {trend >= 0 ? <TrendingUp size={12} /> : <TrendingDown size={12} />}
            <span>{Math.abs(trend)}%</span>
          </div>
        )}
        {subtitle && (
          <p className="text-xs text-muted-foreground">{subtitle}</p>
        )}
      </div>
    </div>
  );
}
