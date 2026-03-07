'use client';

import { useState, useEffect } from 'react';
import { Check, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';

const analysisSteps = [
  { label: 'Found 847 posts across your platforms', delay: 1200 },
  { label: 'Identified your domain: AI & developer tools', delay: 2400 },
  { label: 'Mapped your writing style: direct, technical, conversational', delay: 3800 },
  { label: 'Found high-performance patterns in your content', delay: 5200 },
  { label: 'Generating your Brand Voice Profile...', delay: 6800 },
];

export function StepAnalyzing({ onDone }: { onDone: () => void }) {
  const [visibleCount, setVisibleCount] = useState(0);
  const [completedCount, setCompletedCount] = useState(0);

  useEffect(() => {
    const timers: NodeJS.Timeout[] = [];

    analysisSteps.forEach((step, i) => {
      // Show item
      timers.push(
        setTimeout(() => {
          setVisibleCount(i + 1);
        }, step.delay)
      );

      // Complete item (except last one which stays loading briefly)
      const isLast = i === analysisSteps.length - 1;
      timers.push(
        setTimeout(
          () => {
            setCompletedCount(i + 1);
          },
          isLast ? step.delay + 1500 : step.delay + 800
        )
      );
    });

    // Auto-advance after all done
    const lastDelay = analysisSteps[analysisSteps.length - 1].delay;
    timers.push(
      setTimeout(() => {
        onDone();
      }, lastDelay + 2200)
    );

    return () => timers.forEach(clearTimeout);
  }, [onDone]);

  return (
    <div className="flex flex-col items-center text-center gap-8">
      <div className="space-y-2">
        <h1 className="text-2xl font-semibold tracking-tight">
          Analyzing your content
        </h1>
        <p className="text-muted-foreground">
          Give us a moment while we study your style...
        </p>
      </div>

      <div className="flex flex-col gap-3 w-full">
        {analysisSteps.map((step, i) => {
          const isVisible = i < visibleCount;
          const isCompleted = i < completedCount;
          const isLoading = isVisible && !isCompleted;

          if (!isVisible) return null;

          return (
            <div
              key={i}
              className="flex items-center gap-3 rounded-lg border bg-card px-4 py-3 text-left animate-in fade-in slide-in-from-bottom-2 duration-300"
            >
              <div
                className={cn(
                  'flex h-6 w-6 shrink-0 items-center justify-center rounded-full transition-colors duration-300',
                  isCompleted
                    ? 'bg-green-500/10 text-green-600'
                    : 'text-muted-foreground'
                )}
              >
                {isCompleted ? (
                  <Check className="h-4 w-4" strokeWidth={2.5} />
                ) : isLoading ? (
                  <Loader2 className="h-4 w-4 animate-spin" strokeWidth={2} />
                ) : null}
              </div>
              <span
                className={cn(
                  'text-sm transition-colors duration-300',
                  isCompleted
                    ? 'text-foreground'
                    : 'text-muted-foreground'
                )}
              >
                {step.label}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
