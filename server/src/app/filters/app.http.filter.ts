import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
  Logger,
} from '@nestjs/common';
import { HttpArgumentsHost } from '@nestjs/common/interfaces';
import { Response } from 'express';
import { IAppException } from '@app/interfaces/app.interface';

@Catch(HttpException)
export class AppHttpFilter implements ExceptionFilter {
  private readonly logger = new Logger(AppHttpFilter.name);

  catch(exception: HttpException, host: ArgumentsHost): void {
    const ctx: HttpArgumentsHost = host.switchToHttp();
    const response: Response = ctx.getResponse<Response>();

    const statusHttp = exception.getStatus();
    const responseException = exception.getResponse();

    let statusCode = statusHttp;
    let message = exception.message;
    let data: unknown;

    if (this.isErrorException(responseException)) {
      statusCode = responseException.statusCode;
      message = responseException.message;
      data = responseException.data;
    } else if (
      typeof responseException === 'object' &&
      responseException !== null
    ) {
      const obj = responseException as Record<string, unknown>;
      if ('message' in obj) {
        message = Array.isArray(obj.message)
          ? obj.message.join(', ')
          : (obj.message as string);
      }
    }

    this.logger.error(
      { statusCode, message, data },
      exception.constructor.name,
    );

    response.status(statusHttp).json({
      statusCode,
      message,
      ...(data && { data }),
    });
  }

  isErrorException(obj: unknown): obj is IAppException<unknown> {
    return (
      typeof obj === 'object' &&
      obj !== null &&
      'statusCode' in obj &&
      'message' in obj
    );
  }
}
