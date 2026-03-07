'use client';

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { ArrowRight, Check } from 'lucide-react';

const setupItems = [
  'Brand Voice Profile created',
  'Content pillars defined',
  'Publishing cadence set',
  'First post scheduled',
];

export function StepDone() {
  return (
    <div className="flex flex-col items-center text-center gap-8">
      {/* Success icon */}
      <div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
        <span className="text-3xl">&#10024;</span>
      </div>

      <div className="space-y-2">
        <h1 className="text-2xl font-semibold tracking-tight">
          You&apos;re all set!
        </h1>
        <p className="text-muted-foreground">
          Your AI social strategist is ready to go. Here&apos;s what we set up:
        </p>
      </div>

      {/* Setup summary */}
      <div className="flex flex-col gap-2 w-full">
        {setupItems.map((item) => (
          <div
            key={item}
            className="flex items-center gap-3 rounded-lg border bg-card px-4 py-3 text-left"
          >
            <div className="flex h-5 w-5 items-center justify-center rounded-full bg-green-500/10 text-green-600">
              <Check className="h-3 w-3" strokeWidth={3} />
            </div>
            <span className="text-sm">{item}</span>
          </div>
        ))}
      </div>

      {/* CTA */}
      <Button
        asChild
        size="lg"
        className="w-full rounded-xl h-12 text-base gap-2"
      >
        <Link href="/flow">
          Go to Flow
          <ArrowRight className="h-4 w-4" strokeWidth={1.75} />
        </Link>
      </Button>
    </div>
  );
}
