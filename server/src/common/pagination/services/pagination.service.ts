import {
  PaginationDefaultCursorField,
  PaginationDefaultOrderBy,
} from '@common/pagination/constants/pagination.constant';
import { EnumPaginationType } from '@common/pagination/enums/pagination.enum';
import { EnumPaginationStatusCodeError } from '@common/pagination/enums/pagination.status-code.enum';
import {
  IPaginationCursorReturn,
  IPaginationCursorValue,
  IPaginationOffsetReturn,
  IPaginationOrderBy,
  IPaginationQueryCursorParams,
  IPaginationQueryOffsetParams,
  IPaginationRepository,
} from '@common/pagination/interfaces/pagination.interface';
import { Injectable, UnprocessableEntityException } from '@nestjs/common';

@Injectable()
export class PaginationService {
  async offset<TReturn, TArgsSelect = unknown, TArgsWhere = unknown>(
    repository: IPaginationRepository,
    args: IPaginationQueryOffsetParams<TArgsSelect, TArgsWhere>,
  ): Promise<IPaginationOffsetReturn<TReturn>> {
    const { limit, skip, where } = args;

    const resolvedOrderBy = this.resolveOrderBy(args.orderBy);
    const countArgs = { where };
    const findArgs = {
      where,
      skip,
      take: limit,
      orderBy: resolvedOrderBy,
    };

    const [count, items] = await Promise.all([
      repository.count(countArgs),
      repository.findMany(findArgs),
    ]);

    const totalPage = Math.ceil(count / limit);
    const currentPage = Math.floor(skip / limit) + 1;
    const hasNext = currentPage < totalPage;
    const hasPrevious = currentPage > 1;

    return {
      type: EnumPaginationType.offset,
      count,
      perPage: limit,
      page: currentPage,
      totalPage,
      hasNext,
      hasPrevious,
      data: items as TReturn[],
      ...(hasNext && { nextPage: currentPage + 1 }),
      ...(hasPrevious && { previousPage: currentPage - 1 }),
    };
  }

  async cursor<TReturn, TArgsSelect = unknown, TArgsWhere = unknown>(
    repository: IPaginationRepository,
    args: IPaginationQueryCursorParams<TArgsSelect, TArgsWhere>,
  ): Promise<IPaginationCursorReturn<TReturn>> {
    const {
      limit,
      where,
      cursor,
      cursorField = PaginationDefaultCursorField,
      includeCount,
    } = args;
    const orderBy = this.resolveOrderBy(args.orderBy);

    let decodedCursor: IPaginationCursorValue | undefined;
    if (cursor) {
      try {
        decodedCursor = this.decodeCursor(cursor);
      } catch {
        throw new UnprocessableEntityException({
          statusCode: EnumPaginationStatusCodeError.invalidCursorFormat,
          message: 'Invalid cursor format',
        });
      }
      if (decodedCursor) {
        const orderByChanged = !this.isDeepEqual(
          decodedCursor.orderBy,
          orderBy,
        );
        const whereChanged = !this.isDeepEqual(decodedCursor.where, where);
        if (orderByChanged || whereChanged) {
          throw new UnprocessableEntityException({
            statusCode:
              EnumPaginationStatusCodeError.invalidCursorPaginationParams,
            message: 'Invalid cursor pagination params',
          });
        }
      }
    }

    const take = limit + 1;
    const findArgs = {
      where,
      take,
      cursor:
        cursor && decodedCursor?.cursor
          ? { [cursorField]: decodedCursor.cursor }
          : undefined,
      skip: cursor ? 1 : 0,
      orderBy,
    };

    const queries: Promise<unknown>[] = [repository.findMany(findArgs)];
    if (includeCount) {
      queries.push(repository.count({ where }));
    }

    const results = await Promise.all(queries);
    const items = results[0] as TReturn[];
    const count = includeCount ? (results[1] as number) : undefined;

    const hasNext = items.length > limit;
    const data = hasNext ? items.slice(0, limit) : items;

    let nextCursor: string | undefined;
    if (hasNext) {
      const nextItem = data[data.length - 1] as Record<string, unknown>;
      nextCursor = this.encodeCursor({
        cursor: nextItem[cursorField] as string,
        orderBy,
        where,
      });
    }

    return {
      type: EnumPaginationType.cursor,
      cursor: nextCursor,
      perPage: limit,
      hasNext,
      data: data,
      ...(includeCount && count !== undefined && { count }),
    };
  }

  private encodeCursor(data: IPaginationCursorValue): string {
    if (data?.cursor === undefined || data?.cursor === null) {
      throw new UnprocessableEntityException({
        statusCode: EnumPaginationStatusCodeError.invalidCursorData,
        message: 'Invalid cursor data',
      });
    }
    try {
      return Buffer.from(JSON.stringify(data))
        .toString('base64')
        .replaceAll(/\+/g, '-')
        .replaceAll(/\//g, '_')
        .replaceAll(/=/g, '');
    } catch {
      throw new UnprocessableEntityException({
        statusCode: EnumPaginationStatusCodeError.failedToEncodeCursor,
        message: 'Failed to encode cursor',
      });
    }
  }

  private decodeCursor(cursor: string): IPaginationCursorValue {
    if (!cursor || typeof cursor !== 'string') {
      throw new UnprocessableEntityException({
        statusCode: EnumPaginationStatusCodeError.invalidCursorFormat,
        message: 'Invalid cursor format',
      });
    }
    try {
      const padded = cursor + '='.repeat((4 - (cursor.length % 4)) % 4);
      const base64 = padded.replaceAll(/-/g, '+').replaceAll(/_/g, '/');
      const decoded = JSON.parse(
        Buffer.from(base64, 'base64').toString(),
      ) as IPaginationCursorValue;
      if (!decoded.cursor || !decoded.orderBy) {
        throw new UnprocessableEntityException({
          statusCode: EnumPaginationStatusCodeError.invalidCursorData,
          message: 'Invalid cursor data',
        });
      }
      return decoded;
    } catch (error) {
      if (error instanceof UnprocessableEntityException) throw error;
      throw new UnprocessableEntityException({
        statusCode: EnumPaginationStatusCodeError.failedToDecodeCursor,
        message: 'Failed to decode cursor',
      });
    }
  }

  private isDeepEqual(obj1: unknown, obj2: unknown): boolean {
    return JSON.stringify(obj1) === JSON.stringify(obj2);
  }

  private resolveOrderBy(orderBy?: IPaginationOrderBy[]): IPaginationOrderBy[] {
    return orderBy?.length ? orderBy : PaginationDefaultOrderBy;
  }
}
