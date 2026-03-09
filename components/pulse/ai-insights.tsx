'use client';

import { Lightbulb, AlertTriangle, BookOpen, Trophy, Brain } from 'lucide-react';
import Link from 'next/link';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import type { AIInsight } from '@/lib/types';

const typeConfig = {
  opportunity: { icon: Lightbulb, color: 'text-[#f2d98b]', bg: 'bg-[#f2d98b]/15' },
  warning: { icon: AlertTriangle, color: 'text-[#e07a5f]', bg: 'bg-[#e07a5f]/10' },
  learning: { icon: BookOpen, color: 'text-[#6b8cae]', bg: 'bg-[#6b8cae]/10' },
  milestone: { icon: Trophy, color: 'text-[#7c9a6e]', bg: 'bg-[#7c9a6e]/10' },
} as const;

export function AIInsightsCard({ data }: { data: AIInsight[] }) {
  return (
    <div className="sketch-card sketch-shadow p-5 space-y-3">
      <h3 className="text-sm font-bold text-[#5c4b3a] font-heading sketchy-underline">AI Insights</h3>
      {data.map((insight) => {
        const config = typeConfig[insight.type];
        const Icon = config.icon;
        return (
          <div key={insight.id} className="flex gap-3 rounded-xl border-2 border-dashed border-[#d4c9b8] p-3">
            <div className={cn('flex h-8 w-8 shrink-0 items-center justify-center rounded-lg', config.bg)}>
              <Icon className={cn('h-4 w-4', config.color)} strokeWidth={1.75} />
            </div>
            <div className="min-w-0 space-y-1">
              <p className="text-sm text-[#5c4b3a]">{insight.finding}</p>
              <p className="text-sm font-semibold text-[#5c4b3a]">{insight.suggestion}</p>
              {insight.metric && <span className="text-xs text-[#5c4b3a]/60">{insight.metric}</span>}
            </div>
          </div>
        );
      })}
      <Button variant="ghost" size="sm" className="gap-1.5 text-xs text-[#5c4b3a]/60" asChild>
        <Link href="/brain"><Brain className="h-3.5 w-3.5" strokeWidth={1.75} />Ask Brain for deeper analysis</Link>
      </Button>
    </div>
  );
}
