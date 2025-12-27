import postgres from 'postgres';

let sqlInstance: ReturnType<typeof postgres> | null = null;

export function getSql() {
  if (sqlInstance) return sqlInstance;

  const connectionString =
    process.env.ANALYTICS_DATABASE_URL ||
    process.env.DATABASE_URL ||
    process.env.POSTGRES_URL;

  if (!connectionString) {
    throw new Error(
      'Missing analytics DB connection string. Set ANALYTICS_DATABASE_URL (recommended) or DATABASE_URL.'
    );
  }

  sqlInstance = postgres(connectionString, {
    max: 1,
    ssl: 'require',
    idle_timeout: 10,
    connect_timeout: 10,
  });

  return sqlInstance;
}
