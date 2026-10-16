// ========================================
// API Client — Sustainable Campus
// ========================================
// Falls back to mock data when backend is unreachable.

import type {
  OverviewData,
  Zone,
  ZoneDetail,
  Alert,
  RecommendationResponse,
  ReportResponse,
  TelemetryResponse,
} from '@/types';
import { mockData } from '@/api/mock-data';

const BASE_URL = (import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000') + '/api/v1';
const TIMEOUT = 6000;

let _backendAvailable: boolean | null = null;
let _lastCheck = 0;
const CHECK_INTERVAL = 30_000; // re-check every 30s

async function checkBackend(): Promise<boolean> {
  const now = Date.now();
  if (_backendAvailable !== null && now - _lastCheck < CHECK_INTERVAL) {
    return _backendAvailable;
  }
  try {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), 3000);
    const resp = await fetch(
      (import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000') + '/health',
      { signal: controller.signal }
    );
    clearTimeout(timer);
    _backendAvailable = resp.ok;
  } catch {
    _backendAvailable = false;
  }
  _lastCheck = now;
  return _backendAvailable;
}

async function apiFetch<T>(path: string, options?: RequestInit): Promise<T> {
  const isAvailable = await checkBackend();
  if (!isAvailable) {
    throw new Error('BACKEND_UNAVAILABLE');
  }
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), TIMEOUT);
  try {
    const resp = await fetch(`${BASE_URL}${path}`, {
      ...options,
      signal: controller.signal,
      headers: {
        'Content-Type': 'application/json',
        ...options?.headers,
      },
    });
    clearTimeout(timer);
    if (!resp.ok) {
      throw new Error(`API Error: ${resp.status} ${resp.statusText}`);
    }
    return resp.json();
  } catch (err) {
    clearTimeout(timer);
    _backendAvailable = false;
    throw err;
  }
}

// ---- Public API functions ----

export async function fetchOverview(): Promise<OverviewData> {
  try {
    return await apiFetch<OverviewData>('/campus/overview');
  } catch {
    return mockData.overview();
  }
}

export async function fetchZones(): Promise<Zone[]> {
  try {
    const data = await apiFetch<{ zones: Zone[] }>('/zones');
    return data.zones;
  } catch {
    return mockData.zones();
  }
}

export async function fetchZoneDetail(zoneId: number): Promise<ZoneDetail> {
  try {
    return await apiFetch<ZoneDetail>(`/zones/${zoneId}`);
  } catch {
    return mockData.zoneDetail(zoneId);
  }
}

export async function fetchTelemetry(params: {
  zone_id?: number;
  metric?: string;
  limit?: number;
}): Promise<TelemetryResponse> {
  try {
    const query = new URLSearchParams();
    if (params.zone_id != null) query.set('zone_id', String(params.zone_id));
    if (params.metric) query.set('metric', params.metric);
    if (params.limit) query.set('limit', String(params.limit));
    return await apiFetch<TelemetryResponse>(`/telemetry?${query}`);
  } catch {
    return mockData.telemetry(params.zone_id, params.metric, params.limit);
  }
}

export async function fetchAlerts(params?: {
  status?: string;
  severity?: string;
}): Promise<Alert[]> {
  try {
    const query = new URLSearchParams();
    if (params?.status) query.set('status', params.status);
    if (params?.severity) query.set('severity', params.severity);
    const data = await apiFetch<{ alerts: Alert[] }>(`/alerts?${query}`);
    return data.alerts;
  } catch {
    return mockData.alerts(params?.status, params?.severity);
  }
}

export async function acknowledgeAlert(alertId: number): Promise<{ detail: string }> {
  try {
    return await apiFetch<{ detail: string }>(`/alerts/${alertId}/acknowledge`, {
      method: 'POST',
    });
  } catch {
    return mockData.acknowledgeAlert(alertId);
  }
}

export async function simulateEvent(scenario: string): Promise<{ detail: string }> {
  try {
    return await apiFetch<{ detail: string }>('/demo/simulate', {
      method: 'POST',
      body: JSON.stringify({ scenario }),
    });
  } catch {
    return mockData.simulateEvent(scenario);
  }
}

export async function resetDemo(): Promise<{ detail: string }> {
  try {
    return await apiFetch<{ detail: string }>('/demo/reset', { method: 'POST' });
  } catch {
    return mockData.resetDemo();
  }
}

export async function fetchRecommendations(): Promise<RecommendationResponse> {
  try {
    return await apiFetch<RecommendationResponse>('/ai/recommendation');
  } catch {
    return mockData.recommendations();
  }
}

export async function fetchReport(): Promise<ReportResponse> {
  try {
    return await apiFetch<ReportResponse>('/ai/report');
  } catch {
    return mockData.report();
  }
}

export async function isBackendAvailable(): Promise<boolean> {
  return checkBackend();
}
