import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'motion/react';
import {
  ArrowRight,
  ShieldAlert,
  Zap,
  Droplets,
  Trash2,
  Brain,
  CheckCircle2,
  FileText,
  Eye,
  Sliders,
  Scale,
  Sparkles,
  Layers,
  ChevronRight,
  Info,
} from 'lucide-react';
import { Navbar } from '@/components/Navbar';
import { useTheme } from '@/hooks/useTheme';
import { prefersReducedMotion } from '@/lib/utils';

export function LandingPage() {
  const { setTheme } = useTheme();
  const reduced = prefersReducedMotion();

  // Ensure landing page defaults to light theme as per PRD design system:
  // "default to light for the landing page and dark for the dashboard"
  useEffect(() => {
    const saved = localStorage.getItem('campus-theme');
    if (!saved) {
      setTheme('light');
    }
  }, [setTheme]);

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: reduced ? 0 : 0.08,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: reduced ? 0 : 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.5, ease: [0.22, 1, 0.36, 1] as const },
    },
  };

  return (
    <div className="min-h-screen bg-[var(--bg)] text-[var(--text-primary)] flex flex-col selection:bg-[var(--color-accent-tint)] selection:text-[var(--color-accent)] font-sans">
      <Navbar />

      <main className="flex-1">
        {/* =========================================================================
            1. HERO SECTION
        ========================================================================== */}
        <section className="relative pt-20 pb-20 md:pt-28 md:pb-28 border-b border-[var(--border)] overflow-hidden">
          {/* Subtle background grid pattern */}
          <div
            className="absolute inset-0 pointer-events-none opacity-40"
            style={{
              backgroundImage: 'radial-gradient(var(--border) 1px, transparent 1px)',
              backgroundSize: '24px 24px',
            }}
          />

          <div className="relative max-w-[1280px] mx-auto px-4 sm:px-6">
            <motion.div
              variants={containerVariants}
              initial="hidden"
              animate="visible"
              className="max-w-3xl"
            >
              {/* Product Badge */}
              <motion.div variants={itemVariants} className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-[var(--border)] bg-[var(--surface)] text-xs font-mono text-[var(--color-accent)] mb-6 shadow-xs">
                <span className="w-2 h-2 rounded-full bg-[var(--color-accent)]" />
                <span>Next-Gen Campus Facilities Intelligence</span>
              </motion.div>

              {/* Main Headline in Fraunces */}
              <motion.h1
                variants={itemVariants}
                className="text-4xl sm:text-5xl md:text-6xl font-medium tracking-tight text-[var(--text-primary)] leading-[1.12]"
                style={{ fontFamily: 'var(--font-display)' }}
              >
                A campus operations cockpit that sees, measures, and explains.
              </motion.h1>

              {/* Editorial Subhead */}
              <motion.p
                variants={itemVariants}
                className="mt-6 text-base sm:text-lg text-[var(--text-secondary)] leading-relaxed max-w-2xl"
              >
                Connect optical cameras and building meters into an advisory digital twin.
                Deterministic rule engines catch anomalies in real time, while generative AI
                articulates why they occurred and what your team should do first.
              </motion.p>

              {/* Action Buttons */}
              <motion.div
                variants={itemVariants}
                className="mt-8 flex flex-wrap items-center gap-4"
              >
                <Link
                  to="/app"
                  className="inline-flex items-center gap-2 px-5 py-3 rounded-xl bg-[var(--color-accent)] hover:bg-[var(--color-accent-hover)] text-white text-sm font-semibold shadow-xs transition-all duration-200 group"
                >
                  <span>Launch Operations Cockpit</span>
                  <ArrowRight className="w-4 h-4 transition-transform duration-200 group-hover:translate-x-0.5" />
                </Link>

                <a
                  href="#how-it-works"
                  className="inline-flex items-center gap-2 px-5 py-3 rounded-xl border border-[var(--border)] bg-[var(--surface)] hover:bg-[var(--border)]/30 text-sm font-medium text-[var(--text-primary)] transition-colors"
                >
                  <span>System Architecture</span>
                </a>
              </motion.div>

              {/* Proof statement */}
              <motion.div
                variants={itemVariants}
                className="mt-10 pt-6 border-t border-[var(--border)]/60 flex flex-wrap items-center gap-6 text-xs text-[var(--text-secondary)] font-mono"
              >
                <span>Zero Hallucination Alerting</span>
                <span>•</span>
                <span>Deterministic Safety Rules</span>
                <span>•</span>
                <span>Simulated Data Honesty</span>
              </motion.div>
            </motion.div>
          </div>
        </section>

        {/* =========================================================================
            2. THE PROBLEM SECTION
        ========================================================================== */}
        <section id="problem" className="py-20 border-b border-[var(--border)] bg-[var(--surface)]">
          <div className="max-w-[1280px] mx-auto px-4 sm:px-6">
            <div className="max-w-2xl mb-12">
              <span className="text-xs font-mono uppercase tracking-wider text-[var(--color-accent)] font-semibold">
                01 / Operational Reality
              </span>
              <h2
                className="text-2xl sm:text-3xl md:text-4xl font-medium tracking-tight mt-2 text-[var(--text-primary)]"
                style={{ fontFamily: 'var(--font-display)' }}
              >
                Campuses bleed resources silently between disconnected systems.
              </h2>
              <p className="mt-3 text-sm text-[var(--text-secondary)] leading-relaxed">
                Facilities teams manage dozens of buildings with separate utilities, siloed camera feeds,
                and manual meter rounds. Most waste is discovered weeks later when utility bills arrive.
              </p>
            </div>

            {/* Problem Breakdown Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {[
                {
                  title: 'Unattended Energy In Empty Rooms',
                  description:
                    'Lecture halls and labs routinely run high-capacity HVAC and lighting after hours with zero occupants.',
                  icon: Zap,
                  stat: '30-40%',
                  statLabel: 'typical institutional energy waste after scheduled hours',
                },
                {
                  title: 'Undetected Nighttime Water Leaks',
                  description:
                    'Underground pipe fractures and stuck irrigation valves run for days before maintenance notices surface pooling.',
                  icon: Droplets,
                  stat: '3,000+ L',
                  statLabel: 'average water lost per unaddressed minor commercial fixture leak daily',
                },
                {
                  title: 'Overflowing Waste Receptacles',
                  description:
                    'Fixed pickup schedules mean high-traffic food courts overflow at lunch, causing sanitation and pest hazards.',
                  icon: Trash2,
                  stat: '90%+',
                  statLabel: 'bin saturation before standard facilities dispatch triggers',
                },
              ].map((prob, i) => {
                const Icon = prob.icon;
                return (
                  <motion.div
                    key={i}
                    whileHover={reduced ? undefined : { y: -4 }}
                    transition={{ duration: 0.2, ease: [0.22, 1, 0.36, 1] }}
                    className="rounded-xl border border-[var(--border)] p-6 bg-[var(--bg)] hover:border-[var(--color-accent)]/50 transition-colors"
                  >
                    <div className="w-9 h-9 rounded-lg bg-[var(--color-accent)]/10 text-[var(--color-accent)] flex items-center justify-center mb-4">
                      <Icon className="w-5 h-5" />
                    </div>
                    <h3 className="text-base font-semibold text-[var(--text-primary)]">
                      {prob.title}
                    </h3>
                    <p className="mt-2 text-xs text-[var(--text-secondary)] leading-relaxed">
                      {prob.description}
                    </p>
                    <div className="mt-6 pt-4 border-t border-[var(--border)]/60">
                      <span className="text-xl font-bold font-mono text-[var(--text-primary)]">
                        {prob.stat}
                      </span>
                      <p className="text-[11px] text-[var(--text-secondary)] font-mono mt-0.5">
                        {prob.statLabel}
                      </p>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </div>
        </section>

        {/* =========================================================================
            3. HOW IT WORKS (3 STEPS: DETECT, EXPLAIN, REPORT)
        ========================================================================== */}
        <section id="how-it-works" className="py-20 border-b border-[var(--border)]">
          <div className="max-w-[1280px] mx-auto px-4 sm:px-6">
            <div className="max-w-2xl mb-14">
              <span className="text-xs font-mono uppercase tracking-wider text-[var(--color-accent)] font-semibold">
                02 / Workflow Architecture
              </span>
              <h2
                className="text-2xl sm:text-3xl md:text-4xl font-medium tracking-tight mt-2 text-[var(--text-primary)]"
                style={{ fontFamily: 'var(--font-display)' }}
              >
                Three connected steps from telemetry to executive action.
              </h2>
            </div>

            {/* Visual SVG Connecting Line */}
            <div className="relative">
              <div className="hidden lg:block absolute top-12 left-[15%] right-[15%] h-0.5 z-0">
                <svg className="w-full h-4 overflow-visible" preserveAspectRatio="none">
                  <motion.line
                    x1="0"
                    y1="2"
                    x2="100%"
                    y2="2"
                    stroke="var(--color-accent)"
                    strokeWidth="2"
                    strokeDasharray="6 6"
                    initial={{ pathLength: 0 }}
                    whileInView={{ pathLength: 1 }}
                    viewport={{ once: true }}
                    transition={{ duration: 1.2, ease: [0.22, 1, 0.36, 1] }}
                  />
                </svg>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 relative z-10">
                {[
                  {
                    step: '01',
                    title: 'Detect',
                    subtitle: 'Deterministic Rule Engine + CV',
                    desc: 'Sensors monitor power draw, water flow rates, and waste bin sensors. Pretrained computer vision scans camera frames for puddles, overflowing bins, and empty room occupancy.',
                    badge: 'Zero Hallucinations',
                    icon: Eye,
                  },
                  {
                    step: '02',
                    title: 'Explain',
                    subtitle: 'Generative Operational Synthesis',
                    desc: 'When an anomaly triggers, an LLM synthesizes telemetry context, evaluates likely mechanical causes, and generates ranked dispatch directives complete with effort estimates.',
                    badge: 'Actionable Directives',
                    icon: Brain,
                  },
                  {
                    step: '03',
                    title: 'Report',
                    subtitle: 'One-Click Compliance Auditing',
                    desc: 'Instantly compile multi-zone operational reports formatted for leadership, green campus accreditation (NAAC/LEED), and physical maintenance teams with Markdown and JSON exports.',
                    badge: 'Print Ready',
                    icon: FileText,
                  },
                ].map((s, idx) => {
                  const Icon = s.icon;
                  return (
                    <motion.div
                      key={idx}
                      whileHover={reduced ? undefined : { y: -4 }}
                      transition={{ duration: 0.2, ease: [0.22, 1, 0.36, 1] }}
                      className="rounded-xl border border-[var(--border)] bg-[var(--surface)] p-6 shadow-xs relative"
                    >
                      <div className="flex items-center justify-between mb-4">
                        <span className="w-8 h-8 rounded-lg bg-[var(--color-accent)] text-white text-xs font-mono font-bold flex items-center justify-center">
                          {s.step}
                        </span>
                        <span className="text-[10px] font-mono font-medium px-2 py-0.5 rounded bg-[var(--border)]/40 text-[var(--text-secondary)]">
                          {s.badge}
                        </span>
                      </div>

                      <div className="flex items-center gap-2 mb-1">
                        <Icon className="w-4 h-4 text-[var(--color-accent)]" />
                        <h3 className="text-lg font-semibold text-[var(--text-primary)]">
                          {s.title}
                        </h3>
                      </div>
                      <p className="text-xs font-mono text-[var(--color-accent)] font-medium mb-3">
                        {s.subtitle}
                      </p>
                      <p className="text-xs text-[var(--text-secondary)] leading-relaxed">
                        {s.desc}
                      </p>
                    </motion.div>
                  );
                })}
              </div>
            </div>
          </div>
        </section>

        {/* =========================================================================
            4. HYBRID INTELLIGENCE (RULES DETECT, AI EXPLAINS)
        ========================================================================== */}
        <section id="intelligence" className="py-20 border-b border-[var(--border)] bg-[var(--surface)]">
          <div className="max-w-[1280px] mx-auto px-4 sm:px-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
              <div>
                <span className="text-xs font-mono uppercase tracking-wider text-[var(--color-accent)] font-semibold">
                  03 / Hybrid Intelligence
                </span>
                <h2
                  className="text-2xl sm:text-3xl md:text-4xl font-medium tracking-tight mt-2 text-[var(--text-primary)]"
                  style={{ fontFamily: 'var(--font-display)' }}
                >
                  Deterministic rules catch anomalies. Generative AI explains them.
                </h2>
                <p className="mt-4 text-sm text-[var(--text-secondary)] leading-relaxed">
                  Never let a statistical language model be in charge of safety thresholds.
                  Our rule engine evaluates mathematical telemetry deviations (z-scores and physical constraints)
                  deterministically. The generative model is called strictly to translate confirmed telemetry
                  into actionable work orders.
                </p>

                <div className="mt-6 space-y-3">
                  <div className="flex items-start gap-3 p-3 rounded-lg border border-[var(--border)] bg-[var(--bg)]">
                    <CheckCircle2 className="w-4 h-4 text-[var(--color-healthy)] shrink-0 mt-0.5" />
                    <div>
                      <h4 className="text-xs font-semibold text-[var(--text-primary)]">
                        Deterministic Detection Core
                      </h4>
                      <p className="text-[11px] text-[var(--text-secondary)] mt-0.5">
                        Water flow &gt; baseline after 00:00 triggers an alert without model interpretation. No hallucinations.
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3 p-3 rounded-lg border border-[var(--border)] bg-[var(--bg)]">
                    <Sparkles className="w-4 h-4 text-[var(--color-accent)] shrink-0 mt-0.5" />
                    <div>
                      <h4 className="text-xs font-semibold text-[var(--text-primary)]">
                        Generative Operational Translation
                      </h4>
                      <p className="text-[11px] text-[var(--text-secondary)] mt-0.5">
                        AI drafts owner team dispatch, estimated resolution effort, and mathematical impact assumptions.
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Architecture comparison box */}
              <div className="rounded-xl border border-[var(--border)] p-5 bg-[var(--bg)] shadow-xs">
                <span className="text-[11px] font-mono uppercase text-[var(--text-secondary)] block mb-3 font-semibold">
                  System Architecture Contract
                </span>
                <div className="space-y-3 font-mono text-xs">
                  <div className="p-3 rounded-lg bg-[var(--surface)] border border-[var(--border)]">
                    <span className="text-[var(--color-watch)] font-bold block mb-1">
                      [Layer 1] Hardware & CV Telemetry
                    </span>
                    <span className="text-[11px] text-[var(--text-secondary)]">
                      `occupancy == 0 AND power_kw &gt; threshold` → Flagged Severity: Critical
                    </span>
                  </div>

                  <div className="text-center text-[var(--text-secondary)]">↓</div>

                  <div className="p-3 rounded-lg bg-[var(--surface)] border border-[var(--border)]">
                    <span className="text-[var(--color-accent)] font-bold block mb-1">
                      [Layer 2] LLM Synthesis Directive
                    </span>
                    <span className="text-[11px] text-[var(--text-secondary)]">
                      &quot;Turn off Academic Block A HVAC. Owner: Facilities (15m effort). Estimated saving: ~49.2 kWh.&quot;
                    </span>
                  </div>

                  <div className="text-center text-[var(--text-secondary)]">↓</div>

                  <div className="p-3 rounded-lg bg-[var(--surface)] border border-[var(--border)]">
                    <span className="text-[var(--color-healthy)] font-bold block mb-1">
                      [Layer 3] Human Verification & Execution
                    </span>
                    <span className="text-[11px] text-[var(--text-secondary)]">
                      Maintenance reviews advisory plan on the cockpit, confirms physical status, and acknowledges work order.
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* =========================================================================
            5. TRANSPARENCY & INTEGRITY SECTION
        ========================================================================== */}
        <section id="transparency" className="py-20 border-b border-[var(--border)]">
          <div className="max-w-[1280px] mx-auto px-4 sm:px-6">
            <div className="max-w-2xl mb-12">
              <span className="text-xs font-mono uppercase tracking-wider text-[var(--color-accent)] font-semibold">
                04 / Data Integrity & Honesty
              </span>
              <h2
                className="text-2xl sm:text-3xl md:text-4xl font-medium tracking-tight mt-2 text-[var(--text-primary)]"
                style={{ fontFamily: 'var(--font-display)' }}
              >
                No fake precision. Simulated data is always marked.
              </h2>
              <p className="mt-3 text-sm text-[var(--text-secondary)] leading-relaxed">
                Many smart campus demos claim real-time IoT when they are merely random number generators.
                We believe trust is earned through radical transparency. Every reading, chart, and alert in this cockpit
                plainly states its provenance.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {[
                {
                  title: 'Explicit Provenance Badges',
                  desc: 'Every telemetry point carries a distinct badge: Simulated, Sensor, Manual, or Vision. We never mask synthetic baselines as physical hardware.',
                  badge: 'SIMULATED',
                },
                {
                  title: 'Formula-Backed Estimates',
                  desc: 'Impact projections (kWh, liters, rupees, and kg CO2) are never naked assertions. Hovering over any estimate reveals the conversion rates and equations used.',
                  badge: 'FORMULA-BOUND',
                },
                {
                  title: 'Advisory-Only Governance',
                  desc: 'Alerts are phrased honestly as "Possible leak, needs inspection", avoiding premature confirmation. Human staff retain total execution authority.',
                  badge: 'HUMAN-IN-THE-LOOP',
                },
              ].map((item, i) => (
                <div
                  key={i}
                  className="rounded-xl border border-[var(--border)] p-6 bg-[var(--surface)] space-y-3"
                >
                  <span className="inline-block px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-[var(--color-accent)]/10 text-[var(--color-accent)] border border-[var(--color-accent)]/20">
                    {item.badge}
                  </span>
                  <h3 className="text-base font-semibold text-[var(--text-primary)]">
                    {item.title}
                  </h3>
                  <p className="text-xs text-[var(--text-secondary)] leading-relaxed">
                    {item.desc}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* =========================================================================
            6. FINAL CTA SECTION
        ========================================================================== */}
        <section className="py-20 border-b border-[var(--border)] bg-[var(--surface)] text-center">
          <div className="max-w-[720px] mx-auto px-4 sm:px-6">
            <h2
              className="text-3xl sm:text-4xl font-medium tracking-tight text-[var(--text-primary)]"
              style={{ fontFamily: 'var(--font-display)' }}
            >
              Experience the campus digital twin in action.
            </h2>
            <p className="mt-4 text-sm text-[var(--text-secondary)] leading-relaxed">
              Explore the six monitored zones, simulate an after-hours pipe rupture,
              and test automated recommendation generation with fallback resilience.
            </p>
            <div className="mt-8 flex justify-center">
              <Link
                to="/app"
                className="inline-flex items-center gap-2 px-6 py-3.5 rounded-xl bg-[var(--color-accent)] hover:bg-[var(--color-accent-hover)] text-white text-sm font-semibold shadow-xs transition-all duration-200"
              >
                <span>Launch Interactive Cockpit</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>
        </section>
      </main>

      {/* =========================================================================
          7. FOOTER
      ========================================================================== */}
      <footer className="py-8 bg-[var(--bg)] border-t border-[var(--border)] text-xs text-[var(--text-secondary)]">
        <div className="max-w-[1280px] mx-auto px-4 sm:px-6 flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2 font-mono">
            <span>AI-Powered Sustainable Campus</span>
            <span>·</span>
            <span>Version 1.0.0</span>
          </div>

          <p className="font-mono text-[11px] text-center md:text-right">
            Advisory only. This system recommends actions; people review and execute them.
          </p>
        </div>
      </footer>
    </div>
  );
}
