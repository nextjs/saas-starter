'use client';

import { AlertTriangle, Brain } from 'lucide-react';
import Link from 'next/link';
import { cn } from '@/lib/utils';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
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
  contentQuality: 'Try varying content formats — threads and carousels tend to score higher.',
  consistency: 'You missed some scheduled slots this week. Lock in your posting cadence.',
  engagementTrend: 'Engagement is dipping. Consider more interactive formats like polls or questions.',
  brandVoiceMatch: 'Recent posts drifted from your voice profile. Review your brand anchors.',
  audienceGrowth: 'Growth is slowing. Cross-post to new platforms or collaborate with others.',
};

function scoreColor(score: number) {
  if (score >= 75) return 'text-emerald-600 dark:text-emerald-400';
  if (score >= 50) return 'text-amber-600 dark:text-amber-400';
  return 'text-red-600 dark:text-red-400';
}

function barColor(score: number) {
  if (score >= 75) return 'bg-emerald-500';
  if (score >= 50) return 'bg-amber-500';
  return 'bg-red-500';
}

export function StrategyHealthCard({ data }: { data: StrategyHealth }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-sm">Strategy Health</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Overall Score */}
        <div className="flex items-center gap-4">
          <div className={cn('text-5xl font-bold tabular-nums', scoreColor(data.overall))}>
            {data.overall}
          </div>
          <div className="text-sm text-muted-foreground">
            <div className="font-medium text-foreground">Overall Score</div>
            <div>Across 5 dimensions</div>
          </div>
        </div>

        {/* Dimension Bars */}
        <div className="space-y-3">
          {dimensions.map(({ key, label }) => {
            const value = data[key];
            const isLow = value < 70;
            return (
              <div key={key} className="space-y-1">
                <div className="flex items-center justify-between text-sm">
                  <div className="flex items-center gap-1.5">
                    {isLow && (
                      <AlertTriangle className="h-3.5 w-3.5 text-amber-500" strokeWidth={1.75} />
                    )}
                    <span>{label}</span>
                  </div>
                  <span className="tabular-nums text-muted-foreground">{value}%</span>
                </div>
                <div className="h-2 w-full rounded-full bg-muted">
                  <div
                    className={cn('h-full rounded-full transition-all', barColor(value))}
                    style={{ width: `${value}%` }}
                  />
                </div>
                {isLow && (
                  <p className="text-xs text-amber-600 dark:text-amber-400">
                    {suggestions[key]}
                  </p>
                )}
              </div>
            );
          })}
        </div>

        <Button variant="ghost" size="sm" className="gap-1.5 text-xs" asChild>
          <Link href="/brain">
            <Brain className="h-3.5 w-3.5" strokeWidth={1.75} />
            Ask Brain
          </Link>
        </Button>
      </CardContent>
    </Card>
  );
}
