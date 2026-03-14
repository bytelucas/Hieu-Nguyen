import { Module } from '@nestjs/common';
import { DistanceConversionStrategy } from '@common/unit-conversion/strategies/distance.strategy';
import { TemperatureConversionStrategy } from '@common/unit-conversion/strategies/temperature.strategy';
import { UnitConversionService } from '@common/unit-conversion/unit-conversion.service';

@Module({
  providers: [
    DistanceConversionStrategy,
    TemperatureConversionStrategy,
    UnitConversionService,
  ],
  exports: [UnitConversionService],
})
export class UnitConversionModule {}
