import {
  Inject,
  Injectable,
  Type,
  UnprocessableEntityException,
  mixin,
} from '@nestjs/common';
import { PipeTransform, Scope } from '@nestjs/common/interfaces';
import { REQUEST } from '@nestjs/core';
import { IRequestApp } from '@common/request/interfaces/request.interface';
import { EnumPaginationStatusCodeError } from '@common/pagination/enums/pagination.status-code.enum';
import { EnumPaginationOrderDirectionType } from '@common/pagination/enums/pagination.enum';
import {
  IPaginationOrderBy,
  IPaginationQueryCursorParams,
  IPaginationQueryOffsetParams,
} from '@common/pagination/interfaces/pagination.interface';
import { PaginationDefaultOrderBy } from '@common/pagination/constants/pagination.constant';

export function PaginationOrderPipe(
  defaultAvailableOrder?: string[],
): Type<PipeTransform> {
  @Injectable({ scope: Scope.REQUEST })
  class MixinPaginationOrderPipe implements PipeTransform {
    constructor(@Inject(REQUEST) private readonly request: IRequestApp) {}

    transform(
      value: {
        orderBy?: string;
      } & (IPaginationQueryOffsetParams | IPaginationQueryCursorParams),
    ): IPaginationQueryOffsetParams | IPaginationQueryCursorParams {
      if (
        !value?.orderBy ||
        !defaultAvailableOrder ||
        defaultAvailableOrder.length === 0
      ) {
        return { ...value, orderBy: PaginationDefaultOrderBy };
      }

      const orderByExtractFromRequest = this.extractOrderByToArray(
        value.orderBy,
      );
      if (orderByExtractFromRequest.length === 0) {
        return { ...value, orderBy: PaginationDefaultOrderBy };
      }

      const parsedOrderBy = this.validateOrderBy(
        orderByExtractFromRequest,
        defaultAvailableOrder,
      );

      this.request.__pagination = {
        ...this.request.__pagination,
        orderBy: parsedOrderBy,
        availableOrderBy: defaultAvailableOrder,
      };

      return { ...value, orderBy: parsedOrderBy };
    }

    private extractOrderByToArray(
      orderBy?: string | string[],
    ): Record<string, string>[] {
      if (!orderBy) return [];
      if (Array.isArray(orderBy)) {
        return orderBy.map((entry) => {
          const trimmed = entry.toString().split(':');
          return { [trimmed[0]]: trimmed[1]?.toLowerCase() };
        });
      }
      const trimmed = orderBy.toString().split(':');
      return trimmed?.length > 0
        ? [{ [trimmed[0]]: trimmed[1]?.toLowerCase() }]
        : [];
    }

    private parseOrderBy(
      orderByExtractFromRequest: Record<string, string>[],
    ): IPaginationOrderBy[] {
      return orderByExtractFromRequest.map((entry) => {
        const field = Object.keys(entry)[0];
        const direction = entry[field];
        return {
          [field]:
            EnumPaginationOrderDirectionType[
              direction as keyof typeof EnumPaginationOrderDirectionType
            ],
        };
      });
    }

    private validateOrderBy(
      orderByExtractFromRequest: Record<string, string>[],
      availableOrderBy: string[],
    ): IPaginationOrderBy[] {
      const flatOrderBy = orderByExtractFromRequest.reduce(
        (acc, entry) => ({ ...acc, ...entry }),
        {},
      );
      const fields = Object.keys(flatOrderBy);
      const directions = Object.values(flatOrderBy);

      const invalidField = fields.find(
        (field) => !availableOrderBy.includes(field),
      );
      const invalidDirection = directions.find(
        (direction) =>
          (direction as EnumPaginationOrderDirectionType) !==
            EnumPaginationOrderDirectionType.asc &&
          (direction as EnumPaginationOrderDirectionType) !==
            EnumPaginationOrderDirectionType.desc,
      );

      if (invalidField) {
        throw new UnprocessableEntityException({
          statusCode: EnumPaginationStatusCodeError.orderByNotAllowed,
          message: 'OrderBy field not allowed',
        });
      }
      if (invalidDirection) {
        throw new UnprocessableEntityException({
          statusCode: EnumPaginationStatusCodeError.orderDirectionNotAllowed,
          message: 'Order direction not allowed',
        });
      }
      return this.parseOrderBy(orderByExtractFromRequest);
    }
  }

  return mixin(MixinPaginationOrderPipe);
}
