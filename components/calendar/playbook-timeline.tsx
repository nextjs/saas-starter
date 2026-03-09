'use client';

import { CheckCircle2, Circle } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { Playbook, PlaybookTask } from '@/lib/types';

interface PlaybookTimelineProps { playbook: Playbook; }

export function PlaybookTimeline({ playbook }: PlaybookTimelineProps) {
  const now = new Date();
  const startTime = playbook.startDate.getTime();
  const endTime = playbook.endDate.getTime();
  const totalDays = Math.max(1, Math.ceil((endTime - startTime) / (1000 * 60 * 60 * 24)));
  const currentDay = Math.max(1, Math.ceil((now.getTime() - startTime) / (1000 * 60 * 60 * 24)));

  const todayTasks = playbook.tasks.filter((t) => {
    const d = t.dueDate;
    return d.getFullYear() === now.getFullYear() && d.getMonth() === now.getMonth() && d.getDate() === now.getDate();
  });

  const getStepStatus = (task: PlaybookTask): 'completed' | 'current' | 'upcoming' => {
    if (task.completed) return 'completed';
    const taskDay = Math.ceil((task.dueDate.getTime() - startTime) / (1000 * 60 * 60 * 24));
    if (taskDay <= currentDay) return 'current';
    return 'upcoming';
  };

  return (
    <section>
      <h2 className="mb-3 text-sm font-bold text-[#5c4b3a]">Active Playbook</h2>
      <div className="sketch-card p-4 space-y-4">
        <div>
          <h3 className="text-sm font-bold text-[#5c4b3a]">{playbook.title}</h3>
          <p className="text-xs text-[#5c4b3a]/60">Day {Math.min(currentDay, totalDays)} of {totalDays}</p>
        </div>

        <div className="flex items-start gap-0 overflow-x-auto py-2">
          {playbook.tasks.map((task, i) => {
            const status = getStepStatus(task);
            return (
              <div key={task.id} className="flex items-start">
                <div className="flex flex-col items-center" title={task.title}>
                  {status === 'completed' ? (
                    <CheckCircle2 className="h-5 w-5 shrink-0 text-[#7c9a6e]" strokeWidth={1.75} />
                  ) : status === 'current' ? (
                    <div className="h-5 w-5 shrink-0 rounded-full border-2 border-dashed border-[#e07a5f] bg-[#e07a5f]" />
                  ) : (
                    <Circle className="h-5 w-5 shrink-0 text-[#d4c9b8]" strokeWidth={1.75} />
                  )}
                  <span className={cn(
                    'mt-1 max-w-[80px] truncate text-center text-[10px]',
                    status === 'completed' && 'text-[#7c9a6e]',
                    status === 'current' && 'font-semibold text-[#e07a5f]',
                    status === 'upcoming' && 'text-[#5c4b3a]/50'
                  )}>
                    {task.title.length > 20 ? task.title.substring(0, 20) + '...' : task.title}
                  </span>
                </div>
                {i < playbook.tasks.length - 1 && (
                  <div className={cn('mx-1 mt-2.5 h-px w-8 shrink-0 border-t-2 border-dashed', status === 'completed' ? 'border-[#7c9a6e]' : 'border-[#d4c9b8]')} />
                )}
              </div>
            );
          })}
        </div>

        {todayTasks.length > 0 && (
          <div className="space-y-2 border-t-2 border-dashed border-[#d4c9b8] pt-3">
            <p className="text-xs font-semibold text-[#5c4b3a]/60">Today&apos;s playbook tasks</p>
            {todayTasks.map((task) => (
              <label key={task.id} className="flex cursor-pointer items-start gap-2">
                <input type="checkbox" defaultChecked={task.completed} className="mt-0.5 rounded accent-[#e07a5f]" onChange={() => console.log('toggle task', task.id)} />
                <div>
                  <p className="text-sm text-[#5c4b3a]">{task.title}</p>
                  <p className="text-xs text-[#5c4b3a]/60">{task.description}</p>
                </div>
              </label>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
