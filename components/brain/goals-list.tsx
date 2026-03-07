'use client';

import { useState } from 'react';
import { AlertTriangle, Pencil, X } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import type { Goal } from '@/lib/types';

const paceConfig = {
  on_track: { label: 'On Track', className: 'bg-emerald-500/15 text-emerald-700 dark:text-emerald-400' },
  behind: { label: 'Behind', className: 'bg-amber-500/15 text-amber-700 dark:text-amber-400' },
  ahead: { label: 'Ahead', className: 'bg-blue-500/15 text-blue-700 dark:text-blue-400' },
} as const;

const progressColor = {
  on_track: '[&_[data-slot=progress-indicator]]:bg-emerald-500',
  behind: '[&_[data-slot=progress-indicator]]:bg-amber-500',
  ahead: '[&_[data-slot=progress-indicator]]:bg-blue-500',
} as const;

function formatDeadline(date: Date): string {
  const now = new Date();
  const diff = Math.ceil((date.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
  if (diff < 0) return 'Overdue';
  if (diff === 0) return 'Today';
  if (diff === 1) return 'Tomorrow';
  if (diff <= 7) return `${diff}d left`;
  if (diff <= 30) return `${Math.ceil(diff / 7)}w left`;
  return `${Math.ceil(diff / 30)}mo left`;
}

export function GoalsList({ goals }: { goals: Goal[] }) {
  const [editing, setEditing] = useState(false);

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold">Goals</h3>
        <Button
          variant="ghost"
          size="sm"
          className="h-7 gap-1 px-2 text-xs text-muted-foreground"
          onClick={() => setEditing(!editing)}
        >
          {editing ? (
            <>
              <X className="h-3.5 w-3.5" strokeWidth={1.75} />
              Done
            </>
          ) : (
            <>
              <Pencil className="h-3.5 w-3.5" strokeWidth={1.75} />
              Edit Goals
            </>
          )}
        </Button>
      </div>

      {goals.length === 0 && (
        <p className="text-xs text-muted-foreground">No active goals. Use Chat to add one.</p>
      )}

      <div className="space-y-3">
        {goals.map((goal) => {
          const pace = paceConfig[goal.pace];
          return (
            <div key={goal.id} className="space-y-1.5">
              <div className="flex items-start justify-between gap-2">
                <div className="flex items-center gap-1.5 min-w-0">
                  {goal.pace === 'behind' && (
                    <AlertTriangle className="h-3.5 w-3.5 shrink-0 text-amber-500" strokeWidth={1.75} />
                  )}
                  <span className="text-sm truncate">{goal.title}</span>
                </div>
                <Badge variant="outline" className={cn('shrink-0 text-[10px] px-1.5 py-0', pace.className)}>
                  {pace.label}
                </Badge>
              </div>
              <Progress
                value={Math.min(goal.progress, 100)}
                className={cn('h-1.5', progressColor[goal.pace])}
              />
              <div className="flex items-center justify-between text-[11px] text-muted-foreground">
                <span>
                  {goal.current}{goal.unit === '%' ? '%' : ` ${goal.unit}`} / {goal.target}{goal.unit === '%' ? '%' : ` ${goal.unit}`}
                </span>
                <span>{formatDeadline(goal.deadline)}</span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
