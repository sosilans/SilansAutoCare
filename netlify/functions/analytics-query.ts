import type { Handler, HandlerEvent } from '@netlify/functions';
import { getSql } from './_shared/postgres';
import { requireAdmin } from './_shared/adminAuth';

const CORS_HEADERS: Record<string, string> = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
};

const requestCache = new Map<string, number[]>();
const RATE_LIMIT = 30;
const RATE_WINDOW = 60_000;

function isRateLimited(ip: string): boolean {
  const now = Date.now();
  const requests = requestCache.get(ip) || [];
  const recent = requests.filter((t) => now - t < RATE_WINDOW);
  if (recent.length >= RATE_LIMIT) return true;
  recent.push(now);
  requestCache.set(ip, recent);
  return false;
}

function intParam(value: string | null, fallback: number, min: number, max: number) {
  const n = value ? Number(value) : NaN;
  if (!Number.isFinite(n)) return fallback;
  return Math.min(max, Math.max(min, Math.floor(n)));
}

const handler: Handler = async (event: HandlerEvent) => {
  const clientIP =
    event.headers['client-ip'] ||
    event.headers['x-forwarded-for'] ||
    event.headers['x-nf-client-connection-ip'] ||
    'unknown';

  if (isRateLimited(clientIP)) {
    return {
      statusCode: 429,
      body: JSON.stringify({ error: 'Too many requests' }),
      headers: {
        ...CORS_HEADERS,
        'Content-Type': 'application/json',
        'Retry-After': '60',
      },
    };
  }

  if (event.httpMethod === 'OPTIONS') {
    return {
      statusCode: 204,
      body: '',
      headers: {
        ...CORS_HEADERS,
      },
    };
  }

  if (event.httpMethod !== 'GET') {
    return {
      statusCode: 405,
      body: JSON.stringify({ error: 'Method not allowed' }),
      headers: {
        ...CORS_HEADERS,
        'Content-Type': 'application/json',
      },
    };
  }

  try {
    // Admin-only: protects analytics & heatmap endpoints from public access.
    await requireAdmin(event);

    const sql = getSql();
    const params = event.queryStringParameters || {};
    const metric = params.metric || 'service_opens';
    const days = intParam(params.days || null, 7, 1, 90);
    const page = params.page || '/';

    // IMPORTANT: All responses are anonymized aggregates or click points (no PII stored).

    if (metric === 'service_opens') {
      const rows = await sql`
        select
          coalesce((metadata->'service'->>'title'), 'unknown') as label,
          count(*)::int as count
        from "AnalyticsEvents"
        where "type" = 'service_modal_open'
          and "created_at" >= now() - (${days}::text || ' days')::interval
        group by 1
        order by 2 desc
        limit 20
      `;
      return {
        statusCode: 200,
        body: JSON.stringify({ metric, days, rows }),
        headers: { ...CORS_HEADERS, 'Content-Type': 'application/json' },
      };
    }

    if (metric === 'utm') {
      const rows = await sql`
        select
          coalesce(metadata->'utm'->>'utm_campaign', '(none)') as campaign,
          coalesce(metadata->'utm'->>'utm_source', '(none)') as source,
          count(*)::int as sessions
        from "AnalyticsEvents"
        where "type" = 'session_start'
          and "created_at" >= now() - (${days}::text || ' days')::interval
        group by 1,2
        order by 3 desc
        limit 50
      `;
      return {
        statusCode: 200,
        body: JSON.stringify({ metric, days, rows }),
        headers: { ...CORS_HEADERS, 'Content-Type': 'application/json' },
      };
    }

    if (metric === 'scroll_depth') {
      const rows = await sql`
        select
          date_trunc('day', "created_at")::date as day,
          avg( (metadata->'scroll'->>'depthPct')::int )::float as avgDepthPct
        from "AnalyticsEvents"
        where "type" = 'scroll_depth'
          and (metadata->'scroll'->>'depthPct') is not null
          and "created_at" >= now() - (${days}::text || ' days')::interval
        group by 1
        order by 1 asc
      `;
      return {
        statusCode: 200,
        body: JSON.stringify({ metric, days, rows }),
        headers: { ...CORS_HEADERS, 'Content-Type': 'application/json' },
      };
    }

    if (metric === 'section_engagement') {
      const rows = await sql`
        select
          coalesce(metadata->>'sectionId', 'unknown') as sectionId,
          sum( (metadata->>'durationMs')::bigint )::bigint as totalDurationMs
        from "AnalyticsEvents"
        where "type" = 'section_time'
          and (metadata->>'durationMs') is not null
          and "created_at" >= now() - (${days}::text || ' days')::interval
        group by 1
        order by 2 desc
      `;
      return {
        statusCode: 200,
        body: JSON.stringify({ metric, days, rows }),
        headers: { ...CORS_HEADERS, 'Content-Type': 'application/json' },
      };
    }

    if (metric === 'heatmap') {
      const limit = intParam(params.limit || null, 2000, 100, 10000);
      const rows = await sql`
        select
          (metadata->'click'->>'x')::int as x,
          (metadata->'click'->>'y')::int as y,
          (metadata->'viewport'->>'w')::int as vw,
          (metadata->'viewport'->>'h')::int as vh,
          coalesce(metadata->>'elementId', '') as elementId,
          coalesce(metadata->>'elementLabel', '') as elementLabel
        from "AnalyticsEvents"
        where "type" = 'click'
          and coalesce(metadata->>'page', '') = ${page}
          and (metadata->'click'->>'x') is not null
          and (metadata->'click'->>'y') is not null
          and "created_at" >= now() - (${days}::text || ' days')::interval
        order by "created_at" desc
        limit ${limit}
      `;
      return {
        statusCode: 200,
        body: JSON.stringify({ metric, days, page, rows }),
        headers: { ...CORS_HEADERS, 'Content-Type': 'application/json' },
      };
    }

    return {
      statusCode: 400,
      body: JSON.stringify({ error: 'Unknown metric', metric }),
      headers: { ...CORS_HEADERS, 'Content-Type': 'application/json' },
    };
  } catch (err: any) {
    console.error('analytics-query error', err);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: 'Internal error', details: err?.message || String(err) }),
      headers: { ...CORS_HEADERS, 'Content-Type': 'application/json' },
    };
  }
};

export { handler };
