import { useState, useMemo, useEffect } from 'react';
import { motion } from 'motion/react';
import { useTheme } from './ThemeContext';
import { useDataStore } from './DataStoreContext';
import { useAuth } from './AuthContext';
import { useOnlineStatus } from './OnlineStatusContext';
import { useLanguage } from './LanguageContext';
import { 
  TrendingUp, Users, MessageSquare, HelpCircle, Star, Clock, 
  CheckCircle, XCircle, Eye, EyeOff, BarChart3, 
  Mail, Phone, Calendar, ArrowUp, ArrowDown, Activity,
  Package, Image as ImageIcon, Settings as SettingsIcon,
  Download, Home, PieChart, LineChart
} from 'lucide-react';
import { Button } from './ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { Textarea } from './ui/textarea';
import { Alert, AlertDescription } from './ui/alert';
import { AdminSiteAnalytics } from './AdminSiteAnalytics';

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
  const { theme } = useTheme();
  const { t } = useLanguage();
  const { isAdmin: authIsAdmin, user, users, removeUser } = useAuth();
  const isAdmin = isAdminOverride ?? authIsAdmin;
  const effectiveName = adminDisplayName ?? user?.name ?? '';
  const effectiveEmail = adminEmail ?? user?.email ?? '';
  const { 
    pendingReviews, approvedReviews, approveReview, rejectReview,
    pendingFAQs, approvedFAQs, approveFAQ, rejectFAQ,
    contactSubmissions, updateContactStatus, deleteContact,
    stats
  } = useDataStore();
  const { isOnline, setIsOnline } = useOnlineStatus();

  const [selectedTab, setSelectedTab] = useState('analytics');
  const [faqAnswers, setFaqAnswers] = useState<Record<string, string>>({});
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

  if (isLoading) {
    return (
      <div className={`flex items-center justify-center min-h-screen ${theme === 'dark' ? 'bg-slate-900' : 'bg-slate-50'}`}>
        <Card className={theme === 'dark' ? 'bg-slate-800/50 border-purple-500/30' : ''}>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-purple-500"></div>
              <p className={theme === 'dark' ? 'text-purple-200' : 'text-gray-700'}>{t('admin.dashboard.loading')}</p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!isAdmin) {
    return (
      <div className={`flex items-center justify-center min-h-screen ${theme === 'dark' ? 'bg-slate-900' : 'bg-slate-50'}`}>
        <Card className={theme === 'dark' ? 'bg-slate-800/50 border-red-500/30' : ''}>
          <CardContent className="pt-6">
            <p className="text-red-500">{t('admin.dashboard.accessDenied')}</p>
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
      body: JSON.stringify({ key: 'site_online', value: nextOnline }),
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

  const handleApproveReview = (id: string) => {
    approveReview(id);
    showNotification('success', t('admin.dashboard.notifications.reviewApproved'));
  };

  const handleRejectReview = (id: string) => {
    rejectReview(id);
    showNotification('success', t('admin.dashboard.notifications.reviewRejected'));
  };

  const handleAnswerFAQ = (id: string) => {
    const answer = faqAnswers[id]?.trim();
    if (!answer) {
      showNotification('error', t('admin.dashboard.notifications.answerRequired'));
      return;
    }
    approveFAQ(id, answer);
    setFaqAnswers(prev => ({ ...prev, [id]: '' }));
    showNotification('success', t('admin.dashboard.notifications.faqAnswered'));
  };

  const handleRejectFAQ = (id: string) => {
    rejectFAQ(id);
    showNotification('success', t('admin.dashboard.notifications.faqRejected'));
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
    <div className={`min-h-screen p-4 md:p-8 ${theme === 'dark' ? 'bg-slate-900' : 'bg-slate-50'}`}>
      {/* Header */}
      <div className="max-w-7xl mx-auto mb-8">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className={`text-3xl font-bold mb-2 ${theme === 'dark' ? 'text-purple-100' : 'text-gray-900'}`}>
              {t('admin.dashboard.title')}
            </h1>
            <p className={theme === 'dark' ? 'text-purple-300/70' : 'text-gray-600'}>
              {t('admin.dashboard.welcome').replace('{name}', effectiveName)}
            </p>
          </div>
          <div className="flex gap-3">
            <Button
              onClick={() => window.location.href = '/'}
              variant="outline"
              className="flex items-center gap-2"
            >
              <Home className="w-4 h-4" />
              {t('admin.dashboard.backToSite')}
            </Button>
            <Button
              onClick={() => setIsOnline(!isOnline)}
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
            <Alert className={notification.type === 'success' ? 'border-green-500 bg-green-50' : 'border-red-500 bg-red-50'}>
              <AlertDescription className={notification.type === 'success' ? 'text-green-800' : 'text-red-800'}>
                {notification.message}
              </AlertDescription>
            </Alert>
          </motion.div>
        )}

        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <Card className={theme === 'dark' ? 'bg-slate-800/50 border-purple-500/30' : ''}>
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

          <Card className={theme === 'dark' ? 'bg-slate-800/50 border-purple-500/30' : ''}>
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

          <Card className={theme === 'dark' ? 'bg-slate-800/50 border-purple-500/30' : ''}>
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

          <Card className={theme === 'dark' ? 'bg-slate-800/50 border-purple-500/30' : ''}>
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
        <Tabs value={selectedTab} onValueChange={setSelectedTab} className="space-y-4">
          <TabsList className={`grid w-full grid-cols-2 md:grid-cols-6 ${theme === 'dark' ? 'bg-slate-800/50' : 'bg-slate-100'}`}>
            <TabsTrigger value="analytics">
              <BarChart3 className="w-4 h-4 mr-2" />
              {t('admin.dashboard.tabs.analytics')}
            </TabsTrigger>
            <TabsTrigger value="reviews" className="relative">
              {t('admin.dashboard.tabs.reviews')}
              {analytics.pendingReviews > 0 && (
                <Badge variant="destructive" className="ml-2 h-5 w-5 p-0 text-xs">
                  {analytics.pendingReviews}
                </Badge>
              )}
            </TabsTrigger>
            <TabsTrigger value="faqs" className="relative">
              {t('admin.dashboard.tabs.faqs')}
              {analytics.pendingFAQs > 0 && (
                <Badge variant="destructive" className="ml-2 h-5 w-5 p-0 text-xs">
                  {analytics.pendingFAQs}
                </Badge>
              )}
            </TabsTrigger>
            <TabsTrigger value="contacts" className="relative">
              {t('admin.dashboard.tabs.contacts')}
              {analytics.newContacts > 0 && (
                <Badge variant="destructive" className="ml-2 h-5 w-5 p-0 text-xs">
                  {analytics.newContacts}
                </Badge>
              )}
            </TabsTrigger>
            <TabsTrigger value="users">{t('admin.dashboard.tabs.users')}</TabsTrigger>
            <TabsTrigger value="settings">
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
                        <div className="flex gap-2">
                          <Button onClick={() => handleApproveReview(review.id)} size="sm" className="bg-green-500">
                            <CheckCircle className="w-4 h-4 mr-1" />
                            {t('admin.console.actions.approve')}
                          </Button>
                          <Button onClick={() => handleRejectReview(review.id)} size="sm" variant="destructive">
                            <XCircle className="w-4 h-4 mr-1" />
                            {t('admin.console.actions.reject')}
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
                  <div className="space-y-3">
                    {approvedReviews.slice(0, 10).map(review => (
                      <div key={review.id} className={`p-3 rounded-lg ${theme === 'dark' ? 'bg-slate-700/30' : 'bg-gray-50'}`}>
                        <div className="flex justify-between items-start">
                          <div>
                            <p className="font-medium text-sm">{review.name}</p>
                            <p className="text-xs text-muted-foreground line-clamp-2">{review.message}</p>
                          </div>
                          <Badge className="bg-green-500">
                            <CheckCircle className="w-3 h-3" />
                          </Badge>
                        </div>
                      </div>
                    ))}
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
                          <Button onClick={() => handleRejectFAQ(faq.id)} size="sm" variant="destructive">
                            <XCircle className="w-4 h-4 mr-1" />
                            {t('admin.console.actions.reject')}
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
                    {approvedFAQs.slice(0, 10).map(faq => (
                      <div key={faq.id} className={`p-3 rounded-lg ${theme === 'dark' ? 'bg-slate-700/30' : 'bg-gray-50'}`}>
                        <div className="flex justify-between items-start mb-2">
                          <p className="font-medium text-sm">{faq.question}</p>
                          <Badge className="bg-blue-500">
                            <CheckCircle className="w-3 h-3" />
                          </Badge>
                        </div>
                        <p className="text-xs text-muted-foreground">{faq.answer}</p>
                      </div>
                    ))}
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
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
