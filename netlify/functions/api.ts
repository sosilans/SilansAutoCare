import type { Handler } from '@netlify/functions';
import { z } from 'zod';
import { isRateLimited } from './_shared/rateLimit';
import { getBearerToken, getClientIp } from './_shared/http';
import { requireAdmin } from './_shared/adminAuth';
import { getSupabaseAdmin, getSupabasePublic } from './_shared/supabase';

const SERVICES_OVERRIDES_KEY = 'services_overrides_v1';

type SeedReview = {
  name: string;
  date: string;
  rating: number;
  text: string;
  avatar: string;
  color: string;
};

type SeedFaq = {
  name: string;
  date: string;
  question: string;
  answer: string;
  avatar: string;
  color: string;
};

const DEFAULT_SITE_REVIEWS: SeedReview[] = [
  {
    name: 'Michael Johnson',
    rating: 5,
    date: 'October 2024',
    text: 'Absolutely incredible work! My Tesla Model 3 looks better than the day I bought it. The ceramic coating is amazing!',
    avatar: '👨',
    color: 'from-cyan-400 via-blue-400 to-purple-400',
  },
  {
    name: 'Sarah Martinez',
    rating: 5,
    date: 'November 2024',
    text: 'Best detailing service in Sacramento! The attention to detail is unmatched. Worth every penny!',
    avatar: '👩',
    color: 'from-pink-400 via-rose-400 to-purple-400',
  },
  {
    name: 'David Chen',
    rating: 5,
    date: 'November 2024',
    text: 'Professional and passionate! They transformed my 10-year-old car. It looks brand new. Thank you!',
    avatar: '👨‍💼',
    color: 'from-cyan-400 via-teal-400 to-blue-400',
  },
  {
    name: 'Emily Roberts',
    rating: 5,
    date: 'November 2024',
    text: 'The paint correction service removed years of swirl marks. My black BMW finally has that mirror finish!',
    avatar: '👩‍💼',
    color: 'from-purple-400 via-pink-400 to-cyan-400',
  },
  {
    name: 'James Wilson',
    rating: 5,
    date: 'October 2024',
    text: 'Outstanding service! They worked on my Mercedes and the results exceeded all expectations. Highly recommend!',
    avatar: '👨‍💻',
    color: 'from-blue-400 via-cyan-400 to-teal-400',
  },
  {
    name: 'Lisa Anderson',
    rating: 5,
    date: 'September 2024',
    text: 'The interior detailing brought my car back to life! Every corner was spotless. True professionals!',
    avatar: '👩‍🦰',
    color: 'from-purple-400 via-violet-400 to-pink-400',
  },
  {
    name: 'Robert Taylor',
    rating: 5,
    date: 'September 2024',
    text: 'Exceptional quality! The team is friendly, professional, and truly cares about their work. My Audi looks stunning!',
    avatar: '👨‍🦳',
    color: 'from-cyan-400 via-blue-500 to-purple-500',
  },
  {
    name: 'Amanda White',
    rating: 5,
    date: 'August 2024',
    text: 'Best car care experience ever! They took their time and the results are incredible. Will definitely come back!',
    avatar: '👱‍♀️',
    color: 'from-pink-400 via-purple-400 to-indigo-400',
  },
];

