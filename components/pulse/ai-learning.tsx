'use client';

import { Brain, Sparkles, CheckCircle, RotateCcw } from 'lucide-react';
import Link from 'next/link';
import { cn } from '@/lib/utils';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import type { AILearningProgress, LearnedPattern } from '@/lib/types';

function TrendChart({
  data,
  label,
  currentValue,
}: {
  data: number[];
  label: string;
  currentValue: number;
}) {
  const chartData = data.map((v, i) => ({ week: `W${i + 1}`, value: v }));

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <span className="text-sm font-medium">{label}</span>
        <span className={cn(
          'text-lg font-bold tabular-nums',
          currentValue >= 75 ? 'text-emerald-600 dark:text-emerald-400' :
          currentValue >= 50 ? 'text-amber-600 dark:text-amber-400' :
          'text-red-600 dark:text-red-400'
        )}>
          {currentValue}%
        </span>
      </div>
      <div className="h-24">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={chartData} margin={{ top: 5, right: 5, bottom: 5, left: 5 }}>
            <XAxis dataKey="week" tick={{ fontSize: 10 }} className="text-muted-foreground" />
            <YAxis domain={[0, 100]} tick={{ fontSize: 10 }} className="text-muted-foreground" width={28} />
            <Tooltip contentStyle={{ fontSize: 12, borderRadius: 8 }} />
            <Line
              type="monotone"
              dataKey="value"
              stroke="hsl(var(--chart-1, 220 70% 50%))"
              strokeWidth={2}
              dot={{ r: 3, fill: 'hsl(var(--chart-1, 220 70% 50%))' }}
              name={label}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

export function AILearningCard({
  learning,
  patterns,
}: {
  learning: AILearningProgress;
  patterns: LearnedPattern[];
}) {
  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-2">
          <Sparkles className="h-4 w-4 text-amber-500" strokeWidth={1.75} />
          <CardTitle className="text-sm">AI Learning Progress</CardTitle>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Trend Charts */}
        <TrendChart
          data={learning.brandVoiceAccuracyTrend}
          label="Brand Voice Accuracy"
          currentValue={learning.brandVoiceAccuracy}
        />
        <TrendChart
          data={learning.oneTapApproveRateTrend}
          label="One-tap Approve Rate"
          currentValue={learning.oneTapApproveRate}
        />

        {/* Stats */}
        <div className="grid grid-cols-3 gap-4 rounded-lg border p-3">
          <div className="text-center">
            <p className="text-lg font-bold tabular-nums">{patterns.length * 47}</p>
            <p className="text-[11px] text-muted-foreground">Total Interactions</p>
          </div>
          <div className="text-center">
            <p className="text-lg font-bold tabular-nums">{patterns.length}</p>
            <p className="text-[11px] text-muted-foreground">Learned Patterns</p>
          </div>
          <div className="text-center">
            <p className="text-lg font-bold tabular-nums">{patterns.filter(p => p.confidence > 70).length}</p>
            <p className="text-[11px] text-muted-foreground">Active Rules</p>
          </div>
        </div>

        {/* Recent Learnings */}
        <div className="space-y-3">
          <h4 className="text-xs font-medium text-muted-foreground">Recent Learnings</h4>
          {learning.learnedThisWeek.map((item, i) => (
            <div key={i} className="space-y-1.5 rounded-lg border p-3">
              <div className="flex items-start gap-2">
                <span className="shrink-0 text-sm">📝</span>
                <p className="text-sm">{item}</p>
              </div>
              <div className="flex gap-1.5 pl-6">
                <Button variant="outline" size="sm" className="h-6 gap-1 px-2 text-[11px]">
                  <CheckCircle className="h-3 w-3" strokeWidth={1.75} />
                  Correct
                </Button>
                <Button variant="ghost" size="sm" className="h-6 gap-1 px-2 text-[11px] text-muted-foreground">
                  <RotateCcw className="h-3 w-3" strokeWidth={1.75} />
                  One-time
                </Button>
              </div>
            </div>
          ))}
        </div>

        {/* Links */}
        <div className="flex flex-col gap-1.5">
          <Button variant="ghost" size="sm" className="justify-start gap-1.5 text-xs" asChild>
            <Link href="/brain">
              View all learned patterns →
            </Link>
          </Button>
          <Button variant="ghost" size="sm" className="justify-start gap-1.5 text-xs text-muted-foreground" asChild>
            <Link href="/brain">
              <Brain className="h-3.5 w-3.5" strokeWidth={1.75} />
              Reset AI memory → Brain
            </Link>
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
