'use client';

import { LucideIcon } from 'lucide-react';
import { cn } from '@/lib/utils';

interface KpiCardProps {
  title: string;
  value: string | number;
  icon: LucideIcon;
  trend?: { value: number; positive: boolean };
  subtitle?: string;
  className?: string;
}

export default function KpiCard({ title, value, icon: Icon, trend, subtitle, className }: KpiCardProps) {
  return (
    <div className={cn('kpi-card', className)}>
      <div className="flex items-start justify-between">
        <div className="space-y-2">
          <p className="text-sm font-medium text-gray-500 dark:text-gray-400">{title}</p>
          <p className="text-3xl font-bold">{value}</p>
          {trend && (
            <p className={cn('text-sm', trend.positive ? 'text-green-600' : 'text-red-600')}>
              {trend.positive ? '+' : ''}{trend.value}% from last month
            </p>
          )}
          {subtitle && <p className="text-xs text-gray-400">{subtitle}</p>}
        </div>
        <div className="p-3 rounded-lg bg-blue-50 dark:bg-blue-900/20">
          <Icon className="h-6 w-6 text-blue-600 dark:text-blue-400" />
        </div>
      </div>
    </div>
  );
}
