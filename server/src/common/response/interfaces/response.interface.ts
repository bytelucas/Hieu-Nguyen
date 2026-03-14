import { HttpStatus } from '@nestjs/common';
import {
  IPaginationCursorReturn,
  IPaginationOffsetReturn,
} from '@common/pagination/interfaces/pagination.interface';

export interface IResponseMetadata {
  statusCode?: number;
  httpStatus?: HttpStatus;
}

export interface IResponseReturn<T = unknown> {
  metadata?: IResponseMetadata;
  data?: T;
}

export type IResponsePagingReturn<T> = (
  | IPaginationOffsetReturn<T>
  | IPaginationCursorReturn<T>
) & {
  metadata?: IResponseMetadata;
};
