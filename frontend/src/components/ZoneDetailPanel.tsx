// ========================================
// ZoneDetailPanel — Right panel showing zone readings, charts, and alerts
// ========================================

import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Zap, Droplets, Users, Trash2 } from 'lucide-react';
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer,
} from 'recharts';
import { cn, formatNumber, formatTime, formatRelativeTime, metricMeta } from '@/lib/utils';
import { StatusBadge } from '@/components/StatusBadge';
import { SourceBadge } from '@/components/SourceBadge';
import { Skeleton, SkeletonCard } from '@/components/Skeleton';
import { fetchZoneDetail, fetchTelemetry } from '@/api/client';
import type { ZoneDetail, SensorReading, MetricKey } from '@/types';

interface ZoneDetailPanelProps {
  zoneId: number | null;
  onClose: () => void;
}

const metricIcons: Record<string, React.ReactNode> = {
  energy_kw: <Zap size={16} />,
  water_lpm: <Droplets size={16} />,
  occupancy_count: <Users size={16} />,
  waste_level_pct: <Trash2 size={16} />,
};

const chartColors: Record<string, string> = {
  energy_kw: '#2F6F73',
  water_lpm: '#5E8C6A',
  occupancy_count: '#B88A3B',
  waste_level_pct: '#A8483F',
};

function ReadingCard({ reading }: { reading: SensorReading }) {
  const meta = metricMeta[reading.metric as MetricKey];
  const icon = metricIcons[reading.metric];

  return (
    <div className="flex items-center gap-3 rounded-lg border border-[var(--border)] p-3 bg-[var(--surface)]">
      <div className="text-[var(--text-secondary)]">{icon}</div>
      <div className="flex-1 min-w-0">
        <p className="text-[12px] text-[var(--text-secondary)] font-medium">
          {meta?.label || reading.metric}
        </p>
        <p className="text-[20px] font-semibold text-[var(--text-primary)] font-mono tabular-nums leading-tight">
          {formatNumber(reading.value, reading.metric === 'occupancy_count' ? 0 : 1)}
          <span className="text-[12px] font-normal text-[var(--text-secondary)] ml-1">
            {reading.unit}
          </span>
        </p>
      </div>
      <div className="flex flex-col items-end gap-1">
        <SourceBadge source={reading.source} />
        <span className="text-[11px] text-[var(--text-secondary)] font-mono">
          {formatRelativeTime(reading.timestamp)}
        </span>
      </div>
    </div>
  );
}

