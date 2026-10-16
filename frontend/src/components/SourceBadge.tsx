// ========================================
// SourceBadge — Shows data source type
// ========================================

import { cn } from '@/lib/utils';
import type { DataSource } from '@/types';

const sourceConfig: Record<DataSource, { label: string; className: string }> = {
  simulated: {
    label: 'Simulated',
    className: 'bg-[var(--color-watch)]/10 text-[var(--color-watch)]',
  },
  sensor: {
    label: 'Sensor',
    className: 'bg-[var(--color-healthy)]/10 text-[var(--color-healthy)]',
  },
  manual: {
    label: 'Manual',
    className: 'bg-[var(--color-unknown)]/10 text-[var(--color-unknown)]',
  },
  vision: {
    label: 'Vision',
    className: 'bg-[var(--color-accent)]/10 text-[var(--color-accent)]',
  },
  sample: {
    label: 'Sample',
    className: 'bg-[var(--color-unknown)]/10 text-[var(--color-unknown)]',
  },
};

export function SourceBadge({ source, className }: { source: DataSource; className?: string }) {
  const config = sourceConfig[source] || sourceConfig.simulated;
  return (
    <span
      className={cn(
        'inline-flex items-center rounded px-1.5 py-0.5 text-[11px] font-medium font-mono tracking-wide uppercase',
        config.className,
        className
      )}
    >
      {config.label}
    </span>
  );
}
