import { MetricType } from '@modules/metric/enums/metric-type.enum';
import { MetricUnit } from '@modules/metric/enums/metric-unit.enum';

export interface IUnitConversionStrategy {
  supports(type: MetricType): boolean;
  convert(value: number, from: MetricUnit, to: MetricUnit): number;
}
