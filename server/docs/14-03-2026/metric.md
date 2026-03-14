# Metric Tracking — Implementation Plan

> **Date:** 2026-03-14
> **Scope:** Service layer implementation for 3 core endpoints

---

## 1. Schema Decision

Schema stays **simple** — no `baseValue`/`baseUnit` denormalization.

**Rationale:** The current spec requires no SQL-level cross-unit comparison. All queries are either:
- Filter by `userId` + `type`, sort by `date DESC`
- Group by `date`, pick latest `createdAt` per day

Unit conversion happens **at read time in the application layer** — no need to maintain a dual-value column.

---

## 2. Unit Conversion — Strategy Pattern

Two metric types have fundamentally different conversion mechanisms:

| Type | Mechanism |
|---|---|
| Distance | Linear — multiply through `meter` as base |
| Temperature | Non-linear — formulas through `celsius` as intermediate |

**Structure:**

```
IUnitConversionStrategy (interface)
  └── DistanceConversionStrategy   @Injectable()
  └── TemperatureConversionStrategy @Injectable()

UnitConversionService (Context) — selects strategy via supports(type)
UnitConversionModule — providers + exports
```

**Why Strategy (not a simple lookup table):**
- Each type encapsulates its own algorithm — Distance is `value × factor`, Temperature needs multi-step formulas
- Each strategy is independently unit-testable via DI
- Adding a new metric type (e.g. `weight`, `speed`) = add one strategy class, zero changes elsewhere (OCP)

---

## 3. File Structure

### New files

```
src/common/unit-conversion/
  interfaces/unit-conversion-strategy.interface.ts
  strategies/distance.strategy.ts
  strategies/temperature.strategy.ts
  unit-conversion.service.ts
  unit-conversion.module.ts

src/modules/metric/
  enums/metric-type.enum.ts          MetricType: distance | temperature
  enums/metric-unit.enum.ts          All 8 units
  constants/metric.constant.ts       UNIT_TYPE_MAP: MetricUnit → MetricType
  dtos/create-metric.dto.ts
  dtos/get-metrics.dto.ts
  dtos/get-chart-data.dto.ts
```

### Modified files

```
src/modules/metric/entities/metric-entry.entity.ts     unit/type fields now typed with enums
src/modules/metric/repositories/metric.repository.ts   + findByType(), findChartData()
src/modules/metric/services/metric.service.ts          implemented create, getList, getChartData
src/modules/metric/controllers/metric.controller.ts    spec-aligned endpoints
src/modules/metric/metric.module.ts                    imports UnitConversionModule
```

---

## 4. API Endpoints

| Method | Path | Description |
|---|---|---|
| `POST` | `/api/v1/metrics` | Add a new metric entry |
| `GET` | `/api/v1/metrics?type=distance[&unit=feet]` | List all entries by type, optional conversion |
| `GET` | `/api/v1/metrics/chart?type=distance&period=1[&unit=feet]` | Chart data — latest per day |

**Header:** `x-user-id: <userId>` required on all requests.

---

## 5. Business Logic Summary

### POST /metrics
1. DTO validates: `unit` ∈ `MetricUnit`, `value > 0`, `date` not future
2. Service derives `type` from `UNIT_TYPE_MAP[unit]`
3. Saves `{ userId, date, value, unit, type }`

### GET /metrics
1. If `unit` provided → assert `UNIT_TYPE_MAP[unit] === type` (else 400)
2. `findByType(userId, type)` → ordered by `date DESC`
3. If `unit` → convert each entry's value via `UnitConversionService`

### GET /metrics/chart
1. Same unit validation as above
2. `startDate = today − period months`, `endDate = today`
3. `findChartData(...)` → subquery picks `MAX(createdAt)` per date, joins back to get full row
4. If `unit` → convert values

---

## 6. Chart Data Query

"Latest entry per day" via subquery (TypeORM QueryBuilder):

```sql
SELECT me.*
FROM metric_entries me
INNER JOIN (
  SELECT MAX(created_at) AS max_created_at, date AS sub_date
  FROM metric_entries
  WHERE user_id = ? AND type = ? AND date BETWEEN ? AND ?
  GROUP BY date
) latest ON me.date = latest.sub_date AND me.created_at = latest.max_created_at
WHERE me.user_id = ? AND me.type = ?
ORDER BY me.date DESC
```

---

## 7. Validation

| Rule | Where |
|---|---|
| `unit` must be a valid `MetricUnit` | DTO `@IsEnum(MetricUnit)` |
| `value` must be positive | DTO `@IsPositive()` |
| `date` must not be future | DTO custom `@IsNotFutureDate()` validator |
| `unit` must match `type` on read | Service layer → `BadRequestException` |
| `period` must be positive integer | DTO `@IsInt() @IsPositive()` |

---

## 8. Conversion Formulas

### Distance (linear through meter)
```
To meter:   meter×1, centimeter×0.01, inch÷39.3701, feet÷3.28084, yard÷1.09361
From meter: reverse the factor
```

### Temperature (non-linear through celsius)
```
→ Celsius:  °F → (°F − 32) × 5/9  |  °K → °K − 273.15
→ Target:   °C → °F: °C × 9/5 + 32  |  °C → °K: °C + 273.15
```
