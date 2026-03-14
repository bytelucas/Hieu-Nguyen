import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import configs from '../configs';
import { DatabaseModule } from '@common/database/database.module';
import { PaginationModule } from '@common/pagination/pagination.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      load: configs,
      isGlobal: true,
    }),
    DatabaseModule,
    PaginationModule,
  ],
  exports: [ConfigModule, DatabaseModule, PaginationModule],
})
export class CommonModule {}
