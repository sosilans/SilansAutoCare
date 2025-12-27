import type { Handler, HandlerEvent } from '@netlify/functions';
import { getSql } from './_shared/postgres';

type IncomingEvent = {
  type: string;
  metadata: Record<string, unknown>;
};

const CORS_HEADERS: Record<string, string> = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type',
};

const requestCache = new Map<string, number[]>();
const RATE_LIMIT = 60; // requests
const RATE_WINDOW = 60_000; // 1 minute

function isRateLimited(ip: string): boolean {
  const now = Date.now();
  const requests = requestCache.get(ip) || [];
  const recent = requests.filter((t) => now - t < RATE_WINDOW);
  if (recent.length >= RATE_LIMIT) return true;
  recent.push(now);
  requestCache.set(ip, recent);
  return false;
}

function sanitizeMetadata(meta: Record<string, unknown>) {
  // Allowlist-ish: remove obviously sensitive keys and remove huge strings.
  const blocked = new Set([
    'email',
    'phone',
    'name',
    'message',
    'authorization',
    'token',
    'password',
    'userAgent',
    'ip',
  ]);

  const out: Record<string, unknown> = {};
  for (const [k, v] of Object.entries(meta)) {
    if (blocked.has(k)) continue;
    if (typeof v === 'string') out[k] = v.slice(0, 500);
    else if (typeof v === 'number' || typeof v === 'boolean' || v === null) out[k] = v;
    else if (Array.isArray(v)) out[k] = v.slice(0, 50);
    else if (typeof v === 'object') {
      // shallow object copy with limits
      const obj = v as Record<string, unknown>;
      const inner: Record<string, unknown> = {};
      for (const [ik, iv] of Object.entries(obj)) {
        if (blocked.has(ik)) continue;
        if (typeof iv === 'string') inner[ik] = iv.slice(0, 500);
        else if (typeof iv === 'number' || typeof iv === 'boolean' || iv === null) inner[ik] = iv;
      }
      out[k] = inner;
    }
  }
  return out;
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

  if (event.httpMethod !== 'POST') {
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
    const body = event.body ? JSON.parse(event.body) : {};
    const events = Array.isArray(body?.events) ? (body.events as IncomingEvent[]) : [];

    if (!events.length) {
      return {
        statusCode: 200,
        body: JSON.stringify({ ok: true, inserted: 0 }),
        headers: {
          ...CORS_HEADERS,
          'Content-Type': 'application/json',
        },
      };
    }

    const limited = events.slice(0, 100);
    const sql = getSql();

    let inserted = 0;

    for (const e of limited) {
      if (!e || typeof e.type !== 'string' || !e.type.length) continue;
      const meta = e.metadata && typeof e.metadata === 'object' ? (e.metadata as Record<string, unknown>) : {};
      const cleaned = sanitizeMetadata(meta);

      // Hard safety: require sessionId and page, but don't reject the whole batch.
      const sessionId = typeof cleaned.sessionId === 'string' ? cleaned.sessionId : undefined;
      const page = typeof cleaned.page === 'string' ? cleaned.page : undefined;
      if (!sessionId || !page) continue;

      await sql`
        insert into "AnalyticsEvents" ("type", "metadata", "created_at")
        values (${e.type.slice(0, 80)}, ${sql.json(cleaned as any)}, now())
      `;
      inserted++;
    }

    return {
      statusCode: 200,
      body: JSON.stringify({ ok: true, inserted }),
      headers: {
        ...CORS_HEADERS,
        'Content-Type': 'application/json',
      },
    };
  } catch (err: any) {
    console.error('analytics-ingest error', err);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: 'Internal error', details: err?.message || String(err) }),
      headers: {
        ...CORS_HEADERS,
        'Content-Type': 'application/json',
      },
    };
  }
};

export { handler };
