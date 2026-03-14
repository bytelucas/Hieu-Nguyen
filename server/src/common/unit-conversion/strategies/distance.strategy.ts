import { Injectable } from '@nestjs/common';
import { MetricType } from '@modules/metric/enums/metric-type.enum';
import { MetricUnit } from '@modules/metric/enums/metric-unit.enum';
import { IUnitConversionStrategy } from '@common/unit-conversion/interfaces/unit-conversion-strategy.interface';

// Factor to convert each unit to meters
const TO_METER: Record<string, number> = {
  [MetricUnit.Meter]: 1,
  [MetricUnit.Centimeter]: 0.01,
  [MetricUnit.Inch]: 1 / 39.3701,
  [MetricUnit.Feet]: 1 / 3.28084,
  [MetricUnit.Yard]: 1 / 1.09361,
};

@Injectable()
export class DistanceConversionStrategy implements IUnitConversionStrategy {
  supports(type: MetricType): boolean {
    return type === MetricType.Distance;
  }

  convert(value: number, from: MetricUnit, to: MetricUnit): number {
    if (from === to) return value;
    const inMeters = value * TO_METER[from];
    return inMeters / TO_METER[to];
  }
}
