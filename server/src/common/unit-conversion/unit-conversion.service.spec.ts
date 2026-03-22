import { Test } from '@nestjs/testing';
import { UnitConversionService } from './unit-conversion.service';
import { UNIT_CONVERSION_STRATEGIES } from './unit-conversion.token';
import { IUnitConversionStrategy } from './interfaces/unit-conversion-strategy.interface';
import { MetricType } from '../../modules/metric/enums/metric-type.enum';
import { MetricUnit } from '../../modules/metric/enums/metric-unit.enum';

describe('UnitConversionService', () => {
  it('uses injected strategies array to find and delegate conversion', async () => {
    const mockStrategy: IUnitConversionStrategy = {
      supports: (type) => type === MetricType.Distance,
      convert: (_value, _from, _to) => 999,
    };

    const module = await Test.createTestingModule({
      providers: [
        { provide: UNIT_CONVERSION_STRATEGIES, useValue: [mockStrategy] },
        UnitConversionService,
      ],
    }).compile();

    const service = module.get<UnitConversionService>(UnitConversionService);
    const result = service.convert(1, MetricUnit.Meter, MetricUnit.Feet, MetricType.Distance);
    expect(result).toBe(999);
  });

  it('throws when no strategy supports the given type', async () => {
    const module = await Test.createTestingModule({
      providers: [
        { provide: UNIT_CONVERSION_STRATEGIES, useValue: [] },
        UnitConversionService,
      ],
    }).compile();

    const service = module.get<UnitConversionService>(UnitConversionService);
    expect(() =>
      service.convert(1, MetricUnit.Celsius, MetricUnit.Fahrenheit, MetricType.Temperature),
    ).toThrow('No conversion strategy for type: temperature');
  });
});
