import { createContext, useContext, useEffect, useMemo, useState } from 'react';

export type ModerationStatus = 'pending' | 'approved' | 'rejected';

export interface ReviewSubmission {
  id: string;
  name: string;
  email: string;
  message: string;
  createdAt: number;
  status: ModerationStatus;
  rating?: number;
  date?: string;
  avatar?: string;
  color?: string;
  order?: number;
}

export interface FAQSubmission {
  id: string;
  name: string;
  email: string;
  question: string;
  answer?: string;
  createdAt: number;
  status: ModerationStatus;
  date?: string;
  avatar?: string;
  color?: string;
  order?: number;
}

export interface ContactSubmission {
  id: string;
  name: string;
  email: string;
  phone?: string;
  message: string;
  createdAt: number;
  status: 'new' | 'contacted' | 'resolved';
}

interface DataStoreContextValue {
  // Reviews
  pendingReviews: ReviewSubmission[];
  approvedReviews: ReviewSubmission[];
  submitReview: (name: string, email: string, message: string) => void;
  approveReview: (id: string) => Promise<boolean>;
  rejectReview: (id: string) => Promise<boolean>;
  updateReview: (id: string, patch: { name?: string; message?: string; meta?: Record<string, unknown> }) => Promise<boolean>;
  deleteReview: (id: string) => Promise<boolean>;
  reorderApprovedReviews: (ids: string[]) => Promise<boolean>;
  // FAQ
  pendingFAQs: FAQSubmission[];
  approvedFAQs: FAQSubmission[];
  submitQuestion: (name: string, email: string, question: string) => void;
  approveFAQ: (id: string, answer?: string) => Promise<boolean>;
  rejectFAQ: (id: string) => Promise<boolean>;
  updateFAQ: (id: string, patch: { name?: string; question?: string; answer?: string | null; meta?: Record<string, unknown> }) => Promise<boolean>;
  deleteFAQ: (id: string) => Promise<boolean>;
  reorderApprovedFAQs: (ids: string[]) => Promise<boolean>;
  // Contacts
  contactSubmissions: ContactSubmission[];
  submitContact: (name: string, email: string, message: string, phone?: string) => void;
  updateContactStatus: (id: string, status: ContactSubmission['status']) => Promise<boolean>;
  deleteContact: (id: string) => Promise<boolean>;

  setAdminAccessToken: (token?: string) => void;
  // Audit
  auditLog: Array<{ id: string; action: string; targetType?: string; targetId?: string; actor?: string; details?: Record<string, unknown>; createdAt: number }>;
  logAudit: (action: string, targetType?: string, targetId?: string, details?: Record<string, unknown>) => void;
  exportAudit: () => void;
  // Stats
  stats: {
    reviews: { pending: number; approved: number; total: number };
    faqs: { pending: number; approved: number; total: number };
    contacts: { new: number; contacted: number; resolved: number; total: number };
  };
}

const DataStoreContext = createContext<DataStoreContextValue | undefined>(undefined);

const LS_REVIEWS_PENDING = 'cd_pending_reviews';
const LS_REVIEWS_APPROVED = 'cd_approved_reviews';
const LS_FAQS_PENDING = 'cd_pending_faqs';
const LS_FAQS_APPROVED = 'cd_approved_faqs';
const LS_CONTACTS = 'cd_contact_submissions';
const LS_AUDIT = 'cd_audit_log';

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

function extractMeta<T extends Record<string, any>>(row: any): T {
  const meta = row?.meta;
  if (meta && typeof meta === 'object' && !Array.isArray(meta)) return meta as T;
  return {} as T;
}

function applyReviewPatchLocal(r: ReviewSubmission, patch: { name?: string; message?: string; meta?: Record<string, unknown> }) {
  const meta = (patch.meta || {}) as any;
  return {
    ...r,
    ...(patch.name !== undefined ? { name: patch.name } : null),
    ...(patch.message !== undefined ? { message: patch.message } : null),
    ...(typeof meta.rating === 'number' ? { rating: meta.rating } : null),
    ...(typeof meta.date === 'string' ? { date: meta.date } : null),
    ...(typeof meta.avatar === 'string' ? { avatar: meta.avatar } : null),
    ...(typeof meta.color === 'string' ? { color: meta.color } : null),
    ...(typeof meta.order === 'number' ? { order: meta.order } : null),
  } as ReviewSubmission;
}

