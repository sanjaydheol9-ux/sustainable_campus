import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Filter, Check, ChevronDown, ChevronUp, FileCode2, Clock, CheckCircle2 } from 'lucide-react';
import { StatusBadge } from '@/components/StatusBadge';
import { acknowledgeAlert } from '@/api/client';
import { useToast } from '@/components/Toast';
import { formatRelativeTime } from '@/lib/utils';
import type { Alert, AlertSeverity } from '@/types';

interface AlertsListProps {
  alerts: Alert[];
  onAlertUpdated: () => void;
  loading?: boolean;
}

export function AlertsList({ alerts, onAlertUpdated, loading = false }: AlertsListProps) {
  const { toast } = useToast();
  const [filter, setFilter] = useState<string>('all');
  const [expandedAlertId, setExpandedAlertId] = useState<number | null>(null);
  const [acknowledgingId, setAcknowledgingId] = useState<number | null>(null);

  const filteredAlerts = alerts.filter(a => {
    if (filter === 'all') return true;
    if (filter === 'open') return a.status === 'open';
    if (filter === 'acknowledged') return a.status === 'acknowledged';
    return a.severity === filter;
  });

  const handleAcknowledge = async (id: number, e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      setAcknowledgingId(id);
      await acknowledgeAlert(id);
      toast(`Alert #${id} acknowledged and logged for maintenance review`, 'success');
      onAlertUpdated();
    } catch {
      toast('Failed to acknowledge alert', 'error');
    } finally {
      setAcknowledgingId(null);
    }
  };

  const toggleEvidence = (id: number) => {
    setExpandedAlertId(prev => (prev === id ? null : id));
  };

  return (
    <div className="rounded-xl border border-[var(--border)] bg-[var(--surface)] p-4 flex flex-col h-full">
      {/* Header and Filter Pill Tabs */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-[var(--border)]">
        <div className="flex items-center gap-2">
          <span className="font-semibold text-sm text-[var(--text-primary)]">
            Active Alerts & Observations
          </span>
          <span className="px-2 py-0.5 rounded-full text-[11px] font-mono bg-[var(--border)]/50 text-[var(--text-secondary)]">
            {filteredAlerts.length}
          </span>
        </div>

        {/* Severity Filter */}
        <div className="flex items-center gap-1 overflow-x-auto pb-1 sm:pb-0">
          <Filter className="w-3 h-3 text-[var(--text-secondary)] mr-1 shrink-0" />
          {[
            { id: 'all', label: 'All' },
            { id: 'critical', label: 'Critical' },
            { id: 'watch', label: 'Watch' },
            { id: 'open', label: 'Open' },
            { id: 'acknowledged', label: 'Acked' },
          ].map(tab => (
            <button
              key={tab.id}
              type="button"
              onClick={() => setFilter(tab.id)}
              className={`px-2 py-1 rounded text-[11px] font-medium transition-colors ${
                filter === tab.id
                  ? 'bg-[var(--color-accent)] text-white'
                  : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--border)]/30'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Alert Feed List */}
      <div className="flex-1 overflow-y-auto mt-3 space-y-2.5 pr-1 min-h-[220px]">
        {loading ? (
          <div className="py-8 text-center text-xs text-[var(--text-secondary)]">
            Loading alerts...
          </div>
        ) : filteredAlerts.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <CheckCircle2 className="w-8 h-8 text-[var(--color-healthy)] mb-2 opacity-80" />
            <p className="text-sm font-medium text-[var(--text-primary)]">No alerts currently</p>
            <p className="text-xs text-[var(--text-secondary)] mt-1 max-w-xs">
              All monitored zones operate within normative baselines.
            </p>
          </div>
        ) : (
          <AnimatePresence mode="popLayout">
            {filteredAlerts.map(alert => {
              const isExpanded = expandedAlertId === alert.id;
              const isAcknowledged = alert.status === 'acknowledged';

              return (
                <motion.div
                  key={alert.id}
                  layout
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.98 }}
                  transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
                  className={`rounded-lg border transition-colors ${
                    isAcknowledged
                      ? 'border-[var(--border)] bg-[var(--surface)] opacity-70'
                      : 'border-[var(--border)] bg-[var(--surface)] hover:border-[var(--color-accent)]/50'
                  }`}
                >
                  <div
                    onClick={() => toggleEvidence(alert.id)}
                    className="p-3 cursor-pointer select-none"
                    role="button"
                    tabIndex={0}
                    onKeyDown={e => {
                      if (e.key === 'Enter' || e.key === ' ') {
                        e.preventDefault();
                        toggleEvidence(alert.id);
                      }
                    }}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-start gap-2.5 min-w-0">
                        <StatusBadge severity={alert.severity} size="sm" />
                        <div className="min-w-0">
                          <p className="text-xs font-semibold text-[var(--text-primary)] leading-tight truncate">
                            {alert.title}
                          </p>
                          <p className="text-[11px] text-[var(--text-secondary)] mt-1 line-clamp-2">
                            {alert.description}
                          </p>
                        </div>
                      </div>

                      {/* Ack button & expand indicator */}
                      <div className="flex items-center gap-1.5 shrink-0">
                        {!isAcknowledged ? (
                          <button
                            type="button"
                            onClick={e => handleAcknowledge(alert.id, e)}
                            disabled={acknowledgingId === alert.id}
                            className="inline-flex items-center gap-1 px-2 py-1 rounded text-[11px] font-medium border border-[var(--border)] bg-[var(--border)]/20 hover:bg-[var(--color-accent)] hover:text-white transition-colors disabled:opacity-50"
                            title="Acknowledge alert"
                          >
                            <Check className="w-3 h-3" />
                            <span className="hidden sm:inline">Acknowledge</span>
                          </button>
                        ) : (
                          <span className="text-[10px] font-mono font-medium px-1.5 py-0.5 rounded bg-[var(--color-healthy)]/15 text-[var(--color-healthy)]">
                            Acknowledged
                          </span>
                        )}

                        <button
                          type="button"
                          className="p-1 text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors"
                          aria-label={isExpanded ? 'Collapse evidence' : 'Expand evidence'}
                        >
                          {isExpanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                        </button>
                      </div>
                    </div>

                    {/* Metadata line */}
                    <div className="mt-2.5 pt-2 border-t border-[var(--border)]/40 flex items-center justify-between text-[11px] font-mono text-[var(--text-secondary)]">
                      <div className="flex items-center gap-3">
                        <span className="flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          {formatRelativeTime(alert.created_at)}
                        </span>
                        <span>ID: #{alert.id}</span>
                        <span>Type: {alert.type}</span>
                      </div>
                      <span className="text-[10px] uppercase text-[var(--color-accent)] font-semibold">
                        Rule triggered
                      </span>
                    </div>
                  </div>

                  {/* Expanded evidence JSON & logic breakdown */}
                  {isExpanded && (
                    <div className="px-3 pb-3 pt-1 border-t border-[var(--border)]/60 bg-[var(--border)]/10 text-xs">
                      <div className="flex items-center gap-1.5 text-[11px] font-mono text-[var(--text-secondary)] mb-1.5">
                        <FileCode2 className="w-3 h-3 text-[var(--color-accent)]" />
                        <span>Rule Engine Evidence</span>
                      </div>
                      <div className="rounded p-2 bg-[var(--color-ink)] text-[#E8ECF2] font-mono text-[11px] overflow-x-auto">
                        <pre className="whitespace-pre-wrap">
                          {JSON.stringify(
                            alert.evidence_json || {
                              signal: alert.type,
                              zone_id: alert.zone_id,
                              severity: alert.severity,
                              rule: 'Deterministic threshold anomaly verification',
                              threshold_evaluation: 'Sensor deviation > 2.5 sigma from baseline',
                              timestamp: alert.created_at,
                            },
                            null,
                            2
                          )}
                        </pre>
                      </div>
                    </div>
                  )}
                </motion.div>
              );
            })}
          </AnimatePresence>
        )}
      </div>
    </div>
  );
}
