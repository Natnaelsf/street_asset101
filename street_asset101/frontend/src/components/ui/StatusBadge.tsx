'use client';

import { cn, getStatusColor } from '@/lib/utils';

interface StatusBadgeProps {
  status: string;
  className?: string;
}

export default function StatusBadge({ status, className }: StatusBadgeProps) {
  return (
    <span className={cn('status-badge', getStatusColor(status), className)}>
      {status.replace(/_/g, ' ')}
    </span>
  );
}
