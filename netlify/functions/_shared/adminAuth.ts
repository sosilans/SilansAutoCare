import type { HandlerEvent } from '@netlify/functions';
import { getBearerToken } from './http';
import { getSupabaseAdmin, getSupabasePublic } from './supabase';

export type AdminIdentity = {
  authUserId: string;
  email: string | null;
  profileUserId: string;
  role: 'admin';
};

export async function requireAdmin(event: HandlerEvent): Promise<AdminIdentity> {
  const token = getBearerToken(event.headers as any);
  if (!token) {
    const err: any = new Error('Missing Authorization Bearer token');
    err.statusCode = 401;
    throw err;
  }

  const supabasePublic = getSupabasePublic();
  const { data: authData, error: authError } = await supabasePublic.auth.getUser(token);
  if (authError || !authData?.user) {
    const err: any = new Error('Invalid or expired token');
    err.statusCode = 401;
    throw err;
  }

  const email = authData.user.email ?? null;
  const supabaseAdmin = getSupabaseAdmin();
  const { data: profile, error: profileError } = await supabaseAdmin
    .from('users')
    .select('id,email,role,is_active')
    .eq('email', (email || '').toLowerCase())
    .maybeSingle();

  if (profileError) {
    const err: any = new Error('Failed to load user profile');
    err.statusCode = 500;
    throw err;
  }

  if (!profile || profile.role !== 'admin' || profile.is_active !== true) {
    const err: any = new Error('Admin access denied');
    err.statusCode = 403;
    throw err;
  }

  return {
    authUserId: authData.user.id,
    email,
    profileUserId: profile.id,
    role: 'admin',
  };
}
