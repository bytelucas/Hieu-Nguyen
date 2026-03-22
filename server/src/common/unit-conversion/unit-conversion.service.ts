import { Injectable, Inject } from '@nestjs/common';
import { MetricType } from '@modules/metric/enums/metric-type.enum';
import { MetricUnit } from '@modules/metric/enums/metric-unit.enum';
import { IUnitConversionStrategy } from '@common/unit-conversion/interfaces/unit-conversion-strategy.interface';
import { UNIT_CONVERSION_STRATEGIES } from '@common/unit-conversion/unit-conversion.token';

@Injectable()
export class UnitConversionService {
  constructor(
    @Inject(UNIT_CONVERSION_STRATEGIES)
    private readonly strategies: IUnitConversionStrategy[],
  ) {}

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
