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
  message: string;
  createdAt: number;
  status: 'new' | 'contacted' | 'resolved';
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
  // Contacts
  contactSubmissions: ContactSubmission[];
  submitContact: (name: string, email: string, message: string) => void;
  updateContactStatus: (id: string, status: ContactSubmission['status']) => void;
  deleteContact: (id: string) => void;
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

export function DataStoreProvider({ children }: { children: React.ReactNode }) {
  const [pendingReviews, setPendingReviews] = useState<ReviewSubmission[]>([]);
  const [approvedReviews, setApprovedReviews] = useState<ReviewSubmission[]>([]);
  const [pendingFAQs, setPendingFAQs] = useState<FAQSubmission[]>([]);
  const [approvedFAQs, setApprovedFAQs] = useState<FAQSubmission[]>([]);
  const [contactSubmissions, setContactSubmissions] = useState<ContactSubmission[]>([]);

  useEffect(() => {
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
    } catch {}
  }, []);

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

  function submitContact(name: string, email: string, message: string) {
    const item: ContactSubmission = {
      id: crypto.randomUUID(),
      name, email, message,
      createdAt: Date.now(),
      status: 'new',
    };
    setContactSubmissions(prev => [item, ...prev]);
  }

  function updateContactStatus(id: string, status: ContactSubmission['status']) {
    setContactSubmissions(prev => prev.map(item => item.id === id ? { ...item, status } : item));
  }

  function deleteContact(id: string) {
    setContactSubmissions(prev => prev.filter(i => i.id !== id));
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
