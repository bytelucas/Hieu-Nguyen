import {
  Inject,
  Injectable,
  UnprocessableEntityException,
  mixin,
} from '@nestjs/common';
import { PipeTransform, Scope, Type } from '@nestjs/common/interfaces';
import { REQUEST } from '@nestjs/core';
import {
  PaginationDefaultMaxPage,
  PaginationDefaultMaxPerPage,
  PaginationDefaultPerPage,
} from '@common/pagination/constants/pagination.constant';
import { IRequestApp } from '@common/request/interfaces/request.interface';
import { IPaginationQueryOffsetParams } from '@common/pagination/interfaces/pagination.interface';
import { EnumPaginationStatusCodeError } from '@common/pagination/enums/pagination.status-code.enum';

export function PaginationOffsetPipe(
  defaultPerPage: number = PaginationDefaultPerPage,
): Type<PipeTransform> {
  @Injectable({ scope: Scope.REQUEST })
  class MixinPaginationOffsetPipe implements PipeTransform {
    constructor(@Inject(REQUEST) private readonly request: IRequestApp) {}

    transform(
      value: {
        page?: number | string;
        perPage?: number | string;
      } & IPaginationQueryOffsetParams,
    ): IPaginationQueryOffsetParams {
      try {
        const finalPage = this.validateAndParsePage(value.page);
        const finalPerPage = this.validateAndParsePerPage(value.perPage);

        const skip = (finalPage - 1) * finalPerPage;
        this.request.__pagination = {
          ...this.request.__pagination,
          page: finalPage,
          perPage: finalPerPage,
        };

        return {
          ...value,
          limit: finalPerPage,
          skip,
        };
      } catch (error) {
        if (error instanceof UnprocessableEntityException) {
          throw error;
        }
        throw new UnprocessableEntityException({
          statusCode:
            EnumPaginationStatusCodeError.invalidOffsetPaginationParams,
          message: 'Invalid offset pagination params',
        });
      }
    }

    private validateAndParsePage(page?: number | string): number {
      let finalPage = page ?? 1;
      if (typeof finalPage === 'string') {
        finalPage = Number.parseInt(finalPage, 10);
      }
      if (!Number.isFinite(finalPage) || !Number.isInteger(finalPage)) {
        throw new UnprocessableEntityException({
          statusCode: EnumPaginationStatusCodeError.invalidPage,
          message: 'Invalid page',
        });
      }
      if (finalPage > PaginationDefaultMaxPage) {
        throw new UnprocessableEntityException({
          statusCode: EnumPaginationStatusCodeError.pageExceedsMaximum,
          message: 'Page exceeds maximum',
        });
      }
      if (finalPage < 1) {
        throw new UnprocessableEntityException({
          statusCode: EnumPaginationStatusCodeError.pageCannotBeLessThanOne,
          message: 'Page cannot be less than one',
        });
      }
      return finalPage;
    }

    private validateAndParsePerPage(perPage?: number | string): number {
      let finalPerPage = perPage ?? defaultPerPage;
      if (typeof finalPerPage === 'string') {
        finalPerPage = Number.parseInt(finalPerPage, 10);
      }
      if (!Number.isFinite(finalPerPage) || !Number.isInteger(finalPerPage)) {
        throw new UnprocessableEntityException({
          statusCode: EnumPaginationStatusCodeError.invalidPerPage,
          message: 'Invalid perPage',
        });
      }
      if (finalPerPage > PaginationDefaultMaxPerPage) {
        throw new UnprocessableEntityException({
          statusCode: EnumPaginationStatusCodeError.perPageExceedsMaximum,
          message: 'PerPage exceeds maximum',
        });
      }
      if (finalPerPage < 1) {
        throw new UnprocessableEntityException({
          statusCode: EnumPaginationStatusCodeError.perPageCannotBeLessThanOne,
          message: 'PerPage cannot be less than one',
        });
      }
      return finalPerPage;
    }
  }

  return mixin(MixinPaginationOffsetPipe);
}
