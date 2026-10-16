import React, { useState } from 'react';
import { RefreshCw, Play, Info, CheckCircle2, RotateCcw } from 'lucide-react';
import { useToast } from '@/components/Toast';
import { simulateEvent, resetDemo } from '@/api/client';
import { formatTime } from '@/lib/utils';

interface TopBarProps {
  lastUpdated: string;
  onRefresh: () => void;
  dataMode?: string;
}

export function TopBar({ lastUpdated, onRefresh, dataMode = 'demo' }: TopBarProps) {
  const { toast } = useToast();
  const [simulating, setSimulating] = useState(false);
  const [resetting, setResetting] = useState(false);

  const handleSimulate = async () => {
    try {
      setSimulating(true);
      const res = await simulateEvent('night_water_spike');
      toast(res.detail || 'Simulated water spike injected into Hostel Block', 'warning');
      onRefresh();
    } catch {
      toast('Failed to trigger simulation scenario', 'error');
    } finally {
      setSimulating(false);
    }
  };

  const handleReset = async () => {
    try {
      setResetting(true);
      const res = await resetDemo();
      toast(res.detail || 'Demo baseline restored successfully', 'success');
      onRefresh();
    } catch {
      toast('Failed to reset demo baseline', 'error');
    } finally {
      setResetting(false);
    }
  };

  return (
    <div className="w-full bg-[var(--surface)] border-b border-[var(--border)] px-4 sm:px-6 py-2.5 flex flex-wrap items-center justify-between gap-3 text-xs">
      {/* Left: Product Name & Badges */}
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-2">
          <span className="font-semibold text-sm tracking-tight text-[var(--text-primary)]">
            Campus Operations Cockpit
          </span>
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-mono font-medium tracking-wide bg-[var(--color-watch)]/15 text-[var(--color-watch)] border border-[var(--color-watch)]/20 uppercase">
            {dataMode} data
          </span>
        </div>

        <div className="hidden md:flex items-center gap-1.5 text-[var(--text-secondary)] font-mono text-[11px] border-l border-[var(--border)] pl-3">
          <span>Synced:</span>
          <span className="text-[var(--text-primary)] font-medium">
            {lastUpdated ? formatTime(lastUpdated) : 'Live'}
          </span>
        </div>
      </div>

      {/* Right: Simulation Actions & Controls */}
      <div className="flex items-center gap-2">
        {/* Simulate scenario button with tooltip */}
        <div className="relative group">
          <button
            type="button"
            onClick={handleSimulate}
            disabled={simulating}
            className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border border-[var(--border)] bg-[var(--surface)] hover:bg-[var(--border)]/30 text-[var(--text-primary)] font-medium transition-colors disabled:opacity-50"
            aria-label="Simulate water anomaly scenario"
          >
            <Play className={`w-3.5 h-3.5 text-[var(--color-watch)] ${simulating ? 'animate-spin' : ''}`} />
            <span>Simulate Anomaly</span>
          </button>
          <div className="absolute right-0 top-full mt-1.5 hidden group-hover:flex z-50 w-56 p-2 rounded-lg bg-[var(--color-ink)] text-[#E8ECF2] border border-[var(--color-border-dark)] shadow-lg text-[11px] leading-relaxed">
            <Info className="w-3.5 h-3.5 shrink-0 mt-0.5 mr-1.5 text-[var(--color-accent-tint)]" />
            <span>Injects synthetic after-hours water flow telemetry into Hostel Block.</span>
          </div>
        </div>

        {/* Reset Demo button */}
        <div className="relative group">
          <button
            type="button"
            onClick={handleReset}
            disabled={resetting}
            className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border border-[var(--border)] bg-[var(--surface)] hover:bg-[var(--border)]/30 text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors disabled:opacity-50"
            aria-label="Reset simulation to baseline"
          >
            <RotateCcw className={`w-3.5 h-3.5 ${resetting ? 'animate-spin' : ''}`} />
            <span className="hidden sm:inline">Reset Baseline</span>
          </button>
          <div className="absolute right-0 top-full mt-1.5 hidden group-hover:flex z-50 w-52 p-2 rounded-lg bg-[var(--color-ink)] text-[#E8ECF2] border border-[var(--color-border-dark)] shadow-lg text-[11px] leading-relaxed">
            <CheckCircle2 className="w-3.5 h-3.5 shrink-0 mt-0.5 mr-1.5 text-[var(--color-healthy)]" />
            <span>Resets seeded zones, sensor readings, and alerts back to initial state.</span>
          </div>
        </div>

        {/* Manual Refresh */}
        <button
          type="button"
          onClick={onRefresh}
          className="p-1.5 rounded-lg border border-[var(--border)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--border)]/20 transition-colors"
          title="Refresh telemetry"
          aria-label="Refresh telemetry"
        >
          <RefreshCw className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
}
