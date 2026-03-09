'use client';

import { Plus, Pencil, Brain, Twitter, Linkedin } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import type { MonitorConfig } from '@/lib/types';

function PlatformIcon({ platform }: { platform: string }) {
  switch (platform) {
    case 'twitter': return <Twitter className="h-4 w-4" strokeWidth={1.75} />;
    case 'linkedin': return <Linkedin className="h-4 w-4" strokeWidth={1.75} />;
    case 'reddit': return <span className="text-sm font-bold leading-none">r/</span>;
    case 'producthunt': return <span className="text-sm font-bold leading-none">PH</span>;
    default: return null;
  }
}

function formatTimeAgo(date: Date): string {
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMin = Math.round(diffMs / 60000);
  if (diffMin < 60) return `${diffMin}m ago`;
  const diffHr = Math.round(diffMin / 60);
  if (diffHr < 24) return `${diffHr}h ago`;
  return `${Math.round(diffHr / 24)}d ago`;
}

interface ActiveMonitorsProps { monitors: MonitorConfig[]; }

export function ActiveMonitors({ monitors }: ActiveMonitorsProps) {
  return (
    <section className="space-y-3">
      <div className="flex items-center justify-between">
        <h2 className="text-sm font-bold uppercase tracking-wider text-[#5c4b3a]/60">Active Monitors</h2>
        <span className="text-xs text-[#5c4b3a]/50">{monitors.filter((m) => m.enabled).length} active</span>
      </div>

      <div className="grid gap-3 sm:grid-cols-2">
        {monitors.map((monitor) => (
          <div key={monitor.id} className="relative sketch-card sketch-shadow p-4 space-y-3 postit-rotate-1">
            <div className="absolute -top-2 left-4 w-3 h-3 rounded-full bg-[#e07a5f] border-2 border-[#c4654a] shadow-sm z-10" />
            <div className="flex items-center gap-2 pt-1">
              <PlatformIcon platform={monitor.platform} />
              <span className="text-sm font-semibold flex-1 truncate text-[#5c4b3a]">{monitor.name}</span>
              <span className={cn('h-2.5 w-2.5 rounded-full', monitor.enabled ? 'bg-[#7c9a6e]' : 'bg-[#d4c9b8]')} />
            </div>
            <div className="flex flex-wrap gap-1">
              {monitor.keywords.map((kw) => (
                <Badge key={kw} variant="secondary" className="text-[11px] font-normal bg-[#ebe5d9] text-[#5c4b3a] border-dashed border border-[#d4c9b8]">{kw}</Badge>
              ))}
              {monitor.subreddits?.map((sub) => (
                <Badge key={sub} variant="outline" className="text-[11px] font-normal border-dashed border-[#d4c9b8] text-[#5c4b3a]/70">{sub}</Badge>
              ))}
              {monitor.accounts?.map((acc) => (
                <Badge key={acc} variant="outline" className="text-[11px] font-normal border-dashed border-[#d4c9b8] text-[#5c4b3a]/70">{acc}</Badge>
              ))}
            </div>
            <div className="flex items-center justify-between text-xs text-[#5c4b3a]/60">
              <span><span className="font-semibold text-[#5c4b3a]">{monitor.matchCount7d}</span> matches (7d)</span>
              <span>Checked {formatTimeAgo(monitor.lastChecked)}</span>
            </div>
            <div className="flex items-center gap-2">
              <Button variant="ghost" size="sm" className="h-7 text-xs gap-1 text-[#5c4b3a]/60">
                <Pencil className="h-3 w-3" strokeWidth={1.75} />Edit keywords
              </Button>
            </div>
          </div>
        ))}
      </div>

      <div className="flex items-center gap-3">
        <Button variant="outline" size="sm" className="gap-1.5 border-2 border-dashed border-[#d4c9b8] text-[#5c4b3a] hover:bg-[#ebe5d9] rounded-xl">
          <Plus className="h-3.5 w-3.5" strokeWidth={1.75} />Add Monitor
        </Button>
        <button type="button" className="text-xs text-[#5c4b3a]/60 hover:text-[#5c4b3a] transition-colors cursor-pointer">
          <Brain className="mr-1 inline h-3 w-3" strokeWidth={1.75} />Ask Brain to set up
        </button>
      </div>
    </section>
  );
}
