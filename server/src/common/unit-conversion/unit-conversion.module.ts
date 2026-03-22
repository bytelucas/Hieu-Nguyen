import { Module } from '@nestjs/common';
import { UNIT_CONVERSION_STRATEGIES } from '@common/unit-conversion/unit-conversion.token';
import { DistanceConversionStrategy } from '@common/unit-conversion/strategies/distance.strategy';
import { TemperatureConversionStrategy } from '@common/unit-conversion/strategies/temperature.strategy';
import { UnitConversionService } from '@common/unit-conversion/unit-conversion.service';

@Module({
  providers: [
    DistanceConversionStrategy,
    TemperatureConversionStrategy,
    {
      provide: UNIT_CONVERSION_STRATEGIES,
      useFactory: (
        distance: DistanceConversionStrategy,
        temperature: TemperatureConversionStrategy,
      ) => [distance, temperature],
      inject: [DistanceConversionStrategy, TemperatureConversionStrategy],
    },
    UnitConversionService,
  ],
  exports: [UnitConversionService],
})
export class UnitConversionModule {}
