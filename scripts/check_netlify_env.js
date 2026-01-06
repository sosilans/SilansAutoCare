const required = [
  'VITE_SUPABASE_URL',
  'VITE_SUPABASE_ANON_KEY',
  'SUPABASE_URL',
  'SUPABASE_ANON_KEY',
  'SUPABASE_SERVICE_ROLE_KEY'
];

const missing = required.filter(k => !process.env[k]);
if (missing.length === 0) {
  console.log('OK — all required env vars are present.');
  process.exit(0);
}

console.error('Missing required environment variables:');
for (const k of missing) console.error(' -', k);
console.error('\nSet them in Netlify Site settings → Environment variables.');
process.exit(2);
