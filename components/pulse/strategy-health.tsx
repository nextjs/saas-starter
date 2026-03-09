'use client';

import { AlertTriangle, Brain } from 'lucide-react';
import Link from 'next/link';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import type { StrategyHealth } from '@/lib/types';

const dimensions = [
  { key: 'contentQuality' as const, label: 'Content Quality' },
  { key: 'consistency' as const, label: 'Consistency' },
  { key: 'engagementTrend' as const, label: 'Engagement Trend' },
  { key: 'brandVoiceMatch' as const, label: 'Brand Voice Match' },
  { key: 'audienceGrowth' as const, label: 'Audience Growth' },
];

const suggestions: Record<string, string> = {
  contentQuality: 'Try varying content formats -- threads and carousels tend to score higher.',
  consistency: 'You missed some scheduled slots this week. Lock in your posting cadence.',
  engagementTrend: 'Engagement is dipping. Consider more interactive formats like polls or questions.',
  brandVoiceMatch: 'Recent posts drifted from your voice profile. Review your brand anchors.',
  audienceGrowth: 'Growth is slowing. Cross-post to new platforms or collaborate with others.',
};

function scoreColor(score: number) {
  if (score >= 75) return 'text-[#7c9a6e]';
  if (score >= 50) return 'text-[#f2d98b]';
  return 'text-[#e07a5f]';
}

function barColor(score: number) {
  if (score >= 75) return 'bg-[#7c9a6e]';
  if (score >= 50) return 'bg-[#f2d98b]';
  return 'bg-[#e07a5f]';
}

export function StrategyHealthCard({ data }: { data: StrategyHealth }) {
  return (
    <div className="sketch-card sketch-shadow p-5 space-y-6">
      <h3 className="text-sm font-bold text-[#5c4b3a] font-heading sketchy-underline">Strategy Health</h3>
      <div className="flex items-center gap-4">
        <div className={cn('text-5xl font-bold tabular-nums', scoreColor(data.overall))}>{data.overall}</div>
        <div className="text-sm text-[#5c4b3a]/60">
          <div className="font-semibold text-[#5c4b3a]">Overall Score</div>
          <div>Across 5 dimensions</div>
        </div>
      </div>
      <div className="space-y-3">
        {dimensions.map(({ key, label }) => {
          const value = data[key];
          const isLow = value < 70;
          return (
            <div key={key} className="space-y-1">
              <div className="flex items-center justify-between text-sm">
                <div className="flex items-center gap-1.5">
                  {isLow && <AlertTriangle className="h-3.5 w-3.5 text-[#e07a5f]" strokeWidth={1.75} />}
                  <span className="text-[#5c4b3a]">{label}</span>
                </div>
                <span className="tabular-nums text-[#5c4b3a]/60">{value}%</span>
              </div>
              <div className="h-3 w-full bg-[#ebe5d9] border border-[#d4c9b8] sketchy-bar sketch-chart">
                <div className={cn('h-full transition-all sketch-bar-fill', barColor(value))} style={{ width: `${value}%` }} />
              </div>
              {isLow && <p className="text-xs text-[#e07a5f]">{suggestions[key]}</p>}
            </div>
          );
        })}
      </div>
      <Button variant="ghost" size="sm" className="gap-1.5 text-xs text-[#5c4b3a]/60" asChild>
        <Link href="/brain"><Brain className="h-3.5 w-3.5" strokeWidth={1.75} />Ask Brain</Link>
      </Button>
    </div>
  );
}
