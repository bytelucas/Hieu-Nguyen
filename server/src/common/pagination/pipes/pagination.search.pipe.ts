import { Inject, Injectable, Type, mixin } from '@nestjs/common';
import { PipeTransform, Scope } from '@nestjs/common/interfaces';
import { REQUEST } from '@nestjs/core';
import { IRequestApp } from '@common/request/interfaces/request.interface';
import {
  IPaginationQueryCursorParams,
  IPaginationQueryOffsetParams,
} from '@common/pagination/interfaces/pagination.interface';

export function PaginationSearchPipe(
  availableSearch: string[] = [],
): Type<PipeTransform> {
  @Injectable({ scope: Scope.REQUEST })
  class MixinPaginationSearchPipe implements PipeTransform {
    constructor(@Inject(REQUEST) private readonly request: IRequestApp) {}

    transform(
      value: { search?: string } & (
        | IPaginationQueryOffsetParams
        | IPaginationQueryCursorParams
      ),
    ): IPaginationQueryOffsetParams | IPaginationQueryCursorParams {
      if (!value?.search || availableSearch.length === 0) {
        return value;
      }
      const finalSearch = value.search.trim();
      this.request.__pagination = {
        ...this.request.__pagination,
        search: finalSearch,
        availableSearch,
      };
      return {
        ...value,
        where: {
          or: availableSearch.map((field) => ({
            [field]: { contains: finalSearch },
          })),
        },
      };
    }
  }

  return mixin(MixinPaginationSearchPipe);
}
