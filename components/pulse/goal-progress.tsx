'use client';

import { Target, TrendingUp, TrendingDown, Minus } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import type { GoalProgress as GoalProgressType } from '@/lib/types';

const paceConfig = {
  on_track: { label: 'On Track', className: 'bg-[#7c9a6e]/15 text-[#7c9a6e] border-[#7c9a6e]/30', icon: TrendingUp },
  behind: { label: 'Behind', className: 'bg-[#e07a5f]/15 text-[#e07a5f] border-[#e07a5f]/30', icon: TrendingDown },
  ahead: { label: 'Ahead', className: 'bg-[#6b8cae]/15 text-[#6b8cae] border-[#6b8cae]/30', icon: Minus },
} as const;

const progressColor = {
  on_track: '[&_[data-slot=progress-indicator]]:bg-[#7c9a6e]',
  behind: '[&_[data-slot=progress-indicator]]:bg-[#e07a5f]',
  ahead: '[&_[data-slot=progress-indicator]]:bg-[#6b8cae]',
} as const;

export function GoalProgressCard({ data }: { data: GoalProgressType[] }) {
  return (
    <div className="rounded-xl border-2 border-dashed border-[#d4c9b8] bg-[#faf8f5] p-4 space-y-4">
      <h3 className="text-sm font-bold text-[#5c4b3a]">Goal Progress</h3>

      {data.map((goal) => {
        const pace = paceConfig[goal.pace];
        const PaceIcon = pace.icon;
        return (
          <div key={goal.goalId} className="space-y-2">
            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-2 min-w-0">
                <Target className="h-4 w-4 shrink-0 text-[#5c4b3a]/60" strokeWidth={1.75} />
                <span className="text-sm font-medium truncate text-[#5c4b3a]">{goal.title}</span>
              </div>
              <Badge variant="outline" className={cn('shrink-0 text-[10px] px-1.5 py-0 border-dashed', pace.className)}>
                <PaceIcon className="h-3 w-3 mr-0.5" strokeWidth={1.75} />
                {pace.label}
              </Badge>
            </div>
            <Progress
              value={Math.min(goal.progress, 100)}
              className={cn('h-2 sketchy-bar border border-[#d4c9b8]', progressColor[goal.pace])}
            />
            <div className="flex items-center justify-between text-xs text-[#5c4b3a]/60">
              <span className="tabular-nums">
                {goal.current}{goal.unit === '%' ? '%' : ` ${goal.unit}`} / {goal.target}{goal.unit === '%' ? '%' : ` ${goal.unit}`}
              </span>
              <span>{goal.progress}% complete</span>
            </div>
          </div>
        );
      })}
    </div>
  );
}