function applyFaqPatchLocal(f: FAQSubmission, patch: { name?: string; question?: string; answer?: string | null; meta?: Record<string, unknown> }) {
  const meta = (patch.meta || {}) as any;
  return {
    ...f,
    ...(patch.name !== undefined ? { name: patch.name } : null),
    ...(patch.question !== undefined ? { question: patch.question } : null),
    ...(patch.answer !== undefined ? { answer: patch.answer || undefined } : null),
    ...(typeof meta.date === 'string' ? { date: meta.date } : null),
    ...(typeof meta.avatar === 'string' ? { avatar: meta.avatar } : null),
    ...(typeof meta.color === 'string' ? { color: meta.color } : null),
    ...(typeof meta.order === 'number' ? { order: meta.order } : null),
  } as FAQSubmission;
}

function mapReviewRow(row: any): ReviewSubmission {
  const meta = extractMeta<any>(row);
  return {
    id: String(row.id),
    name: String(row.name || ''),
    email: String(row.email || ''),
    message: String(row.message || ''),
    createdAt: Date.parse(row.created_at || row.createdAt || new Date().toISOString()),
    status: (row.status || 'pending') as ModerationStatus,
    rating: typeof meta.rating === 'number' ? meta.rating : undefined,
    date: typeof meta.date === 'string' ? meta.date : undefined,
    avatar: typeof meta.avatar === 'string' ? meta.avatar : undefined,
    color: typeof meta.color === 'string' ? meta.color : undefined,
    order: typeof meta.order === 'number' ? meta.order : undefined,
  };
}

function mapFaqRow(row: any): FAQSubmission {
  const meta = extractMeta<any>(row);
  return {
    id: String(row.id),
    name: String(row.name || ''),
    email: String(row.email || ''),
    question: String(row.question || ''),
    answer: row.answer ? String(row.answer) : undefined,
    createdAt: Date.parse(row.created_at || row.createdAt || new Date().toISOString()),
    status: (row.status || 'pending') as ModerationStatus,
    date: typeof meta.date === 'string' ? meta.date : undefined,
    avatar: typeof meta.avatar === 'string' ? meta.avatar : undefined,
    color: typeof meta.color === 'string' ? meta.color : undefined,
    order: typeof meta.order === 'number' ? meta.order : undefined,
  };
}

function mapContactRow(row: any): ContactSubmission {
  return {
    id: String(row.id),
    name: String(row.name || ''),
    email: String(row.email || ''),
    phone: row.phone ? String(row.phone) : undefined,
    message: String(row.message || ''),
    createdAt: Date.parse(row.created_at || row.createdAt || new Date().toISOString()),
    status: (row.status || 'new') as any,
  };
}

function mapAuditRow(row: any) {
  return {
    id: String(row.id),
    action: String(row.action || ''),
    targetType: row.target_type ? String(row.target_type) : undefined,
    targetId: row.target_id ? String(row.target_id) : undefined,
    actor: row.admin_user_id ? String(row.admin_user_id) : 'admin',
    details: (row.diff && typeof row.diff === 'object') ? row.diff : {},
    createdAt: Date.parse(row.created_at || new Date().toISOString()),
  };
}

