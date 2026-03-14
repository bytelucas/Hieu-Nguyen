import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { HttpArgumentsHost } from '@nestjs/common/interfaces';
import { Response } from 'express';
import { BadRequestException } from '@nestjs/common';

@Catch(BadRequestException)
export class AppValidationFilter implements ExceptionFilter {
  private readonly logger = new Logger(AppValidationFilter.name);

  catch(exception: BadRequestException, host: ArgumentsHost): void {
    const ctx: HttpArgumentsHost = host.switchToHttp();
    const response: Response = ctx.getResponse<Response>();

    const exceptionResponse = exception.getResponse();
    const message =
      typeof exceptionResponse === 'object' &&
      exceptionResponse !== null &&
      'message' in exceptionResponse
        ? (exceptionResponse as { message: string | string[] }).message
        : exception.message;
    const errors =
      typeof exceptionResponse === 'object' &&
      exceptionResponse !== null &&
      'errors' in exceptionResponse
        ? (exceptionResponse as { errors: unknown[] }).errors
        : undefined;

    this.logger.warn({ message, errors }, 'Validation failed');

    response.status(HttpStatus.BAD_REQUEST).json({
      statusCode: HttpStatus.BAD_REQUEST,
      message: Array.isArray(message) ? message.join(', ') : message,
      ...(errors && { errors }),
    });
  }
}
