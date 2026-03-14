import { BadRequestException, Injectable } from '@nestjs/common';
import { MetricRepository } from '@modules/metric/repositories/metric.repository';
import { MetricEntry } from '@modules/metric/entities/metric-entry.entity';
import { MetricType } from '@modules/metric/enums/metric-type.enum';
import { MetricUnit } from '@modules/metric/enums/metric-unit.enum';
import { UNIT_TYPE_MAP } from '@modules/metric/constants/metric.constant';
import { UnitConversionService } from '@common/unit-conversion/unit-conversion.service';
import {
  IPaginationQueryCursorParams,
  IPaginationQueryOffsetParams,
} from '@common/pagination/interfaces/pagination.interface';

@Injectable()
export class MetricService {
  constructor(
    private readonly metricRepository: MetricRepository,
    private readonly unitConversionService: UnitConversionService,
  ) {}

  async getListOffset(
    pagination: IPaginationQueryOffsetParams,
    userId: string,
  ) {
    return this.metricRepository.findWithPaginationOffset(pagination, userId);
  }

  async getListCursor(
    pagination: IPaginationQueryCursorParams,
    userId: string,
  ) {
    return this.metricRepository.findWithPaginationCursor(pagination, userId);
  }

  async create(
    userId: string,
    date: string,
    value: number,
    unit: MetricUnit,
  ): Promise<MetricEntry> {
    const type = UNIT_TYPE_MAP[unit];
    return this.metricRepository.create({ userId, date, value, unit, type });
  }

  async getList(
    userId: string,
    type: MetricType,
    unit?: MetricUnit,
  ): Promise<MetricEntry[]> {
    if (unit) this.assertUnitMatchesType(unit, type);
    const entries = await this.metricRepository.findByType(userId, type);
    return unit ? this.convertEntries(entries, unit, type) : entries;
  }

  async getChartData(
    userId: string,
    type: MetricType,
    period: number,
    unit?: MetricUnit,
  ): Promise<MetricEntry[]> {
    if (unit) this.assertUnitMatchesType(unit, type);

    const endDate = new Date();
    const startDate = new Date(endDate);
    startDate.setMonth(startDate.getMonth() - period);

    const entries = await this.metricRepository.findChartData(
      userId,
      type,
      startDate.toISOString().split('T')[0],
      endDate.toISOString().split('T')[0],
    );

    return unit ? this.convertEntries(entries, unit, type) : entries;
  }

  private assertUnitMatchesType(unit: MetricUnit, type: MetricType): void {
    if (UNIT_TYPE_MAP[unit] !== type) {
      throw new BadRequestException(
        `Unit "${unit}" does not belong to type "${type}"`,
      );
    }
  }

  private convertEntries(
    entries: MetricEntry[],
    toUnit: MetricUnit,
    type: MetricType,
  ): MetricEntry[] {
    return entries.map((entry) => ({
      ...entry,
      value: this.unitConversionService.convert(
        entry.value,
        entry.unit,
        toUnit,
        type,
      ),
      unit: toUnit,
    }));
  }
}
