(async function(){
  const endpoints = [
    '/api/public/reviews?limit=2',
    '/api/public/faqs?limit=2',
    '/api/admin/audit',
    '/api/admin/users'
  ];
  const base = process.env.API_BASE || 'http://localhost:3000';
  const maybeFetch = typeof fetch === 'function' ? fetch : (await import('node:undici')).fetch;

  for (const p of endpoints) {
    try {
      const url = base + p;
      console.log('\n===', url, '===');
      const res = await maybeFetch(url, { method: 'GET' });
      console.log('status:', res.status);
      const ct = res.headers.get('content-type') || '';
      console.log('content-type:', ct);
      const text = await res.text();
      console.log('body (first 1000 chars):\n', text.slice(0, 1000));
    } catch (e) {
      console.error('ERROR fetching', p, e && e.message);
    }
  }
})();
