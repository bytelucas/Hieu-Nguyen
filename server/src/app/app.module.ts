import { Module } from '@nestjs/common';
import { APP_FILTER } from '@nestjs/core';
import { CommonModule } from '@common/common.module';
import { RouterModule } from '../router/router.module';
import { AppGeneralFilter } from '@app/filters/app.general.filter';
import { AppHttpFilter } from '@app/filters/app.http.filter';
import { AppValidationFilter } from '@app/filters/app.validation.filter';

@Module({
  imports: [CommonModule, RouterModule],
  providers: [
    { provide: APP_FILTER, useClass: AppValidationFilter },
    { provide: APP_FILTER, useClass: AppHttpFilter },
    { provide: APP_FILTER, useClass: AppGeneralFilter },
  ],
})
export class AppModule {}
