'use client';

import { useState } from 'react';
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

function PulseIllustration() {
  return (
    <svg width="120" height="80" viewBox="0 0 120 80" fill="none" className="mx-auto mb-3">
      {/* Pot */}
      <rect x="40" y="50" width="40" height="25" rx="4" fill="#f5f0e8" stroke="#5c4b3a" strokeWidth="1.5" strokeDasharray="4,3"/>
      <line x1="40" y1="55" x2="80" y2="55" stroke="#d4c9b8" strokeWidth="1" strokeDasharray="3,2"/>
      {/* Stem */}
      <path d="M60,50 Q58,35 60,25" stroke="#7c9a6e" strokeWidth="2" fill="none" strokeLinecap="round"/>
      {/* Heart leaf */}
      <path d="M60,25 Q50,15 60,8 Q70,15 60,25Z" fill="#7c9a6e" opacity="0.7" stroke="#7c9a6e" strokeWidth="1"/>
      <path d="M60,25 L60,12" stroke="#7c9a6e" strokeWidth="0.8"/>
      {/* Small leaf */}
      <path d="M58,38 Q48,32 52,28" stroke="#7c9a6e" strokeWidth="1.5" fill="none" strokeLinecap="round"/>
      <ellipse cx="50" cy="30" rx="5" ry="3" fill="#7c9a6e" opacity="0.4" transform="rotate(-30 50 30)"/>
      {/* Soil dots */}
      <circle cx="50" cy="60" r="1.5" fill="#d4c9b8"/>
      <circle cx="60" cy="62" r="1" fill="#d4c9b8"/>
      <circle cx="70" cy="60" r="1.5" fill="#d4c9b8"/>
      {/* Sparkles */}
      <circle cx="30" cy="20" r="2" fill="#e07a5f"/>
      <circle cx="90" cy="15" r="1.5" fill="#f2d98b"/>
      <circle cx="85" cy="30" r="2" fill="#6b8cae"/>
    </svg>
  );
}

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
      <PulseIllustration />

      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
            <rect x="2" y="8" width="4" height="10" rx="1" fill="#e07a5f" stroke="#5c4b3a" strokeWidth="0.8"/>
            <rect x="8" y="4" width="4" height="14" rx="1" fill="#7c9a6e" stroke="#5c4b3a" strokeWidth="0.8"/>
            <rect x="14" y="6" width="4" height="12" rx="1" fill="#6b8cae" stroke="#5c4b3a" strokeWidth="0.8"/>
          </svg>
          <h1 className="text-lg font-bold text-[#5c4b3a]">Pulse</h1>
        </div>

        {/* Time Range Toggle */}
        <div className="flex items-center rounded-xl border-2 border-dashed border-[#d4c9b8] bg-[#f5f0e8] p-0.5">
          {timeRanges.map((range) => (
            <button
              key={range}
              onClick={() => setTimeRange(range)}
              className={cn(
                'rounded-lg px-3 py-1 text-xs font-semibold transition-colors cursor-pointer',
                timeRange === range
                  ? 'bg-[#e07a5f] text-white shadow-sm'
                  : 'text-[#5c4b3a]/60 hover:text-[#5c4b3a]'
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
