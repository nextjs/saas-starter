'use client';

import { useState, useCallback } from 'react';
import { cn } from '@/lib/utils';
import { StepWelcome } from './step-welcome';
import { StepAnalyzing } from './step-analyzing';
import { StepBootstrap } from './step-bootstrap';
import { StepConfirm } from './step-confirm';
import { StepGoals } from './step-goals';
import { StepFirstPost } from './step-first-post';
import { StepDone } from './step-done';

const TOTAL_STEPS = 6;

export function OnboardingWizard() {
  const [step, setStep] = useState(1);
  const [direction, setDirection] = useState<'forward' | 'back'>('forward');
  const [hasHistory, setHasHistory] = useState(true);
  const [connectedPlatforms, setConnectedPlatforms] = useState<string[]>([]);

  const goTo = useCallback(
    (next: number) => {
      setDirection(next > step ? 'forward' : 'back');
      setStep(next);
    },
    [step]
  );

  const next = useCallback(() => goTo(step + 1), [goTo, step]);
  const back = useCallback(() => goTo(step - 1), [goTo, step]);

  function handlePlatformConnect(platforms: string[]) {
    setConnectedPlatforms(platforms);
    if (platforms.length === 0) {
      setHasHistory(false);
      // Skip analyzing, go to bootstrap
      goTo(3);
    } else {
      setHasHistory(true);
      next();
    }
  }

  function handleAnalyzingDone() {
    // After analyzing, go to confirm (step 3 when analyzing is step 2)
    goTo(3);
  }

  function handleBootstrapDone() {
    goTo(4);
  }

  function renderStep() {
    switch (step) {
      case 1:
        return <StepWelcome onConnect={handlePlatformConnect} />;
      case 2:
        return hasHistory ? (
          <StepAnalyzing onDone={handleAnalyzingDone} />
        ) : (
          <StepBootstrap onDone={handleBootstrapDone} />
        );
      case 3:
        return hasHistory ? (
          <StepConfirm onNext={next} onBack={back} />
        ) : (
          <StepConfirm onNext={next} onBack={back} />
        );
      case 4:
        return <StepGoals onNext={next} onBack={back} />;
      case 5:
        return <StepFirstPost onNext={next} onBack={back} />;
      case 6:
        return <StepDone />;
      default:
        return null;
    }
  }

  return (
    <div className="flex flex-col items-center gap-8">
      {/* Progress dots */}
      {step < 6 && (
        <div className="flex items-center gap-2">
          {Array.from({ length: TOTAL_STEPS }, (_, i) => {
            const stepNum = i + 1;
            const isActive = stepNum === step;
            const isCompleted = stepNum < step;
            return (
              <div
                key={stepNum}
                className={cn(
                  'h-2 rounded-full transition-all duration-300',
                  isActive
                    ? 'w-6 bg-primary'
                    : isCompleted
                      ? 'w-2 bg-primary/40'
                      : 'w-2 bg-muted-foreground/20'
                )}
              />
            );
          })}
        </div>
      )}

      {/* Step content with transition */}
      <div
        key={step}
        className={cn(
          'w-full animate-in fade-in duration-300',
          direction === 'forward' ? 'slide-in-from-right-4' : 'slide-in-from-left-4'
        )}
      >
        {renderStep()}
      </div>
    </div>
  );
}
