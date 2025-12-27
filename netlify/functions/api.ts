import type { Handler } from '@netlify/functions';
import { z } from 'zod';
import { isRateLimited } from './_shared/rateLimit';
import { getBearerToken, getClientIp } from './_shared/http';
import { requireAdmin } from './_shared/adminAuth';
import { getSupabaseAdmin, getSupabasePublic } from './_shared/supabase';

const SERVICES_OVERRIDES_KEY = 'services_overrides_v1';

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
      const allowList = new Set(['site_online', 'availability_status', 'maintenance_mode']);
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

    if (path.startsWith('/api/public/contact')) {
      if (event.httpMethod !== 'POST') {
        return { statusCode: 405, headers: { 'Content-Type': 'application/json', ...corsHeaders() }, body: JSON.stringify({ error: 'Method not allowed' }) };
      }
      if (isRateLimited(ip, 20, 60_000)) {
        return { statusCode: 429, headers: { 'Content-Type': 'application/json', ...corsHeaders(), 'Retry-After': '60' }, body: JSON.stringify({ error: 'Too many requests' }) };
      }

      const ContactSchema = z.object({
        name: z.string().min(1).max(120),
        email: z.string().min(3).max(320),
        phone: z.string().max(64).optional().nullable(),
        message: z.string().min(1).max(20_000),
        meta: z.record(z.unknown()).optional(),
      });
      const body = event.body ? JSON.parse(event.body) : {};
      const parsed = ContactSchema.safeParse(body);
      if (!parsed.success) {
        return { statusCode: 400, headers: { 'Content-Type': 'application/json', ...corsHeaders() }, body: JSON.stringify({ error: 'Invalid payload' }) };
      }

      const supabaseAdmin = getSupabaseAdmin();
      const { data, error } = await supabaseAdmin
        .from('contact_submissions')
        .insert({
          name: parsed.data.name,
          email: parsed.data.email,
          phone: parsed.data.phone ?? null,
          message: parsed.data.message,
          status: 'new',
          meta: {
            ...(parsed.data.meta || {}),
            ip,
            ua: (event.headers as any)?.['user-agent'] || (event.headers as any)?.['User-Agent'] || null,
          },
        })
        .select('id,created_at')
        .single();

      if (error || !data) {
        return { statusCode: 500, headers: { 'Content-Type': 'application/json', ...corsHeaders() }, body: JSON.stringify({ error: 'Failed to save contact' }) };
      }

      return { statusCode: 200, headers: { 'Content-Type': 'application/json', ...corsHeaders() }, body: JSON.stringify({ ok: true, id: data.id, created_at: data.created_at }) };
    }

    if (path.startsWith('/api/public/reviews')) {
      const supabaseAdmin = getSupabaseAdmin();

      if (event.httpMethod === 'GET') {
        const status = (event.queryStringParameters?.status || 'approved').trim();
        if (!['approved'].includes(status)) {
          return { statusCode: 400, headers: { 'Content-Type': 'application/json', ...corsHeaders() }, body: JSON.stringify({ error: 'Invalid status' }) };
        }

        const limit = Math.min(200, Math.max(1, Number(event.queryStringParameters?.limit || 50) || 50));
        const { data, error } = await supabaseAdmin
          .from('review_submissions')
          .select('id,created_at,name,message,status')
          .eq('status', 'approved')
          .order('created_at', { ascending: false })
          .limit(limit);

        if (error) {
          return { statusCode: 500, headers: { 'Content-Type': 'application/json', ...corsHeaders() }, body: JSON.stringify({ error: 'Failed to load reviews' }) };
        }

        return { statusCode: 200, headers: { 'Content-Type': 'application/json', ...corsHeaders() }, body: JSON.stringify({ ok: true, rows: data || [] }) };
      }

      if (event.httpMethod === 'POST') {
        if (isRateLimited(ip, 15, 60_000)) {
          return { statusCode: 429, headers: { 'Content-Type': 'application/json', ...corsHeaders(), 'Retry-After': '60' }, body: JSON.stringify({ error: 'Too many requests' }) };
        }

        const ReviewSchema = z.object({
          name: z.string().min(1).max(120),
          email: z.string().min(3).max(320),
          message: z.string().min(1).max(5000),
          meta: z.record(z.unknown()).optional(),
        });
        const body = event.body ? JSON.parse(event.body) : {};
        const parsed = ReviewSchema.safeParse(body);
        if (!parsed.success) {
          return { statusCode: 400, headers: { 'Content-Type': 'application/json', ...corsHeaders() }, body: JSON.stringify({ error: 'Invalid payload' }) };
        }

        const { data, error } = await supabaseAdmin
          .from('review_submissions')
          .insert({
            name: parsed.data.name,
            email: parsed.data.email,
            message: parsed.data.message,
            status: 'pending',
            meta: {
              ...(parsed.data.meta || {}),
              ip,
              ua: (event.headers as any)?.['user-agent'] || (event.headers as any)?.['User-Agent'] || null,
            },
          })
          .select('id,created_at')
          .single();

        if (error || !data) {
          return { statusCode: 500, headers: { 'Content-Type': 'application/json', ...corsHeaders() }, body: JSON.stringify({ error: 'Failed to submit review' }) };
        }

        return { statusCode: 200, headers: { 'Content-Type': 'application/json', ...corsHeaders() }, body: JSON.stringify({ ok: true, id: data.id, created_at: data.created_at }) };
      }

      return { statusCode: 405, headers: { 'Content-Type': 'application/json', ...corsHeaders() }, body: JSON.stringify({ error: 'Method not allowed' }) };
    }

    if (path.startsWith('/api/public/faqs')) {
      const supabaseAdmin = getSupabaseAdmin();

      if (event.httpMethod === 'GET') {
        const status = (event.queryStringParameters?.status || 'approved').trim();
        if (!['approved'].includes(status)) {
          return { statusCode: 400, headers: { 'Content-Type': 'application/json', ...corsHeaders() }, body: JSON.stringify({ error: 'Invalid status' }) };
        }
        const limit = Math.min(200, Math.max(1, Number(event.queryStringParameters?.limit || 50) || 50));

        const { data, error } = await supabaseAdmin
          .from('faq_submissions')
          .select('id,created_at,name,question,answer,status')
          .eq('status', 'approved')
          .order('created_at', { ascending: false })
          .limit(limit);

        if (error) {
          return { statusCode: 500, headers: { 'Content-Type': 'application/json', ...corsHeaders() }, body: JSON.stringify({ error: 'Failed to load faqs' }) };
        }

        return { statusCode: 200, headers: { 'Content-Type': 'application/json', ...corsHeaders() }, body: JSON.stringify({ ok: true, rows: data || [] }) };
      }

      if (event.httpMethod === 'POST') {
        if (isRateLimited(ip, 15, 60_000)) {
          return { statusCode: 429, headers: { 'Content-Type': 'application/json', ...corsHeaders(), 'Retry-After': '60' }, body: JSON.stringify({ error: 'Too many requests' }) };
        }

        const FaqSchema = z.object({
          name: z.string().min(1).max(120),
          email: z.string().min(3).max(320),
          question: z.string().min(1).max(5000),
          meta: z.record(z.unknown()).optional(),
        });
        const body = event.body ? JSON.parse(event.body) : {};
        const parsed = FaqSchema.safeParse(body);
        if (!parsed.success) {
          return { statusCode: 400, headers: { 'Content-Type': 'application/json', ...corsHeaders() }, body: JSON.stringify({ error: 'Invalid payload' }) };
        }

        const { data, error } = await supabaseAdmin
          .from('faq_submissions')
          .insert({
            name: parsed.data.name,
            email: parsed.data.email,
            question: parsed.data.question,
            status: 'pending',
            meta: {
              ...(parsed.data.meta || {}),
              ip,
              ua: (event.headers as any)?.['user-agent'] || (event.headers as any)?.['User-Agent'] || null,
            },
          })
          .select('id,created_at')
          .single();

        if (error || !data) {
          return { statusCode: 500, headers: { 'Content-Type': 'application/json', ...corsHeaders() }, body: JSON.stringify({ error: 'Failed to submit question' }) };
        }

        return { statusCode: 200, headers: { 'Content-Type': 'application/json', ...corsHeaders() }, body: JSON.stringify({ ok: true, id: data.id, created_at: data.created_at }) };
      }

      return { statusCode: 405, headers: { 'Content-Type': 'application/json', ...corsHeaders() }, body: JSON.stringify({ error: 'Method not allowed' }) };
    }

    if (path.startsWith('/api/public/services')) {
      if (event.httpMethod !== 'GET') {
        return { statusCode: 405, headers: { 'Content-Type': 'application/json', ...corsHeaders() }, body: JSON.stringify({ error: 'Method not allowed' }) };
      }

      const supabaseAdmin = getSupabaseAdmin();
      const { data, error } = await supabaseAdmin
        .from('system_settings')
        .select('key,value,updated_at')
        .eq('key', SERVICES_OVERRIDES_KEY)
        .maybeSingle();

      if (error) {
        return { statusCode: 500, headers: { 'Content-Type': 'application/json', ...corsHeaders() }, body: JSON.stringify({ error: 'Failed to load services overrides' }) };
      }

      return {
        statusCode: 200,
        headers: { 'Content-Type': 'application/json', ...corsHeaders() },
        body: JSON.stringify({ ok: true, overrides: (data?.value as any) ?? null, updated_at: data?.updated_at ?? null }),
      };
    }

    if (path.startsWith('/api/admin/me')) {
      const admin = await requireAdmin(event);
      return { statusCode: 200, headers: { 'Content-Type': 'application/json', ...corsHeaders() }, body: JSON.stringify({ ok: true, admin }) };
    }

    if (path.startsWith('/api/admin/services')) {
      const admin = await requireAdmin(event);
      const supabaseAdmin = getSupabaseAdmin();

      if (event.httpMethod === 'GET') {
        const { data, error } = await supabaseAdmin
          .from('system_settings')
          .select('key,value,updated_at,updated_by')
          .eq('key', SERVICES_OVERRIDES_KEY)
          .maybeSingle();

        if (error) {
          return { statusCode: 500, headers: { 'Content-Type': 'application/json', ...corsHeaders() }, body: JSON.stringify({ error: 'Failed to load services overrides' }) };
        }

        return {
          statusCode: 200,
          headers: { 'Content-Type': 'application/json', ...corsHeaders() },
          body: JSON.stringify({ ok: true, overrides: (data?.value as any) ?? null, setting: data ?? null }),
        };
      }

      if (event.httpMethod === 'PUT') {
        if (isRateLimited(ip, 30, 60_000)) {
          return { statusCode: 429, headers: { 'Content-Type': 'application/json', ...corsHeaders(), 'Retry-After': '60' }, body: JSON.stringify({ error: 'Too many requests' }) };
        }

        const LineSchema = z.string().min(1).max(200);
        const DetailsSchema = z
          .object({
            whatYouGet: z.array(LineSchema).max(12).optional(),
            bestFor: z.string().max(500).optional(),
            toolsUsed: z.array(LineSchema).max(12).optional(),
            importantNotes: z.array(LineSchema).max(12).optional(),
            whyChooseUs: z.array(LineSchema).max(12).optional(),
            duration: z.string().max(100).optional(),
            startingPrice: z.string().max(100).optional(),
          })
          .partial();

        const ServiceTextSchema = z
          .object({
            title: z.string().max(200).optional(),
            headline: z.string().max(300).optional(),
            description: z.string().max(2000).optional(),
            details: DetailsSchema.optional(),
          })
          .partial();

        const ServiceOverrideSchema = z
          .object({
            id: z.number().int().min(1).max(6),
            emoji: z.string().max(16).optional(),
            text: z
              .object({
                en: ServiceTextSchema.optional(),
                es: ServiceTextSchema.optional(),
                ru: ServiceTextSchema.optional(),
              })
              .partial()
              .optional(),
          })
          .strict();

        const OverridesSchema = z
          .object({
            version: z.literal(1),
            services: z.array(ServiceOverrideSchema).length(6),
          })
          .strict()
          .superRefine((val, ctx) => {
            const ids = val.services.map((s) => s.id);
            const uniq = new Set(ids);
            if (uniq.size !== ids.length) {
              ctx.addIssue({ code: z.ZodIssueCode.custom, message: 'Duplicate service id' });
            }
            for (const id of [1, 2, 3, 4, 5, 6]) {
              if (!uniq.has(id)) ctx.addIssue({ code: z.ZodIssueCode.custom, message: `Missing service id ${id}` });
            }
          });

        const body = event.body ? JSON.parse(event.body) : {};
        const parsed = OverridesSchema.safeParse(body);
        if (!parsed.success) {
          return { statusCode: 400, headers: { 'Content-Type': 'application/json', ...corsHeaders() }, body: JSON.stringify({ error: 'Invalid payload' }) };
        }

        const now = new Date().toISOString();
        const { data: upserted, error } = await supabaseAdmin
          .from('system_settings')
          .upsert({ key: SERVICES_OVERRIDES_KEY, value: parsed.data as any, updated_at: now, updated_by: admin.profileUserId }, { onConflict: 'key' })
          .select('key,value,updated_at,updated_by')
          .single();

        if (error || !upserted) {
          return { statusCode: 500, headers: { 'Content-Type': 'application/json', ...corsHeaders() }, body: JSON.stringify({ error: 'Failed to save services overrides' }) };
        }

        await supabaseAdmin.from('admin_audit_log').insert({
          admin_user_id: admin.profileUserId,
          action: 'services_overrides_upsert',
          target_type: 'system_settings',
          target_id: SERVICES_OVERRIDES_KEY,
          diff: { key: SERVICES_OVERRIDES_KEY },
        });

        return { statusCode: 200, headers: { 'Content-Type': 'application/json', ...corsHeaders() }, body: JSON.stringify({ ok: true, setting: upserted }) };
      }

      return { statusCode: 405, headers: { 'Content-Type': 'application/json', ...corsHeaders() }, body: JSON.stringify({ error: 'Method not allowed' }) };
    }

    if (path.startsWith('/api/admin/contacts')) {
      const admin = await requireAdmin(event);
      const supabaseAdmin = getSupabaseAdmin();

      if (event.httpMethod === 'GET') {
        const status = (event.queryStringParameters?.status || '').trim();
        let q = supabaseAdmin
          .from('contact_submissions')
          .select('id,created_at,name,email,phone,message,status')
          .order('created_at', { ascending: false })
          .limit(500);
        if (status) {
          if (!['new', 'contacted', 'resolved'].includes(status)) {
            return { statusCode: 400, headers: { 'Content-Type': 'application/json', ...corsHeaders() }, body: JSON.stringify({ error: 'Invalid status' }) };
          }
          q = q.eq('status', status as any);
        }
        const { data, error } = await q;
        if (error) {
          return { statusCode: 500, headers: { 'Content-Type': 'application/json', ...corsHeaders() }, body: JSON.stringify({ error: 'Failed to load contacts' }) };
        }
        return { statusCode: 200, headers: { 'Content-Type': 'application/json', ...corsHeaders() }, body: JSON.stringify({ ok: true, rows: data || [] }) };
      }

      if (event.httpMethod === 'PATCH') {
        if (isRateLimited(ip, 60, 60_000)) {
          return { statusCode: 429, headers: { 'Content-Type': 'application/json', ...corsHeaders(), 'Retry-After': '60' }, body: JSON.stringify({ error: 'Too many requests' }) };
        }

        const PatchSchema = z.object({ id: z.string().min(10).max(80), status: z.enum(['new', 'contacted', 'resolved']) });
        const body = event.body ? JSON.parse(event.body) : {};
        const parsed = PatchSchema.safeParse(body);
        if (!parsed.success) {
          return { statusCode: 400, headers: { 'Content-Type': 'application/json', ...corsHeaders() }, body: JSON.stringify({ error: 'Invalid payload' }) };
        }

        const { data, error } = await supabaseAdmin
          .from('contact_submissions')
          .update({ status: parsed.data.status })
          .eq('id', parsed.data.id)
          .select('id,status')
          .single();

        if (error || !data) {
          return { statusCode: 500, headers: { 'Content-Type': 'application/json', ...corsHeaders() }, body: JSON.stringify({ error: 'Failed to update contact' }) };
        }

        await supabaseAdmin.from('admin_audit_log').insert({
          admin_user_id: admin.profileUserId,
          action: 'contact_update_status',
          target_type: 'contact_submissions',
          target_id: data.id,
          diff: { status: data.status },
        });

        return { statusCode: 200, headers: { 'Content-Type': 'application/json', ...corsHeaders() }, body: JSON.stringify({ ok: true }) };
      }

      if (event.httpMethod === 'DELETE') {
        if (isRateLimited(ip, 60, 60_000)) {
          return { statusCode: 429, headers: { 'Content-Type': 'application/json', ...corsHeaders(), 'Retry-After': '60' }, body: JSON.stringify({ error: 'Too many requests' }) };
        }

        const id = (event.queryStringParameters?.id || '').trim();
        if (!id) {
          return { statusCode: 400, headers: { 'Content-Type': 'application/json', ...corsHeaders() }, body: JSON.stringify({ error: 'Missing id' }) };
        }

        const { error } = await supabaseAdmin.from('contact_submissions').delete().eq('id', id);
        if (error) {
          return { statusCode: 500, headers: { 'Content-Type': 'application/json', ...corsHeaders() }, body: JSON.stringify({ error: 'Failed to delete contact' }) };
        }

        await supabaseAdmin.from('admin_audit_log').insert({
          admin_user_id: admin.profileUserId,
          action: 'contact_delete',
          target_type: 'contact_submissions',
          target_id: id,
          diff: {},
        });

        return { statusCode: 200, headers: { 'Content-Type': 'application/json', ...corsHeaders() }, body: JSON.stringify({ ok: true }) };
      }

      return { statusCode: 405, headers: { 'Content-Type': 'application/json', ...corsHeaders() }, body: JSON.stringify({ error: 'Method not allowed' }) };
    }

    if (path.startsWith('/api/admin/reviews')) {
      const admin = await requireAdmin(event);
      const supabaseAdmin = getSupabaseAdmin();

      if (event.httpMethod === 'GET') {
        const status = (event.queryStringParameters?.status || '').trim();
        let q = supabaseAdmin
          .from('review_submissions')
          .select('id,created_at,name,email,message,status')
          .order('created_at', { ascending: false })
          .limit(500);
        if (status) {
          if (!['pending', 'approved', 'rejected'].includes(status)) {
            return { statusCode: 400, headers: { 'Content-Type': 'application/json', ...corsHeaders() }, body: JSON.stringify({ error: 'Invalid status' }) };
          }
          q = q.eq('status', status as any);
        }
        const { data, error } = await q;
        if (error) {
          return { statusCode: 500, headers: { 'Content-Type': 'application/json', ...corsHeaders() }, body: JSON.stringify({ error: 'Failed to load reviews' }) };
        }
        return { statusCode: 200, headers: { 'Content-Type': 'application/json', ...corsHeaders() }, body: JSON.stringify({ ok: true, rows: data || [] }) };
      }

      if (event.httpMethod === 'PATCH') {
        if (isRateLimited(ip, 60, 60_000)) {
          return { statusCode: 429, headers: { 'Content-Type': 'application/json', ...corsHeaders(), 'Retry-After': '60' }, body: JSON.stringify({ error: 'Too many requests' }) };
        }

        const PatchSchema = z.object({ id: z.string().min(10).max(80), status: z.enum(['pending', 'approved', 'rejected']) });
        const body = event.body ? JSON.parse(event.body) : {};
        const parsed = PatchSchema.safeParse(body);
        if (!parsed.success) {
          return { statusCode: 400, headers: { 'Content-Type': 'application/json', ...corsHeaders() }, body: JSON.stringify({ error: 'Invalid payload' }) };
        }

        const { data, error } = await supabaseAdmin
          .from('review_submissions')
          .update({ status: parsed.data.status })
          .eq('id', parsed.data.id)
          .select('id,status')
          .single();

        if (error || !data) {
          return { statusCode: 500, headers: { 'Content-Type': 'application/json', ...corsHeaders() }, body: JSON.stringify({ error: 'Failed to update review' }) };
        }

        await supabaseAdmin.from('admin_audit_log').insert({
          admin_user_id: admin.profileUserId,
          action: 'review_update_status',
          target_type: 'review_submissions',
          target_id: data.id,
          diff: { status: data.status },
        });

        return { statusCode: 200, headers: { 'Content-Type': 'application/json', ...corsHeaders() }, body: JSON.stringify({ ok: true }) };
      }

      return { statusCode: 405, headers: { 'Content-Type': 'application/json', ...corsHeaders() }, body: JSON.stringify({ error: 'Method not allowed' }) };
    }

    if (path.startsWith('/api/admin/faqs')) {
      const admin = await requireAdmin(event);
      const supabaseAdmin = getSupabaseAdmin();

      if (event.httpMethod === 'GET') {
        const status = (event.queryStringParameters?.status || '').trim();
        let q = supabaseAdmin
          .from('faq_submissions')
          .select('id,created_at,name,email,question,answer,status')
          .order('created_at', { ascending: false })
          .limit(500);
        if (status) {
          if (!['pending', 'approved', 'rejected'].includes(status)) {
            return { statusCode: 400, headers: { 'Content-Type': 'application/json', ...corsHeaders() }, body: JSON.stringify({ error: 'Invalid status' }) };
          }
          q = q.eq('status', status as any);
        }
        const { data, error } = await q;
        if (error) {
          return { statusCode: 500, headers: { 'Content-Type': 'application/json', ...corsHeaders() }, body: JSON.stringify({ error: 'Failed to load faqs' }) };
        }
        return { statusCode: 200, headers: { 'Content-Type': 'application/json', ...corsHeaders() }, body: JSON.stringify({ ok: true, rows: data || [] }) };
      }

      if (event.httpMethod === 'PATCH') {
        if (isRateLimited(ip, 60, 60_000)) {
          return { statusCode: 429, headers: { 'Content-Type': 'application/json', ...corsHeaders(), 'Retry-After': '60' }, body: JSON.stringify({ error: 'Too many requests' }) };
        }

        const PatchSchema = z.object({
          id: z.string().min(10).max(80),
          status: z.enum(['pending', 'approved', 'rejected']),
          answer: z.string().max(10_000).optional().nullable(),
        });
        const body = event.body ? JSON.parse(event.body) : {};
        const parsed = PatchSchema.safeParse(body);
        if (!parsed.success) {
          return { statusCode: 400, headers: { 'Content-Type': 'application/json', ...corsHeaders() }, body: JSON.stringify({ error: 'Invalid payload' }) };
        }

        const patch: any = { status: parsed.data.status };
        if (typeof parsed.data.answer === 'string') patch.answer = parsed.data.answer;

        const { data, error } = await supabaseAdmin
          .from('faq_submissions')
          .update(patch)
          .eq('id', parsed.data.id)
          .select('id,status')
          .single();

        if (error || !data) {
          return { statusCode: 500, headers: { 'Content-Type': 'application/json', ...corsHeaders() }, body: JSON.stringify({ error: 'Failed to update faq' }) };
        }

        await supabaseAdmin.from('admin_audit_log').insert({
          admin_user_id: admin.profileUserId,
          action: 'faq_update',
          target_type: 'faq_submissions',
          target_id: data.id,
          diff: { status: data.status },
        });

        return { statusCode: 200, headers: { 'Content-Type': 'application/json', ...corsHeaders() }, body: JSON.stringify({ ok: true }) };
      }

      return { statusCode: 405, headers: { 'Content-Type': 'application/json', ...corsHeaders() }, body: JSON.stringify({ error: 'Method not allowed' }) };
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