export function DataStoreProvider({ children }: { children: React.ReactNode }) {
  const [pendingReviews, setPendingReviews] = useState<ReviewSubmission[]>([]);
  const [approvedReviews, setApprovedReviews] = useState<ReviewSubmission[]>([]);
  const [pendingFAQs, setPendingFAQs] = useState<FAQSubmission[]>([]);
  const [approvedFAQs, setApprovedFAQs] = useState<FAQSubmission[]>([]);
  const [contactSubmissions, setContactSubmissions] = useState<ContactSubmission[]>([]);

  const [adminAccessToken, setAdminAccessTokenState] = useState<string | undefined>(undefined);

  const setAdminAccessToken = (token?: string) => {
    setAdminAccessTokenState(token);
  };

  const [auditLog, setAuditLog] = useState<Array<{ id: string; action: string; targetType?: string; targetId?: string; actor?: string; details?: Record<string, unknown>; createdAt: number }>>([]);

  useEffect(() => { try { const raw = localStorage.getItem(LS_AUDIT); if (raw) setAuditLog(JSON.parse(raw)); } catch {} }, []);
  useEffect(() => { try { localStorage.setItem(LS_AUDIT, JSON.stringify(auditLog)); } catch {} }, [auditLog]);

  useEffect(() => {
    if (!adminAccessToken) return;
    let cancelled = false;

    void (async () => {
      try {
        const headers = { Authorization: `Bearer ${adminAccessToken}` };
        const res = await apiJson<{ ok: true; rows: any[] }>('/api/admin/audit?limit=500', { headers });
        if (cancelled) return;
        setAuditLog((res.rows || []).map(mapAuditRow));
      } catch {
        // fallback to local audit log
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [adminAccessToken]);

  async function logAudit(action: string, targetType?: string, targetId?: string, details?: Record<string, unknown>) {
    const entry = { id: crypto.randomUUID(), action, targetType, targetId, actor: adminAccessToken ? 'admin' : 'local', details: details || {}, createdAt: Date.now() };
    setAuditLog(prev => [entry, ...prev]);
    if (!adminAccessToken) return;
    try {
      await apiJson<{ ok: true }>('/api/admin/audit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${adminAccessToken}` },
        body: JSON.stringify(entry),
      });
    } catch {
      // best-effort
    }
  }

  function exportAudit() {
    const payload = JSON.stringify(auditLog, null, 2);
    const blob = new Blob([payload], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `audit-${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);
  }

  useEffect(() => {
    let cancelled = false;

    // Load public (approved) data from server first.
    void (async () => {
      try {
        const [reviews, faqs] = await Promise.all([
          apiJson<{ ok: true; rows: any[] }>('/api/public/reviews?status=approved&limit=200'),
          apiJson<{ ok: true; rows: any[] }>('/api/public/faqs?status=approved&limit=200'),
        ]);

        if (cancelled) return;
        const ar = (reviews.rows || []).map(mapReviewRow);
        ar.sort((a, b) => (a.order ?? 1e9) - (b.order ?? 1e9));
        setApprovedReviews(ar);

        const af = (faqs.rows || []).map(mapFaqRow);
        af.sort((a, b) => (a.order ?? 1e9) - (b.order ?? 1e9));
        setApprovedFAQs(af);
      } catch {
        // Fallback to localStorage.
        try {
          const pr = localStorage.getItem(LS_REVIEWS_PENDING);
          const ar = localStorage.getItem(LS_REVIEWS_APPROVED);
          const pf = localStorage.getItem(LS_FAQS_PENDING);
          const af = localStorage.getItem(LS_FAQS_APPROVED);
          const cs = localStorage.getItem(LS_CONTACTS);
          if (pr) setPendingReviews(JSON.parse(pr));
          if (ar) setApprovedReviews(JSON.parse(ar));
          if (pf) setPendingFAQs(JSON.parse(pf));
          if (af) setApprovedFAQs(JSON.parse(af));
          if (cs) setContactSubmissions(JSON.parse(cs));
        } catch {
          // ignore
        }
      }
    })();

    return () => {
      cancelled = true;
    };
  }, []);

  // When admin token is available, load moderation queues from server.
  useEffect(() => {
    if (!adminAccessToken) return;
    let cancelled = false;

    void (async () => {
      try {
        const headers = { Authorization: `Bearer ${adminAccessToken}` };
        const [pendingReviewsRes, pendingFaqsRes, approvedReviewsRes, approvedFaqsRes, contacts] = await Promise.all([
          apiJson<{ ok: true; rows: any[] }>('/api/admin/reviews?status=pending', { headers }),
          apiJson<{ ok: true; rows: any[] }>('/api/admin/faqs?status=pending', { headers }),
          apiJson<{ ok: true; rows: any[] }>('/api/admin/reviews?status=approved', { headers }),
          apiJson<{ ok: true; rows: any[] }>('/api/admin/faqs?status=approved', { headers }),
          apiJson<{ ok: true; rows: any[] }>('/api/admin/contacts', { headers }),
        ]);
        if (cancelled) return;
        setPendingReviews((pendingReviewsRes.rows || []).map(mapReviewRow));
        setPendingFAQs((pendingFaqsRes.rows || []).map(mapFaqRow));

        const ar = (approvedReviewsRes.rows || []).map(mapReviewRow);
        ar.sort((a, b) => (a.order ?? 1e9) - (b.order ?? 1e9));
        setApprovedReviews(ar);

        const af = (approvedFaqsRes.rows || []).map(mapFaqRow);
        af.sort((a, b) => (a.order ?? 1e9) - (b.order ?? 1e9));
        setApprovedFAQs(af);
        setContactSubmissions((contacts.rows || []).map(mapContactRow));
      } catch {
        // ignore (admin can still work in fallback/local mode)
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [adminAccessToken]);

  useEffect(() => { try { localStorage.setItem(LS_REVIEWS_PENDING, JSON.stringify(pendingReviews)); } catch {} }, [pendingReviews]);
  useEffect(() => { try { localStorage.setItem(LS_REVIEWS_APPROVED, JSON.stringify(approvedReviews)); } catch {} }, [approvedReviews]);
  useEffect(() => { try { localStorage.setItem(LS_FAQS_PENDING, JSON.stringify(pendingFAQs)); } catch {} }, [pendingFAQs]);
  useEffect(() => { try { localStorage.setItem(LS_FAQS_APPROVED, JSON.stringify(approvedFAQs)); } catch {} }, [approvedFAQs]);
  useEffect(() => { try { localStorage.setItem(LS_CONTACTS, JSON.stringify(contactSubmissions)); } catch {} }, [contactSubmissions]);

  function submitReview(name: string, email: string, message: string) {
    const item: ReviewSubmission = {
      id: crypto.randomUUID(),
      name, email, message,
      createdAt: Date.now(),
      status: 'pending',
    };
    setPendingReviews(prev => [item, ...prev]);
    void logAudit?.('submit_review', 'review', item.id, { name, email });

    // Try server submit (best-effort).
    void apiJson<{ ok: true; id: string; created_at: string }>('/api/public/reviews', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, email, message }),
    }).then((resp) => {
      const createdAt = Date.parse(resp.created_at);
      setPendingReviews((prev) => prev.map((r) => (r.id === item.id ? { ...r, id: resp.id, createdAt } : r)));
    }).catch(() => {
      // keep local item
    });
  }

  async function approveReview(id: string) {
    const item = pendingReviews.find((i) => i.id === id);
    if (!item) return false;

    // optimistic
    setPendingReviews((prev) => prev.filter((i) => i.id !== id));
    setApprovedReviews((a) => [{ ...item, status: 'approved' }, ...a]);
    void logAudit?.('approve_review', 'review', id);

    if (!adminAccessToken) return true;
    try {
      await apiJson<{ ok: true }>('/api/admin/reviews', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${adminAccessToken}` },
        body: JSON.stringify({ id, status: 'approved' }),
      });

      return true;
    } catch {
      // rollback
      setApprovedReviews((prev) => prev.filter((r) => r.id !== id));
      setPendingReviews((prev) => [item, ...prev]);
      return false;
    }
  }

  async function rejectReview(id: string) {
    const item = pendingReviews.find((i) => i.id === id);
    if (!item) return false;

    setPendingReviews((prev) => prev.filter((i) => i.id !== id));
    void logAudit?.('reject_review', 'review', id);

    if (!adminAccessToken) return true;
    try {
      await apiJson<{ ok: true }>('/api/admin/reviews', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${adminAccessToken}` },
        body: JSON.stringify({ id, status: 'rejected' }),
      });
      return true;
    } catch {
      setPendingReviews((prev) => [item, ...prev]);
      return false;
    }
  }

  async function updateReview(id: string, patch: { name?: string; message?: string; meta?: Record<string, unknown> }) {
    if (!adminAccessToken) return true;
    try {
      await apiJson<{ ok: true }>('/api/admin/reviews', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${adminAccessToken}` },
        body: JSON.stringify({ id, ...patch }),
      });
      setApprovedReviews((prev) => prev.map((r) => (r.id === id ? applyReviewPatchLocal(r, patch) : r)));
      setPendingReviews((prev) => prev.map((r) => (r.id === id ? applyReviewPatchLocal(r, patch) : r)));
      return true;
    } catch {
      return false;
    }
  }

  async function deleteReview(id: string) {
    const prevApproved = approvedReviews;
    const prevPending = pendingReviews;
    setApprovedReviews((prev) => prev.filter((r) => r.id !== id));
    setPendingReviews((prev) => prev.filter((r) => r.id !== id));
    void logAudit?.('delete_review', 'review', id);

    if (!adminAccessToken) return true;
    try {
      await apiJson<{ ok: true }>(`/api/admin/reviews?id=${encodeURIComponent(id)}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${adminAccessToken}` },
      });
      return true;
    } catch {
      setApprovedReviews(prevApproved);
      setPendingReviews(prevPending);
      return false;
    }
  }

  async function reorderApprovedReviews(ids: string[]) {
    const prev = approvedReviews;
    const index = new Map(ids.map((rid, i) => [rid, i]));
    setApprovedReviews((cur) => cur.slice().sort((a, b) => (index.get(a.id) ?? 1e9) - (index.get(b.id) ?? 1e9)));

    if (!adminAccessToken) return true;
    try {
      await apiJson<{ ok: true }>('/api/admin/reviews/reorder', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${adminAccessToken}` },
        body: JSON.stringify({ ids }),
      });
      return true;
    } catch {
      setApprovedReviews(prev);
      return false;
    }
  }

  function submitQuestion(name: string, email: string, question: string) {
    const item: FAQSubmission = {
      id: crypto.randomUUID(),
      name, email, question,
      createdAt: Date.now(),
      status: 'pending',
    };
    setPendingFAQs(prev => [item, ...prev]);
    void logAudit?.('submit_faq', 'faq', item.id, { name, email });

    void apiJson<{ ok: true; id: string; created_at: string }>('/api/public/faqs', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, email, question }),
    }).then((resp) => {
      const createdAt = Date.parse(resp.created_at);
      setPendingFAQs((prev) => prev.map((f) => (f.id === item.id ? { ...f, id: resp.id, createdAt } : f)));
    }).catch(() => {
      // keep local item
    });
  }

  async function approveFAQ(id: string, answer?: string) {
    const item = pendingFAQs.find((i) => i.id === id);
    if (!item) return false;

    const approved = { ...item, answer: answer || item.answer || '', status: 'approved' as const };
    setPendingFAQs((prev) => prev.filter((i) => i.id !== id));
    setApprovedFAQs((a) => [approved, ...a]);
    void logAudit?.('approve_faq', 'faq', id);

    if (!adminAccessToken) return true;
    try {
      await apiJson<{ ok: true }>('/api/admin/faqs', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${adminAccessToken}` },
        body: JSON.stringify({ id, status: 'approved', answer: approved.answer }),
      });
      return true;
    } catch {
      setApprovedFAQs((prev) => prev.filter((f) => f.id !== id));
      setPendingFAQs((prev) => [item, ...prev]);
      return false;
    }
  }

  async function rejectFAQ(id: string) {
    const item = pendingFAQs.find((i) => i.id === id);
    if (!item) return false;

    setPendingFAQs((prev) => prev.filter((i) => i.id !== id));
    void logAudit?.('reject_faq', 'faq', id);

    if (!adminAccessToken) return true;
    try {
      await apiJson<{ ok: true }>('/api/admin/faqs', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${adminAccessToken}` },
        body: JSON.stringify({ id, status: 'rejected' }),
      });
      return true;
    } catch {
      setPendingFAQs((prev) => [item, ...prev]);
      return false;
    }
  }

  async function updateFAQ(id: string, patch: { name?: string; question?: string; answer?: string | null; meta?: Record<string, unknown> }) {
    if (!adminAccessToken) return true;
    try {
      await apiJson<{ ok: true }>('/api/admin/faqs', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${adminAccessToken}` },
        body: JSON.stringify({ id, ...patch }),
      });
      setApprovedFAQs((prev) => prev.map((f) => (f.id === id ? applyFaqPatchLocal(f, patch) : f)));
      setPendingFAQs((prev) => prev.map((f) => (f.id === id ? applyFaqPatchLocal(f, patch) : f)));
      return true;
    } catch {
      return false;
    }
  }

  async function deleteFAQ(id: string) {
    const prevApproved = approvedFAQs;
    const prevPending = pendingFAQs;
    setApprovedFAQs((prev) => prev.filter((f) => f.id !== id));
    setPendingFAQs((prev) => prev.filter((f) => f.id !== id));
    void logAudit?.('delete_faq', 'faq', id);

    if (!adminAccessToken) return true;
    try {
      await apiJson<{ ok: true }>(`/api/admin/faqs?id=${encodeURIComponent(id)}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${adminAccessToken}` },
      });
      return true;
    } catch {
      setApprovedFAQs(prevApproved);
      setPendingFAQs(prevPending);
      return false;
    }
  }

  async function reorderApprovedFAQs(ids: string[]) {
    const prev = approvedFAQs;
    const index = new Map(ids.map((fid, i) => [fid, i]));
    setApprovedFAQs((cur) => cur.slice().sort((a, b) => (index.get(a.id) ?? 1e9) - (index.get(b.id) ?? 1e9)));

    if (!adminAccessToken) return true;
    try {
      await apiJson<{ ok: true }>('/api/admin/faqs/reorder', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${adminAccessToken}` },
        body: JSON.stringify({ ids }),
      });
      return true;
    } catch {
      setApprovedFAQs(prev);
      return false;
    }
  }

  function submitContact(name: string, email: string, message: string, phone?: string) {
    const item: ContactSubmission = {
      id: crypto.randomUUID(),
      name, email, message,
      phone,
      createdAt: Date.now(),
      status: 'new',
    };
    setContactSubmissions(prev => [item, ...prev]);
    void logAudit?.('submit_contact', 'contact', item.id, { name, email, phone });

    void apiJson<{ ok: true; id: string; created_at: string }>('/api/public/contact', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, email, phone: phone || null, message }),
    }).then((resp) => {
      const createdAt = Date.parse(resp.created_at);
      setContactSubmissions((prev) => prev.map((c) => (c.id === item.id ? { ...c, id: resp.id, createdAt } : c)));
    }).catch(() => {
      // keep local item
    });
  }

  async function updateContactStatus(id: string, status: ContactSubmission['status']) {
    const prevItem = contactSubmissions.find((c) => c.id === id);
    if (!prevItem) return false;

    setContactSubmissions((prev) => prev.map((item) => (item.id === id ? { ...item, status } : item)));
    void logAudit?.('update_contact_status', 'contact', id, { status });

    if (!adminAccessToken) return true;
    try {
      await apiJson<{ ok: true }>('/api/admin/contacts', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${adminAccessToken}` },
        body: JSON.stringify({ id, status }),
      });
      return true;
    } catch {
      setContactSubmissions((prev) => prev.map((item) => (item.id === id ? prevItem : item)));
      return false;
    }
  }

  async function deleteContact(id: string) {
    const prevItem = contactSubmissions.find((c) => c.id === id);
    if (!prevItem) return false;

    setContactSubmissions((prev) => prev.filter((i) => i.id !== id));
    void logAudit?.('delete_contact', 'contact', id);

    if (!adminAccessToken) return true;
    try {
      await apiJson<{ ok: true }>(`/api/admin/contacts?id=${encodeURIComponent(id)}` , {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${adminAccessToken}` },
      });
      return true;
    } catch {
      setContactSubmissions((prev) => [prevItem, ...prev]);
      return false;
    }
  }

  const stats = useMemo(() => {
    const contactsByStatus = contactSubmissions.reduce((acc, c) => {
      acc[c.status] = (acc[c.status] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
    
    return {
      reviews: { pending: pendingReviews.length, approved: approvedReviews.length, total: pendingReviews.length + approvedReviews.length },
      faqs: { pending: pendingFAQs.length, approved: approvedFAQs.length, total: pendingFAQs.length + approvedFAQs.length },
      contacts: { 
        new: contactsByStatus.new || 0, 
        contacted: contactsByStatus.contacted || 0, 
        resolved: contactsByStatus.resolved || 0, 
        total: contactSubmissions.length 
      },
    };
  }, [pendingReviews, approvedReviews, pendingFAQs, approvedFAQs, contactSubmissions]);

  const value: DataStoreContextValue = useMemo(() => ({
    pendingReviews, approvedReviews, submitReview, approveReview, rejectReview, updateReview, deleteReview, reorderApprovedReviews,
    pendingFAQs, approvedFAQs, submitQuestion, approveFAQ, rejectFAQ, updateFAQ, deleteFAQ, reorderApprovedFAQs,
    contactSubmissions, submitContact, updateContactStatus, deleteContact,
    setAdminAccessToken,
    auditLog,
    logAudit,
    exportAudit,
    stats,
  }), [
    pendingReviews,
    approvedReviews,
    pendingFAQs,
    approvedFAQs,
    contactSubmissions,
    auditLog,
    stats,
  ]);

  return (
    <DataStoreContext.Provider value={value}>{children}</DataStoreContext.Provider>
  );
}

export function useDataStore() {
  const ctx = useContext(DataStoreContext);
  if (!ctx) throw new Error('useDataStore must be used within DataStoreProvider');
  return ctx;
}
