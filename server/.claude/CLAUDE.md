# Metric Tracking BE — Claude Instructions

## Overview
NestJS backend for Metric Tracking System (Everfit challenge). TypeORM + PostgreSQL. No auth, no queue.

## Architecture
- **Repository** → data access, injects TypeORM Repository
- **Service** → business logic, injects Repository
- **Controller** → HTTP, injects Service

## TypeORM
- Entity: `MetricEntry` in `modules/metric/entities/`
- DatabaseModule: `TypeOrmModule.forRootAsync()` with config from env
- Use `@InjectRepository(Entity)` in repositories

## Pagination
- **Offset**: `@PaginationOffsetQuery({ availableOrderBy: [...] })`
- **Cursor**: `@PaginationCursorQuery({ availableOrderBy: [...], cursorField: 'id' })`
- **Adapter**: `createTypeOrmPaginationAdapter(repository)` returns `IPaginationRepository`
- Use `paginationService.offset(adapter, { ...pagination, where })` or `cursor(...)`

## Response
- `@Response('message')` — single item
- `@ResponsePaging('message')` — paginated list

## Path Aliases
`@app/*` `@common/*` `@config` `@configs/*` `@modules/*` `@router`

## Scripts
- `pnpm start:dev` — dev server
- `pnpm build` — production build
