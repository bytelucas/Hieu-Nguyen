# Metric Tracking API

Backend for Metric Tracking System (Everfit challenge). NestJS + TypeORM + PostgreSQL.

## Requirements

- Node.js >= 18
- PostgreSQL
- pnpm

## Installation

```bash
pnpm install
```

## Configuration

Copy `.env.example` to `.env` and edit:

```bash
cp .env.example .env
```

## Run

```bash
# Development
pnpm start:dev

# Production build
pnpm build
pnpm start:prod
```

## API

- **POST** `/api/metrics` — Add metric entry (header: `x-user-id`)
- **GET** `/api/metrics` — Metric list (offset pagination)
- **GET** `/api/metrics/cursor` — Metric list (cursor pagination)
- **GET** `/api/metrics/chart` — Chart data

Swagger: `http://localhost:3000/docs`

## Structure

- `src/app/` — App module, filters
- `src/common/` — Database, pagination, response
- `src/configs/` — Config
- `src/modules/metric/` — Metric module
- `src/router/` — Route registration
