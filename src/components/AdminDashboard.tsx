import { useEffect, useState } from 'react';
import { motion } from 'motion/react';
import { useTheme } from './ThemeContext';
import { useDataStore } from './DataStoreContext';
import { useAuth } from './AuthContext';
import { useOnlineStatus } from './OnlineStatusContext';
import { 
  TrendingUp, 
  Users, 
  MessageSquare, 
  HelpCircle, 
  Star, 
  Clock, 
  CheckCircle, 
  XCircle,
  Edit,
  Trash2,
  Plus,
  RefreshCw,
  Activity,
  Eye,
  EyeOff,
  Settings,
  BarChart3,
  AlertCircle,
  Download,
  Upload,
  Home
} from 'lucide-react';
import { Button } from './ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { Input } from './ui/input';
import { Textarea } from './ui/textarea';
import { Label } from './ui/label';
import { Alert, AlertDescription } from './ui/alert';

async function compressImageFile(file: File, maxDimension = 1000, quality = 0.82) {
  const dataUrl = await new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onerror = () => reject(new Error('Failed to read file'));
    reader.onload = () => typeof reader.result === 'string' ? resolve(reader.result) : reject(new Error('Invalid file result'));
    reader.readAsDataURL(file);
  });

  return await new Promise<string>((resolve, reject) => {
    const img = new Image();
    img.onload = () => {
      const canvas = document.createElement('canvas');
      let { width, height } = img;
      const scale = Math.min(1, maxDimension / Math.max(width, height));
      width *= scale;
      height *= scale;
      canvas.width = width;
      canvas.height = height;
      const ctx = canvas.getContext('2d');
      if (!ctx) {
        reject(new Error('Canvas API unavailable'));
        return;
      }
      ctx.drawImage(img, 0, 0, width, height);
      resolve(canvas.toDataURL('image/jpeg', quality));
    };
    img.onerror = () => reject(new Error('Invalid image data'));
    img.src = dataUrl;
  });
}

