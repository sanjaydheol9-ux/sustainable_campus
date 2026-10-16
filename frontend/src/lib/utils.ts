// ========================================
// Utility Functions — Sustainable Campus
// ========================================

import type { ZoneStatus, AlertSeverity, MetricKey } from '@/types';

/** Merge class names, filtering falsy values */
export function cn(...classes: (string | false | null | undefined)[]): string {
  return classes.filter(Boolean).join(' ');
}

/** Format a number with locale-aware separators */
export function formatNumber(value: number, decimals = 1): string {
  return value.toLocaleString('en-IN', {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  });
}

/** Format a timestamp to a readable string */
export function formatTime(iso: string): string {
  const date = new Date(iso);
  return date.toLocaleTimeString('en-IN', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: true,
  });
}

/** Format a date to a readable string */
export function formatDate(iso: string): string {
  const date = new Date(iso);
  return date.toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
}

/** Format a relative time (e.g., "2 hours ago") */
export function formatRelativeTime(iso: string): string {
  const now = Date.now();
  const then = new Date(iso).getTime();
  const diff = now - then;
  const minutes = Math.floor(diff / 60_000);
  if (minutes < 1) return 'just now';
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  return `${days}d ago`;
}

/** Status color mappings (Tailwind classes) */
export const statusColors: Record<ZoneStatus, { bg: string; text: string; dot: string; border: string }> = {
  healthy: {
    bg: 'bg-[var(--color-healthy)]/10',
    text: 'text-[var(--color-healthy)]',
    dot: 'bg-[var(--color-healthy)]',
    border: 'border-[var(--color-healthy)]',
  },
  watch: {
    bg: 'bg-[var(--color-watch)]/10',
    text: 'text-[var(--color-watch)]',
    dot: 'bg-[var(--color-watch)]',
    border: 'border-[var(--color-watch)]',
  },
  critical: {
    bg: 'bg-[var(--color-critical)]/10',
    text: 'text-[var(--color-critical)]',
    dot: 'bg-[var(--color-critical)]',
    border: 'border-[var(--color-critical)]',
  },
  unknown: {
    bg: 'bg-[var(--color-unknown)]/10',
    text: 'text-[var(--color-unknown)]',
    dot: 'bg-[var(--color-unknown)]',
    border: 'border-[var(--color-unknown)]',
  },
};

/** Severity to status mapping */
export const severityColors: Record<AlertSeverity, typeof statusColors.healthy> = {
  critical: statusColors.critical,
  watch: statusColors.watch,
  info: statusColors.unknown,
};

/** Status labels for display */
export const statusLabels: Record<ZoneStatus, string> = {
  healthy: 'Healthy',
  watch: 'Watch',
  critical: 'Critical',
  unknown: 'Unknown',
};

/** Metric display labels and units */
export const metricMeta: Record<MetricKey, { label: string; unit: string; icon: string }> = {
  energy_kw: { label: 'Energy', unit: 'kW', icon: 'Zap' },
  water_lpm: { label: 'Water', unit: 'L/min', icon: 'Droplets' },
  occupancy_count: { label: 'Occupancy', unit: 'people', icon: 'Users' },
  waste_level_pct: { label: 'Waste Level', unit: '%', icon: 'Trash2' },
};

/** Framer Motion animation presets */
export const motionPresets = {
  /** Standard easing for all animations */
  ease: [0.22, 1, 0.36, 1] as [number, number, number, number],

  /** Fade up animation for sections */
  fadeUp: {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.5, ease: [0.22, 1, 0.36, 1] },
  },

  /** Stagger children animation */
  stagger: (staggerChildren = 0.08) => ({
    animate: { transition: { staggerChildren } },
  }),

  /** Card hover lift */
  cardHover: {
    whileHover: { y: -4, transition: { duration: 0.2, ease: [0.22, 1, 0.36, 1] } },
  },

  /** Panel slide transition */
  panelSlide: {
    initial: { opacity: 0, x: 8 },
    animate: { opacity: 1, x: 0 },
    exit: { opacity: 0, x: -8 },
    transition: { duration: 0.3, ease: [0.22, 1, 0.36, 1] },
  },

  /** Scale on hover for zone tiles */
  zoneHover: {
    whileHover: { scale: 1.02, transition: { duration: 0.2 } },
  },
} as const;

/** Check if user prefers reduced motion */
export function prefersReducedMotion(): boolean {
  if (typeof window === 'undefined') return false;
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
}
