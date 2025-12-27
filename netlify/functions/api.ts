import type { Handler } from '@netlify/functions';
import { z } from 'zod';
import { isRateLimited } from './_shared/rateLimit';
import { getBearerToken, getClientIp } from './_shared/http';
import { requireAdmin } from './_shared/adminAuth';
import { getSupabaseAdmin, getSupabasePublic } from './_shared/supabase';

function corsHeaders() {
  return {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    'Access-Control-Allow-Methods': 'GET,POST,PUT,PATCH,DELETE,OPTIONS',
  };
}

export const handler: Handler = async (event) => {
  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 204, headers: corsHeaders(), body: '' };
  }

  const path = event.path || '';
  const ip = getClientIp(event.headers as any);

  try {
    if (path.startsWith('/api/admin/health')) {
      return { statusCode: 200, headers: { 'Content-Type': 'application/json', ...corsHeaders() }, body: JSON.stringify({ ok: true }) };
    }

    if (path.startsWith('/api/public/settings')) {
      if (event.httpMethod !== 'GET') {
        return { statusCode: 405, headers: { 'Content-Type': 'application/json', ...corsHeaders() }, body: JSON.stringify({ error: 'Method not allowed' }) };
      }
      const key = (event.queryStringParameters?.key || '').trim();
      const allowList = new Set(['site_online']);
      if (!key || !allowList.has(key)) {
        return { statusCode: 400, headers: { 'Content-Type': 'application/json', ...corsHeaders() }, body: JSON.stringify({ error: 'Invalid key' }) };
      }

      const supabaseAdmin = getSupabaseAdmin();
      const { data, error } = await supabaseAdmin
        .from('system_settings')
        .select('key,value,updated_at')
        .eq('key', key)
        .maybeSingle();

      if (error) {
        return { statusCode: 500, headers: { 'Content-Type': 'application/json', ...corsHeaders() }, body: JSON.stringify({ error: 'Failed to load setting' }) };
      }

      return { statusCode: 200, headers: { 'Content-Type': 'application/json', ...corsHeaders() }, body: JSON.stringify({ ok: true, setting: data ?? null }) };
    }

    if (path.startsWith('/api/admin/me')) {
      const admin = await requireAdmin(event);
      return { statusCode: 200, headers: { 'Content-Type': 'application/json', ...corsHeaders() }, body: JSON.stringify({ ok: true, admin }) };
    }

    if (path.startsWith('/api/admin/bootstrap')) {
      if (event.httpMethod !== 'POST') {
        return { statusCode: 405, headers: { 'Content-Type': 'application/json', ...corsHeaders() }, body: JSON.stringify({ error: 'Method not allowed' }) };
      }
      if (isRateLimited(ip, 10, 60_000)) {
        return { statusCode: 429, headers: { 'Content-Type': 'application/json', ...corsHeaders(), 'Retry-After': '60' }, body: JSON.stringify({ error: 'Too many requests' }) };
      }

      const BootstrapSchema = z.object({ secret: z.string().min(8).max(256) });
      const body = event.body ? JSON.parse(event.body) : {};
      const parsed = BootstrapSchema.safeParse(body);
      if (!parsed.success) {
        return { statusCode: 400, headers: { 'Content-Type': 'application/json', ...corsHeaders() }, body: JSON.stringify({ error: 'Invalid payload' }) };
      }

      const expectedSecret = process.env.ADMIN_BOOTSTRAP_SECRET || process.env.ADMIN_KEY;
      if (!expectedSecret || parsed.data.secret !== expectedSecret) {
        return { statusCode: 403, headers: { 'Content-Type': 'application/json', ...corsHeaders() }, body: JSON.stringify({ error: 'Forbidden' }) };
      }

      const token = getBearerToken(event.headers as any);
      if (!token) {
        return { statusCode: 401, headers: { 'Content-Type': 'application/json', ...corsHeaders() }, body: JSON.stringify({ error: 'Missing Authorization Bearer token' }) };
      }

      const supabasePublic = getSupabasePublic();
      const { data: authData, error: authError } = await supabasePublic.auth.getUser(token);
      if (authError || !authData?.user) {
        return { statusCode: 401, headers: { 'Content-Type': 'application/json', ...corsHeaders() }, body: JSON.stringify({ error: 'Invalid or expired token' }) };
      }

      const email = (authData.user.email || '').trim().toLowerCase();
      if (!email) {
        return { statusCode: 400, headers: { 'Content-Type': 'application/json', ...corsHeaders() }, body: JSON.stringify({ error: 'Auth user has no email' }) };
      }

      const supabaseAdmin = getSupabaseAdmin();
      const { count: adminCount, error: adminCountError } = await supabaseAdmin
        .from('users')
        .select('id', { count: 'exact', head: true })
        .eq('role', 'admin')
        .eq('is_active', true);

      if (adminCountError) {
        return { statusCode: 500, headers: { 'Content-Type': 'application/json', ...corsHeaders() }, body: JSON.stringify({ error: 'Failed to check admin status' }) };
      }

      if ((adminCount || 0) > 0) {
        return { statusCode: 409, headers: { 'Content-Type': 'application/json', ...corsHeaders() }, body: JSON.stringify({ error: 'Admin already exists' }) };
      }

      const { data: upserted, error: upsertError } = await supabaseAdmin
        .from('users')
        .upsert(
          { email, role: 'admin', is_active: true, last_login_at: new Date().toISOString(), updated_at: new Date().toISOString() },
          { onConflict: 'email' }
        )
        .select('id,email,role,is_active')
        .single();

      if (upsertError || !upserted) {
        return { statusCode: 500, headers: { 'Content-Type': 'application/json', ...corsHeaders() }, body: JSON.stringify({ error: 'Failed to create admin profile' }) };
      }

      await supabaseAdmin.from('admin_audit_log').insert({
        admin_user_id: upserted.id,
        action: 'bootstrap_admin',
        target_type: 'users',
        target_id: upserted.id,
        diff: { email },
      });

      return { statusCode: 200, headers: { 'Content-Type': 'application/json', ...corsHeaders() }, body: JSON.stringify({ ok: true, admin: upserted }) };
    }

    if (path.startsWith('/api/admin/settings')) {
      const admin = await requireAdmin(event);
      const supabaseAdmin = getSupabaseAdmin();

      if (event.httpMethod === 'GET') {
        const key = (event.queryStringParameters?.key || '').trim();
        if (key) {
          const { data, error } = await supabaseAdmin
            .from('system_settings')
            .select('key,value,updated_at,updated_by')
            .eq('key', key)
            .maybeSingle();
          if (error) {
            return { statusCode: 500, headers: { 'Content-Type': 'application/json', ...corsHeaders() }, body: JSON.stringify({ error: 'Failed to load setting' }) };
          }
          return { statusCode: 200, headers: { 'Content-Type': 'application/json', ...corsHeaders() }, body: JSON.stringify({ ok: true, setting: data ?? null }) };
        }

        const { data, error } = await supabaseAdmin
          .from('system_settings')
          .select('key,value,updated_at,updated_by')
          .order('key', { ascending: true });
        if (error) {
          return { statusCode: 500, headers: { 'Content-Type': 'application/json', ...corsHeaders() }, body: JSON.stringify({ error: 'Failed to load settings' }) };
        }
        return { statusCode: 200, headers: { 'Content-Type': 'application/json', ...corsHeaders() }, body: JSON.stringify({ ok: true, settings: data || [] }) };
      }

      if (event.httpMethod === 'PUT') {
        if (isRateLimited(ip, 60, 60_000)) {
          return { statusCode: 429, headers: { 'Content-Type': 'application/json', ...corsHeaders(), 'Retry-After': '60' }, body: JSON.stringify({ error: 'Too many requests' }) };
        }

        const PutSchema = z.object({ key: z.string().min(1).max(128), value: z.unknown() });
        const body = event.body ? JSON.parse(event.body) : {};
        const parsed = PutSchema.safeParse(body);
        if (!parsed.success) {
          return { statusCode: 400, headers: { 'Content-Type': 'application/json', ...corsHeaders() }, body: JSON.stringify({ error: 'Invalid payload' }) };
        }

        const now = new Date().toISOString();
        const { data: upserted, error } = await supabaseAdmin
          .from('system_settings')
          .upsert({ key: parsed.data.key, value: parsed.data.value as any, updated_at: now, updated_by: admin.profileUserId }, { onConflict: 'key' })
          .select('key,value,updated_at,updated_by')
          .single();

        if (error || !upserted) {
          return { statusCode: 500, headers: { 'Content-Type': 'application/json', ...corsHeaders() }, body: JSON.stringify({ error: 'Failed to save setting' }) };
        }

        await supabaseAdmin.from('admin_audit_log').insert({
          admin_user_id: admin.profileUserId,
          action: 'settings_upsert',
          target_type: 'system_settings',
          target_id: parsed.data.key,
          diff: { key: parsed.data.key },
        });

        return { statusCode: 200, headers: { 'Content-Type': 'application/json', ...corsHeaders() }, body: JSON.stringify({ ok: true, setting: upserted }) };
      }

      return { statusCode: 405, headers: { 'Content-Type': 'application/json', ...corsHeaders() }, body: JSON.stringify({ error: 'Method not allowed' }) };
    }

    return { statusCode: 404, headers: { 'Content-Type': 'application/json', ...corsHeaders() }, body: JSON.stringify({ error: 'Not found' }) };
  } catch (e: any) {
    const statusCode = typeof e?.statusCode === 'number' ? e.statusCode : 500;
    return { statusCode, headers: { 'Content-Type': 'application/json', ...corsHeaders() }, body: JSON.stringify({ error: e?.message || 'Internal server error' }) };
  }
};
