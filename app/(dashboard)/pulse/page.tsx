'use client';

import { useState } from 'react';
import { BarChart3 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { StrategyHealthCard } from '@/components/pulse/strategy-health';
import { GoalProgressCard } from '@/components/pulse/goal-progress';
import { AIInsightsCard } from '@/components/pulse/ai-insights';
import { NumbersOverview } from '@/components/pulse/numbers-overview';
import { TopContentCard } from '@/components/pulse/top-content';
import { AILearningCard } from '@/components/pulse/ai-learning';
import {
  getStrategyHealth,
  getGoalProgress,
  getAIInsights,
  getPlatformStats,
  getPerformanceData,
  getTopContent,
  getWorstContent,
  getAILearningProgress,
  getLearnedPatterns,
} from '@/lib/mock-data-helpers';

const timeRanges = ['7d', '30d', '90d'] as const;

export default function PulsePage() {
  const [timeRange, setTimeRange] = useState<(typeof timeRanges)[number]>('7d');

  const strategyHealth = getStrategyHealth();
  const goalProgress = getGoalProgress();
  const aiInsights = getAIInsights();
  const platformStats = getPlatformStats();
  const performanceData = getPerformanceData();
  const bestContent = getTopContent();
  const worstContent = getWorstContent();
  const aiLearning = getAILearningProgress();
  const patterns = getLearnedPatterns();

  return (
    <div className="mx-auto max-w-5xl space-y-6 p-4 md:p-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <BarChart3 className="h-5 w-5" strokeWidth={1.75} />
          <h1 className="text-lg font-semibold">Pulse</h1>
        </div>

        {/* Time Range Toggle */}
        <div className="flex items-center rounded-lg border bg-muted/50 p-0.5">
          {timeRanges.map((range) => (
            <button
              key={range}
              onClick={() => setTimeRange(range)}
              className={cn(
                'rounded-md px-3 py-1 text-xs font-medium transition-colors cursor-pointer',
                timeRange === range
                  ? 'bg-background text-foreground shadow-sm'
                  : 'text-muted-foreground hover:text-foreground'
              )}
            >
              {range}
            </button>
          ))}
        </div>
      </div>

      {/* Grid Layout */}
      <div className="grid gap-6 md:grid-cols-2">
        {/* Left Column */}
        <div className="space-y-6">
          <StrategyHealthCard data={strategyHealth} />
          <GoalProgressCard data={goalProgress} />
          <AIInsightsCard data={aiInsights} />
        </div>

        {/* Right Column */}
        <div className="space-y-6">
          <NumbersOverview
            platformStats={platformStats}
            performanceData={performanceData}
            timeRange={timeRange}
          />
          <TopContentCard bestContent={bestContent} worstContent={worstContent} />
          <AILearningCard learning={aiLearning} patterns={patterns} />
        </div>
      </div>
    </div>
  );
}
