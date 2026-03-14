import {
  CallHandler,
  ExecutionContext,
  HttpStatus,
  Injectable,
  NestInterceptor,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { HttpArgumentsHost } from '@nestjs/common/interfaces';
import { Response } from 'express';
import { Reflector } from '@nestjs/core';
import { ResponseMessagePathMetaKey } from '@common/response/constants/response.constant';
import { IResponseReturn } from '@common/response/interfaces/response.interface';

export interface ResponseDto<T> {
  statusCode: number;
  message: string;
  data?: T;
}

@Injectable()
export class ResponseInterceptor<T> implements NestInterceptor {
  constructor(private readonly reflector: Reflector) {}

  intercept(
    context: ExecutionContext,
    next: CallHandler,
  ): Observable<Promise<ResponseDto<T>>> {
    if (context.getType() === 'http') {
      return next.handle().pipe(
        map(async (res: Promise<unknown>) => {
          const ctx: HttpArgumentsHost = context.switchToHttp();
          const response: Response = ctx.getResponse();

          const messagePath: string =
            this.reflector.get<string>(
              ResponseMessagePathMetaKey,
              context.getHandler(),
            ) ?? 'Success';

          let httpStatus: HttpStatus = response.statusCode;
          let statusCode: number = response.statusCode;
          let data: T | undefined;

          const responseData = (await res) as IResponseReturn<T>;
          if (responseData) {
            const { metadata: responseMetadata } = responseData;
            data = responseData.data;
            httpStatus = responseMetadata?.httpStatus ?? httpStatus;
            statusCode = responseMetadata?.statusCode ?? statusCode;
          }

          response.status(httpStatus);

          return {
            statusCode,
            message: messagePath,
            data,
          };
        }),
      );
    }

    return next.handle() as Observable<Promise<ResponseDto<T>>>;
  }
}
