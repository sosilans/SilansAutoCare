# Analytics Setup (Auto-Metrics + Heatmap)

This project ships a lightweight, GDPR-safe analytics pipeline:

- Client events are anonymized (no cookies, no PII).
- Events are batched and sent via `sendBeacon`/`fetch(keepalive)`.
- Netlify Functions write to a Postgres table named `AnalyticsEvents`.

This repo supports two storage modes:

1) **Supabase-first (recommended)**: ingest uses Supabase (service role) and admin queries use Supabase RPC.
2) **Direct Postgres fallback**: uses a raw Postgres connection string.

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

### Option A (recommended): Supabase-first

Required for **ingest** (server-side insert via service role):
- `SUPABASE_URL`
- `SUPABASE_SERVICE_ROLE_KEY`

Required for **admin query auth** (validate the admin bearer token):
- `SUPABASE_URL`
- `SUPABASE_ANON_KEY`

Also required on the client (Vite):
- `VITE_SUPABASE_URL`
- `VITE_SUPABASE_ANON_KEY`

### Option B: Direct Postgres

Set one of the following (recommended):

- `ANALYTICS_DATABASE_URL` (Postgres connection string)

Fallbacks supported:

- `DATABASE_URL`
- `POSTGRES_URL`

## 3) Endpoints

- Ingest: `/.netlify/functions/analytics-ingest` (POST)
- Query: `/.netlify/functions/analytics-query` (GET)

Notes:
- `analytics-ingest` will **prefer Supabase** if `SUPABASE_URL` + `SUPABASE_SERVICE_ROLE_KEY` are set.
- `analytics-query` is **admin-only** and requires `Authorization: Bearer <supabase_access_token>`.

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

## 5) Supabase RPC functions (for admin queries)

If you want `analytics-query` to run fully through Supabase (fast + no direct DB strings), create these functions in Supabase SQL editor:

```sql
create or replace function public.analytics_service_opens(days int)
returns table(label text, count int)
language sql
stable
as $$
  select
    coalesce((metadata->'service'->>'title'), 'unknown') as label,
    count(*)::int as count
  from "AnalyticsEvents"
  where "type" = 'service_modal_open'
    and created_at >= now() - (days::text || ' days')::interval
  group by 1
  order by 2 desc
  limit 20;
$$;

create or replace function public.analytics_utm(days int)
returns table(campaign text, source text, sessions int)
language sql
stable
as $$
  select
    coalesce(metadata->'utm'->>'utm_campaign', '(none)') as campaign,
    coalesce(metadata->'utm'->>'utm_source', '(none)') as source,
    count(*)::int as sessions
  from "AnalyticsEvents"
  where "type" = 'session_start'
    and created_at >= now() - (days::text || ' days')::interval
  group by 1,2
  order by 3 desc
  limit 50;
$$;

create or replace function public.analytics_scroll_depth(days int)
returns table(day date, avgdepthpct double precision)
language sql
stable
as $$
  select
    date_trunc('day', created_at)::date as day,
    avg((metadata->'scroll'->>'depthPct')::int)::float as avgdepthpct
  from "AnalyticsEvents"
  where "type" = 'scroll_depth'
    and (metadata->'scroll'->>'depthPct') is not null
    and created_at >= now() - (days::text || ' days')::interval
  group by 1
  order by 1 asc;
$$;

create or replace function public.analytics_section_engagement(days int)
returns table(sectionid text, totaldurationms bigint)
language sql
stable
as $$
  select
    coalesce(metadata->>'sectionId', 'unknown') as sectionid,
    sum((metadata->>'durationMs')::bigint)::bigint as totaldurationms
  from "AnalyticsEvents"
  where "type" = 'section_time'
    and (metadata->>'durationMs') is not null
    and created_at >= now() - (days::text || ' days')::interval
  group by 1
  order by 2 desc;
$$;

create or replace function public.analytics_heatmap(days int, page text, lim int)
returns table(x int, y int, vw int, vh int, "elementId" text, "elementLabel" text)
language sql
stable
as $$
  select
    (metadata->'click'->>'x')::int as x,
    (metadata->'click'->>'y')::int as y,
    (metadata->'viewport'->>'w')::int as vw,
    (metadata->'viewport'->>'h')::int as vh,
    coalesce(metadata->>'elementId', '') as "elementId",
    coalesce(metadata->>'elementLabel', '') as "elementLabel"
  from "AnalyticsEvents"
  where "type" = 'click'
    and coalesce(metadata->>'page', '') = page
    and (metadata->'click'->>'x') is not null
    and (metadata->'click'->>'y') is not null
    and created_at >= now() - (days::text || ' days')::interval
  order by created_at desc
  limit lim;
$$;
```

Security note: `analytics-query` is server-side and enforces admin auth, so you can keep RLS strict and avoid exposing these RPCs publicly.
