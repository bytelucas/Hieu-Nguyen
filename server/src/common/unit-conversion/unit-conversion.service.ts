import { Injectable } from '@nestjs/common';
import { MetricType } from '@modules/metric/enums/metric-type.enum';
import { MetricUnit } from '@modules/metric/enums/metric-unit.enum';
import { IUnitConversionStrategy } from '@common/unit-conversion/interfaces/unit-conversion-strategy.interface';
import { DistanceConversionStrategy } from '@common/unit-conversion/strategies/distance.strategy';
import { TemperatureConversionStrategy } from '@common/unit-conversion/strategies/temperature.strategy';

@Injectable()
export class UnitConversionService {
  private readonly strategies: IUnitConversionStrategy[];

  constructor(
    private readonly distanceStrategy: DistanceConversionStrategy,
    private readonly temperatureStrategy: TemperatureConversionStrategy,
  ) {
    this.strategies = [distanceStrategy, temperatureStrategy];
  }

  convert(
    value: number,
    from: MetricUnit,
    to: MetricUnit,
    type: MetricType,
  ): number {
    const strategy = this.strategies.find((s) => s.supports(type));
    if (!strategy) throw new Error(`No conversion strategy for type: ${type}`);
    return strategy.convert(value, from, to);
  }
}
