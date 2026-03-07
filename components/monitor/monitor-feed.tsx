'use client';

import { useState } from 'react';
import {
  Twitter,
  Linkedin,
  ArrowRight,
  Brain,
  EyeOff,
  Check,
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import type { MonitorFeedItem, FeedItemTag } from '@/lib/types';

function PlatformIcon({ platform }: { platform: string }) {
  switch (platform) {
    case 'twitter':
      return <Twitter className="h-3.5 w-3.5" strokeWidth={1.75} />;
    case 'linkedin':
      return <Linkedin className="h-3.5 w-3.5" strokeWidth={1.75} />;
    case 'reddit':
      return <span className="text-xs font-bold leading-none">r/</span>;
    case 'producthunt':
      return <span className="text-xs font-bold leading-none">PH</span>;
    default:
      return null;
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
  match: { dot: 'bg-green-500', label: 'MATCH' },
  mention: { dot: 'bg-yellow-500', label: 'MENTION' },
  info: { dot: 'bg-blue-500', label: 'INFO' },
  alert: { dot: 'bg-red-500', label: 'ALERT' },
};

const filters = [
  { id: 'all', label: 'All' },
  { id: 'reddit', label: 'Reddit' },
  { id: 'twitter', label: 'Twitter' },
  { id: 'linkedin', label: 'LinkedIn' },
  { id: 'mention', label: 'Mentions' },
  { id: 'match', label: 'Keywords' },
] as const;

type FilterId = (typeof filters)[number]['id'];

interface MonitorFeedProps {
  items: MonitorFeedItem[];
}

export function MonitorFeed({ items }: MonitorFeedProps) {
  const [activeFilter, setActiveFilter] = useState<FilterId>('all');
  const [dismissed, setDismissed] = useState<Set<string>>(new Set());

  const filtered = items.filter((item) => {
    if (dismissed.has(item.id)) return false;
    if (activeFilter === 'all') return true;
    if (['reddit', 'twitter', 'linkedin'].includes(activeFilter)) {
      return item.platform === activeFilter;
    }
    return item.tag === activeFilter;
  });

  return (
    <section className="space-y-3">
      <h2 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">
        Feed
      </h2>

      {/* Filter bar */}
      <div className="flex items-center gap-2 overflow-x-auto">
        {filters.map((f) => (
          <button
            key={f.id}
            type="button"
            onClick={() => setActiveFilter(f.id)}
            className={cn(
              'inline-flex items-center rounded-full px-3.5 py-2 md:py-1.5 text-xs font-medium transition-colors whitespace-nowrap min-h-[36px] cursor-pointer',
              activeFilter === f.id
                ? 'bg-primary text-primary-foreground'
                : 'bg-muted text-muted-foreground hover:bg-accent hover:text-accent-foreground'
            )}
          >
            {f.label}
          </button>
        ))}
      </div>

      {/* Timeline */}
      <div className="space-y-1">
        {filtered.map((item) => {
          const tag = tagConfig[item.tag];

          return (
            <div
              key={item.id}
              className={cn(
                'group relative flex gap-3 rounded-lg p-3 transition-colors hover:bg-muted/50',
                item.dismissed && 'opacity-50'
              )}
            >
              {/* Color dot + timeline line */}
              <div className="flex flex-col items-center pt-1.5">
                <div className={cn('h-2.5 w-2.5 rounded-full shrink-0', tag.dot)} />
                <div className="mt-1 w-px flex-1 bg-border" />
              </div>

              {/* Content */}
              <div className="flex-1 min-w-0 space-y-1.5">
                {/* Meta row */}
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <span className="font-semibold uppercase tracking-wider text-[10px]">
                    {tag.label}
                  </span>
                  <span className="text-muted-foreground/40">|</span>
                  <PlatformIcon platform={item.platform} />
                  <span className="font-medium text-foreground">
                    {item.author}
                  </span>
                  <span>{formatTimeAgo(item.createdAt)}</span>
                </div>

                {/* Content preview */}
                <p className="text-sm leading-relaxed line-clamp-2">
                  {item.content}
                </p>

                {/* Relevance + actions */}
                <div className="flex items-center gap-2 pt-0.5">
                  <Badge variant="secondary" className="text-[10px] font-normal h-5">
                    {item.relevanceScore}% match
                  </Badge>

                  {item.dismissed ? (
                    <span className="text-xs text-green-600 dark:text-green-400 flex items-center gap-1">
                      <Check className="h-3 w-3" strokeWidth={1.75} />
                      Processed
                    </span>
                  ) : (
                    <div className="flex flex-wrap items-center gap-1 md:opacity-0 md:group-hover:opacity-100 transition-opacity">
                      <Button variant="ghost" size="sm" className="h-8 md:h-6 text-[11px] gap-1 px-2">
                        <ArrowRight className="h-3 w-3" strokeWidth={1.75} />
                        Push to Flow
                      </Button>
                      <Button variant="ghost" size="sm" className="h-8 md:h-6 text-[11px] gap-1 px-2">
                        <Brain className="h-3 w-3" strokeWidth={1.75} />
                        Note for Brain
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-8 md:h-6 text-[11px] gap-1 px-2 text-muted-foreground"
                        onClick={() =>
                          setDismissed((prev) => new Set(prev).add(item.id))
                        }
                      >
                        <EyeOff className="h-3 w-3" strokeWidth={1.75} />
                        Ignore
                      </Button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Load more */}
      <div className="text-center">
        <Button variant="ghost" size="sm" className="text-xs text-muted-foreground">
          Load more...
        </Button>
      </div>
    </section>
  );
}
