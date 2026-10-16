// ========================================
// Mock Data — activates when backend is unreachable
// ========================================

import type {
  OverviewData,
  Zone,
  ZoneDetail,
  Alert,
  SensorReading,
  RecommendationResponse,
  ReportResponse,
  TelemetryResponse,
  AlertSeverity,
  AlertStatus,
} from '@/types';

const ZONES: Zone[] = [
  { id: 1, name: 'Library Block', zone_type: 'academic', x: 50, y: 50, width: 120, height: 80, status: 'healthy' },
  { id: 2, name: 'Canteen', zone_type: 'food', x: 200, y: 50, width: 120, height: 80, status: 'watch' },
  { id: 3, name: 'Academic Block A', zone_type: 'academic', x: 350, y: 50, width: 120, height: 80, status: 'critical' },
  { id: 4, name: 'Hostel Block', zone_type: 'residence', x: 50, y: 180, width: 120, height: 80, status: 'healthy' },
  { id: 5, name: 'Parking Area', zone_type: 'facility', x: 200, y: 180, width: 120, height: 80, status: 'healthy' },
  { id: 6, name: 'Garden / Irrigation', zone_type: 'outdoor', x: 350, y: 180, width: 120, height: 80, status: 'watch' },
];

const MOCK_ALERTS: Alert[] = [
  {
    id: 1,
    zone_id: 3,
    type: 'energy_waste',
    severity: 'critical',
    title: 'Possible energy waste in Academic Block A',
    description: 'High energy draw detected (8.2 kW) while occupancy count is 0. Lights and AC may have been left on. Needs inspection.',
    status: 'open',
    created_at: new Date(Date.now() - 3600_000).toISOString(),
  },
  {
    id: 2,
    zone_id: 2,
    type: 'waste_overflow',
    severity: 'watch',
    title: 'Possible waste bin overflow near Canteen',
    description: 'Waste level sensor reads 92%. Bin may be nearly full. Needs inspection.',
    status: 'open',
    created_at: new Date(Date.now() - 7200_000).toISOString(),
  },
  {
    id: 3,
    zone_id: 6,
    type: 'water_leak',
    severity: 'watch',
    title: 'Possible water leak in Garden / Irrigation',
    description: 'Water flow of 3.2 L/min detected outside scheduled irrigation hours. Possible pipe leak. Needs inspection.',
    status: 'open',
    created_at: new Date(Date.now() - 10800_000).toISOString(),
  },
  {
    id: 4,
    zone_id: 1,
    type: 'occupancy',
    severity: 'info',
    title: 'Library at high capacity',
    description: 'Occupancy count of 45 (90% capacity) detected in Library Block during exam period.',
    status: 'acknowledged',
    created_at: new Date(Date.now() - 14400_000).toISOString(),
    acknowledged_at: new Date(Date.now() - 12000_000).toISOString(),
  },
];

function generateTimeSeries(zoneId: number, metric: string, count: number): SensorReading[] {
  const units: Record<string, string> = {
    energy_kw: 'kW',
    water_lpm: 'L/min',
    occupancy_count: 'people',
    waste_level_pct: '%',
  };
  const baselines: Record<number, Record<string, number>> = {
    1: { energy_kw: 5.0, water_lpm: 0.2, occupancy_count: 25, waste_level_pct: 35 },
    2: { energy_kw: 3.5, water_lpm: 0.5, occupancy_count: 40, waste_level_pct: 68 },
    3: { energy_kw: 4.5, water_lpm: 0.3, occupancy_count: 0, waste_level_pct: 20 },
    4: { energy_kw: 6.0, water_lpm: 1.0, occupancy_count: 30, waste_level_pct: 45 },
    5: { energy_kw: 2.0, water_lpm: 0.1, occupancy_count: 12, waste_level_pct: 15 },
    6: { energy_kw: 1.0, water_lpm: 3.2, occupancy_count: 0, waste_level_pct: 10 },
  };
  const base = baselines[zoneId]?.[metric] ?? 5;
  const now = Date.now();
  return Array.from({ length: count }, (_, i) => ({
    zone_id: zoneId,
    metric: metric as SensorReading['metric'],
    value: Math.round((base + (Math.sin(i * 0.5) * base * 0.15) + (Math.random() - 0.5) * base * 0.1) * 100) / 100,
    unit: units[metric] || '',
    timestamp: new Date(now - (count - i) * 900_000).toISOString(),
    source: 'simulated' as const,
  }));
}

let _mockAlerts = [...MOCK_ALERTS];

