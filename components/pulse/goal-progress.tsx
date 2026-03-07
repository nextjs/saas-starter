'use client';

import { Target, TrendingUp, TrendingDown, Minus } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import type { GoalProgress as GoalProgressType } from '@/lib/types';

const paceConfig = {
  on_track: { label: 'On Track', className: 'bg-emerald-500/15 text-emerald-700 dark:text-emerald-400', icon: TrendingUp },
  behind: { label: 'Behind', className: 'bg-amber-500/15 text-amber-700 dark:text-amber-400', icon: TrendingDown },
  ahead: { label: 'Ahead', className: 'bg-blue-500/15 text-blue-700 dark:text-blue-400', icon: Minus },
} as const;

const progressColor = {
  on_track: '[&_[data-slot=progress-indicator]]:bg-emerald-500',
  behind: '[&_[data-slot=progress-indicator]]:bg-amber-500',
  ahead: '[&_[data-slot=progress-indicator]]:bg-blue-500',
} as const;

export function GoalProgressCard({ data }: { data: GoalProgressType[] }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-sm">Goal Progress</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {data.map((goal) => {
          const pace = paceConfig[goal.pace];
          const PaceIcon = pace.icon;
          return (
            <div key={goal.goalId} className="space-y-2">
              <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-2 min-w-0">
                  <Target className="h-4 w-4 shrink-0 text-muted-foreground" strokeWidth={1.75} />
                  <span className="text-sm font-medium truncate">{goal.title}</span>
                </div>
                <Badge variant="outline" className={cn('shrink-0 text-[10px] px-1.5 py-0', pace.className)}>
                  <PaceIcon className="h-3 w-3 mr-0.5" strokeWidth={1.75} />
                  {pace.label}
                </Badge>
              </div>
              <Progress
                value={Math.min(goal.progress, 100)}
                className={cn('h-2', progressColor[goal.pace])}
              />
              <div className="flex items-center justify-between text-xs text-muted-foreground">
                <span className="tabular-nums">
                  {goal.current}{goal.unit === '%' ? '%' : ` ${goal.unit}`} / {goal.target}{goal.unit === '%' ? '%' : ` ${goal.unit}`}
                </span>
                <span>{goal.progress}% complete</span>
              </div>
            </div>
          );
        })}
      </CardContent>
    </Card>
  );
}
