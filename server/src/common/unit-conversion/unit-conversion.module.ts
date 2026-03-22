import { Module } from '@nestjs/common';
import { UNIT_CONVERSION_STRATEGIES } from '@common/unit-conversion/unit-conversion.token';
import { DistanceConversionStrategy } from '@common/unit-conversion/strategies/distance.strategy';
import { TemperatureConversionStrategy } from '@common/unit-conversion/strategies/temperature.strategy';
import { UnitConversionService } from '@common/unit-conversion/unit-conversion.service';

@Module({
  providers: [
    {
      provide: UNIT_CONVERSION_STRATEGIES,
      useClass: DistanceConversionStrategy,
      multi: true,
    } as any,
    {
      provide: UNIT_CONVERSION_STRATEGIES,
      useClass: TemperatureConversionStrategy,
      multi: true,
    } as any,
    UnitConversionService,
  ],
  exports: [UnitConversionService],
})
export class UnitConversionModule {}
