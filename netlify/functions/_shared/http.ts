export function json(statusCode: number, body: unknown, extraHeaders?: Record<string, string>) {
  return {
    statusCode,
    headers: {
      'Content-Type': 'application/json',
      'Access-Control-Allow-Origin': '*',
      ...(extraHeaders || {}),
    },
    body: JSON.stringify(body),
  };
}

export function getBearerToken(headers: Record<string, string | undefined>) {
  const auth = headers.authorization || headers.Authorization;
  if (!auth) return null;
  const m = auth.match(/^Bearer\s+(.+)$/i);
  return m ? m[1] : null;
}

export function getClientIp(headers: Record<string, string | undefined>) {
  return headers['client-ip'] || headers['x-forwarded-for'] || headers['x-nf-client-connection-ip'] || 'unknown';
}