const DEFAULT_SITE_FAQS: SeedFaq[] = [
  {
    name: 'Michael Johnson',
    date: 'November 2024',
    question: 'Do you have a power generator for detailing?',
    answer:
      'Yes, we have a generator for backup power. However, if you can provide a standard 120V outlet on your property, we offer a small discount since we can use your electricity instead.',
    avatar: '👨',
    color: 'from-cyan-400 via-blue-400 to-purple-400',
  },
  {
    name: 'Sarah Martinez',
    date: 'November 2024',
    question: 'What payment methods do you accept?',
    answer: "We accept cash, Zelle, and Cash App. Choose the method that's most convenient for you when booking your service.",
    avatar: '👩',
    color: 'from-pink-400 via-rose-400 to-purple-400',
  },
  {
    name: 'David Chen',
    date: 'October 2024',
    question: 'Do you only offer mobile detailing?',
    answer:
      'Yes, we specialize exclusively in mobile detailing. We come to your location — home, office, or wherever your vehicle is. No fixed studio, just convenience for you.',
    avatar: '👨‍💼',
    color: 'from-cyan-400 via-teal-400 to-blue-400',
  },
  {
    name: 'Emily Roberts',
    date: 'October 2024',
    question: 'Do you have a loyalty program?',
    answer:
      "Absolutely! We offer a Maintenance Plan where if you book a wash every 3 months, you get a lower rate than a full cleaning after 3 months. It's better to maintain regularly than to wait and need a deep clean.",
    avatar: '👩‍💼',
    color: 'from-purple-400 via-pink-400 to-cyan-400',
  },
  {
    name: 'James Wilson',
    date: 'September 2024',
    question: 'What areas do you service?',
    answer:
      'We proudly service Sacramento and the surrounding Sacramento area by arrangement. Contact us to confirm if your location is within our service zone.',
    avatar: '👨‍💻',
    color: 'from-blue-400 via-cyan-400 to-teal-400',
  },
  {
    name: 'Lisa Anderson',
    date: 'September 2024',
    question: 'How long does a typical detailing session take?',
    answer:
      "It depends on the service package. A basic wash takes about 1 hour, interior deep clean 1.5-2 hours, and a full detail package can take 3-5 hours. We'll give you an exact time when you book.",
    avatar: '👩‍🦰',
    color: 'from-purple-400 via-violet-400 to-pink-400',
  },
  {
    name: 'Robert Taylor',
    date: 'August 2024',
    question: 'Can you detail exotic or luxury vehicles?',
    answer:
      'Yes! We have experience with all vehicle types, including luxury and exotic cars. We use premium products and gentle techniques to protect high-end finishes and coatings.',
    avatar: '👨‍🦳',
    color: 'from-cyan-400 via-blue-500 to-purple-500',
  },
  {
    name: 'Amanda White',
    date: 'August 2024',
    question: 'How do I book an appointment?',
    answer:
      'You can book through our website contact form, call us directly, or send an email. We recommend booking at least a few days ahead to secure your preferred time slot.',
    avatar: '👱‍♀️',
    color: 'from-pink-400 via-purple-400 to-indigo-400',
  },
];

