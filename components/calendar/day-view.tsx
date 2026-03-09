'use client';

import { useMemo } from 'react';
import { Twitter, Linkedin } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { CalendarSlot, ScheduledPost, PostStatus } from '@/lib/types';

const HOURS = Array.from({ length: 11 }, (_, i) => i + 8);

const statusStyles: Record<PostStatus, { bg: string; border: string; dot: string }> = {
  published: { bg: 'bg-[#7c9a6e]/10', border: 'border-[#7c9a6e]/40', dot: 'bg-[#7c9a6e]' },
  scheduled: { bg: 'bg-[#6b8cae]/10', border: 'border-[#6b8cae]/40', dot: 'bg-[#6b8cae]' },
  draft: { bg: 'bg-[#d4c9b8]/20', border: 'border-[#d4c9b8]', dot: 'bg-[#d4c9b8]' },
};

function PlatformIcon({ platform }: { platform: string }) {
  switch (platform) {
    case 'twitter': return <Twitter className="h-3 w-3 shrink-0" strokeWidth={1.75} />;
    case 'linkedin': return <Linkedin className="h-3 w-3 shrink-0" strokeWidth={1.75} />;
    case 'reddit': return <span className="text-[10px] font-bold leading-none shrink-0">r/</span>;
    case 'producthunt': return <span className="text-[10px] font-bold leading-none shrink-0">PH</span>;
    default: return null;
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
        'w-full cursor-pointer rounded-lg border-2 border-dashed px-2.5 py-2 text-left transition-colors hover:shadow-sm min-h-[44px]',
        colors.bg, colors.border
      )}
    >
      <div className="flex items-center gap-1.5">
        <span className={cn('h-2 w-2 shrink-0 rounded-full', colors.dot)} />
        <PlatformIcon platform={post.platform} />
        <span className="truncate text-xs text-[#5c4b3a]/60">{post.content.substring(0, 50)}...</span>
      </div>
    </button>
  );
}

interface DayViewProps { slots: CalendarSlot[]; }

export function DayView({ slots }: DayViewProps) {
  const now = new Date();
  const currentHour = now.getHours();

  const todaySlot = useMemo(
    () => slots.find((s) => s.date.getDate() === now.getDate() && s.date.getMonth() === now.getMonth()),
    [slots, now]
  );

  return (
    <div className="rounded-xl border-2 border-dashed border-[#d4c9b8] bg-[#faf8f5]">
      <div className="border-b-2 border-dashed border-[#d4c9b8] bg-[#f5f0e8] px-3 py-2.5 rounded-t-xl">
        <p className="text-sm font-semibold text-[#5c4b3a]">
          Today &middot; {now.toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' })}
        </p>
      </div>
      <div className="divide-y divide-dashed divide-[#d4c9b8]/60">
        {HOURS.map((hour) => {
          const posts = todaySlot?.posts.filter((p) => p.scheduledAt.getHours() === hour) ?? [];
          const isCurrentHour = hour === currentHour;
          return (
            <div key={hour} className={cn('flex gap-3 px-3 py-2.5', isCurrentHour && 'bg-[#e07a5f]/5')}>
              <span className="w-12 shrink-0 pt-0.5 text-xs text-[#5c4b3a]/50">{formatHour(hour)}</span>
              <div className="min-h-[32px] flex-1 space-y-1.5">
                {posts.map((post) => <PostCard key={post.id} post={post} />)}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
