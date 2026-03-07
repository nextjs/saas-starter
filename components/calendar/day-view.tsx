'use client';

import { useMemo } from 'react';
import { Twitter, Linkedin } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import type { CalendarSlot, ScheduledPost, PostStatus } from '@/lib/types';

const HOURS = Array.from({ length: 11 }, (_, i) => i + 8); // 8am–6pm

const statusStyles: Record<
  PostStatus,
  { bg: string; border: string; dot: string }
> = {
  published: {
    bg: 'bg-green-50 dark:bg-green-950/30',
    border: 'border-green-200 dark:border-green-800',
    dot: 'bg-green-500',
  },
  scheduled: {
    bg: 'bg-blue-50 dark:bg-blue-950/30',
    border: 'border-blue-200 dark:border-blue-800',
    dot: 'bg-blue-500',
  },
  draft: {
    bg: 'bg-gray-50 dark:bg-gray-900/30',
    border: 'border-gray-200 dark:border-gray-700',
    dot: 'bg-gray-400',
  },
};

function PlatformIcon({ platform }: { platform: string }) {
  switch (platform) {
    case 'twitter':
      return <Twitter className="h-3 w-3 shrink-0" strokeWidth={1.75} />;
    case 'linkedin':
      return <Linkedin className="h-3 w-3 shrink-0" strokeWidth={1.75} />;
    case 'reddit':
      return <span className="text-[10px] font-bold leading-none shrink-0">r/</span>;
    case 'producthunt':
      return <span className="text-[10px] font-bold leading-none shrink-0">PH</span>;
    default:
      return null;
  }
}

function formatHour(hour: number): string {
  if (hour === 12) return '12pm';
  if (hour < 12) return `${hour}am`;
  return `${hour - 12}pm`;
}

function PostCard({ post }: { post: ScheduledPost }) {
  const colors = statusStyles[post.status];
  return (
    <button
      type="button"
      className={cn(
        'w-full cursor-pointer rounded border px-2.5 py-2 text-left transition-colors hover:shadow-sm min-h-[44px]',
        colors.bg,
        colors.border
      )}
    >
      <div className="flex items-center gap-1.5">
        <span className={cn('h-2 w-2 shrink-0 rounded-full', colors.dot)} />
        <PlatformIcon platform={post.platform} />
        <span className="truncate text-xs text-muted-foreground">
          {post.content.substring(0, 50)}...
        </span>
      </div>
    </button>
  );
}

interface DayViewProps {
  slots: CalendarSlot[];
}

export function DayView({ slots }: DayViewProps) {
  const now = new Date();
  const currentHour = now.getHours();

  const todaySlot = useMemo(
    () =>
      slots.find(
        (s) =>
          s.date.getDate() === now.getDate() &&
          s.date.getMonth() === now.getMonth()
      ),
    [slots, now]
  );

  return (
    <div className="rounded-lg border">
      <div className="border-b bg-muted/30 px-3 py-2.5">
        <p className="text-sm font-medium">
          Today &middot;{' '}
          {now.toLocaleDateString('en-US', {
            weekday: 'long',
            month: 'short',
            day: 'numeric',
          })}
        </p>
      </div>
      <div className="divide-y">
        {HOURS.map((hour) => {
          const posts =
            todaySlot?.posts.filter(
              (p) => p.scheduledAt.getHours() === hour
            ) ?? [];
          const isCurrentHour = hour === currentHour;
          return (
            <div
              key={hour}
              className={cn(
                'flex gap-3 px-3 py-2.5',
                isCurrentHour && 'bg-blue-50/30 dark:bg-blue-950/10'
              )}
            >
              <span className="w-12 shrink-0 pt-0.5 text-xs text-muted-foreground">
                {formatHour(hour)}
              </span>
              <div className="min-h-[32px] flex-1 space-y-1.5">
                {posts.map((post) => (
                  <PostCard key={post.id} post={post} />
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
