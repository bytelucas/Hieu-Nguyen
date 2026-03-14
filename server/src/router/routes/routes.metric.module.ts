import { Module } from '@nestjs/common';
import { MetricModule } from '@modules/metric/metric.module';
import { MetricController } from '@modules/metric/controllers/metric.controller';

@Module({
  imports: [MetricModule],
  controllers: [MetricController],
})
export class RoutesMetricModule {}
