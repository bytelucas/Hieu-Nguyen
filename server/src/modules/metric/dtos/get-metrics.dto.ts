import { IsEnum, IsOptional } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { MetricType } from '@modules/metric/enums/metric-type.enum';
import { MetricUnit } from '@modules/metric/enums/metric-unit.enum';

export class GetMetricsDto {
  @ApiProperty({ enum: MetricType, example: MetricType.Distance })
  @IsEnum(MetricType)
  type: MetricType;

  @ApiPropertyOptional({
    enum: MetricUnit,
    example: MetricUnit.Feet,
    description: 'Convert all values to this unit',
  })
  @IsOptional()
  @IsEnum(MetricUnit)
  unit?: MetricUnit;
}
