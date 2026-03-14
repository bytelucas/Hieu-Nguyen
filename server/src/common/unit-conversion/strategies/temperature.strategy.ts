import { Injectable } from '@nestjs/common';
import { MetricType } from '@modules/metric/enums/metric-type.enum';
import { MetricUnit } from '@modules/metric/enums/metric-unit.enum';
import { IUnitConversionStrategy } from '@common/unit-conversion/interfaces/unit-conversion-strategy.interface';

function toCelsius(value: number, from: MetricUnit): number {
  switch (from) {
    case MetricUnit.Fahrenheit:
      return ((value - 32) * 5) / 9;
    case MetricUnit.Kelvin:
      return value - 273.15;
    default:
      return value;
  }
}

function fromCelsius(celsius: number, to: MetricUnit): number {
  switch (to) {
    case MetricUnit.Fahrenheit:
      return (celsius * 9) / 5 + 32;
    case MetricUnit.Kelvin:
      return celsius + 273.15;
    default:
      return celsius;
  }
}

@Injectable()
export class TemperatureConversionStrategy implements IUnitConversionStrategy {
  supports(type: MetricType): boolean {
    return type === MetricType.Temperature;
  }

  convert(value: number, from: MetricUnit, to: MetricUnit): number {
    if (from === to) return value;
    return fromCelsius(toCelsius(value, from), to);
  }
}
