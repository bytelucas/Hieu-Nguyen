/* eslint-disable @typescript-eslint/unbound-method */
import { Test, TestingModule } from '@nestjs/testing';
import { BadRequestException } from '@nestjs/common';
import { MetricService } from '@modules/metric/services/metric.service';
import { MetricRepository } from '@modules/metric/repositories/metric.repository';
import { UnitConversionService } from '@common/unit-conversion/unit-conversion.service';
import { MetricType } from '@modules/metric/enums/metric-type.enum';
import { MetricUnit } from '@modules/metric/enums/metric-unit.enum';
import { MetricEntry } from '@modules/metric/entities/metric-entry.entity';

describe('MetricService', () => {
  let service: MetricService;
  let metricRepository: jest.Mocked<MetricRepository>;
  let unitConversionService: jest.Mocked<UnitConversionService>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        MetricService,
        {
          provide: MetricRepository,
          useValue: {
            findByType: jest.fn(),
            findChartData: jest.fn(),
            create: jest.fn(),
            findWithPaginationOffset: jest.fn(),
            findWithPaginationCursor: jest.fn(),
          },
        },
        {
          provide: UnitConversionService,
          useValue: {
            convert: jest.fn((value: number) => value),
          },
        },
      ],
    }).compile();

    service = module.get<MetricService>(MetricService);
    metricRepository = module.get(MetricRepository);
    unitConversionService = module.get(UnitConversionService);
  });

  describe('getList', () => {
    it('throws BadRequestException when unit does not match type', async () => {
      await expect(
        service.getList('user-1', MetricType.Distance, MetricUnit.Celsius),
      ).rejects.toThrow(BadRequestException);
    });

    it('returns entries as-is when no unit specified', async () => {
      const mockEntries = [{ id: '1', value: 100 }] as MetricEntry[];
      metricRepository.findByType.mockResolvedValue(mockEntries);

      const result = await service.getList('user-1', MetricType.Distance);

      expect(result).toBe(mockEntries);
      expect(unitConversionService.convert).not.toHaveBeenCalled();
    });

    it('converts entries when unit is specified and matches type', async () => {
      const mockEntries = [
        { id: '1', value: 100, unit: MetricUnit.Meter },
      ] as MetricEntry[];
      metricRepository.findByType.mockResolvedValue(mockEntries);
      unitConversionService.convert.mockReturnValue(328);

      const result = await service.getList(
        'user-1',
        MetricType.Distance,
        MetricUnit.Feet,
      );

      expect(unitConversionService.convert).toHaveBeenCalledWith(
        100,
        MetricUnit.Meter,
        MetricUnit.Feet,
        MetricType.Distance,
      );
      expect(result[0].value).toBe(328);
      expect(result[0].unit).toBe(MetricUnit.Feet);
    });
  });
});
