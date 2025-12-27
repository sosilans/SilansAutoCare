import { useEffect, useMemo, useState } from 'react';
import type { Session } from '@supabase/supabase-js';
import { AdminDashboard } from './AdminDashboard';
import { useTheme } from './ThemeContext';
import { useAuth } from './AuthContext';
import { Button } from './ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Input } from './ui/input';
import { Alert, AlertDescription } from './ui/alert';
import { getSupabaseBrowser } from '../supabaseBrowser';

type AdminIdentity = {
  authUserId: string;
  email: string | null;
  profileUserId: string;
  role: 'admin';
};

async function apiJson<T>(url: string, init?: RequestInit): Promise<T> {
  const res = await fetch(url, init);
  const text = await res.text();
  let body: any = null;
  try {
    body = text ? JSON.parse(text) : null;
  } catch {
    body = { error: text || 'Invalid JSON response' };
  }
  if (!res.ok) {
    const err: any = new Error(body?.error || `Request failed (${res.status})`);
    err.status = res.status;
    err.body = body;
    throw err;
  }
  return body as T;
}

export function AdminSecureDashboard() {
  const { theme } = useTheme();
  const { isAdmin: localIsAdmin, user: localUser, openAuthModal } = useAuth();

  const supabaseAvailable = useMemo(() => {
    return Boolean(import.meta.env.VITE_SUPABASE_URL && import.meta.env.VITE_SUPABASE_ANON_KEY);
  }, []);

  const [session, setSession] = useState<Session | null>(null);
  const [admin, setAdmin] = useState<AdminIdentity | null>(null);
  const [adminCheckError, setAdminCheckError] = useState<string | null>(null);
  const [checkingAdmin, setCheckingAdmin] = useState<boolean>(false);

  // Supabase login form
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loginError, setLoginError] = useState<string | null>(null);
  const [loginBusy, setLoginBusy] = useState(false);
  const [resetBusy, setResetBusy] = useState(false);
  const [resetInfo, setResetInfo] = useState<string | null>(null);

  // Bootstrap form
  const [bootstrapSecret, setBootstrapSecret] = useState('');
  const [bootstrapBusy, setBootstrapBusy] = useState(false);
  const [bootstrapError, setBootstrapError] = useState<string | null>(null);

  useEffect(() => {
    if (!supabaseAvailable) return;

    let unsub: { data: { subscription: { unsubscribe: () => void } } } | null = null;
    try {
      const supabase = getSupabaseBrowser();

      supabase.auth.getSession().then(({ data }) => {
        setSession(data.session);
      });

      unsub = supabase.auth.onAuthStateChange((_event, nextSession) => {
        setSession(nextSession);
      });
    } catch {
      // handled by supabaseAvailable check
    }

    return () => {
      unsub?.data.subscription.unsubscribe();
    };
  }, [supabaseAvailable]);

  async function refreshAdmin() {
    setCheckingAdmin(true);
    setAdmin(null);
    setAdminCheckError(null);

    if (!session?.access_token) {
      setCheckingAdmin(false);
      return;
    }

    try {
      const data = await apiJson<{ ok: true; admin: AdminIdentity }>('/api/admin/me', {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${session.access_token}`,
        },
      });
      setAdmin(data.admin);
    } catch (e: any) {
      const msg = String(e?.body?.error || e?.message || '');
      if (/Invalid supabaseUrl/i.test(msg)) {
        setAdminCheckError(
          'Ошибка конфигурации Supabase на сервере (Netlify Functions). Проверь env: SUPABASE_URL должен быть вида https://<project-ref>.supabase.co (с https://). После правки сделай новый deploy.'
        );
      } else
      if (e?.status === 403) {
        setAdminCheckError('Вы вошли, но у этой учётки нет прав admin.');
      } else if (e?.status === 401) {
        setAdminCheckError('Сессия недействительна. Войдите заново.');
      } else {
        setAdminCheckError(msg || 'Не удалось проверить админ-доступ');
      }
    } finally {
      setCheckingAdmin(false);
    }
  }

  useEffect(() => {
    if (!supabaseAvailable) return;
    void refreshAdmin();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [session?.access_token, supabaseAvailable]);

  async function handleSupabaseLogin(e: React.FormEvent) {
    e.preventDefault();
    setLoginError(null);
    setBootstrapError(null);
    setResetInfo(null);

    if (!supabaseAvailable) {
      setLoginError('Не настроены VITE_SUPABASE_URL / VITE_SUPABASE_ANON_KEY');
      return;
    }

    setLoginBusy(true);
    try {
      const supabase = getSupabaseBrowser();
      const { error } = await supabase.auth.signInWithPassword({
        email: email.trim(),
        password,
      });
      if (error) throw error;
    } catch (e: any) {
      setLoginError(e?.message || 'Ошибка входа');
    } finally {
      setLoginBusy(false);
    }
  }

  async function handleResetPassword() {
    setLoginError(null);
    setResetInfo(null);

    const emailValue = email.trim();
    if (!emailValue) {
      setLoginError('Введите email для сброса пароля');
      return;
    }

    if (!supabaseAvailable) {
      setLoginError('Supabase не настроен');
      return;
    }

    setResetBusy(true);
    try {
      const supabase = getSupabaseBrowser();
      const { error } = await supabase.auth.resetPasswordForEmail(emailValue, {
        redirectTo: `${window.location.origin}/admin`,
      });
      if (error) throw error;
      setResetInfo('Если этот email существует, письмо для сброса пароля отправлено.');
    } catch (e: any) {
      setLoginError(e?.message || 'Не удалось отправить письмо для сброса');
    } finally {
      setResetBusy(false);
    }
  }

  async function handleSupabaseLogout() {
    setAdmin(null);
    setAdminCheckError(null);
    try {
      const supabase = getSupabaseBrowser();
      await supabase.auth.signOut();
    } catch {
      // ignore
    }
  }

  async function handleBootstrap() {
    setBootstrapError(null);
    if (!session?.access_token) {
      setBootstrapError('Сначала войдите (нужен Bearer token).');
      return;
    }

    setBootstrapBusy(true);
    try {
      await apiJson<{ ok: true }>('/api/admin/bootstrap', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${session.access_token}`,
        },
        body: JSON.stringify({ secret: bootstrapSecret }),
      });

      setBootstrapSecret('');
      await refreshAdmin();
    } catch (e: any) {
      setBootstrapError(e?.body?.error || e?.message || 'Bootstrap failed');
    } finally {
      setBootstrapBusy(false);
    }
  }

  const bgClass = theme === 'light'
    ? 'bg-gradient-to-b from-slate-50 via-blue-50/30 to-indigo-50/50 text-gray-900'
    : 'bg-gradient-to-b from-slate-900 via-blue-950 to-indigo-950 text-white';

  // 1) Secure mode (Supabase)
  if (supabaseAvailable) {
    if (admin) {
      return <AdminDashboard isAdminOverride adminDisplayName={admin.email || 'Admin'} />;
    }

    return (
      <div className={`min-h-screen p-4 md:p-8 ${bgClass}`}>
        <div className="max-w-xl mx-auto">
          <Card>
            <CardHeader>
              <CardTitle>Admin</CardTitle>
              <CardDescription>Вход через Supabase + проверка прав на сервере.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {loginError && (
                <Alert className="border-red-500/50">
                  <AlertDescription>{loginError}</AlertDescription>
                </Alert>
              )}
              {resetInfo && (
                <Alert className="border-green-500/50">
                  <AlertDescription>{resetInfo}</AlertDescription>
                </Alert>
              )}
              {adminCheckError && (
                <Alert className="border-red-500/50">
                  <AlertDescription>{adminCheckError}</AlertDescription>
                </Alert>
              )}

              {!session && (
                <form onSubmit={handleSupabaseLogin} className="space-y-3">
                  <Input value={email} onChange={(e) => setEmail(e.target.value)} type="email" placeholder="Email" autoComplete="email" />
                  <Input value={password} onChange={(e) => setPassword(e.target.value)} type="password" placeholder="Password" autoComplete="current-password" />
                  <Button type="submit" disabled={loginBusy} className="w-full">
                    {loginBusy ? 'Signing in…' : 'Sign in'}
                  </Button>
                  <Button type="button" variant="outline" disabled={resetBusy} className="w-full" onClick={handleResetPassword}>
                    {resetBusy ? 'Sending reset…' : 'Forgot password / reset'}
                  </Button>
                  <Button type="button" variant="outline" className="w-full" onClick={() => openAuthModal('login')}>
                    Use legacy admin login
                  </Button>
                </form>
              )}

              {session && (
                <div className="flex flex-col gap-2">
                  <Button type="button" variant="outline" onClick={refreshAdmin} disabled={checkingAdmin}>
                    {checkingAdmin ? 'Checking…' : 'Re-check admin access'}
                  </Button>
                  <Button type="button" variant="outline" onClick={() => openAuthModal('login')}>
                    Use legacy admin login
                  </Button>
                  <Button type="button" variant="outline" onClick={handleSupabaseLogout}>
                    Logout
                  </Button>
                </div>
              )}

              {session && !admin && !checkingAdmin && (
                <div className="pt-2 border-t space-y-2">
                  <div className={theme === 'dark' ? 'text-purple-200/80 text-sm' : 'text-gray-600 text-sm'}>
                    Если админов ещё нет, можно назначить первого админа (один раз) через bootstrap.
                  </div>
                  {bootstrapError && (
                    <Alert className="border-red-500/50">
                      <AlertDescription>{bootstrapError}</AlertDescription>
                    </Alert>
                  )}
                  <Input
                    value={bootstrapSecret}
                    onChange={(e) => setBootstrapSecret(e.target.value)}
                    placeholder="ADMIN_BOOTSTRAP_SECRET (или ADMIN_KEY)"
                  />
                  <Button type="button" onClick={handleBootstrap} disabled={bootstrapBusy} className="w-full">
                    {bootstrapBusy ? 'Working…' : 'Bootstrap first admin'}
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  // 2) Fallback mode (local admin via AuthModal)
  if (localIsAdmin) {
    return <AdminDashboard isAdminOverride adminDisplayName={localUser?.name || 'Admin'} />;
  }

  return (
    <div className={`min-h-screen p-4 md:p-8 ${bgClass}`}>
      <div className="max-w-xl mx-auto">
        <Card>
          <CardHeader>
            <CardTitle>Access denied</CardTitle>
            <CardDescription>Нужно войти как admin.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <Button type="button" className="w-full" onClick={() => openAuthModal('login')}>
              Open admin login
            </Button>
            <div className={theme === 'dark' ? 'text-purple-200/80 text-sm' : 'text-gray-600 text-sm'}>
              Для “secure” админки добавь VITE_SUPABASE_URL и VITE_SUPABASE_ANON_KEY в окружение Netlify.
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
