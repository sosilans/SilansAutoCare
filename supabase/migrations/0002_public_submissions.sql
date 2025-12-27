-- Public submissions storage for Contact / Reviews / FAQ.
-- Apply this in Supabase SQL editor or via Supabase CLI migrations.

-- Contact submissions (PII: name/email/phone/message).
create table if not exists public.contact_submissions (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  name text not null,
  email text not null,
  phone text null,
  message text not null,
  status text not null default 'new' check (status in ('new','contacted','resolved')),
  meta jsonb not null default '{}'::jsonb
);

create index if not exists contact_submissions_status_idx on public.contact_submissions(status);
create index if not exists contact_submissions_created_at_idx on public.contact_submissions(created_at desc);

-- Reviews submitted by users (pending moderation).
create table if not exists public.review_submissions (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  name text not null,
  email text not null,
  message text not null,
  status text not null default 'pending' check (status in ('pending','approved','rejected')),
  meta jsonb not null default '{}'::jsonb
);

create index if not exists review_submissions_status_idx on public.review_submissions(status);
create index if not exists review_submissions_created_at_idx on public.review_submissions(created_at desc);

-- FAQ questions submitted by users (pending moderation / answering).
create table if not exists public.faq_submissions (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  name text not null,
  email text not null,
  question text not null,
  answer text null,
  status text not null default 'pending' check (status in ('pending','approved','rejected')),
  meta jsonb not null default '{}'::jsonb
);

create index if not exists faq_submissions_status_idx on public.faq_submissions(status);
create index if not exists faq_submissions_created_at_idx on public.faq_submissions(created_at desc);

-- NOTE:
-- This project writes/reads these tables via Netlify Functions with the service role key,
-- so RLS is not required for the functions to work.
-- If you later add direct client reads, enable RLS and add policies.
