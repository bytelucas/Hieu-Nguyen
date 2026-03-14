export type MetricType = 'distance' | 'temperature';

export type MetricUnit =
  | 'meter'
  | 'centimeter'
  | 'inch'
  | 'feet'
  | 'yard'
  | 'celsius'
  | 'fahrenheit'
  | 'kelvin';

export interface MetricEntry {
  id: string;
  userId: string;
  date: string;
  value: number;
  unit: MetricUnit;
  type: MetricType;
  createdAt: string;
}

export interface CreateMetricPayload {
  date: string;
  value: number;
  unit: MetricUnit;
}

export interface ApiResponse<T> {
  statusCode: number;
  message: string;
  data?: T;
}

export interface CursorPaginationResponse<T> {
  statusCode: number;
  message: string;
  metadata?: {
    type: 'cursor';
    count?: number;
    perPage: number;
    hasNext: boolean;
    cursor?: string;
  };
  data: T[];
}
