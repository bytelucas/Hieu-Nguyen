import {
  Inject,
  Injectable,
  UnprocessableEntityException,
  mixin,
} from '@nestjs/common';
import { PipeTransform, Scope, Type } from '@nestjs/common/interfaces';
import { REQUEST } from '@nestjs/core';
import {
  PaginationDefaultCursorField,
  PaginationDefaultMaxPerPage,
  PaginationDefaultPerPage,
  PaginationMaxCursorLength,
} from '@common/pagination/constants/pagination.constant';
import { IRequestApp } from '@common/request/interfaces/request.interface';
import { IPaginationQueryCursorParams } from '@common/pagination/interfaces/pagination.interface';
import { EnumPaginationStatusCodeError } from '@common/pagination/enums/pagination.status-code.enum';

export function PaginationCursorPipe(
  defaultPerPage: number = PaginationDefaultPerPage,
  defaultCursorField: string = PaginationDefaultCursorField,
): Type<PipeTransform> {
  @Injectable({ scope: Scope.REQUEST })
  class MixinPaginationCursorPipe implements PipeTransform {
    constructor(@Inject(REQUEST) private readonly request: IRequestApp) {}

    transform(
      value: {
        cursor?: string;
        perPage?: number | string;
      } & IPaginationQueryCursorParams,
    ): IPaginationQueryCursorParams {
      try {
        const finalPerPage = this.validatePerPage(value.perPage);
        const trimmedCursor = this.validateAndSanitizeCursor(value.cursor);

        this.request.__pagination = {
          ...this.request.__pagination,
          perPage: finalPerPage,
          cursor: trimmedCursor,
        };

        return {
          ...value,
          limit: finalPerPage,
          cursor: trimmedCursor,
          cursorField: defaultCursorField,
        };
      } catch (error) {
        if (error instanceof UnprocessableEntityException) {
          throw error;
        }
        throw new UnprocessableEntityException({
          statusCode:
            EnumPaginationStatusCodeError.invalidCursorPaginationParams,
          message: 'Invalid cursor pagination params',
        });
      }
    }

    private validatePerPage(perPage?: number | string): number {
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

    private validateAndSanitizeCursor(cursor?: string): string | undefined {
      if (typeof cursor !== 'string') return undefined;
      const trimmed = cursor.trim();
      if (trimmed === '') return undefined;
      if (trimmed.length > PaginationMaxCursorLength) {
        throw new UnprocessableEntityException({
          statusCode: EnumPaginationStatusCodeError.cursorTooLong,
          message: 'Cursor too long',
        });
      }
      const urlSafeBase64Regex = /^[A-Za-z0-9_-]+$/;
      if (!urlSafeBase64Regex.test(trimmed)) {
        throw new UnprocessableEntityException({
          statusCode: EnumPaginationStatusCodeError.invalidCursorFormat,
          message: 'Invalid cursor format',
        });
      }
      return trimmed;
    }
  }

  return mixin(MixinPaginationCursorPipe);
}
