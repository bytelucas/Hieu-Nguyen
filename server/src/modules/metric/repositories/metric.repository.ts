import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { MetricEntry } from '@modules/metric/entities/metric-entry.entity';
import { PaginationService } from '@common/pagination/services/pagination.service';
import { createTypeOrmPaginationAdapter } from '@common/pagination/adapters/typeorm-pagination.adapter';
import {
  IPaginationQueryCursorParams,
  IPaginationQueryOffsetParams,
} from '@common/pagination/interfaces/pagination.interface';
import {
  IPaginationCursorReturn,
  IPaginationOffsetReturn,
} from '@common/pagination/interfaces/pagination.interface';

@Injectable()
export class MetricRepository {
  constructor(
    @InjectRepository(MetricEntry)
    private readonly metricRepository: Repository<MetricEntry>,
    private readonly paginationService: PaginationService,
  ) {}

  async findWithPaginationOffset(
    pagination: IPaginationQueryOffsetParams,
    userId: string,
  ): Promise<IPaginationOffsetReturn<MetricEntry>> {
    const adapter = createTypeOrmPaginationAdapter(this.metricRepository);
    return this.paginationService.offset<MetricEntry>(adapter, {
      ...pagination,
      where: {
        ...(pagination.where as object),
        userId,
      },
    });
  }

  async findWithPaginationCursor(
    pagination: IPaginationQueryCursorParams,
    userId: string,
  ): Promise<IPaginationCursorReturn<MetricEntry>> {
    const adapter = createTypeOrmPaginationAdapter(this.metricRepository);
    return this.paginationService.cursor<MetricEntry>(adapter, {
      ...pagination,
      where: {
        ...(pagination.where as object),
        userId,
      },
    });
  }

  async create(data: Partial<MetricEntry>): Promise<MetricEntry> {
    const entry = this.metricRepository.create(data);
    return this.metricRepository.save(entry);
  }
}