function MiniTrendChart({ zoneId, metric }: { zoneId: number; metric: string }) {
  const [data, setData] = useState<SensorReading[]>([]);
  const [loading, setLoading] = useState(true);
  const meta = metricMeta[metric as MetricKey];

  useEffect(() => {
    setLoading(true);
    fetchTelemetry({ zone_id: zoneId, metric, limit: 24 })
      .then(res => {
        setData(res.readings.reverse());
      })
      .finally(() => setLoading(false));
  }, [zoneId, metric]);

  if (loading) {
    return <Skeleton className="h-[160px] w-full rounded-lg" />;
  }

  if (data.length === 0) {
    return (
      <div className="flex items-center justify-center h-[160px] text-[var(--text-secondary)] text-[13px]">
        No telemetry data available
      </div>
    );
  }

  const chartData = data.map(d => ({
    time: formatTime(d.timestamp),
    value: d.value,
  }));

  return (
    <div className="h-[180px]">
      <div className="flex items-center justify-between mb-2">
        <span className="text-[12px] text-[var(--text-secondary)] font-medium">
          {meta?.label} trend
        </span>
        <span className="text-[11px] text-[var(--text-secondary)] font-mono">
          Last 6 hours
        </span>
      </div>
      <ResponsiveContainer width="100%" height={150}>
        <LineChart data={chartData} margin={{ top: 4, right: 8, bottom: 4, left: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
          <XAxis
            dataKey="time"
            tick={{ fontSize: 10, fontFamily: 'var(--font-mono)', fill: 'var(--text-secondary)' }}
            axisLine={{ stroke: 'var(--border)' }}
            tickLine={false}
            interval="preserveStartEnd"
          />
          <YAxis
            tick={{ fontSize: 10, fontFamily: 'var(--font-mono)', fill: 'var(--text-secondary)' }}
            axisLine={false}
            tickLine={false}
            width={36}
            label={{
              value: meta?.unit || '',
              angle: -90,
              position: 'insideLeft',
              style: { fontSize: 10, fill: 'var(--text-secondary)', fontFamily: 'var(--font-mono)' },
            }}
          />
          <Tooltip
            contentStyle={{
              background: 'var(--surface)',
              border: '1px solid var(--border)',
              borderRadius: 8,
              fontSize: 12,
              fontFamily: 'var(--font-mono)',
            }}
            labelStyle={{ color: 'var(--text-secondary)' }}
          />
          <Line
            type="monotone"
            dataKey="value"
            stroke={chartColors[metric] || 'var(--color-accent)'}
            strokeWidth={2}
            dot={false}
            activeDot={{ r: 3, strokeWidth: 0 }}
            animationDuration={800}
            animationEasing="ease-out"
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}

export function ZoneDetailPanel({ zoneId, onClose }: ZoneDetailPanelProps) {
  const [detail, setDetail] = useState<ZoneDetail | null>(null);
  const [loading, setLoading] = useState(false);
  const [selectedMetric, setSelectedMetric] = useState<string>('energy_kw');

  useEffect(() => {
    if (zoneId === null) return;
    setLoading(true);
    fetchZoneDetail(zoneId)
      .then(setDetail)
      .finally(() => setLoading(false));
  }, [zoneId]);

  return (
    <AnimatePresence mode="wait">
      {zoneId !== null && (
        <motion.div
          key={zoneId}
          initial={{ opacity: 0, x: 8 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -8 }}
          transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
          className={cn(
            'rounded-xl border border-[var(--border)] bg-[var(--surface)] overflow-hidden flex flex-col'
          )}
          style={{ maxHeight: 'calc(100vh - 180px)' }}
        >
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b border-[var(--border)]">
            {loading ? (
              <Skeleton className="h-6 w-40" />
            ) : (
              <div className="flex items-center gap-3">
                <h3 className="text-[16px] font-semibold text-[var(--text-primary)]">
                  {detail?.zone.name}
                </h3>
                {detail && <StatusBadge status={detail.zone.status} />}
              </div>
            )}
            <button
              onClick={onClose}
              className="p-1 rounded-md text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--border)]/30 transition-colors"
              aria-label="Close zone details"
            >
              <X size={18} />
            </button>
          </div>

          {/* Scrollable content */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {loading ? (
              <>
                <div className="grid grid-cols-2 gap-2">
                  {Array.from({ length: 4 }).map((_, i) => (
                    <Skeleton key={i} className="h-[72px] rounded-lg" />
                  ))}
                </div>
                <Skeleton className="h-[180px] rounded-lg" />
              </>
            ) : detail ? (
              <>
                {/* Latest readings */}
                <div>
                  <h4 className="text-[12px] font-semibold text-[var(--text-secondary)] uppercase tracking-wider mb-2">
                    Latest Readings
                  </h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {detail.recent_readings.map(r => (
                      <ReadingCard key={r.metric} reading={r} />
                    ))}
                  </div>
                </div>

                {/* Trend chart */}
                <div>
                  <h4 className="text-[12px] font-semibold text-[var(--text-secondary)] uppercase tracking-wider mb-2">
                    Trend
                  </h4>
                  <div className="flex gap-1 mb-3">
                    {['energy_kw', 'water_lpm', 'occupancy_count', 'waste_level_pct'].map(m => (
                      <button
                        key={m}
                        onClick={() => setSelectedMetric(m)}
                        className={cn(
                          'px-2.5 py-1 text-[12px] rounded-md font-medium transition-colors',
                          selectedMetric === m
                            ? 'bg-[var(--color-accent)] text-white'
                            : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--border)]/30'
                        )}
                      >
                        {metricMeta[m as MetricKey]?.label}
                      </button>
                    ))}
                  </div>
                  <MiniTrendChart zoneId={zoneId!} metric={selectedMetric} />
                </div>

                {/* Active alerts */}
                <div>
                  <h4 className="text-[12px] font-semibold text-[var(--text-secondary)] uppercase tracking-wider mb-2">
                    Active Alerts
                  </h4>
                  {detail.active_alerts.length === 0 ? (
                    <p className="text-[13px] text-[var(--text-secondary)] py-4 text-center">
                      No active alerts for this zone.
                    </p>
                  ) : (
                    <div className="space-y-2">
                      {detail.active_alerts.map(alert => (
                        <div
                          key={alert.id}
                          className="rounded-lg border border-[var(--border)] p-3 bg-[var(--surface)]"
                        >
                          <div className="flex items-start gap-2">
                            <StatusBadge severity={alert.severity} size="sm" />
                            <div className="flex-1 min-w-0">
                              <p className="text-[13px] font-medium text-[var(--text-primary)]">
                                {alert.title}
                              </p>
                              <p className="text-[12px] text-[var(--text-secondary)] mt-0.5">
                                {alert.description}
                              </p>
                              <p className="text-[11px] text-[var(--text-secondary)] font-mono mt-1">
                                {formatRelativeTime(alert.created_at)}
                              </p>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </>
            ) : (
              <p className="text-[13px] text-[var(--text-secondary)] py-8 text-center">
                Failed to load zone details.
              </p>
            )}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
