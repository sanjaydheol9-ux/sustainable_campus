import React, { useState, useMemo } from 'react';
import CampusImageViewer from './components/CampusImageViewer';
import ModernFluxChart from './components/ModernFluxChart';

// --- Monochromatic Minimalist Icons (Pure Inline SVGs for zero dependency overhead) ---
const Icons = {
  Box3D: () => (
    <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
      <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z" />
      <polyline points="3.27 6.96 12 12.01 20.73 6.96" />
      <line x1="12" y1="22.08" x2="12" y2="12" />
    </svg>
  ),
  Grid: () => (
    <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="3" width="7" height="7" rx="1.5" />
      <rect x="14" y="3" width="7" height="7" rx="1.5" />
      <rect x="14" y="14" width="7" height="7" rx="1.5" />
      <rect x="3" y="14" width="7" height="7" rx="1.5" />
    </svg>
  ),
  Activity: () => (
    <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="22 12 18 12 15 21 9 3 6 12 2 12" />
    </svg>
  ),
  Layers: () => (
    <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
      <polygon points="12 2 2 7 12 12 22 7 12 2" />
      <polyline points="2 17 12 22 22 17" />
      <polyline points="2 12 12 17 22 12" />
    </svg>
  ),
  ShieldAlert: () => (
    <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
      <line x1="12" y1="8" x2="12" y2="12" />
      <line x1="12" y1="16" x2="12.01" y2="16" />
    </svg>
  ),
  Sliders: () => (
    <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
      <line x1="4" y1="21" x2="4" y2="14" />
      <line x1="4" y1="10" x2="4" y2="3" />
      <line x1="12" y1="21" x2="12" y2="12" />
      <line x1="12" y1="8" x2="12" y2="3" />
      <line x1="20" y1="21" x2="20" y2="16" />
      <line x1="20" y1="12" x2="20" y2="3" />
      <line x1="1" y1="14" x2="7" y2="14" />
      <line x1="9" y1="8" x2="15" y2="8" />
      <line x1="17" y1="16" x2="23" y2="16" />
    </svg>
  ),
  Search: () => (
    <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="11" cy="11" r="8" />
      <line x1="21" y1="21" x2="16.65" y2="16.65" />
    </svg>
  ),
  Bell: () => (
    <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
      <path d="M13.73 21a2 2 0 0 1-3.46 0" />
    </svg>
  ),
  ArrowUpRight: () => (
    <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <line x1="7" y1="17" x2="17" y2="7" />
      <polyline points="7 7 17 7 17 17" />
    </svg>
  ),
  TrendingDown: () => (
    <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="23 18 13.5 8.5 8.5 13.5 1 6" />
      <polyline points="17 18 23 18 23 12" />
    </svg>
  ),
  Zap: () => (
    <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" />
    </svg>
  ),
  Droplet: () => (
    <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 2.69l5.66 5.66a8 8 0 1 1-11.31 0z" />
    </svg>
  ),
  Recycle: () => (
    <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M7 19H4.815a1.83 1.83 0 0 1-1.57-.881 1.785 1.785 0 0 1-.004-1.784L7.196 9.5" />
      <path d="M11 19h8.2a1.8 1.8 0 0 0 1.57-.881 1.785 1.785 0 0 0 .004-1.784L16.8 9.5" />
      <path d="M11 5h2a1.8 1.8 0 0 1 1.57.881l3.95 6.84" />
      <polyline points="9 16 11 19 9 22" />
      <polyline points="15 8 13 5 15 2" />
      <polyline points="4 9 7 9.5 5 12" />
    </svg>
  ),
  Cpu: () => (
    <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="4" y="4" width="16" height="16" rx="2" />
      <rect x="9" y="9" width="6" height="6" />
      <line x1="9" y1="1" x2="9" y2="4" />
      <line x1="15" y1="1" x2="15" y2="4" />
      <line x1="9" y1="20" x2="9" y2="23" />
      <line x1="15" y1="20" x2="15" y2="23" />
      <line x1="20" y1="9" x2="23" y2="9" />
      <line x1="20" y1="14" x2="23" y2="14" />
      <line x1="1" y1="9" x2="4" y2="9" />
      <line x1="1" y1="14" x2="4" y2="14" />
    </svg>
  ),
  Check: () => (
    <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="20 6 9 17 4 12" />
    </svg>
  ),
};

