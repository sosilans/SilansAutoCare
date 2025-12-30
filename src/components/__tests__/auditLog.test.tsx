import React from 'react';
import { render, screen, act } from '@testing-library/react';
import { vi, describe, it, expect, beforeEach, afterEach } from 'vitest';
import { DataStoreProvider, useDataStore } from '../DataStoreContext';

function Harness() {
  const ds = useDataStore();
  (window as any).__ds = ds;
  return <div data-testid="audit-count">{ds.auditLog.length}</div>;
}

describe('Audit logging', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  afterEach(() => {
    vi.restoreAllMocks();
    delete (window as any).__ds;
  });

  it('logs locally without admin token and does not POST', async () => {
    const fetchSpy = vi.spyOn(global, 'fetch');

    render(
      <DataStoreProvider>
        <Harness />
      </DataStoreProvider>
    );

    await act(async () => {
      await (window as any).__ds.logAudit?.('test_action', 'test_type', 'obj-1', { note: 'local' });
    });

    expect(screen.getByTestId('audit-count').textContent).toBe('1');
    expect(fetchSpy).not.toHaveBeenCalledWith(expect.stringContaining('/api/admin/audit'), expect.anything());
  });

  it('posts audit entries when admin token is set', async () => {
    const calls: any[] = [];
    vi.stubGlobal('fetch', vi.fn(async (url, init) => {
      calls.push({ url: String(url), init });
      return new Response(JSON.stringify({ ok: true }), { status: 200 });
    }));

    render(
      <DataStoreProvider>
        <Harness />
      </DataStoreProvider>
    );

    await act(async () => {
      (window as any).__ds.setAdminAccessToken('admintoken');
    });

    await act(async () => {
      await (window as any).__ds.logAudit?.('server_action', 'server_type', 'obj-42', { a: 1 });
    });

    expect(screen.getByTestId('audit-count').textContent).toBe('1');
    // ensure a POST to admin audit endpoint happened
    expect(calls.some(c => c.url.includes('/api/admin/audit') && c.init && String(c.init.method || 'POST').toUpperCase() === 'POST')).toBe(true);
  });
});
