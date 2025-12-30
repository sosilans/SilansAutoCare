import React from 'react';
import { render, screen, act } from '@testing-library/react';
import { vi, describe, it, expect, beforeEach, afterEach } from 'vitest';
import { DataStoreProvider, useDataStore } from '../DataStoreContext';

function Harness() {
  const ds = useDataStore();
  // expose for tests
  (window as any).__ds = ds;
  return (
    <div>
      <div data-testid="pending-reviews">{ds.pendingReviews.length}</div>
      <div data-testid="approved-reviews">{ds.approvedReviews.length}</div>
      <div data-testid="contacts">{ds.contactSubmissions.length}</div>
    </div>
  );
}

describe('Admin flows (DataStoreContext)', () => {
  beforeEach(() => {
    localStorage.clear();
    // simple in-memory mock DB for reviews and contacts so admin fetches pick up submitted items
    const mockReviews: any[] = [];
    const mockContacts: any[] = [];

    vi.stubGlobal('fetch', vi.fn(async (url, init) => {
      const s = String(url || '');
      const method = (init && (init as any).method) || 'GET';

      // Public review submit
      if (s.includes('/api/public/reviews') && method === 'POST') {
        const body = init && init.body ? JSON.parse(String((init as any).body)) : {};
        const id = `srv-${Date.now()}`;
        const row = { id, name: body.name, email: body.email, message: body.message, status: 'pending', created_at: new Date().toISOString() };
        mockReviews.unshift(row);
        return new Response(JSON.stringify({ ok: true, id, created_at: row.created_at }), { status: 200 });
      }

      // Admin list pending reviews
      if (s.includes('/api/admin/reviews') && s.includes('status=pending') && method === 'GET') {
        return new Response(JSON.stringify({ ok: true, rows: mockReviews }), { status: 200 });
      }

      // Admin patch review (approve/reject)
      if (s.includes('/api/admin/reviews') && method === 'PATCH') {
        const body = init && init.body ? JSON.parse(String((init as any).body)) : {};
        const id = body.id;
        const found = mockReviews.find((r) => String(r.id) === String(id));
        if (found) found.status = body.status || found.status;
        return new Response(JSON.stringify({ ok: true }), { status: 200 });
      }

      // Admin delete review
      if (s.includes('/api/admin/reviews') && method === 'DELETE') {
        return new Response(JSON.stringify({ ok: true }), { status: 200 });
      }

      // Public contact
      if (s.includes('/api/public/contact') && method === 'POST') {
        const body = init && init.body ? JSON.parse(String((init as any).body)) : {};
        const id = `c-${Date.now()}`;
        const row = { id, name: body.name, email: body.email, phone: body.phone, message: body.message, status: 'new', created_at: new Date().toISOString() };
        mockContacts.unshift(row);
        return new Response(JSON.stringify({ ok: true, id, created_at: row.created_at }), { status: 200 });
      }

      // Admin list contacts
      if (s.includes('/api/admin/contacts') && method === 'GET') {
        return new Response(JSON.stringify({ ok: true, rows: mockContacts }), { status: 200 });
      }

      // Admin patch contact
      if (s.includes('/api/admin/contacts') && method === 'PATCH') {
        const body = init && init.body ? JSON.parse(String((init as any).body)) : {};
        const id = body.id;
        const found = mockContacts.find((c) => String(c.id) === String(id));
        if (found) found.status = body.status || found.status;
        return new Response(JSON.stringify({ ok: true }), { status: 200 });
      }

      // Admin delete contact
      if (s.includes('/api/admin/contacts') && method === 'DELETE') {
        return new Response(JSON.stringify({ ok: true }), { status: 200 });
      }

      // admin fetches for approved lists
      if (s.includes('/api/admin/reviews') && s.includes('status=approved') && method === 'GET') {
        return new Response(JSON.stringify({ ok: true, rows: mockReviews.filter(r => r.status === 'approved') }), { status: 200 });
      }

      // public approved fetch
      if (s.includes('/api/public/reviews') && s.includes('status=approved') && method === 'GET') {
        return new Response(JSON.stringify({ ok: true, rows: mockReviews.filter(r => r.status === 'approved') }), { status: 200 });
      }

      if (s.includes('/api/public/faqs') && method === 'GET') return new Response(JSON.stringify({ ok: true, rows: [] }), { status: 200 });

      // default
      return new Response(JSON.stringify({ ok: true, rows: [] }), { status: 200 });
    }));
  });

  afterEach(() => {
    vi.restoreAllMocks();
    delete (window as any).__ds;
  });

  it('submitReview then approveReview locally (no admin token)', async () => {
    render(
      <DataStoreProvider>
        <Harness />
      </DataStoreProvider>
    );

    // submit review (will add to pending)
    await act(async () => {
      await (window as any).__ds.submitReview('Alice', 'a@example.com', 'Hello');
    });

    expect(screen.getByTestId('pending-reviews').textContent).toBe('1');

    // approve locally (no admin token) should move to approved
    let ok: boolean = false;
    await act(async () => {
      ok = await (window as any).__ds.approveReview((window as any).__ds.pendingReviews[0].id);
    });

    expect(ok).toBe(true);
    expect(screen.getByTestId('pending-reviews').textContent).toBe('0');
    expect(screen.getByTestId('approved-reviews').textContent).toBe('1');
  });

  it('approveReview with admin token calls server and succeeds', async () => {
    render(
      <DataStoreProvider>
        <Harness />
      </DataStoreProvider>
    );

    // Add pending review
    await act(async () => {
      await (window as any).__ds.submitReview('Bob', 'b@example.com', 'Hi');
    });
    // wait for pending to appear
    await screen.findByTestId('pending-reviews');
    await (async () => {
      // wait until count is 1 to avoid race
      const { waitFor } = await import('@testing-library/react');
      await waitFor(() => expect(screen.getByTestId('pending-reviews').textContent).toBe('1'));
    })();

    // set admin token so remote call is attempted
    await act(async () => {
      (window as any).__ds.setAdminAccessToken('admin-token');
      // allow the provider effect to pick up token (no-op here)
    });

    const id = (window as any).__ds.pendingReviews[0].id;
    const res = await act(async () => {
      return await (window as any).__ds.approveReview(id);
    });

    expect(res).toBe(true);
    expect(screen.getByTestId('approved-reviews').textContent).toBe('1');
  });

  it('approveReview with admin token and server failure rolls back', async () => {
    // make PATCH failing by wrapping the existing stub: only return 500 for admin review PATCH
    const originalFetch = (global as any).fetch;
    vi.stubGlobal('fetch', vi.fn(async (url, init) => {
      const s = String(url || '');
      const method = (init && (init as any).method) || 'GET';
      if (s.includes('/api/admin/reviews') && method === 'PATCH') {
        return new Response('Server error', { status: 500 });
      }
      return originalFetch(url, init);
    }));

    render(
      <DataStoreProvider>
        <Harness />
      </DataStoreProvider>
    );

    await act(async () => {
      await (window as any).__ds.submitReview('Carol', 'c@example.com', 'Hey');
    });
    await screen.findByTestId('pending-reviews');
    await (async () => {
      const { waitFor } = await import('@testing-library/react');
      await waitFor(() => expect(screen.getByTestId('pending-reviews').textContent).toBe('1'));
    })();

    await act(async () => {
      (window as any).__ds.setAdminAccessToken('admin-token');
    });

    const id = (window as any).__ds.pendingReviews[0].id;
    const result = await act(async () => {
      return await (window as any).__ds.approveReview(id);
    });

    expect(result).toBe(false);
    // rollback: pending should be restored
    expect(screen.getByTestId('pending-reviews').textContent).toBe('1');
    expect(screen.getByTestId('approved-reviews').textContent).toBe('0');
  });

  it('updateContactStatus and deleteContact behave correctly with and without admin token', async () => {
    render(
      <DataStoreProvider>
        <Harness />
      </DataStoreProvider>
    );

    // submit contact
    await act(async () => {
      await (window as any).__ds.submitContact('Dave', 'd@example.com', 'Need help', '555');
    });
    await screen.findByTestId('contacts');
    expect(screen.getByTestId('contacts').textContent).toBe('1');

    const cid = (window as any).__ds.contactSubmissions[0].id;

    // update status locally (no admin token)
    let ok = await act(async () => {
      return await (window as any).__ds.updateContactStatus(cid, 'contacted');
    });
    expect(ok).toBe(true);
    expect((window as any).__ds.contactSubmissions[0].status).toBe('contacted');

    // set admin token and ensure server call succeeds
    await act(async () => {
      (window as any).__ds.setAdminAccessToken('admin-token');
    });

    ok = await act(async () => {
      return await (window as any).__ds.updateContactStatus(cid, 'resolved');
    });
    expect(ok).toBe(true);
    expect((window as any).__ds.contactSubmissions[0].status).toBe('resolved');

    // delete contact with admin token (server stub returns ok)
    const del = await act(async () => {
      return await (window as any).__ds.deleteContact(cid);
    });
    expect(del).toBe(true);
    expect(screen.getByTestId('contacts').textContent).toBe('0');
  });
});
