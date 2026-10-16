import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Printer, Download, ArrowLeft, ShieldCheck, FileText, CheckCircle2, AlertCircle } from 'lucide-react';
import { fetchReport } from '@/api/client';
import { Navbar } from '@/components/Navbar';
import { useToast } from '@/components/Toast';
import type { ReportResponse } from '@/types';

export function ReportViewPage() {
  const { id } = useParams();
  const { toast } = useToast();
  const [report, setReport] = useState<ReportResponse | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchReport()
      .then(res => setReport(res))
      .catch(() => toast('Loaded baseline report archive', 'info'))
      .finally(() => setLoading(false));
  }, [toast]);

  const handlePrint = () => {
    window.print();
  };

  const exportJSON = () => {
    if (!report) return;
    const blob = new Blob([JSON.stringify(report, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `sustainability-report-${report.source_snapshot_id || 'doc'}.json`;
    a.click();
    URL.revokeObjectURL(url);
    toast('Report JSON exported', 'success');
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
${report.priority_actions.map((a: any) => `- **${a.action}** [Priority: ${a.priority}] - Estimated Saving: ${a.estimated_saving}`).join('\n')}

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
    a.download = `sustainability-report-${report.source_snapshot_id || 'doc'}.md`;
    a.click();
    URL.revokeObjectURL(url);
    toast('Report Markdown exported', 'success');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[var(--bg)] text-[var(--text-primary)] flex items-center justify-center font-mono text-sm">
        Compiling printable document...
      </div>
    );
  }

  if (!report) {
    return (
      <div className="min-h-screen bg-[var(--bg)] text-[var(--text-primary)] flex flex-col items-center justify-center p-6 text-center">
        <AlertCircle className="w-10 h-10 text-[var(--color-critical)] mb-3" />
        <h2 className="text-lg font-semibold">Report Not Found</h2>
        <p className="text-xs text-[var(--text-secondary)] mt-1">
          The requested audit record is not currently available.
        </p>
        <Link
          to="/app"
          className="mt-4 px-4 py-2 rounded-lg bg-[var(--color-accent)] text-white text-xs font-semibold"
        >
          Return to Cockpit
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[var(--bg)] text-[var(--text-primary)] flex flex-col font-sans">
      <div className="no-print">
        <Navbar />
      </div>

      {/* Action Bar (Hidden when printing) */}
      <div className="no-print w-full border-b border-[var(--border)] bg-[var(--surface)] px-4 sm:px-8 py-3 flex items-center justify-between text-xs">
        <Link
          to="/app"
          className="inline-flex items-center gap-1.5 text-[var(--text-secondary)] hover:text-[var(--text-primary)] font-medium transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Operations Cockpit</span>
        </Link>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={exportMarkdown}
            className="px-3 py-1.5 rounded-lg border border-[var(--border)] hover:bg-[var(--border)]/30 font-medium transition-colors inline-flex items-center gap-1.5"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Markdown</span>
          </button>
          <button
            type="button"
            onClick={exportJSON}
            className="px-3 py-1.5 rounded-lg border border-[var(--border)] hover:bg-[var(--border)]/30 font-medium transition-colors inline-flex items-center gap-1.5"
          >
            <Download className="w-3.5 h-3.5" />
            <span>JSON</span>
          </button>
          <button
            type="button"
            onClick={handlePrint}
            className="px-4 py-1.5 rounded-lg bg-[var(--color-accent)] hover:bg-[var(--color-accent-hover)] text-white font-semibold transition-colors inline-flex items-center gap-1.5 shadow-xs"
          >
            <Printer className="w-3.5 h-3.5" />
            <span>Print Document</span>
          </button>
        </div>
      </div>

      {/* Printable Document Container */}
      <main className="flex-1 max-w-[850px] w-full mx-auto p-6 sm:p-12 my-6 bg-[var(--surface)] border border-[var(--border)] rounded-2xl shadow-sm">
        {/* Document Header */}
        <div className="border-b border-[var(--border)] pb-8 mb-8">
          <div className="flex items-center justify-between gap-4 mb-4">
            <div className="flex items-center gap-2 text-xs font-mono text-[var(--color-accent)] font-semibold uppercase tracking-wider">
              <ShieldCheck className="w-4 h-4" />
              <span>Campus Sustainability Audit Document</span>
            </div>
            <span className="font-mono text-xs text-[var(--text-secondary)] px-2.5 py-0.5 rounded bg-[var(--border)]/40">
              Snapshot: {report.source_snapshot_id}
            </span>
          </div>

          <h1
            className="text-3xl sm:text-4xl font-medium tracking-tight text-[var(--text-primary)] leading-tight"
            style={{ fontFamily: 'var(--font-display)' }}
          >
            {report.report_title}
          </h1>

          <div className="mt-4 flex flex-wrap items-center gap-x-6 gap-y-2 text-xs font-mono text-[var(--text-secondary)]">
            <span>
              Period:{' '}
              <strong className="text-[var(--text-primary)]">
                {new Date(report.period_start).toLocaleDateString()} – {new Date(report.period_end).toLocaleDateString()}
              </strong>
            </span>
            <span>
              Compiled:{' '}
              <strong className="text-[var(--text-primary)]">
                {new Date().toLocaleDateString()}
              </strong>
            </span>
            <span>
              Data Mode:{' '}
              <strong className="text-[var(--color-watch)] uppercase">
                Simulated Telemetry
              </strong>
            </span>
          </div>
        </div>

        {/* Executive Summary */}
        <section className="mb-8">
          <h2 className="text-xs uppercase font-mono font-bold tracking-wider text-[var(--text-secondary)] mb-2">
            01 / Executive Summary
          </h2>
          <p className="text-sm leading-relaxed text-[var(--text-primary)] p-4 rounded-xl bg-[var(--border)]/20 border border-[var(--border)]">
            {report.executive_summary}
          </p>
        </section>

        {/* Key Findings */}
        <section className="mb-8">
          <h2 className="text-xs uppercase font-mono font-bold tracking-wider text-[var(--text-secondary)] mb-3">
            02 / Key Findings & Hotspot Diagnostics
          </h2>
          <div className="space-y-2.5">
            {report.key_findings.map((item, i) => (
              <div
                key={i}
                className="flex items-start gap-3 p-3 rounded-lg border border-[var(--border)] bg-[var(--surface)] text-xs text-[var(--text-primary)] leading-relaxed"
              >
                <CheckCircle2 className="w-4 h-4 text-[var(--color-accent)] shrink-0 mt-0.5" />
                <span>{item}</span>
              </div>
            ))}
          </div>
        </section>

        {/* Priority Actions */}
        <section className="mb-8">
          <h2 className="text-xs uppercase font-mono font-bold tracking-wider text-[var(--text-secondary)] mb-3">
            03 / Recommended Remediation Roadmap
          </h2>
          <div className="border border-[var(--border)] rounded-xl overflow-hidden">
            <table className="w-full text-left text-xs">
              <thead className="bg-[var(--border)]/30 border-b border-[var(--border)] font-mono text-[11px] text-[var(--text-secondary)]">
                <tr>
                  <th className="py-2.5 px-3">Action Item</th>
                  <th className="py-2.5 px-3">Priority</th>
                  <th className="py-2.5 px-3">Est. Weekly Saving</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[var(--border)]">
                {report.priority_actions.map((act: any, i: number) => (
                  <tr key={i} className="hover:bg-[var(--border)]/10">
                    <td className="py-3 px-3 font-medium text-[var(--text-primary)]">
                      {act.action}
                    </td>
                    <td className="py-3 px-3 font-mono">
                      <span className="px-2 py-0.5 rounded text-[10px] uppercase font-bold bg-[var(--color-accent)]/10 text-[var(--color-accent)]">
                        {act.priority}
                      </span>
                    </td>
                    <td className="py-3 px-3 font-mono text-[var(--text-secondary)]">
                      {act.estimated_saving}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        {/* Impact Estimates */}
        <section className="mb-8">
          <h2 className="text-xs uppercase font-mono font-bold tracking-wider text-[var(--text-secondary)] mb-3">
            04 / Quantified Impact Bounds (Simulated)
          </h2>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {report.impact_estimates.map((est: any, i: number) => (
              <div
                key={i}
                className="p-3 rounded-xl border border-[var(--border)] bg-[var(--surface)]"
              >
                <span className="text-[10px] font-mono uppercase text-[var(--text-secondary)] block">
                  {est.metric}
                </span>
                <span className="text-lg font-bold font-mono text-[var(--text-primary)] block mt-1">
                  {est.value}
                </span>
                <span className="text-[10px] text-[var(--text-secondary)] block mt-1 truncate">
                  {est.status}
                </span>
              </div>
            ))}
          </div>
        </section>

        {/* Data Limitations */}
        <section className="mb-10 p-4 rounded-xl border border-[var(--color-watch)]/30 bg-[var(--color-watch)]/10 text-xs text-[var(--text-primary)]">
          <h2 className="text-xs uppercase font-mono font-bold tracking-wider text-[var(--color-watch)] mb-2 flex items-center gap-1.5">
            <AlertCircle className="w-3.5 h-3.5" />
            <span>05 / Integrity & Data Limitations Notice</span>
          </h2>
          <ul className="list-disc list-inside space-y-1 text-[11px] text-[var(--text-secondary)] leading-relaxed">
            {report.data_limitations.map((lim, i) => (
              <li key={i}>{lim}</li>
            ))}
          </ul>
        </section>

        {/* Persistent Advisory Line */}
        <div className="border-t border-[var(--border)] pt-6 text-center text-xs font-mono text-[var(--text-secondary)]">
          Advisory only. This system recommends actions; people review and execute them.
        </div>
      </main>
    </div>
  );
}