// --- Mock Telemetry & Chart Data Sets ---
const CHART_DATA = {
  power: [
    { time: '00:00', val: 240, baseline: 290 },
    { time: '03:00', val: 195, baseline: 280 },
    { time: '06:00', val: 320, baseline: 360 },
    { time: '09:00', val: 580, baseline: 620 },
    { time: '12:00', val: 710, baseline: 790 },
    { time: '15:00', val: 640, baseline: 740 },
    { time: '18:00', val: 490, baseline: 560 },
    { time: '21:00', val: 380, baseline: 430 },
    { time: '23:59', val: 295, baseline: 340 },
  ],
  water: [
    { time: '00:00', val: 42, baseline: 60 },
    { time: '03:00', val: 28, baseline: 45 },
    { time: '06:00', val: 95, baseline: 110 },
    { time: '09:00', val: 180, baseline: 210 },
    { time: '12:00', val: 240, baseline: 275 },
    { time: '15:00', val: 215, baseline: 250 },
    { time: '18:00', val: 140, baseline: 170 },
    { time: '21:00', val: 85, baseline: 105 },
    { time: '23:59', val: 50, baseline: 70 },
  ],
  carbon: [
    { time: '00:00', val: 12.2, baseline: 15.0 },
    { time: '03:00', val: 9.8, baseline: 14.5 },
    { time: '06:00', val: 16.4, baseline: 19.2 },
    { time: '09:00', val: 28.6, baseline: 33.0 },
    { time: '12:00', val: 34.2, baseline: 41.5 },
    { time: '15:00', val: 31.0, baseline: 38.0 },
    { time: '18:00', val: 24.5, baseline: 29.5 },
    { time: '21:00', val: 19.0, baseline: 23.0 },
    { time: '23:59', val: 14.5, baseline: 18.0 },
  ],
};

const ZONES_DATA = [
  { id: 1, name: 'Zone 01 · North Hall', type: 'Academic', load: '142.8 kW', flow: '34 L/m', health: '99.2%', status: 'Nominal' },
  { id: 2, name: 'Zone 02 · Central Library', type: 'Public / Study', load: '188.4 kW', flow: '48 L/m', health: '97.5%', status: 'Nominal' },
  { id: 3, name: 'Zone 03 · Science Complex', type: 'Laboratory', load: '286.2 kW', flow: '92 L/m', health: '94.8%', status: 'Optimizing' },
  { id: 4, name: 'Zone 04 · Innovation Quad', type: 'Engineering', load: '194.0 kW', flow: '22 L/m', health: '98.9%', status: 'Nominal' },
];

const INITIAL_ACTIVITIES = [
  {
    id: 101,
    title: 'Autonomous HVAC Load Throttling',
    zone: 'Zone 02 · Central Library',
    time: '2m ago',
    type: 'DIRECTIVE',
    metric: '-24.6 kW Peak',
    severity: 'INFO',
  },
  {
    id: 102,
    title: 'Greywater Cistern Valve Rerouted',
    zone: 'Zone 03 · Science Complex',
    time: '14m ago',
    type: 'HYDROLOGY',
    metric: '+120 L Recaptured',
    severity: 'WATCH',
  },
  {
    id: 103,
    title: 'Compactor Matrix Telemetry Synced',
    zone: 'Zone 04 · Innovation Quad',
    time: '36m ago',
    type: 'MATERIAL',
    metric: '92.4% Densified',
    severity: 'INFO',
  },
  {
    id: 104,
    title: 'Zero Occupancy Micro-Grid Power Cut',
    zone: 'Zone 01 · North Hall',
    time: '1h 12m ago',
    type: 'EFFICIENCY',
    metric: '-18.2 kWh Preserved',
    severity: 'CRITICAL',
  },
  {
    id: 105,
    title: 'Rule Engine Deterministic Sweep Completed',
    zone: 'Campus Wide Core',
    time: '1h 45m ago',
    type: 'SYSTEM',
    metric: '4 Zones Checked',
    severity: 'INFO',
  },
];

