'use client';

import { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { ArrowRight } from 'lucide-react';

const questions = [
  {
    id: 'role',
    question: 'What do you do? Tell me about your work in a sentence or two.',
    placeholder: 'e.g., I build AI tools for developers...',
    type: 'text' as const,
  },
  {
    id: 'audience',
    question: 'Who are you trying to reach with your content?',
    placeholder: 'e.g., startup founders, indie hackers, devs...',
    type: 'text' as const,
  },
  {
    id: 'opinion',
    question: "What's a controversial opinion you have in your field?",
    placeholder: 'e.g., Most AI startups are just ChatGPT wrappers...',
    type: 'text' as const,
  },
  {
    id: 'creators',
    question: 'Name 2-3 creators whose content style you admire.',
    placeholder: 'e.g., @pmarca, Paul Graham, Sahil Lavingia...',
    type: 'text' as const,
  },
  {
    id: 'tone',
    question: 'How do you like to sound?',
    type: 'choice' as const,
    options: [
      { label: 'Formal & professional', value: 'formal' },
      { label: 'Casual & conversational', value: 'casual' },
      { label: 'Technical & precise', value: 'technical' },
      { label: 'Witty & opinionated', value: 'witty' },
    ],
  },
  {
    id: 'goals',
    question: "What's the #1 thing you want from social media?",
    type: 'choice' as const,
    options: [
      { label: 'Build an audience', value: 'audience' },
      { label: 'Drive leads / customers', value: 'leads' },
      { label: 'Establish thought leadership', value: 'authority' },
      { label: 'Just be more consistent', value: 'consistency' },
    ],
  },
];

export function StepBootstrap({ onDone }: { onDone: () => void }) {
  const [currentQ, setCurrentQ] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [inputValue, setInputValue] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    inputRef.current?.focus();
  }, [currentQ]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [currentQ]);

  function submitAnswer(value?: string) {
    const q = questions[currentQ];
    const answer = value || inputValue;
    if (!answer.trim()) return;

    setAnswers((prev) => ({ ...prev, [q.id]: answer }));
    setInputValue('');

    if (currentQ < questions.length - 1) {
      setCurrentQ(currentQ + 1);
    } else {
      onDone();
    }
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="text-center space-y-2">
        <h1 className="text-2xl font-semibold tracking-tight">
          Let&apos;s get to know you
        </h1>
        <p className="text-muted-foreground">
          A few quick questions so we can craft your voice.
        </p>
      </div>

      <div className="flex flex-col gap-4">
        {questions.slice(0, currentQ + 1).map((q, i) => {
          const isActive = i === currentQ;
          const answer = answers[q.id];

          return (
            <div
              key={q.id}
              className={cn(
                'animate-in fade-in slide-in-from-bottom-2 duration-300',
                !isActive && 'opacity-60'
              )}
            >
              {/* Question bubble */}
              <div className="flex gap-2 mb-2">
                <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-primary text-primary-foreground text-xs font-medium">
                  D
                </div>
                <div className="rounded-2xl rounded-tl-sm bg-muted px-4 py-2.5 text-sm">
                  {q.question}
                </div>
              </div>

              {/* Answer */}
              {answer ? (
                <div className="flex justify-end">
                  <div className="rounded-2xl rounded-tr-sm bg-primary/10 px-4 py-2.5 text-sm max-w-[80%]">
                    {answer}
                  </div>
                </div>
              ) : isActive ? (
                q.type === 'choice' ? (
                  <div className="flex flex-wrap gap-2 pl-9">
                    {q.options!.map((opt) => (
                      <button
                        key={opt.value}
                        onClick={() => submitAnswer(opt.label)}
                        className="rounded-full border-2 border-border px-4 py-2 text-sm font-medium transition-colors hover:border-primary hover:bg-primary/5 cursor-pointer"
                      >
                        {opt.label}
                      </button>
                    ))}
                  </div>
                ) : (
                  <div className="flex gap-2 pl-9">
                    <input
                      ref={inputRef}
                      type="text"
                      value={inputValue}
                      onChange={(e) => setInputValue(e.target.value)}
                      onKeyDown={(e) => e.key === 'Enter' && submitAnswer()}
                      placeholder={q.placeholder}
                      className="flex-1 rounded-xl border bg-background px-4 py-2.5 text-sm outline-none focus:border-primary transition-colors"
                    />
                    <Button
                      size="icon"
                      className="rounded-xl shrink-0"
                      disabled={!inputValue.trim()}
                      onClick={() => submitAnswer()}
                    >
                      <ArrowRight className="h-4 w-4" strokeWidth={1.75} />
                    </Button>
                  </div>
                )
              ) : null}
            </div>
          );
        })}
        <div ref={bottomRef} />
      </div>
    </div>
  );
}
