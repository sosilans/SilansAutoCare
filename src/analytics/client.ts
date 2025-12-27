type DeviceType = 'mobile' | 'tablet' | 'desktop' | 'unknown';

type AnalyticsBase = {
  page: string;
  timestamp: number;
  sessionId: string;
};

type AnalyticsMetadata = {
  page?: string;
  elementId?: string;
  elementLabel?: string;
  sectionId?: string;
  fromSectionId?: string;
  toSectionId?: string;
  durationMs?: number;
  click?: { x: number; y: number };
  scroll?: { y: number; depthPct?: number };
  viewport?: { w: number; h: number };
  device?: { type: DeviceType; os: string };
  referrer?: string;
  utm?: Partial<Record<'utm_source' | 'utm_medium' | 'utm_campaign' | 'utm_term' | 'utm_content', string>>;
  firstVisit?: { at: number; landingPage: string };
  service?: { id: number; title: string };
  cta?: { label: string };
  review?: { action: 'open' | 'submit' };
  contact?: { action: 'submit'; selectedServicesCount?: number };
  language?: { from: string; to: string };
};

type QueuedEvent = {
  type: string;
  metadata: AnalyticsMetadata;
  timestamp: number;
};

const LS_SESSION_KEY = 'analytics_session_id';
const LS_SESSION_LAST_SEEN_KEY = 'analytics_session_last_seen';
const LS_FIRST_VISIT_KEY = 'analytics_first_visit';
const LS_FIRST_LANDING_KEY = 'analytics_first_landing_page';

const SESSION_TTL_MS = 30 * 60 * 1000;
const FLUSH_INTERVAL_MS = 5000;
const MAX_BATCH = 20;
const MAX_QUEUE = 200;

let initialized = false;
let queue: QueuedEvent[] = [];
let flushTimer: number | undefined;
let currentSectionId: string | null = null;
let sectionEnterAt = 0;
let maxScrollDepthPct = 0;

function now() {
  return Date.now();
}

function base64Url(bytes: Uint8Array) {
  let binary = '';
  for (let i = 0; i < bytes.length; i++) binary += String.fromCharCode(bytes[i]);
  const b64 = btoa(binary);
  return b64.replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/g, '');
}

function newRandomId() {
  const bytes = new Uint8Array(16);
  crypto.getRandomValues(bytes);
  return base64Url(bytes);
}

function getOrCreateSessionId() {
  try {
    const lastSeenRaw = localStorage.getItem(LS_SESSION_LAST_SEEN_KEY);
    const lastSeen = lastSeenRaw ? Number(lastSeenRaw) : 0;
    const existing = localStorage.getItem(LS_SESSION_KEY);

    const expired = !lastSeen || now() - lastSeen > SESSION_TTL_MS;
    const sessionId = existing && !expired ? existing : newRandomId();

    localStorage.setItem(LS_SESSION_KEY, sessionId);
    localStorage.setItem(LS_SESSION_LAST_SEEN_KEY, String(now()));
    return sessionId;
  } catch {
    return newRandomId();
  }
}

function parseDevice(): { type: DeviceType; os: string } {
  const ua = navigator.userAgent || '';
  const isIPad = /iPad/.test(ua) || (navigator.maxTouchPoints > 1 && /Macintosh/.test(ua));
  const isIPhone = /iPhone/.test(ua);
  const isAndroid = /Android/.test(ua);

  const type: DeviceType = isIPad ? 'tablet' : isIPhone || isAndroid ? 'mobile' : 'desktop';

  let os = 'unknown';
  if (/Windows NT/.test(ua)) os = 'windows';
  else if (/Android/.test(ua)) os = 'android';
  else if (/iPhone|iPad|iPod/.test(ua)) os = 'ios';
  else if (/Mac OS X/.test(ua)) os = 'macos';
  else if (/Linux/.test(ua)) os = 'linux';

  return { type, os };
}

