'use client';

import { CheckCircle2, Circle } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import type { Playbook, PlaybookTask } from '@/lib/types';

interface PlaybookTimelineProps {
  playbook: Playbook;
}

export function PlaybookTimeline({ playbook }: PlaybookTimelineProps) {
  const now = new Date();
  const startTime = playbook.startDate.getTime();
  const endTime = playbook.endDate.getTime();
  const totalDays = Math.max(
    1,
    Math.ceil((endTime - startTime) / (1000 * 60 * 60 * 24))
  );
  const currentDay = Math.max(
    1,
    Math.ceil((now.getTime() - startTime) / (1000 * 60 * 60 * 24))
  );

  const todayTasks = playbook.tasks.filter((t) => {
    const d = t.dueDate;
    return (
      d.getFullYear() === now.getFullYear() &&
      d.getMonth() === now.getMonth() &&
      d.getDate() === now.getDate()
    );
  });

  const getStepStatus = (
    task: PlaybookTask
  ): 'completed' | 'current' | 'upcoming' => {
    if (task.completed) return 'completed';
    const taskDay = Math.ceil(
      (task.dueDate.getTime() - startTime) / (1000 * 60 * 60 * 24)
    );
    if (taskDay <= currentDay) return 'current';
    return 'upcoming';
  };

  return (
    <section>
      <h2 className="mb-3 text-sm font-semibold">Active Playbook</h2>
      <Card className="gap-0 py-0">
        <CardContent className="space-y-4 p-4">
          {/* Header */}
          <div>
            <h3 className="text-sm font-semibold">{playbook.title}</h3>
            <p className="text-xs text-muted-foreground">
              Day {Math.min(currentDay, totalDays)} of {totalDays}
            </p>
          </div>

          {/* Horizontal step indicator */}
          <div className="flex items-start gap-0 overflow-x-auto py-2">
            {playbook.tasks.map((task, i) => {
              const status = getStepStatus(task);
              return (
                <div key={task.id} className="flex items-start">
                  {/* Step */}
                  <div className="flex flex-col items-center" title={task.title}>
                    {status === 'completed' ? (
                      <CheckCircle2
                        className="h-5 w-5 shrink-0 text-green-500"
                        strokeWidth={1.75}
                      />
                    ) : status === 'current' ? (
                      <div className="h-5 w-5 shrink-0 rounded-full border-2 border-blue-300 bg-blue-500 dark:border-blue-700" />
                    ) : (
                      <Circle
                        className="h-5 w-5 shrink-0 text-muted-foreground/40"
                        strokeWidth={1.75}
                      />
                    )}
                    <span
                      className={cn(
                        'mt-1 max-w-[80px] truncate text-center text-[10px]',
                        status === 'completed' &&
                          'text-green-600 dark:text-green-400',
                        status === 'current' &&
                          'font-medium text-blue-600 dark:text-blue-400',
                        status === 'upcoming' && 'text-muted-foreground'
                      )}
                    >
                      {task.title.length > 20
                        ? task.title.substring(0, 20) + '...'
                        : task.title}
                    </span>
                  </div>

                  {/* Connector line */}
                  {i < playbook.tasks.length - 1 && (
                    <div
                      className={cn(
                        'mx-1 mt-2.5 h-0.5 w-8 shrink-0',
                        status === 'completed'
                          ? 'bg-green-500'
                          : 'bg-muted-foreground/20'
                      )}
                    />
                  )}
                </div>
              );
            })}
          </div>

          {/* Today's playbook tasks */}
          {todayTasks.length > 0 && (
            <div className="space-y-2 border-t pt-3">
              <p className="text-xs font-medium text-muted-foreground">
                Today&apos;s playbook tasks
              </p>
              {todayTasks.map((task) => (
                <label
                  key={task.id}
                  className="flex cursor-pointer items-start gap-2"
                >
                  <input
                    type="checkbox"
                    defaultChecked={task.completed}
                    className="mt-0.5 rounded"
                    onChange={() => console.log('toggle task', task.id)}
                  />
                  <div>
                    <p className="text-sm">{task.title}</p>
                    <p className="text-xs text-muted-foreground">
                      {task.description}
                    </p>
                  </div>
                </label>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </section>
  );
}
