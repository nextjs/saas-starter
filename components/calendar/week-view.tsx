'use client';

import { useMemo } from 'react';
import { Twitter, Linkedin } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { CalendarSlot, ScheduledPost, PostStatus } from '@/lib/types';

const HOURS = Array.from({ length: 11 }, (_, i) => i + 8); // 8am–6pm
const DAY_LABELS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

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
      onClick={() => console.log('clicked post', post.id)}
      className={cn(
        'w-full cursor-pointer rounded border px-1.5 py-1 text-left transition-colors hover:shadow-sm',
        colors.bg,
        colors.border
      )}
    >
      <div className="flex items-center gap-1">
        <span className={cn('h-1.5 w-1.5 shrink-0 rounded-full', colors.dot)} />
        <PlatformIcon platform={post.platform} />
        <span className="truncate text-[10px] text-muted-foreground">
          {post.content.substring(0, 30)}...
        </span>
      </div>
    </button>
  );
}

interface WeekViewProps {
  slots: CalendarSlot[];
}

export function WeekView({ slots }: WeekViewProps) {
  const now = new Date();
  const todayDate = now.getDate();
  const todayMonth = now.getMonth();
  const currentHour = now.getHours();
  const currentMinute = now.getMinutes();

  const todaySlot = useMemo(
    () =>
      slots.find(
        (s) =>
          s.date.getDate() === todayDate && s.date.getMonth() === todayMonth
      ),
    [slots, todayDate, todayMonth]
  );

  const isToday = (slot: CalendarSlot) =>
    slot.date.getDate() === todayDate && slot.date.getMonth() === todayMonth;

  return (
    <>
      {/* Desktop: Full week grid */}
      <div className="hidden overflow-x-auto rounded-lg border md:block">
        <div className="min-w-[700px]">
          {/* Day headers */}
          <div className="grid grid-cols-[56px_repeat(7,1fr)] border-b bg-muted/30">
            <div />
            {slots.map((slot, i) => (
              <div
                key={i}
                className={cn(
                  'border-l px-2 py-2 text-center',
                  isToday(slot) && 'bg-blue-50/60 dark:bg-blue-950/20'
                )}
              >
                <span className="text-xs text-muted-foreground">
                  {DAY_LABELS[i]}
                </span>
                <span
                  className={cn(
                    'ml-1.5',
                    isToday(slot)
                      ? 'inline-flex h-6 w-6 items-center justify-center rounded-full bg-primary text-xs font-medium text-primary-foreground'
                      : 'text-sm font-medium'
                  )}
                >
                  {slot.date.getDate()}
                </span>
              </div>
            ))}
          </div>

          {/* Time rows */}
          {HOURS.map((hour) => (
            <div
              key={hour}
              className="relative grid grid-cols-[56px_repeat(7,1fr)] border-b last:border-b-0"
            >
              {/* Time label */}
              <div className="px-1 pr-2 pt-1 text-right text-[11px] text-muted-foreground">
                {formatHour(hour)}
              </div>

              {/* Day cells */}
              {slots.map((slot, dayIndex) => {
                const posts = slot.posts.filter(
                  (p) => p.scheduledAt.getHours() === hour
                );
                return (
                  <div
                    key={dayIndex}
                    className={cn(
                      'min-h-[44px] space-y-0.5 border-l px-0.5 py-0.5',
                      isToday(slot) && 'bg-blue-50/30 dark:bg-blue-950/10'
                    )}
                  >
                    {posts.map((post) => (
                      <PostCard key={post.id} post={post} />
                    ))}
                  </div>
                );
              })}

              {/* Current time indicator */}
              {hour === currentHour &&
                currentHour >= 8 &&
                currentHour <= 18 && (
                  <div
                    className="pointer-events-none absolute left-[56px] right-0 z-10 h-0.5 bg-red-500"
                    style={{ top: `${(currentMinute / 60) * 100}%` }}
                  >
                    <div className="absolute -left-1 -top-[3px] h-2 w-2 rounded-full bg-red-500" />
                  </div>
                )}
            </div>
          ))}
        </div>
      </div>

      {/* Mobile: Day view (today only) */}
      <div className="rounded-lg border md:hidden">
        <div className="border-b bg-muted/30 px-3 py-2">
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
                  'flex gap-2 px-3 py-2',
                  isCurrentHour && 'bg-blue-50/30 dark:bg-blue-950/10'
                )}
              >
                <span className="w-10 shrink-0 pt-0.5 text-[11px] text-muted-foreground">
                  {formatHour(hour)}
                </span>
                <div className="min-h-[28px] flex-1 space-y-1">
                  {posts.map((post) => (
                    <PostCard key={post.id} post={post} />
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </>
  );
}
