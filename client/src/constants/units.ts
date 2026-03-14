import type { MetricUnit } from '../api/types';

export const DISTANCE_UNITS: MetricUnit[] = [
  'meter',
  'centimeter',
  'inch',
  'feet',
  'yard',
];

export const TEMPERATURE_UNITS: MetricUnit[] = [
  'celsius',
  'fahrenheit',
  'kelvin',
];

export const ALL_UNITS: MetricUnit[] = [...DISTANCE_UNITS, ...TEMPERATURE_UNITS];
