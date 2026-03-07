'use client';

import { RefreshCw, Twitter, Linkedin } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { cn } from '@/lib/utils';
import type { ReplyTrackerItem } from '@/lib/types';

function PlatformIcon({ platform }: { platform: string }) {
  switch (platform) {
    case 'twitter':
      return <Twitter className="h-3.5 w-3.5" strokeWidth={1.75} />;
    case 'linkedin':
      return <Linkedin className="h-3.5 w-3.5" strokeWidth={1.75} />;
    case 'reddit':
      return <span className="text-xs font-bold leading-none">r/</span>;
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

interface ReplyTrackerProps {
  items: ReplyTrackerItem[];
}

export function ReplyTracker({ items }: ReplyTrackerProps) {
  const totalNew = items.reduce((sum, i) => sum + i.newReplies, 0);

  return (
    <section className="space-y-3">
      {/* Header */}
      <div className="space-y-2">
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <h2 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">
              Post Reply Tracker
            </h2>
            {totalNew > 0 && (
              <Badge variant="secondary" className="text-[11px] h-5 px-1.5">
                {totalNew} new
              </Badge>
            )}
          </div>
          <Button variant="outline" size="sm" className="h-8 md:h-7 text-xs gap-1">
            <RefreshCw className="h-3 w-3" strokeWidth={1.75} />
            <span className="hidden sm:inline">Check now</span>
            <span className="sm:hidden">Check</span>
          </Button>
        </div>
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <span>Auto-check</span>
          <Switch defaultChecked className="scale-75" />
          <span>Every 2h</span>
        </div>
      </div>

      {/* Items */}
      <div className="divide-y rounded-lg border bg-card">
        {items.map((item) => (
          <div
            key={item.id}
            className="flex items-center gap-3 px-4 py-3"
          >
            {/* Platform icon */}
            <div className="shrink-0">
              <PlatformIcon platform={item.platform} />
            </div>

            {/* Post info */}
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium truncate">{item.postTitle}</p>
              <p className="text-xs text-muted-foreground">
                Checked {formatTimeAgo(item.lastChecked)}
              </p>
            </div>

            {/* Reply count */}
            <Badge
              className={cn(
                'shrink-0',
                item.newReplies > 5
                  ? 'bg-red-100 text-red-700 hover:bg-red-100 dark:bg-red-950 dark:text-red-400'
                  : item.newReplies > 0
                    ? 'bg-amber-100 text-amber-700 hover:bg-amber-100 dark:bg-amber-950 dark:text-amber-400'
                    : 'bg-muted text-muted-foreground'
              )}
            >
              {item.newReplies} new {item.newReplies === 1 ? 'reply' : 'replies'}
            </Badge>
          </div>
        ))}
      </div>
    </section>
  );
}
