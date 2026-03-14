import type {
  ApiResponse,
  CreateMetricPayload,
  CursorPaginationResponse,
  MetricEntry,
  MetricType,
  MetricUnit,
} from './types';

const API_BASE =
  import.meta.env.VITE_API_URL ?? '/api';
const DEFAULT_USER_ID = 'poc-user';

function getHeaders(userId = DEFAULT_USER_ID): HeadersInit {
  return {
    'Content-Type': 'application/json',
    'x-user-id': userId,
  };
}

export async function createMetric(
  payload: CreateMetricPayload,
  userId = DEFAULT_USER_ID
): Promise<ApiResponse<MetricEntry>> {
  const res = await fetch(`${API_BASE}/metrics`, {
    method: 'POST',
    headers: getHeaders(userId),
    body: JSON.stringify(payload),
  });
  const json = await res.json();
  if (!res.ok) {
    throw new Error(json.message ?? json.error ?? 'Failed to create metric');
  }
  return json;
}

export async function getMetrics(
  type: MetricType,
  unit?: MetricUnit,
  userId = DEFAULT_USER_ID
): Promise<ApiResponse<MetricEntry[]>> {
  const params = new URLSearchParams({ type });
  if (unit) params.set('unit', unit);
  const res = await fetch(`${API_BASE}/metrics?${params}`, {
    headers: getHeaders(userId),
  });
  const json = await res.json();
  if (!res.ok) {
    throw new Error(json.message ?? json.error ?? 'Failed to fetch metrics');
  }
  return json;
}

export async function getChartData(
  type: MetricType,
  period: number,
  unit?: MetricUnit,
  userId = DEFAULT_USER_ID
): Promise<ApiResponse<MetricEntry[]>> {
  const params = new URLSearchParams({ type, period: String(period) });
  if (unit) params.set('unit', unit);
  const res = await fetch(`${API_BASE}/metrics/chart?${params}`, {
    headers: getHeaders(userId),
  });
  const json = await res.json();
  if (!res.ok) {
    throw new Error(json.message ?? json.error ?? 'Failed to fetch chart data');
  }
  return json;
}

export async function getMetricsCursor(
  options: { perPage?: number; cursor?: string; orderBy?: string },
  userId = DEFAULT_USER_ID
): Promise<CursorPaginationResponse<MetricEntry>> {
  const params = new URLSearchParams();
  if (options.perPage) params.set('perPage', String(options.perPage));
  if (options.cursor) params.set('cursor', options.cursor);
  if (options.orderBy) params.set('orderBy', options.orderBy);
  const res = await fetch(`${API_BASE}/metrics/cursor?${params}`, {
    headers: getHeaders(userId),
  });
  const json = await res.json();
  if (!res.ok) {
    throw new Error(json.message ?? json.error ?? 'Failed to fetch metrics');
  }
  return json;
}
