'use client';

import { useState, useEffect } from 'react';
import { Sparkles, Activity, Wand2, Music2 } from 'lucide-react';
import { cn } from '@/lib/utils';

const STEPS = [
  { id: 1, label: 'ANALYZING PROMPT', icon: Activity, color: 'text-cyan' },
  { id: 2, label: 'GENERATING STRUCTURE', icon: Wand2, color: 'text-rose' },
  { id: 3, label: 'SYNTHESIZING VOCALS', icon: Sparkles, color: 'text-gold' },
  { id: 4, label: 'MASTERING PREVIEW', icon: Music2, color: 'text-indigo' }
];

export function QuickStartProcessing({ onComplete }: { onComplete: () => void }) {
  const [currentStep, setCurrentStep] = useState(0);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const stepInterval = setInterval(() => {
      setCurrentStep(prev => {
        if (prev >= STEPS.length - 1) {
          clearInterval(stepInterval);
          setTimeout(onComplete, 1000);
          return prev;
        }
        return prev + 1;
      });
    }, 2000);

    const progressInterval = setInterval(() => {
      setProgress(prev => {
        if (prev >= 100) {
          clearInterval(progressInterval);
          return 100;
        }
        return prev + 1;
      });
    }, 80);

    return () => {
      clearInterval(stepInterval);
      clearInterval(progressInterval);
    };
  }, [onComplete]);

  return (
    <div className="w-full max-w-5xl mx-auto px-6">
      <div className="bg-[#0c0c14] border-2 border-zinc-900 rounded-[3rem] p-12 sm:p-20 relative overflow-hidden flex flex-col items-center justify-center min-h-[600px]">
        {/* Animated Background */}
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(88,80,236,0.05),transparent)] animate-pulse" />

        {/* Progress Circle */}
        <div className="relative size-48 sm:size-64 mb-16">
          <svg className="size-full -rotate-90">
            <circle
              cx="50%" cy="50%" r="48%"
              className="fill-none stroke-zinc-900 stroke-[4]"
            />
            <circle
              cx="50%" cy="50%" r="48%"
              className="fill-none stroke-[#5850ec] stroke-[4] transition-all duration-300"
              strokeDasharray="100 100"
              strokeDashoffset={100 - progress}
              strokeLinecap="round"
            />
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className="text-4xl sm:text-6xl font-black italic tracking-tighter text-white">{progress}%</span>
            <span className="text-[10px] font-black tracking-[0.3em] text-zinc-600 uppercase mt-2">PROCESSING</span>
          </div>
        </div>

        {/* Steps List */}
        <div className="w-full max-w-sm space-y-6">
          {STEPS.map((step, idx) => {
            const Icon = step.icon;
            const isActive = idx === currentStep;
            const isCompleted = idx < currentStep;

            return (
              <div
                key={step.id}
                className={cn(
                  "flex items-center gap-6 transition-all duration-500",
                  isActive ? "opacity-100 scale-105" : "opacity-20 grayscale",
                  isCompleted && "opacity-40 grayscale-0"
                )}
              >
                <div className={cn(
                  "p-3 rounded-xl border-2 transition-colors",
                  isActive ? "bg-zinc-900 border-[#5850ec] text-[#5850ec]" : "bg-transparent border-zinc-900 text-zinc-600"
                )}>
                  <Icon className="size-5" />
                </div>
                <div className="flex flex-col">
                  <span className={cn(
                    "text-[11px] font-black tracking-[0.4em] uppercase italic transition-colors",
                    isActive ? "text-white" : "text-zinc-600"
                  )}>
                    {step.label}
                  </span>
                  {isActive && (
                    <span className="text-[9px] font-bold text-[#5850ec] tracking-widest mt-1 animate-pulse">
                      OPTIMIZING NEURAL PATHS...
                    </span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
