'use client';

import { Plus, Pencil, Brain, Twitter, Linkedin } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import type { MonitorConfig } from '@/lib/types';

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

const platformColors: Record<string, string> = {
  reddit: 'border-l-orange-500',
  twitter: 'border-l-sky-500',
  linkedin: 'border-l-blue-600',
  producthunt: 'border-l-amber-500',
};

function formatTimeAgo(date: Date): string {
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMin = Math.round(diffMs / 60000);
  if (diffMin < 60) return `${diffMin}m ago`;
  const diffHr = Math.round(diffMin / 60);
  if (diffHr < 24) return `${diffHr}h ago`;
  return `${Math.round(diffHr / 24)}d ago`;
}

interface ActiveMonitorsProps {
  monitors: MonitorConfig[];
}

export function ActiveMonitors({ monitors }: ActiveMonitorsProps) {
  return (
    <section className="space-y-3">
      <div className="flex items-center justify-between">
        <h2 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">
          Active Monitors
        </h2>
        <span className="text-xs text-muted-foreground">
          {monitors.filter((m) => m.enabled).length} active
        </span>
      </div>

      <div className="grid gap-3 sm:grid-cols-2">
        {monitors.map((monitor) => (
          <Card
            key={monitor.id}
            className={cn(
              'gap-0 border-l-4 py-0',
              platformColors[monitor.platform] ?? 'border-l-muted'
            )}
          >
            <CardContent className="p-4 space-y-3">
              {/* Header */}
              <div className="flex items-center gap-2">
                <PlatformIcon platform={monitor.platform} />
                <span className="text-sm font-medium flex-1 truncate">
                  {monitor.name}
                </span>
                <span
                  className={cn(
                    'h-2 w-2 rounded-full',
                    monitor.enabled ? 'bg-green-500' : 'bg-muted-foreground/30'
                  )}
                />
              </div>

              {/* Keywords / subreddits / accounts */}
              <div className="flex flex-wrap gap-1">
                {monitor.keywords.map((kw) => (
                  <Badge
                    key={kw}
                    variant="secondary"
                    className="text-[11px] font-normal"
                  >
                    {kw}
                  </Badge>
                ))}
                {monitor.subreddits?.map((sub) => (
                  <Badge
                    key={sub}
                    variant="outline"
                    className="text-[11px] font-normal"
                  >
                    {sub}
                  </Badge>
                ))}
                {monitor.accounts?.map((acc) => (
                  <Badge
                    key={acc}
                    variant="outline"
                    className="text-[11px] font-normal"
                  >
                    {acc}
                  </Badge>
                ))}
              </div>

              {/* Stats */}
              <div className="flex items-center justify-between text-xs text-muted-foreground">
                <span>
                  <span className="font-medium text-foreground">
                    {monitor.matchCount7d}
                  </span>{' '}
                  matches (7d)
                </span>
                <span>Checked {formatTimeAgo(monitor.lastChecked)}</span>
              </div>

              {/* Actions */}
              <div className="flex items-center gap-2">
                <Button variant="ghost" size="sm" className="h-7 text-xs gap-1">
                  <Pencil className="h-3 w-3" strokeWidth={1.75} />
                  Edit keywords
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Bottom actions */}
      <div className="flex items-center gap-3">
        <Button variant="outline" size="sm" className="gap-1.5">
          <Plus className="h-3.5 w-3.5" strokeWidth={1.75} />
          Add Monitor
        </Button>
        <button
          type="button"
          className="text-xs text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
        >
          <Brain className="mr-1 inline h-3 w-3" strokeWidth={1.75} />
          Ask Brain to set up
        </button>
      </div>
    </section>
  );
}
