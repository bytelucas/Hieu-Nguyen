import { Query } from '@nestjs/common';
import { PaginationOrderPipe } from '@common/pagination/pipes/pagination.order.pipe';
import { PaginationSearchPipe } from '@common/pagination/pipes/pagination.search.pipe';
import {
  IPaginationQueryCursorOptions,
  IPaginationQueryOffsetOptions,
} from '@common/pagination/interfaces/pagination.interface';
import { PaginationOffsetPipe } from '@common/pagination/pipes/pagination.offset.pipe';
import { PaginationCursorPipe } from '@common/pagination/pipes/pagination.cursor.pipe';

export function PaginationOffsetQuery(
  options?: IPaginationQueryOffsetOptions,
): ParameterDecorator {
  return Query(
    PaginationSearchPipe(options?.availableSearch),
    PaginationOffsetPipe(options?.defaultPerPage),
    PaginationOrderPipe(options?.availableOrderBy),
  );
}

export function PaginationCursorQuery(
  options?: IPaginationQueryCursorOptions,
): ParameterDecorator {
  return Query(
    PaginationSearchPipe(options?.availableSearch),
    PaginationCursorPipe(options?.defaultPerPage, options?.cursorField),
    PaginationOrderPipe(options?.availableOrderBy),
  );
}
