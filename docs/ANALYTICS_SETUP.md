# Analytics Setup (Auto-Metrics + Heatmap)

This project ships a lightweight, GDPR-safe analytics pipeline:

- Client events are anonymized (no cookies, no PII).
- Events are batched and sent via `sendBeacon`/`fetch(keepalive)`.
- Netlify Functions write to a Postgres table named `AnalyticsEvents`.

## 1) Database table

Create this table in your Postgres database:

```sql
create table if not exists "AnalyticsEvents" (
  id bigserial primary key,
  created_at timestamptz not null default now(),
  type text not null,
  metadata jsonb not null
);

create index if not exists analytics_events_type_created_at_idx
  on "AnalyticsEvents" (type, created_at desc);

create index if not exists analytics_events_metadata_page_idx
  on "AnalyticsEvents" ((metadata->>'page'));
```

## 2) Environment variables (Netlify)

Set one of the following (recommended):

- `ANALYTICS_DATABASE_URL` (Postgres connection string)

Fallbacks supported:

- `DATABASE_URL`
- `POSTGRES_URL`

## 3) Endpoints

- Ingest: `/.netlify/functions/analytics-ingest` (POST)
- Query: `/.netlify/functions/analytics-query` (GET)

Query examples:

- `/.netlify/functions/analytics-query?metric=service_opens&days=30`
- `/.netlify/functions/analytics-query?metric=heatmap&page=/&days=7&limit=2000`
- `/.netlify/functions/analytics-query?metric=scroll_depth&days=14`
- `/.netlify/functions/analytics-query?metric=section_engagement&days=30`
- `/.netlify/functions/analytics-query?metric=utm&days=30`

## 4) Privacy / GDPR

The server strips common sensitive keys (`email`, `phone`, `name`, `message`, etc.).
The client never sends form field values.

Session IDs are random and stored in `localStorage` (no cookies).