export default function App() {
  const [activeNav, setActiveNav] = useState('dashboard');
  const [activeMetricTab, setActiveMetricTab] = useState<'power' | 'water' | 'carbon'>('power');
  const [viewMode, setViewMode] = useState<'analytics' | '3d'>('analytics');
  const [selectedZone, setSelectedZone] = useState<string | null>(null);
  const [timeframe, setTimeframe] = useState('24H');
  const [searchQuery, setSearchQuery] = useState('');
  const [hoveredDataPoint, setHoveredDataPoint] = useState<number | null>(null);
  const [activities, setActivities] = useState(INITIAL_ACTIVITIES);
  const [acknowledgedAlerts, setAcknowledgedAlerts] = useState<number[]>([]);

  // Filter activities based on search input
  const filteredActivities = useMemo(() => {
    if (!searchQuery.trim()) return activities;
    const q = searchQuery.toLowerCase();
    return activities.filter(
      (a) => a.title.toLowerCase().includes(q) || a.zone.toLowerCase().includes(q) || a.type.toLowerCase().includes(q)
    );
  }, [activities, searchQuery]);

  const activePoints = CHART_DATA[activeMetricTab];
  const maxVal = Math.max(...activePoints.map((p) => Math.max(p.val, p.baseline)));

  // SVG Area Chart calculations
  const svgWidth = 800;
  const svgHeight = 260;
  const paddingX = 40;
  const paddingY = 30;

  const getCoordinates = (points: { val: number }[]) => {
    const usableW = svgWidth - paddingX * 2;
    const usableH = svgHeight - paddingY * 2;
    return points.map((p, i) => {
      const x = paddingX + (i / (points.length - 1)) * usableW;
      const y = svgHeight - paddingY - (p.val / (maxVal * 1.15)) * usableH;
      return { x, y };
    });
  };

  const coords = getCoordinates(activePoints);
  const baselineCoords = activePoints.map((p, i) => {
    const usableW = svgWidth - paddingX * 2;
    const usableH = svgHeight - paddingY * 2;
    const x = paddingX + (i / (activePoints.length - 1)) * usableW;
    const y = svgHeight - paddingY - (p.baseline / (maxVal * 1.15)) * usableH;
    return { x, y };
  });

  // Construct smooth SVG path using Catmull-Rom or Bezier
  const createSmoothPath = (pts: { x: number; y: number }[]) => {
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
  };

  const areaPathString = `${createSmoothPath(coords)} L ${coords[coords.length - 1].x} ${svgHeight - paddingY} L ${coords[0].x} ${svgHeight - paddingY} Z`;
  const linePathString = createSmoothPath(coords);
  const baselineLinePath = createSmoothPath(baselineCoords);

  const toggleAlertAck = (id: number) => {
    setAcknowledgedAlerts((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  return (
    <div className="relative min-h-screen bg-[#0B0F19] text-white selection:bg-white/20 selection:text-white font-sans overflow-x-hidden flex flex-col antialiased">
      
      {/* =========================================================================
          FLUID LIQUID BACKGROUND: Animated Monochromatic Gradient Orbs
          Strictly tints & shades of Obsidian (#0B0F19) with high blur and drift
      ========================================================================== */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden z-0" aria-hidden="true">
        {/* Deep ambient radial glow */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[160vw] h-[160vh] bg-[radial-gradient(circle_at_center,rgba(255,255,255,0.015)_0%,transparent_70%)]" />

        {/* Liquid Orb 1: Upper Left to Center */}
        <div className="absolute -top-40 -left-40 w-[640px] h-[640px] rounded-full bg-gradient-to-br from-[#1E293B]/25 via-[#131927]/20 to-transparent blur-[140px] animate-orb-drift-1" />

        {/* Liquid Orb 2: Bottom Right to Center */}
        <div className="absolute -bottom-60 -right-60 w-[780px] h-[780px] rounded-full bg-gradient-to-tl from-[#334155]/20 via-[#131927]/30 to-transparent blur-[160px] animate-orb-drift-2" />

        {/* Liquid Orb 3: Mid-center Floating Resonator */}
        <div className="absolute top-1/3 left-1/2 -translate-x-1/2 w-[520px] h-[520px] rounded-full bg-gradient-to-r from-[#1E293B]/15 to-[#0F1523]/25 blur-[120px] animate-orb-drift-3" />

        {/* Microscopic Grid Texture for Monochromatic Depth */}
        <div 
          className="absolute inset-0 opacity-[0.035]"
          style={{
            backgroundImage: `radial-gradient(rgba(255, 255, 255, 0.4) 1px, transparent 1px)`,
            backgroundSize: '36px 36px',
          }}
        />
      </div>

      {/* =========================================================================
          APPLICATION CONTAINER (Floating Architecture)
      ========================================================================== */}
      <div className="relative z-10 flex min-h-screen p-4 md:p-6 lg:p-8 gap-6 max-w-[1720px] mx-auto w-full">
        
        {/* -----------------------------------------------------------------------
            1. FLOATING SIDEBAR (Vertical Left Navigation Panel)
               Detached from edges, heavy glassmorphism, refractive borders
        ------------------------------------------------------------------------ */}
        <aside className="hidden lg:flex flex-col justify-between w-64 liquid-glass rounded-3xl p-5 sticky top-8 h-[calc(100vh-4rem)] border border-white/10 shadow-[0_8px_32px_0_rgba(0,0,0,0.5)]">
          {/* Top Logo & System Brand */}
          <div className="space-y-8">
            <div className="flex items-center gap-3.5 px-2">
              <div className="w-10 h-10 rounded-2xl bg-white/10 border border-white/20 flex items-center justify-center shadow-[inset_0_1px_1px_rgba(255,255,255,0.25)] relative overflow-hidden group">
                <div className="absolute inset-0 bg-white/5 opacity-0 group-hover:opacity-100 transition-opacity" />
                <div className="w-4 h-4 border-2 border-white/90 rotate-45 flex items-center justify-center">
                  <div className="w-1 h-1 bg-white" />
                </div>
              </div>
              <div>
                <div className="text-sm font-semibold tracking-wider uppercase text-white/95 flex items-center gap-2">
                  AETHERIS
                  <span className="text-[10px] font-mono tracking-normal px-1.5 py-0.5 rounded bg-white/10 text-white/70 border border-white/10">OS</span>
                </div>
                <div className="text-[11px] text-white/40 tracking-tight font-mono">SUS-CAMPUS // V4.2</div>
              </div>
            </div>

            {/* Navigation Items */}
            <nav className="space-y-1.5">
              {[
                { id: 'dashboard', label: 'Overview Grid', icon: Icons.Grid },
                { id: '3d-twin', label: '3D Campus Twin', icon: Icons.Box3D, badge: '3D' },
                { id: 'telemetry', label: 'Live Telemetry', icon: Icons.Activity, badge: 'LIVE' },
                { id: 'zones', label: 'Campus Infrastructure', icon: Icons.Layers },
                { id: 'directives', label: 'Safety & Directives', icon: Icons.ShieldAlert, badge: '4' },
                { id: 'config', label: 'Hardware Matrix', icon: Icons.Sliders },
              ].map((item) => {
                const IconComponent = item.icon;
                const isActive = activeNav === item.id;
                return (
                  <button
                    key={item.id}
                    onClick={() => {
                      setActiveNav(item.id);
                      if (item.id === '3d-twin') setViewMode('3d');
                      else setViewMode('analytics');
                    }}
                    className={`w-full flex items-center justify-between px-3.5 py-3 rounded-2xl text-xs font-medium tracking-wide transition-all duration-300 group relative ${
                      isActive
                        ? 'bg-white/15 text-white shadow-[inset_0_1px_1px_rgba(255,255,255,0.25),0_4px_16px_rgba(0,0,0,0.4)] border border-white/20'
                        : 'text-white/50 hover:text-white/90 hover:bg-white/[0.05] border border-transparent'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className={`transition-transform duration-300 group-hover:scale-110 ${isActive ? 'text-white' : 'text-white/50 group-hover:text-white'}`}>
                        <IconComponent />
                      </div>
                      <span>{item.label}</span>
                    </div>

                    {item.badge && (
                      <span className={`text-[10px] font-mono px-2 py-0.5 rounded-full border ${
                        item.badge === 'LIVE' 
                          ? 'bg-white/20 text-white border-white/30 animate-pulse'
                          : 'bg-white/10 text-white/70 border-white/10'
                      }`}>
                        {item.badge}
                      </span>
                    )}

                    {isActive && (
                      <span className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-5 bg-white rounded-r-full shadow-[0_0_12px_rgba(255,255,255,0.8)]" />
                    )}
                  </button>
                );
              })}
            </nav>
          </div>

          {/* Bottom Diagnostics / System Nominal Node */}
          <div className="liquid-glass-subtle rounded-2xl p-3.5 border border-white/10 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-mono text-white/50">GRID CONSENSUS</span>
              <span className="w-2 h-2 rounded-full bg-white animate-ping opacity-75" />
            </div>
            <div>
              <div className="text-xs font-semibold text-white/90">99.98% Uptime</div>
              <div className="text-[10px] text-white/40 font-mono mt-0.5">Latency 18ms · Zero Faults</div>
            </div>
            <div className="w-full bg-white/10 h-1 rounded-full overflow-hidden">
              <div className="bg-white/80 h-full w-[94%]" />
            </div>
          </div>
        </aside>

        {/* -----------------------------------------------------------------------
            MAIN CONTENT AREA
        ------------------------------------------------------------------------ */}
        <main className="flex-1 flex flex-col gap-6 min-w-0">
          
          {/* ---------------------------------------------------------------------
              2. TOP HEADER
                 Blurred glass pill search, avatar glow, quick action selectors
          ---------------------------------------------------------------------- */}
          <header className="liquid-glass rounded-3xl px-6 py-4 flex flex-col sm:flex-row items-center justify-between gap-4 border border-white/10 shadow-[0_8px_32px_0_rgba(0,0,0,0.37)]">
            
            {/* Pill Search Bar */}
            <div className="relative w-full sm:w-80 md:w-96 group">
              <div className="absolute inset-y-0 left-3.5 flex items-center pointer-events-none text-white/40 group-focus-within:text-white transition-colors">
                <Icons.Search />
              </div>
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search telemetry, zones, directives..."
                className="w-full bg-white/[0.04] hover:bg-white/[0.07] focus:bg-white/[0.09] text-white placeholder-white/30 text-xs rounded-full pl-10 pr-16 py-2.5 border border-white/10 focus:border-white/30 focus:outline-none transition-all duration-300 shadow-[inset_0_1px_1px_rgba(255,255,255,0.08)]"
              />
              <div className="absolute inset-y-0 right-3 flex items-center pointer-events-none">
                <kbd className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-white/10 text-white/50 border border-white/10">⌘K</kbd>
              </div>
            </div>

            {/* Quick Actions & Profile Area */}
            <div className="flex items-center gap-3 w-full sm:w-auto justify-end">
              {/* Time Interval Tabs */}
              <div className="flex items-center p-1 rounded-full bg-white/[0.04] border border-white/10 text-xs">
                {['1H', '24H', '7D', '30D'].map((t) => (
                  <button
                    key={t}
                    onClick={() => setTimeframe(t)}
                    className={`px-3 py-1 rounded-full text-[11px] font-medium transition-all ${
                      timeframe === t
                        ? 'bg-white/20 text-white font-semibold shadow-[inset_0_1px_1px_rgba(255,255,255,0.3)]'
                        : 'text-white/40 hover:text-white/80'
                    }`}
                  >
                    {t}
                  </button>
                ))}
              </div>

              {/* Notification Bell */}
              <button 
                title="Telemetry Notifications"
                className="w-9 h-9 rounded-full liquid-glass-subtle hover:bg-white/15 border border-white/10 flex items-center justify-center text-white/70 hover:text-white transition-all relative"
              >
                <Icons.Bell />
                <span className="absolute top-2 right-2 w-1.5 h-1.5 rounded-full bg-white shadow-[0_0_8px_white]" />
              </button>

              {/* User Profile Avatar with Monochromatic Glow */}
              <div className="flex items-center gap-3 pl-2 border-l border-white/10">
                <div className="relative group cursor-pointer">
                  <div className="w-9 h-9 rounded-full bg-gradient-to-tr from-white/30 via-white/10 to-transparent p-[1px] shadow-[0_0_16px_rgba(255,255,255,0.12)]">
                    <div className="w-full h-full rounded-full bg-[#0B0F19] flex items-center justify-center text-xs font-mono font-medium text-white/90">
                      SD
                    </div>
                  </div>
                  <span className="absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full bg-white border-2 border-[#0B0F19]" />
                </div>
                <div className="hidden xl:block text-left">
                  <div className="text-xs font-semibold text-white/90 leading-none">Sanjay D.</div>
                  <div className="text-[10px] text-white/40 font-mono mt-1">Lead Architect</div>
                </div>
              </div>

            </div>
          </header>

          {/* ---------------------------------------------------------------------
              3. MAIN CONTENT GRID (BENTO BOX STYLE)
          ---------------------------------------------------------------------- */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">

            {/* ===================================================================
                HERO CARD: Monochromatic Dynamic Telemetry Area Chart
                Occupies 2 columns on wide screens or full width
            ==================================================================== */}
            <div className={`${viewMode === '3d' ? 'col-span-1 md:col-span-3 lg:col-span-3' : 'md:col-span-3 lg:col-span-2'} liquid-glass liquid-card-hover rounded-3xl p-6 border border-white/10 shadow-[0_8px_32px_0_rgba(0,0,0,0.4)] flex flex-col justify-between transition-all duration-500`}>
              <div>
                {/* Header of Hero Card */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-white/5">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full bg-white shadow-[0_0_8px_white] animate-pulse" />
                      <span className="text-[11px] font-mono uppercase tracking-widest text-white/50">Core Campus Metrics</span>
                    </div>
                    <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-white mt-1">
                      Resource Flux & Efficiency Index
                    </h2>
                  </div>

                  {/* View Mode & Metric Switcher Tabs */}
                  <div className="flex flex-wrap items-center gap-2">
                    {/* 2D vs 3D Digital Twin Switcher */}
                    <div className="flex items-center gap-1 p-1 rounded-2xl bg-white/[0.04] border border-white/10 text-xs">
                      <button
                        onClick={() => setViewMode('analytics')}
                        className={`px-3 py-1.5 rounded-xl font-medium transition-all flex items-center gap-1.5 ${
                          viewMode === 'analytics'
                            ? 'bg-white/15 text-white font-semibold shadow-[inset_0_1px_1px_rgba(255,255,255,0.25)] border border-white/15'
                            : 'text-white/40 hover:text-white/80'
                        }`}
                      >
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
                        <span>Live Flux Stream</span>
                      </button>
                      <button
                        onClick={() => setViewMode('3d')}
                        className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl font-medium transition-all ${
                          viewMode === '3d'
                            ? 'bg-white/15 text-white font-semibold shadow-[inset_0_1px_1px_rgba(255,255,255,0.25)] border border-white/15'
                            : 'text-white/40 hover:text-white/80'
                        }`}
                      >
                        <Icons.Box3D />
                        <span>3D Campus Twin</span>
                      </button>
                    </div>

                    {/* Metric Switcher Tabs (when in analytics view) */}
                    {viewMode === 'analytics' && (
                      <div className="flex items-center gap-1.5 p-1 rounded-2xl bg-white/[0.04] border border-white/10 text-xs">
                        {[
                          { key: 'power', label: 'Power Grid', icon: Icons.Zap },
                          { key: 'water', label: 'Hydrology', icon: Icons.Droplet },
                          { key: 'carbon', label: 'Carbon Offset', icon: Icons.Recycle },
                        ].map((tab) => {
                          const Icon = tab.icon;
                          const isTabActive = activeMetricTab === tab.key;
                          return (
                            <button
                              key={tab.key}
                              onClick={() => {
                                setActiveMetricTab(tab.key as any);
                                setHoveredDataPoint(null);
                              }}
                              className={`flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs font-medium transition-all ${
                                isTabActive
                                  ? 'bg-white/15 text-white font-semibold shadow-[inset_0_1px_1px_rgba(255,255,255,0.25)] border border-white/15'
                                  : 'text-white/40 hover:text-white/80'
                              }`}
                            >
                              <Icon />
                              <span>{tab.label}</span>
                            </button>
                          );
                        })}
                      </div>
                    )}
                  </div>
                </div>

                {/* Selected Sector Focus Tag */}
                {selectedZone && (
                  <div className="mt-3 flex items-center justify-between p-2.5 rounded-2xl bg-white/[0.06] border border-white/15 text-xs font-mono">
                    <div className="flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full bg-white shadow-[0_0_8px_white]" />
                      <span className="text-white/60">SECTOR FOCUS:</span>
                      <span className="text-white font-bold">{selectedZone}</span>
                    </div>
                    <button
                      onClick={() => setSelectedZone(null)}
                      className="px-2 py-0.5 rounded bg-white/10 hover:bg-white/20 text-white/70 hover:text-white text-[10px]"
                    >
                      Clear Sector Filter ✕
                    </button>
                  </div>
                )}

                {/* Key Readouts Banner */}
                <div className="grid grid-cols-3 gap-4 pt-5 pb-2">
                  <div>
                    <div className="text-[11px] font-mono text-white/40 uppercase">Real-Time Load</div>
                    <div className="text-xl sm:text-2xl font-extrabold text-white mt-0.5 tracking-tight">
                      {activeMetricTab === 'power' && '418.2 kW'}
                      {activeMetricTab === 'water' && '1,420 L/m'}
                      {activeMetricTab === 'carbon' && '28.4 tCO₂e'}
                    </div>
                    <div className="text-[11px] text-white/60 font-mono mt-0.5 flex items-center gap-1">
                      <Icons.TrendingDown />
                      <span>-14.8% vs Baseline</span>
                    </div>
                  </div>

                  <div>
                    <div className="text-[11px] font-mono text-white/40 uppercase">Peak Threshold</div>
                    <div className="text-xl sm:text-2xl font-extrabold text-white mt-0.5 tracking-tight">
                      {activeMetricTab === 'power' && '710.0 kW'}
                      {activeMetricTab === 'water' && '2,400 L/m'}
                      {activeMetricTab === 'carbon' && '41.5 tCO₂e'}
                    </div>
                    <div className="text-[11px] text-white/40 font-mono mt-0.5">Recorded @ 12:00</div>
                  </div>

                  <div>
                    <div className="text-[11px] font-mono text-white/40 uppercase">Optimal Delta</div>
                    <div className="text-xl sm:text-2xl font-extrabold text-white mt-0.5 tracking-tight">
                      94.2%
                    </div>
                    <div className="text-[11px] text-white/70 font-mono mt-0.5 flex items-center gap-1">
                      <Icons.ArrowUpRight />
                      <span>+4.2% Target Exceeded</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Content Body: Dynamic SVG Chart or Campus Image Telemetry */}
              {viewMode === '3d' ? (
                <div className="mt-4">
                  <CampusImageViewer
                    onSelectZone={(zone) => setSelectedZone(zone ?? null)}
                    selectedZone={selectedZone}
                  />
                </div>
              ) : (
                <div className="mt-4">
                  <ModernFluxChart
                    activeMetricTab={activeMetricTab}
                    selectedZone={selectedZone}
                    onClearSectorFilter={() => setSelectedZone(null)}
                  />
                </div>
              )}
            </div>

            {/* ===================================================================
                ACTIVITY & DIRECTIVES FEED (List Component)
                Occupies 1 column on wide screens, thin borders
            ==================================================================== */}
            <div className="liquid-glass liquid-card-hover rounded-3xl p-6 border border-white/10 shadow-[0_8px_32px_0_rgba(0,0,0,0.4)] flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between pb-4 border-b border-white/5">
                  <div className="flex items-center gap-2">
                    <Icons.Activity />
                    <h3 className="text-base font-semibold text-white tracking-tight">Active Directives</h3>
                  </div>
                  <span className="text-[11px] font-mono text-white/40">{filteredActivities.length} Events</span>
                </div>

                {/* List Container with Monochromatic Hierarchy */}
                <div className="divide-y divide-white/5 mt-2">
                  {filteredActivities.slice(0, 5).map((act) => {
                    const isAck = acknowledgedAlerts.includes(act.id);
                    return (
                      <div
                        key={act.id}
                        className="py-3.5 flex items-start justify-between gap-3 group transition-colors hover:bg-white/[0.02] rounded-xl px-2"
                      >
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <span
                              className={`text-[9px] font-mono uppercase px-2 py-0.5 rounded-full border ${
                                act.severity === 'CRITICAL'
                                  ? 'bg-white text-black font-bold border-white'
                                  : act.severity === 'WATCH'
                                  ? 'bg-white/20 text-white border-white/30'
                                  : 'bg-white/5 text-white/60 border-white/10'
                              }`}
                            >
                              {act.type}
                            </span>
                            <span className="text-[10px] font-mono text-white/40">{act.time}</span>
                          </div>

                          <div className={`text-xs font-medium ${isAck ? 'text-white/40 line-through' : 'text-white/90 group-hover:text-white'}`}>
                            {act.title}
                          </div>

                          <div className="text-[11px] font-mono text-white/40 flex items-center gap-2">
                            <span>{act.zone}</span>
                            <span>•</span>
                            <span className="text-white/70">{act.metric}</span>
                          </div>
                        </div>

                        {/* Acknowledge Toggle Action */}
                        <button
                          onClick={() => toggleAlertAck(act.id)}
                          title={isAck ? 'Acknowledged' : 'Acknowledge Directive'}
                          className={`mt-1 p-1.5 rounded-lg border transition-all ${
                            isAck
                              ? 'bg-white/20 text-white border-white/30'
                              : 'bg-white/5 text-white/40 border-white/10 hover:text-white hover:bg-white/15'
                          }`}
                        >
                          <Icons.Check />
                        </button>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* View All Live Directives button */}
              <button 
                onClick={() => alert('Opening Full Telemetry Event Log...')}
                className="w-full mt-4 py-2.5 rounded-2xl liquid-glass-subtle hover:bg-white/10 border border-white/10 text-xs font-semibold text-white/80 hover:text-white flex items-center justify-center gap-2 transition-all shadow-[inset_0_1px_1px_rgba(255,255,255,0.1)]"
              >
                <span>Audit Complete Stream</span>
                <Icons.ArrowUpRight />
              </button>
            </div>

            {/* ===================================================================
                3 SMALLER METRIC CARDS (Displaying Numerical Data & Sparklines)
            ==================================================================== */}
            
            {/* Metric Card 1: Grid Power Load */}
            <div className="liquid-glass liquid-card-hover rounded-3xl p-6 border border-white/10 shadow-[0_8px_32px_0_rgba(0,0,0,0.4)] relative overflow-hidden group">
              <div className="absolute top-0 right-0 w-32 h-32 bg-white/[0.03] rounded-full blur-2xl group-hover:bg-white/[0.06] transition-all" />
              
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-mono uppercase tracking-wider text-white/50">Grid Power Draw</span>
                <div className="w-8 h-8 rounded-xl bg-white/10 border border-white/15 flex items-center justify-center text-white/80">
                  <Icons.Zap />
                </div>
              </div>

              <div className="mt-4">
                <div className="text-3xl font-extrabold tracking-tight text-white">418.2 <span className="text-sm font-medium text-white/50">kW</span></div>
                <div className="flex items-center gap-2 mt-1.5 text-xs text-white/70 font-mono">
                  <span className="px-1.5 py-0.5 rounded bg-white/10 text-white border border-white/10 font-bold">-14.2%</span>
                  <span>vs 24h baseline</span>
                </div>
              </div>

              {/* Sparkline & Sub-telemetry */}
              <div className="mt-5 pt-4 border-t border-white/5 flex items-center justify-between text-xs font-mono text-white/40">
                <span>Peak Cap: 650 kW</span>
                <span className="text-white/80">Nominal 64%</span>
              </div>
              <div className="w-full bg-white/10 h-1.5 rounded-full mt-2 overflow-hidden">
                <div className="bg-white h-full w-[64%] shadow-[0_0_8px_white]" />
              </div>
            </div>

            {/* Metric Card 2: Hydrological Reclamation */}
            <div className="liquid-glass liquid-card-hover rounded-3xl p-6 border border-white/10 shadow-[0_8px_32px_0_rgba(0,0,0,0.4)] relative overflow-hidden group">
              <div className="absolute top-0 right-0 w-32 h-32 bg-white/[0.03] rounded-full blur-2xl group-hover:bg-white/[0.06] transition-all" />

              <div className="flex items-center justify-between">
                <span className="text-[11px] font-mono uppercase tracking-wider text-white/50">Hydrological Velocity</span>
                <div className="w-8 h-8 rounded-xl bg-white/10 border border-white/15 flex items-center justify-center text-white/80">
                  <Icons.Droplet />
                </div>
              </div>

              <div className="mt-4">
                <div className="text-3xl font-extrabold tracking-tight text-white">1,420 <span className="text-sm font-medium text-white/50">L/min</span></div>
                <div className="flex items-center gap-2 mt-1.5 text-xs text-white/70 font-mono">
                  <span className="px-1.5 py-0.5 rounded bg-white/10 text-white border border-white/10 font-bold">+6.8%</span>
                  <span>reclamation velocity</span>
                </div>
              </div>

              {/* Sparkline & Sub-telemetry */}
              <div className="mt-5 pt-4 border-t border-white/5 flex items-center justify-between text-xs font-mono text-white/40">
                <span>Cistern Level: 82%</span>
                <span className="text-white/80">Safe Lock Active</span>
              </div>
              <div className="w-full bg-white/10 h-1.5 rounded-full mt-2 overflow-hidden">
                <div className="bg-white h-full w-[82%] shadow-[0_0_8px_white]" />
              </div>
            </div>

            {/* Metric Card 3: Material & Autonomous Waste Recovery */}
            <div className="liquid-glass liquid-card-hover rounded-3xl p-6 border border-white/10 shadow-[0_8px_32px_0_rgba(0,0,0,0.4)] relative overflow-hidden group">
              <div className="absolute top-0 right-0 w-32 h-32 bg-white/[0.03] rounded-full blur-2xl group-hover:bg-white/[0.06] transition-all" />

              <div className="flex items-center justify-between">
                <span className="text-[11px] font-mono uppercase tracking-wider text-white/50">Diverted Waste Ratio</span>
                <div className="w-8 h-8 rounded-xl bg-white/10 border border-white/15 flex items-center justify-center text-white/80">
                  <Icons.Recycle />
                </div>
              </div>

              <div className="mt-4">
                <div className="text-3xl font-extrabold tracking-tight text-white">94.6 <span className="text-sm font-medium text-white/50">%</span></div>
                <div className="flex items-center gap-2 mt-1.5 text-xs text-white/70 font-mono">
                  <span className="px-1.5 py-0.5 rounded bg-white text-black font-bold">+3.2%</span>
                  <span>zero-landfill target</span>
                </div>
              </div>

              {/* Sparkline & Sub-telemetry */}
              <div className="mt-5 pt-4 border-t border-white/5 flex items-center justify-between text-xs font-mono text-white/40">
                <span>Total Compactions: 412</span>
                <span className="text-white/80">4 Nodes Active</span>
              </div>
              <div className="w-full bg-white/10 h-1.5 rounded-full mt-2 overflow-hidden">
                <div className="bg-white h-full w-[94.6%] shadow-[0_0_8px_white]" />
              </div>
            </div>

            {/* ===================================================================
                CAMPUS INFRASTRUCTURE MATRIX (Bento Grid Expansion)
            ==================================================================== */}
            <div className="md:col-span-3 liquid-glass liquid-card-hover rounded-3xl p-6 border border-white/10 shadow-[0_8px_32px_0_rgba(0,0,0,0.4)]">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-white/5">
                <div>
                  <div className="flex items-center gap-2">
                    <Icons.Layers />
                    <h3 className="text-lg font-bold text-white tracking-tight">Active Sub-Grid Infrastructure</h3>
                  </div>
                  <p className="text-xs text-white/40 font-mono mt-0.5">Automated telemetry feedback loop across all 4 primary physical sectors</p>
                </div>

                <div className="flex items-center gap-2">
                  <button 
                    onClick={() => alert('Triggering instant deterministic rule sweep...')}
                    className="px-4 py-2 rounded-2xl liquid-glass-dense hover:bg-white/20 border border-white/20 text-xs font-semibold text-white transition-all shadow-[inset_0_1px_1px_rgba(255,255,255,0.3)] flex items-center gap-2"
                  >
                    <Icons.Cpu />
                    <span>Run Telemetry Sweep</span>
                  </button>
                </div>
              </div>

              {/* Grid of Campus Sectors */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mt-5">
                {ZONES_DATA.map((zone) => (
                  <div
                    key={zone.id}
                    className="liquid-glass-subtle hover:bg-white/[0.08] p-4 rounded-2xl border border-white/10 transition-all duration-300 group"
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-mono text-white/40 uppercase">{zone.type}</span>
                      <span className="w-2 h-2 rounded-full bg-white shadow-[0_0_6px_white]" />
                    </div>

                    <div className="text-sm font-semibold text-white/95 mt-2 group-hover:text-white transition-colors">
                      {zone.name}
                    </div>

                    <div className="mt-3 space-y-1.5 font-mono text-xs">
                      <div className="flex justify-between text-white/50">
                        <span>Load:</span>
                        <span className="text-white/80 font-semibold">{zone.load}</span>
                      </div>
                      <div className="flex justify-between text-white/50">
                        <span>Reclamation:</span>
                        <span className="text-white/80">{zone.flow}</span>
                      </div>
                      <div className="flex justify-between text-white/50">
                        <span>Efficiency:</span>
                        <span className="text-white font-bold">{zone.health}</span>
                      </div>
                    </div>

                    <div className="mt-4 pt-3 border-t border-white/5 flex items-center justify-between text-[11px] font-mono text-white/60">
                      <span>Status:</span>
                      <span className="px-2 py-0.5 rounded bg-white/10 text-white/90 border border-white/10">{zone.status}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

          </div>

          {/* ---------------------------------------------------------------------
              FOOTER
          ---------------------------------------------------------------------- */}
          <footer className="mt-2 py-4 px-6 flex flex-col sm:flex-row items-center justify-between text-xs text-white/40 font-mono border-t border-white/5 gap-2">
            <div>
              AETHERIS SUSTAINABLE CAMPUS OPERATING SYSTEM · BUILD 4.2.1-RELEASE
            </div>
            <div className="flex items-center gap-4">
              <span>LATENCY: 18ms</span>
              <span>•</span>
              <span>ENCRYPTION: AES-256 GCM</span>
              <span>•</span>
              <span className="text-white/70">ALL SYSTEMS NOMINAL</span>
            </div>
          </footer>

        </main>
      </div>

    </div>
  );
}
