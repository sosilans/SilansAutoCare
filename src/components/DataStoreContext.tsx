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

interface DataStoreContextValue {
  // Reviews
  pendingReviews: ReviewSubmission[];
  approvedReviews: ReviewSubmission[];
  submitReview: (name: string, email: string, message: string) => void;
  approveReview: (id: string) => void;
  rejectReview: (id: string) => void;
  // FAQ
  pendingFAQs: FAQSubmission[];
  approvedFAQs: FAQSubmission[];
  submitQuestion: (name: string, email: string, question: string) => void;
  approveFAQ: (id: string, answer?: string) => void;
  rejectFAQ: (id: string) => void;
  // Stats
  stats: {
    reviews: { pending: number; approved: number; total: number };
    faqs: { pending: number; approved: number; total: number };
  };
}

const DataStoreContext = createContext<DataStoreContextValue | undefined>(undefined);

const LS_REVIEWS_PENDING = 'cd_pending_reviews';
const LS_REVIEWS_APPROVED = 'cd_approved_reviews';
const LS_FAQS_PENDING = 'cd_pending_faqs';
const LS_FAQS_APPROVED = 'cd_approved_faqs';

export function DataStoreProvider({ children }: { children: React.ReactNode }) {
  const [pendingReviews, setPendingReviews] = useState<ReviewSubmission[]>([]);
  const [approvedReviews, setApprovedReviews] = useState<ReviewSubmission[]>([]);
  const [pendingFAQs, setPendingFAQs] = useState<FAQSubmission[]>([]);
  const [approvedFAQs, setApprovedFAQs] = useState<FAQSubmission[]>([]);

  useEffect(() => {
    try {
      const pr = localStorage.getItem(LS_REVIEWS_PENDING);
      const ar = localStorage.getItem(LS_REVIEWS_APPROVED);
      const pf = localStorage.getItem(LS_FAQS_PENDING);
      const af = localStorage.getItem(LS_FAQS_APPROVED);
      if (pr) setPendingReviews(JSON.parse(pr));
      if (ar) setApprovedReviews(JSON.parse(ar));
      if (pf) setPendingFAQs(JSON.parse(pf));
      if (af) setApprovedFAQs(JSON.parse(af));
    } catch {}
  }, []);

  useEffect(() => { try { localStorage.setItem(LS_REVIEWS_PENDING, JSON.stringify(pendingReviews)); } catch {} }, [pendingReviews]);
  useEffect(() => { try { localStorage.setItem(LS_REVIEWS_APPROVED, JSON.stringify(approvedReviews)); } catch {} }, [approvedReviews]);
  useEffect(() => { try { localStorage.setItem(LS_FAQS_PENDING, JSON.stringify(pendingFAQs)); } catch {} }, [pendingFAQs]);
  useEffect(() => { try { localStorage.setItem(LS_FAQS_APPROVED, JSON.stringify(approvedFAQs)); } catch {} }, [approvedFAQs]);

  function submitReview(name: string, email: string, message: string) {
    const item: ReviewSubmission = {
      id: crypto.randomUUID(),
      name, email, message,
      createdAt: Date.now(),
      status: 'pending',
    };
    setPendingReviews(prev => [item, ...prev]);
  }

  function approveReview(id: string) {
    setPendingReviews(prev => {
      const item = prev.find(i => i.id === id);
      const rest = prev.filter(i => i.id !== id);
      if (item) setApprovedReviews(a => [{ ...item, status: 'approved' }, ...a]);
      return rest;
    });
  }

  function rejectReview(id: string) {
    setPendingReviews(prev => prev.filter(i => i.id !== id));
  }

  function submitQuestion(name: string, email: string, question: string) {
    const item: FAQSubmission = {
      id: crypto.randomUUID(),
      name, email, question,
      createdAt: Date.now(),
      status: 'pending',
    };
    setPendingFAQs(prev => [item, ...prev]);
  }

  function approveFAQ(id: string, answer?: string) {
    setPendingFAQs(prev => {
      const item = prev.find(i => i.id === id);
      const rest = prev.filter(i => i.id !== id);
      if (item) setApprovedFAQs(a => [{ ...item, answer: answer || item.answer || '', status: 'approved' }, ...a]);
      return rest;
    });
  }

  function rejectFAQ(id: string) {
    setPendingFAQs(prev => prev.filter(i => i.id !== id));
  }

  const stats = useMemo(() => ({
    reviews: { pending: pendingReviews.length, approved: approvedReviews.length, total: pendingReviews.length + approvedReviews.length },
    faqs: { pending: pendingFAQs.length, approved: approvedFAQs.length, total: pendingFAQs.length + approvedFAQs.length },
  }), [pendingReviews, approvedReviews, pendingFAQs, approvedFAQs]);

  const value: DataStoreContextValue = useMemo(() => ({
    pendingReviews, approvedReviews, submitReview, approveReview, rejectReview,
    pendingFAQs, approvedFAQs, submitQuestion, approveFAQ, rejectFAQ,
    stats,
  }), [pendingReviews, approvedReviews, pendingFAQs, approvedFAQs, stats]);

  return (
    <DataStoreContext.Provider value={value}>{children}</DataStoreContext.Provider>
  );
}

export function useDataStore() {
  const ctx = useContext(DataStoreContext);
  if (!ctx) throw new Error('useDataStore must be used within DataStoreProvider');
  return ctx;
}
