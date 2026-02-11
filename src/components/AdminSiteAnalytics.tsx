import { useEffect, useMemo, useState } from 'react';
import { useTheme } from './ThemeContext';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Input } from './ui/input';
import { Button } from './ui/button';
import {
  Bar,
  BarChart,
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';

type QueryResponse<T> = {
  metric: string;
  days: number;
  rows: T[];
  page?: string;
};

type ServiceOpenRow = { label: string; count: number };
type UtmRow = { campaign: string; source: string; sessions: number };
type ScrollDepthRow = { day: string; avgDepthPct: number };
type SectionEngagementRow = { sectionid?: string; sectionId?: string; totaldurationms?: string; totalDurationMs?: string };
type HeatmapRow = {
  x: number;
  y: number;
  vw: number;
  vh: number;
  elementId?: string;
  elementLabel?: string;
  elementid?: string;
  elementlabel?: string;
};

function msToMinutes(ms: number) {
  return Math.round((ms / 60000) * 10) / 10;
}

async function fetchMetric<T>(metric: string, params: Record<string, string>, accessToken?: string) {
  const qs = new URLSearchParams({ metric, ...params });
  const res = await fetch(`/.netlify/functions/analytics-query?${qs.toString()}`, {
    headers: accessToken ? { Authorization: `Bearer ${accessToken}` } : undefined,
  });
  if (!res.ok) throw new Error(`analytics-query failed: ${res.status}`);
  return (await res.json()) as QueryResponse<T>;
}

export function AdminSiteAnalytics({ accessToken }: { accessToken?: string }) {
  const { theme } = useTheme();
  const [days, setDays] = useState(14);
  const [page, setPage] = useState('/');

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hasLoaded, setHasLoaded] = useState(false);

  const [serviceOpens, setServiceOpens] = useState<ServiceOpenRow[]>([]);
  const [utmRows, setUtmRows] = useState<UtmRow[]>([]);
  const [scrollDepth, setScrollDepth] = useState<ScrollDepthRow[]>([]);
  const [sectionEngagement, setSectionEngagement] = useState<Array<{ sectionId: string; minutes: number }>>([]);
  const [heatmap, setHeatmap] = useState<HeatmapRow[]>([]);

  const totalDataPoints = useMemo(() => {
    return serviceOpens.length + utmRows.length + scrollDepth.length + sectionEngagement.length + heatmap.length;
  }, [serviceOpens, utmRows, scrollDepth, sectionEngagement, heatmap]);

  const heatmapPoints = useMemo(() => {
    return heatmap
      .filter((p) => Number.isFinite(p.x) && Number.isFinite(p.y) && p.vw > 0 && p.vh > 0)
      .map((p) => ({
        leftPct: (p.x / p.vw) * 100,
        topPct: (p.y / p.vh) * 100,
      }))
      .filter((p) => p.leftPct >= 0 && p.leftPct <= 100 && p.topPct >= 0 && p.topPct <= 100);
  }, [heatmap]);

  const reload = async () => {
    if (!accessToken) {
      setError('Admin access token required. Please save your token in the Server Access panel above.');
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);
    try {
      const daysStr = String(days);
      const [svc, utm, scroll, section, heat] = await Promise.all([
        fetchMetric<ServiceOpenRow>('service_opens', { days: daysStr }, accessToken),
        fetchMetric<UtmRow>('utm', { days: daysStr }, accessToken),
        fetchMetric<ScrollDepthRow>('scroll_depth', { days: daysStr }, accessToken),
        fetchMetric<SectionEngagementRow>('section_engagement', { days: daysStr }, accessToken),
        fetchMetric<HeatmapRow>('heatmap', { days: daysStr, page, limit: '2000' }, accessToken),
      ]);

      setServiceOpens(svc.rows || []);
      setUtmRows(utm.rows || []);
      setScrollDepth((scroll.rows || []).map((r) => ({ ...r, avgDepthPct: Number(r.avgDepthPct) })));

      const normalized = (section.rows || []).map((r) => {
        const sectionId = (r.sectionId || r.sectionid || 'unknown') as string;
        const msRaw = (r.totalDurationMs || r.totaldurationms || '0') as string;
        const ms = Number(msRaw);
        return { sectionId, minutes: msToMinutes(Number.isFinite(ms) ? ms : 0) };
      });
      setSectionEngagement(normalized);

      setHeatmap(heat.rows || []);
      setHasLoaded(true);
    } catch (e: any) {
      const msg = e?.message || String(e);
      if (/failed: 401|failed: 403/.test(msg)) {
        setError('Not authorized. Please save a valid admin access token in the Server Access panel above.');
      } else {
        setError(msg);
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (accessToken) {
      void reload();
    } else {
      setError('Admin access token required. Please save your token in the Server Access panel above.');
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [accessToken]);

  return (
    <div className="space-y-4">
      <Card className={theme === 'dark' ? 'bg-slate-800/50 border-purple-500/30' : ''}>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Website Analytics</CardTitle>
            {hasLoaded && !loading && (
              <div className={`text-xs ${theme === 'dark' ? 'text-purple-200/60' : 'text-gray-600'}`}>
                {totalDataPoints} data points loaded
              </div>
            )}
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col md:flex-row gap-3 md:items-end">
            <div className="flex-1">
              <label className={theme === 'dark' ? 'text-purple-200/80 text-sm' : 'text-gray-700 text-sm'}>Time range (days)</label>
              <Input
                value={days}
                onChange={(e) => setDays(Math.max(1, Math.min(90, Number(e.target.value) || 1)))}
                type="number"
                min={1}
                max={90}
              />
            </div>
            <div className="flex-1">
              <label className={theme === 'dark' ? 'text-purple-200/80 text-sm' : 'text-gray-700 text-sm'}>Heatmap page</label>
              <Input value={page} onChange={(e) => setPage(e.target.value || '/')} placeholder="/" />
            </div>
            <div className="flex gap-2">
              <Button onClick={() => void reload()} disabled={loading || !accessToken}>
                {loading ? 'Loading…' : 'Refresh'}
              </Button>
            </div>
          </div>

          {error && (
            <div className={`mt-3 p-3 rounded-lg border ${theme === 'dark' ? 'bg-yellow-950/40 border-yellow-500/40 text-yellow-200' : 'bg-yellow-50 border-yellow-200 text-yellow-800'}`}>
              <div className="text-sm font-medium mb-1">⚠️ Analytics Unavailable</div>
              <div className="text-xs">{error}</div>
            </div>
          )}

          {!accessToken && !error && (
            <div className={`mt-3 p-3 rounded-lg border ${theme === 'dark' ? 'bg-blue-950/40 border-blue-500/40 text-blue-200' : 'bg-blue-50 border-blue-200 text-blue-800'}`}>
              <div className="text-sm">💡 To view analytics, save your admin access token in the Server Access panel above.</div>
            </div>
          )}
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <Card className={theme === 'dark' ? 'bg-slate-800/50 border-purple-500/30' : ''}>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Most Opened Services</CardTitle>
              {serviceOpens.length > 0 && (
                <div className={`text-xs ${theme === 'dark' ? 'text-purple-200/60' : 'text-gray-600'}`}>
                  {serviceOpens.length} services
                </div>
              )}
            </div>
          </CardHeader>
          <CardContent style={{ height: 260 }}>
            {loading ? (
              <div className="flex items-center justify-center h-full">
                <div className="text-center">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-500 mx-auto mb-2"></div>
                  <div className={`text-sm ${theme === 'dark' ? 'text-purple-200/60' : 'text-gray-600'}`}>Loading...</div>
                </div>
              </div>
            ) : serviceOpens.length === 0 ? (
              <div className="flex items-center justify-center h-full">
                <div className={`text-center ${theme === 'dark' ? 'text-purple-200/60' : 'text-gray-600'}`}>
                  <div className="text-3xl mb-2">📊</div>
                  <div className="text-sm">No service opens recorded yet</div>
                  <div className="text-xs mt-1">Data appears when users interact with services</div>
                </div>
              </div>
            ) : (
              <>
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={serviceOpens} margin={{ left: 8, right: 8, top: 8, bottom: 8 }}>
                    <CartesianGrid strokeDasharray="3 3" opacity={0.2} />
                    <XAxis dataKey="label" hide />
                    <YAxis allowDecimals={false} />
                    <Tooltip />
                    <Bar dataKey="count" fill={theme === 'dark' ? '#a78bfa' : '#7c3aed'} />
                  </BarChart>
                </ResponsiveContainer>
                <div className={theme === 'dark' ? 'text-xs text-purple-200/60 mt-2' : 'text-xs text-gray-600 mt-2'}>
                  Hover bars to see service names and counts.
                </div>
              </>
            )}
          </CardContent>
        </Card>

        <Card className={theme === 'dark' ? 'bg-slate-800/50 border-purple-500/30' : ''}>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Scroll Depth (Avg %)</CardTitle>
              {scrollDepth.length > 0 && (
                <div className={`text-xs ${theme === 'dark' ? 'text-purple-200/60' : 'text-gray-600'}`}>
                  {scrollDepth.length} days
                </div>
              )}
            </div>
          </CardHeader>
          <CardContent style={{ height: 260 }}>
            {loading ? (
              <div className="flex items-center justify-center h-full">
                <div className="text-center">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-500 mx-auto mb-2"></div>
                  <div className={`text-sm ${theme === 'dark' ? 'text-purple-200/60' : 'text-gray-600'}`}>Loading...</div>
                </div>
              </div>
            ) : scrollDepth.length === 0 ? (
              <div className="flex items-center justify-center h-full">
                <div className={`text-center ${theme === 'dark' ? 'text-purple-200/60' : 'text-gray-600'}`}>
                  <div className="text-3xl mb-2">📜</div>
                  <div className="text-sm">No scroll data yet</div>
                  <div className="text-xs mt-1">Tracks how far users scroll down pages</div>
                </div>
              </div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={scrollDepth} margin={{ left: 8, right: 8, top: 8, bottom: 8 }}>
                  <CartesianGrid strokeDasharray="3 3" opacity={0.2} />
                  <XAxis dataKey="day" />
                  <YAxis domain={[0, 100]} />
                  <Tooltip />
                  <Line type="monotone" dataKey="avgDepthPct" stroke={theme === 'dark' ? '#22d3ee' : '#0ea5e9'} strokeWidth={2} dot={false} />
                </LineChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>

        <Card className={theme === 'dark' ? 'bg-slate-800/50 border-purple-500/30' : ''}>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Section Engagement (Minutes)</CardTitle>
              {sectionEngagement.length > 0 && (
                <div className={`text-xs ${theme === 'dark' ? 'text-purple-200/60' : 'text-gray-600'}`}>
                  {sectionEngagement.length} sections
                </div>
              )}
            </div>
          </CardHeader>
          <CardContent style={{ height: 260 }}>
            {loading ? (
              <div className="flex items-center justify-center h-full">
                <div className="text-center">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-500 mx-auto mb-2"></div>
                  <div className={`text-sm ${theme === 'dark' ? 'text-purple-200/60' : 'text-gray-600'}`}>Loading...</div>
                </div>
              </div>
            ) : sectionEngagement.length === 0 ? (
              <div className="flex items-center justify-center h-full">
                <div className={`text-center ${theme === 'dark' ? 'text-purple-200/60' : 'text-gray-600'}`}>
                  <div className="text-3xl mb-2">⏱️</div>
                  <div className="text-sm">No section engagement data</div>
                  <div className="text-xs mt-1">Time spent in each section of the website</div>
                </div>
              </div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={sectionEngagement} margin={{ left: 8, right: 8, top: 8, bottom: 8 }}>
                  <CartesianGrid strokeDasharray="3 3" opacity={0.2} />
                  <XAxis dataKey="sectionId" />
                  <YAxis allowDecimals={false} />
                  <Tooltip />
                  <Bar dataKey="minutes" fill={theme === 'dark' ? '#34d399' : '#10b981'} />
                </BarChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>

        <Card className={theme === 'dark' ? 'bg-slate-800/50 border-purple-500/30' : ''}>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>UTM Campaign Performance</CardTitle>
              {utmRows.length > 0 && (
                <div className={`text-xs ${theme === 'dark' ? 'text-purple-200/60' : 'text-gray-600'}`}>
                  {utmRows.length} campaigns
                </div>
              )}
            </div>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="flex items-center justify-center py-12">
                <div className="text-center">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-500 mx-auto mb-2"></div>
                  <div className={`text-sm ${theme === 'dark' ? 'text-purple-200/60' : 'text-gray-600'}`}>Loading...</div>
                </div>
              </div>
            ) : utmRows.length === 0 ? (
              <div className="flex items-center justify-center py-12">
                <div className={`text-center ${theme === 'dark' ? 'text-purple-200/60' : 'text-gray-600'}`}>
                  <div className="text-3xl mb-2">🎯</div>
                  <div className="text-sm">No UTM campaigns tracked</div>
                  <div className="text-xs mt-1">Use ?utm_source=... URLs to track campaigns</div>
                </div>
              </div>
            ) : (
              <div className="overflow-auto max-h-[220px]">
                <table className="w-full text-sm">
                  <thead className="sticky top-0 bg-inherit">
                    <tr className={theme === 'dark' ? 'text-purple-200/80' : 'text-gray-700'}>
                      <th className="text-left py-2">Campaign</th>
                      <th className="text-left py-2">Source</th>
                      <th className="text-right py-2">Sessions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {utmRows.map((r, idx) => (
                      <tr key={`${r.campaign}-${r.source}-${idx}`} className={theme === 'dark' ? 'border-t border-purple-500/10' : 'border-t border-gray-200'}>
                        <td className="py-2 pr-2">{r.campaign}</td>
                        <td className="py-2 pr-2">{r.source}</td>
                        <td className="py-2 text-right font-semibold">{r.sessions}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <Card className={theme === 'dark' ? 'bg-slate-800/50 border-purple-500/30' : ''}>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Click Heatmap</CardTitle>
            {heatmapPoints.length > 0 && (
              <div className={`text-xs ${theme === 'dark' ? 'text-purple-200/60' : 'text-gray-600'}`}>
                {heatmapPoints.length} clicks
              </div>
            )}
          </div>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex items-center justify-center py-24">
              <div className="text-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-500 mx-auto mb-2"></div>
                <div className={`text-sm ${theme === 'dark' ? 'text-purple-200/60' : 'text-gray-600'}`}>Loading heatmap...</div>
              </div>
            </div>
          ) : heatmapPoints.length === 0 ? (
            <div className="flex items-center justify-center py-24">
              <div className={`text-center ${theme === 'dark' ? 'text-purple-200/60' : 'text-gray-600'}`}>
                <div className="text-5xl mb-3">🖱️</div>
                <div className="text-sm">No click data for page: {page}</div>
                <div className="text-xs mt-1">Heatmap shows where users click on the page</div>
              </div>
            </div>
          ) : (
            <>
              <div
                className={
                  theme === 'dark'
                    ? 'relative w-full aspect-video rounded-xl border border-purple-500/20 bg-slate-950/30 overflow-hidden'
                    : 'relative w-full aspect-video rounded-xl border border-gray-200 bg-white overflow-hidden'
                }
              >
                {heatmapPoints.slice(0, 2000).map((p, idx) => (
                  <div
                    key={idx}
                    className={theme === 'dark' ? 'absolute w-2 h-2 rounded-full bg-cyan-400/30' : 'absolute w-2 h-2 rounded-full bg-purple-500/25'}
                    style={{ left: `${p.leftPct}%`, top: `${p.topPct}%`, transform: 'translate(-50%, -50%)' }}
                  />
                ))}
              </div>
              <div className={theme === 'dark' ? 'text-xs text-purple-200/60 mt-2' : 'text-xs text-gray-600 mt-2'}>
                Showing up to 2000 recent clicks for page "{page}", normalized by viewport size.
              </div>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
