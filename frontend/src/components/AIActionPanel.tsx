import React, { useState } from 'react';
import { Sparkles, Brain, CheckCircle, Clock, Users, ArrowUpRight, ShieldCheck, AlertCircle, HelpCircle } from 'lucide-react';
import { fetchRecommendations } from '@/api/client';
import { ThinkingDots } from '@/components/Skeleton';
import { useToast } from '@/components/Toast';
import type { RecommendationResponse, RecommendationAction } from '@/types';

interface AIActionPanelProps {
  initialRecommendations?: RecommendationResponse | null;
}

export function AIActionPanel({ initialRecommendations }: AIActionPanelProps) {
  const { toast } = useToast();
  const [data, setData] = useState<RecommendationResponse | null>(initialRecommendations || null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleGenerate = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await fetchRecommendations();
      setData(res);
      toast('Action Plan updated with priority dispatch directives', 'info');
    } catch {
      setError('Unable to reach AI synthesis engine. Fallback rules loaded.');
      toast('AI generation timed out; loaded fallback plan', 'warning');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="rounded-xl border border-[var(--border)] bg-[var(--surface)] p-4 flex flex-col h-full">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-[var(--border)]">
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded-md bg-[var(--color-accent)]/15 flex items-center justify-center text-[var(--color-accent)]">
            <Brain className="w-3.5 h-3.5" />
          </div>
          <div>
            <h3 className="font-semibold text-sm text-[var(--text-primary)]">
              Operational Action Plan
            </h3>
            <p className="text-[11px] text-[var(--text-secondary)]">
              Ranked remediation directives with impact bounds
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {data && (
            <span
              className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-mono font-medium ${
                data.fallback_used
                  ? 'bg-[var(--color-watch)]/15 text-[var(--color-watch)] border border-[var(--color-watch)]/30'
                  : 'bg-[var(--color-accent)]/15 text-[var(--color-accent)] border border-[var(--color-accent)]/30'
              }`}
            >
              <ShieldCheck className="w-3 h-3" />
              {data.fallback_used ? 'Rule-based fallback' : 'AI-generated'}
            </span>
          )}

          <button
            type="button"
            onClick={handleGenerate}
            disabled={loading}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[var(--color-accent)] hover:bg-[var(--color-accent-hover)] text-white text-xs font-semibold shadow-xs transition-colors disabled:opacity-50"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>{loading ? 'Synthesizing...' : 'Generate Plan'}</span>
          </button>
        </div>
      </div>

      {/* Main Body */}
      <div className="flex-1 overflow-y-auto mt-3 space-y-3 pr-1">
        {loading ? (
          <div className="py-12 flex flex-col items-center justify-center text-center">
            <ThinkingDots />
            <p className="text-xs font-mono text-[var(--text-secondary)] mt-3">
              Evaluating telemetry discrepancies & building action plan...
            </p>
          </div>
        ) : error ? (
          <div className="rounded-lg border border-[var(--color-critical)]/30 bg-[var(--color-critical)]/10 p-3 text-xs text-[var(--color-critical)] flex items-start gap-2">
            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
            <div>
              <p className="font-medium">{error}</p>
              <button
                type="button"
                onClick={handleGenerate}
                className="underline mt-1 hover:opacity-80"
              >
                Retry generation
              </button>
            </div>
          </div>
        ) : !data || data.actions.length === 0 ? (
          <div className="py-12 flex flex-col items-center justify-center text-center">
            <Brain className="w-8 h-8 text-[var(--text-secondary)] opacity-40 mb-2" />
            <p className="text-xs font-medium text-[var(--text-primary)]">
              No Action Plan Generated Yet
            </p>
            <p className="text-[11px] text-[var(--text-secondary)] mt-1 max-w-xs">
              Click &quot;Generate Plan&quot; to synthesize current alerts into ranked operations.
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {/* Executive Summary */}
            <div className="rounded-lg border border-[var(--border)] bg-[var(--border)]/20 p-3 text-xs leading-relaxed text-[var(--text-primary)]">
              <span className="font-semibold text-[var(--text-secondary)] block text-[10px] uppercase font-mono tracking-wider mb-1">
                Executive Synthesis
              </span>
              {data.summary}
            </div>

            {/* Ranked Actions */}
            {data.actions.map((act, index) => (
              <div
                key={index}
                className="rounded-lg border border-[var(--border)] bg-[var(--surface)] p-3.5 space-y-2 hover:border-[var(--color-accent)]/40 transition-colors"
              >
                {/* Title & Priority */}
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <span className="w-5 h-5 rounded-full bg-[var(--border)] text-[var(--text-primary)] text-[10px] font-mono flex items-center justify-center font-bold">
                      {index + 1}
                    </span>
                    <h4 className="text-xs font-semibold text-[var(--text-primary)]">
                      {act.title}
                    </h4>
                  </div>

                  <span
                    className={`px-2 py-0.5 rounded text-[10px] font-mono uppercase font-bold ${
                      act.priority === 'critical'
                        ? 'bg-[var(--color-critical)]/15 text-[var(--color-critical)]'
                        : act.priority === 'high'
                        ? 'bg-[var(--color-watch)]/15 text-[var(--color-watch)]'
                        : 'bg-[var(--border)] text-[var(--text-secondary)]'
                    }`}
                  >
                    {act.priority}
                  </span>
                </div>

                {/* Recommended Action Description */}
                <p className="text-xs text-[var(--text-secondary)] leading-relaxed">
                  {act.recommended_action}
                </p>

                {/* Logistics Strip */}
                <div className="flex flex-wrap items-center gap-x-4 gap-y-1.5 pt-2 border-t border-[var(--border)]/40 text-[11px] text-[var(--text-secondary)]">
                  <span className="flex items-center gap-1">
                    <Users className="w-3 h-3 text-[var(--color-accent)]" />
                    <span>Owner: </span>
                    <strong className="text-[var(--text-primary)]">{act.owner_team}</strong>
                  </span>
                  <span className="flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    <span>Effort: </span>
                    <strong className="text-[var(--text-primary)]">{act.effort}</strong>
                  </span>
                </div>

                {/* Rationale & Follow-up */}
                <div className="rounded bg-[var(--border)]/20 p-2 text-[11px] space-y-1">
                  <div className="text-[var(--text-secondary)]">
                    <span className="font-semibold text-[var(--text-primary)]">Rationale: </span>
                    {act.rationale}
                  </div>
                  {act.follow_up_check && (
                    <div className="text-[var(--color-accent)] flex items-center gap-1">
                      <CheckCircle className="w-3 h-3 shrink-0" />
                      <span>Check: {act.follow_up_check}</span>
                    </div>
                  )}
                </div>

                {/* Impact Estimate with hoverable assumptions formula */}
                {act.estimated_impact && (
                  <div className="relative group/impact rounded border border-[var(--border)] p-2 bg-[var(--surface)] text-[11px]">
                    <div className="flex items-center justify-between">
                      <span className="font-mono text-[10px] uppercase tracking-wider text-[var(--color-accent)] font-semibold flex items-center gap-1">
                        <ArrowUpRight className="w-3 h-3" />
                        Projected Impact (Estimate)
                      </span>
                      <HelpCircle className="w-3 h-3 text-[var(--text-secondary)] group-hover/impact:text-[var(--color-accent)] cursor-help" />
                    </div>

                    <div className="flex flex-wrap gap-3 mt-1.5 font-mono text-[11px] text-[var(--text-primary)]">
                      {Boolean(act.estimated_impact.energy_saved_kwh) && (
                        <span>
                          {String(act.estimated_impact.energy_saved_kwh)} kWh saved
                        </span>
                      )}
                      {Boolean(act.estimated_impact.water_saved_liters) && (
                        <span>
                          {String(act.estimated_impact.water_saved_liters)} L saved
                        </span>
                      )}
                      {Boolean(act.estimated_impact.cost_saved_inr) && (
                        <span>
                          ₹{String(act.estimated_impact.cost_saved_inr)} saved
                        </span>
                      )}
                      {Boolean(act.estimated_impact.waste_diverted_kg) && (
                        <span>
                          {String(act.estimated_impact.waste_diverted_kg)} kg diverted
                        </span>
                      )}
                    </div>

                    {/* Hover assumptions tooltip */}
                    {Boolean(act.estimated_impact.assumptions) && (
                      <div className="absolute left-0 bottom-full mb-1.5 hidden group-hover/impact:block z-40 w-72 p-2.5 rounded-lg bg-[var(--color-ink)] text-[#E8ECF2] border border-[var(--color-border-dark)] shadow-md text-[10px] leading-relaxed">
                        <strong className="block text-[var(--color-accent-tint)] mb-0.5">
                          Assumptions & Formula
                        </strong>
                        {String(act.estimated_impact.assumptions)}
                      </div>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Honesty Footer */}
      <div className="pt-2 mt-2 border-t border-[var(--border)]/40 text-[10px] font-mono text-[var(--text-secondary)] text-center">
        Advisory only. People review and execute recommended actions.
      </div>
    </div>
  );
}
