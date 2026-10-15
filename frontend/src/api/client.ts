import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL,
  timeout: 8000,
});

export const fetchOverview = async () => {
  const resp = await api.get('/api/v1/campus/overview');
  return resp.data;
};

export const fetchZones = async () => {
  const resp = await api.get('/api/v1/zones');
  return resp.data.zones;
};

export const fetchZoneDetail = async (zoneId: number) => {
  const resp = await api.get(`/api/v1/zones/${zoneId}`);
  return resp.data;
};

export const fetchTelemetry = async (params: { zone_id?: number; metric?: string; limit?: number }) => {
  const resp = await api.get('/api/v1/telemetry', { params });
  return resp.data;
};

export const fetchAlerts = async (params?: { status?: string; severity?: string }) => {
  const resp = await api.get('/api/v1/alerts', { params });
  return resp.data.alerts;
};

export const acknowledgeAlert = async (alertId: number) => {
  const resp = await api.post(`/api/v1/alerts/${alertId}/acknowledge`);
  return resp.data;
};

export const simulateEvent = async (scenario: string) => {
  const resp = await api.post('/api/v1/demo/simulate', { scenario });
  return resp.data;
};

export const resetDemo = async () => {
  const resp = await api.post('/api/v1/demo/reset');
  return resp.data;
};
