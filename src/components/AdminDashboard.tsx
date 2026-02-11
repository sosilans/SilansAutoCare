import { useState, useMemo, useEffect } from 'react';
import { motion } from 'motion/react';
import { useTheme } from './ThemeContext';
import { useAnimation } from './AnimationContext';
import { useDataStore } from './DataStoreContext';
import { useAuth } from './AuthContext';
import { useOnlineStatus } from './OnlineStatusContext';
import { useAvailabilityStatus } from './AvailabilityStatusContext';
import { useMaintenanceMode } from './MaintenanceModeContext';
import { useLanguage } from './LanguageContext';
import { 
  TrendingUp, Users, MessageSquare, HelpCircle, Star, Clock, 
  CheckCircle, XCircle, Eye, EyeOff, BarChart3, 
  Mail, Phone, Calendar, ArrowUp, ArrowDown, Activity,
  Package, Image as ImageIcon, Settings as SettingsIcon,
  Download, Home, PieChart, LineChart, Sun, Moon, Sparkles
} from 'lucide-react';
import { Button } from './ui/button';
import { Switch } from './ui/switch';
import { ConfirmModal } from './ui/ConfirmModal';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { Textarea } from './ui/textarea';
import { Input } from './ui/input';
import { Alert, AlertDescription } from './ui/alert';
import { AdminSiteAnalytics } from './AdminSiteAnalytics';
import { AdminServicesEditor } from './AdminServicesEditor';

type AdminDashboardProps = {
  isAdminOverride?: boolean;
  adminDisplayName?: string;
  adminEmail?: string;
  adminAccessToken?: string;
};

type HealthCheckStatus = 'idle' | 'ok' | 'error' | 'unauthorized';
type HealthCheckItem = { key: string; label: string; status: HealthCheckStatus; message?: string };

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

