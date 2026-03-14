import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MetricEntry } from '@modules/metric/entities/metric-entry.entity';
import { MetricController } from '@modules/metric/controllers/metric.controller';
import { MetricService } from '@modules/metric/services/metric.service';
import { MetricRepository } from '@modules/metric/repositories/metric.repository';
import { PaginationModule } from '@common/pagination/pagination.module';
import { UnitConversionModule } from '@common/unit-conversion/unit-conversion.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([MetricEntry]),
    PaginationModule,
    UnitConversionModule,
  ],
  controllers: [MetricController],
  providers: [MetricService, MetricRepository],
  exports: [MetricService],
})
export class MetricModule {}
