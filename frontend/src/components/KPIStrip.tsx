// ========================================
// KPIStrip — Top-level metric cards
// ========================================

import { useEffect, useRef, useState } from 'react';
import { motion } from 'motion/react';
import { AlertTriangle, AlertCircle, Zap, Droplets, MapPin } from 'lucide-react';
import { cn, formatNumber, prefersReducedMotion } from '@/lib/utils';
import { Skeleton } from '@/components/Skeleton';
import type { OverviewData } from '@/types';

interface KPIStripProps {
  data: OverviewData | null;
  loading: boolean;
}

interface KPICardProps {
  label: string;
  value: number;
  unit: string;
  icon: React.ReactNode;
  decimals?: number;
  delay?: number;
}

/** Animated counter that counts up on mount/change */
function AnimatedNumber({ value, decimals = 0, duration = 800 }: { value: number; decimals?: number; duration?: number }) {
  const [display, setDisplay] = useState(0);
  const rafRef = useRef<number>(0);
  const startRef = useRef(0);
  const fromRef = useRef(0);
  const reduced = prefersReducedMotion();

  useEffect(() => {
    if (reduced) {
      setDisplay(value);
      return;
    }
    fromRef.current = display;
    startRef.current = performance.now();

    function tick(now: number) {
      const elapsed = now - startRef.current;
      const progress = Math.min(elapsed / duration, 1);
      // ease out expo
      const eased = progress === 1 ? 1 : 1 - Math.pow(2, -10 * progress);
      setDisplay(fromRef.current + (value - fromRef.current) * eased);
      if (progress < 1) {
        rafRef.current = requestAnimationFrame(tick);
      }
    }

    rafRef.current = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(rafRef.current);
  }, [value]);

  return (
    <span className="font-mono tabular-nums">
      {formatNumber(display, decimals)}
    </span>
  );
}

function KPICard({ label, value, unit, icon, decimals = 0, delay = 0 }: KPICardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay, ease: [0.22, 1, 0.36, 1] }}
      className={cn(
        'flex items-start gap-3 rounded-xl border border-[var(--border)] px-4 py-3.5',
        'bg-[var(--surface)]'
      )}
    >
      <div className="mt-0.5 text-[var(--text-secondary)]">{icon}</div>
      <div className="flex-1 min-w-0">
        <p className="text-[12px] text-[var(--text-secondary)] font-medium mb-0.5 uppercase tracking-wider">
          {label}
        </p>
        <p className="text-[28px] font-semibold leading-none text-[var(--text-primary)]">
          <AnimatedNumber value={value} decimals={decimals} />
          <span className="text-[14px] font-normal text-[var(--text-secondary)] ml-1.5 font-mono">
            {unit}
          </span>
        </p>
      </div>
    </motion.div>
  );
}

export function KPIStrip({ data, loading }: KPIStripProps) {
  if (loading || !data) {
    return (
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3">
        {Array.from({ length: 5 }).map((_, i) => (
          <Skeleton key={i} className="h-[88px] rounded-xl" />
        ))}
      </div>
    );
  }

  const kpis = data.kpis;

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3">
      <KPICard
        label="Open Alerts"
        value={kpis.open_alerts}
        unit="alerts"
        icon={<AlertTriangle size={18} />}
        delay={0}
      />
      <KPICard
        label="Critical"
        value={kpis.critical_alerts}
        unit="issues"
        icon={<AlertCircle size={18} />}
        delay={0.05}
      />
      <KPICard
        label="Energy"
        value={kpis.energy_kw_total}
        unit="kW"
        icon={<Zap size={18} />}
        decimals={1}
        delay={0.1}
      />
      <KPICard
        label="Water"
        value={kpis.water_lpm_total}
        unit="L/min"
        icon={<Droplets size={18} />}
        decimals={1}
        delay={0.15}
      />
      <KPICard
        label="Zones"
        value={kpis.zones_monitored}
        unit="monitored"
        icon={<MapPin size={18} />}
        delay={0.2}
      />
    </div>
  );
}