export const mockData = {
  overview(): OverviewData {
    const openAlerts = _mockAlerts.filter(a => a.status === 'open');
    return {
      data_mode: 'demo',
      generated_at: new Date().toISOString(),
      kpis: {
        open_alerts: openAlerts.length,
        critical_alerts: openAlerts.filter(a => a.severity === 'critical').length,
        energy_kw_total: 22.0,
        water_lpm_total: 5.3,
        zones_monitored: 6,
      },
      zone_status_counts: { healthy: 3, watch: 2, critical: 1 },
      recent_alerts: openAlerts.slice(0, 3),
    };
  },

  zones(): Zone[] {
    return [...ZONES];
  },

  zoneDetail(zoneId: number): ZoneDetail {
    const zone = ZONES.find(z => z.id === zoneId) || ZONES[0];
    const metrics = ['energy_kw', 'water_lpm', 'occupancy_count', 'waste_level_pct'] as const;
    const readings = metrics.map(m => generateTimeSeries(zoneId, m, 1)[0]);
    const alerts = _mockAlerts.filter(a => a.zone_id === zoneId && a.status === 'open');
    return { zone, recent_readings: readings, active_alerts: alerts };
  },

  telemetry(zoneId?: number, metric?: string, limit?: number): TelemetryResponse {
    const m = metric || 'energy_kw';
    const z = zoneId || 1;
    const l = limit || 20;
    return { readings: generateTimeSeries(z, m, l) };
  },

  alerts(status?: string, severity?: string): Alert[] {
    let filtered = [..._mockAlerts];
    if (status) filtered = filtered.filter(a => a.status === status);
    if (severity) filtered = filtered.filter(a => a.severity === severity);
    return filtered;
  },

  acknowledgeAlert(alertId: number): { detail: string } {
    const alert = _mockAlerts.find(a => a.id === alertId);
    if (alert) {
      alert.status = 'acknowledged';
      alert.acknowledged_at = new Date().toISOString();
      // Update zone statuses
      const zoneAlerts = _mockAlerts.filter(a => a.zone_id === alert.zone_id && a.status === 'open');
      const zone = ZONES.find(z => z.id === alert.zone_id);
      if (zone) {
        if (zoneAlerts.length === 0) zone.status = 'healthy';
        else if (zoneAlerts.some(a => a.severity === 'critical')) zone.status = 'critical';
        else if (zoneAlerts.some(a => a.severity === 'watch')) zone.status = 'watch';
        else zone.status = 'healthy';
      }
    }
    return { detail: `Alert ${alertId} acknowledged` };
  },

  simulateEvent(scenario: string): { detail: string } {
    const newId = Math.max(..._mockAlerts.map(a => a.id), 0) + 1;
    const newAlert: Alert = {
      id: newId,
      zone_id: 4,
      type: 'water_leak',
      severity: 'critical',
      title: `Possible water anomaly in Hostel Block`,
      description: `Simulated event: ${scenario}. Water flow spike detected at ${new Date().toLocaleTimeString()}. Needs inspection.`,
      status: 'open',
      created_at: new Date().toISOString(),
    };
    _mockAlerts.unshift(newAlert);
    const zone = ZONES.find(z => z.id === 4);
    if (zone) zone.status = 'critical';
    return { detail: `Scenario '${scenario}' simulated and alerts updated` };
  },

  resetDemo(): { detail: string } {
    _mockAlerts = [...MOCK_ALERTS.map(a => ({ ...a }))];
    ZONES.forEach((z, i) => { z.status = ZONES[i].status; });
    // Reset zone statuses
    ZONES[0].status = 'healthy';
    ZONES[1].status = 'watch';
    ZONES[2].status = 'critical';
    ZONES[3].status = 'healthy';
    ZONES[4].status = 'healthy';
    ZONES[5].status = 'watch';
    return { detail: 'Demo data reset to seeded baseline' };
  },

  recommendations(): RecommendationResponse {
    return {
      zone_id: null as unknown as number,
      summary: 'Based on current sensor data and alerts, 3 priority actions have been identified to improve campus sustainability.',
      actions: [
        {
          priority: 'critical',
          title: 'Turn off HVAC and lighting in Academic Block A',
          issue: 'Energy draw of 8.2 kW detected with zero occupancy',
          recommended_action: 'Dispatch maintenance to Academic Block A to turn off HVAC and lighting systems. Consider installing occupancy-triggered automation.',
          owner_team: 'Facilities Management',
          effort: 'Low (15 min)',
          rationale: 'Academic Block A is drawing significant power with no occupants. This represents approximately 8.2 kW of wasted energy.',
          follow_up_check: 'Verify power draw drops below 1 kW baseline within 30 minutes of action.',
          estimated_impact: {
            energy_saved_kwh: 49.2,
            cost_saved_inr: 394,
            co2_saved_kg: 40.3,
            assumptions: 'Based on 6-hour unoccupied window at 8.2 kW, INR 8/kWh, 0.82 kg CO2/kWh',
          },
        },
        {
          priority: 'high',
          title: 'Inspect irrigation system in Garden area',
          issue: 'Water flow of 3.2 L/min detected outside scheduled hours',
          recommended_action: 'Send maintenance to check irrigation pipes and valves in Garden / Irrigation zone for leaks or scheduling errors.',
          owner_team: 'Grounds Maintenance',
          effort: 'Medium (1-2 hours)',
          rationale: 'Unscheduled water flow suggests a possible leak or timer malfunction.',
          follow_up_check: 'Confirm water flow returns to 0 L/min outside scheduled irrigation.',
          estimated_impact: {
            water_saved_liters: 4608,
            cost_saved_inr: 230,
            assumptions: 'Based on 3.2 L/min continuous leak over 24h, INR 0.05/L',
          },
        },
        {
          priority: 'medium',
          title: 'Schedule waste collection at Canteen',
          issue: 'Waste level at 92% near overflow threshold',
          recommended_action: 'Dispatch housekeeping for waste collection at Canteen. Consider increasing collection frequency during peak hours.',
          owner_team: 'Housekeeping',
          effort: 'Low (30 min)',
          rationale: 'Waste level is at 92%, near overflow. Proactive collection prevents hygiene issues.',
          follow_up_check: 'Verify waste level drops below 20% after collection.',
          estimated_impact: {
            waste_diverted_kg: 15,
            assumptions: 'Estimated bin capacity of ~20 kg at 92% fill',
          },
        },
      ],
      provider: 'rule-based-fallback',
      fallback_used: true,
      evidence_ids: ['alert-1', 'alert-2', 'alert-3'],
    };
  },

  report(): ReportResponse {
    return {
      id: 'rpt-' + Date.now(),
      report_title: 'Campus Sustainability Report',
      period_start: new Date(Date.now() - 7 * 86400_000).toISOString(),
      period_end: new Date().toISOString(),
      executive_summary: 'Over the past 7 days, the campus monitoring system identified 4 sustainability issues across 6 monitored zones. Key concerns include energy waste in Academic Block A during unoccupied hours and a possible water leak in the Garden / Irrigation zone. Estimated savings from addressing all issues: 345 kWh energy, 32,256 liters of water, and approximately INR 4,200 in operational costs.',
      key_findings: [
        'Academic Block A consumed 8.2 kW during zero-occupancy periods, suggesting HVAC and lighting left running.',
        'Garden / Irrigation zone showed water flow of 3.2 L/min outside scheduled irrigation times — possible pipe leak.',
        'Canteen waste bins reached 92% capacity, indicating need for more frequent collection schedule.',
        'Library Block operated at 90% occupancy during exam periods without corresponding ventilation increases.',
      ],
      priority_actions: [
        { action: 'Install occupancy-based HVAC controls in Academic Block A', priority: 'High', estimated_saving: '~345 kWh/week' },
        { action: 'Repair irrigation leak in Garden zone', priority: 'High', estimated_saving: '~32,256 L/week' },
        { action: 'Increase waste collection frequency at Canteen', priority: 'Medium', estimated_saving: 'Improved hygiene' },
      ],
      impact_estimates: [
        { metric: 'Energy', value: '345 kWh/week', status: 'Estimate — based on simulated sensor data' },
        { metric: 'Water', value: '32,256 L/week', status: 'Estimate — based on simulated sensor data' },
        { metric: 'CO2', value: '283 kg/week', status: 'Estimate — using 0.82 kg CO2/kWh conversion' },
        { metric: 'Cost', value: 'INR 4,200/week', status: 'Estimate — using INR 8/kWh, INR 0.05/L' },
      ],
      data_limitations: [
        'All sensor data in this report is simulated for demonstration purposes.',
        'CO2 estimates use a general grid emission factor and may vary by region.',
        'Occupancy data is estimated and not verified by physical headcount.',
        'Cost estimates use standard institutional rates and should be validated against actual billing.',
      ],
      source_snapshot_id: 'snap-demo-' + Date.now(),
    };
  },
};
