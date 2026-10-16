// ========================================
// API & Domain Types — Sustainable Campus
// ========================================

export type ZoneStatus = 'healthy' | 'watch' | 'critical' | 'unknown';
export type AlertSeverity = 'critical' | 'watch' | 'info';
export type AlertStatus = 'open' | 'acknowledged' | 'resolved';
export type DataSource = 'simulated' | 'sensor' | 'manual' | 'vision' | 'sample';
export type MetricKey = 'energy_kw' | 'water_lpm' | 'occupancy_count' | 'waste_level_pct';

export interface Zone {
  id: number;
  name: string;
  zone_type: string;
  x: number;
  y: number;
  width: number;
  height: number;
  status: ZoneStatus;
}

export interface SensorReading {
  id?: number;
  zone_id: number;
  metric: MetricKey;
  value: number;
  unit: string;
  timestamp: string;
  source: DataSource;
}

export interface Alert {
  id: number;
  zone_id: number;
  type: string;
  severity: AlertSeverity;
  title: string;
  description: string;
  status: AlertStatus;
  created_at: string;
  acknowledged_at?: string | null;
  evidence_json?: Record<string, unknown>;
}

export interface OverviewData {
  data_mode: string;
  generated_at: string;
  kpis: {
    open_alerts: number;
    critical_alerts: number;
    energy_kw_total: number;
    water_lpm_total: number;
    zones_monitored: number;
  };
  zone_status_counts: {
    healthy: number;
    watch: number;
    critical: number;
  };
  recent_alerts: Alert[];
}

export interface ZoneDetail {
  zone: Zone;
  recent_readings: SensorReading[];
  active_alerts: Alert[];
}

export interface EstimatedImpact {
  energy_saved_kwh?: number | string;
  water_saved_liters?: number | string;
  cost_saved_inr?: number | string;
  waste_diverted_kg?: number | string;
  assumptions?: string;
  [key: string]: unknown;
}

export interface RecommendationAction {
  priority: string;
  title: string;
  issue: string;
  recommended_action: string;
  owner_team: string;
  effort: string;
  rationale: string;
  follow_up_check?: string;
  estimated_impact: EstimatedImpact;
}

export interface RecommendationResponse {
  zone_id?: number;
  summary: string;
  actions: RecommendationAction[];
  provider: string;
  fallback_used: boolean;
  evidence_ids: string[];
}

export interface ReportResponse {
  id?: string;
  report_title: string;
  period_start: string;
  period_end: string;
  executive_summary: string;
  key_findings: string[];
  priority_actions: Array<Record<string, unknown>>;
  impact_estimates: Array<Record<string, unknown>>;
  data_limitations: string[];
  source_snapshot_id: string;
}

export interface TelemetryResponse {
  readings: SensorReading[];
}
