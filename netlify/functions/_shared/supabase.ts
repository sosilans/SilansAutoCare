import { createClient } from '@supabase/supabase-js';

function normalizeSupabaseUrl(raw: string | undefined): string | null {
  let value = (raw || '').trim();
  if (!value) return null;

  // Common copy/paste mistake: leaving docs placeholder in place.
  if (value.includes('<') || value.includes('>') || /<\s*project-ref\s*>/i.test(value)) {
    throw new Error(
      `Invalid SUPABASE_URL: looks like a placeholder. Set it to your real project URL, e.g. https://<your-project-ref>.supabase.co (current: ${value})`,
    );
  }

  // Allow common Netlify env mistakes like missing protocol.
  if (!/^https?:\/\//i.test(value)) {
    value = `https://${value}`;
  }

  // Strip trailing slash for consistency.
  value = value.replace(/\/+$/, '');

  // Final validation.
  try {
    // eslint-disable-next-line no-new
    new URL(value);
  } catch {
    throw new Error(
      `Invalid SUPABASE_URL: must be a valid http(s) URL like https://<project-ref>.supabase.co (current: ${value})`,
    );
  }

  return value;
}

export function getSupabaseAdmin() {
  const url = normalizeSupabaseUrl(process.env.SUPABASE_URL);
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !serviceKey) {
    throw new Error('Supabase server env not configured (SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY)');
  }
  return createClient(url, serviceKey, {
    auth: { persistSession: false },
  });
}

export function getSupabasePublic() {
  const url = normalizeSupabaseUrl(process.env.SUPABASE_URL);
  const anonKey = process.env.SUPABASE_ANON_KEY;
  if (!url || !anonKey) {
    throw new Error('Supabase server env not configured (SUPABASE_URL, SUPABASE_ANON_KEY)');
  }
  return createClient(url, anonKey, {
    auth: { persistSession: false },
  });
}
