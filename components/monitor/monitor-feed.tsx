'use client';

import { useState } from 'react';
import { Twitter, Linkedin, ArrowRight, Brain, EyeOff, Check } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import type { MonitorFeedItem, FeedItemTag } from '@/lib/types';

function PlatformIcon({ platform }: { platform: string }) {
  switch (platform) {
    case 'twitter': return <Twitter className="h-3.5 w-3.5" strokeWidth={1.75} />;
    case 'linkedin': return <Linkedin className="h-3.5 w-3.5" strokeWidth={1.75} />;
    case 'reddit': return <span className="text-xs font-bold leading-none">r/</span>;
    case 'producthunt': return <span className="text-xs font-bold leading-none">PH</span>;
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

const tagConfig: Record<FeedItemTag, { dot: string; label: string }> = {
  match: { dot: 'bg-[#7c9a6e]', label: 'MATCH' },
  mention: { dot: 'bg-[#f2d98b]', label: 'MENTION' },
  info: { dot: 'bg-[#6b8cae]', label: 'INFO' },
  alert: { dot: 'bg-[#e07a5f]', label: 'ALERT' },
};

const filters = [
  { id: 'all', label: 'All' }, { id: 'reddit', label: 'Reddit' },
  { id: 'twitter', label: 'Twitter' }, { id: 'linkedin', label: 'LinkedIn' },
  { id: 'mention', label: 'Mentions' }, { id: 'match', label: 'Keywords' },
] as const;

type FilterId = (typeof filters)[number]['id'];

interface MonitorFeedProps { items: MonitorFeedItem[]; }

export function MonitorFeed({ items }: MonitorFeedProps) {
  const [activeFilter, setActiveFilter] = useState<FilterId>('all');
  const [dismissed, setDismissed] = useState<Set<string>>(new Set());

  const filtered = items.filter((item) => {
    if (dismissed.has(item.id)) return false;
    if (activeFilter === 'all') return true;
    if (['reddit', 'twitter', 'linkedin'].includes(activeFilter)) return item.platform === activeFilter;
    return item.tag === activeFilter;
  });

  return (
    <section className="space-y-3">
      <h2 className="text-sm font-bold uppercase tracking-wider text-[#5c4b3a]/60">Feed</h2>
      <div className="flex items-center gap-2 overflow-x-auto">
        {filters.map((f) => (
          <button key={f.id} type="button" onClick={() => setActiveFilter(f.id)}
            className={cn(
              'inline-flex items-center rounded-xl px-3.5 py-2 md:py-1.5 text-xs font-semibold transition-colors whitespace-nowrap min-h-[36px] cursor-pointer border-2 border-dashed',
              activeFilter === f.id
                ? 'bg-[#e07a5f] text-white border-[#e07a5f]'
                : 'bg-[#faf8f5] text-[#5c4b3a]/60 border-[#d4c9b8] hover:bg-[#ebe5d9]'
            )}
          >{f.label}</button>
        ))}
      </div>
      <div className="space-y-1">
        {filtered.map((item) => {
          const tag = tagConfig[item.tag];
          return (
            <div key={item.id} className={cn('group relative flex gap-3 rounded-xl p-3 transition-colors hover:bg-[#ebe5d9]/50', item.dismissed && 'opacity-50')}>
              <div className="flex flex-col items-center pt-1.5">
                <div className={cn('h-2.5 w-2.5 rounded-full shrink-0', tag.dot)} />
                <div className="mt-1 w-px flex-1 border-l border-dashed border-[#d4c9b8]" />
              </div>
              <div className="flex-1 min-w-0 space-y-1.5">
                <div className="flex items-center gap-2 text-xs text-[#5c4b3a]/60">
                  <span className="font-bold uppercase tracking-wider text-[10px]">{tag.label}</span>
                  <span className="text-[#d4c9b8]">|</span>
                  <PlatformIcon platform={item.platform} />
                  <span className="font-semibold text-[#5c4b3a]">{item.author}</span>
                  <span>{formatTimeAgo(item.createdAt)}</span>
                </div>
                <p className="text-sm leading-relaxed line-clamp-2 text-[#5c4b3a]">{item.content}</p>
                <div className="flex items-center gap-2 pt-0.5">
                  <Badge variant="secondary" className="text-[10px] font-normal h-5 bg-[#ebe5d9] text-[#5c4b3a] border-dashed border border-[#d4c9b8]">
                    {item.relevanceScore}% match
                  </Badge>
                  {item.dismissed ? (
                    <span className="text-xs text-[#7c9a6e] flex items-center gap-1">
                      <Check className="h-3 w-3" strokeWidth={1.75} />Processed
                    </span>
                  ) : (
                    <div className="flex flex-wrap items-center gap-1 md:opacity-0 md:group-hover:opacity-100 transition-opacity">
                      <Button variant="ghost" size="sm" className="h-8 md:h-6 text-[11px] gap-1 px-2 text-[#5c4b3a]/60">
                        <ArrowRight className="h-3 w-3" strokeWidth={1.75} />Push to Flow
                      </Button>
                      <Button variant="ghost" size="sm" className="h-8 md:h-6 text-[11px] gap-1 px-2 text-[#5c4b3a]/60">
                        <Brain className="h-3 w-3" strokeWidth={1.75} />Note for Brain
                      </Button>
                      <Button variant="ghost" size="sm" className="h-8 md:h-6 text-[11px] gap-1 px-2 text-[#5c4b3a]/40"
                        onClick={() => setDismissed((prev) => new Set(prev).add(item.id))}>
                        <EyeOff className="h-3 w-3" strokeWidth={1.75} />Ignore
                      </Button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>
      <div className="text-center">
        <Button variant="ghost" size="sm" className="text-xs text-[#5c4b3a]/50">Load more...</Button>
      </div>
    </section>
  );
}
