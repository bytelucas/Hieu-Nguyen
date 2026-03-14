import { Request } from 'express';
import { IPaginationOrderBy } from '@common/pagination/interfaces/pagination.interface';

export interface IRequestPagination {
  page?: number;
  perPage?: number;
  cursor?: string;
  search?: string;
  orderBy?: IPaginationOrderBy[];
  availableSearch?: string[];
  availableOrderBy?: string[];
  filters?: Record<string, unknown>;
}

export interface IRequestApp extends Request {
  id?: string;
  correlationId?: string;
  __pagination?: IRequestPagination;
}
