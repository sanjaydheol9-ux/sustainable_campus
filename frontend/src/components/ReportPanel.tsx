import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FileText, Download, Printer, ExternalLink, ShieldAlert, Sparkles, CheckCircle2 } from 'lucide-react';
import { fetchReport } from '@/api/client';
import { ThinkingDots } from '@/components/Skeleton';
import { useToast } from '@/components/Toast';
import type { ReportResponse } from '@/types';

interface ReportPanelProps {
  initialReport?: ReportResponse | null;
}

export function ReportPanel({ initialReport }: ReportPanelProps) {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [report, setReport] = useState<ReportResponse | null>(initialReport || null);
  const [loading, setLoading] = useState(false);

  const handleGenerate = async () => {
    try {
      setLoading(true);
      const res = await fetchReport();
      setReport(res);
      toast('Sustainability Audit Report compiled with latest snapshot', 'success');
    } catch {
      toast('Failed to compile sustainability report', 'error');
    } finally {
      setLoading(false);
    }
  };

  const exportJSON = () => {
    if (!report) return;
    const blob = new Blob([JSON.stringify(report, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `sustainability-report-${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);
    toast('JSON report exported', 'info');
  };

  const exportMarkdown = () => {
    if (!report) return;
    const md = `# ${report.report_title}
Generated: ${new Date().toLocaleString()}
Period: ${new Date(report.period_start).toLocaleDateString()} to ${new Date(report.period_end).toLocaleDateString()}
Snapshot ID: ${report.source_snapshot_id}

## Executive Summary
${report.executive_summary}

## Key Findings
${report.key_findings.map(f => `- ${f}`).join('\n')}

## Priority Actions
${report.priority_actions.map((a: any) => `- **${a.action}** [Priority: ${a.priority}] - Saving: ${a.estimated_saving}`).join('\n')}

## Impact Estimates (Simulated)
${report.impact_estimates.map((i: any) => `- **${i.metric}**: ${i.value} (${i.status})`).join('\n')}

## Data Limitations & Integrity Notice
${report.data_limitations.map(l => `- ${l}`).join('\n')}

---
*Advisory only. This system recommends actions; people review and execute them.*
`;
    const blob = new Blob([md], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `sustainability-report-${Date.now()}.md`;
    a.click();
    URL.revokeObjectURL(url);
    toast('Markdown report exported', 'info');
  };

  return (
    <div className="rounded-xl border border-[var(--border)] bg-[var(--surface)] p-4 flex flex-col h-full">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-[var(--border)]">
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded-md bg-[var(--color-healthy)]/15 flex items-center justify-center text-[var(--color-healthy)]">
            <FileText className="w-3.5 h-3.5" />
          </div>
          <div>
            <h3 className="font-semibold text-sm text-[var(--text-primary)]">
              Sustainability Report
            </h3>
            <p className="text-[11px] text-[var(--text-secondary)]">
              Executive audit report with quantified impact
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {report && (
            <div className="flex items-center gap-1.5">
              <button
                type="button"
                onClick={exportMarkdown}
                className="px-2 py-1 rounded text-[11px] font-medium border border-[var(--border)] hover:bg-[var(--border)]/30 text-[var(--text-primary)] transition-colors inline-flex items-center gap-1"
                title="Export as Markdown"
              >
                <Download className="w-3 h-3" />
                <span>MD</span>
              </button>
              <button
                type="button"
                onClick={exportJSON}
                className="px-2 py-1 rounded text-[11px] font-medium border border-[var(--border)] hover:bg-[var(--border)]/30 text-[var(--text-primary)] transition-colors inline-flex items-center gap-1"
                title="Export as JSON"
              >
                <Download className="w-3 h-3" />
                <span>JSON</span>
              </button>
              <button
                type="button"
                onClick={() => navigate('/app/report/active')}
                className="px-2.5 py-1 rounded text-[11px] font-medium border border-[var(--color-accent)] text-[var(--color-accent)] hover:bg-[var(--color-accent)] hover:text-white transition-colors inline-flex items-center gap-1"
                title="Open Printable Document"
              >
                <Printer className="w-3 h-3" />
                <span>Print View</span>
              </button>
            </div>
          )}

          <button
            type="button"
            onClick={handleGenerate}
            disabled={loading}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[var(--color-accent)] hover:bg-[var(--color-accent-hover)] text-white text-xs font-semibold shadow-xs transition-colors disabled:opacity-50"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>{loading ? 'Compiling...' : 'Generate Report'}</span>
          </button>
        </div>
      </div>

      {/* Report Content */}
      <div className="flex-1 overflow-y-auto mt-3 space-y-3.5 pr-1 text-xs">
        {loading ? (
          <div className="py-12 flex flex-col items-center justify-center text-center">
            <ThinkingDots />
            <p className="text-xs font-mono text-[var(--text-secondary)] mt-3">
              Compiling multi-source telemetry snapshot...
            </p>
          </div>
        ) : !report ? (
          <div className="py-12 flex flex-col items-center justify-center text-center">
            <FileText className="w-8 h-8 text-[var(--text-secondary)] opacity-40 mb-2" />
            <p className="text-xs font-medium text-[var(--text-primary)]">
              No Report Generated Yet
            </p>
            <p className="text-[11px] text-[var(--text-secondary)] mt-1 max-w-xs">
              Generate a printable audit summary with telemetry snapshots, findings, and savings.
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {/* Report Header Metadata */}
            <div className="rounded-lg border border-[var(--border)] p-3 bg-[var(--surface)] flex flex-wrap items-center justify-between gap-2 text-[11px] font-mono text-[var(--text-secondary)]">
              <div>
                <span className="text-[var(--text-primary)] font-bold">{report.report_title}</span>
                <span className="mx-2">·</span>
                <span>ID: {report.source_snapshot_id}</span>
              </div>
              <span className="px-2 py-0.5 rounded bg-[var(--border)]/40 text-[var(--text-secondary)]">
                Audit Window: 7 Days
              </span>
            </div>

            {/* Executive Summary */}
            <div>
              <h4 className="text-[11px] font-semibold uppercase tracking-wider text-[var(--text-secondary)] font-mono mb-1.5">
                Executive Summary
              </h4>
              <p className="text-xs leading-relaxed text-[var(--text-primary)] rounded-lg border border-[var(--border)] p-3 bg-[var(--surface)]">
                {report.executive_summary}
              </p>
            </div>

            {/* Key Findings */}
            <div>
              <h4 className="text-[11px] font-semibold uppercase tracking-wider text-[var(--text-secondary)] font-mono mb-1.5">
                Key Findings
              </h4>
              <div className="rounded-lg border border-[var(--border)] p-3 bg-[var(--surface)] space-y-2">
                {report.key_findings.map((finding, idx) => (
                  <div key={idx} className="flex items-start gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-[var(--color-accent)] mt-1.5 shrink-0" />
                    <span className="text-xs text-[var(--text-primary)] leading-normal">{finding}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Impact Estimates Grid */}
            <div>
              <h4 className="text-[11px] font-semibold uppercase tracking-wider text-[var(--text-secondary)] font-mono mb-1.5">
                Impact Estimates (Simulated Data)
              </h4>
              <div className="grid grid-cols-2 gap-2">
                {report.impact_estimates.map((item: any, idx: number) => (
                  <div
                    key={idx}
                    className="rounded-lg border border-[var(--border)] p-2.5 bg-[var(--surface)]"
                  >
                    <span className="text-[10px] uppercase font-mono text-[var(--text-secondary)] block">
                      {item.metric}
                    </span>
                    <span className="text-sm font-semibold font-mono text-[var(--text-primary)] block mt-0.5">
                      {item.value}
                    </span>
                    <span className="text-[10px] text-[var(--text-secondary)] block mt-0.5 truncate">
                      {item.status}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Data Limitations / Honesty Alert */}
            <div className="rounded-lg border border-[var(--color-watch)]/30 bg-[var(--color-watch)]/10 p-3 text-xs space-y-1.5">
              <div className="flex items-center gap-1.5 font-medium text-[var(--color-watch)]">
                <ShieldAlert className="w-3.5 h-3.5" />
                <span>Data Limitations & Honesty Notice</span>
              </div>
              <ul className="list-disc list-inside space-y-0.5 text-[11px] text-[var(--text-secondary)]">
                {report.data_limitations.map((lim, idx) => (
                  <li key={idx}>{lim}</li>
                ))}
              </ul>
            </div>
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="pt-2 mt-2 border-t border-[var(--border)]/40 text-[10px] font-mono text-[var(--text-secondary)] text-center">
        Advisory only. This system recommends actions; people review and execute them.
      </div>
    </div>
  );
}
