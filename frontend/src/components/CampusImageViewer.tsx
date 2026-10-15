import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import {
  Activity,
  Zap,
  Droplets,
  Users,
  Wind,
  Radio,
  Scan,
  ShieldAlert,
  Gauge,
  Play,
  Pause,
  Volume2,
  VolumeX,
  Terminal,
  ChevronRight,
  RefreshCw,
  AlertTriangle,
  CheckCircle2,
  Sliders,
  Layers,
  Sparkles,
  Maximize2,
  Minimize2
} from 'lucide-react';

// ── Zone definitions with positions (% of image width/height) ──────────────
// Calibrated to match the aerial campus photo layout
export interface CampusZone {
  id: string;
  name: string;
  shortName: string;
  description: string;
  x: number;   // % from left
  y: number;   // % from top
  baseEnergy: number;
  baseWater: number;
  baseOccupancy: number;
  baseAirQuality: number;
  status: 'nominal' | 'watch' | 'critical';
  type: string;
}

const CAMPUS_ZONES: CampusZone[] = [
  {
    id: 'z2',
    name: 'Administrative Complex',
    shortName: 'Admin',
    description: 'Central campus management, registrar, and operations coordination',
    x: 42,
    y: 52,
    baseEnergy: 142,
    baseWater: 34,
    baseOccupancy: 62,
    baseAirQuality: 93,
    status: 'nominal',
    type: 'Administrative',
  },
  {
    id: 'z3',
    name: 'Engineering & Science Labs',
    shortName: 'Eng/Sci',
    description: 'Robotics labs, high-performance computing clusters, cleanrooms',
    x: 26,
    y: 40,
    baseEnergy: 388,
    baseWater: 118,
    baseOccupancy: 84,
    baseAirQuality: 79,
    status: 'watch',
    type: 'Laboratory',
  },
  {
    id: 'z4',
    name: 'Innovation Hub & Incubator',
    shortName: 'Innovation',
    description: 'Phase II hardware incubator — active heavy machinery draw',
    x: 18,
    y: 24,
    baseEnergy: 264,
    baseWater: 48,
    baseOccupancy: 38,
    baseAirQuality: 71,
    status: 'critical',
    type: 'Incubator',
  },
  {
    id: 'z5',
    name: 'Fleet Transport & EV Terminus',
    shortName: 'Transport',
    description: 'Autonomous shuttle depot, 48 DC fast-charging bays, solar canopy',
    x: 46,
    y: 82,
    baseEnergy: 194,
    baseWater: 22,
    baseOccupancy: 45,
    baseAirQuality: 68,
    status: 'watch',
    type: 'Infrastructure',
  },
  {
    id: 'z6',
    name: 'Aquatic Reserve & Water Plant',
    shortName: 'Water Tech',
    description: 'Bioretention basins, reverse-osmosis filtration, closed greywater loop',
    x: 82,
    y: 22,
    baseEnergy: 42,
    baseWater: 480,
    baseOccupancy: 12,
    baseAirQuality: 96,
    status: 'nominal',
    type: 'Hydraulic Loop',
  },
  {
    id: 'z7',
    name: 'Central Solar Canopy & Microgrid',
    shortName: 'Microgrid',
    description: '1.2MW bifacial solar arrays, BESS battery bank, synchronous condensers',
    x: 55,
    y: 32,
    baseEnergy: -145,  // negative = power injection into grid
    baseWater: 8,
    baseOccupancy: 18,
    baseAirQuality: 98,
    status: 'nominal',
    type: 'Renewable Generation',
  },
];

// Grid Interconnect Conduits (for animated SVG power/water flow lines)
const CONDUITS = [
  { from: 'z7', to: 'z2', type: 'power', label: '145 kW' },
  { from: 'z7', to: 'z3', type: 'power', label: '210 kW' },
  { from: 'z7', to: 'z4', type: 'power', label: '95 kW' },
  { from: 'z6', to: 'z2', type: 'water', label: '34 L/m' },
  { from: 'z6', to: 'z3', type: 'water', label: '118 L/m' },
  { from: 'z5', to: 'z7', type: 'power', label: '62 kW' },
];

const STATUS_CONFIG = {
  nominal:  { color: '#10b981', glow: 'rgba(16, 185, 129, 0.4)', label: 'NOMINAL',  ring: 'rgba(16, 185, 129, 0.25)', bg: 'rgba(16, 185, 129, 0.12)' },
  watch:    { color: '#f59e0b', glow: 'rgba(245, 158, 11, 0.4)', label: 'WATCH',    ring: 'rgba(245, 158, 11, 0.25)', bg: 'rgba(245, 158, 11, 0.12)' },
  critical: { color: '#ef4444', glow: 'rgba(239, 68, 68, 0.5)', label: 'CRITICAL', ring: 'rgba(239, 68, 68, 0.3)',  bg: 'rgba(239, 68, 68, 0.15)' },
};

function jitter(base: number, pct = 0.05): number {
  return +(base * (1 + (Math.random() - 0.48) * pct * 2)).toFixed(1);
}

// Subtle Audio Synthesizer for High-Tech HUD Beeps
class SoundFX {
  private ctx: AudioContext | null = null;
  enabled = false;

  private init() {
    if (!this.ctx && typeof window !== 'undefined') {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (AudioCtx) this.ctx = new AudioCtx();
    }
  }

  playBeep(freq = 880, type: OscillatorType = 'sine', duration = 0.05) {
    if (!this.enabled) return;
    try {
      this.init();
      if (!this.ctx) return;
      if (this.ctx.state === 'suspended') this.ctx.resume();
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = type;
      osc.frequency.setValueAtTime(freq, this.ctx.currentTime);
      gain.gain.setValueAtTime(0.04, this.ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.0001, this.ctx.currentTime + duration);
      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start();
      osc.stop(this.ctx.currentTime + duration);
    } catch {
      // AudioContext policy fallback
    }
  }
}

