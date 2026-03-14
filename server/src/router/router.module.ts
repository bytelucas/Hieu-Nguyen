import { Module } from '@nestjs/common';
import { RouterModule as NestRouterModule } from '@nestjs/core';
import { RoutesMetricModule } from './routes/routes.metric.module';

@Module({
  imports: [
    RoutesMetricModule,
    NestRouterModule.register([
      {
        path: '/',
        module: RoutesMetricModule,
      },
    ]),
  ],
})
export class RouterModule {}
