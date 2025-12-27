import { createContext, useContext, useEffect, useMemo, useState } from 'react';

export type ModerationStatus = 'pending' | 'approved' | 'rejected';

export interface ReviewSubmission {
  id: string;
  name: string;
  email: string;
  message: string;
  createdAt: number;
  status: ModerationStatus;
}

export interface FAQSubmission {
  id: string;
  name: string;
  email: string;
  question: string;
  answer?: string;
  createdAt: number;
  status: ModerationStatus;
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
  // FAQ
  pendingFAQs: FAQSubmission[];
  approvedFAQs: FAQSubmission[];
  submitQuestion: (name: string, email: string, question: string) => void;
  approveFAQ: (id: string, answer?: string) => Promise<boolean>;
  rejectFAQ: (id: string) => Promise<boolean>;
  // Contacts
  contactSubmissions: ContactSubmission[];
  submitContact: (name: string, email: string, message: string, phone?: string) => void;
  updateContactStatus: (id: string, status: ContactSubmission['status']) => Promise<boolean>;
  deleteContact: (id: string) => Promise<boolean>;

  setAdminAccessToken: (token?: string) => void;
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

function mapReviewRow(row: any): ReviewSubmission {
  return {
    id: String(row.id),
    name: String(row.name || ''),
    email: String(row.email || ''),
    message: String(row.message || ''),
    createdAt: Date.parse(row.created_at || row.createdAt || new Date().toISOString()),
    status: (row.status || 'pending') as ModerationStatus,
  };
}

function mapFaqRow(row: any): FAQSubmission {
  return {
    id: String(row.id),
    name: String(row.name || ''),
    email: String(row.email || ''),
    question: String(row.question || ''),
    answer: row.answer ? String(row.answer) : undefined,
    createdAt: Date.parse(row.created_at || row.createdAt || new Date().toISOString()),
    status: (row.status || 'pending') as ModerationStatus,
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
        setApprovedReviews((reviews.rows || []).map(mapReviewRow));
        setApprovedFAQs((faqs.rows || []).map(mapFaqRow));
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
        const [reviews, faqs, contacts] = await Promise.all([
          apiJson<{ ok: true; rows: any[] }>('/api/admin/reviews?status=pending', { headers }),
          apiJson<{ ok: true; rows: any[] }>('/api/admin/faqs?status=pending', { headers }),
          apiJson<{ ok: true; rows: any[] }>('/api/admin/contacts', { headers }),
        ]);
        if (cancelled) return;
        setPendingReviews((reviews.rows || []).map(mapReviewRow));
        setPendingFAQs((faqs.rows || []).map(mapFaqRow));
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

  function submitQuestion(name: string, email: string, question: string) {
    const item: FAQSubmission = {
      id: crypto.randomUUID(),
      name, email, question,
      createdAt: Date.now(),
      status: 'pending',
    };
    setPendingFAQs(prev => [item, ...prev]);

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

  function submitContact(name: string, email: string, message: string, phone?: string) {
    const item: ContactSubmission = {
      id: crypto.randomUUID(),
      name, email, message,
      phone,
      createdAt: Date.now(),
      status: 'new',
    };
    setContactSubmissions(prev => [item, ...prev]);

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
    pendingReviews, approvedReviews, submitReview, approveReview, rejectReview,
    pendingFAQs, approvedFAQs, submitQuestion, approveFAQ, rejectFAQ,
    contactSubmissions, submitContact, updateContactStatus, deleteContact,
    setAdminAccessToken,
    stats,
  }), [pendingReviews, approvedReviews, pendingFAQs, approvedFAQs, contactSubmissions, stats]);

  return (
    <DataStoreContext.Provider value={value}>{children}</DataStoreContext.Provider>
  );
}

export function useDataStore() {
  const ctx = useContext(DataStoreContext);
  if (!ctx) throw new Error('useDataStore must be used within DataStoreProvider');
  return ctx;
}
