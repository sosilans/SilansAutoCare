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
  const { isAdmin: authIsAdmin, user, users, removeUser } = useAuth();
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
  } = useDataStore();
  const { isOnline, setIsOnline } = useOnlineStatus();
  const { status: availabilityStatus, setStatus: setAvailabilityStatus } = useAvailabilityStatus();
  const { isMaintenanceMode, setIsMaintenanceMode } = useMaintenanceMode();

  const [selectedTab, setSelectedTab] = useState('analytics');
  const [faqAnswers, setFaqAnswers] = useState<Record<string, string>>({});
  const [reviewEdits, setReviewEdits] = useState<
    Record<string, { name: string; message: string; date: string; avatar: string; color: string; rating: string }>
  >({});
  const [faqEdits, setFaqEdits] = useState<Record<string, { name: string; question: string; answer: string; date: string; avatar: string; color: string }>>({});
  const [notification, setNotification] = useState<{ type: 'success' | 'error'; message: string } | null>(null);
  const [isLoading, setIsLoading] = useState(true);

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

  const persistSiteOnline = async (nextOnline: boolean) => {
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

  return (
    <div className={`min-h-screen p-4 md:p-8 vhs-noise vhs-scanlines ${theme === 'dark' ? 'bg-slate-950' : 'bg-gradient-to-br from-sky-50 via-blue-50 to-cyan-50'}`}>
      {/* Moderation Tab */}
      <div className="mb-8">
        <h2 className="text-2xl font-bold mb-4 vhs-text vhs-glow-light">Ожидают модерации</h2>
        {(pendingReviews.length === 0 && pendingFAQs.length === 0) && (
          <div className="text-gray-500">Нет элементов для модерации.</div>
        )}
        <div className="space-y-4">
          {pendingReviews.map((r) => (
            <div key={r.id} className="p-4 rounded-lg border vhs-border bg-white/80 flex flex-col md:flex-row md:items-center md:justify-between gap-2">
              <div>
                <div className="font-semibold text-lg text-yellow-700">Отзыв</div>
                <div className="font-bold">{r.name}</div>
                <div className="text-gray-700 mb-1">{r.message}</div>
                <div className="text-xs text-gray-400">{new Date(r.createdAt).toLocaleString()}</div>
              </div>
              <div className="flex gap-2">
                <Button size="sm" variant="success" onClick={() => handleApproveReview(r.id)}>Одобрить</Button>
                <Button size="sm" variant="destructive" onClick={() => handleRejectReview(r.id)}>Отклонить</Button>
              </div>
            </div>
          ))}
          {pendingFAQs.map((f) => (
            <div key={f.id} className="p-4 rounded-lg border vhs-border bg-white/80 flex flex-col md:flex-row md:items-center md:justify-between gap-2">
              <div>
                <div className="font-semibold text-lg text-blue-700">FAQ</div>
                <div className="font-bold">{f.name}</div>
                <div className="text-gray-700 mb-1">{f.question}</div>
                <div className="text-xs text-gray-400">{new Date(f.createdAt).toLocaleString()}</div>
              </div>
              <div className="flex gap-2">
                <Button size="sm" variant="success" onClick={() => handleAnswerFAQ(f.id)}>Одобрить</Button>
                <Button size="sm" variant="destructive" onClick={() => handleRejectFAQ(f.id)}>Отклонить</Button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Live Data Tab */}
      <div className="mb-8">
        <h2 className="text-2xl font-bold mb-4 vhs-text vhs-glow-light">Живые данные (Supabase)</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h3 className="font-semibold text-lg mb-2 text-yellow-700">Все отзывы</h3>
            <div className="space-y-2">
              {allReviews.length === 0 && <div className="text-gray-400">Нет отзывов.</div>}
              {allReviews.map((r) => (
                <div key={r.id} className="p-3 rounded border vhs-border bg-white/70">
                  <div className="font-bold">{r.name}</div>
                  <div className="text-gray-700">{r.message}</div>
                  <div className="text-xs text-gray-400">{new Date(r.createdAt).toLocaleString()} | Статус: <span className={r.status === 'approved' ? 'text-green-600' : r.status === 'pending' ? 'text-yellow-600' : 'text-red-600'}>{r.status}</span></div>
                </div>
              ))}
            </div>
          </div>
          <div>
            <h3 className="font-semibold text-lg mb-2 text-blue-700">Все FAQ</h3>
            <div className="space-y-2">
              {allFAQs.length === 0 && <div className="text-gray-400">Нет FAQ.</div>}
              {allFAQs.map((f) => (
                <div key={f.id} className="p-3 rounded border vhs-border bg-white/70">
                  <div className="font-bold">{f.name}</div>
                  <div className="text-gray-700">{f.question}</div>
                  <div className="text-xs text-gray-400">{new Date(f.createdAt).toLocaleString()} | Статус: <span className={f.status === 'approved' ? 'text-green-600' : f.status === 'pending' ? 'text-yellow-600' : 'text-red-600'}>{f.status}</span></div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
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
        <Tabs value={selectedTab} onValueChange={setSelectedTab} className="space-y-4" unmount={false}>
          <TabsList className={`grid w-full grid-cols-2 md:grid-cols-6 ${theme === 'dark' ? 'bg-slate-800/50' : 'bg-slate-100'}`}>
            <TabsTrigger value="analytics" onClick={() => setSelectedTab('analytics')}>
              <BarChart3 className="w-4 h-4 mr-2" />
              {t('admin.dashboard.tabs.analytics')}
            </TabsTrigger>
            <TabsTrigger value="reviews" className="relative" onClick={() => setSelectedTab('reviews')}>
              {t('admin.dashboard.tabs.reviews')}
              {analytics.pendingReviews > 0 && (
                <Badge variant="destructive" className="ml-2 h-5 w-5 p-0 text-xs">
                  {analytics.pendingReviews}
                </Badge>
              )}
            </TabsTrigger>
            <TabsTrigger value="faqs" className="relative" onClick={() => setSelectedTab('faqs')}>
              {t('admin.dashboard.tabs.faqs')}
              {analytics.pendingFAQs > 0 && (
                <Badge variant="destructive" className="ml-2 h-5 w-5 p-0 text-xs">
                  {analytics.pendingFAQs}
                </Badge>
              )}
            </TabsTrigger>
            <TabsTrigger value="contacts" className="relative" onClick={() => setSelectedTab('contacts')}>
              {t('admin.dashboard.tabs.contacts')}
              {analytics.newContacts > 0 && (
                <Badge variant="destructive" className="ml-2 h-5 w-5 p-0 text-xs">
                  {analytics.newContacts}
                </Badge>
              )}
            </TabsTrigger>
            <TabsTrigger value="users" onClick={() => setSelectedTab('users')}>{t('admin.dashboard.tabs.users')}</TabsTrigger>
            <TabsTrigger value="settings" onClick={() => setSelectedTab('settings')}>
              <SettingsIcon className="w-4 h-4 mr-2" />
              {t('admin.dashboard.tabs.settings')}
            </TabsTrigger>
          </TabsList>

          {/* Analytics Tab */}
          <TabsContent value="analytics" className="space-y-4">
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
            {pendingReviews.length > 0 && (
              <Card className={theme === 'dark' ? 'bg-slate-800/50 border-yellow-500/50' : 'bg-yellow-50 border-yellow-200'}>
                <CardHeader>
                  <CardTitle>{t('admin.dashboard.reviews.pendingTitle').replace('{count}', String(pendingReviews.length))}</CardTitle>
                  <CardDescription>{t('admin.dashboard.reviews.pendingDescription')}</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {pendingReviews.map(review => (
                      <div key={review.id} className={`p-4 rounded-lg border ${theme === 'dark' ? 'bg-slate-700/50 border-slate-600' : 'bg-white border-gray-200'}`}>
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
            {pendingFAQs.length > 0 && (
              <Card className={theme === 'dark' ? 'bg-slate-800/50 border-blue-500/50' : 'bg-blue-50 border-blue-200'}>
                <CardHeader>
                  <CardTitle>{t('admin.dashboard.faqs.unansweredTitle').replace('{count}', String(pendingFAQs.length))}</CardTitle>
                  <CardDescription>{t('admin.dashboard.faqs.unansweredDescription')}</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {pendingFAQs.map(faq => (
                      <div key={faq.id} className={`p-4 rounded-lg border ${theme === 'dark' ? 'bg-slate-700/50 border-slate-600' : 'bg-white border-gray-200'}`}>
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
                    {contactSubmissions.map(contact => (
                      <div 
                        key={contact.id} 
                        className={`p-4 rounded-lg border ${
                          theme === 'dark' ? 'bg-slate-700/50 border-slate-600' : 'bg-white border-gray-200'
                        } ${contact.status === 'new' ? 'border-l-4 border-l-blue-500' : ''}`}
                      >
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
                <CardTitle>{t('admin.dashboard.users.title').replace('{count}', String(users.length))}</CardTitle>
                <CardDescription>{t('admin.dashboard.users.description')}</CardDescription>
              </CardHeader>
              <CardContent>
                {users.length > 0 ? (
                  <div className="space-y-2">
                    {users.map(usr => (
                      <div 
                        key={usr.email} 
                        className={`flex items-center justify-between p-3 rounded-lg ${theme === 'dark' ? 'bg-slate-700/30' : 'bg-gray-50'}`}
                      >
                        <div>
                          <p className="font-medium">{usr.name}</p>
                          <p className="text-xs text-muted-foreground">{usr.email}</p>
                        </div>
                        <div className="flex items-center gap-2">
                          <Badge variant={usr.role === 'admin' ? 'default' : 'secondary'}>
                            {usr.role === 'admin' ? t('admin.dashboard.roles.admin') : t('admin.dashboard.roles.user')}
                          </Badge>
                          {usr.role !== 'admin' && usr.email !== user?.email && (
                            <Button
                              onClick={() => {
                                if (confirm(t('admin.dashboard.confirm.deleteUser').replace('{name}', usr.name))) {
                                  removeUser(usr.email || '');
                                  showNotification('success', t('admin.dashboard.notifications.userDeleted'));
                                }
                              }}
                              size="sm"
                              variant="ghost"
                            >
                              <XCircle className="w-4 h-4" />
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
        </Tabs>
      </div>
    </div>
  );
}
