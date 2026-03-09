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
    <svg width="150" height="100" viewBox="0 0 150 100" fill="none" className="mx-auto mb-3 sketch-float">
      {/* Extra sketchy lines around pot */}
      <path d="M30,70 Q32,68 35,70" stroke="#d4c9b8" strokeWidth="0.8" fill="none" strokeLinecap="round" />
      <path d="M115,65 Q117,62 120,64" stroke="#d4c9b8" strokeWidth="0.8" fill="none" strokeLinecap="round" />
      {/* Pot */}
      <rect x="45" y="55" width="60" height="35" rx="5" fill="#f5f0e8" stroke="#5c4b3a" strokeWidth="1.5" strokeDasharray="4,3"/>
      <line x1="45" y1="62" x2="105" y2="62" stroke="#d4c9b8" strokeWidth="1" strokeDasharray="3,2"/>
      {/* Pot rim detail */}
      <path d="M43,55 Q75,52 107,55" stroke="#5c4b3a" strokeWidth="1" fill="none" strokeLinecap="round" />
      {/* Stem */}
      <path d="M75,55 Q72,38 75,25" stroke="#7c9a6e" strokeWidth="2.5" fill="none" strokeLinecap="round"/>
      {/* Heart leaf - larger */}
      <path d="M75,25 Q62,12 75,3 Q88,12 75,25Z" fill="#7c9a6e" opacity="0.7" stroke="#7c9a6e" strokeWidth="1.2"/>
      <path d="M75,25 L75,8" stroke="#7c9a6e" strokeWidth="0.8"/>
      {/* Small leaf left */}
      <path d="M72,42 Q58,34 64,28" stroke="#7c9a6e" strokeWidth="1.5" fill="none" strokeLinecap="round"/>
      <ellipse cx="61" cy="32" rx="6" ry="3.5" fill="#7c9a6e" opacity="0.4" transform="rotate(-30 61 32)"/>
      {/* Small leaf right */}
      <path d="M78,36 Q92,30 88,24" stroke="#7c9a6e" strokeWidth="1.5" fill="none" strokeLinecap="round"/>
      <ellipse cx="89" cy="27" rx="5" ry="3" fill="#7c9a6e" opacity="0.3" transform="rotate(25 89 27)"/>
      {/* Soil dots */}
      <circle cx="58" cy="70" r="2" fill="#d4c9b8"/>
      <circle cx="68" cy="73" r="1.5" fill="#d4c9b8"/>
      <circle cx="75" cy="69" r="1" fill="#c4b9a8"/>
      <circle cx="82" cy="72" r="1.5" fill="#d4c9b8"/>
      <circle cx="92" cy="70" r="2" fill="#d4c9b8"/>
      {/* Sparkles - more of them */}
      <circle cx="25" cy="22" r="2.5" fill="#e07a5f" opacity="0.8"/>
      <circle cx="125" cy="18" r="2" fill="#f2d98b"/>
      <circle cx="118" cy="35" r="2.5" fill="#6b8cae" opacity="0.7"/>
      <circle cx="32" cy="42" r="1.5" fill="#f2d98b" opacity="0.6"/>
      {/* Small doodle stars */}
      <path d="M20,35 L22,31 L24,35 L20,33 L24,33 Z" fill="#e07a5f" opacity="0.4"/>
      <path d="M128,48 L129,46 L130,48 L128,47.2 L130,47.2 Z" fill="#7c9a6e" opacity="0.5"/>
      {/* Tiny scribble lines */}
      <path d="M35,85 Q38,83 42,85" stroke="#d4c9b8" strokeWidth="0.6" fill="none" />
      <path d="M108,82 Q112,80 115,83" stroke="#d4c9b8" strokeWidth="0.6" fill="none" />
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
    <div className="mx-auto max-w-5xl space-y-6 p-4 md:p-6 notebook-margin">
      <PulseIllustration />

      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
            <rect x="2" y="8" width="4" height="10" rx="1" fill="#e07a5f" stroke="#5c4b3a" strokeWidth="0.8"/>
            <rect x="8" y="4" width="4" height="14" rx="1" fill="#7c9a6e" stroke="#5c4b3a" strokeWidth="0.8"/>
            <rect x="14" y="6" width="4" height="12" rx="1" fill="#6b8cae" stroke="#5c4b3a" strokeWidth="0.8"/>
          </svg>
          <h1 className="text-lg font-bold text-[#5c4b3a] font-heading sketchy-underline">Pulse</h1>
        </div>

        {/* Time Range Toggle */}
        <div className="flex items-center sketch-border border-2 border-dashed border-[#d4c9b8] bg-[#f5f0e8] p-0.5">
          {timeRanges.map((range) => (
            <button
              key={range}
              onClick={() => setTimeRange(range)}
              className={cn(
                'sketch-btn px-3 py-1 text-xs font-semibold transition-colors cursor-pointer',
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