export function AdminDashboard({ isAdminOverride, adminDisplayName, adminEmail, adminAccessToken }: AdminDashboardProps = {}) {
  const { theme, toggleTheme } = useTheme();
  const { reduceMotion, toggleReduceMotion } = useAnimation();
  const { t } = useLanguage();
  const { isAdmin: authIsAdmin, user, users, removeUser, setUserRole } = useAuth();
  const isAdmin = isAdminOverride ?? authIsAdmin;
  const effectiveName = adminDisplayName ?? user?.name ?? '';
  const effectiveEmail = adminEmail ?? user?.email ?? '';
  const { 
    pendingReviews, approvedReviews, approveReview, rejectReview,
    pendingFAQs, approvedFAQs, approveFAQ, rejectFAQ,
    contactSubmissions, updateContactStatus, deleteContact,
    stats,
    setAdminAccessToken,
    updateReview, deleteReview, reorderApprovedReviews,
    updateFAQ, deleteFAQ, reorderApprovedFAQs,
    auditLog, logAudit, exportAudit,
  } = useDataStore();
  const { isOnline, setIsOnline } = useOnlineStatus();
  const { status: availabilityStatus, setStatus: setAvailabilityStatus } = useAvailabilityStatus();
  const { isMaintenanceMode, setIsMaintenanceMode } = useMaintenanceMode();

  const [selectedTab, setSelectedTab] = useState('analytics');
  const [userFilter, setUserFilter] = useState('');
  const [showOnlyAdmins, setShowOnlyAdmins] = useState(false);
  const [faqAnswers, setFaqAnswers] = useState<Record<string, string>>({});
  const [reviewEdits, setReviewEdits] = useState<
    Record<string, { name: string; message: string; date: string; avatar: string; color: string; rating: string }>
  >({});
  const [faqEdits, setFaqEdits] = useState<Record<string, { name: string; question: string; answer: string; date: string; avatar: string; color: string }>>({});
  const [notification, setNotification] = useState<{ type: 'success' | 'error'; message: string } | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [adminTokenInput, setAdminTokenInput] = useState('');
  const [selectedReviewIds, setSelectedReviewIds] = useState<Record<string, boolean>>({});
  const supabaseAvailable = useMemo(() => Boolean(import.meta.env.VITE_SUPABASE_URL && import.meta.env.VITE_SUPABASE_ANON_KEY), []);
  const [liveActive, setLiveActive] = useState(false);
  const [liveRealtime, setLiveRealtime] = useState(false);
  const [liveLoading, setLiveLoading] = useState(false);
  const [liveLastUpdated, setLiveLastUpdated] = useState<number | null>(null);
  const [liveError, setLiveError] = useState<string | null>(null);
  const [liveReviews, setLiveReviews] = useState<typeof approvedReviews>([]);
  const [liveFaqs, setLiveFaqs] = useState<typeof approvedFAQs>([]);
  const [liveRefreshKey, setLiveRefreshKey] = useState(0);
  const [healthLoading, setHealthLoading] = useState(false);
  const [healthLastChecked, setHealthLastChecked] = useState<number | null>(null);
  const [healthChecks, setHealthChecks] = useState<HealthCheckItem[]>([
    { key: 'admin_me', label: 'Admin auth (/api/admin/me)', status: 'idle' },
    { key: 'reviews', label: 'Reviews queue (/api/admin/reviews)', status: 'idle' },
    { key: 'faqs', label: 'FAQ queue (/api/admin/faqs)', status: 'idle' },
    { key: 'contacts', label: 'Contacts (/api/admin/contacts)', status: 'idle' },
    { key: 'settings', label: 'Settings (/api/admin/settings)', status: 'idle' },
    { key: 'analytics', label: 'Analytics (/.netlify/functions/analytics-query)', status: 'idle' },
  ]);
  const [confirmState, setConfirmState] = useState<{
    open: boolean;
    title?: string;
    message?: string;
    confirmLabel?: string;
    onConfirm?: (() => Promise<void>) | (() => void);
  }>({ open: false });

  const openConfirm = (opts: { title?: string; message?: string; confirmLabel?: string; onConfirm?: (() => Promise<void>) | (() => void) }) => {
    setConfirmState({ open: true, title: opts.title, message: opts.message, confirmLabel: opts.confirmLabel || 'Confirm', onConfirm: opts.onConfirm });
  };

  const confirmClose = () => setConfirmState({ open: false });

  const toggleSelectReview = (id: string) => setSelectedReviewIds((p) => ({ ...p, [id]: !p[id] }));
  const selectAllPending = () => setSelectedReviewIds(Object.fromEntries(pendingReviews.map((r) => [r.id, true])));
  const clearSelection = () => setSelectedReviewIds({});

  const bulkApproveSelected = async () => {
    const ids = Object.keys(selectedReviewIds).filter((id) => selectedReviewIds[id]);
    if (ids.length === 0) return showNotification('error', 'No reviews selected');
    openConfirm({
      title: 'Approve reviews',
      message: `Approve ${ids.length} selected reviews?`,
      confirmLabel: 'Approve',
      onConfirm: async () => {
        confirmClose();
        let success = 0;
        for (const id of ids) {
          try {
            const ok = await approveReview(id);
            if (ok) {
              success++;
              if (logAudit) logAudit('review_approve', 'review_submissions', id, {});
            }
          } catch {}
        }
        showNotification('success', `Approved ${success}/${ids.length}`);
        clearSelection();
      },
    });
  };

  const bulkRejectSelected = async () => {
    const ids = Object.keys(selectedReviewIds).filter((id) => selectedReviewIds[id]);
    if (ids.length === 0) return showNotification('error', 'No reviews selected');
    openConfirm({
      title: 'Reject reviews',
      message: `Reject ${ids.length} selected reviews?`,
      confirmLabel: 'Reject',
      onConfirm: async () => {
        confirmClose();
        let success = 0;
        for (const id of ids) {
          try {
            const ok = await rejectReview(id);
            if (ok) {
              success++;
              if (logAudit) logAudit('review_reject', 'review_submissions', id, {});
            }
          } catch {}
        }
        showNotification('success', `Rejected ${success}/${ids.length}`);
        clearSelection();
      },
    });
  };

  const bulkDeleteSelected = async () => {
    const ids = Object.keys(selectedReviewIds).filter((id) => selectedReviewIds[id]);
    if (ids.length === 0) return showNotification('error', 'No reviews selected');
    openConfirm({
      title: 'Delete reviews',
      message: `Delete ${ids.length} selected reviews? This cannot be undone.`,
      confirmLabel: 'Delete',
      onConfirm: async () => {
        confirmClose();
        let success = 0;
        for (const id of ids) {
          try {
            const ok = await deleteReview(id);
            if (ok) {
              success++;
              if (logAudit) logAudit('review_delete', 'review_submissions', id, {});
            }
          } catch {}
        }
        showNotification('success', `Deleted ${success}/${ids.length}`);
        clearSelection();
      },
    });
  };

  // FAQ selection & bulk actions
  const [selectedFaqIds, setSelectedFaqIds] = useState<Record<string, boolean>>({});
  const toggleSelectFaq = (id: string) => setSelectedFaqIds((p) => ({ ...p, [id]: !p[id] }));
  const selectAllPendingFaqs = () => setSelectedFaqIds(Object.fromEntries(pendingFAQs.map((f) => [f.id, true])));
  const clearFaqSelection = () => setSelectedFaqIds({});

  const bulkApproveSelectedFaqs = async () => {
    const ids = Object.keys(selectedFaqIds).filter((id) => selectedFaqIds[id]);
    if (ids.length === 0) return showNotification('error', 'No FAQs selected');
    openConfirm({
      title: 'Answer & approve FAQs',
      message: `Answer and approve ${ids.length} selected questions?`,
      confirmLabel: 'Answer & Approve',
      onConfirm: async () => {
        confirmClose();
        let success = 0;
        for (const id of ids) {
          try {
            const answer = (faqAnswers[id] || '').trim();
            if (!answer) continue;
            const ok = await approveFAQ(id, answer);
            if (ok) {
              success++;
              if (logAudit) logAudit('faq_answer_publish', 'faq_submissions', id, { answerLength: answer.length });
            }
          } catch {}
        }
        showNotification('success', `Answered ${success}/${ids.length}`);
        clearFaqSelection();
      },
    });
  };

  const bulkRejectSelectedFaqs = async () => {
    const ids = Object.keys(selectedFaqIds).filter((id) => selectedFaqIds[id]);
    if (ids.length === 0) return showNotification('error', 'No FAQs selected');
    openConfirm({
      title: 'Reject FAQs',
      message: `Reject ${ids.length} selected questions?`,
      confirmLabel: 'Reject',
      onConfirm: async () => {
        confirmClose();
        let success = 0;
        for (const id of ids) {
          try {
            const ok = await rejectFAQ(id);
            if (ok) {
              success++;
              if (logAudit) logAudit('faq_reject', 'faq_submissions', id, {});
            }
          } catch {}
        }
        showNotification('success', `Rejected ${success}/${ids.length}`);
        clearFaqSelection();
      },
    });
  };

  const bulkDeleteSelectedFaqs = async () => {
    const ids = Object.keys(selectedFaqIds).filter((id) => selectedFaqIds[id]);
    if (ids.length === 0) return showNotification('error', 'No FAQs selected');
    openConfirm({
      title: 'Delete FAQs',
      message: `Delete ${ids.length} selected questions? This cannot be undone.`,
      confirmLabel: 'Delete',
      onConfirm: async () => {
        confirmClose();
        let success = 0;
        for (const id of ids) {
          try {
            const ok = await deleteFAQ(id);
            if (ok) {
              success++;
              if (logAudit) logAudit('faq_delete', 'faq_submissions', id, {});
            }
          } catch {}
        }
        showNotification('success', `Deleted ${success}/${ids.length}`);
        clearFaqSelection();
      },
    });
  };

  // Contacts selection & bulk actions
  const [selectedContactIds, setSelectedContactIds] = useState<Record<string, boolean>>({});
  const toggleSelectContact = (id: string) => setSelectedContactIds((p) => ({ ...p, [id]: !p[id] }));
  const selectAllContacts = () => setSelectedContactIds(Object.fromEntries(contactSubmissions.map((c) => [c.id, true])));
  const clearContactSelection = () => setSelectedContactIds({});

  const bulkMarkContacted = async () => {
    const ids = Object.keys(selectedContactIds).filter((id) => selectedContactIds[id]);
    if (ids.length === 0) return showNotification('error', 'No contacts selected');
    openConfirm({
      title: 'Mark contacted',
      message: `Mark ${ids.length} selected contacts as contacted?`,
      confirmLabel: 'Mark contacted',
      onConfirm: async () => {
        confirmClose();
        let success = 0;
        for (const id of ids) {
          try {
            const ok = await updateContactStatus(id, 'contacted');
            if (ok) {
              success++;
              if (logAudit) logAudit('contact_update_status', 'contact_submissions', id, { status: 'contacted' });
            }
          } catch {}
        }
        showNotification('success', `Updated ${success}/${ids.length}`);
        clearContactSelection();
      },
    });
  };

  const bulkMarkResolved = async () => {
    const ids = Object.keys(selectedContactIds).filter((id) => selectedContactIds[id]);
    if (ids.length === 0) return showNotification('error', 'No contacts selected');
    openConfirm({
      title: 'Mark resolved',
      message: `Mark ${ids.length} selected contacts as resolved?`,
      confirmLabel: 'Mark resolved',
      onConfirm: async () => {
        confirmClose();
        let success = 0;
        for (const id of ids) {
          try {
            const ok = await updateContactStatus(id, 'resolved');
            if (ok) {
              success++;
              if (logAudit) logAudit('contact_update_status', 'contact_submissions', id, { status: 'resolved' });
            }
          } catch {}
        }
        showNotification('success', `Updated ${success}/${ids.length}`);
        clearContactSelection();
      },
    });
  };

  const bulkDeleteSelectedContacts = async () => {
    const ids = Object.keys(selectedContactIds).filter((id) => selectedContactIds[id]);
    if (ids.length === 0) return showNotification('error', 'No contacts selected');
    openConfirm({
      title: 'Delete contacts',
      message: `Delete ${ids.length} selected contacts? This cannot be undone.`,
      confirmLabel: 'Delete',
      onConfirm: async () => {
        confirmClose();
        let success = 0;
        for (const id of ids) {
          try {
            const ok = await deleteContact(id);
            if (ok) {
              success++;
              if (logAudit) logAudit('contact_delete', 'contact_submissions', id, {});
            }
          } catch {}
        }
        showNotification('success', `Deleted ${success}/${ids.length}`);
        clearContactSelection();
      },
    });
  };

  // Calculate analytics (must be defined before any early returns to keep hook order stable).
  const analytics = useMemo(() => {
    const last7Days = Date.now() - 7 * 24 * 60 * 60 * 1000;

    const recentReviews = [...pendingReviews, ...approvedReviews].filter(r => r.createdAt > last7Days).length;
    const recentFAQs = [...pendingFAQs, ...approvedFAQs].filter(f => f.createdAt > last7Days).length;
    const recentContacts = contactSubmissions.filter(c => c.createdAt > last7Days).length;

    return {
      totalReviews: stats.reviews.total,
      totalFAQs: stats.faqs.total,
      totalContacts: stats.contacts.total,
      totalUsers: users.length,
      recentReviews,
      recentFAQs,
      recentContacts,
      pendingReviews: stats.reviews.pending,
      pendingFAQs: stats.faqs.pending,
      newContacts: stats.contacts.new,
      approvalRate: stats.reviews.total > 0 ? Math.round((stats.reviews.approved / stats.reviews.total) * 100) : 0,
    };
  }, [stats, users, pendingReviews, approvedReviews, pendingFAQs, approvedFAQs, contactSubmissions]);

  // Wait for auth to load
  useEffect(() => {
    const timer = setTimeout(() => setIsLoading(false), 100);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (adminAccessToken) setAdminAccessToken(adminAccessToken);
  }, [adminAccessToken, setAdminAccessToken]);

  const saveAdminToken = () => {
    const value = adminTokenInput.trim();
    setAdminAccessToken(value || undefined);
    showNotification('success', value ? 'Token saved' : 'Token cleared');
    setAdminTokenInput('');
  };

  const clearAdminToken = () => {
    setAdminAccessToken(undefined);
    showNotification('success', 'Token cleared');
  };

  const setHealth = (key: string, patch: Partial<HealthCheckItem>) => {
    setHealthChecks((prev) => prev.map((item) => (item.key === key ? { ...item, ...patch } : item)));
  };

  const runHealthChecks = async () => {
    setHealthLoading(true);
    setHealthChecks((prev) => prev.map((item) => ({ ...item, status: 'idle', message: undefined })));

    if (!adminAccessToken) {
      setHealthChecks((prev) => prev.map((item) => ({ ...item, status: 'unauthorized', message: 'Missing admin token' })));
      setHealthLoading(false);
      return;
    }

    const headers = { Authorization: `Bearer ${adminAccessToken}` };
    const checks: Array<{ key: string; url: string }> = [
      { key: 'admin_me', url: '/api/admin/me' },
      { key: 'reviews', url: '/api/admin/reviews?status=pending&limit=1' },
      { key: 'faqs', url: '/api/admin/faqs?status=pending&limit=1' },
      { key: 'contacts', url: '/api/admin/contacts?limit=1' },
      { key: 'settings', url: '/api/admin/settings?key=site_online' },
      { key: 'analytics', url: '/.netlify/functions/analytics-query?metric=service_opens&days=7' },
    ];

    await Promise.all(
      checks.map(async ({ key, url }) => {
        try {
          const res = await fetch(url, { headers });
          const text = await res.text();
          let body: any = null;
          try { body = text ? JSON.parse(text) : null; } catch { body = { error: text }; }
          if (res.ok) {
            setHealth(key, { status: 'ok' });
          } else if (res.status === 401 || res.status === 403) {
            setHealth(key, { status: 'unauthorized', message: body?.error || 'Unauthorized' });
          } else {
            setHealth(key, { status: 'error', message: body?.error || `HTTP ${res.status}` });
          }
        } catch (e: any) {
          setHealth(key, { status: 'error', message: e?.message || 'Network error' });
        }
      })
    );

    setHealthLastChecked(Date.now());
    setHealthLoading(false);
  };

  useEffect(() => {
    if (!liveActive) return;
    let pollId: number | null = null;
    const unsubHandles: Array<{ unsubscribe?: () => void }> = [];

    const fetchLiveOnce = async () => {
      setLiveLoading(true);
      setLiveError(null);
      try {
        if (supabaseAvailable) {
          const { getSupabaseBrowser } = await import('../supabaseBrowser');
          const sb = getSupabaseBrowser();
          const [{ data: rData, error: rErr }, { data: fData, error: fErr }] = await Promise.all([
            sb.from('review_submissions').select('*').order('created_at', { ascending: false }).limit(500),
            sb.from('faq_submissions').select('*').order('created_at', { ascending: false }).limit(500),
          ] as any);
          if (rErr) throw rErr;
          if (fErr) throw fErr;
          setLiveReviews((rData || []).map((r: any) => ({ id: r.id, name: r.name, message: r.message, status: r.status, createdAt: new Date(r.created_at).getTime() })));
          setLiveFaqs((fData || []).map((f: any) => ({ id: f.id, name: f.name, question: f.question, status: f.status, createdAt: new Date(f.created_at).getTime() })));
          setLiveLastUpdated(Date.now());
        } else {
          if (!adminAccessToken) throw new Error('Нужен admin access token для загрузки данных.');
          const headers: any = { Authorization: `Bearer ${adminAccessToken}` };
          const [rRes, fRes] = await Promise.all([
            fetch('/api/admin/reviews?status=approved&limit=500', { headers }),
            fetch('/api/admin/faqs?status=approved&limit=500', { headers }),
          ]);
          const rBody = await rRes.json();
          const fBody = await fRes.json();
          if (!rRes.ok) throw new Error(rBody?.error || 'Failed to load reviews');
          if (!fRes.ok) throw new Error(fBody?.error || 'Failed to load faqs');
          setLiveReviews((rBody.rows || []).map((r: any) => ({ id: r.id, name: r.name, message: r.message, status: r.status, createdAt: new Date(r.created_at).getTime() })));
          setLiveFaqs((fBody.rows || []).map((f: any) => ({ id: f.id, name: f.name, question: f.question, status: f.status, createdAt: new Date(f.created_at).getTime() })));
          setLiveLastUpdated(Date.now());
        }
      } catch (err: any) {
        setLiveError(String(err?.message || err));
      } finally {
        setLiveLoading(false);
      }
    };

    const enableRealtime = async () => {
      if (!supabaseAvailable) return;
      try {
        const { getSupabaseBrowser } = await import('../supabaseBrowser');
        const sb = getSupabaseBrowser();
        const rev = sb.channel('realtime-admin-live')
          .on('postgres_changes', { event: '*', schema: 'public', table: 'review_submissions' }, () => {
            void fetchLiveOnce();
          })
          .on('postgres_changes', { event: '*', schema: 'public', table: 'faq_submissions' }, () => {
            void fetchLiveOnce();
          })
          .subscribe();
        unsubHandles.push(rev as any);
      } catch (e: any) {
        setLiveError(String(e?.message || e));
      }
    };

    void fetchLiveOnce();

    if (liveRealtime) {
      void enableRealtime();
    } else {
      pollId = window.setInterval(() => void fetchLiveOnce(), 15000);
    }

    return () => {
      if (pollId) window.clearInterval(pollId);
      for (const h of unsubHandles) {
        try { h.unsubscribe?.(); } catch {}
      }
    };
  }, [adminAccessToken, liveActive, liveRealtime, liveRefreshKey, supabaseAvailable]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen vhs-noise vhs-scanlines">
        <Card className={theme === 'dark' ? 'bg-slate-800/50 border-purple-500/30 vhs-glow-dark vhs-border' : 'vhs-glow-light vhs-border'}>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-purple-500"></div>
              <p className={`vhs-text ${theme === 'dark' ? 'vhs-text-dark' : 'vhs-text-light'}`}>{t('admin.dashboard.loading')}</p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!isAdmin) {
    return (
      <div className={`flex items-center justify-center min-h-screen vhs-noise vhs-scanlines ${theme === 'dark' ? 'bg-slate-900' : 'bg-slate-50'}`}>
        <Card className={theme === 'dark' ? 'bg-slate-800/50 border-red-500/30 vhs-glow-dark vhs-border' : 'vhs-glow-light vhs-border'}>
          <CardContent className="pt-6">
            <p className="text-red-500 vhs-text chromatic-aberration" data-text={t('admin.dashboard.accessDenied')}>{t('admin.dashboard.accessDenied')}</p>
            <Button onClick={() => window.location.href = '/'} className="mt-4" variant="outline">
              <Home className="w-4 h-4 mr-2" />
              {t('admin.dashboard.backToHome')}
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const showNotification = (type: 'success' | 'error', message: string) => {
    setNotification({ type, message });
    setTimeout(() => setNotification(null), 3000);
  };

  const handleChangeUserRole = async (email: string | undefined, nextRole: 'admin' | 'user') => {
    if (!email) return showNotification('error', 'No user email');
    try {
      if (adminAccessToken) {
        await apiJson('/api/admin/users', {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${adminAccessToken}` },
          body: JSON.stringify({ email, role: nextRole }),
        });
      }
      setUserRole(email, nextRole);
      showNotification('success', `Role updated: ${email} → ${nextRole}`);
      if (logAudit) logAudit('change_user_role', 'user', email, { role: nextRole });
    } catch (e: any) {
      showNotification('error', e?.message || 'Failed to update role');
    }
  };

  const persistSiteOnline = async (nextOnline: boolean) => {
    if (!adminAccessToken) return;
    await apiJson<{ ok: true }>(`/api/admin/settings`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${adminAccessToken}`,
      },
      body: JSON.stringify({ key: 'site_online', value: nextOnline }),
    });
  };

  const persistAvailabilityStatus = async (nextStatus: 'available' | 'unavailable') => {
    if (!adminAccessToken) return;
    await apiJson<{ ok: true }>(`/api/admin/settings`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${adminAccessToken}`,
      },
      body: JSON.stringify({ key: 'availability_status', value: nextStatus }),
    });
  };

  const persistMaintenanceMode = async (nextValue: boolean) => {
    if (!adminAccessToken) return;
    await apiJson<{ ok: true }>(`/api/admin/settings`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${adminAccessToken}`,
      },
      body: JSON.stringify({ key: 'maintenance_mode', value: nextValue }),
    });
  };

  const handleToggleSiteOnline = async () => {
    const prev = isOnline;
    const next = !prev;
    setIsOnline(next);
    showNotification('success', next ? t('admin.dashboard.notifications.siteNowOnline') : t('admin.dashboard.notifications.siteNowOffline'));

    try {
      await persistSiteOnline(next);
    } catch {
      // Roll back UI if server save fails.
      setIsOnline(prev);
      showNotification('error', t('admin.dashboard.notifications.failedToSaveSetting'));
    }
  };

  const handleToggleAvailability = async () => {
    const prev = availabilityStatus;
    const next: 'available' | 'unavailable' = prev === 'available' ? 'unavailable' : 'available';
    setAvailabilityStatus(next);

    try {
      await persistAvailabilityStatus(next);
    } catch {
      setAvailabilityStatus(prev);
      showNotification('error', t('admin.dashboard.notifications.failedToSaveSetting'));
    }
  };

  const handleToggleMaintenanceMode = async () => {
    const prev = isMaintenanceMode;
    const next = !prev;
    setIsMaintenanceMode(next);

    try {
      await persistMaintenanceMode(next);
    } catch {
      setIsMaintenanceMode(prev);
      showNotification('error', t('admin.dashboard.notifications.failedToSaveSetting'));
    }
  };

  const openServicesEditor = () => {
    setSelectedTab('settings');
    setTimeout(() => {
      try {
        document.getElementById('admin-services-editor')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
      } catch {
        // ignore
      }
    }, 0);
  };

  const copyToClipboard = async (text: string) => {
    try {
      if (typeof navigator !== 'undefined' && navigator.clipboard?.writeText) {
        await navigator.clipboard.writeText(text);
        return;
      }

      const textarea = document.createElement('textarea');
      textarea.value = text;
      textarea.setAttribute('readonly', '');
      textarea.style.position = 'fixed';
      textarea.style.left = '-9999px';
      textarea.style.top = '0';
      document.body.appendChild(textarea);
      textarea.select();
      document.execCommand('copy');
      document.body.removeChild(textarea);
    } catch {
      // ignore
    }
  };

  const handleApproveReview = async (id: string) => {
    const ok = await approveReview(id);

    if (ok) {
      const draft = reviewEdits[id];
      if (draft) {
        const meta: Record<string, unknown> = {
          date: draft.date?.trim() || undefined,
          avatar: draft.avatar?.trim() || undefined,
          color: draft.color?.trim() || undefined,
        };
        const ratingRaw = draft.rating?.trim();
        if (ratingRaw) {
          const rating = Number(ratingRaw);
          if (Number.isFinite(rating)) meta.rating = rating;
        }

        const hasMeta = Object.values(meta).some((v) => v !== undefined);
        if (hasMeta) {
          const metaOk = await updateReview(id, { meta });
          if (!metaOk) {
            showNotification('error', t('admin.dashboard.notifications.actionFailed'));
            return;
          }
        }
      }
    }

    showNotification(ok ? 'success' : 'error', ok ? t('admin.dashboard.notifications.reviewApproved') : t('admin.dashboard.notifications.actionFailed'));
  };

  const handleRejectReview = async (id: string) => {
    const ok = await rejectReview(id);
    showNotification(ok ? 'success' : 'error', ok ? t('admin.dashboard.notifications.reviewRejected') : t('admin.dashboard.notifications.actionFailed'));
  };

  const handleAnswerFAQ = async (id: string) => {
    const answer = faqAnswers[id]?.trim();
    if (!answer) {
      showNotification('error', t('admin.dashboard.notifications.answerRequired'));
      return;
    }
    const ok = await approveFAQ(id, answer);

    if (ok) {
      setFaqAnswers(prev => ({ ...prev, [id]: '' }));
      const draft = faqEdits[id];
      if (draft) {
        const meta: Record<string, unknown> = {
          date: draft.date?.trim() || undefined,
          avatar: draft.avatar?.trim() || undefined,
          color: draft.color?.trim() || undefined,
        };
        const hasMeta = Object.values(meta).some((v) => v !== undefined);
        if (hasMeta) {
          const metaOk = await updateFAQ(id, { meta });
          if (!metaOk) {
            showNotification('error', t('admin.dashboard.notifications.actionFailed'));
            return;
          }
        }
      }
    }

    showNotification(ok ? 'success' : 'error', ok ? t('admin.dashboard.notifications.faqAnswered') : t('admin.dashboard.notifications.actionFailed'));
  };

  const handleRejectFAQ = async (id: string) => {
    const ok = await rejectFAQ(id);
    showNotification(ok ? 'success' : 'error', ok ? t('admin.dashboard.notifications.faqRejected') : t('admin.dashboard.notifications.actionFailed'));
  };

  const handleSavePendingReviewMeta = async (id: string) => {
    const draft = reviewEdits[id];
    if (!draft) {
      showNotification('error', t('admin.dashboard.notifications.actionFailed'));
      return;
    }

    const meta: Record<string, unknown> = {
      date: draft.date?.trim() || undefined,
      avatar: draft.avatar?.trim() || undefined,
      color: draft.color?.trim() || undefined,
    };
    const ratingRaw = draft.rating?.trim();
    if (ratingRaw) {
      const rating = Number(ratingRaw);
      if (Number.isFinite(rating)) meta.rating = rating;
    }

    const hasMeta = Object.values(meta).some((v) => v !== undefined);
    if (!hasMeta) {
      showNotification('error', t('admin.dashboard.notifications.actionFailed'));
      return;
    }

    const ok = await updateReview(id, { meta });
    showNotification(ok ? 'success' : 'error', ok ? 'Saved' : t('admin.dashboard.notifications.actionFailed'));
  };

  const handleSavePendingFaqDraft = async (id: string) => {
    const draft = faqEdits[id];
    const answerDraft = (faqAnswers[id] || '').trim();

    const meta: Record<string, unknown> = {
      date: draft?.date?.trim() || undefined,
      avatar: draft?.avatar?.trim() || undefined,
      color: draft?.color?.trim() || undefined,
    };

    const hasMeta = Object.values(meta).some((v) => v !== undefined);
    const hasAnswer = Boolean(answerDraft);
    if (!hasMeta && !hasAnswer) {
      showNotification('error', t('admin.dashboard.notifications.actionFailed'));
      return;
    }

    const ok = await updateFAQ(id, {
      ...(hasAnswer ? { answer: answerDraft } : null),
      ...(hasMeta ? { meta } : null),
    });
    showNotification(ok ? 'success' : 'error', ok ? 'Saved' : t('admin.dashboard.notifications.actionFailed'));
  };

  const handleSaveApprovedReview = async (id: string) => {
    const draft = reviewEdits[id];
    if (!draft) return;
    const name = draft.name.trim();
    const message = draft.message.trim();
    if (!name || !message) {
      showNotification('error', t('admin.dashboard.notifications.actionFailed'));
      return;
    }

    const meta: Record<string, unknown> = {
      date: draft.date.trim() || undefined,
      avatar: draft.avatar.trim() || undefined,
      color: draft.color.trim() || undefined,
    };
    const ratingRaw = draft.rating.trim();
    if (ratingRaw) {
      const rating = Number(ratingRaw);
      if (Number.isFinite(rating)) meta.rating = rating;
    }

    const ok = await updateReview(id, { name, message, meta });
    if (ok) {
      setReviewEdits((prev) => {
        const next = { ...prev };
        delete next[id];
        return next;
      });
    }
    showNotification(ok ? 'success' : 'error', ok ? 'Saved' : t('admin.dashboard.notifications.actionFailed'));
  };

  const handleDeleteAnyReview = async (id: string) => {
    if (!confirm('Delete this review?')) return;
    const ok = await deleteReview(id);
    showNotification(ok ? 'success' : 'error', ok ? 'Deleted' : t('admin.dashboard.notifications.actionFailed'));
  };

  const moveApprovedReview = async (id: string, dir: -1 | 1) => {
    const ids = approvedReviews.map((r) => r.id);
    const idx = ids.indexOf(id);
    const nextIdx = idx + dir;
    if (idx < 0 || nextIdx < 0 || nextIdx >= ids.length) return;
    const next = ids.slice();
    const tmp = next[idx];
    next[idx] = next[nextIdx];
    next[nextIdx] = tmp;
    const ok = await reorderApprovedReviews(next);
    showNotification(ok ? 'success' : 'error', ok ? 'Reordered' : t('admin.dashboard.notifications.actionFailed'));
  };

  const handleSaveApprovedFAQ = async (id: string) => {
    const draft = faqEdits[id];
    if (!draft) return;
    const name = draft.name.trim();
    const question = draft.question.trim();
    const answer = draft.answer.trim();
    if (!name || !question || !answer) {
      showNotification('error', t('admin.dashboard.notifications.actionFailed'));
      return;
    }

    const meta: Record<string, unknown> = {
      date: draft.date.trim() || undefined,
      avatar: draft.avatar.trim() || undefined,
      color: draft.color.trim() || undefined,
    };

    const ok = await updateFAQ(id, { name, question, answer, meta });
    if (ok) {
      setFaqEdits((prev) => {
        const next = { ...prev };
        delete next[id];
        return next;
      });
    }
    showNotification(ok ? 'success' : 'error', ok ? 'Saved' : t('admin.dashboard.notifications.actionFailed'));
  };

  const handleDeleteAnyFAQ = async (id: string) => {
    if (!confirm('Delete this FAQ item?')) return;
    const ok = await deleteFAQ(id);
    showNotification(ok ? 'success' : 'error', ok ? 'Deleted' : t('admin.dashboard.notifications.actionFailed'));
  };

  const moveApprovedFAQ = async (id: string, dir: -1 | 1) => {
    const ids = approvedFAQs.map((f) => f.id);
    const idx = ids.indexOf(id);
    const nextIdx = idx + dir;
    if (idx < 0 || nextIdx < 0 || nextIdx >= ids.length) return;
    const next = ids.slice();
    const tmp = next[idx];
    next[idx] = next[nextIdx];
    next[nextIdx] = tmp;
    const ok = await reorderApprovedFAQs(next);
    showNotification(ok ? 'success' : 'error', ok ? 'Reordered' : t('admin.dashboard.notifications.actionFailed'));
  };

  const handleExportData = () => {
    const data = {
      reviews: { pending: pendingReviews, approved: approvedReviews },
      faqs: { pending: pendingFAQs, approved: approvedFAQs },
      contacts: contactSubmissions,
      users: users,
      exportedAt: new Date().toISOString(),
    };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${t('admin.dashboard.export.filenamePrefix')}-${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);
    showNotification('success', t('admin.dashboard.notifications.dataExported'));
  };

  function LiveSupabasePanel({ mode }: { mode: 'reviews' | 'faqs' }) {
    const items = mode === 'reviews' ? liveReviews : liveFaqs;
    const emptyLabel = mode === 'reviews' ? 'Нет отзывов.' : 'Нет FAQ.';
    const subtitle = supabaseAvailable ? 'Источник: Supabase Realtime' : 'Источник: Admin API';

    return (
      <Card className={theme === 'dark' ? 'bg-slate-800/50 border-purple-500/30' : ''}>
        <CardHeader>
          <CardTitle>Живые данные (Supabase)</CardTitle>
          <CardDescription>{subtitle}</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap items-center gap-3">
            <Button
              onClick={() => {
                if (!liveActive) setLiveActive(true);
                setLiveRefreshKey((k) => k + 1);
              }}
              disabled={liveLoading}
            >
              {liveLoading ? 'Загрузка…' : liveActive ? 'Обновить' : 'Загрузить живые данные'}
            </Button>
            <div className="flex items-center gap-2">
              <Switch
                checked={liveRealtime}
                onCheckedChange={(v) => {
                  setLiveRealtime(Boolean(v));
                  if (!liveActive) setLiveActive(true);
                }}
              />
              <div className="text-sm">Realtime</div>
            </div>
            <div className="text-xs text-muted-foreground ml-auto">
              {liveLastUpdated ? `Обновлено: ${new Date(liveLastUpdated).toLocaleTimeString()}` : 'Не загружено'}
            </div>
          </div>
          {liveError && <div className="mt-2 text-sm text-red-500">{liveError}</div>}
          {!liveActive && (
            <div className="mt-3 text-sm text-muted-foreground">Нажмите «Загрузить живые данные», чтобы увидеть актуальные записи.</div>
          )}
          {liveActive && (
            <div className="mt-4 space-y-2">
              {items.length === 0 && <div className="text-muted-foreground text-sm">{emptyLabel}</div>}
              {items.map((item) => (
                <div key={item.id} className={`p-3 rounded border ${theme === 'dark' ? 'bg-slate-700/30 border-slate-600' : 'bg-white border-gray-200'}`}>
                  <div className="font-semibold">{item.name}</div>
                  {'message' in item ? (
                    <div className="text-sm text-muted-foreground">{item.message}</div>
                  ) : (
                    <div className="text-sm text-muted-foreground">{item.question}</div>
                  )}
                  <div className="text-xs text-muted-foreground mt-1">
                    {new Date(item.createdAt).toLocaleString()} | Статус: {item.status}
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    );
  }

  return (
    <div className={`min-h-screen p-4 md:p-8 vhs-noise vhs-scanlines ${theme === 'dark' ? 'bg-slate-950' : 'bg-gradient-to-br from-sky-50 via-blue-50 to-cyan-50'}`}>
      
      <div className="max-w-7xl mx-auto mb-8">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between mb-6">
          <div>
            <h1 className={`text-3xl font-bold mb-2 vhs-text ${theme === 'dark' ? 'vhs-text-dark' : 'vhs-text-light'}`}>
              {t('admin.dashboard.title')}
            </h1>
            <p className={theme === 'dark' ? 'text-purple-300/80 vhs-glow-dark' : 'text-gray-700 vhs-glow-light'}>
              {t('admin.dashboard.welcome').replace('{name}', effectiveName)}
            </p>
            <p className={theme === 'dark' ? 'text-purple-300/60 text-xs mt-1' : 'text-gray-500 text-xs mt-1'}>
              Build {(__BUILD_COMMIT__ || '').slice(0, 7)} • {__BUILD_TIME__}
            </p>
          </div>
          <div className="flex flex-wrap gap-2 md:gap-3 md:justify-end">
            <Button
              onClick={() => window.location.href = '/'}
              variant="outline"
              className="flex items-center gap-2"
            >
              <Home className="w-4 h-4" />
              <span className="hidden sm:inline">{t('admin.dashboard.backToSite')}</span>
            </Button>

            <Button
              onClick={toggleTheme}
              variant="outline"
              className={`flex items-center gap-2 vhs-border ${theme === 'dark' ? 'vhs-border-animated' : ''}`}
              aria-label={t('header.aria.toggleTheme')}
            >
              {theme === 'dark' ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
              <span className="hidden sm:inline">{theme === 'dark' ? t('theme.lightMode') : t('theme.darkMode')}</span>
            </Button>

            <Button
              onClick={toggleReduceMotion}
              variant={reduceMotion ? 'destructive' : 'outline'}
              className="flex items-center gap-2"
            >
              <Sparkles className="w-4 h-4" />
              <span className="hidden sm:inline">{reduceMotion ? t('admin.dashboard.settings.animationsOff') : t('admin.dashboard.settings.animationsOn')}</span>
            </Button>

            <Button
              onClick={() => void handleToggleAvailability()}
              variant={availabilityStatus === 'available' ? 'default' : 'destructive'}
              className="flex items-center gap-2"
            >
              {availabilityStatus === 'available'
                ? t('admin.dashboard.settings.availabilityAvailable')
                : t('admin.dashboard.settings.availabilityUnavailable')}
            </Button>

            <Button
              onClick={() => void handleToggleMaintenanceMode()}
              variant={isMaintenanceMode ? 'destructive' : 'outline'}
              className="flex items-center gap-2"
            >
              {isMaintenanceMode
                ? t('admin.dashboard.settings.maintenanceOn')
                : t('admin.dashboard.settings.maintenanceOff')}
            </Button>

            <Button
              onClick={openServicesEditor}
              variant="outline"
              className="flex items-center gap-2"
            >
              <Package className="w-4 h-4" />
              {t('admin.services.title')}
            </Button>

            <Button
              onClick={() => void handleToggleSiteOnline()}
              variant={isOnline ? 'default' : 'destructive'}
              className="flex items-center gap-2"
            >
              {isOnline ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
              {isOnline ? t('admin.dashboard.siteOnline') : t('admin.dashboard.siteOffline')}
            </Button>
          </div>
        </div>

        {/* Notification */}
        {notification && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="mb-4"
          >
            <Alert className={`vhs-border ${notification.type === 'success' ? 'border-green-500 bg-green-50 vhs-glow-light' : 'border-red-500 bg-red-50 vhs-glow-dark'}`}>
              <AlertDescription className={notification.type === 'success' ? 'text-green-800' : 'text-red-800'}>
                {notification.message}
              </AlertDescription>
            </Alert>
          </motion.div>
        )}

        {!adminAccessToken && (
          <Alert className={theme === 'dark' ? 'border-yellow-500/40 bg-yellow-950/40' : 'border-yellow-200 bg-yellow-50'}>
            <AlertDescription>
              Серверный доступ не настроен. Действия будут работать только локально, без сохранения на сервере.
            </AlertDescription>
          </Alert>
        )}

        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <Card className={`vhs-border vhs-glow ${theme === 'dark' ? 'bg-slate-800/60 border-purple-500/50 vhs-glow-dark' : 'bg-white/90 border-purple-200 vhs-glow-light'}`}> 
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">{t('admin.dashboard.stats.totalReviews')}</CardTitle>
              <Star className="w-4 h-4 text-yellow-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{analytics.totalReviews}</div>
              <p className="text-xs text-muted-foreground mt-1">
                {analytics.pendingReviews > 0 && t('admin.dashboard.stats.pendingReviews').replace('{count}', String(analytics.pendingReviews))}
              </p>
            </CardContent>
          </Card>

          <Card className={`vhs-border vhs-glow ${theme === 'dark' ? 'bg-slate-800/60 border-purple-500/50 vhs-glow-dark' : 'bg-white/90 border-purple-200 vhs-glow-light'}`}> 
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">{t('admin.dashboard.stats.faqs')}</CardTitle>
              <HelpCircle className="w-4 h-4 text-blue-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{analytics.totalFAQs}</div>
              <p className="text-xs text-muted-foreground mt-1">
                {analytics.pendingFAQs > 0 && t('admin.dashboard.stats.unansweredFaqs').replace('{count}', String(analytics.pendingFAQs))}
              </p>
            </CardContent>
          </Card>

          <Card className={`vhs-border vhs-glow ${theme === 'dark' ? 'bg-slate-800/60 border-purple-500/50 vhs-glow-dark' : 'bg-white/90 border-purple-200 vhs-glow-light'}`}> 
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">{t('admin.dashboard.stats.contactRequests')}</CardTitle>
              <Mail className="w-4 h-4 text-green-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{analytics.totalContacts}</div>
              <p className="text-xs text-muted-foreground mt-1">
                {analytics.newContacts > 0 && t('admin.dashboard.stats.newContacts').replace('{count}', String(analytics.newContacts))}
              </p>
            </CardContent>
          </Card>

          <Card className={`vhs-border vhs-glow ${theme === 'dark' ? 'bg-slate-800/60 border-purple-500/50 vhs-glow-dark' : 'bg-white/90 border-purple-200 vhs-glow-light'}`}> 
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">{t('admin.dashboard.stats.registeredUsers')}</CardTitle>
              <Users className="w-4 h-4 text-purple-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{analytics.totalUsers}</div>
              <p className="text-xs text-muted-foreground mt-1">
                {t('admin.dashboard.stats.totalAccounts')}
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Main Tabs */}
        <Tabs value={selectedTab} onValueChange={setSelectedTab} className="space-y-6">
          <TabsList className={`grid w-full grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-7 gap-2 h-auto p-2 ${theme === 'dark' ? 'bg-slate-800/50' : 'bg-slate-100'}`}>
            <TabsTrigger value="analytics" className="min-h-[44px]">
              <BarChart3 className="w-4 h-4 mr-2" />
              <span className="truncate">{t('admin.dashboard.tabs.analytics')}</span>
            </TabsTrigger>
            <TabsTrigger value="reviews" className="relative min-h-[44px]">
              <span className="truncate">{t('admin.dashboard.tabs.reviews')}</span>
              {analytics.pendingReviews > 0 && (
                <Badge variant="destructive" className="ml-2 h-5 w-5 p-0 text-xs flex-shrink-0">
                  {analytics.pendingReviews}
                </Badge>
              )}
            </TabsTrigger>
            <TabsTrigger value="faqs" className="relative min-h-[44px]">
              <span className="truncate">{t('admin.dashboard.tabs.faqs')}</span>
              {analytics.pendingFAQs > 0 && (
                <Badge variant="destructive" className="ml-2 h-5 w-5 p-0 text-xs flex-shrink-0">
                  {analytics.pendingFAQs}
                </Badge>
              )}
            </TabsTrigger>
            <TabsTrigger value="contacts" className="relative min-h-[44px]">
              <span className="truncate">{t('admin.dashboard.tabs.contacts')}</span>
              {analytics.newContacts > 0 && (
                <Badge variant="destructive" className="ml-2 h-5 w-5 p-0 text-xs flex-shrink-0">
                  {analytics.newContacts}
                </Badge>
              )}
            </TabsTrigger>
            <TabsTrigger value="users" className="min-h-[44px]">
              <span className="truncate">{t('admin.dashboard.tabs.users')}</span>
            </TabsTrigger>
            <TabsTrigger value="audit" className="min-h-[44px]">
              <span className="truncate">Audit</span>
            </TabsTrigger>
            <TabsTrigger value="settings" className="min-h-[44px]">
              <SettingsIcon className="w-4 h-4 mr-2" />
              <span className="truncate">{t('admin.dashboard.tabs.settings')}</span>
            </TabsTrigger>
          </TabsList>

          {/* Analytics Tab */}
          <TabsContent value="analytics" className="space-y-4">
            <Card className={theme === 'dark' ? 'bg-slate-800/50 border-purple-500/30' : ''}>
              <CardHeader>
                <CardTitle>Server Access</CardTitle>
                <CardDescription>Проверка доступности админ‑эндпойнтов и аналитики.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex flex-wrap items-center gap-3">
                  <Badge variant={adminAccessToken ? 'default' : 'secondary'}>
                    {adminAccessToken ? 'Connected' : 'No token'}
                  </Badge>
                  <div className="text-xs text-muted-foreground">
                    {healthLastChecked ? `Последняя проверка: ${new Date(healthLastChecked).toLocaleTimeString()}` : 'Проверка не выполнялась'}
                  </div>
                  <Button onClick={() => void runHealthChecks()} variant="outline" disabled={healthLoading}>
                    {healthLoading ? 'Проверка…' : 'Проверить сервер'}
                  </Button>
                </div>

                <div className="flex flex-wrap items-center gap-2">
                  <Input
                    value={adminTokenInput}
                    onChange={(e) => setAdminTokenInput(e.target.value)}
                    placeholder="Вставьте admin access token"
                    className="flex-1 min-w-[240px]"
                  />
                  <Button onClick={saveAdminToken}>Сохранить</Button>
                  <Button onClick={clearAdminToken} variant="outline">Очистить</Button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                  {healthChecks.map((item) => {
                    const statusClass =
                      item.status === 'ok'
                        ? 'bg-green-500'
                        : item.status === 'error'
                          ? 'bg-red-500'
                          : item.status === 'unauthorized'
                            ? 'bg-yellow-500'
                            : 'bg-gray-400';
                    const statusLabel =
                      item.status === 'ok'
                        ? 'OK'
                        : item.status === 'error'
                          ? 'Error'
                          : item.status === 'unauthorized'
                            ? 'Unauthorized'
                            : 'Idle';
                    return (
                      <div key={item.key} className="flex items-center justify-between rounded border px-3 py-2 text-sm">
                        <div className="flex items-center gap-2">
                          <span className={`inline-block h-2 w-2 rounded-full ${statusClass}`} />
                          <span>{item.label}</span>
                        </div>
                        <span className="text-xs text-muted-foreground">{item.message || statusLabel}</span>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
            <AdminSiteAnalytics accessToken={adminAccessToken} />
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Activity Chart */}
              <Card className={theme === 'dark' ? 'bg-slate-800/50 border-purple-500/30' : ''}>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Activity className="w-5 h-5" />
                    {t('admin.dashboard.analytics.recentActivity')}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="w-3 h-3 rounded-full bg-blue-500"></div>
                        <span className="text-sm">{t('admin.dashboard.analytics.newReviews')}</span>
                      </div>
                      <span className="text-2xl font-bold">{analytics.recentReviews}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="w-3 h-3 rounded-full bg-green-500"></div>
                        <span className="text-sm">{t('admin.dashboard.analytics.newQuestions')}</span>
                      </div>
                      <span className="text-2xl font-bold">{analytics.recentFAQs}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="w-3 h-3 rounded-full bg-purple-500"></div>
                        <span className="text-sm">{t('admin.dashboard.analytics.contactRequests')}</span>
                      </div>
                      <span className="text-2xl font-bold">{analytics.recentContacts}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Status Distribution */}
              <Card className={theme === 'dark' ? 'bg-slate-800/50 border-purple-500/30' : ''}>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <PieChart className="w-5 h-5" />
                    {t('admin.dashboard.analytics.statusOverview')}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div>
                      <div className="flex justify-between text-sm mb-1">
                        <span>{t('admin.dashboard.analytics.approvalRate')}</span>
                        <span className="font-bold">{analytics.approvalRate}%</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div 
                          className="bg-green-500 h-2 rounded-full" 
                          style={{ width: `${analytics.approvalRate}%` }}
                        ></div>
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4 pt-2">
                      <div className={`p-3 rounded-lg ${theme === 'dark' ? 'bg-slate-700/50' : 'bg-gray-100'}`}>
                        <div className="text-xs text-muted-foreground">{t('admin.console.stats.approved')}</div>
                        <div className="text-xl font-bold text-green-500">{stats.reviews.approved}</div>
                      </div>
                      <div className={`p-3 rounded-lg ${theme === 'dark' ? 'bg-slate-700/50' : 'bg-gray-100'}`}>
                        <div className="text-xs text-muted-foreground">{t('admin.console.stats.pending')}</div>
                        <div className="text-xl font-bold text-yellow-500">{stats.reviews.pending}</div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Contact Status */}
              <Card className={theme === 'dark' ? 'bg-slate-800/50 border-purple-500/30' : ''}>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Mail className="w-5 h-5" />
                    {t('admin.dashboard.analytics.contactStatusTitle')}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between p-3 rounded-lg bg-blue-50 dark:bg-blue-900/20">
                      <span className="text-sm">{t('admin.dashboard.contactStatus.new')}</span>
                      <Badge variant="default">{stats.contacts.new}</Badge>
                    </div>
                    <div className="flex items-center justify-between p-3 rounded-lg bg-yellow-50 dark:bg-yellow-900/20">
                      <span className="text-sm">{t('admin.dashboard.contactStatus.contacted')}</span>
                      <Badge variant="secondary">{stats.contacts.contacted}</Badge>
                    </div>
                    <div className="flex items-center justify-between p-3 rounded-lg bg-green-50 dark:bg-green-900/20">
                      <span className="text-sm">{t('admin.dashboard.contactStatus.resolved')}</span>
                      <Badge className="bg-green-500">{stats.contacts.resolved}</Badge>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Quick Actions */}
              <Card className={theme === 'dark' ? 'bg-slate-800/50 border-purple-500/30' : ''}>
                <CardHeader>
                  <CardTitle>{t('admin.dashboard.analytics.quickActions')}</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  <Button onClick={handleExportData} variant="outline" className="w-full justify-start">
                    <Download className="w-4 h-4 mr-2" />
                    {t('admin.dashboard.analytics.exportAllData')}
                  </Button>
                  <Button 
                    onClick={() => setSelectedTab('contacts')}
                    variant="outline" 
                    className="w-full justify-start"
                    disabled={analytics.newContacts === 0}
                  >
                    <Mail className="w-4 h-4 mr-2" />
                    {t('admin.dashboard.analytics.viewNewContacts').replace('{count}', String(analytics.newContacts))}
                  </Button>
                  <Button 
                    onClick={() => setSelectedTab('reviews')}
                    variant="outline" 
                    className="w-full justify-start"
                    disabled={analytics.pendingReviews === 0}
                  >
                    <Star className="w-4 h-4 mr-2" />
                    {t('admin.dashboard.analytics.reviewPending').replace('{count}', String(analytics.pendingReviews))}
                  </Button>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Reviews Tab */}
          <TabsContent value="reviews" className="space-y-4">
            <LiveSupabasePanel mode="reviews" />
            {pendingReviews.length > 0 && (
              <Card className={theme === 'dark' ? 'bg-slate-800/50 border-yellow-500/50' : 'bg-yellow-50 border-yellow-200'}>
                <CardHeader>
                  <CardTitle>{t('admin.dashboard.reviews.pendingTitle').replace('{count}', String(pendingReviews.length))}</CardTitle>
                  <CardDescription>{t('admin.dashboard.reviews.pendingDescription')}</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <input type="checkbox" aria-label="Select all pending reviews" onChange={(e) => (e.target.checked ? selectAllPending() : clearSelection())} />
                        <span className="text-sm text-muted-foreground">Select all</span>
                        <Button size="sm" onClick={bulkApproveSelected} className="ml-3 bg-green-500">Approve selected</Button>
                        <Button size="sm" onClick={bulkRejectSelected} variant="outline" className="ml-2">Reject selected</Button>
                        <Button size="sm" onClick={bulkDeleteSelected} variant="destructive" className="ml-2">Delete selected</Button>
                      </div>
                      <div>
                        <Button size="sm" onClick={clearSelection} variant="ghost">Clear</Button>
                      </div>
                    </div>
                    {pendingReviews.map(review => (
                      <div key={review.id} className={`p-4 rounded-lg border ${theme === 'dark' ? 'bg-slate-700/50 border-slate-600' : 'bg-white border-gray-200'}`}>
                        <div className="absolute -translate-y-2 -translate-x-2">
                          <input type="checkbox" checked={!!selectedReviewIds[review.id]} onChange={() => toggleSelectReview(review.id)} />
                        </div>
                        <div className="flex justify-between items-start mb-2">
                          <div>
                            <p className="font-semibold">{review.name}</p>
                            <p className="text-xs text-muted-foreground">{review.email}</p>
                          </div>
                          <Badge variant="secondary">
                            {new Date(review.createdAt).toLocaleDateString()}
                          </Badge>
                        </div>
                        <p className={`mb-3 ${theme === 'dark' ? 'text-purple-200/80' : 'text-gray-700'}`}>
                          {review.message}
                        </p>

                        {(() => {
                          const draft =
                            reviewEdits[review.id] ||
                            {
                              name: review.name,
                              message: review.message,
                              date: review.date || '',
                              avatar: review.avatar || '',
                              color: review.color || '',
                              rating: typeof review.rating === 'number' ? String(review.rating) : '',
                            };
                          return (
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mb-3">
                              <Input
                                value={draft.date}
                                onChange={(e) => setReviewEdits((prev) => ({ ...prev, [review.id]: { ...draft, date: e.target.value } }))}
                                placeholder="Date (e.g., November 2024)"
                              />
                              <Input
                                value={draft.rating}
                                onChange={(e) => setReviewEdits((prev) => ({ ...prev, [review.id]: { ...draft, rating: e.target.value } }))}
                                placeholder="Rating (1-5)"
                                inputMode="numeric"
                              />
                              <Input
                                value={draft.avatar}
                                onChange={(e) => setReviewEdits((prev) => ({ ...prev, [review.id]: { ...draft, avatar: e.target.value } }))}
                                placeholder="Avatar (emoji or text)"
                              />
                              <Input
                                value={draft.color}
                                onChange={(e) => setReviewEdits((prev) => ({ ...prev, [review.id]: { ...draft, color: e.target.value } }))}
                                placeholder="Color classes (e.g., from-cyan-400 via-blue-400 to-purple-400)"
                              />
                            </div>
                          );
                        })()}

                        <div className="flex gap-2">
                          <Button onClick={() => handleApproveReview(review.id)} size="sm" className="bg-green-500">
                            <CheckCircle className="w-4 h-4 mr-1" />
                            {t('admin.console.actions.approve')}
                          </Button>
                          <Button onClick={() => void handleSavePendingReviewMeta(review.id)} size="sm" variant="outline">
                            Save
                          </Button>
                          <Button onClick={() => handleRejectReview(review.id)} size="sm" variant="destructive">
                            <XCircle className="w-4 h-4 mr-1" />
                            {t('admin.console.actions.reject')}
                          </Button>
                          <Button onClick={() => void handleDeleteAnyReview(review.id)} size="sm" variant="outline">
                            {t('admin.console.actions.remove')}
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {approvedReviews.length > 0 && (
              <Card className={theme === 'dark' ? 'bg-slate-800/50 border-purple-500/30' : ''}>
                <CardHeader>
                  <CardTitle>{t('admin.dashboard.reviews.approvedTitle').replace('{count}', String(approvedReviews.length))}</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {approvedReviews.map((review, index) => {
                      const draft =
                        reviewEdits[review.id] ||
                        {
                          name: review.name,
                          message: review.message,
                          date: review.date || '',
                          avatar: review.avatar || '',
                          color: review.color || '',
                          rating: typeof review.rating === 'number' ? String(review.rating) : '',
                        };
                      return (
                        <div key={review.id} className={`p-4 rounded-lg border ${theme === 'dark' ? 'bg-slate-700/30 border-slate-600' : 'bg-gray-50 border-gray-200'}`}>
                          <div className="flex items-start justify-between gap-3 mb-3">
                            <div>
                              <p className="font-medium text-sm">{review.name}</p>
                              <p className="text-xs text-muted-foreground">{new Date(review.createdAt).toLocaleDateString()}</p>
                            </div>
                            <div className="flex items-center gap-2">
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => void moveApprovedReview(review.id, -1)}
                                disabled={index === 0}
                              >
                                <ArrowUp className="w-4 h-4" />
                              </Button>
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => void moveApprovedReview(review.id, 1)}
                                disabled={index === approvedReviews.length - 1}
                              >
                                <ArrowDown className="w-4 h-4" />
                              </Button>
                              <Badge className="bg-green-500">
                                <CheckCircle className="w-3 h-3" />
                              </Badge>
                            </div>
                          </div>

                          <div className="grid gap-3">
                            <Input
                              value={draft.name}
                              onChange={(e) => setReviewEdits((prev) => ({ ...prev, [review.id]: { ...draft, name: e.target.value } }))}
                              placeholder="Name"
                            />
                            <Textarea
                              value={draft.message}
                              onChange={(e) => setReviewEdits((prev) => ({ ...prev, [review.id]: { ...draft, message: e.target.value } }))}
                              rows={3}
                              placeholder="Review"
                            />
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                              <Input
                                value={draft.date}
                                onChange={(e) => setReviewEdits((prev) => ({ ...prev, [review.id]: { ...draft, date: e.target.value } }))}
                                placeholder="Date (e.g., November 2024)"
                              />
                              <Input
                                value={draft.rating}
                                onChange={(e) => setReviewEdits((prev) => ({ ...prev, [review.id]: { ...draft, rating: e.target.value } }))}
                                placeholder="Rating (1-5)"
                                inputMode="numeric"
                              />
                              <Input
                                value={draft.avatar}
                                onChange={(e) => setReviewEdits((prev) => ({ ...prev, [review.id]: { ...draft, avatar: e.target.value } }))}
                                placeholder="Avatar (emoji or text)"
                              />
                              <Input
                                value={draft.color}
                                onChange={(e) => setReviewEdits((prev) => ({ ...prev, [review.id]: { ...draft, color: e.target.value } }))}
                                placeholder="Color classes (e.g., from-cyan-400 via-blue-400 to-purple-400)"
                              />
                            </div>
                            <div className="flex gap-2">
                              <Button size="sm" onClick={() => void handleSaveApprovedReview(review.id)}>
                                Save
                              </Button>
                              <Button size="sm" variant="outline" onClick={() => void handleDeleteAnyReview(review.id)}>
                                {t('admin.console.actions.remove')}
                              </Button>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </CardContent>
              </Card>
            )}

            {pendingReviews.length === 0 && approvedReviews.length === 0 && (
              <Card className={theme === 'dark' ? 'bg-slate-800/50 border-purple-500/30' : ''}>
                <CardContent className="py-8 text-center">
                  <MessageSquare className="w-12 h-12 mx-auto mb-3 text-muted-foreground" />
                  <p className="text-muted-foreground">{t('admin.dashboard.reviews.none')}</p>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          {/* FAQs Tab */}
          <TabsContent value="faqs" className="space-y-4">
            <LiveSupabasePanel mode="faqs" />
            {pendingFAQs.length > 0 && (
              <Card className={theme === 'dark' ? 'bg-slate-800/50 border-blue-500/50' : 'bg-blue-50 border-blue-200'}>
                <CardHeader>
                  <CardTitle>{t('admin.dashboard.faqs.unansweredTitle').replace('{count}', String(pendingFAQs.length))}</CardTitle>
                  <CardDescription>{t('admin.dashboard.faqs.unansweredDescription')}</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <input type="checkbox" aria-label="Select all pending faqs" onChange={(e) => (e.target.checked ? selectAllPendingFaqs() : clearFaqSelection())} />
                        <span className="text-sm text-muted-foreground">Select all</span>
                        <Button size="sm" onClick={bulkApproveSelectedFaqs} className="ml-3 bg-blue-500">Answer & Approve</Button>
                        <Button size="sm" onClick={bulkRejectSelectedFaqs} variant="outline" className="ml-2">Reject selected</Button>
                        <Button size="sm" onClick={bulkDeleteSelectedFaqs} variant="destructive" className="ml-2">Delete selected</Button>
                      </div>
                      <div>
                        <Button size="sm" onClick={clearFaqSelection} variant="ghost">Clear</Button>
                      </div>
                    </div>
                    {pendingFAQs.map(faq => (
                      <div key={faq.id} className={`p-4 rounded-lg border ${theme === 'dark' ? 'bg-slate-700/50 border-slate-600' : 'bg-white border-gray-200'}`}>
                        <div className="absolute -translate-y-2 -translate-x-2">
                          <input type="checkbox" checked={!!selectedFaqIds[faq.id]} onChange={() => toggleSelectFaq(faq.id)} />
                        </div>
                        <div className="flex justify-between items-start mb-2">
                          <div>
                            <p className="font-semibold">{faq.name}</p>
                            <p className="text-xs text-muted-foreground">{faq.email}</p>
                          </div>
                          <Badge variant="secondary">
                            {new Date(faq.createdAt).toLocaleDateString()}
                          </Badge>
                        </div>
                        <p className={`mb-3 font-medium ${theme === 'dark' ? 'text-blue-200' : 'text-blue-700'}`}>
                          {t('admin.dashboard.faqs.questionPrefix')} {faq.question}
                        </p>
                        <Textarea
                          placeholder={t('admin.dashboard.faqs.answerPlaceholder')}
                          value={faqAnswers[faq.id] || ''}
                          onChange={(e) => setFaqAnswers(prev => ({ ...prev, [faq.id]: e.target.value }))}
                          className="mb-3"
                          rows={3}
                        />

                        {(() => {
                          const draft =
                            faqEdits[faq.id] ||
                            {
                              name: faq.name,
                              question: faq.question,
                              answer: faqAnswers[faq.id] || '',
                              date: faq.date || '',
                              avatar: faq.avatar || '',
                              color: faq.color || '',
                            };
                          return (
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mb-3">
                              <Input
                                value={draft.date}
                                onChange={(e) => setFaqEdits((prev) => ({ ...prev, [faq.id]: { ...draft, date: e.target.value } }))}
                                placeholder="Date (e.g., November 2024)"
                              />
                              <Input
                                value={draft.avatar}
                                onChange={(e) => setFaqEdits((prev) => ({ ...prev, [faq.id]: { ...draft, avatar: e.target.value } }))}
                                placeholder="Avatar (emoji or text)"
                              />
                              <Input
                                value={draft.color}
                                onChange={(e) => setFaqEdits((prev) => ({ ...prev, [faq.id]: { ...draft, color: e.target.value } }))}
                                placeholder="Color classes (e.g., from-cyan-400 via-blue-400 to-purple-400)"
                              />
                            </div>
                          );
                        })()}

                        <div className="flex gap-2">
                          <Button 
                            onClick={() => handleAnswerFAQ(faq.id)} 
                            size="sm" 
                            className="bg-blue-500"
                            disabled={!faqAnswers[faq.id]?.trim()}
                          >
                            <CheckCircle className="w-4 h-4 mr-1" />
                            {t('admin.dashboard.faqs.answerPublish')}
                          </Button>
                          <Button onClick={() => void handleSavePendingFaqDraft(faq.id)} size="sm" variant="outline">
                            Save
                          </Button>
                          <Button onClick={() => handleRejectFAQ(faq.id)} size="sm" variant="destructive">
                            <XCircle className="w-4 h-4 mr-1" />
                            {t('admin.console.actions.reject')}
                          </Button>
                          <Button onClick={() => void handleDeleteAnyFAQ(faq.id)} size="sm" variant="outline">
                            {t('admin.console.actions.remove')}
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {approvedFAQs.length > 0 && (
              <Card className={theme === 'dark' ? 'bg-slate-800/50 border-purple-500/30' : ''}>
                <CardHeader>
                  <CardTitle>{t('admin.dashboard.faqs.publishedTitle').replace('{count}', String(approvedFAQs.length))}</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {approvedFAQs.map((faq, index) => {
                      const draft =
                        faqEdits[faq.id] ||
                        {
                          name: faq.name,
                          question: faq.question,
                          answer: faq.answer || '',
                          date: faq.date || '',
                          avatar: faq.avatar || '',
                          color: faq.color || '',
                        };
                      return (
                        <div key={faq.id} className={`p-4 rounded-lg border ${theme === 'dark' ? 'bg-slate-700/30 border-slate-600' : 'bg-gray-50 border-gray-200'}`}>
                          <div className="flex items-start justify-between gap-3 mb-3">
                            <div>
                              <p className="font-medium text-sm">{faq.question}</p>
                              <p className="text-xs text-muted-foreground">{new Date(faq.createdAt).toLocaleDateString()}</p>
                            </div>
                            <div className="flex items-center gap-2">
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => void moveApprovedFAQ(faq.id, -1)}
                                disabled={index === 0}
                              >
                                <ArrowUp className="w-4 h-4" />
                              </Button>
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => void moveApprovedFAQ(faq.id, 1)}
                                disabled={index === approvedFAQs.length - 1}
                              >
                                <ArrowDown className="w-4 h-4" />
                              </Button>
                              <Badge className="bg-blue-500">
                                <CheckCircle className="w-3 h-3" />
                              </Badge>
                            </div>
                          </div>

                          <div className="grid gap-3">
                            <Input
                              value={draft.name}
                              onChange={(e) => setFaqEdits((prev) => ({ ...prev, [faq.id]: { ...draft, name: e.target.value } }))}
                              placeholder="Name"
                            />
                            <Textarea
                              value={draft.question}
                              onChange={(e) => setFaqEdits((prev) => ({ ...prev, [faq.id]: { ...draft, question: e.target.value } }))}
                              rows={2}
                              placeholder="Question"
                            />
                            <Textarea
                              value={draft.answer}
                              onChange={(e) => setFaqEdits((prev) => ({ ...prev, [faq.id]: { ...draft, answer: e.target.value } }))}
                              rows={3}
                              placeholder="Answer"
                            />
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                              <Input
                                value={draft.date}
                                onChange={(e) => setFaqEdits((prev) => ({ ...prev, [faq.id]: { ...draft, date: e.target.value } }))}
                                placeholder="Date (e.g., November 2024)"
                              />
                              <Input
                                value={draft.avatar}
                                onChange={(e) => setFaqEdits((prev) => ({ ...prev, [faq.id]: { ...draft, avatar: e.target.value } }))}
                                placeholder="Avatar (emoji or text)"
                              />
                              <Input
                                value={draft.color}
                                onChange={(e) => setFaqEdits((prev) => ({ ...prev, [faq.id]: { ...draft, color: e.target.value } }))}
                                placeholder="Color classes (e.g., from-cyan-400 via-blue-400 to-purple-400)"
                              />
                            </div>
                            <div className="flex gap-2">
                              <Button size="sm" onClick={() => void handleSaveApprovedFAQ(faq.id)}>
                                Save
                              </Button>
                              <Button size="sm" variant="outline" onClick={() => void handleDeleteAnyFAQ(faq.id)}>
                                {t('admin.console.actions.remove')}
                              </Button>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          {/* Contacts Tab */}
          <TabsContent value="contacts" className="space-y-4">
            <Card className={theme === 'dark' ? 'bg-slate-800/50 border-purple-500/30' : ''}>
              <CardHeader>
                <CardTitle>{t('admin.dashboard.contacts.title').replace('{count}', String(contactSubmissions.length))}</CardTitle>
                <CardDescription>{t('admin.dashboard.contacts.description')}</CardDescription>
              </CardHeader>
              <CardContent>
                {contactSubmissions.length > 0 ? (
                  <div className="space-y-4">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <input type="checkbox" aria-label="Select all contacts" onChange={(e) => (e.target.checked ? selectAllContacts() : clearContactSelection())} />
                        <span className="text-sm text-muted-foreground">Select all</span>
                        <Button size="sm" onClick={bulkMarkContacted} className="ml-3">Mark contacted</Button>
                        <Button size="sm" onClick={bulkMarkResolved} variant="outline" className="ml-2">Mark resolved</Button>
                        <Button size="sm" onClick={bulkDeleteSelectedContacts} variant="destructive" className="ml-2">Delete selected</Button>
                      </div>
                      <div>
                        <Button size="sm" onClick={clearContactSelection} variant="ghost">Clear</Button>
                      </div>
                    </div>
                    {contactSubmissions.map(contact => (
                      <div 
                        key={contact.id} 
                        className={`p-4 rounded-lg border ${
                          theme === 'dark' ? 'bg-slate-700/50 border-slate-600' : 'bg-white border-gray-200'
                        } ${contact.status === 'new' ? 'border-l-4 border-l-blue-500' : ''}`}
                      >
                        <div className="absolute -translate-y-2 -translate-x-2">
                          <input type="checkbox" checked={!!selectedContactIds[contact.id]} onChange={() => toggleSelectContact(contact.id)} />
                        </div>
                        <div className="flex justify-between items-start mb-3">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                              <p className="font-semibold">{contact.name}</p>
                              <Badge variant={contact.status === 'new' ? 'default' : contact.status === 'contacted' ? 'secondary' : 'outline'}>
                                {contact.status === 'new'
                                  ? t('admin.dashboard.contactStatus.new')
                                  : contact.status === 'contacted'
                                    ? t('admin.dashboard.contactStatus.contacted')
                                    : t('admin.dashboard.contactStatus.resolved')}
                              </Badge>
                            </div>
                            <div className="flex items-center gap-3 text-sm text-muted-foreground">
                              <span
                                className="flex items-center gap-1 cursor-pointer"
                                role="button"
                                tabIndex={0}
                                onClick={() => void copyToClipboard(contact.email)}
                                onKeyDown={(e) => {
                                  if (e.key === 'Enter' || e.key === ' ') {
                                    e.preventDefault();
                                    void copyToClipboard(contact.email);
                                  }
                                }}
                              >
                                <Mail className="w-3 h-3" />
                                {contact.email}
                              </span>
                              <span className="flex items-center gap-1">
                                <Calendar className="w-3 h-3" />
                                {new Date(contact.createdAt).toLocaleDateString()}
                              </span>
                            </div>
                          </div>
                        </div>
                        <p className={`mb-3 text-sm ${theme === 'dark' ? 'text-purple-200/80' : 'text-gray-700'}`}>
                          {contact.message}
                        </p>
                        <div className="flex gap-2">
                          {contact.status === 'new' && (
                            <Button 
                              onClick={() => {
                                updateContactStatus(contact.id, 'contacted');
                                showNotification('success', t('admin.dashboard.notifications.markedContacted'));
                              }}
                              size="sm"
                              variant="outline"
                            >
                              {t('admin.dashboard.contacts.markContacted')}
                            </Button>
                          )}
                          {contact.status === 'contacted' && (
                            <Button 
                              onClick={() => {
                                updateContactStatus(contact.id, 'resolved');
                                showNotification('success', t('admin.dashboard.notifications.markedResolved'));
                              }}
                              size="sm"
                              className="bg-green-500"
                            >
                              <CheckCircle className="w-4 h-4 mr-1" />
                              {t('admin.dashboard.contacts.markResolved')}
                            </Button>
                          )}
                          <Button 
                            onClick={() => {
                              if (confirm(t('admin.dashboard.confirm.deleteContact'))) {
                                deleteContact(contact.id);
                                showNotification('success', t('admin.dashboard.notifications.contactDeleted'));
                              }
                            }}
                            size="sm"
                            variant="ghost"
                          >
                            <XCircle className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="py-8 text-center">
                    <Mail className="w-12 h-12 mx-auto mb-3 text-muted-foreground" />
                    <p className="text-muted-foreground">{t('admin.dashboard.contacts.none')}</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Users Tab */}
          <TabsContent value="users" className="space-y-4">
            <Card className={theme === 'dark' ? 'bg-slate-800/50 border-purple-500/30' : ''}>
              <CardHeader>
                <div className="flex items-center justify-between w-full">
                  <div>
                    <CardTitle>{t('admin.dashboard.users.title').replace('{count}', String(users.length))}</CardTitle>
                    <CardDescription>{t('admin.dashboard.users.description')}</CardDescription>
                  </div>
                  <div className="flex items-center gap-2">
                    <input
                      placeholder="Search users..."
                      value={userFilter}
                      onChange={(e) => setUserFilter(e.target.value)}
                      className="px-2 py-1 border rounded"
                    />
                    <label className="flex items-center gap-1 text-sm">
                      <input type="checkbox" checked={showOnlyAdmins} onChange={(e) => setShowOnlyAdmins(e.target.checked)} />
                      <span>Admins only</span>
                    </label>
                    <Button onClick={() => {
                      const payload = JSON.stringify(users, null, 2);
                      const blob = new Blob([payload], { type: 'application/json' });
                      const url = URL.createObjectURL(blob);
                      const a = document.createElement('a');
                      a.href = url;
                      a.download = `users-${Date.now()}.json`;
                      a.click();
                      URL.revokeObjectURL(url);
                      showNotification('success', 'Exported users');
                    }} variant="outline">Export</Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                {users && users.length > 0 ? (
                  <div className="space-y-2">
                    {users
                      .filter(u => !showOnlyAdmins || u.role === 'admin')
                      .filter(u => {
                        const f = userFilter.trim().toLowerCase();
                        if (!f) return true;
                        return (u.name || '').toLowerCase().includes(f) || (u.email || '').toLowerCase().includes(f);
                      })
                      .map(usr => (
                      <div 
                        key={usr.email || usr.name}
                        className={`flex items-center justify-between p-3 rounded-lg ${theme === 'dark' ? 'bg-slate-700/30' : 'bg-gray-50'}`}
                      >
                        <div>
                          <p className="font-medium">{usr.name}</p>
                          <p className="text-xs text-muted-foreground">{usr.email || '—'}</p>
                        </div>
                        <div className="flex items-center gap-2">
                          <Badge variant={usr.role === 'admin' ? 'default' : 'secondary'}>
                            {usr.role === 'admin' ? t('admin.dashboard.roles.admin') : t('admin.dashboard.roles.user')}
                          </Badge>
                          {usr.role !== 'admin' && usr.email !== user?.email && (
                            <>
                              <Button
                                onClick={() => void handleChangeUserRole(usr.email, 'admin')}
                                size="sm"
                                variant="outline"
                              >
                                Promote
                              </Button>
                              <Button
                                onClick={() => openConfirm({
                                  title: 'Delete user',
                                  message: `Delete user ${usr.name}?`,
                                  confirmLabel: 'Delete',
                                  onConfirm: async () => {
                                    confirmClose();
                                    removeUser(usr.email || '');
                                    showNotification('success', 'User deleted');
                                  },
                                })}
                                size="sm"
                                variant="ghost"
                              >
                                <XCircle className="w-4 h-4" />
                              </Button>
                            </>
                          )}
                          {usr.role === 'admin' && usr.email !== user?.email && (
                            <Button
                              onClick={() => void handleChangeUserRole(usr.email, 'user')}
                              size="sm"
                              variant="destructive"
                            >
                              Demote
                            </Button>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="py-8 text-center">
                    <Users className="w-12 h-12 mx-auto mb-3 text-muted-foreground" />
                    <p className="text-muted-foreground">{t('admin.dashboard.users.none')}</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Settings Tab */}
          <TabsContent value="settings" className="space-y-4">
            <Card className={theme === 'dark' ? 'bg-slate-800/50 border-purple-500/30' : ''}>
              <CardHeader>
                <CardTitle>{t('admin.dashboard.settings.title')}</CardTitle>
                <CardDescription>{t('admin.dashboard.settings.description')}</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between p-4 rounded-lg border">
                  <div>
                    <p className="font-medium">{t('admin.dashboard.settings.siteStatus')}</p>
                    <p className="text-sm text-muted-foreground">{t('admin.dashboard.settings.siteStatusDesc')}</p>
                  </div>
                  <Button
                    onClick={() => void handleToggleSiteOnline()}
                    variant={isOnline ? 'default' : 'destructive'}
                  >
                    {isOnline ? t('admin.dashboard.settings.online') : t('admin.dashboard.settings.offline')}
                  </Button>
                </div>

                <div className="flex items-center justify-between p-4 rounded-lg border">
                  <div>
                    <p className="font-medium">{t('admin.dashboard.settings.availabilityStatus')}</p>
                    <p className="text-sm text-muted-foreground">{t('admin.dashboard.settings.availabilityStatusDesc')}</p>
                  </div>
                  <Button
                    onClick={() => void handleToggleAvailability()}
                    variant={availabilityStatus === 'available' ? 'default' : 'destructive'}
                  >
                    {availabilityStatus === 'available'
                      ? t('admin.dashboard.settings.availabilityAvailable')
                      : t('admin.dashboard.settings.availabilityUnavailable')}
                  </Button>
                </div>

                <div className="flex items-center justify-between p-4 rounded-lg border">
                  <div>
                    <p className="font-medium">{t('admin.dashboard.settings.maintenanceMode')}</p>
                    <p className="text-sm text-muted-foreground">{t('admin.dashboard.settings.maintenanceModeDesc')}</p>
                  </div>
                  <Button
                    onClick={() => void handleToggleMaintenanceMode()}
                    variant={isMaintenanceMode ? 'destructive' : 'outline'}
                  >
                    {isMaintenanceMode
                      ? t('admin.dashboard.settings.maintenanceOn')
                      : t('admin.dashboard.settings.maintenanceOff')}
                  </Button>
                </div>

                <div className="flex items-center justify-between p-4 rounded-lg border">
                  <div>
                    <p className="font-medium">{t('admin.dashboard.settings.exportData')}</p>
                    <p className="text-sm text-muted-foreground">{t('admin.dashboard.settings.exportDataDesc')}</p>
                  </div>
                  <Button onClick={handleExportData} variant="outline">
                    <Download className="w-4 h-4 mr-2" />
                    {t('admin.dashboard.settings.export')}
                  </Button>
                </div>

                <div className="p-4 rounded-lg border">
                  <p className="font-medium mb-2">{t('admin.dashboard.settings.systemInfo')}</p>
                  <div className="space-y-1 text-sm text-muted-foreground">
                    <p>{t('admin.dashboard.settings.adminLabel')} {effectiveName} {effectiveEmail ? `(${effectiveEmail})` : ''}</p>
                    <p>{t('admin.dashboard.settings.totalStorage')} ~{Math.round((JSON.stringify({
                      reviews: { pending: pendingReviews, approved: approvedReviews },
                      faqs: { pending: pendingFAQs, approved: approvedFAQs },
                      contacts: contactSubmissions,
                    }).length / 1024))} KB</p>
                    <p>{t('admin.dashboard.settings.lastActivity')} {new Date().toLocaleString()}</p>
                  </div>
                </div>

                <div className="p-4 rounded-lg border">
                  <p className="font-medium mb-2">Admin access token</p>
                  <p className="text-sm text-muted-foreground mb-2">Вставьте server access token (Bearer) чтобы загрузить очереди модерации с сервера.</p>
                  <div className="flex gap-2">
                    <input
                      className="flex-1 px-3 py-2 border rounded"
                      placeholder="Paste admin access token here"
                      value={adminTokenInput}
                      onChange={(e) => setAdminTokenInput(e.target.value)}
                    />
                    <Button onClick={saveAdminToken}>
                      Save
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>

            <div id="admin-services-editor">
              <AdminServicesEditor
                adminAccessToken={adminAccessToken}
                theme={theme}
                onNotify={(type, message) => showNotification(type, message)}
              />
            </div>
          </TabsContent>

          {/* Audit Tab */}
          <TabsContent value="audit" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Audit log</CardTitle>
                <CardDescription>Recent admin actions</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-end mb-3">
                  <Button onClick={() => { exportAudit(); showNotification('success', 'Audit exported'); }} variant="outline">Export</Button>
                </div>
                {auditLog && auditLog.length > 0 ? (
                  <div className="space-y-2">
                    {auditLog.map((a) => (
                      <div key={a.id} className="p-2 rounded border bg-gray-50 text-sm">
                        <div className="font-medium">{a.action} — {a.targetType} {a.targetId || ''}</div>
                        <div className="text-xs text-muted-foreground">{new Date(a.createdAt).toLocaleString()} — {a.actor}</div>
                        <div className="text-xs mt-1">{JSON.stringify(a.details)}</div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="py-8 text-center">No audit entries.</div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
        <ConfirmModal
          open={confirmState.open}
          title={confirmState.title}
          message={confirmState.message}
          confirmLabel={confirmState.confirmLabel}
          onConfirm={async () => {
            try {
              if (confirmState.onConfirm) await confirmState.onConfirm();
            } finally {
              confirmClose();
            }
          }}
          onCancel={() => confirmClose()}
        />
      </div>
    </div>
  );
}
