import { IsEnum, IsInt, IsOptional, IsPositive } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { MetricType } from '@modules/metric/enums/metric-type.enum';
import { MetricUnit } from '@modules/metric/enums/metric-unit.enum';

export class GetChartDataDto {
  @ApiProperty({ enum: MetricType, example: MetricType.Distance })
  @IsEnum(MetricType)
  type: MetricType;

  @ApiProperty({
    example: 1,
    description: 'Time window in months (e.g. 1 = last 1 month)',
  })
  @Type(() => Number)
  @IsInt()
  @IsPositive()
  period: number;

  @ApiPropertyOptional({
    enum: MetricUnit,
    example: MetricUnit.Feet,
    description: 'Convert all values to this unit',
  })
  @IsOptional()
  @IsEnum(MetricUnit)
  unit?: MetricUnit;
}