function getUtm() {
  const params = new URLSearchParams(window.location.search);
  const keys = ['utm_source', 'utm_medium', 'utm_campaign', 'utm_term', 'utm_content'] as const;
  const utm: Record<string, string> = {};
  for (const k of keys) {
    const v = params.get(k);
    if (v) utm[k] = v;
  }
  return Object.keys(utm).length ? utm : undefined;
}

function getFirstVisit(): { at: number; landingPage: string } {
  try {
    const existing = localStorage.getItem(LS_FIRST_VISIT_KEY);
    const existingLanding = localStorage.getItem(LS_FIRST_LANDING_KEY);
    if (existing && existingLanding) {
      return { at: Number(existing), landingPage: existingLanding };
    }

    const at = now();
    const landingPage = window.location.pathname + window.location.search + window.location.hash;
    localStorage.setItem(LS_FIRST_VISIT_KEY, String(at));
    localStorage.setItem(LS_FIRST_LANDING_KEY, landingPage);
    return { at, landingPage };
  } catch {
    return { at: now(), landingPage: window.location.pathname + window.location.search + window.location.hash };
  }
}

function safeTextLabel(el: Element | null): string | undefined {
  if (!el) return undefined;

  const htmlEl = el as HTMLElement;
  const explicit = htmlEl.getAttribute('data-analytics-label') || htmlEl.getAttribute('aria-label');
  if (explicit) return explicit.slice(0, 80);

  const tag = htmlEl.tagName.toLowerCase();
  if (tag === 'input' || tag === 'textarea' || tag === 'select') {
    const name = htmlEl.getAttribute('name');
    return name ? name.slice(0, 80) : tag;
  }

  const text = (htmlEl.innerText || '').trim().replace(/\s+/g, ' ');
  if (!text) return tag;
  return text.slice(0, 80);
}

function elementId(el: Element | null): string | undefined {
  if (!el) return undefined;
  const htmlEl = el as HTMLElement;
  return (
    htmlEl.getAttribute('data-analytics-id') ||
    htmlEl.id ||
    htmlEl.getAttribute('name') ||
    undefined
  );
}

function enqueue(type: string, metadata: AnalyticsMetadata) {
  if (queue.length >= MAX_QUEUE) queue = queue.slice(-Math.floor(MAX_QUEUE / 2));
  queue.push({ type, metadata, timestamp: now() });

  if (queue.length >= MAX_BATCH) {
    void flush();
    return;
  }

  if (!flushTimer) {
    flushTimer = window.setTimeout(() => {
      flushTimer = undefined;
      void flush();
    }, FLUSH_INTERVAL_MS);
  }
}

async function flush() {
  if (!queue.length) return;

  const sessionId = getOrCreateSessionId();
  const device = parseDevice();
  const utm = getUtm();
  const firstVisit = getFirstVisit();

  const events = queue.splice(0, queue.length).map((e) => {
    const base: AnalyticsBase = {
      page: window.location.pathname,
      timestamp: e.timestamp,
      sessionId,
    };

    const viewport = { w: window.innerWidth || 0, h: window.innerHeight || 0 };

    return {
      type: e.type,
      metadata: {
        ...base,
        ...e.metadata,
        viewport: e.metadata.viewport ?? viewport,
        device: e.metadata.device ?? device,
        utm: e.metadata.utm ?? utm,
        referrer: e.metadata.referrer ?? (document.referrer || undefined),
        firstVisit: e.metadata.firstVisit ?? firstVisit,
      },
    };
  });

  const payload = JSON.stringify({ events });
  const url = '/.netlify/functions/analytics-ingest';

  try {
    if (navigator.sendBeacon) {
      const blob = new Blob([payload], { type: 'application/json' });
      navigator.sendBeacon(url, blob);
      return;
    }
  } catch {
    // ignore and fall back to fetch
  }

  try {
    await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: payload,
      keepalive: true,
    });
  } catch {
    // best-effort
  }
}

