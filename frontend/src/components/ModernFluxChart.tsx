import React, { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import {
  Activity,
  Zap,
  Droplets,
  Wind,
  Play,
  Pause,
  BarChart2,
  TrendingUp,
  Layers,
  Box,
  Sparkles,
  AlertCircle,
  RefreshCw,
  Compass,
} from 'lucide-react';

interface ModernFluxChartProps {
  activeMetricTab: 'power' | 'water' | 'carbon';
  selectedZone: string | null;
  onClearSectorFilter?: () => void;
}

interface DataPoint {
  time: string;
  val: number;
  baseline: number;
  forecast?: number;
  isSpike?: boolean;
}

export default function ModernFluxChart({
  activeMetricTab,
  selectedZone,
  onClearSectorFilter,
}: ModernFluxChartProps) {
  // Chart visual states
  const [isLiveStreaming, setIsLiveStreaming] = useState(true);
  const [chartMode, setChartMode] = useState<'ribbon' | 'bars' | 'oscilloscope'>('ribbon');
  const [is3DIsometric, setIs3DIsometric] = useState(false);
  const [timeframe, setTimeframe] = useState<'live' | '15m' | '24h' | 'forecast'>('live');
  const [hoveredIdx, setHoveredIdx] = useState<number | null>(null);
  const [streamTick, setStreamTick] = useState(0);

  // Unit and metric config
  const metricConfig = useMemo(() => {
    switch (activeMetricTab) {
      case 'water':
        return {
          unit: 'L/min',
          baseVal: 180,
          maxVal: 450,
          color: '#38bdf8',
          glow: 'rgba(56, 189, 248, 0.4)',
          gradientId: 'waterFluxGrad',
          label: 'Hydrology Flow Stream',
        };
      case 'carbon':
        return {
          unit: 'tCO₂e',
          baseVal: 32,
          maxVal: 65,
          color: '#a78bfa',
          glow: 'rgba(167, 139, 250, 0.4)',
          gradientId: 'carbonFluxGrad',
          label: 'Carbon Offset Flux',
        };
      case 'power':
      default:
        return {
          unit: 'kW',
          baseVal: 520,
          maxVal: 850,
          color: '#34d399',
          glow: 'rgba(52, 211, 153, 0.45)',
          gradientId: 'powerFluxGrad',
          label: 'Electrical Power Grid Flux',
        };
    }
  }, [activeMetricTab]);

  // Initial streaming data generation (20 data points)
  const [streamData, setStreamData] = useState<DataPoint[]>(() => {
    const base = activeMetricTab === 'water' ? 180 : activeMetricTab === 'carbon' ? 32 : 520;
    const now = Date.now();
    return Array.from({ length: 22 }, (_, i) => {
      const d = new Date(now - (21 - i) * 3000);
      const timeStr = d.toTimeString().split(' ')[0].substring(3, 8); // mm:ss
      const v = +(base + Math.sin(i * 0.4) * (base * 0.22) + (Math.random() - 0.5) * (base * 0.12)).toFixed(1);
      const b = +(base + Math.sin(i * 0.4) * (base * 0.15)).toFixed(1);
      return {
        time: timeStr,
        val: v,
        baseline: b,
        forecast: +(v * (1 + (Math.random() - 0.48) * 0.05)).toFixed(1),
      };
    });
  });

  // Re-seed data on metric change
  useEffect(() => {
    const base = metricConfig.baseVal;
    const now = Date.now();
    setStreamData(
      Array.from({ length: 22 }, (_, i) => {
        const d = new Date(now - (21 - i) * 3000);
        const timeStr = d.toTimeString().split(' ')[0].substring(3, 8);
        const v = +(base + Math.sin(i * 0.4) * (base * 0.22) + (Math.random() - 0.5) * (base * 0.12)).toFixed(1);
        const b = +(base + Math.sin(i * 0.4) * (base * 0.15)).toFixed(1);
        return {
          time: timeStr,
          val: v,
          baseline: b,
          forecast: +(v * (1 + (Math.random() - 0.48) * 0.05)).toFixed(1),
        };
      })
    );
  }, [activeMetricTab, metricConfig]);

  // Real-time 60 FPS streaming interval
  useEffect(() => {
    if (!isLiveStreaming) return;
    const interval = setInterval(() => {
      setStreamData((prev) => {
        const base = metricConfig.baseVal;
        const last = prev[prev.length - 1];
        const now = new Date();
        const timeStr = now.toTimeString().split(' ')[0].substring(3, 8);

        // Smooth physics-based jitter
        const drift = (Math.random() - 0.48) * (base * 0.15);
        const isSpike = Math.random() > 0.88;
        const spikeMultiplier = isSpike ? (Math.random() > 0.5 ? 1.25 : 0.8) : 1.0;
        const rawVal = (last ? last.val * 0.7 + (base + drift) * 0.3 : base) * spikeMultiplier;
        const newVal = +Math.max(10, Math.min(metricConfig.maxVal, rawVal)).toFixed(1);
        const newBase = +(base + Math.sin(Date.now() / 15000) * (base * 0.14)).toFixed(1);

        const newPoint: DataPoint = {
          time: timeStr,
          val: newVal,
          baseline: newBase,
          forecast: +(newVal * 0.98 + (Math.random() - 0.5) * (base * 0.06)).toFixed(1),
          isSpike,
        };

        return [...prev.slice(1), newPoint];
      });
      setStreamTick((t) => t + 1);
    }, 1500);

    return () => clearInterval(interval);
  }, [isLiveStreaming, metricConfig]);

  // Graph geometry
  const svgW = 860;
  const svgH = 260;
  const padX = 40;
  const padY = 32;
  const usableW = svgW - padX * 2;
  const usableH = svgH - padY * 2;

  const currentValues = streamData.map((d) => d.val);
  const maxInStream = Math.max(...currentValues, metricConfig.baseVal * 1.35) * 1.1;
  const minInStream = Math.max(0, Math.min(...currentValues, metricConfig.baseVal * 0.6) * 0.85);
  const range = maxInStream - minInStream || 1;

  // Normalized coordinates
  const coords = useMemo(() => {
    return streamData.map((p, i) => {
      const x = padX + (i / (streamData.length - 1)) * usableW;
      const y = svgH - padY - ((p.val - minInStream) / range) * usableH;
      return { x, y, data: p };
    });
  }, [streamData, usableW, usableH, minInStream, range]);

  const baselineCoords = useMemo(() => {
    return streamData.map((p, i) => {
      const x = padX + (i / (streamData.length - 1)) * usableW;
      const y = svgH - padY - ((p.baseline - minInStream) / range) * usableH;
      return { x, y };
    });
  }, [streamData, usableW, usableH, minInStream, range]);

  // Smooth Catmull-Rom or Bezier path constructor
  const createSmoothPath = useCallback((pts: { x: number; y: number }[]) => {
    if (!pts.length) return '';
    let d = `M ${pts[0].x} ${pts[0].y}`;
    for (let i = 0; i < pts.length - 1; i++) {
      const p0 = pts[i === 0 ? 0 : i - 1];
      const p1 = pts[i];
      const p2 = pts[i + 1];
      const p3 = pts[i + 2 < pts.length ? i + 2 : i + 1];
      const cp1x = p1.x + (p2.x - p0.x) / 6;
      const cp1y = p1.y + (p2.y - p0.y) / 6;
      const cp2x = p2.x - (p3.x - p1.x) / 6;
      const cp2y = p2.y - (p3.y - p1.y) / 6;
      d += ` C ${cp1x} ${cp1y}, ${cp2x} ${cp2y}, ${p2.x} ${p2.y}`;
    }
    return d;
  }, []);

  const linePath = useMemo(() => createSmoothPath(coords), [coords, createSmoothPath]);
  const baselinePath = useMemo(() => createSmoothPath(baselineCoords), [baselineCoords, createSmoothPath]);
  const areaPath = useMemo(() => {
    if (!coords.length) return '';
    return `${linePath} L ${coords[coords.length - 1].x} ${svgH - padY} L ${coords[0].x} ${svgH - padY} Z`;
  }, [linePath, coords, svgH, padY]);

  // Latest readout
  const latestPoint = streamData[streamData.length - 1] || { val: 0, baseline: 0 };
  const latestDelta = +(latestPoint.val - latestPoint.baseline).toFixed(1);
  const isOptimal = latestDelta <= 0;

  return (
    <div className="flex flex-col gap-3 font-sans select-none">

      {/* ── Control Ribbon: Modes, 3D Isometric View & Real-time Toggles ─────── */}
      <div className="flex flex-wrap items-center justify-between gap-3 text-xs font-mono pb-1 border-b border-white/5">
        
        {/* Visual Graph Mode Selector */}
        <div className="flex items-center gap-1 p-1 rounded-xl bg-black/40 border border-white/10">
          <span className="text-[10px] text-white/30 uppercase px-2 flex items-center gap-1">
            <Layers className="w-3 h-3" /> Graph Style:
          </span>
          {[
            { id: 'ribbon', label: '⚡ Flux Ribbon' },
            { id: 'bars', label: '📊 Cyber-Bars' },
            { id: 'oscilloscope', label: '〰️ Scope' },
          ].map((mode) => (
            <button
              key={mode.id}
              onClick={() => setChartMode(mode.id as typeof chartMode)}
              className={`px-3 py-1 rounded-lg transition-all duration-200 ${
                chartMode === mode.id
                  ? 'bg-white/20 text-white font-semibold shadow-[0_0_12px_rgba(255,255,255,0.15)] border border-white/20'
                  : 'text-white/40 hover:text-white/80 hover:bg-white/5'
              }`}
            >
              {mode.label}
            </button>
          ))}
        </div>

        {/* 3D Perspective Tilt Button & Live Stream Controls */}
        <div className="flex items-center gap-2">
          {/* 3D Isometric View Toggle */}
          <button
            onClick={() => setIs3DIsometric((v) => !v)}
            className={`px-3 py-1.5 rounded-xl border flex items-center gap-1.5 transition-all text-xs ${
              is3DIsometric
                ? 'bg-cyan-500/20 border-cyan-400/50 text-cyan-200 shadow-[0_0_16px_rgba(6,182,212,0.3)]'
                : 'bg-white/5 border-white/10 text-white/40 hover:text-white/80'
            }`}
          >
            <Box className="w-3.5 h-3.5" />
            <span>{is3DIsometric ? '3D Isometric' : '2D View'}</span>
          </button>

          {/* Live Play / Pause Streaming */}
          <button
            onClick={() => setIsLiveStreaming((v) => !v)}
            className={`px-3 py-1.5 rounded-xl border flex items-center gap-1.5 transition-all text-xs ${
              isLiveStreaming
                ? 'bg-emerald-500/15 border-emerald-500/40 text-emerald-300 shadow-[0_0_12px_rgba(16,185,129,0.2)]'
                : 'bg-amber-500/15 border-amber-500/40 text-amber-300'
            }`}
          >
            {isLiveStreaming ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
            <span>{isLiveStreaming ? 'LIVE (1.5s)' : 'PAUSED'}</span>
          </button>

          {/* Timeframe Presets */}
          <div className="flex items-center gap-0.5 p-0.5 rounded-xl bg-black/40 border border-white/10 text-[10px]">
            {[
              { id: 'live', label: 'LIVE' },
              { id: '15m', label: '15M' },
              { id: '24h', label: '24H' },
              { id: 'forecast', label: 'AI FORECAST' },
            ].map((tf) => (
              <button
                key={tf.id}
                onClick={() => setTimeframe(tf.id as typeof timeframe)}
                className={`px-2 py-1 rounded-lg transition-all ${
                  timeframe === tf.id
                    ? 'bg-white/15 text-white font-bold'
                    : 'text-white/40 hover:text-white/70'
                }`}
              >
                {tf.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* ── Active Readouts & Anomaly Indicators ─────────────────────────────── */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2">
        <div className="p-2.5 rounded-xl bg-white/[0.03] border border-white/5">
          <div className="text-[10px] font-mono uppercase text-white/40">Instant Flux</div>
          <div className="text-xl font-black text-white font-mono mt-0.5 flex items-baseline gap-1 tabular-nums">
            {latestPoint.val}
            <span className="text-xs font-normal text-white/40">{metricConfig.unit}</span>
          </div>
          <div className="text-[10px] font-mono mt-0.5 flex items-center gap-1" style={{ color: metricConfig.color }}>
            <span className="w-1.5 h-1.5 rounded-full animate-ping" style={{ background: metricConfig.color }} />
            <span>Streaming Frame #{streamTick}</span>
          </div>
        </div>

        <div className="p-2.5 rounded-xl bg-white/[0.03] border border-white/5">
          <div className="text-[10px] font-mono uppercase text-white/40">Baseline Target</div>
          <div className="text-xl font-black text-white font-mono mt-0.5 tabular-nums">
            {latestPoint.baseline} <span className="text-xs font-normal text-white/40">{metricConfig.unit}</span>
          </div>
          <div className="text-[10px] font-mono text-white/40 mt-0.5">Automated Target Model</div>
        </div>

        <div className="p-2.5 rounded-xl bg-white/[0.03] border border-white/5">
          <div className="text-[10px] font-mono uppercase text-white/40">Variance Delta</div>
          <div className={`text-xl font-black font-mono mt-0.5 tabular-nums ${isOptimal ? 'text-emerald-400' : 'text-amber-400'}`}>
            {latestDelta > 0 ? `+${latestDelta}` : latestDelta} <span className="text-xs font-normal text-white/40">{metricConfig.unit}</span>
          </div>
          <div className="text-[10px] font-mono mt-0.5 text-white/50">
            {isOptimal ? '● -6.4% Below Ceiling' : '▲ Spike Tolerance Checked'}
          </div>
        </div>

        <div className="p-2.5 rounded-xl bg-white/[0.03] border border-white/5">
          <div className="text-[10px] font-mono uppercase text-white/40">System Coherence</div>
          <div className="text-xl font-black text-emerald-400 font-mono mt-0.5 tabular-nums">
            98.8%
          </div>
          <div className="text-[10px] font-mono text-white/40 mt-0.5 flex items-center gap-1">
            <Sparkles className="w-3 h-3 text-cyan-400" />
            <span>Zero Packet Drop</span>
          </div>
        </div>
      </div>

      {/* ── Main Canvas Viewport (With 3D Isometric Tilt Option) ────────────── */}
      <div
        className="relative mt-2 p-2 rounded-2xl overflow-hidden transition-all duration-700"
        style={{
          perspective: is3DIsometric ? '1200px' : 'none',
        }}
      >
        <div
          className="relative transition-all duration-700 ease-out"
          style={{
            transform: is3DIsometric ? 'rotateX(32deg) rotateY(-8deg) rotateZ(2deg) scale(0.96)' : 'none',
            transformOrigin: 'center center',
          }}
        >
          {/* 3D Depth Shadow & Grid Floor */}
          {is3DIsometric && (
            <div
              className="absolute -inset-4 rounded-3xl -z-10 pointer-events-none"
              style={{
                background: 'radial-gradient(ellipse at center, rgba(6, 182, 212, 0.15) 0%, transparent 70%)',
                boxShadow: '0 30px 60px -10px rgba(0, 0, 0, 0.9)',
                transform: 'translateZ(-40px)',
              }}
            />
          )}

          {/* SVG Canvas */}
          <svg
            viewBox={`0 0 ${svgW} ${svgH}`}
            className="w-full h-64 sm:h-72 overflow-visible"
          >
            <defs>
              {/* Vibrant Liquid Glass Area Gradient */}
              <linearGradient id={metricConfig.gradientId} x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor={metricConfig.color} stopOpacity="0.35" />
                <stop offset="45%" stopColor={metricConfig.color} stopOpacity="0.10" />
                <stop offset="100%" stopColor={metricConfig.color} stopOpacity="0.00" />
              </linearGradient>

              {/* Baseline Guide Gradient */}
              <linearGradient id="baselineGuideGrad" x1="0" y1="0" x2="1" y2="0">
                <stop offset="0%" stopColor="rgba(255,255,255,0.1)" />
                <stop offset="50%" stopColor="rgba(255,255,255,0.35)" />
                <stop offset="100%" stopColor="rgba(255,255,255,0.1)" />
              </linearGradient>

              {/* Bar Column Gradient */}
              <linearGradient id="cyberBarGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor={metricConfig.color} stopOpacity="0.9" />
                <stop offset="70%" stopColor={metricConfig.color} stopOpacity="0.25" />
                <stop offset="100%" stopColor={metricConfig.color} stopOpacity="0.05" />
              </linearGradient>

              {/* Glow Filter */}
              <filter id="neonCurveGlow" x="-20%" y="-20%" width="140%" height="140%">
                <feGaussianBlur stdDeviation="4" result="blur" />
                <feMerge>
                  <feMergeNode in="blur" />
                  <feMergeNode in="SourceGraphic" />
                </feMerge>
              </filter>
            </defs>

            {/* Background Grid Horizontal Lines */}
            {[0.15, 0.45, 0.75].map((ratio, idx) => {
              const y = svgH - padY - ratio * usableH;
              return (
                <g key={idx}>
                  <line
                    x1={padX}
                    y1={y}
                    x2={svgW - padX}
                    y2={y}
                    stroke="rgba(255,255,255,0.07)"
                    strokeDasharray="4 4"
                  />
                  <text
                    x={padX - 8}
                    y={y + 3}
                    textAnchor="end"
                    fill="rgba(255,255,255,0.25)"
                    fontSize="9"
                    fontFamily="monospace"
                  >
                    {+(minInStream + ratio * range).toFixed(0)}
                  </text>
                </g>
              );
            })}

            {/* Baseline Target Curve */}
            <path
              d={baselinePath}
              fill="none"
              stroke="url(#baselineGuideGrad)"
              strokeWidth="1.8"
              strokeDasharray="6 6"
            />

            {/* ── Mode 1: FLUX RIBBON ────────────────────────────────────────── */}
            {chartMode === 'ribbon' && (
              <>
                {/* 3D Vertical Drop Pillars (visible in 3D Isometric mode) */}
                {is3DIsometric &&
                  coords.map((pt, i) => (
                    <line
                      key={`pillar-${i}`}
                      x1={pt.x}
                      y1={pt.y}
                      x2={pt.x}
                      y2={svgH - padY}
                      stroke={metricConfig.color}
                      strokeOpacity="0.2"
                      strokeWidth="1.5"
                      strokeDasharray="2 3"
                    />
                  ))}

                {/* Shaded Area with Glass Glow */}
                <path
                  d={areaPath}
                  fill={`url(#${metricConfig.gradientId})`}
                  className="transition-all duration-500 ease-out"
                />

                {/* Foreground High-Intensity Glowing Curve */}
                <path
                  d={linePath}
                  fill="none"
                  stroke={metricConfig.color}
                  strokeWidth="3"
                  strokeLinecap="round"
                  filter="url(#neonCurveGlow)"
                  className="transition-all duration-500 ease-out"
                />

                {/* AI Forecast Dotted Horizon (if forecast timeframe selected) */}
                {timeframe === 'forecast' && (
                  <path
                    d={createSmoothPath(
                      coords.map((c) => ({
                        x: c.x,
                        y: c.y - 12 + Math.sin(c.x * 0.05) * 8,
                      }))
                    )}
                    fill="none"
                    stroke="#a78bfa"
                    strokeWidth="2"
                    strokeDasharray="3 4"
                    strokeOpacity="0.8"
                  />
                )}
              </>
            )}

            {/* ── Mode 2: CYBER-BARS (Equalizer Columns) ────────────────────── */}
            {chartMode === 'bars' && (
              <g>
                {coords.map((pt, i) => {
                  const barW = Math.max(8, usableW / (coords.length * 1.8));
                  const barH = svgH - padY - pt.y;
                  const isHovered = hoveredIdx === i;

                  return (
                    <g key={i}>
                      {/* Bar Column */}
                      <rect
                        x={pt.x - barW / 2}
                        y={pt.y}
                        width={barW}
                        height={barH}
                        rx={3}
                        fill="url(#cyberBarGrad)"
                        stroke={isHovered ? '#ffffff' : metricConfig.color}
                        strokeWidth={isHovered ? 1.5 : 0.5}
                        strokeOpacity={isHovered ? 1 : 0.4}
                        className="transition-all duration-300"
                      />
                      {/* Floating Peak Cap */}
                      <rect
                        x={pt.x - barW / 2}
                        y={Math.max(padY, pt.y - 4)}
                        width={barW}
                        height={2}
                        rx={1}
                        fill="#ffffff"
                        opacity={isHovered ? 1 : 0.8}
                        filter="drop-shadow(0 0 4px #ffffff)"
                      />
                    </g>
                  );
                })}
              </g>
            )}

            {/* ── Mode 3: DUAL-STREAM OSCILLOSCOPE ──────────────────────────── */}
            {chartMode === 'oscilloscope' && (
              <g>
                {/* Secondary Inverted Echo Wave */}
                <path
                  d={createSmoothPath(
                    coords.map((c, i) => ({
                      x: c.x,
                      y: svgH / 2 + Math.sin(i * 0.5 + streamTick * 0.2) * 28,
                    }))
                  )}
                  fill="none"
                  stroke="#38bdf8"
                  strokeWidth="1.5"
                  strokeOpacity="0.45"
                  strokeDasharray="4 4"
                />

                {/* Primary High-Voltage Waveform */}
                <path
                  d={linePath}
                  fill="none"
                  stroke={metricConfig.color}
                  strokeWidth="2.5"
                  filter="url(#neonCurveGlow)"
                />
              </g>
            )}

            {/* ── Interactive Data Crosshair Nodes & Tooltip Targets ────────── */}
            {coords.map((pt, i) => {
              const isHovered = hoveredIdx === i;
              const isLatest = i === coords.length - 1;

              return (
                <g
                  key={i}
                  className="cursor-pointer"
                  onMouseEnter={() => setHoveredIdx(i)}
                  onMouseLeave={() => setHoveredIdx(null)}
                >
                  {/* Vertical Guide Laser on Hover */}
                  {isHovered && (
                    <line
                      x1={pt.x}
                      y1={padY}
                      x2={pt.x}
                      y2={svgH - padY}
                      stroke="rgba(255,255,255,0.4)"
                      strokeWidth="1"
                      strokeDasharray="3 3"
                    />
                  )}

                  {/* Wide Hit Area */}
                  <circle cx={pt.x} cy={pt.y} r="18" fill="transparent" />

                  {/* Core Node Marker */}
                  <circle
                    cx={pt.x}
                    cy={pt.y}
                    r={isHovered ? 7 : isLatest ? 5.5 : 3.5}
                    fill="#0B0F19"
                    stroke={isHovered ? '#ffffff' : metricConfig.color}
                    strokeWidth={isHovered ? 3 : 2}
                    className="transition-all duration-200"
                    style={{
                      filter: isHovered || isLatest ? `drop-shadow(0 0 8px ${metricConfig.color})` : 'none',
                    }}
                  />

                  {/* Animated Radar Pulse on the Latest Incoming Stream Head */}
                  {isLatest && isLiveStreaming && (
                    <circle
                      cx={pt.x}
                      cy={pt.y}
                      r="12"
                      fill="none"
                      stroke={metricConfig.color}
                      strokeWidth="1.5"
                      className="animate-ping"
                    />
                  )}

                  {/* Anomaly Spike Warning Badge */}
                  {pt.data.isSpike && (
                    <g transform={`translate(${pt.x - 8}, ${pt.y - 24})`}>
                      <rect width="16" height="16" rx="4" fill="#ef4444" opacity="0.9" />
                      <text x="8" y="11" textAnchor="middle" fill="#fff" fontSize="10" fontWeight="bold">!</text>
                    </g>
                  )}
                </g>
              );
            })}
          </svg>

          {/* ── Dynamic Floating HUD Tooltip ───────────────────────────────── */}
          {hoveredIdx !== null && coords[hoveredIdx] && (
            <div
              className="absolute -top-3 px-3.5 py-2.5 rounded-xl bg-black/90 backdrop-blur-xl border border-white/20 shadow-[0_12px_36px_rgba(0,0,0,0.8)] pointer-events-none transition-all duration-150 transform -translate-x-1/2 z-50 text-xs font-mono"
              style={{
                left: `${(coords[hoveredIdx].x / svgW) * 100}%`,
              }}
            >
              <div className="flex items-center justify-between gap-3 text-[10px] text-white/50 border-b border-white/10 pb-1 mb-1">
                <span>TIMESTAMP</span>
                <span className="text-white font-bold">{coords[hoveredIdx].data.time}</span>
              </div>
              <div className="text-base font-extrabold text-white flex items-baseline gap-1">
                {coords[hoveredIdx].data.val}
                <span className="text-xs font-normal text-white/50">{metricConfig.unit}</span>
              </div>
              <div className="text-[10px] text-white/60 flex items-center justify-between gap-4 mt-1">
                <span>Baseline: {coords[hoveredIdx].data.baseline}</span>
                <span
                  style={{
                    color: coords[hoveredIdx].data.val <= coords[hoveredIdx].data.baseline ? '#34d399' : '#f59e0b',
                  }}
                >
                  {(coords[hoveredIdx].data.val - coords[hoveredIdx].data.baseline).toFixed(1)} Δ
                </span>
              </div>
            </div>
          )}
        </div>

        {/* ── Chart Timeline Footer ────────────────────────────────────────── */}
        <div className="flex justify-between px-6 pt-3 text-[10px] font-mono text-white/40 border-t border-white/5">
          {streamData
            .filter((_, idx) => idx % 3 === 0)
            .map((p, idx) => (
              <span key={idx} className="flex items-center gap-1">
                <span className="w-1 h-1 rounded-full bg-white/20" />
                {p.time}
              </span>
            ))}
          <span className="text-emerald-400 font-bold flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
            LIVE HEAD
          </span>
        </div>
      </div>
    </div>
  );
}
