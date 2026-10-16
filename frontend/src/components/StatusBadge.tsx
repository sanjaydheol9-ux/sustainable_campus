// ========================================
// StatusBadge — Shows zone/alert status with color + text
// ========================================

import { cn, statusColors, severityColors, statusLabels } from '@/lib/utils';
import type { ZoneStatus, AlertSeverity } from '@/types';

interface StatusBadgeProps {
  status?: ZoneStatus;
  severity?: AlertSeverity;
  size?: 'sm' | 'md';
  pulse?: boolean;
  className?: string;
}

const severityLabels: Record<AlertSeverity, string> = {
  critical: 'Critical',
  watch: 'Watch',
  info: 'Info',
};

export function StatusBadge({ status, severity, size = 'sm', pulse = false, className }: StatusBadgeProps) {
  const colors = severity ? severityColors[severity] : statusColors[status || 'unknown'];
  const label = severity ? severityLabels[severity] : statusLabels[status || 'unknown'];

  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 rounded-full font-medium',
        size === 'sm' ? 'px-2 py-0.5 text-[12px]' : 'px-2.5 py-1 text-[14px]',
        colors.bg,
        colors.text,
        className
      )}
    >
      <span
        className={cn(
          'inline-block rounded-full',
          size === 'sm' ? 'h-1.5 w-1.5' : 'h-2 w-2',
          colors.dot,
          pulse && status === 'critical' && 'animate-pulse'
        )}
        style={pulse && status === 'critical' ? { animationDuration: '2.5s' } : undefined}
      />
      {label}
    </span>
  );
}
