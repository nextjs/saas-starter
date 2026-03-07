'use client';

import { Lightbulb, AlertTriangle, BookOpen, Trophy, Brain } from 'lucide-react';
import Link from 'next/link';
import { cn } from '@/lib/utils';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import type { AIInsight } from '@/lib/types';

const typeConfig = {
  opportunity: { icon: Lightbulb, color: 'text-amber-500', bg: 'bg-amber-500/10' },
  warning: { icon: AlertTriangle, color: 'text-red-500', bg: 'bg-red-500/10' },
  learning: { icon: BookOpen, color: 'text-blue-500', bg: 'bg-blue-500/10' },
  milestone: { icon: Trophy, color: 'text-emerald-500', bg: 'bg-emerald-500/10' },
} as const;

export function AIInsightsCard({ data }: { data: AIInsight[] }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-sm">AI Insights</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {data.map((insight) => {
          const config = typeConfig[insight.type];
          const Icon = config.icon;
          return (
            <div key={insight.id} className="flex gap-3 rounded-lg border p-3">
              <div className={cn('flex h-8 w-8 shrink-0 items-center justify-center rounded-lg', config.bg)}>
                <Icon className={cn('h-4 w-4', config.color)} strokeWidth={1.75} />
              </div>
              <div className="min-w-0 space-y-1">
                <p className="text-sm">{insight.finding}</p>
                <p className="text-sm font-medium">{insight.suggestion}</p>
                {insight.metric && (
                  <span className="text-xs text-muted-foreground">{insight.metric}</span>
                )}
              </div>
            </div>
          );
        })}

        <Button variant="ghost" size="sm" className="gap-1.5 text-xs" asChild>
          <Link href="/brain">
            <Brain className="h-3.5 w-3.5" strokeWidth={1.75} />
            Ask Brain for deeper analysis
          </Link>
        </Button>
      </CardContent>
    </Card>
  );
}
