import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { MetricEntry } from '@modules/metric/entities/metric-entry.entity';

@Module({
  imports: [
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        type: 'postgres',
        url: configService.get<string>('database.url'),
        entities: [MetricEntry],
        synchronize: configService.get<string>('app.env') !== 'production',
        logging: configService.get<boolean>('database.debug'),
      }),
    }),
  ],
  exports: [TypeOrmModule],
})
export class DatabaseModule {}
