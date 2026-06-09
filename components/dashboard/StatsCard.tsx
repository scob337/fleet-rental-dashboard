'use client';

import { TrendingUp, TrendingDown } from 'lucide-react';

interface StatsCardProps {
  title: string;
  value: string | number;
  change: string;
  icon: string;
  trend?: 'up' | 'down';
}

export default function StatsCard({
  title,
  value,
  change,
  icon,
  trend = 'up',
}: StatsCardProps) {
  const isPositive = trend === 'up' && !change.includes('-');

  return (
    <div className="bg-card p-6 rounded-lg border border-border hover:shadow-lg transition-shadow">
      <div className="flex items-start justify-between mb-4">
        <div>
          <p className="text-muted-foreground text-sm font-medium">{title}</p>
          <p className="text-2xl font-bold mt-2">{value}</p>
        </div>
        <span className="text-3xl">{icon}</span>
      </div>
      <div className="flex items-center gap-2">
        {isPositive ? (
          <TrendingUp size={16} className="text-green-600" />
        ) : (
          <TrendingDown size={16} className="text-red-600" />
        )}
        <span className={isPositive ? 'text-green-600 text-sm' : 'text-red-600 text-sm'}>
          {change}
        </span>
        <span className="text-muted-foreground text-sm">vs last month</span>
      </div>
    </div>
  );
}
