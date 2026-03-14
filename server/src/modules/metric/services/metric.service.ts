import { Injectable } from '@nestjs/common';
import { MetricRepository } from '@modules/metric/repositories/metric.repository';
import {
  IPaginationQueryCursorParams,
  IPaginationQueryOffsetParams,
} from '@common/pagination/interfaces/pagination.interface';

@Injectable()
export class MetricService {
  constructor(private readonly metricRepository: MetricRepository) {}

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

  create(
    _userId: string,
    _date: string,
    _value: number,
    _unit: string,
  ): Promise<unknown> {
    // TODO: implement per SPEC
    void _userId;
    void _date;
    void _value;
    void _unit;
    return Promise.resolve({ message: 'Not implemented' });
  }

  getChartData(
    _userId: string,
    _type: string,
    _period: number,
    _unit?: string,
  ): Promise<unknown> {
    // TODO: implement per SPEC
    void _userId;
    void _type;
    void _period;
    void _unit;
    return Promise.resolve({ message: 'Not implemented' });
  }
}
