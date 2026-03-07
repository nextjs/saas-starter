'use client';

import Link from 'next/link';
import { Twitter, Linkedin, Sparkles } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import type { CadenceTarget } from '@/lib/types';

function PlatformIcon({ platform }: { platform: string }) {
  switch (platform) {
    case 'twitter':
      return <Twitter className="h-4 w-4" strokeWidth={1.75} />;
    case 'linkedin':
      return <Linkedin className="h-4 w-4" strokeWidth={1.75} />;
    case 'reddit':
      return <span className="text-sm font-bold leading-none">r/</span>;
    case 'producthunt':
      return <span className="text-sm font-bold leading-none">PH</span>;
    default:
      return null;
  }
}

const platformLabels: Record<string, string> = {
  twitter: 'Twitter',
  linkedin: 'LinkedIn',
  reddit: 'Reddit',
  producthunt: 'Product Hunt',
};

function getStatusInfo(cadence: CadenceTarget): {
  text: string;
  color: string;
} {
  const remaining = cadence.postsPerWeek - cadence.currentWeek;
  if (remaining <= 0)
    return { text: 'on track', color: 'text-green-600 dark:text-green-400' };
  if (remaining === 1)
    return {
      text: 'need 1 more',
      color: 'text-amber-600 dark:text-amber-400',
    };
  return {
    text: `need ${remaining} more`,
    color: 'text-red-600 dark:text-red-400',
  };
}

interface CadenceOverviewProps {
  cadence: CadenceTarget[];
}

export function CadenceOverview({ cadence }: CadenceOverviewProps) {
  return (
    <section>
      <h2 className="mb-3 text-sm font-semibold">Cadence Overview</h2>

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {cadence.map((c) => {
          const pct = Math.min(
            100,
            Math.round((c.currentWeek / c.postsPerWeek) * 100)
          );
          const status = getStatusInfo(c);
          return (
            <Card key={c.platform} className="gap-0 py-0">
              <CardContent className="space-y-3 p-4">
                <div className="flex items-center gap-2">
                  <PlatformIcon platform={c.platform} />
                  <span className="text-sm font-medium">
                    {platformLabels[c.platform] ?? c.platform}
                  </span>
                </div>
                <p className="text-xs text-muted-foreground">
                  {c.currentWeek}/{c.postsPerWeek} posts this week
                </p>
                <Progress value={pct} className="h-1.5" />
                <p className={cn('text-xs font-medium', status.color)}>
                  {status.text}
                </p>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <div className="mt-4 flex flex-wrap items-center gap-3">
        <Button
          variant="outline"
          size="sm"
          onClick={() => console.log('auto-fill gaps')}
        >
          <Sparkles className="mr-1.5 h-3.5 w-3.5" strokeWidth={1.75} />
          Auto-fill gaps with AI drafts
        </Button>
        <Button variant="ghost" size="sm" asChild>
          <Link href="/brain">Adjust cadence &rarr; Brain</Link>
        </Button>
      </div>
    </section>
  );
}
