'use client';

import { useState } from 'react';
import { AlertTriangle, Pencil, X } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import type { Goal } from '@/lib/types';

const paceConfig = {
  on_track: { label: 'On Track', className: 'bg-[#7c9a6e]/15 text-[#7c9a6e] border-[#7c9a6e]/30' },
  behind: { label: 'Behind', className: 'bg-[#e07a5f]/15 text-[#e07a5f] border-[#e07a5f]/30' },
  ahead: { label: 'Ahead', className: 'bg-[#6b8cae]/15 text-[#6b8cae] border-[#6b8cae]/30' },
} as const;

const progressColor = {
  on_track: '[&_[data-slot=progress-indicator]]:bg-[#7c9a6e]',
  behind: '[&_[data-slot=progress-indicator]]:bg-[#e07a5f]',
  ahead: '[&_[data-slot=progress-indicator]]:bg-[#6b8cae]',
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
        <h3 className="text-sm font-bold text-[#5c4b3a]">Goals</h3>
        <Button
          variant="ghost"
          size="sm"
          className="h-7 gap-1 px-2 text-xs text-[#5c4b3a]/60"
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
        <p className="text-xs text-[#5c4b3a]/50">No active goals. Use Chat to add one.</p>
      )}

      <div className="space-y-3">
        {goals.map((goal) => {
          const pace = paceConfig[goal.pace];
          return (
            <div key={goal.id} className="space-y-1.5">
              <div className="flex items-start justify-between gap-2">
                <div className="flex items-center gap-1.5 min-w-0">
                  {goal.pace === 'behind' && (
                    <AlertTriangle className="h-3.5 w-3.5 shrink-0 text-[#e07a5f]" strokeWidth={1.75} />
                  )}
                  <span className="text-sm truncate text-[#5c4b3a]">{goal.title}</span>
                </div>
                <Badge variant="outline" className={cn('shrink-0 text-[10px] px-1.5 py-0 border-dashed', pace.className)}>
                  {pace.label}
                </Badge>
              </div>
              <Progress
                value={Math.min(goal.progress, 100)}
                className={cn('h-2 sketchy-bar border border-[#d4c9b8]', progressColor[goal.pace])}
              />
              <div className="flex items-center justify-between text-[11px] text-[#5c4b3a]/60">
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
