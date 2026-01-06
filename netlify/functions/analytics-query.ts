import type { Handler, HandlerEvent } from '@netlify/functions';
import { getSupabaseAdmin, getSupabasePublic } from './_shared/supabase';
import { getSql } from './_shared/postgres';
import { requireAdmin } from './_shared/adminAuth';

const CORS_HEADERS: Record<string, string> = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
};

function getBearerToken(headers: Record<string, any>): string | null {
  const raw = headers?.authorization || headers?.Authorization;
  if (!raw || typeof raw !== 'string') return null;
  const m = raw.match(/^Bearer\s+(.+)$/i);
  return m ? m[1].trim() : null;
}

async function requireAdmin(event: HandlerEvent) {
  const token = getBearerToken(event.headers as any);
  if (!token) {
    const err: any = new Error('Missing Authorization Bearer token');
    err.statusCode = 401;
    throw err;
  }

  const supabasePublic = getSupabasePublic();
  const { data: authData, error: authError } = await supabasePublic.auth.getUser(token);
  if (authError || !authData?.user?.email) {
    const err: any = new Error('Invalid or expired token');
    err.statusCode = 401;
    throw err;
  }

  const email = authData.user.email.trim().toLowerCase();
  const supabaseAdmin = getSupabaseAdmin();
  const { data: profile, error: profileError } = await supabaseAdmin
    .from('users')
    .select('id,email,role,is_active')
    .eq('email', email)
    .maybeSingle();

  if (profileError || !profile) {
    const err: any = new Error('Admin profile not found');
    err.statusCode = 403;
    throw err;
  }

  if (profile.role !== 'admin' || profile.is_active !== true) {
    const err: any = new Error('Forbidden');
    err.statusCode = 403;
    throw err;
  }

  return { id: profile.id, email: profile.email };
}

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

    // Admin-only endpoint.
    await requireAdmin(event);

    // Prefer Supabase RPC (API) if configured.
    let supabaseAdmin: ReturnType<typeof getSupabaseAdmin> | null = null;
    try {
      supabaseAdmin = getSupabaseAdmin();
    } catch {
      supabaseAdmin = null;
    }

    const hasDirectPostgres = Boolean(
      process.env.ANALYTICS_DATABASE_URL || process.env.DATABASE_URL || process.env.POSTGRES_URL,
    );
    const sql = hasDirectPostgres ? getSql() : null;
    const params = event.queryStringParameters || {};
    const metric = params.metric || 'service_opens';
    const days = intParam(params.days || null, 7, 1, 90);
    const page = params.page || '/';

    // IMPORTANT: All responses are anonymized aggregates or click points (no PII stored).

    if (metric === 'service_opens') {
      let rows: any = [];
      try {
        if (supabaseAdmin) {
          const { data, error } = await supabaseAdmin.rpc('analytics_service_opens', { days });
          if (!error) {
            rows = data || [];
          } else if (sql) {
            try {
              rows = await (sql as any)`
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
            } catch (sqlErr) {
              console.error('analytics-query: service_opens - sql fallback failed', sqlErr);
              rows = [];
            }
          } else {
            console.error('analytics-query: service_opens - rpc failed and no sql fallback', error);
            rows = [];
          }
        } else if (sql) {
          rows = await (sql as any)`
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
        }
      } catch (e) {
        console.error('analytics-query: service_opens - unexpected error', e);
        rows = [];
      }

      return {
        statusCode: 200,
        body: JSON.stringify({ metric, days, rows }),
        headers: { ...CORS_HEADERS, 'Content-Type': 'application/json' },
      };
    }

    if (metric === 'utm') {
      let rows: any = [];
      try {
        if (supabaseAdmin) {
          const { data, error } = await supabaseAdmin.rpc('analytics_utm', { days });
          if (!error) rows = data || [];
          else if (sql) {
            try {
              rows = await (sql as any)`
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
            } catch (sqlErr) {
              console.error('analytics-query: utm - sql fallback failed', sqlErr);
              rows = [];
            }
          } else {
            console.error('analytics-query: utm - rpc failed and no sql fallback', error);
            rows = [];
          }
        } else if (sql) {
          rows = await (sql as any)`
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
        }
      } catch (e) {
        console.error('analytics-query: utm - unexpected error', e);
        rows = [];
      }

      return {
        statusCode: 200,
        body: JSON.stringify({ metric, days, rows }),
        headers: { ...CORS_HEADERS, 'Content-Type': 'application/json' },
      };
    }

    if (metric === 'scroll_depth') {
      let rows: any = [];
      try {
        if (supabaseAdmin) {
          const { data, error } = await supabaseAdmin.rpc('analytics_scroll_depth', { days });
          if (!error) rows = data || [];
          else if (sql) {
            try {
              rows = await (sql as any)`
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
            } catch (sqlErr) {
              console.error('analytics-query: scroll_depth - sql fallback failed', sqlErr);
              rows = [];
            }
          } else {
            console.error('analytics-query: scroll_depth - rpc failed and no sql fallback', error);
            rows = [];
          }
        } else if (sql) {
          rows = await (sql as any)`
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
        }
      } catch (e) {
        console.error('analytics-query: scroll_depth - unexpected error', e);
        rows = [];
      }

      return {
        statusCode: 200,
        body: JSON.stringify({ metric, days, rows }),
        headers: { ...CORS_HEADERS, 'Content-Type': 'application/json' },
      };
    }

    if (metric === 'section_engagement') {
      let rows: any = [];
      try {
        if (supabaseAdmin) {
          const { data, error } = await supabaseAdmin.rpc('analytics_section_engagement', { days });
          if (!error) rows = data || [];
          else if (sql) {
            try {
              rows = await (sql as any)`
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
            } catch (sqlErr) {
              console.error('analytics-query: section_engagement - sql fallback failed', sqlErr);
              rows = [];
            }
          } else {
            console.error('analytics-query: section_engagement - rpc failed and no sql fallback', error);
            rows = [];
          }
        } else if (sql) {
          rows = await (sql as any)`
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
        }
      } catch (e) {
        console.error('analytics-query: section_engagement - unexpected error', e);
        rows = [];
      }

      return {
        statusCode: 200,
        body: JSON.stringify({ metric, days, rows }),
        headers: { ...CORS_HEADERS, 'Content-Type': 'application/json' },
      };
    }

    if (metric === 'heatmap') {
      const limit = intParam(params.limit || null, 2000, 100, 10000);
      let rows: any = [];
      try {
        if (supabaseAdmin) {
          const { data, error } = await supabaseAdmin.rpc('analytics_heatmap', { days, page, lim: limit });
          if (!error) rows = data || [];
          else if (sql) {
            try {
              rows = await (sql as any)`
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
            } catch (sqlErr) {
              console.error('analytics-query: heatmap - sql fallback failed', sqlErr);
              rows = [];
            }
          } else {
            console.error('analytics-query: heatmap - rpc failed and no sql fallback', error);
            rows = [];
          }
        } else if (sql) {
          rows = await (sql as any)`
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
        }
      } catch (e) {
        console.error('analytics-query: heatmap - unexpected error', e);
        rows = [];
      }

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
    const status = typeof err?.statusCode === 'number' ? err.statusCode : 500;
    return {
      statusCode: status,
      body: JSON.stringify({ error: status === 401 || status === 403 ? err?.message || 'Forbidden' : 'Internal error', details: err?.message || String(err) }),
      headers: { ...CORS_HEADERS, 'Content-Type': 'application/json' },
    };
  }
};

export { handler };