const sfx = new SoundFX();

interface CampusImageViewerProps {
  onSelectZone?: (zoneName: string | null) => void;
  selectedZone?: string | null;
}

export default function CampusImageViewer({ onSelectZone, selectedZone }: CampusImageViewerProps) {
  const [hoveredId, setHoveredId] = useState<string | null>(null);
  const [activeId, setActiveId] = useState<string | null>('z4'); // default to critical for instant engagement
  const [viewMode, setViewMode] = useState<'all' | 'power' | 'water' | 'heat'>('all');
  const [radarEnabled, setRadarEnabled] = useState(true);
  const [conduitsEnabled, setConduitsEnabled] = useState(true);
  const [audioEnabled, setAudioEnabled] = useState(false);
  const [patrolActive, setPatrolActive] = useState(false);
  const [hudOpen, setHudOpen] = useState(true);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const [tick, setTick] = useState(0);

  const toggleFullscreen = useCallback(() => {
    if (!containerRef.current) return;
    if (!document.fullscreenElement) {
      containerRef.current.requestFullscreen().catch(() => {});
      setIsFullscreen(true);
    } else {
      document.exitFullscreen().catch(() => {});
      setIsFullscreen(false);
    }
  }, []);

  useEffect(() => {
    const handler = () => setIsFullscreen(!!document.fullscreenElement);
    document.addEventListener('fullscreenchange', handler);
    return () => document.removeEventListener('fullscreenchange', handler);
  }, []);
  const [logs, setLogs] = useState<Array<{ id: number; time: string; text: string; type: 'info' | 'warn' | 'crit' }>>([
    { id: 1, time: '14:00:12', text: 'Telemetry sync initialized on 6 campus telemetry nodes', type: 'info' },
    { id: 2, time: '14:00:18', text: 'Microgrid Canopy +145 kW backfeed active', type: 'info' },
    { id: 3, time: '14:00:22', text: 'Innovation Hub: Phase II current draw +24% threshold', type: 'crit' },
  ]);

  const [liveData, setLiveData] = useState<Record<string, {
    energy: number; water: number; occupancy: number; airQuality: number;
  }>>(() =>
    Object.fromEntries(CAMPUS_ZONES.map((z) => [
      z.id,
      { energy: z.baseEnergy, water: z.baseWater, occupancy: z.baseOccupancy, airQuality: z.baseAirQuality },
    ]))
  );

  const [waveOffset, setWaveOffset] = useState(0);

  // Sync audio toggle with sound engine
  useEffect(() => {
    sfx.enabled = audioEnabled;
  }, [audioEnabled]);

  // Patrol mode: auto-cycle zones every 5 seconds
  useEffect(() => {
    if (!patrolActive) return;
    const interval = setInterval(() => {
      setActiveId((current) => {
        const idx = CAMPUS_ZONES.findIndex((z) => z.id === current);
        const next = CAMPUS_ZONES[(idx + 1) % CAMPUS_ZONES.length];
        sfx.playBeep(980, 'sine', 0.04);
        return next.id;
      });
    }, 4500);
    return () => clearInterval(interval);
  }, [patrolActive]);

  // Live telemetry jitter and log generator
  useEffect(() => {
    const interval = setInterval(() => {
      setLiveData((prev) => {
        const next = { ...prev };
        CAMPUS_ZONES.forEach((z) => {
          next[z.id] = {
            energy:      jitter(z.baseEnergy, 0.04),
            water:       jitter(z.baseWater, 0.03),
            occupancy:   Math.min(100, Math.max(0, jitter(z.baseOccupancy, 0.02))),
            airQuality:  Math.min(100, Math.max(0, jitter(z.baseAirQuality, 0.015))),
          };
        });
        return next;
      });

      setTick((t) => t + 1);
      setWaveOffset((w) => (w + 1) % 360);

      // Random telemetry log pulse
      if (Math.random() > 0.45) {
        const now = new Date().toTimeString().split(' ')[0];
        const randomZone = CAMPUS_ZONES[Math.floor(Math.random() * CAMPUS_ZONES.length)];
        const messages = [
          { text: `${randomZone.shortName}: Inverter bus nominal 415.4V`, type: 'info' as const },
          { text: `${randomZone.shortName}: Flow sensor packet ACK 12ms`, type: 'info' as const },
          { text: `${randomZone.shortName}: Thermal gradient +0.4°C drift`, type: 'warn' as const },
          { text: `${randomZone.shortName}: Peak load harmonic synchronized`, type: 'info' as const },
        ];
        const pick = messages[Math.floor(Math.random() * messages.length)];
        setLogs((prev) => [{ id: Date.now(), time: now, ...pick }, ...prev.slice(0, 7)]);
      }
    }, 1800);
    return () => clearInterval(interval);
  }, []);

  const handlePinClick = useCallback((zone: CampusZone) => {
    sfx.playBeep(1200, 'triangle', 0.07);
    const newId = activeId === zone.id ? null : zone.id;
    setActiveId(newId);
    setHudOpen(true);
    onSelectZone?.(newId ? zone.name : null);
  }, [activeId, onSelectZone]);

  const activeZone = CAMPUS_ZONES.find((z) => z.id === activeId);
  const activeMetrics = activeId ? liveData[activeId] : null;

  // Campus aggregates
  const totalEnergy = Object.values(liveData).reduce((s, d) => s + d.energy, 0);
  const totalWater = Object.values(liveData).reduce((s, d) => s + d.water, 0);
  const avgAQI = +(Object.values(liveData).reduce((s, d) => s + d.airQuality, 0) / CAMPUS_ZONES.length).toFixed(0);
  const nominalCount = CAMPUS_ZONES.filter((z) => z.status === 'nominal').length;

  return (
    <div className="flex flex-col gap-4 text-white font-sans select-none">

      {/* ── Top HUD Summary Strip ──────────────────────────────────────────────── */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {[
          {
            icon: Zap,
            label: 'Net Campus Load',
            value: `${totalEnergy > 0 ? '+' : ''}${totalEnergy.toFixed(0)} kW`,
            sub: 'Microgrid -145 kW active',
            color: '#10b981',
            badge: 'LIVE 1.8s',
          },
          {
            icon: Droplets,
            label: 'Hydraulic Flow',
            value: `${totalWater.toFixed(0)} L/m`,
            sub: 'Closed loop WTP nominal',
            color: '#60a5fa',
            badge: 'STABLE',
          },
          {
            icon: Users,
            label: 'Subsystems Nominal',
            value: `${nominalCount} / ${CAMPUS_ZONES.length}`,
            sub: '1 Critical · 2 Watch',
            color: nominalCount >= 4 ? '#10b981' : '#f59e0b',
            badge: 'MONITORED',
          },
          {
            icon: Wind,
            label: 'Atmospheric AQI',
            value: `${avgAQI} AQI`,
            sub: '23.4°C · 52% RH Clean Air',
            color: '#34d399',
            badge: 'EXCELLENT',
          },
        ].map((card, i) => {
          const Icon = card.icon;
          return (
            <div
              key={i}
              className="liquid-glass rounded-2xl p-3.5 border border-white/10 relative overflow-hidden group hover:border-white/20 transition-all duration-300"
            >
              <div className="flex items-center justify-between mb-1">
                <div className="flex items-center gap-1.5 text-[10px] font-mono tracking-wider text-white/50 uppercase">
                  <Icon className="w-3.5 h-3.5" style={{ color: card.color }} />
                  {card.label}
                </div>
                <span className="text-[9px] font-mono px-1.5 py-0.5 rounded-full bg-white/5 border border-white/10 text-white/40">
                  {card.badge}
                </span>
              </div>
              <div className="text-xl font-bold tracking-tight text-white tabular-nums flex items-baseline gap-1 mt-0.5">
                {card.value}
                <span className="w-1.5 h-1.5 rounded-full animate-ping ml-1" style={{ background: card.color }} />
              </div>
              <div className="text-[10px] font-mono text-white/40 mt-1 flex items-center justify-between">
                <span>{card.sub}</span>
                {/* Micro spark equalizer animation */}
                <div className="flex items-end gap-0.5 h-3">
                  {[40, 70, 55, 90, 60].map((h, k) => (
                    <span
                      key={k}
                      className="w-0.5 rounded-full bg-white/20"
                      style={{
                        height: `${h}%`,
                        animation: `eqBounce 1.2s ease-in-out infinite ${k * 0.15}s`,
                      }}
                    />
                  ))}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* ── Control Bar ────────────────────────────────────────────────────────── */}
      <div className="liquid-glass rounded-2xl px-4 py-2.5 border border-white/10 flex flex-wrap items-center justify-between gap-3 text-xs font-mono">
        {/* Layer Filters */}
        <div className="flex items-center gap-1 bg-black/40 p-1 rounded-xl border border-white/10">
          <span className="text-[10px] uppercase text-white/30 px-2 flex items-center gap-1">
            <Layers className="w-3 h-3" /> Filter:
          </span>
          {[
            { id: 'all', label: 'All Telemetry' },
            { id: 'power', label: '⚡ Energy Grid' },
            { id: 'water', label: '💧 Hydro Loop' },
            { id: 'heat', label: '🔥 Thermal Alert' },
          ].map((mode) => (
            <button
              key={mode.id}
              onClick={() => {
                sfx.playBeep(700, 'sine', 0.03);
                setViewMode(mode.id as typeof viewMode);
              }}
              className={`px-3 py-1 rounded-lg transition-all duration-200 ${
                viewMode === mode.id
                  ? 'bg-white/20 text-white font-semibold shadow-[0_0_12px_rgba(255,255,255,0.15)] border border-white/20'
                  : 'text-white/40 hover:text-white/80 hover:bg-white/5'
              }`}
            >
              {mode.label}
            </button>
          ))}
        </div>

        {/* Feature Toggles */}
        <div className="flex items-center gap-2">
          {/* Radar toggle */}
          <button
            onClick={() => {
              sfx.playBeep(850, 'sine', 0.03);
              setRadarEnabled((v) => !v);
            }}
            className={`px-3 py-1.5 rounded-xl border flex items-center gap-1.5 transition-all ${
              radarEnabled
                ? 'bg-emerald-500/15 border-emerald-500/40 text-emerald-300 shadow-[0_0_10px_rgba(16,185,129,0.2)]'
                : 'bg-white/5 border-white/10 text-white/40'
            }`}
          >
            <Scan className="w-3.5 h-3.5" />
            <span>Radar Sweep</span>
          </button>

          {/* Conduit Flow toggle */}
          <button
            onClick={() => {
              sfx.playBeep(850, 'sine', 0.03);
              setConduitsEnabled((v) => !v);
            }}
            className={`px-3 py-1.5 rounded-xl border flex items-center gap-1.5 transition-all ${
              conduitsEnabled
                ? 'bg-cyan-500/15 border-cyan-500/40 text-cyan-300 shadow-[0_0_10px_rgba(6,182,212,0.2)]'
                : 'bg-white/5 border-white/10 text-white/40'
            }`}
          >
            <Zap className="w-3.5 h-3.5" />
            <span>Conduit Stream</span>
          </button>

          {/* Patrol auto-cycle */}
          <button
            onClick={() => {
              sfx.playBeep(900, 'sine', 0.04);
              setPatrolActive((v) => !v);
            }}
            className={`px-3 py-1.5 rounded-xl border flex items-center gap-1.5 transition-all ${
              patrolActive
                ? 'bg-amber-500/15 border-amber-500/40 text-amber-300 shadow-[0_0_10px_rgba(245,158,11,0.2)]'
                : 'bg-white/5 border-white/10 text-white/40'
            }`}
          >
            {patrolActive ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
            <span>{patrolActive ? 'Patrol On' : 'Patrol'}</span>
          </button>

          {/* HUD Drawer Toggle */}
          <button
            onClick={() => {
              sfx.playBeep(800, 'sine', 0.03);
              setHudOpen((v) => !v);
            }}
            className={`px-3 py-1.5 rounded-xl border flex items-center gap-1.5 transition-all ${
              hudOpen
                ? 'bg-emerald-500/15 border-emerald-500/40 text-emerald-300 shadow-[0_0_10px_rgba(16,185,129,0.2)]'
                : 'bg-white/5 border-white/10 text-white/40 hover:text-white/80'
            }`}
          >
            <Sliders className="w-3.5 h-3.5" />
            <span>{hudOpen ? 'Hide HUD' : 'Show HUD'}</span>
          </button>

          {/* Fullscreen Toggle */}
          <button
            onClick={toggleFullscreen}
            className="p-1.5 rounded-xl border bg-white/5 border-white/10 text-white/50 hover:text-white hover:bg-white/10 transition-all"
            title="Toggle Fullscreen"
          >
            {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
          </button>

          {/* Audio toggle */}
          <button
            onClick={() => {
              const next = !audioEnabled;
              setAudioEnabled(next);
              if (next) sfx.playBeep(1000, 'triangle', 0.08);
            }}
            className={`p-1.5 rounded-xl border transition-all ${
              audioEnabled
                ? 'bg-white/20 border-white/30 text-white'
                : 'bg-white/5 border-white/10 text-white/40 hover:text-white/70'
            }`}
            title="Toggle Synthesizer Audio HUD"
          >
            {audioEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {/* ── Main Interactive Map Stage (100% Full Width Viewport with Floating HUD) ──────────────── */}
      <div className="relative w-full">
        <div
          ref={containerRef}
          className={`relative w-full rounded-3xl overflow-hidden border border-white/15 shadow-[0_24px_72px_0_rgba(0,0,0,0.85)] bg-black transition-all duration-300 ${
            isFullscreen ? 'fixed inset-0 z-50 rounded-none border-none p-4 bg-[#0B0F19]' : ''
          }`}
          style={{
            aspectRatio: isFullscreen ? 'auto' : '1672 / 941',
            width: '100%',
          }}
        >
          {/* Actual Aerial Campus Image — 100% full scale, 0% cropped */}
          <img
            src="/campus.png"
            alt="Campus Aerial Orthomosaic"
            className="w-full h-full object-fill select-none pointer-events-none block"
            style={{
              filter: 'brightness(0.92) contrast(1.08) saturate(1.05)',
            }}
            onError={(e) => {
              const target = e.target as HTMLImageElement;
              if (target.src.endsWith('.png')) {
                target.src = '/campus.jpg';
              } else {
                target.style.display = 'none';
              }
            }}
          />

          {/* Vignette & Tactical Glass Gradients */}
          <div className="absolute inset-0 bg-radial-gradient from-transparent via-black/20 to-black/70 pointer-events-none" />
          <div className="absolute inset-0 bg-gradient-to-t from-[#0B0F19]/90 via-transparent to-[#0B0F19]/40 pointer-events-none" />

          {/* Cybernetic Grid Overlay Lines */}
          <div
            className="absolute inset-0 pointer-events-none opacity-15"
            style={{
              backgroundImage: 'linear-gradient(rgba(255,255,255,0.12) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.12) 1px, transparent 1px)',
              backgroundSize: '48px 48px',
            }}
          />

          {/* ── Animated Sweeping Laser Scanline ───────────────────────────────── */}
          {radarEnabled && (
            <div
              className="absolute left-0 right-0 h-24 pointer-events-none animate-laser-scan"
              style={{
                background: 'linear-gradient(to bottom, transparent, rgba(52, 211, 153, 0.08) 50%, rgba(52, 211, 153, 0.3) 98%, #34d399 100%)',
                boxShadow: '0 0 16px rgba(52, 211, 153, 0.5)',
              }}
            />
          )}

          {/* ── Rotating Radar Sweep Arc & Range Rings ─────────────────────────── */}
          {radarEnabled && (
            <div className="absolute inset-0 pointer-events-none flex items-center justify-center overflow-hidden">
              {/* Range rings */}
              <div className="w-[300px] h-[300px] rounded-full border border-emerald-500/15 absolute" />
              <div className="w-[540px] h-[540px] rounded-full border border-emerald-500/10 absolute" />
              <div className="w-[780px] h-[780px] rounded-full border border-emerald-500/5 absolute" />
              <div className="w-full h-px bg-emerald-500/10 absolute" />
              <div className="h-full w-px bg-emerald-500/10 absolute" />

              {/* Conic sweep beam */}
              <div
                className="w-[840px] h-[840px] rounded-full animate-radar-sweep absolute opacity-25"
                style={{
                  background: 'conic-gradient(from 0deg, transparent 0deg, transparent 310deg, rgba(16, 185, 129, 0.05) 330deg, rgba(16, 185, 129, 0.4) 360deg)',
                }}
              />
            </div>
          )}

          {/* ── SVG Energy & Water Conduits (Spline Energy Flows) ───────────────── */}
          {conduitsEnabled && (
            <svg className="absolute inset-0 w-full h-full pointer-events-none z-10">
              <defs>
                <linearGradient id="powerGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#10b981" stopOpacity="0.8" />
                  <stop offset="100%" stopColor="#06b6d4" stopOpacity="0.8" />
                </linearGradient>
                <linearGradient id="waterGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#38bdf8" stopOpacity="0.8" />
                  <stop offset="100%" stopColor="#6366f1" stopOpacity="0.8" />
                </linearGradient>
                <filter id="glowEffect" x="-20%" y="-20%" width="140%" height="140%">
                  <feGaussianBlur stdDeviation="3" result="blur" />
                  <feMerge>
                    <feMergeNode in="blur" />
                    <feMergeNode in="SourceGraphic" />
                  </feMerge>
                </filter>
              </defs>

              {CONDUITS.map((conduit, i) => {
                const fromNode = CAMPUS_ZONES.find((z) => z.id === conduit.from);
                const toNode = CAMPUS_ZONES.find((z) => z.id === conduit.to);
                if (!fromNode || !toNode) return null;

                if (viewMode === 'power' && conduit.type !== 'power') return null;
                if (viewMode === 'water' && conduit.type !== 'water') return null;

                const isPower = conduit.type === 'power';
                const strokeColor = isPower ? '#34d399' : '#38bdf8';
                const midX = (fromNode.x + toNode.x) / 2;
                const midY = (fromNode.y + toNode.y) / 2 - 4; // curved bend

                const pathString = `M ${fromNode.x}% ${fromNode.y}% Q ${midX}% ${midY}% ${toNode.x}% ${toNode.y}%`;

                return (
                  <g key={i}>
                    {/* Underlying static shadow line */}
                    <path
                      d={pathString}
                      fill="none"
                      stroke={strokeColor}
                      strokeOpacity="0.18"
                      strokeWidth="2.5"
                    />
                    {/* Animated moving pulses */}
                    <path
                      d={pathString}
                      fill="none"
                      stroke={strokeColor}
                      strokeWidth="2"
                      className="animate-conduit-flow"
                      filter="url(#glowEffect)"
                    />
                  </g>
                );
              })}
            </svg>
          )}

          {/* ── Hotspot Pins with Holographic Reticles & Micro-Pills ─────────────── */}
          {CAMPUS_ZONES.map((zone) => {
            const cfg = STATUS_CONFIG[zone.status];
            const metrics = liveData[zone.id];
            const isHovered = hoveredId === zone.id;
            const isActive = activeId === zone.id;

            // Visibility filters
            if (viewMode === 'heat' && zone.status === 'nominal') return null;
            if (viewMode === 'water' && zone.type !== 'Hydraulic Loop') return null;
            if (viewMode === 'power' && zone.type !== 'Renewable Generation' && zone.type !== 'Infrastructure' && zone.type !== 'Laboratory') {
              // dimmed or secondary
            }

            return (
              <div
                key={zone.id}
                className="absolute cursor-pointer select-none transition-all duration-300"
                style={{
                  left: `${zone.x}%`,
                  top: `${zone.y}%`,
                  transform: 'translate(-50%, -50%)',
                  zIndex: isActive ? 40 : isHovered ? 35 : 20,
                }}
                onMouseEnter={() => {
                  sfx.playBeep(1100, 'sine', 0.02);
                  setHoveredId(zone.id);
                }}
                onMouseLeave={() => setHoveredId(null)}
                onClick={() => handlePinClick(zone)}
              >
                {/* 1. Outer rotating holographic reticle ring */}
                <div
                  className="absolute rounded-full border border-dashed animate-spin-slow pointer-events-none"
                  style={{
                    width: isActive ? 58 : 42,
                    height: isActive ? 58 : 42,
                    left: isActive ? -29 : -21,
                    top: isActive ? -29 : -21,
                    borderColor: cfg.color,
                    opacity: isActive ? 0.9 : 0.45,
                  }}
                />

                {/* 2. Reverse rotating inner ring with corner notches */}
                <div
                  className="absolute rounded-full border border-dotted animate-spin-reverse-slow pointer-events-none"
                  style={{
                    width: isActive ? 44 : 32,
                    height: isActive ? 44 : 32,
                    left: isActive ? -22 : -16,
                    top: isActive ? -22 : -16,
                    borderColor: cfg.color,
                    opacity: isActive ? 0.8 : 0.3,
                  }}
                />

                {/* 3. Expanding acoustic pulse wave */}
                <div
                  className="absolute rounded-full animate-ping pointer-events-none"
                  style={{
                    width: 36,
                    height: 36,
                    left: -18,
                    top: -18,
                    background: cfg.ring,
                    animationDuration: zone.status === 'critical' ? '1s' : '2.2s',
                  }}
                />

                {/* 4. Core glowing target beacon dot */}
                <div
                  className="relative rounded-full border-2 flex items-center justify-center transition-all duration-200"
                  style={{
                    width: isActive ? 22 : 16,
                    height: isActive ? 22 : 16,
                    left: isActive ? -11 : -8,
                    top: isActive ? -11 : -8,
                    background: cfg.color,
                    borderColor: '#ffffff',
                    boxShadow: `0 0 16px ${cfg.color}, 0 0 32px ${cfg.glow}`,
                  }}
                >
                  <div className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" />
                </div>

                {/* 5. Floating Live Telemetry HUD Tag (Visible all the time or on hover) */}
                <div
                  className={`absolute left-4 -top-3.5 whitespace-nowrap transition-all duration-300 pointer-events-none ${
                    isActive ? 'scale-105' : 'scale-95'
                  }`}
                >
                  <div
                    className="px-2.5 py-1 rounded-xl backdrop-blur-md flex items-center gap-2 border shadow-2xl"
                    style={{
                      background: isActive ? 'rgba(11, 15, 25, 0.92)' : 'rgba(11, 15, 25, 0.75)',
                      borderColor: isActive ? cfg.color : 'rgba(255, 255, 255, 0.15)',
                      boxShadow: isActive ? `0 0 20px ${cfg.glow}` : '0 4px 16px rgba(0,0,0,0.6)',
                    }}
                  >
                    {/* Status dot */}
                    <span
                      className="w-1.5 h-1.5 rounded-full"
                      style={{ background: cfg.color, boxShadow: `0 0 6px ${cfg.color}` }}
                    />

                    {/* Zone Name */}
                    <span className="text-[10px] font-mono font-bold tracking-wide text-white">
                      {zone.shortName}
                    </span>

                    {/* Live Metric Ticker */}
                    <span className="text-[9px] font-mono text-white/60 tabular-nums border-l border-white/10 pl-1.5">
                      {metrics ? (
                        metrics.energy > 0 ? `${metrics.energy.toFixed(0)} kW` : `-${Math.abs(metrics.energy).toFixed(0)} kW`
                      ) : '...'}
                    </span>

                    {/* Mini animated equalizer */}
                    <div className="flex items-end gap-0.5 h-2.5">
                      <span className="w-0.5 rounded-full bg-emerald-400" style={{ height: '70%', animation: 'eqBounce 0.8s infinite 0.1s' }} />
                      <span className="w-0.5 rounded-full bg-emerald-400" style={{ height: '100%', animation: 'eqBounce 0.8s infinite 0.3s' }} />
                      <span className="w-0.5 rounded-full bg-emerald-400" style={{ height: '40%', animation: 'eqBounce 0.8s infinite 0.2s' }} />
                    </div>
                  </div>
                </div>

                {/* 6. Deep Hover Info Tooltip */}
                {isHovered && !isActive && (
                  <div className="absolute bottom-full mb-4 left-1/2 -translate-x-1/2 pointer-events-none z-50 animate-fadeInUp">
                    <div className="px-3.5 py-2.5 rounded-2xl bg-black/90 backdrop-blur-xl border border-white/20 shadow-2xl text-xs w-56">
                      <div className="flex items-center justify-between text-[9px] font-mono uppercase tracking-widest text-white/40 mb-1">
                        <span>{zone.type}</span>
                        <span style={{ color: cfg.color }}>● {cfg.label}</span>
                      </div>
                      <div className="font-bold text-white text-sm">{zone.name}</div>
                      <div className="text-[10px] text-white/50 mt-1 line-clamp-2 leading-relaxed">
                        {zone.description}
                      </div>
                      <div className="grid grid-cols-2 gap-1.5 mt-2.5 pt-2 border-t border-white/10 text-[10px] font-mono">
                        <div>⚡ {metrics?.energy.toFixed(0)} kW</div>
                        <div>💧 {metrics?.water.toFixed(0)} L/m</div>
                        <div>👥 {metrics?.occupancy.toFixed(0)}% Occupied</div>
                        <div>🍃 {metrics?.airQuality.toFixed(0)} AQI</div>
                      </div>
                    </div>
                    <div className="flex justify-center -mt-1">
                      <div className="w-2 h-2 bg-black/90 border-r border-b border-white/20 rotate-45" />
                    </div>
                  </div>
                )}
              </div>
            );
          })}

          {/* ── Sci-Fi Tactical Corner Brackets ─────────────────────────────────── */}
          <div className="absolute top-4 left-4 pointer-events-none flex items-center gap-2">
            <div className="px-3 py-1.5 rounded-xl bg-black/70 backdrop-blur-md border border-white/15 text-[10px] font-mono flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
              <span className="font-semibold text-emerald-400">TELEMETRY GRID ONLINE</span>
              <span className="text-white/30">|</span>
              <span className="text-white/60">SAT-ORBIT L2</span>
            </div>
          </div>

          <div className="absolute top-4 right-4 pointer-events-none flex items-center gap-2">
            <div className="px-3 py-1.5 rounded-xl bg-black/70 backdrop-blur-md border border-white/15 text-[10px] font-mono text-white/50">
              FRAME #{tick.toString().padStart(5, '0')} · {CAMPUS_ZONES.length} NODES
            </div>
          </div>

          <div className="absolute bottom-4 left-4 pointer-events-none">
            <div className="px-3 py-1.5 rounded-xl bg-black/70 backdrop-blur-md border border-white/15 text-[10px] font-mono text-white/50 flex items-center gap-2">
              <Radio className="w-3.5 h-3.5 text-cyan-400 animate-pulse" />
              <span>RF FREQ: 915.00 MHz (LoRa Mesh)</span>
            </div>
          </div>

          {!activeId && (
            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 px-4 py-2 rounded-full bg-black/80 backdrop-blur-md border border-emerald-500/30 text-[11px] font-mono text-emerald-300 shadow-[0_0_20px_rgba(16,185,129,0.25)] animate-bounce pointer-events-none">
              ✦ Click any glowing hotspot beacon to engage telemetry telemetry HUD
            </div>
          )}

          {/* ── High-Tech Floating Glassmorphic Telemetry HUD Overlay ──────────── */}
          {hudOpen && (
            <div
              className="absolute top-3 right-3 bottom-3 w-[360px] max-w-[85vw] z-40 rounded-2xl liquid-glass-dense border border-white/20 shadow-[0_20px_50px_rgba(0,0,0,0.9)] flex flex-col gap-3 p-4 overflow-y-auto backdrop-blur-2xl transition-all duration-300"
              style={{
                background: 'linear-gradient(180deg, rgba(11, 15, 25, 0.94) 0%, rgba(15, 21, 35, 0.97) 100%)',
              }}
            >
          {activeZone && activeMetrics ? (
            (() => {
              const cfg = STATUS_CONFIG[activeZone.status];
              const powerPct = Math.min(100, Math.max(5, (Math.abs(activeMetrics.energy) / 450) * 100));

              return (
                <div className="flex flex-col gap-4 h-full">
                  {/* Header */}
                  <div>
                    <div className="flex items-center justify-between">
                      <span
                        className="text-[9px] font-mono uppercase tracking-widest px-2.5 py-1 rounded-full border flex items-center gap-1.5 font-bold"
                        style={{
                          color: cfg.color,
                          borderColor: cfg.color + '55',
                          background: cfg.bg,
                          boxShadow: `0 0 12px ${cfg.glow}`,
                        }}
                      >
                        <span className="w-1.5 h-1.5 rounded-full animate-ping" style={{ background: cfg.color }} />
                        {cfg.label} DIRECTIVE
                      </span>
                      <button
                        onClick={() => {
                          sfx.playBeep(600, 'sine', 0.03);
                          setActiveId(null);
                          onSelectZone?.(null);
                        }}
                        className="p-1 rounded-lg text-white/40 hover:text-white hover:bg-white/10 transition-colors"
                      >
                        ✕
                      </button>
                    </div>

                    <h3 className="mt-2.5 text-lg font-bold text-white tracking-tight">{activeZone.name}</h3>
                    <div className="text-[10px] font-mono text-cyan-400 mt-0.5 flex items-center gap-1">
                      <Terminal className="w-3 h-3" />
                      SUB-SYSTEM: {activeZone.type.toUpperCase()}
                    </div>
                    <p className="text-[11px] text-white/40 mt-1.5 leading-relaxed font-sans">
                      {activeZone.description}
                    </p>
                  </div>

                  {/* ── Holographic Circular Power Gauge ──────────────────────────── */}
                  <div className="p-3.5 rounded-2xl bg-black/40 border border-white/10 flex items-center gap-4">
                    {/* SVG Radial Gauge */}
                    <div className="relative w-20 h-20 flex-shrink-0">
                      <svg className="w-full h-full -rotate-90" viewBox="0 0 100 100">
                        {/* Background track */}
                        <circle
                          cx="50"
                          cy="50"
                          r="40"
                          stroke="rgba(255,255,255,0.08)"
                          strokeWidth="8"
                          fill="none"
                        />
                        {/* Animated value arc */}
                        <circle
                          cx="50"
                          cy="50"
                          r="40"
                          stroke={cfg.color}
                          strokeWidth="8"
                          strokeDasharray={251.2}
                          strokeDashoffset={251.2 - (251.2 * powerPct) / 100}
                          strokeLinecap="round"
                          fill="none"
                          style={{
                            transition: 'stroke-dashoffset 0.8s ease-out',
                            filter: `drop-shadow(0 0 6px ${cfg.color})`,
                          }}
                        />
                      </svg>
                      {/* Center value */}
                      <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
                        <span className="text-sm font-bold font-mono text-white leading-none">
                          {powerPct.toFixed(0)}%
                        </span>
                        <span className="text-[8px] font-mono text-white/40 uppercase mt-0.5">CAPACITY</span>
                      </div>
                    </div>

                    {/* Gauge Stats */}
                    <div className="flex-1 min-w-0">
                      <div className="text-[9px] font-mono uppercase text-white/40">Real-Time Draw</div>
                      <div className="text-xl font-bold text-white font-mono tabular-nums flex items-baseline gap-1 mt-0.5">
                        {activeMetrics.energy > 0 ? `+${activeMetrics.energy.toFixed(1)}` : activeMetrics.energy.toFixed(1)}
                        <span className="text-xs font-normal text-white/40">kW</span>
                      </div>
                      <div className="text-[10px] font-mono mt-1" style={{ color: cfg.color }}>
                        {activeMetrics.energy < 0 ? '✦ Microgrid Feed-in' : activeZone.status === 'critical' ? '▲ Exceeds Baseline' : '● In Safe Envelope'}
                      </div>
                    </div>
                  </div>

                  {/* ── Oscilloscope Live Frequency Waveform ───────────────────────── */}
                  <div className="p-3 rounded-2xl bg-black/40 border border-white/10">
                    <div className="flex items-center justify-between text-[9px] font-mono uppercase text-white/40 mb-1.5">
                      <span className="flex items-center gap-1">
                        <Activity className="w-3 h-3 text-emerald-400" /> Sensor Harmonic Waveform
                      </span>
                      <span className="text-emerald-400 font-mono">60.02 Hz</span>
                    </div>

                    {/* SVG Oscillating Sine Wave */}
                    <div className="h-10 w-full overflow-hidden relative flex items-center">
                      <svg className="w-full h-full" viewBox="0 0 300 40" preserveAspectRatio="none">
                        <defs>
                          <linearGradient id="waveGlow" x1="0" y1="0" x2="1" y2="0">
                            <stop offset="0%" stopColor="#34d399" stopOpacity="0.2" />
                            <stop offset="50%" stopColor="#10b981" stopOpacity="1" />
                            <stop offset="100%" stopColor="#06b6d4" stopOpacity="0.8" />
                          </linearGradient>
                        </defs>
                        {/* Center guide line */}
                        <line x1="0" y1="20" x2="300" y2="20" stroke="rgba(255,255,255,0.06)" strokeDasharray="3 3" />
                        {/* Dynamic sine wave */}
                        <path
                          d={Array.from({ length: 60 }, (_, i) => {
                            const x = (i / 59) * 300;
                            const rad = (i * 0.25) + (waveOffset * 0.15);
                            const y = 20 + Math.sin(rad) * 12 + Math.cos(rad * 2) * 4;
                            return `${i === 0 ? 'M' : 'L'} ${x} ${y}`;
                          }).join(' ')}
                          fill="none"
                          stroke="url(#waveGlow)"
                          strokeWidth="2"
                          strokeLinecap="round"
                        />
                      </svg>
                    </div>
                  </div>

                  {/* ── Telemetry Rows ────────────────────────────────────────────── */}
                  <div className="space-y-2.5">
                    <div className="text-[9px] font-mono uppercase tracking-widest text-white/30 flex items-center justify-between">
                      <span>Multi-Sensor Telemetry</span>
                      <span>FREQ 1800ms</span>
                    </div>

                    {[
                      {
                        label: 'Hydraulic Flow',
                        value: `${activeMetrics.water.toFixed(0)} L/min`,
                        bar: (activeMetrics.water / 500) * 100,
                        barColor: '#38bdf8',
                        icon: Droplets,
                      },
                      {
                        label: 'Zone Occupancy',
                        value: `${activeMetrics.occupancy.toFixed(0)}%`,
                        bar: activeMetrics.occupancy,
                        barColor: '#a78bfa',
                        icon: Users,
                      },
                      {
                        label: 'Air Quality (AQI)',
                        value: `${activeMetrics.airQuality.toFixed(0)} AQI`,
                        bar: activeMetrics.airQuality,
                        barColor: activeMetrics.airQuality > 80 ? '#10b981' : '#f59e0b',
                        icon: Wind,
                      },
                    ].map((row, i) => {
                      const RowIcon = row.icon;
                      return (
                        <div key={i} className="p-2.5 rounded-xl bg-white/5 border border-white/5 space-y-1.5">
                          <div className="flex items-center justify-between text-[11px] font-mono">
                            <span className="flex items-center gap-1.5 text-white/60">
                              <RowIcon className="w-3.5 h-3.5" style={{ color: row.barColor }} />
                              {row.label}
                            </span>
                            <span className="text-white font-bold tabular-nums">{row.value}</span>
                          </div>
                          <div className="w-full h-1 bg-white/10 rounded-full overflow-hidden">
                            <div
                              className="h-full rounded-full transition-all duration-700"
                              style={{ width: `${Math.min(100, Math.max(0, row.bar))}%`, background: row.barColor }}
                            />
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  {/* ── Live Log Stream ────────────────────────────────────────────── */}
                  <div className="p-3 rounded-2xl bg-black/60 border border-white/10 space-y-1.5 flex-1 min-h-[110px]">
                    <div className="text-[9px] font-mono uppercase tracking-wider text-white/30 flex items-center justify-between mb-1">
                      <span className="flex items-center gap-1">
                        <Terminal className="w-3 h-3 text-cyan-400" /> Event Stream
                      </span>
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
                    </div>
                    <div className="space-y-1 max-h-24 overflow-y-auto text-[10px] font-mono">
                      {logs.map((log) => (
                        <div key={log.id} className="flex items-start gap-1.5 leading-tight">
                          <span className="text-white/30 flex-shrink-0">{log.time}</span>
                          <span
                            className={
                              log.type === 'crit'
                                ? 'text-red-400'
                                : log.type === 'warn'
                                ? 'text-amber-300'
                                : 'text-white/70'
                            }
                          >
                            {log.text}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* ── Action Buttons ─────────────────────────────────────────────── */}
                  <div className="grid grid-cols-2 gap-2 mt-auto">
                    <button
                      onClick={() => {
                        sfx.playBeep(1400, 'triangle', 0.1);
                        setLogs((prev) => [
                          { id: Date.now(), time: new Date().toTimeString().split(' ')[0], text: `⚡ BOOST DIRECTIVE ACK: ${activeZone.shortName} prioritized`, type: 'info' },
                          ...prev,
                        ]);
                      }}
                      className="py-2.5 px-3 rounded-xl bg-emerald-500/15 hover:bg-emerald-500/25 border border-emerald-500/40 text-emerald-300 font-mono text-[11px] font-semibold flex items-center justify-center gap-1 transition-all shadow-[0_0_12px_rgba(16,185,129,0.15)]"
                    >
                      <Zap className="w-3.5 h-3.5" />
                      Optimize Load
                    </button>
                    <button
                      onClick={() => {
                        sfx.playBeep(800, 'sine', 0.08);
                        setLogs((prev) => [
                          { id: Date.now(), time: new Date().toTimeString().split(' ')[0], text: `📡 DIAGNOSTIC PING SENT TO ${activeZone.shortName}`, type: 'info' },
                          ...prev,
                        ]);
                      }}
                      className="py-2.5 px-3 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-white/70 hover:text-white font-mono text-[11px] flex items-center justify-center gap-1 transition-all"
                    >
                      <RefreshCw className="w-3 h-3" />
                      Ping Node
                    </button>
                  </div>
                </div>
              );
            })()
          ) : (
            /* Standby State */
            <div className="flex flex-col items-center justify-center h-full text-center p-6 space-y-4 text-white/40">
              <div className="w-16 h-16 rounded-full border border-white/15 flex items-center justify-center animate-spin-slow">
                <Radio className="w-7 h-7 text-white/40 animate-pulse" />
              </div>
              <div>
                <h4 className="text-sm font-semibold text-white">Select a Hotspot Beacon</h4>
                <p className="text-xs text-white/40 mt-1 max-w-xs font-mono">
                  Click any pulsing sensor beacon on the aerial view to engage real-time node diagnostics.
                </p>
              </div>
              <div className="w-full pt-4 border-t border-white/10 space-y-2">
                {CAMPUS_ZONES.slice(0, 3).map((z) => (
                  <button
                    key={z.id}
                    onClick={() => handlePinClick(z)}
                    className="w-full py-2 px-3 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 flex items-center justify-between text-xs font-mono text-white/70 hover:text-white transition-all"
                  >
                    <span>{z.name}</span>
                    <ChevronRight className="w-3.5 h-3.5 text-white/40" />
                  </button>
                ))}
              </div>
            </div>
          )}
          </div>
        )}

        {/* Closed HUD Quick Opener Button */}
        {!hudOpen && (
          <button
            onClick={() => {
              sfx.playBeep(900, 'sine', 0.03);
              setHudOpen(true);
            }}
            className="absolute top-4 right-4 z-40 px-3 py-1.5 rounded-xl bg-black/80 backdrop-blur-md border border-emerald-500/40 text-emerald-300 text-xs font-mono flex items-center gap-2 hover:bg-black transition-all shadow-[0_0_16px_rgba(16,185,129,0.25)]"
          >
            <Activity className="w-3.5 h-3.5 text-emerald-400 animate-pulse" />
            <span>Open Telemetry HUD</span>
          </button>
        )}
      </div>
    </div>
  </div>
  );
}
