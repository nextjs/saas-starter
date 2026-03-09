'use client';

import { Brain, Sparkles, CheckCircle, RotateCcw, Lightbulb } from 'lucide-react';
import Link from 'next/link';
import { cn } from '@/lib/utils';
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
        <span className="text-sm font-medium text-[#5c4b3a]">{label}</span>
        <span className={cn(
          'text-lg font-bold tabular-nums',
          currentValue >= 75 ? 'text-[#7c9a6e]' :
          currentValue >= 50 ? 'text-[#f2d98b]' :
          'text-[#e07a5f]'
        )}>
          {currentValue}%
        </span>
      </div>
      <div className="h-24 sketch-chart">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={chartData} margin={{ top: 5, right: 5, bottom: 5, left: 5 }}>
            <XAxis dataKey="week" tick={{ fontSize: 10, fill: '#5c4b3a' }} stroke="#d4c9b8" />
            <YAxis domain={[0, 100]} tick={{ fontSize: 10, fill: '#5c4b3a' }} stroke="#d4c9b8" width={28} />
            <Tooltip contentStyle={{ fontSize: 12, borderRadius: 12, border: '2px dashed #d4c9b8', backgroundColor: '#faf8f5' }} />
            <Line
              type="monotone"
              dataKey="value"
              stroke="#6b8cae"
              strokeWidth={2}
              dot={{ r: 3, fill: '#6b8cae' }}
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
    <div className="sketch-border border-2 border-dashed border-[#d4c9b8] bg-[#f3ece0] p-4 space-y-6">
      <div className="flex items-center gap-2">
        <Sparkles className="h-4 w-4 text-[#f2d98b]" strokeWidth={1.75} />
        <h3 className="text-sm font-bold text-[#5c4b3a] font-heading sketchy-underline">AI Learning Progress</h3>
      </div>

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
      <div className="grid grid-cols-3 gap-4 rounded-xl border-2 border-dashed border-[#d4c9b8] p-3">
        <div className="text-center">
          <p className="text-lg font-bold tabular-nums text-[#5c4b3a]">{patterns.length * 47}</p>
          <p className="text-[11px] text-[#5c4b3a]/60">Total Interactions</p>
        </div>
        <div className="text-center">
          <p className="text-lg font-bold tabular-nums text-[#5c4b3a]">{patterns.length}</p>
          <p className="text-[11px] text-[#5c4b3a]/60">Learned Patterns</p>
        </div>
        <div className="text-center">
          <p className="text-lg font-bold tabular-nums text-[#5c4b3a]">{patterns.filter(p => p.confidence > 70).length}</p>
          <p className="text-[11px] text-[#5c4b3a]/60">Active Rules</p>
        </div>
      </div>

      {/* Recent Learnings */}
      <div className="space-y-3">
        <h4 className="text-xs font-medium text-[#5c4b3a]/60">Recent Learnings</h4>
        {learning.learnedThisWeek.map((item, i) => (
          <div key={i} className="space-y-1.5 rounded-xl border-2 border-dashed border-[#d4c9b8] p-3">
            <div className="flex items-start gap-2">
              <Lightbulb className="h-4 w-4 text-[#f2d98b] mt-0.5 shrink-0" />
              <p className="text-sm text-[#5c4b3a]">{item}</p>
            </div>
            <div className="flex gap-1.5 pl-6">
              <Button variant="outline" size="sm" className="h-6 gap-1 px-2 text-[11px] border-dashed border-[#7c9a6e] text-[#7c9a6e] rounded-xl">
                <CheckCircle className="h-3 w-3" strokeWidth={1.75} />
                Correct
              </Button>
              <Button variant="ghost" size="sm" className="h-6 gap-1 px-2 text-[11px] text-[#5c4b3a]/50">
                <RotateCcw className="h-3 w-3" strokeWidth={1.75} />
                One-time
              </Button>
            </div>
          </div>
        ))}
      </div>

      {/* Links */}
      <div className="flex flex-col gap-1.5">
        <Button variant="ghost" size="sm" className="justify-start gap-1.5 text-xs text-[#5c4b3a]/60" asChild>
          <Link href="/brain">
            View all learned patterns &rarr;
          </Link>
        </Button>
        <Button variant="ghost" size="sm" className="justify-start gap-1.5 text-xs text-[#5c4b3a]/50" asChild>
          <Link href="/brain">
            <Brain className="h-3.5 w-3.5" strokeWidth={1.75} />
            Reset AI memory &rarr; Brain
          </Link>
        </Button>
      </div>
    </div>
  );
}
