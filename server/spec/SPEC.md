# Metric Tracking System — Requirement Specification

> **Source:** Everfit Node.js Assignment
> **Purpose:** Analysis and clarification of requirements before implementation

---

## 1. Overview

Build a backend system that allows users to track health/fitness metrics over time. The system supports two categories of metrics — **Distance** and **Temperature** — each with multiple units. Users can log entries, retrieve history, and query chart-ready data with optional unit conversion.

---

## 2. Actors & Context

- There is a single actor: the **User**.
- Authentication is **out of scope**. The `userId` is passed directly in each request and is used solely for **data isolation** (each user sees only their own data).
- No multi-tenancy or permission logic is required.

---

## 3. Domain Concepts

### 3.1 Metric Types & Units


| Type          | Supported Units                               |
| ------------- | --------------------------------------------- |
| `distance`    | `meter`, `centimeter`, `inch`, `feet`, `yard` |
| `temperature` | `celsius`, `fahrenheit`, `kelvin`             |


A metric entry's **type is determined by its unit** — there is no need for the user to explicitly declare the type on input.

### 3.2 Metric Entry

A single metric entry represents a measurement recorded by a user. It consists of:


| Field       | Description                                                                        |
| ----------- | ---------------------------------------------------------------------------------- |
| `userId`    | Identifier of the user who owns this entry                                         |
| `date`      | The **calendar date** the measurement was taken (business date, e.g. `2026-03-10`) |
| `value`     | The numeric measurement value                                                      |
| `unit`      | The unit of the measurement (e.g. `meter`, `celsius`)                              |
| `type`      | Derived from `unit` — either `distance` or `temperature`                           |
| `createdAt` | System timestamp of when the record was stored in the database                     |


---

## 4. Functional Requirements

### 4.1 Add a New Metric Entry

**Intent:** A user records a new measurement.

**Inputs:**

- `userId`
- `date` — the date the measurement was taken (not necessarily today)
- `value` — numeric measurement
- `unit` — the unit of measurement (determines the metric type)

**Business rules:**

- `unit` must be one of the supported units listed in Section 3.1.
- `type` is derived server-side from `unit`; the client does not send it.
- `value` must be a positive number.
- `date` must not be a future date.
- Multiple entries for the same `userId`, same `date`, and same `type` are **allowed** (the user may log the same metric type multiple times in a day).

---

### 4.2 Retrieve All Metrics by Type

**Intent:** A user retrieves their full history of a specific metric type.

**Inputs:**

- `userId`
- `type` — `distance` or `temperature`
- `unit` *(optional)* — if provided, all returned values are converted to this unit

**Output:** A list of all metric entries belonging to the user, filtered by the specified type, ordered by `date` descending.

**Business rules:**

- If `unit` is provided, it must belong to the same type (e.g., cannot request `celsius` when querying `distance`).
- If `unit` is not provided, each entry is returned in its **original stored unit**.
- All entries are returned (no "latest per day" deduplication here — that is only for charts).

---

### 4.3 Retrieve Chart Data

**Intent:** Provide aggregated, time-series data suitable for rendering a line/bar chart.

**Inputs:**

- `userId`
- `type` — `distance` or `temperature`
- `period` — time window in months (e.g., `1` = last 1 month, `2` = last 2 months)
- `unit` *(optional)* — if provided, all returned values are converted to this unit

**Output:** A list of data points, one per day, covering the specified period.

**Business rules:**

1. **One data point per day:** If a user has multiple entries on the same `date`, only the entry with the **latest `createdAt`** is used. Earlier entries on the same day are ignored.
2. **Time range:** The period is calculated as `[today - N months, today]` inclusive.
3. **No data for a day = no data point:** Days within the period that have no entries are simply absent from the result (no zero-filling or null padding).
4. **Unit conversion:** Same rule as Section 4.2 — convert all values to the requested unit if provided.

---

## 5. Unit Conversion Rules

Conversion is applied **on read** — values are always stored in their original unit.

### 5.1 Distance

All distance units convert through `meter` as the base:


| Unit         | To Meter  |
| ------------ | --------- |
| `meter`      | × 1       |
| `centimeter` | ÷ 100     |
| `inch`       | ÷ 39.3701 |
| `feet`       | ÷ 3.28084 |
| `yard`       | ÷ 1.09361 |


To convert from unit A → unit B: convert A to meter, then meter to B.

### 5.2 Temperature

Temperature uses non-linear formulas and cannot use a simple multiplier. Conversion routes through `celsius` as the intermediate:


| From         | To Celsius        |
| ------------ | ----------------- |
| `fahrenheit` | `(°F − 32) × 5/9` |
| `kelvin`     | `°K − 273.15`     |
| `celsius`    | no change         |



| From Celsius   | To                |
| -------------- | ----------------- |
| → `fahrenheit` | `(°C × 9/5) + 32` |
| → `kelvin`     | `°C + 273.15`     |
| → `celsius`    | no change         |


---

## 6. Assumptions & Clarifications

The following points are **not explicitly stated** in the assignment but have been assumed for this implementation:


| #   | Assumption                                                                                                                                |
| --- | ----------------------------------------------------------------------------------------------------------------------------------------- |
| A1  | `date` refers to a calendar date only (no time component). Time-of-day is tracked via `createdAt`.                                        |
| A2  | "Latest entry per day" for chart data is determined by `createdAt` (system timestamp), not `date`.                                        |
| A3  | `userId` is a plain string/identifier — no validation of whether the user actually exists.                                                |
| A4  | Future dates are not allowed for `date` input.                                                                                            |
| A5  | `value` must be a positive finite number.                                                                                                 |
| A6  | When no `unit` query param is given, each entry is returned in its original stored unit (mixed units possible in a single list response). |
| A7  | `period` is specified in whole months and is relative to the current server date.                                                         |


---

## 7. Out of Scope

- User authentication and authorization
- User management (create/delete users)
- Pagination on list endpoints
- Editing or deleting existing metric entries
- Support for additional metric types beyond Distance and Temperature
- Rate limiting, caching, or performance optimization

---

## 8. API Summary


| Method | Endpoint         | Description                                                                                |
| ------ | ---------------- | ------------------------------------------------------------------------------------------ |
| `POST` | `/metrics`       | Add a new metric entry                                                                     |
| `GET`  | `/metrics`       | Get all entries filtered by type (with optional unit conversion)                           |
| `GET`  | `/metrics/chart` | Get chart data — latest per day, filtered by type & period (with optional unit conversion) |


> Detailed request/response schemas will be documented separately (e.g., in a Postman collection or OpenAPI spec).