function onScrollPassive() {
  const doc = document.documentElement;
  const scrollTop = window.scrollY || doc.scrollTop || 0;
  const scrollHeight = doc.scrollHeight || 0;
  const viewportHeight = window.innerHeight || 1;
  const maxScrollable = Math.max(1, scrollHeight - viewportHeight);
  const pct = Math.min(100, Math.max(0, (scrollTop / maxScrollable) * 100));
  if (pct > maxScrollDepthPct) maxScrollDepthPct = pct;
}

function flushScrollDepthAndSectionTime(reason: 'pagehide' | 'visibility') {
  enqueue('scroll_depth', {
    scroll: { y: window.scrollY || 0, depthPct: Math.round(maxScrollDepthPct) },
    elementLabel: reason,
  });

  if (currentSectionId && sectionEnterAt) {
    enqueue('section_time', {
      sectionId: currentSectionId,
      durationMs: now() - sectionEnterAt,
    });
  }

  void flush();
}

function initSectionObserver() {
  const sectionIds = ['hero', 'about', 'portfolio', 'services', 'reviews', 'faq', 'contact'];
  const elements = sectionIds
    .map((id) => document.getElementById(id))
    .filter(Boolean) as HTMLElement[];

  if (!elements.length) return;

  const observer = new IntersectionObserver(
    (entries) => {
      const visible = entries
        .filter((e) => e.isIntersecting)
        .sort((a, b) => (b.intersectionRatio || 0) - (a.intersectionRatio || 0));

      const top = visible[0];
      if (!top?.target) return;

      const nextId = (top.target as HTMLElement).id;
      if (!nextId || nextId === currentSectionId) return;

      const prev = currentSectionId;
      const exitAt = now();

      if (prev && sectionEnterAt) {
        enqueue('section_time', { sectionId: prev, durationMs: exitAt - sectionEnterAt });
        enqueue('section_transition', { fromSectionId: prev, toSectionId: nextId });
      }

      currentSectionId = nextId;
      sectionEnterAt = exitAt;
      enqueue('section_enter', { sectionId: nextId });
    },
    { root: null, threshold: [0.4, 0.6, 0.8] }
  );

  for (const el of elements) observer.observe(el);
}

function initGlobalClickCapture() {
  document.addEventListener(
    'click',
    (e) => {
      const target = e.target as Element | null;
      if (!target) return;

      // do not record analytics from admin routes
      if (window.location.pathname.startsWith('/admin')) return;

      const clickX = (e as MouseEvent).clientX;
      const clickY = (e as MouseEvent).clientY;

      enqueue('click', {
        elementId: elementId(target),
        elementLabel: safeTextLabel(target),
        click: { x: Math.round(clickX), y: Math.round(clickY) },
        scroll: { y: Math.round(window.scrollY || 0) },
      });
    },
    { capture: true, passive: true }
  );
}

export function track(type: string, metadata: AnalyticsMetadata = {}) {
  enqueue(type, metadata);
}

export function initAnalytics() {
  if (initialized) return;
  initialized = true;

  // Skip analytics entirely on admin pages.
  if (window.location.pathname.startsWith('/admin')) return;

  // Start session + traffic context
  enqueue('session_start', {
    referrer: document.referrer || undefined,
    utm: getUtm(),
    firstVisit: getFirstVisit(),
  });

  initGlobalClickCapture();
  initSectionObserver();

  window.addEventListener('scroll', onScrollPassive, { passive: true });
  window.addEventListener('touchmove', onScrollPassive, { passive: true });

  window.addEventListener('pagehide', () => flushScrollDepthAndSectionTime('pagehide'));
  document.addEventListener('visibilitychange', () => {
    if (document.visibilityState === 'hidden') flushScrollDepthAndSectionTime('visibility');
  });

  // best-effort flush loop
  flushTimer = window.setTimeout(() => {
    flushTimer = undefined;
    void flush();
  }, FLUSH_INTERVAL_MS);
}
