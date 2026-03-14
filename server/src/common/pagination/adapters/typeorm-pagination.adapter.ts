import {
  Repository,
  FindOptionsWhere,
  FindOptionsOrder,
  LessThan,
  MoreThan,
  ILike,
  In,
  Not,
  MoreThanOrEqual,
  LessThanOrEqual,
} from 'typeorm';
import { IPaginationRepository } from '@common/pagination/interfaces/pagination.interface';
import { EnumPaginationOrderDirectionType } from '@common/pagination/enums/pagination.enum';

interface PaginationFindArgs {
  where?: Record<string, unknown>;
  skip?: number;
  take?: number;
  orderBy?: Record<string, string>[];
  cursor?: Record<string, string | number>;
}

/**
 * Converts pagination args to TypeORM FindOptions.
 * Use with PaginationService.offset() and PaginationService.cursor().
 */
export function createTypeOrmPaginationAdapter<T>(
  repository: Repository<T>,
): IPaginationRepository {
  return {
    findMany: async (args?: PaginationFindArgs) => {
      if (!args) return repository.find();

      const options: {
        where?: FindOptionsWhere<T> | FindOptionsWhere<T>[];
        skip?: number;
        take?: number;
        order?: FindOptionsOrder<T>;
      } = {};

      if (args.where) {
        options.where = convertWhereToTypeOrm(
          args.where,
        ) as FindOptionsWhere<T>;
      }
      if (args.orderBy) {
        options.order = convertOrderByToTypeOrm(
          args.orderBy,
        ) as FindOptionsOrder<T>;
      }

      if (args.cursor && Object.keys(args.cursor).length > 0) {
        const cursorField = Object.keys(args.cursor)[0];
        const cursorValue = args.cursor[cursorField];
        const orderBy = args.orderBy?.[0];
        const direction = orderBy
          ? Object.values(orderBy)[0]
          : EnumPaginationOrderDirectionType.desc;

        const cursorCondition =
          (direction as EnumPaginationOrderDirectionType) ===
          EnumPaginationOrderDirectionType.desc
            ? LessThan(cursorValue)
            : MoreThan(cursorValue);

        options.where = {
          ...(options.where as object),
          [cursorField]: cursorCondition,
        } as FindOptionsWhere<T>;
      } else {
        if (args.skip !== undefined) options.skip = args.skip;
      }
      if (args.take !== undefined) options.take = args.take;

      return repository.find(options);
    },

    count: async (args?: { where?: Record<string, unknown> }) => {
      if (!args?.where) return repository.count();

      const where = convertWhereToTypeOrm(args.where) as FindOptionsWhere<T>;
      return repository.count({ where });
    },
  };
}

function convertWhereToTypeOrm(
  where: Record<string, unknown>,
): FindOptionsWhere<unknown> | FindOptionsWhere<unknown>[] {
  if (where.or) {
    const orConditions = (where.or as Record<string, unknown>[]).map((c) =>
      convertWhereToTypeOrm(c),
    );
    return orConditions as FindOptionsWhere<unknown>[];
  }

  const result: Record<string, unknown> = {};

  for (const [key, value] of Object.entries(where)) {
    if (value && typeof value === 'object' && !Array.isArray(value)) {
      const v = value as Record<string, unknown>;
      if (v.contains !== undefined) {
        result[key] = ILike(`%${v.contains as string}%`);
      } else if (v.equals !== undefined) {
        result[key] = v.equals;
      } else if (v.in !== undefined) {
        result[key] = In(v.in as unknown[]);
      } else if (v.notIn !== undefined) {
        result[key] = Not(In(v.notIn as unknown[]));
      } else if (v.gte !== undefined) {
        result[key] = MoreThanOrEqual(v.gte);
      } else if (v.lte !== undefined) {
        result[key] = LessThanOrEqual(v.lte);
      } else if (v.not !== undefined) {
        result[key] = Not(v.not);
      } else {
        result[key] = convertWhereToTypeOrm(v);
      }
    } else {
      result[key] = value;
    }
  }
  return result as FindOptionsWhere<unknown>;
}

function convertOrderByToTypeOrm(
  orderBy: Record<string, string>[],
): Record<string, 'ASC' | 'DESC'> {
  const result: Record<string, 'ASC' | 'DESC'> = {};
  for (const entry of orderBy) {
    for (const [field, direction] of Object.entries(entry)) {
      result[field] = direction === 'asc' ? 'ASC' : 'DESC';
    }
  }
  return result;
}
