const requestCache = new Map<string, number[]>();

export function isRateLimited(ip: string, rateLimit: number, windowMs: number): boolean {
  const now = Date.now();
  const requests = requestCache.get(ip) || [];
  const recent = requests.filter((t) => now - t < windowMs);

  if (recent.length >= rateLimit) return true;

  recent.push(now);
  requestCache.set(ip, recent);
  return false;
}
