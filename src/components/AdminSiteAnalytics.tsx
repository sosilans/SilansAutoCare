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
type HeatmapRow = { x: number; y: number; vw: number; vh: number; elementId: string; elementLabel: string };

function msToMinutes(ms: number) {
  return Math.round((ms / 60000) * 10) / 10;
}

async function fetchMetric<T>(metric: string, params: Record<string, string>) {
  const qs = new URLSearchParams({ metric, ...params });
  const res = await fetch(`/.netlify/functions/analytics-query?${qs.toString()}`);
  if (!res.ok) throw new Error(`analytics-query failed: ${res.status}`);
  return (await res.json()) as QueryResponse<T>;
}

export function AdminSiteAnalytics() {
  const { theme } = useTheme();
  const [days, setDays] = useState(14);
  const [page, setPage] = useState('/');

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [serviceOpens, setServiceOpens] = useState<ServiceOpenRow[]>([]);
  const [utmRows, setUtmRows] = useState<UtmRow[]>([]);
  const [scrollDepth, setScrollDepth] = useState<ScrollDepthRow[]>([]);
  const [sectionEngagement, setSectionEngagement] = useState<Array<{ sectionId: string; minutes: number }>>([]);
  const [heatmap, setHeatmap] = useState<HeatmapRow[]>([]);

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
    setLoading(true);
    setError(null);
    try {
      const daysStr = String(days);
      const [svc, utm, scroll, section, heat] = await Promise.all([
        fetchMetric<ServiceOpenRow>('service_opens', { days: daysStr }),
        fetchMetric<UtmRow>('utm', { days: daysStr }),
        fetchMetric<ScrollDepthRow>('scroll_depth', { days: daysStr }),
        fetchMetric<SectionEngagementRow>('section_engagement', { days: daysStr }),
        fetchMetric<HeatmapRow>('heatmap', { days: daysStr, page, limit: '2000' }),
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
    } catch (e: any) {
      setError(e?.message || String(e));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void reload();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="space-y-4">
      <Card className={theme === 'dark' ? 'bg-slate-800/50 border-purple-500/30' : ''}>
        <CardHeader>
          <CardTitle>Website Analytics</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col md:flex-row gap-3 md:items-end">
            <div className="flex-1">
              <label className={theme === 'dark' ? 'text-purple-200/80 text-sm' : 'text-gray-700 text-sm'}>Days</label>
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
              <Button onClick={() => void reload()} disabled={loading}>
                {loading ? 'Loading…' : 'Refresh'}
              </Button>
            </div>
          </div>

          {error && <div className="mt-3 text-sm text-red-500">{error}</div>}
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <Card className={theme === 'dark' ? 'bg-slate-800/50 border-purple-500/30' : ''}>
          <CardHeader>
            <CardTitle>Most Opened Services</CardTitle>
          </CardHeader>
          <CardContent style={{ height: 260 }}>
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
              Tip: hover bars to see names.
            </div>
          </CardContent>
        </Card>

        <Card className={theme === 'dark' ? 'bg-slate-800/50 border-purple-500/30' : ''}>
          <CardHeader>
            <CardTitle>Scroll Depth (Avg %)</CardTitle>
          </CardHeader>
          <CardContent style={{ height: 260 }}>
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={scrollDepth} margin={{ left: 8, right: 8, top: 8, bottom: 8 }}>
                <CartesianGrid strokeDasharray="3 3" opacity={0.2} />
                <XAxis dataKey="day" />
                <YAxis domain={[0, 100]} />
                <Tooltip />
                <Line type="monotone" dataKey="avgDepthPct" stroke={theme === 'dark' ? '#22d3ee' : '#0ea5e9'} strokeWidth={2} dot={false} />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card className={theme === 'dark' ? 'bg-slate-800/50 border-purple-500/30' : ''}>
          <CardHeader>
            <CardTitle>Per-Section Engagement (Minutes)</CardTitle>
          </CardHeader>
          <CardContent style={{ height: 260 }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={sectionEngagement} margin={{ left: 8, right: 8, top: 8, bottom: 8 }}>
                <CartesianGrid strokeDasharray="3 3" opacity={0.2} />
                <XAxis dataKey="sectionId" />
                <YAxis allowDecimals={false} />
                <Tooltip />
                <Bar dataKey="minutes" fill={theme === 'dark' ? '#34d399' : '#10b981'} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card className={theme === 'dark' ? 'bg-slate-800/50 border-purple-500/30' : ''}>
          <CardHeader>
            <CardTitle>UTM Campaign Performance</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-auto">
              <table className="w-full text-sm">
                <thead>
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
                      <td className="py-2 text-right">{r.sessions}</td>
                    </tr>
                  ))}
                  {!utmRows.length && (
                    <tr>
                      <td colSpan={3} className={theme === 'dark' ? 'py-3 text-purple-200/60' : 'py-3 text-gray-600'}>
                        No UTM data yet.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card className={theme === 'dark' ? 'bg-slate-800/50 border-purple-500/30' : ''}>
        <CardHeader>
          <CardTitle>Heatmap (Clicks)</CardTitle>
        </CardHeader>
        <CardContent>
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
            Showing up to 2000 recent clicks, normalized by viewport.
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
