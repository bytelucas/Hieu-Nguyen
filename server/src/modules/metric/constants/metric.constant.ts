import { MetricType } from '@modules/metric/enums/metric-type.enum';
import { MetricUnit } from '@modules/metric/enums/metric-unit.enum';

export const UNIT_TYPE_MAP: Record<MetricUnit, MetricType> = {
  [MetricUnit.Meter]: MetricType.Distance,
  [MetricUnit.Centimeter]: MetricType.Distance,
  [MetricUnit.Inch]: MetricType.Distance,
  [MetricUnit.Feet]: MetricType.Distance,
  [MetricUnit.Yard]: MetricType.Distance,
  [MetricUnit.Celsius]: MetricType.Temperature,
  [MetricUnit.Fahrenheit]: MetricType.Temperature,
  [MetricUnit.Kelvin]: MetricType.Temperature,
};