async function ensureSeedContent(supabaseAdmin: ReturnType<typeof getSupabaseAdmin>) {
  // Reviews seed
  try {
    const { count: seededReviewsCount } = await supabaseAdmin
      .from('review_submissions')
      .select('id', { head: true, count: 'exact' })
      .eq('status', 'approved')
      .contains('meta', { seed: true });

    if ((seededReviewsCount || 0) === 0) {
      await supabaseAdmin.from('review_submissions').insert(
        DEFAULT_SITE_REVIEWS.map((r, idx) => ({
          name: r.name,
          email: 'seed@local',
          message: r.text,
          status: 'approved',
          meta: {
            seed: true,
            order: idx,
            rating: r.rating,
            date: r.date,
            avatar: r.avatar,
            color: r.color,
          },
        })),
      );
    }
  } catch {
    // ignore seeding errors
  }

  // FAQs seed
  try {
    const { count: seededFaqsCount } = await supabaseAdmin
      .from('faq_submissions')
      .select('id', { head: true, count: 'exact' })
      .eq('status', 'approved')
      .contains('meta', { seed: true });

    if ((seededFaqsCount || 0) === 0) {
      await supabaseAdmin.from('faq_submissions').insert(
        DEFAULT_SITE_FAQS.map((f, idx) => ({
          name: f.name,
          email: 'seed@local',
          question: f.question,
          answer: f.answer,
          status: 'approved',
          meta: {
            seed: true,
            order: idx,
            date: f.date,
            avatar: f.avatar,
            color: f.color,
          },
        })),
      );
    }
  } catch {
    // ignore seeding errors
  }
}

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

      // Ensure the built-in site reviews exist in DB so admin can manage them.
      await ensureSeedContent(supabaseAdmin);

      if (event.httpMethod === 'GET') {
        const status = (event.queryStringParameters?.status || 'approved').trim();
        if (!['approved'].includes(status)) {
          return { statusCode: 400, headers: { 'Content-Type': 'application/json', ...corsHeaders() }, body: JSON.stringify({ error: 'Invalid status' }) };
        }

        const limit = Math.min(200, Math.max(1, Number(event.queryStringParameters?.limit || 50) || 50));
        const { data, error } = await supabaseAdmin
          .from('review_submissions')
          .select('id,created_at,name,message,status,meta')
          .eq('status', 'approved')
          .order('created_at', { ascending: false })
          .limit(limit);

        if (error) {
          return { statusCode: 500, headers: { 'Content-Type': 'application/json', ...corsHeaders() }, body: JSON.stringify({ error: 'Failed to load reviews' }) };
        }

        const rows = (data || []).slice();
        rows.sort((a: any, b: any) => {
          const ao = typeof a?.meta?.order === 'number' ? a.meta.order : Number.POSITIVE_INFINITY;
          const bo = typeof b?.meta?.order === 'number' ? b.meta.order : Number.POSITIVE_INFINITY;
          if (ao !== bo) return ao - bo;
          return String(b?.created_at || '').localeCompare(String(a?.created_at || ''));
        });

        return { statusCode: 200, headers: { 'Content-Type': 'application/json', ...corsHeaders() }, body: JSON.stringify({ ok: true, rows }) };
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

      // Ensure the built-in site FAQs exist in DB so admin can manage them.
      await ensureSeedContent(supabaseAdmin);

      if (event.httpMethod === 'GET') {
        const status = (event.queryStringParameters?.status || 'approved').trim();
        if (!['approved'].includes(status)) {
          return { statusCode: 400, headers: { 'Content-Type': 'application/json', ...corsHeaders() }, body: JSON.stringify({ error: 'Invalid status' }) };
        }
        const limit = Math.min(200, Math.max(1, Number(event.queryStringParameters?.limit || 50) || 50));

        const { data, error } = await supabaseAdmin
          .from('faq_submissions')
          .select('id,created_at,name,question,answer,status,meta')
          .eq('status', 'approved')
          .order('created_at', { ascending: false })
          .limit(limit);

        if (error) {
          return { statusCode: 500, headers: { 'Content-Type': 'application/json', ...corsHeaders() }, body: JSON.stringify({ error: 'Failed to load faqs' }) };
        }

        const rows = (data || []).slice();
        rows.sort((a: any, b: any) => {
          const ao = typeof a?.meta?.order === 'number' ? a.meta.order : Number.POSITIVE_INFINITY;
          const bo = typeof b?.meta?.order === 'number' ? b.meta.order : Number.POSITIVE_INFINITY;
          if (ao !== bo) return ao - bo;
          return String(b?.created_at || '').localeCompare(String(a?.created_at || ''));
        });

        return { statusCode: 200, headers: { 'Content-Type': 'application/json', ...corsHeaders() }, body: JSON.stringify({ ok: true, rows }) };
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

      // Ensure defaults exist so admin sees the same content as the public site.
      await ensureSeedContent(supabaseAdmin);

      if (path === '/api/admin/reviews/reorder') {
        if (event.httpMethod !== 'POST') {
          return { statusCode: 405, headers: { 'Content-Type': 'application/json', ...corsHeaders() }, body: JSON.stringify({ error: 'Method not allowed' }) };
        }
        if (isRateLimited(ip, 60, 60_000)) {
          return { statusCode: 429, headers: { 'Content-Type': 'application/json', ...corsHeaders(), 'Retry-After': '60' }, body: JSON.stringify({ error: 'Too many requests' }) };
        }

        const ReorderSchema = z.object({ ids: z.array(z.string().min(10).max(80)).min(1).max(500) });
        const body = event.body ? JSON.parse(event.body) : {};
        const parsed = ReorderSchema.safeParse(body);
        if (!parsed.success) {
          return { statusCode: 400, headers: { 'Content-Type': 'application/json', ...corsHeaders() }, body: JSON.stringify({ error: 'Invalid payload' }) };
        }

        for (let i = 0; i < parsed.data.ids.length; i++) {
          const id = parsed.data.ids[i];
          const { data: existing } = await supabaseAdmin
            .from('review_submissions')
            .select('id,meta')
            .eq('id', id)
            .maybeSingle();
          const nextMeta = { ...(existing?.meta as any), order: i };
          await supabaseAdmin.from('review_submissions').update({ meta: nextMeta }).eq('id', id);
        }

        await supabaseAdmin.from('admin_audit_log').insert({
          admin_user_id: admin.profileUserId,
          action: 'reviews_reorder',
          target_type: 'review_submissions',
          target_id: null,
          diff: { count: parsed.data.ids.length },
        });

        return { statusCode: 200, headers: { 'Content-Type': 'application/json', ...corsHeaders() }, body: JSON.stringify({ ok: true }) };
      }

      if (event.httpMethod === 'GET') {
        const status = (event.queryStringParameters?.status || '').trim();
        let q = supabaseAdmin
          .from('review_submissions')
          .select('id,created_at,name,email,message,status,meta')
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

        const PatchSchema = z
          .object({
            id: z.string().min(10).max(80),
            status: z.enum(['pending', 'approved', 'rejected']).optional(),
            name: z.string().min(1).max(120).optional(),
            message: z.string().min(1).max(5000).optional(),
            meta: z.record(z.unknown()).optional(),
          })
          .refine((v) => Boolean(v.status || v.name || v.message || v.meta), { message: 'No changes' });
        const body = event.body ? JSON.parse(event.body) : {};
        const parsed = PatchSchema.safeParse(body);
        if (!parsed.success) {
          return { statusCode: 400, headers: { 'Content-Type': 'application/json', ...corsHeaders() }, body: JSON.stringify({ error: 'Invalid payload' }) };
        }

        const { data: existing } = await supabaseAdmin
          .from('review_submissions')
          .select('id,status,name,message,meta')
          .eq('id', parsed.data.id)
          .maybeSingle();

        const patch: any = {};
        if (parsed.data.status) patch.status = parsed.data.status;
        if (parsed.data.name) patch.name = parsed.data.name;
        if (parsed.data.message) patch.message = parsed.data.message;
        if (parsed.data.meta) patch.meta = { ...(existing?.meta as any), ...(parsed.data.meta as any) };

        const { data, error } = await supabaseAdmin
          .from('review_submissions')
          .update(patch)
          .eq('id', parsed.data.id)
          .select('id,status')
          .single();

        if (error || !data) {
          return { statusCode: 500, headers: { 'Content-Type': 'application/json', ...corsHeaders() }, body: JSON.stringify({ error: 'Failed to update review' }) };
        }

        await supabaseAdmin.from('admin_audit_log').insert({
          admin_user_id: admin.profileUserId,
          action: 'review_update',
          target_type: 'review_submissions',
          target_id: data.id,
          diff: { ...patch },
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

        const { error } = await supabaseAdmin.from('review_submissions').delete().eq('id', id);
        if (error) {
          return { statusCode: 500, headers: { 'Content-Type': 'application/json', ...corsHeaders() }, body: JSON.stringify({ error: 'Failed to delete review' }) };
        }

        await supabaseAdmin.from('admin_audit_log').insert({
          admin_user_id: admin.profileUserId,
          action: 'review_delete',
          target_type: 'review_submissions',
          target_id: id,
          diff: {},
        });

        return { statusCode: 200, headers: { 'Content-Type': 'application/json', ...corsHeaders() }, body: JSON.stringify({ ok: true }) };
      }

      return { statusCode: 405, headers: { 'Content-Type': 'application/json', ...corsHeaders() }, body: JSON.stringify({ error: 'Method not allowed' }) };
    }

    if (path.startsWith('/api/admin/faqs')) {
      const admin = await requireAdmin(event);
      const supabaseAdmin = getSupabaseAdmin();

      // Ensure defaults exist so admin sees the same content as the public site.
      await ensureSeedContent(supabaseAdmin);

      if (path === '/api/admin/faqs/reorder') {
        if (event.httpMethod !== 'POST') {
          return { statusCode: 405, headers: { 'Content-Type': 'application/json', ...corsHeaders() }, body: JSON.stringify({ error: 'Method not allowed' }) };
        }
        if (isRateLimited(ip, 60, 60_000)) {
          return { statusCode: 429, headers: { 'Content-Type': 'application/json', ...corsHeaders(), 'Retry-After': '60' }, body: JSON.stringify({ error: 'Too many requests' }) };
        }

        const ReorderSchema = z.object({ ids: z.array(z.string().min(10).max(80)).min(1).max(500) });
        const body = event.body ? JSON.parse(event.body) : {};
        const parsed = ReorderSchema.safeParse(body);
        if (!parsed.success) {
          return { statusCode: 400, headers: { 'Content-Type': 'application/json', ...corsHeaders() }, body: JSON.stringify({ error: 'Invalid payload' }) };
        }

        for (let i = 0; i < parsed.data.ids.length; i++) {
          const id = parsed.data.ids[i];
          const { data: existing } = await supabaseAdmin
            .from('faq_submissions')
            .select('id,meta')
            .eq('id', id)
            .maybeSingle();
          const nextMeta = { ...(existing?.meta as any), order: i };
          await supabaseAdmin.from('faq_submissions').update({ meta: nextMeta }).eq('id', id);
        }

        await supabaseAdmin.from('admin_audit_log').insert({
          admin_user_id: admin.profileUserId,
          action: 'faqs_reorder',
          target_type: 'faq_submissions',
          target_id: null,
          diff: { count: parsed.data.ids.length },
        });

        return { statusCode: 200, headers: { 'Content-Type': 'application/json', ...corsHeaders() }, body: JSON.stringify({ ok: true }) };
      }

      if (event.httpMethod === 'GET') {
        const status = (event.queryStringParameters?.status || '').trim();
        let q = supabaseAdmin
          .from('faq_submissions')
          .select('id,created_at,name,email,question,answer,status,meta')
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

        const PatchSchema = z
          .object({
            id: z.string().min(10).max(80),
            status: z.enum(['pending', 'approved', 'rejected']).optional(),
            question: z.string().min(1).max(5000).optional(),
            answer: z.string().max(10_000).optional().nullable(),
            name: z.string().min(1).max(120).optional(),
            meta: z.record(z.unknown()).optional(),
          })
          .refine((v) => Boolean(v.status || v.question || v.answer || v.name || v.meta), { message: 'No changes' });
        const body = event.body ? JSON.parse(event.body) : {};
        const parsed = PatchSchema.safeParse(body);
        if (!parsed.success) {
          return { statusCode: 400, headers: { 'Content-Type': 'application/json', ...corsHeaders() }, body: JSON.stringify({ error: 'Invalid payload' }) };
        }

        const { data: existing } = await supabaseAdmin
          .from('faq_submissions')
          .select('id,status,name,question,answer,meta')
          .eq('id', parsed.data.id)
          .maybeSingle();

        const patch: any = {};
        if (parsed.data.status) patch.status = parsed.data.status;
        if (parsed.data.question) patch.question = parsed.data.question;
        if (typeof parsed.data.answer === 'string') patch.answer = parsed.data.answer;
        if (parsed.data.name) patch.name = parsed.data.name;
        if (parsed.data.meta) patch.meta = { ...(existing?.meta as any), ...(parsed.data.meta as any) };

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
          diff: { ...patch },
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

        const { error } = await supabaseAdmin.from('faq_submissions').delete().eq('id', id);
        if (error) {
          return { statusCode: 500, headers: { 'Content-Type': 'application/json', ...corsHeaders() }, body: JSON.stringify({ error: 'Failed to delete faq' }) };
        }

        await supabaseAdmin.from('admin_audit_log').insert({
          admin_user_id: admin.profileUserId,
          action: 'faq_delete',
          target_type: 'faq_submissions',
          target_id: id,
          diff: {},
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
