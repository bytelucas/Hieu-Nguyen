import {
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { HttpArgumentsHost } from '@nestjs/common/interfaces';
import { Response } from 'express';
import { Reflector } from '@nestjs/core';
import { ResponseMessagePathMetaKey } from '@common/response/constants/response.constant';
import { IResponsePagingReturn } from '@common/response/interfaces/response.interface';
import { EnumPaginationType } from '@common/pagination/enums/pagination.enum';

export interface ResponsePagingDto<T> {
  statusCode: number;
  message: string;
  metadata: {
    type: string;
    count?: number;
    perPage: number;
    hasNext: boolean;
    hasPrevious?: boolean;
    page?: number;
    totalPage?: number;
    nextPage?: number;
    previousPage?: number;
    cursor?: string;
  };
  data: T[];
}

@Injectable()
export class ResponsePagingInterceptor<T> implements NestInterceptor {
  constructor(private readonly reflector: Reflector) {}

  intercept(
    context: ExecutionContext,
    next: CallHandler,
  ): Observable<Promise<ResponsePagingDto<T>>> {
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

          const responseData = (await res) as IResponsePagingReturn<T>;

          if (
            !responseData ||
            (responseData.type !== EnumPaginationType.offset &&
              responseData.type !== EnumPaginationType.cursor)
          ) {
            throw new Error('ResponsePaging must return offset or cursor type');
          }

          if (!Array.isArray(responseData.data)) {
            throw new Error('Field data must be an array');
          }

          const metadata = {
            type: responseData.type,
            count: responseData.count,
            perPage: responseData.perPage,
            hasNext: responseData.hasNext,
            hasPrevious:
              responseData.type === EnumPaginationType.offset
                ? responseData.hasPrevious
                : undefined,
            page:
              responseData.type === EnumPaginationType.offset
                ? responseData.page
                : undefined,
            totalPage:
              responseData.type === EnumPaginationType.offset
                ? responseData.totalPage
                : undefined,
            nextPage:
              responseData.type === EnumPaginationType.offset
                ? responseData.nextPage
                : undefined,
            previousPage:
              responseData.type === EnumPaginationType.offset
                ? responseData.previousPage
                : undefined,
            cursor:
              responseData.type === EnumPaginationType.cursor
                ? responseData.cursor
                : undefined,
          };

          const httpStatus =
            responseData.metadata?.httpStatus ?? response.statusCode;
          const statusCode =
            responseData.metadata?.statusCode ?? response.statusCode;

          response.status(httpStatus);

          return {
            statusCode,
            message: messagePath,
            metadata,
            data: responseData.data,
          };
        }),
      );
    }

    return next.handle() as Observable<Promise<ResponsePagingDto<T>>>;
  }
}
