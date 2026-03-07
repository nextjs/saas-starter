'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

const goalOptions = [
  { id: 'growth', label: 'Grow followers', emoji: '📈' },
  { id: 'authority', label: 'Build authority', emoji: '🎯' },
  { id: 'consistency', label: 'Stay consistent', emoji: '📅' },
  { id: 'pipeline', label: 'Drive leads', emoji: '🔗' },
];

const platformFocus = [
  { id: 'twitter', label: 'Twitter-first' },
  { id: 'linkedin', label: 'LinkedIn-first' },
  { id: 'balanced', label: 'Balanced' },
];

export function StepGoals({
  onNext,
  onBack,
}: {
  onNext: () => void;
  onBack: () => void;
}) {
  const [selectedGoals, setSelectedGoals] = useState<string[]>([]);
  const [selectedPlatform, setSelectedPlatform] = useState<string | null>(null);

  function toggleGoal(id: string) {
    setSelectedGoals((prev) =>
      prev.includes(id) ? prev.filter((g) => g !== id) : [...prev, id]
    );
  }

  const showRecommendation = selectedGoals.length > 0 && selectedPlatform;

  return (
    <div className="flex flex-col gap-6">
      <div className="text-center space-y-2">
        <h1 className="text-2xl font-semibold tracking-tight">
          Set your goals
        </h1>
        <p className="text-muted-foreground">
          What do you want to achieve? Pick all that apply.
        </p>
      </div>

      {/* Goal chips */}
      <div className="space-y-2">
        <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
          Goals
        </p>
        <div className="grid grid-cols-2 gap-2">
          {goalOptions.map((goal) => {
            const isSelected = selectedGoals.includes(goal.id);
            return (
              <button
                key={goal.id}
                onClick={() => toggleGoal(goal.id)}
                className={cn(
                  'flex items-center gap-2 rounded-xl border-2 px-4 py-3 text-sm font-medium transition-all cursor-pointer',
                  isSelected
                    ? 'border-primary bg-primary/5'
                    : 'border-border hover:border-primary/40'
                )}
              >
                <span>{goal.emoji}</span>
                <span>{goal.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Platform focus */}
      <div className="space-y-2">
        <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
          Platform Focus
        </p>
        <div className="flex gap-2">
          {platformFocus.map((pf) => {
            const isSelected = selectedPlatform === pf.id;
            return (
              <button
                key={pf.id}
                onClick={() => setSelectedPlatform(pf.id)}
                className={cn(
                  'flex-1 rounded-xl border-2 px-3 py-2.5 text-sm font-medium transition-all cursor-pointer',
                  isSelected
                    ? 'border-primary bg-primary/5'
                    : 'border-border hover:border-primary/40'
                )}
              >
                {pf.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* AI recommendation */}
      {showRecommendation && (
        <div className="rounded-xl border bg-card p-4 space-y-2 animate-in fade-in slide-in-from-bottom-2 duration-300">
          <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
            AI Recommendation
          </p>
          <p className="text-sm leading-relaxed">
            Based on your goals, I recommend posting{' '}
            <span className="font-semibold">5x per week</span> &mdash; 3 on{' '}
            {selectedPlatform === 'linkedin' ? 'LinkedIn' : 'Twitter'} and 2 on{' '}
            {selectedPlatform === 'linkedin' ? 'Twitter' : 'LinkedIn'}. Mix of
            short takes, threads, and one long-form post weekly. I&apos;ll have
            your drafts ready each morning.
          </p>
        </div>
      )}

      {/* Actions */}
      <div className="flex gap-3 pt-2">
        <Button
          variant="outline"
          className="rounded-xl h-12"
          onClick={onBack}
        >
          Back
        </Button>
        <Button
          className="flex-1 rounded-xl h-12 text-base"
          disabled={!showRecommendation}
          onClick={onNext}
        >
          Looks good
        </Button>
      </div>
    </div>
  );
}
