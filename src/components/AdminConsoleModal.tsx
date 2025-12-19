import { useMemo, useState } from 'react';
import { motion } from 'motion/react';
import { useTheme } from './ThemeContext';
import { useDataStore } from './DataStoreContext';
import { useAuth } from './AuthContext';
import { useLanguage } from './LanguageContext';

interface AdminConsoleModalProps {
  open: boolean;
  onClose: () => void;
}

type Tab = 'moderation' | 'stats' | 'users' | 'content';

export function AdminConsoleModal({ open, onClose }: AdminConsoleModalProps) {
  const { theme } = useTheme();
  const { t } = useLanguage();
  const [tab, setTab] = useState<Tab>('moderation');
  const { pendingReviews, pendingFAQs, approveReview, rejectReview, approveFAQ, rejectFAQ, stats } = useDataStore();
  const { users, removeUser } = useAuth();

  if (!open) return null;

  const tabBtn = (id: Tab, label: string) => (
    <button
      key={id}
      onClick={() => setTab(id)}
      className={`px-4 py-2 rounded-xl border-2 transition ${
        tab === id
          ? theme === 'dark'
            ? 'bg-purple-900/40 border-purple-500/60 text-purple-100'
            : 'bg-purple-50 border-purple-400 text-purple-700'
          : theme === 'dark'
            ? 'border-purple-500/20 text-purple-200 hover:border-purple-400/40'
            : 'border-purple-200 text-purple-700 hover:border-purple-300'
      }`}
    >
      {label}
    </button>
  );

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center">
      <div className="absolute inset-0 bg-black/60" onClick={onClose} />
      <motion.div
        initial={{ opacity: 0, scale: 0.96 }}
        animate={{ opacity: 1, scale: 1 }}
        className={`relative w-[94vw] max-w-4xl rounded-3xl border-2 p-6 md:p-7 mx-4 backdrop-blur-md shadow-2xl ${
          theme === 'dark'
            ? 'bg-gray-900/92 border-purple-500/30 vhs-noise vhs-scanlines'
            : 'bg-white/90 border-purple-200'
        }`}
      >
        <div className="flex items-center justify-between mb-5">
          <h3 className={`text-xl font-semibold ${theme === 'dark' ? 'text-purple-100' : 'text-gray-900'}`}>
            {t('admin.console.title')}
          </h3>
          <button onClick={onClose} className="text-sm opacity-70 hover:opacity-100">{t('common.close')}</button>
        </div>

        <div className="flex flex-wrap gap-2 mb-5">
          {tabBtn('moderation', t('admin.console.tabs.moderation'))}
          {tabBtn('stats', t('admin.console.tabs.stats'))}
          {tabBtn('users', t('admin.console.tabs.users'))}
          {tabBtn('content', t('admin.console.tabs.content'))}
        </div>

        <div className={`rounded-2xl border ${theme === 'dark' ? 'border-purple-500/20' : 'border-purple-200'} p-4 md:p-5`}> 
          {tab === 'moderation' && (
            <div className="space-y-6">
              <h4 className={`font-medium ${theme === 'dark' ? 'text-purple-100' : 'text-gray-900'}`}>{t('admin.console.moderation.title')}</h4>
              {/* Reviews Pending */}
              <div>
                <h5 className={theme === 'dark' ? 'text-purple-200 mb-2' : 'text-gray-800 mb-2'}>
                  {t('admin.console.moderation.pendingReviews').replace('{count}', String(pendingReviews.length))}
                </h5>
                <div className="space-y-3">
                  {pendingReviews.length === 0 && (
                    <p className={theme === 'dark' ? 'text-purple-300/70' : 'text-gray-500'}>{t('admin.console.moderation.noPendingReviews')}</p>
                  )}
                  {pendingReviews.map(r => (
                    <div key={r.id} className={`p-3 rounded-2xl border ${theme === 'dark' ? 'border-purple-500/20' : 'border-purple-200'}`}>
                      <div className="flex items-center justify-between gap-3">
                        <div>
                          <div className={theme === 'dark' ? 'text-purple-100' : 'text-gray-900'}>{r.name} <span className={theme === 'dark' ? 'text-purple-300/60' : 'text-gray-500'}>({new Date(r.createdAt).toLocaleString()})</span></div>
                          <div className={theme === 'dark' ? 'text-purple-200/80' : 'text-gray-700'}>{r.message}</div>
                        </div>
                        <div className="flex gap-2">
                          <button onClick={() => approveReview(r.id)} className={`px-3 py-1.5 rounded-xl text-sm ${theme === 'dark' ? 'bg-purple-900/40 border border-purple-500/40 text-purple-100' : 'bg-purple-50 border border-purple-300 text-purple-700'}`}>{t('admin.console.actions.approve')}</button>
                          <button onClick={() => rejectReview(r.id)} className={`px-3 py-1.5 rounded-xl text-sm ${theme === 'dark' ? 'border border-rose-500/40 text-rose-200 hover:bg-rose-900/20' : 'border border-rose-300 text-rose-700 hover:bg-rose-50'}`}>{t('admin.console.actions.reject')}</button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              {/* FAQs Pending */}
              <div>
                <h5 className={theme === 'dark' ? 'text-purple-200 mb-2' : 'text-gray-800 mb-2'}>
                  {t('admin.console.moderation.pendingFaqs').replace('{count}', String(pendingFAQs.length))}
                </h5>
                <div className="space-y-3">
                  {pendingFAQs.length === 0 && (
                    <p className={theme === 'dark' ? 'text-purple-300/70' : 'text-gray-500'}>{t('admin.console.moderation.noPendingFaqs')}</p>
                  )}
                  {pendingFAQs.map(f => (
                    <div key={f.id} className={`p-3 rounded-2xl border ${theme === 'dark' ? 'border-purple-500/20' : 'border-purple-200'}`}>
                      <div className="flex flex-col gap-2">
                        <div className={theme === 'dark' ? 'text-purple-100' : 'text-gray-900'}>{f.name} <span className={theme === 'dark' ? 'text-purple-300/60' : 'text-gray-500'}>({new Date(f.createdAt).toLocaleString()})</span></div>
                        <div className={theme === 'dark' ? 'text-purple-200/80' : 'text-gray-700'}>{f.question}</div>
                        <textarea
                          defaultValue={f.answer || ''}
                          placeholder={t('admin.console.moderation.answerPlaceholder')}
                          className={`mt-1 w-full rounded-xl p-2 text-sm border ${theme === 'dark' ? 'bg-purple-950/30 border-purple-500/20 text-purple-100 placeholder:text-purple-300/50' : 'bg-gray-50 border-gray-200 text-gray-900 placeholder:text-gray-500'}`}
                          onChange={(e) => { f.answer = e.target.value; }}
                        />
                        <div className="flex gap-2 justify-end">
                          <button onClick={() => approveFAQ(f.id, f.answer)} className={`px-3 py-1.5 rounded-xl text-sm ${theme === 'dark' ? 'bg-purple-900/40 border border-purple-500/40 text-purple-100' : 'bg-purple-50 border border-purple-300 text-purple-700'}`}>{t('admin.console.actions.approve')}</button>
                          <button onClick={() => rejectFAQ(f.id)} className={`px-3 py-1.5 rounded-xl text-sm ${theme === 'dark' ? 'border border-rose-500/40 text-rose-200 hover:bg-rose-900/20' : 'border border-rose-300 text-rose-700 hover:bg-rose-50'}`}>{t('admin.console.actions.reject')}</button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
          {tab === 'stats' && (
            <div className="space-y-4">
              <h4 className={`font-medium ${theme === 'dark' ? 'text-purple-100' : 'text-gray-900'}`}>{t('admin.console.stats.title')}</h4>
              <div className="grid sm:grid-cols-2 gap-3">
                <div className={`p-4 rounded-2xl border ${theme === 'dark' ? 'border-purple-500/20' : 'border-purple-200'}`}>
                  <div className={theme === 'dark' ? 'text-purple-300' : 'text-gray-600'}>{t('admin.console.stats.reviews')}</div>
                  <div className="mt-1 flex gap-4 text-sm">
                    <span>{t('admin.console.stats.approved')}: {stats.reviews.approved}</span>
                    <span>{t('admin.console.stats.pending')}: {stats.reviews.pending}</span>
                    <span>{t('admin.console.stats.total')}: {stats.reviews.total}</span>
                  </div>
                </div>
                <div className={`p-4 rounded-2xl border ${theme === 'dark' ? 'border-purple-500/20' : 'border-purple-200'}`}>
                  <div className={theme === 'dark' ? 'text-purple-300' : 'text-gray-600'}>{t('admin.console.stats.faqs')}</div>
                  <div className="mt-1 flex gap-4 text-sm">
                    <span>{t('admin.console.stats.approved')}: {stats.faqs.approved}</span>
                    <span>{t('admin.console.stats.pending')}: {stats.faqs.pending}</span>
                    <span>{t('admin.console.stats.total')}: {stats.faqs.total}</span>
                  </div>
                </div>
              </div>
            </div>
          )}
          {tab === 'users' && (
            <div className="space-y-4">
              <h4 className={`font-medium ${theme === 'dark' ? 'text-purple-100' : 'text-gray-900'}`}>{t('admin.console.users.title')}</h4>
              <div className={`text-sm ${theme === 'dark' ? 'text-purple-300/80' : 'text-gray-600'}`}>
                {t('admin.console.users.total').replace('{count}', String(users.length))}
              </div>
              <div className="space-y-2">
                {users.length === 0 && (<p className={theme === 'dark' ? 'text-purple-300/70' : 'text-gray-500'}>{t('admin.console.users.none')}</p>)}
                {users.map(u => (
                  <div key={(u.email || u.name)} className={`p-3 rounded-2xl border flex items-center justify-between gap-2 ${theme === 'dark' ? 'border-purple-500/20' : 'border-purple-200'}`}>
                    <div>
                      <div className={theme === 'dark' ? 'text-purple-100' : 'text-gray-900'}>{u.name} {u.role === 'admin' && <span className="ml-2 text-xs px-2 py-0.5 rounded-full border border-purple-400 text-purple-700 bg-purple-50">{t('admin.console.users.adminBadge')}</span>}</div>
                      <div className={theme === 'dark' ? 'text-purple-300/70' : 'text-gray-600'}>{u.email}</div>
                    </div>
                    <div className="flex gap-2">
                      <button onClick={() => u.email && removeUser(u.email)} className={`px-3 py-1.5 rounded-xl text-sm ${theme === 'dark' ? 'border border-rose-500/40 text-rose-200 hover:bg-rose-900/20' : 'border border-rose-300 text-rose-700 hover:bg-rose-50'}`}>{t('admin.console.actions.remove')}</button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
          {tab === 'content' && (
            <div className="space-y-3">
              <h4 className={`font-medium ${theme === 'dark' ? 'text-purple-100' : 'text-gray-900'}`}>{t('admin.console.content.title')}</h4>
              <p className={theme === 'dark' ? 'text-purple-200/80' : 'text-gray-600'}>
                {t('admin.console.content.comingSoon')}
              </p>
            </div>
          )}
        </div>
      </motion.div>
    </div>
  );
}
