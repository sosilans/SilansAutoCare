import type { Handler } from '@netlify/functions';
import { z } from 'zod';
import { json, getClientIp } from './_shared/http';
import { isRateLimited } from './_shared/rateLimit';
import { getSupabaseAdmin } from './_shared/supabase';

const BodySchema = z.object({
  type: z.string().min(1).max(64),
  sessionId: z.string().max(128).optional(),
  path: z.string().max(512).optional(),
  referrer: z.string().max(512).optional(),
  deviceType: z.enum(['mobile', 'desktop', 'tablet']).optional(),
  country: z.string().max(8).optional(),
  metadata: z.record(z.string(), z.unknown()).optional(),
});

export const handler: Handler = async (event) => {
  const ip = getClientIp(event.headers as any);
  if (isRateLimited(ip, 30, 60_000)) {
    return json(429, { error: 'Too many requests' }, { 'Retry-After': '60' });
  }

  if (event.httpMethod !== 'POST') {
    return json(405, { error: 'Method not allowed' });
  }

  try {
    const parsed = BodySchema.safeParse(event.body ? JSON.parse(event.body) : {});
    if (!parsed.success) {
      return json(400, { error: 'Invalid payload' });
    }

    const supabase = getSupabaseAdmin();
    const { error } = await supabase.from('analytics_events').insert({
      type: parsed.data.type,
      session_id: parsed.data.sessionId,
      path: parsed.data.path,
      referrer: parsed.data.referrer,
      device_type: parsed.data.deviceType,
      country: parsed.data.country,
      metadata: parsed.data.metadata ?? {},
    });

    if (error) {
      return json(500, { error: 'Failed to store event' });
    }

    return json(200, { ok: true });
  } catch (e: any) {
    return json(500, { error: 'Internal server error', details: e?.message || String(e) });
  }
};
