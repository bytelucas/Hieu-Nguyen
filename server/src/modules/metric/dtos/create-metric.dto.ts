import {
  IsEnum,
  IsISO8601,
  IsPositive,
  IsNumber,
  registerDecorator,
  ValidationOptions,
  ValidatorConstraint,
  ValidatorConstraintInterface,
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { MetricUnit } from '@modules/metric/enums/metric-unit.enum';

@ValidatorConstraint({ name: 'isNotFutureDate' })
class IsNotFutureDateConstraint implements ValidatorConstraintInterface {
  validate(value: string): boolean {
    const today = new Date().toISOString().split('T')[0];
    return value <= today;
  }

  defaultMessage(): string {
    return 'date must not be a future date';
  }
}

function IsNotFutureDate(options?: ValidationOptions) {
  return function (object: object, propertyName: string) {
    registerDecorator({
      target: (object as { constructor: Function }).constructor,
      propertyName,
      options,
      constraints: [],
      validator: IsNotFutureDateConstraint,
    });
  };
}

export class CreateMetricDto {
  @ApiProperty({
    example: '2026-03-14',
    description: 'Calendar date of measurement (not future)',
  })
  @IsISO8601({ strict: false })
  @IsNotFutureDate()
  date: string;

  @ApiProperty({
    example: 100.5,
    description: 'Positive numeric measurement value',
  })
  @IsNumber()
  @IsPositive()
  value: number;

  @ApiProperty({
    enum: MetricUnit,
    example: MetricUnit.Meter,
    description: 'Unit of measurement',
  })
  @IsEnum(MetricUnit)
  unit: MetricUnit;
}
