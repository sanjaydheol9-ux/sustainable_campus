import React, { useState, useEffect, useCallback } from 'react';
import { motion } from 'motion/react';
import {
  Layers,
  AlertTriangle,
  Sparkles,
  FileText,
  Camera,
  MapPin,
  RefreshCw,
  Clock,
  ShieldCheck,
} from 'lucide-react';
import { TopBar } from '@/components/TopBar';
import { Navbar } from '@/components/Navbar';
import { KPIStrip } from '@/components/KPIStrip';
import { CampusSchematic } from '@/campus/CampusSchematic';
import { ZoneDetailPanel } from '@/components/ZoneDetailPanel';
import { AlertsList } from '@/components/AlertsList';
import { AIActionPanel } from '@/components/AIActionPanel';
import { ReportPanel } from '@/components/ReportPanel';
import { VisionObservationCard } from '@/components/VisionObservationCard';
import { fetchOverview, fetchZones, fetchAlerts } from '@/api/client';
import { useTheme } from '@/hooks/useTheme';
import type { OverviewData, Zone, Alert } from '@/types';

type DashboardTab = 'twin' | 'alerts' | 'ai' | 'report' | 'vision';

export function DashboardPage() {
  const { setTheme } = useTheme();

  // Dashboard defaults to dark mode as requested in PRD
  useEffect(() => {
    const saved = localStorage.getItem('campus-theme');
    if (!saved) {
      setTheme('dark');
    }
  }, [setTheme]);

  const [overview, setOverview] = useState<OverviewData | null>(null);
  const [zones, setZones] = useState<Zone[]>([]);
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [selectedZoneId, setSelectedZoneId] = useState<number | null>(3); // default Academic Block A with anomaly
  const [loading, setLoading] = useState(true);
  const [lastUpdated, setLastUpdated] = useState<string>('');

  // Mobile active tab switcher
  const [activeTab, setActiveTab] = useState<DashboardTab>('twin');

  const loadDashboardData = useCallback(async () => {
    try {
      setLoading(true);
      const [ovData, zonesData, alertsData] = await Promise.all([
        fetchOverview(),
        fetchZones(),
        fetchAlerts(),
      ]);
      setOverview(ovData);
      setZones(zonesData);
      setAlerts(alertsData);
      setLastUpdated(new Date().toISOString());
    } catch (err) {
      console.error('Failed to load dashboard data:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadDashboardData();
  }, [loadDashboardData]);

  return (
    <div className="min-h-screen bg-[var(--bg)] text-[var(--text-primary)] flex flex-col selection:bg-[var(--color-accent-tint)] selection:text-[var(--color-accent)] font-sans pb-16 lg:pb-0">
      {/* Slim Nav Bar */}
      <Navbar />

      {/* Top Operations Header Bar */}
      <TopBar
        lastUpdated={lastUpdated}
        onRefresh={loadDashboardData}
        dataMode={overview?.data_mode || 'demo'}
      />

      {/* Main Cockpit Body */}
      <main className="flex-1 p-4 md:p-6 max-w-[1600px] w-full mx-auto space-y-4">
        {/* KPI Summary Strip */}
        <KPIStrip data={overview} loading={loading} />

        {/* Desktop 12-Column Responsive Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
          {/* Left Column: Campus Digital Twin Canvas & Vision Card (7 Columns) */}
          <div
            className={`space-y-4 lg:col-span-7 ${
              activeTab !== 'twin' && activeTab !== 'vision' ? 'hidden lg:block' : ''
            }`}
          >
            {/* Digital Twin SVG Card */}
            <div className="rounded-xl border border-[var(--border)] bg-[var(--surface)] p-4 shadow-xs">
              <div className="flex items-center justify-between pb-3 border-b border-[var(--border)]">
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 rounded-md bg-[var(--color-accent)]/15 flex items-center justify-center text-[var(--color-accent)]">
                    <MapPin className="w-3.5 h-3.5" />
                  </div>
                  <div>
                    <h2 className="font-semibold text-sm text-[var(--text-primary)]">
                      Campus Digital Twin
                    </h2>
                    <p className="text-[11px] text-[var(--text-secondary)]">
                      Select any of the 6 zones for live telemetry and inspection
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2 text-[11px] font-mono text-[var(--text-secondary)]">
                  <span className="w-2 h-2 rounded-full bg-[var(--color-healthy)]" />
                  <span>Interactive Map</span>
                </div>
              </div>

              {/* Campus Schematic View */}
              <div className="mt-3">
                <CampusSchematic
                  zones={zones}
                  selectedZoneId={selectedZoneId}
                  onSelectZone={id => setSelectedZoneId(id)}
                />
              </div>
            </div>

            {/* Vision Observation Card */}
            <div className={activeTab === 'twin' ? 'block' : activeTab === 'vision' ? 'block' : 'hidden lg:block'}>
              <VisionObservationCard />
            </div>
          </div>

          {/* Right Column: Zone Detail, Alerts Feed, AI Action & Report (5 Columns) */}
          <div
            className={`space-y-4 lg:col-span-5 ${
              activeTab === 'twin' || activeTab === 'vision' ? 'hidden lg:block' : ''
            }`}
          >
            {/* Zone Detail Panel (if a zone is selected) */}
            {selectedZoneId && (
              <div className="mb-4">
                <ZoneDetailPanel
                  zoneId={selectedZoneId}
                  onClose={() => setSelectedZoneId(null)}
                />
              </div>
            )}

            {/* Alerts List */}
            <div className={activeTab === 'alerts' || activeTab === 'twin' ? 'block' : 'hidden lg:block'}>
              <AlertsList
                alerts={alerts}
                onAlertUpdated={loadDashboardData}
                loading={loading}
              />
            </div>

            {/* AI Action Panel */}
            <div className={activeTab === 'ai' ? 'block' : 'hidden lg:block'}>
              <AIActionPanel />
            </div>

            {/* Sustainability Report Panel */}
            <div className={activeTab === 'report' ? 'block' : 'hidden lg:block'}>
              <ReportPanel />
            </div>
          </div>
        </div>

        {/* Secondary Grid for AI and Report Panels on Wide Screens (if stacked above) */}
        <div className="hidden lg:grid grid-cols-1 lg:grid-cols-2 gap-4 pt-2">
          <AIActionPanel />
          <ReportPanel />
        </div>
      </main>

      {/* Persistent Advisory Footer Line */}
      <footer className="py-3 px-6 bg-[var(--surface)] border-t border-[var(--border)] text-[11px] font-mono text-[var(--text-secondary)] text-center">
        Advisory only. This system recommends actions; people review and execute them.
      </footer>

      {/* Mobile Bottom Tab Bar (stacks cleanly on <=640px / 390px screens) */}
      <div className="lg:hidden fixed bottom-0 left-0 right-0 z-50 bg-[var(--surface)]/95 backdrop-blur-md border-t border-[var(--border)] px-2 py-1.5 flex items-center justify-around">
        {[
          { id: 'twin' as const, label: 'Twin', icon: Layers },
          { id: 'alerts' as const, label: 'Alerts', icon: AlertTriangle },
          { id: 'ai' as const, label: 'AI Plan', icon: Sparkles },
          { id: 'report' as const, label: 'Report', icon: FileText },
          { id: 'vision' as const, label: 'Vision', icon: Camera },
        ].map(tab => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveTab(tab.id)}
              className={`flex flex-col items-center gap-1 py-1 px-2.5 rounded-lg text-[10px] font-medium transition-colors ${
                isActive
                  ? 'text-[var(--color-accent)] font-semibold'
                  : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
              }`}
            >
              <Icon className="w-4 h-4" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