export function AdminDashboard() {
  const { theme } = useTheme();
  const { isAdmin, user, users, removeUser } = useAuth();
  const { 
    pendingReviews, 
    approvedReviews, 
    approveReview, 
    rejectReview,
    pendingFAQs,
    approvedFAQs,
    approveFAQ,
    rejectFAQ,
    contactSubmissions,
    updateContactStatus,
    deleteContact,
    stats
  } = useDataStore();
  const { isOnline, setIsOnline } = useOnlineStatus();

  const [autoRefresh, setAutoRefresh] = useState(true);
  const [lastRefresh, setLastRefresh] = useState(Date.now());
  const [editingAbout, setEditingAbout] = useState(false);
  const [aboutForm, setAboutForm] = useState({
    name: '',
    tagline: '',
    description1: '',
    description2: '',
    image: '',
    statsCars: 500,
    statsReviewsLabel: '5-Star Reviews',
    statsHappyLabel: '100% Happy Customers',
  });
  const [faqAnswers, setFaqAnswers] = useState<Record<string, string>>({});
  const [notification, setNotification] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  // Initial load
  useEffect(() => {
    if (isAdmin) {
      refreshAll();
    }
  }, [isAdmin]);

  // Auto-refresh every 30 seconds
  useEffect(() => {
    if (!autoRefresh || !isAdmin) return;
    const interval = setInterval(() => {
      refreshAll();
    }, 30000);
    return () => clearInterval(interval);
  }, [autoRefresh, isAdmin]);

  // Update about form when data loads
  useEffect(() => {
    if (about) {
      setAboutForm({
        name: about.name || '',
        tagline: about.tagline || '',
        description1: about.description1 || '',
        description2: about.description2 || '',
        image: about.image || '',
        statsCars: about.statsCars || 500,
        statsReviewsLabel: about.statsReviewsLabel || '5-Star Reviews',
        statsHappyLabel: about.statsHappyLabel || '100% Happy Customers',
      });
    }
  }, [about]);

  const refreshAll = async () => {
    await Promise.all([
      loadReviews(),
      loadFAQs(),
      loadUsers(),
      loadStats(),
      loadAbout(),
      loadAudit(50),
    ]);
    setLastRefresh(Date.now());
  };

  const showNotification = (type: 'success' | 'error', message: string) => {
    setNotification({ type, message });
    setTimeout(() => setNotification(null), 3000);
  };

  const handleApproveReview = async (id: string) => {
    try {
      await updateReview(id, { approved: true });
      showNotification('success', 'Review approved');
      await refreshAll();
    } catch (error) {
      showNotification('error', 'Failed to approve review');
    }
  };

  const handleDeleteReview = async (id: string) => {
    if (!confirm('Delete this review?')) return;
    try {
      await deleteReview(id);
      showNotification('success', 'Review deleted');
      await refreshAll();
    } catch (error) {
      showNotification('error', 'Failed to delete review');
    }
  };

  const handleAnswerFAQ = async (id: string) => {
    const answer = faqAnswers[id];
    if (!answer?.trim()) return;
    try {
      await updateFAQ(id, { answer: answer.trim() });
      showNotification('success', 'FAQ answered');
      setFaqAnswers(prev => ({ ...prev, [id]: '' }));
      await refreshAll();
    } catch (error) {
      showNotification('error', 'Failed to answer FAQ');
    }
  };

  const handleDeleteFAQ = async (id: string) => {
    if (!confirm('Delete this FAQ?')) return;
    try {
      await deleteFAQ(id);
      showNotification('success', 'FAQ deleted');
      await refreshAll();
    } catch (error) {
      showNotification('error', 'Failed to delete FAQ');
    }
  };

  const handleDeleteUser = async (email: string) => {
    if (!confirm(`Delete user ${email}?`)) return;
    try {
      const userToDelete = users.find(u => u.email === email);
      if (userToDelete) {
        await deleteUser(userToDelete.id);
        showNotification('success', 'User deleted');
        await refreshAll();
      }
    } catch (error) {
      showNotification('error', 'Failed to delete user');
    }
  };

  const handleToggleStatus = () => {
    try {
      setIsOnline(!isOnline);
      showNotification('success', `Site ${!isOnline ? 'enabled' : 'disabled'}`);
    } catch (error) {
      showNotification('error', 'Failed to update status');
    }
  };

  const handleUpdateAbout = async () => {
    try {
      await updateAbout(aboutForm);
      showNotification('success', 'About section updated');
      setEditingAbout(false);
      await refreshAll();
    } catch (error) {
      showNotification('error', 'Failed to update About section');
    }
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      const compressed = await compressImageFile(file, 1000, 0.82);
      setAboutForm(prev => ({ ...prev, image: compressed }));
      showNotification('success', 'Image uploaded and compressed');
    } catch (error) {
      showNotification('error', 'Failed to compress image');
    }
  };

  const handleExportData = () => {
    const data = {
      reviews,
      faqs,
      users,
      stats,
      about,
      exportedAt: new Date().toISOString(),
    };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `silans-backup-${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);
    showNotification('success', 'Data exported');
  };

  if (!isAdmin) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <Alert>
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>Access denied. Admin privileges required.</AlertDescription>
        </Alert>
      </div>
    );
  }

  const pendingReviews = reviews.filter(r => !r.approved);
  const unansweredFAQs = faqs.filter(f => !f.answer);

  return (
    <div className={`min-h-screen p-4 md:p-8 transition-colors duration-500 ${
      theme === 'dark'
        ? 'bg-gradient-to-br from-slate-900 via-purple-900/20 to-slate-900'
        : 'bg-gradient-to-br from-slate-50 via-purple-50/30 to-slate-50'
    }`}>
      {/* Notification */}
      {notification && (
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0 }}
          className="fixed top-4 right-4 z-50"
        >
          <Alert className={notification.type === 'success' ? 'border-green-500' : 'border-red-500'}>
            <AlertDescription>{notification.message}</AlertDescription>
          </Alert>
        </motion.div>
      )}

      {/* Header */}
      <div className="max-w-7xl mx-auto mb-8">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          <div>
            <h1 className={`text-3xl font-bold mb-2 ${theme === 'dark' ? 'text-purple-200' : 'text-purple-900'}`}>
              Admin Dashboard
            </h1>
            <p className={theme === 'dark' ? 'text-purple-300/70' : 'text-purple-700/70'}>
              Welcome back, {user?.name} 👋
            </p>
          </div>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => window.location.href = '/'}
              className={theme === 'dark' ? 'border-purple-500/30' : 'border-purple-300'}
            >
              <Home className="w-4 h-4 mr-2" />
              Home
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={handleExportData}
              className={theme === 'dark' ? 'border-purple-500/30' : 'border-purple-300'}
            >
              <Download className="w-4 h-4 mr-2" />
              Export
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={refreshAll}
              className={theme === 'dark' ? 'border-purple-500/30' : 'border-purple-300'}
            >
              <RefreshCw className="w-4 h-4 mr-2" />
              Refresh
            </Button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <Card className={theme === 'dark' ? 'bg-slate-800/50 border-purple-500/30' : 'bg-white border-purple-200'}>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <Star className="w-4 h-4 text-yellow-500" />
                Total Reviews
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className={`text-3xl font-bold ${theme === 'dark' ? 'text-purple-200' : 'text-purple-900'}`}>
                {stats?.totalReviews || 0}
              </div>
              <p className="text-sm text-muted-foreground mt-1">
                {stats?.approvedReviews || 0} approved, {stats?.pendingReviews || 0} pending
              </p>
            </CardContent>
          </Card>

          <Card className={theme === 'dark' ? 'bg-slate-800/50 border-purple-500/30' : 'bg-white border-purple-200'}>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-green-500" />
                Avg Rating
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className={`text-3xl font-bold ${theme === 'dark' ? 'text-purple-200' : 'text-purple-900'}`}>
                {stats?.averageRating?.toFixed(1) || '0.0'}
              </div>
              <p className="text-sm text-muted-foreground mt-1">Out of 5.0</p>
            </CardContent>
          </Card>

          <Card className={theme === 'dark' ? 'bg-slate-800/50 border-purple-500/30' : 'bg-white border-purple-200'}>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <Users className="w-4 h-4 text-blue-500" />
                Total Users
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className={`text-3xl font-bold ${theme === 'dark' ? 'text-purple-200' : 'text-purple-900'}`}>
                {stats?.totalUsers || 0}
              </div>
              <p className="text-sm text-muted-foreground mt-1">Registered users</p>
            </CardContent>
          </Card>

          <Card className={theme === 'dark' ? 'bg-slate-800/50 border-purple-500/30' : 'bg-white border-purple-200'}>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <HelpCircle className="w-4 h-4 text-orange-500" />
                FAQs
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className={`text-3xl font-bold ${theme === 'dark' ? 'text-purple-200' : 'text-purple-900'}`}>
                {stats?.totalFaqs || 0}
              </div>
              <p className="text-sm text-muted-foreground mt-1">{unansweredFAQs.length} unanswered</p>
            </CardContent>
          </Card>
        </div>

        {/* Status Controls */}
        <Card className={`mb-8 ${theme === 'dark' ? 'bg-slate-800/50 border-purple-500/30' : 'bg-white border-purple-200'}`}>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Activity className="w-5 h-5" />
              Site Controls
            </CardTitle>
            <CardDescription>Manage site availability and auto-refresh</CardDescription>
          </CardHeader>
          <CardContent className="flex flex-wrap gap-4">
            <Button
              onClick={handleToggleStatus}
              variant={isOnline ? 'default' : 'destructive'}
              className="flex items-center gap-2"
            >
              {isOnline ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
              {isOnline ? 'Site Online' : 'Site Offline'}
            </Button>
            <Button
              onClick={() => setAutoRefresh(!autoRefresh)}
              variant={autoRefresh ? 'default' : 'outline'}
              className="flex items-center gap-2"
            >
              <RefreshCw className={`w-4 h-4 ${autoRefresh ? 'animate-spin' : ''}`} />
              Auto-refresh: {autoRefresh ? 'ON' : 'OFF'}
            </Button>
            <div className="text-sm text-muted-foreground flex items-center gap-2">
              <Clock className="w-4 h-4" />
              Last update: {new Date(lastRefresh).toLocaleTimeString()}
            </div>
          </CardContent>
        </Card>

        {/* Main Tabs */}
        <Tabs defaultValue="reviews" className="space-y-4">
          <TabsList className={`grid w-full grid-cols-2 md:grid-cols-5 ${theme === 'dark' ? 'bg-slate-800/50' : 'bg-slate-100'}`}>
            <TabsTrigger value="reviews" className="relative">
              Reviews
              {pendingReviews.length > 0 && (
                <Badge variant="destructive" className="ml-2 h-5 w-5 p-0 text-xs">
                  {pendingReviews.length}
                </Badge>
              )}
            </TabsTrigger>
            <TabsTrigger value="faqs" className="relative">
              FAQs
              {unansweredFAQs.length > 0 && (
                <Badge variant="destructive" className="ml-2 h-5 w-5 p-0 text-xs">
                  {unansweredFAQs.length}
                </Badge>
              )}
            </TabsTrigger>
            <TabsTrigger value="users">Users</TabsTrigger>
            <TabsTrigger value="about">About</TabsTrigger>
            <TabsTrigger value="audit">Audit Log</TabsTrigger>
          </TabsList>

          {/* Reviews Tab */}
          <TabsContent value="reviews" className="space-y-4">
            {pendingReviews.length > 0 && (
              <Card className={theme === 'dark' ? 'bg-slate-800/50 border-yellow-500/50' : 'bg-yellow-50 border-yellow-200'}>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <AlertCircle className="w-5 h-5 text-yellow-500" />
                    Pending Reviews ({pendingReviews.length})
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {pendingReviews.map(review => (
                    <div
                      key={review.id}
                      className={`p-4 rounded-lg border ${
                        theme === 'dark' ? 'bg-slate-900/50 border-purple-500/30' : 'bg-white border-purple-200'
                      }`}
                    >
                      <div className="flex justify-between items-start mb-2">
                        <div>
                          <div className="font-semibold">{review.name}</div>
                          <div className="text-sm text-muted-foreground">{review.email}</div>
                        </div>
                        <div className="flex items-center gap-1">
                          {Array.from({ length: 5 }).map((_, i) => (
                            <Star
                              key={i}
                              className={`w-4 h-4 ${
                                i < review.rating ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'
                              }`}
                            />
                          ))}
                        </div>
                      </div>
                      <p className="text-sm mb-3">{review.text}</p>
                      <div className="flex gap-2">
                        <Button size="sm" onClick={() => handleApproveReview(review.id)}>
                          <CheckCircle className="w-4 h-4 mr-2" />
                          Approve
                        </Button>
                        <Button size="sm" variant="destructive" onClick={() => handleDeleteReview(review.id)}>
                          <Trash2 className="w-4 h-4 mr-2" />
                          Delete
                        </Button>
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>
            )}

            <Card className={theme === 'dark' ? 'bg-slate-800/50 border-purple-500/30' : 'bg-white border-purple-200'}>
              <CardHeader>
                <CardTitle>All Reviews ({reviews.length})</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 max-h-[600px] overflow-y-auto">
                {reviews.map(review => (
                  <div
                    key={review.id}
                    className={`p-3 rounded-lg border ${
                      theme === 'dark' ? 'bg-slate-900/30 border-purple-500/20' : 'bg-slate-50 border-purple-100'
                    }`}
                  >
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="font-medium">{review.name}</span>
                          {review.approved ? (
                            <Badge variant="default" className="text-xs">Approved</Badge>
                          ) : (
                            <Badge variant="secondary" className="text-xs">Pending</Badge>
                          )}
                        </div>
                        <p className="text-sm mb-2">{review.text}</p>
                        <div className="flex items-center gap-2 text-xs text-muted-foreground">
                          <div className="flex items-center gap-1">
                            {Array.from({ length: 5 }).map((_, i) => (
                              <Star
                                key={i}
                                className={`w-3 h-3 ${
                                  i < review.rating ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'
                                }`}
                              />
                            ))}
                          </div>
                          <span>•</span>
                          <span>{new Date(review.createdAt).toLocaleDateString()}</span>
                        </div>
                      </div>
                      <Button size="sm" variant="ghost" onClick={() => handleDeleteReview(review.id)}>
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          </TabsContent>

          {/* FAQs Tab */}
          <TabsContent value="faqs" className="space-y-4">
            {unansweredFAQs.length > 0 && (
              <Card className={theme === 'dark' ? 'bg-slate-800/50 border-yellow-500/50' : 'bg-yellow-50 border-yellow-200'}>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <AlertCircle className="w-5 h-5 text-yellow-500" />
                    Unanswered Questions ({unansweredFAQs.length})
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {unansweredFAQs.map(faq => (
                    <div
                      key={faq.id}
                      className={`p-4 rounded-lg border ${
                        theme === 'dark' ? 'bg-slate-900/50 border-purple-500/30' : 'bg-white border-purple-200'
                      }`}
                    >
                      <div className="font-semibold mb-3">{faq.question}</div>
                      <Textarea
                        placeholder="Type your answer..."
                        value={faqAnswers[faq.id] || ''}
                        onChange={(e) => setFaqAnswers(prev => ({ ...prev, [faq.id]: e.target.value }))}
                        className="mb-2"
                      />
                      <div className="flex gap-2">
                        <Button size="sm" onClick={() => handleAnswerFAQ(faq.id)}>
                          <CheckCircle className="w-4 h-4 mr-2" />
                          Submit Answer
                        </Button>
                        <Button size="sm" variant="destructive" onClick={() => handleDeleteFAQ(faq.id)}>
                          <Trash2 className="w-4 h-4 mr-2" />
                          Delete
                        </Button>
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>
            )}

            <Card className={theme === 'dark' ? 'bg-slate-800/50 border-purple-500/30' : 'bg-white border-purple-200'}>
              <CardHeader>
                <CardTitle>All FAQs ({faqs.length})</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 max-h-[600px] overflow-y-auto">
                {faqs.map(faq => (
                  <div
                    key={faq.id}
                    className={`p-3 rounded-lg border ${
                      theme === 'dark' ? 'bg-slate-900/30 border-purple-500/20' : 'bg-slate-50 border-purple-100'
                    }`}
                  >
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <div className="font-medium mb-2">{faq.question}</div>
                        {faq.answer && (
                          <p className="text-sm text-muted-foreground">{faq.answer}</p>
                        )}
                      </div>
                      <Button size="sm" variant="ghost" onClick={() => handleDeleteFAQ(faq.id)}>
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Users Tab */}
          <TabsContent value="users">
            <Card className={theme === 'dark' ? 'bg-slate-800/50 border-purple-500/30' : 'bg-white border-purple-200'}>
              <CardHeader>
                <CardTitle>Registered Users ({users.length})</CardTitle>
                <CardDescription>Manage user accounts and permissions</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-2 max-h-[600px] overflow-y-auto">
                  {users.map(user => (
                    <div
                      key={user.id}
                      className={`flex items-center justify-between p-3 rounded-lg border ${
                        theme === 'dark' ? 'bg-slate-900/30 border-purple-500/20' : 'bg-slate-50 border-purple-100'
                      }`}
                    >
                      <div className="flex-1">
                        <div className="font-medium">{user.name}</div>
                        <div className="text-sm text-muted-foreground">{user.email}</div>
                        <div className="text-xs text-muted-foreground mt-1">
                          Joined: {new Date(user.createdAt).toLocaleDateString()}
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge variant={user.role === 'admin' ? 'default' : 'secondary'}>
                          {user.role}
                        </Badge>
                        {user.role !== 'admin' && (
                          <Button size="sm" variant="ghost" onClick={() => handleDeleteUser(user.email)}>
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* About Tab */}
          <TabsContent value="about">
            <Card className={theme === 'dark' ? 'bg-slate-800/50 border-purple-500/30' : 'bg-white border-purple-200'}>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <span>About Section Settings</span>
                  {!editingAbout && (
                    <Button size="sm" onClick={() => setEditingAbout(true)}>
                      <Edit className="w-4 h-4 mr-2" />
                      Edit
                    </Button>
                  )}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {editingAbout ? (
                  <>
                    <div>
                      <Label>Name</Label>
                      <Input
                        value={aboutForm.name}
                        onChange={(e) => setAboutForm(prev => ({ ...prev, name: e.target.value }))}
                        placeholder="Your name"
                      />
                    </div>
                    <div>
                      <Label>Tagline</Label>
                      <Input
                        value={aboutForm.tagline}
                        onChange={(e) => setAboutForm(prev => ({ ...prev, tagline: e.target.value }))}
                        placeholder="Your tagline"
                      />
                    </div>
                    <div>
                      <Label>Description (Paragraph 1)</Label>
                      <Textarea
                        value={aboutForm.description1}
                        onChange={(e) => setAboutForm(prev => ({ ...prev, description1: e.target.value }))}
                        placeholder="First paragraph"
                        rows={3}
                      />
                    </div>
                    <div>
                      <Label>Description (Paragraph 2)</Label>
                      <Textarea
                        value={aboutForm.description2}
                        onChange={(e) => setAboutForm(prev => ({ ...prev, description2: e.target.value }))}
                        placeholder="Second paragraph"
                        rows={3}
                      />
                    </div>
                    <div>
                      <Label>Profile Image</Label>
                      <Input type="file" accept="image/*" onChange={handleImageUpload} />
                      {aboutForm.image && (
                        <img src={aboutForm.image} alt="Preview" className="mt-2 w-32 h-32 object-cover rounded-lg" />
                      )}
                    </div>
                    <div className="grid grid-cols-3 gap-4">
                      <div>
                        <Label>Cars Detailed</Label>
                        <Input
                          type="number"
                          value={aboutForm.statsCars}
                          onChange={(e) => setAboutForm(prev => ({ ...prev, statsCars: parseInt(e.target.value) || 0 }))}
                        />
                      </div>
                      <div>
                        <Label>Reviews Label</Label>
                        <Input
                          value={aboutForm.statsReviewsLabel}
                          onChange={(e) => setAboutForm(prev => ({ ...prev, statsReviewsLabel: e.target.value }))}
                        />
                      </div>
                      <div>
                        <Label>Happy Label</Label>
                        <Input
                          value={aboutForm.statsHappyLabel}
                          onChange={(e) => setAboutForm(prev => ({ ...prev, statsHappyLabel: e.target.value }))}
                        />
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Button onClick={handleUpdateAbout}>
                        <CheckCircle className="w-4 h-4 mr-2" />
                        Save Changes
                      </Button>
                      <Button variant="outline" onClick={() => setEditingAbout(false)}>
                        Cancel
                      </Button>
                    </div>
                  </>
                ) : (
                  <div className="space-y-4">
                    {about?.image && (
                      <img src={about.image} alt={about.name} className="w-48 h-48 object-cover rounded-lg" />
                    )}
                    <div>
                      <div className="text-sm font-medium text-muted-foreground">Name</div>
                      <div>{about?.name || 'Not set'}</div>
                    </div>
                    <div>
                      <div className="text-sm font-medium text-muted-foreground">Tagline</div>
                      <div>{about?.tagline || 'Not set'}</div>
                    </div>
                    <div>
                      <div className="text-sm font-medium text-muted-foreground">Description</div>
                      <div>{about?.description1 || 'Not set'}</div>
                      <div className="mt-2">{about?.description2 || ''}</div>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Audit Log Tab */}
          <TabsContent value="audit">
            <Card className={theme === 'dark' ? 'bg-slate-800/50 border-purple-500/30' : 'bg-white border-purple-200'}>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BarChart3 className="w-5 h-5" />
                  Audit Log
                </CardTitle>
                <CardDescription>Recent activity and changes</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-2 max-h-[600px] overflow-y-auto">
                  {auditEntries.map((entry, idx) => (
                    <div
                      key={idx}
                      className={`p-3 rounded-lg border text-sm ${
                        theme === 'dark' ? 'bg-slate-900/30 border-purple-500/20' : 'bg-slate-50 border-purple-100'
                      }`}
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="font-medium mb-1">{entry.type}</div>
                          <div className="text-xs text-muted-foreground">
                            {new Date(entry.ts).toLocaleString()} • IP: {entry.ip}
                          </div>
                          {Object.keys(entry.details).length > 0 && (
                            <div className="text-xs text-muted-foreground mt-1">
                              {JSON.stringify(entry.details)}
                            </div>
                          )}
                        </div>
                        {entry.admin && (
                          <Badge variant="default" className="text-xs">Admin</Badge>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
