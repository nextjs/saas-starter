'use client';

import Link from 'next/link';
import { Twitter, Linkedin, Sparkles } from 'lucide-react';
import { Progress } from '@/components/ui/progress';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import type { CadenceTarget } from '@/lib/types';

function PlatformIcon({ platform }: { platform: string }) {
  switch (platform) {
    case 'twitter': return <Twitter className="h-4 w-4" strokeWidth={1.75} />;
    case 'linkedin': return <Linkedin className="h-4 w-4" strokeWidth={1.75} />;
    case 'reddit': return <span className="text-sm font-bold leading-none">r/</span>;
    case 'producthunt': return <span className="text-sm font-bold leading-none">PH</span>;
    default: return null;
  }
}

const platformLabels: Record<string, string> = {
  twitter: 'Twitter', linkedin: 'LinkedIn', reddit: 'Reddit', producthunt: 'Product Hunt',
};

function getStatusInfo(cadence: CadenceTarget): { text: string; color: string } {
  const remaining = cadence.postsPerWeek - cadence.currentWeek;
  if (remaining <= 0) return { text: 'on track', color: 'text-[#7c9a6e]' };
  if (remaining === 1) return { text: 'need 1 more', color: 'text-[#f2d98b]' };
  return { text: `need ${remaining} more`, color: 'text-[#e07a5f]' };
}

interface CadenceOverviewProps { cadence: CadenceTarget[]; }

export function CadenceOverview({ cadence }: CadenceOverviewProps) {
  return (
    <section>
      <h2 className="mb-3 text-sm font-bold text-[#5c4b3a]">Cadence Overview</h2>
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {cadence.map((c) => {
          const pct = Math.min(100, Math.round((c.currentWeek / c.postsPerWeek) * 100));
          const status = getStatusInfo(c);
          return (
            <div key={c.platform} className="sketch-card p-4 space-y-3">
              <div className="flex items-center gap-2 text-[#5c4b3a]">
                <PlatformIcon platform={c.platform} />
                <span className="text-sm font-semibold">{platformLabels[c.platform] ?? c.platform}</span>
              </div>
              <p className="text-xs text-[#5c4b3a]/60">{c.currentWeek}/{c.postsPerWeek} posts this week</p>
              <Progress value={pct} className="h-2 sketchy-bar border border-[#d4c9b8] [&_[data-slot=progress-indicator]]:bg-[#7c9a6e]" />
              <p className={cn('text-xs font-semibold', status.color)}>{status.text}</p>
            </div>
          );
        })}
      </div>
      <div className="mt-4 flex flex-wrap items-center gap-3">
        <Button variant="outline" size="sm" className="border-2 border-dashed border-[#d4c9b8] text-[#5c4b3a] hover:bg-[#ebe5d9] rounded-xl" onClick={() => console.log('auto-fill gaps')}>
          <Sparkles className="mr-1.5 h-3.5 w-3.5" strokeWidth={1.75} />
          Auto-fill gaps with AI drafts
        </Button>
        <Button variant="ghost" size="sm" className="text-[#5c4b3a]/60 rounded-xl" asChild>
          <Link href="/brain">Adjust cadence &rarr; Brain</Link>
        </Button>
      </div>
    </section>
  );
}
