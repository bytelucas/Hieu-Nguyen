import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { MetricEntry } from '@modules/metric/entities/metric-entry.entity';
import { MetricType } from '@modules/metric/enums/metric-type.enum';
import { PaginationService } from '@common/pagination/services/pagination.service';
import { createTypeOrmPaginationAdapter } from '@common/pagination/adapters/typeorm-pagination.adapter';
import {
  IPaginationQueryCursorParams,
  IPaginationQueryOffsetParams,
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

  async findByType(userId: string, type: MetricType): Promise<MetricEntry[]> {
    return this.metricRepository.find({
      where: { userId, type },
      order: { date: 'DESC' },
    });
  }

  async findChartData(
    userId: string,
    type: MetricType,
    startDate: string,
    endDate: string,
  ): Promise<MetricEntry[]> {
    // Get the latest entry (by createdAt) per calendar date within the period
    const sub = this.metricRepository
      .createQueryBuilder('sub')
      .select('MAX(sub.createdAt)', 'max_created_at')
      .addSelect('sub.date', 'sub_date')
      .where('sub.userId = :userId', { userId })
      .andWhere('sub.type = :type', { type })
      .andWhere('sub.date >= :startDate', { startDate })
      .andWhere('sub.date <= :endDate', { endDate })
      .groupBy('sub.date');

    return this.metricRepository
      .createQueryBuilder('me')
      .innerJoin(
        `(${sub.getQuery()})`,
        'latest',
        'me.date = latest.sub_date AND me.createdAt = latest.max_created_at',
      )
      .setParameters(sub.getParameters())
      .where('me.userId = :userId', { userId })
      .andWhere('me.type = :type', { type })
      .orderBy('me.date', 'DESC')
      .getMany();
  }

  async create(data: Partial<MetricEntry>): Promise<MetricEntry> {
    const entry = this.metricRepository.create(data);
    return this.metricRepository.save(entry);
  }
}
