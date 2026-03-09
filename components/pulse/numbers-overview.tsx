'use client';

import { ArrowUp, ArrowDown, Twitter, Linkedin } from 'lucide-react';
import { cn } from '@/lib/utils';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from 'recharts';
import type { PlatformStats, PerformanceData } from '@/lib/types';

function PlatformIcon({ platform }: { platform: string }) {
  switch (platform) {
    case 'twitter':
      return <Twitter className="h-3.5 w-3.5" strokeWidth={1.75} />;
    case 'linkedin':
      return <Linkedin className="h-3.5 w-3.5" strokeWidth={1.75} />;
    case 'reddit':
      return <span className="text-xs font-bold leading-none">r/</span>;
    default:
      return null;
  }
}

function Delta({ value }: { value: number }) {
  const positive = value >= 0;
  return (
    <span className={cn('inline-flex items-center gap-0.5 text-xs font-medium', positive ? 'text-[#7c9a6e]' : 'text-[#e07a5f]')}>
      {positive ? <ArrowUp className="h-3 w-3" strokeWidth={2} /> : <ArrowDown className="h-3 w-3" strokeWidth={2} />}
      {Math.abs(value).toFixed(1)}%
    </span>
  );
}

function formatNumber(n: number): string {
  if (n >= 1000000) return `${(n / 1000000).toFixed(1)}M`;
  if (n >= 1000) return `${(n / 1000).toFixed(1)}K`;
  return n.toString();
}

const metrics = [
  { key: 'followers' as const, label: 'Followers', changeKey: 'followersChange' as const },
  { key: 'impressions' as const, label: 'Impressions', changeKey: 'impressionsChange' as const },
  { key: 'engagement' as const, label: 'Engagement', changeKey: 'engagementChange' as const },
];

export function NumbersOverview({
  platformStats,
  performanceData,
  timeRange,
}: {
  platformStats: PlatformStats[];
  performanceData: PerformanceData[];
  timeRange: string;
}) {
  const totals = platformStats.reduce(
    (acc, s) => ({
      followers: acc.followers + s.followers,
      followersChange: acc.followersChange + s.followersChange * (s.followers / Math.max(1, platformStats.reduce((t, p) => t + p.followers, 0))),
      impressions: acc.impressions + s.impressions,
      impressionsChange: acc.impressionsChange + s.impressionsChange * (s.impressions / Math.max(1, platformStats.reduce((t, p) => t + p.impressions, 0))),
      engagement: acc.engagement + s.engagement,
      engagementChange: acc.engagementChange + s.engagementChange * (s.engagement / Math.max(1, platformStats.reduce((t, p) => t + p.engagement, 0))),
    }),
    { followers: 0, followersChange: 0, impressions: 0, impressionsChange: 0, engagement: 0, engagementChange: 0 }
  );

  const engagementRate = totals.impressions > 0 ? ((totals.engagement / totals.impressions) * 100) : 0;

  const headlineMetrics = [
    { label: 'Followers', value: formatNumber(totals.followers), change: totals.followersChange },
    { label: 'Impressions', value: formatNumber(totals.impressions), change: totals.impressionsChange },
    { label: 'Engagement Rate', value: `${engagementRate.toFixed(1)}%`, change: totals.engagementChange },
  ];

  return (
    <div className="sketch-border border-2 border-dashed border-[#d4c9b8] bg-[#f3ece0] p-4 space-y-6">
      <h3 className="text-sm font-bold text-[#5c4b3a] font-heading sketchy-underline">Numbers</h3>

      {/* Headline Metrics */}
      <div className="grid grid-cols-3 gap-3 md:gap-4">
        {headlineMetrics.map((m) => (
          <div key={m.label} className="space-y-1">
            <p className="text-[11px] md:text-xs text-[#5c4b3a]/60">{m.label}</p>
            <p className="text-xl md:text-2xl font-bold tabular-nums text-[#5c4b3a]">{m.value}</p>
            <div className="flex items-center gap-1">
              <Delta value={m.change} />
              <span className="text-[10px] text-[#5c4b3a]/40 hidden sm:inline">({timeRange})</span>
            </div>
          </div>
        ))}
      </div>

      {/* Trend Chart - with hand-drawn filter */}
      <div className="h-40 md:h-48 sketch-chart">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={performanceData} margin={{ top: 5, right: 5, bottom: 5, left: 5 }}>
            <CartesianGrid strokeDasharray="6 4" stroke="#d4c9b8" strokeOpacity={0.5} />
            <XAxis
              dataKey="date"
              tick={{ fontSize: 11, fill: '#5c4b3a' }}
              tickFormatter={(v: string) => {
                const d = new Date(v);
                return `${d.getMonth() + 1}/${d.getDate()}`;
              }}
              stroke="#d4c9b8"
            />
            <YAxis tick={{ fontSize: 11, fill: '#5c4b3a' }} stroke="#d4c9b8" width={40} />
            <Tooltip
              contentStyle={{ fontSize: 12, borderRadius: 12, border: '2px dashed #d4c9b8', backgroundColor: '#faf8f5' }}
              labelFormatter={(v) => new Date(String(v)).toLocaleDateString()}
            />
            <Line
              type="monotone"
              dataKey="impressions"
              stroke="#6b8cae"
              strokeWidth={2}
              dot={false}
              name="Impressions"
            />
            <Line
              type="monotone"
              dataKey="engagement"
              stroke="#7c9a6e"
              strokeWidth={2}
              dot={false}
              name="Engagement"
            />
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* Per-platform breakdown */}
      <div className="space-y-2">
        <p className="text-xs font-medium text-[#5c4b3a]/60">By Platform</p>
        {platformStats.map((stat) => (
          <div key={stat.platform} className="space-y-1.5 rounded-xl border-2 border-dashed border-[#d4c9b8] p-2.5 md:space-y-0 md:border-0 md:p-0 md:flex md:items-center md:gap-3 text-sm">
            <div className="flex items-center gap-1.5 md:w-20 text-[#5c4b3a]">
              <PlatformIcon platform={stat.platform} />
              <span className="capitalize text-xs">{stat.platform}</span>
            </div>
            <div className="flex items-center gap-3 md:gap-3">
              {metrics.map((m) => (
                <div key={m.key} className="flex items-center gap-1 min-w-0">
                  <span className="tabular-nums text-xs text-[#5c4b3a]">{formatNumber(stat[m.key])}</span>
                  <Delta value={stat[m.changeKey]} />
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
