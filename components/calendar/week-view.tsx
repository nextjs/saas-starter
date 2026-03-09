'use client';

import { useMemo } from 'react';
import { Twitter, Linkedin } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { CalendarSlot, ScheduledPost, PostStatus } from '@/lib/types';

const HOURS = Array.from({ length: 11 }, (_, i) => i + 8);
const DAY_LABELS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

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
      onClick={() => console.log('clicked post', post.id)}
      className={cn(
        'w-full cursor-pointer rounded-lg border-2 border-dashed px-1.5 py-1 text-left transition-colors hover:shadow-sm',
        colors.bg, colors.border
      )}
    >
      <div className="flex items-center gap-1">
        <span className={cn('h-1.5 w-1.5 shrink-0 rounded-full', colors.dot)} />
        <PlatformIcon platform={post.platform} />
        <span className="truncate text-[10px] text-[#5c4b3a]/60">{post.content.substring(0, 30)}...</span>
      </div>
    </button>
  );
}

interface WeekViewProps { slots: CalendarSlot[]; }

export function WeekView({ slots }: WeekViewProps) {
  const now = new Date();
  const todayDate = now.getDate();
  const todayMonth = now.getMonth();
  const currentHour = now.getHours();
  const currentMinute = now.getMinutes();

  const todaySlot = useMemo(
    () => slots.find((s) => s.date.getDate() === todayDate && s.date.getMonth() === todayMonth),
    [slots, todayDate, todayMonth]
  );

  const isToday = (slot: CalendarSlot) =>
    slot.date.getDate() === todayDate && slot.date.getMonth() === todayMonth;

  return (
    <>
      <div className="hidden overflow-x-auto rounded-xl border-2 border-dashed border-[#d4c9b8] md:block bg-[#faf8f5]">
        <div className="min-w-[700px]">
          <div className="grid grid-cols-[56px_repeat(7,1fr)] border-b-2 border-dashed border-[#d4c9b8] bg-[#f5f0e8]">
            <div />
            {slots.map((slot, i) => (
              <div key={i} className={cn('border-l border-dashed border-[#d4c9b8] px-2 py-2 text-center', isToday(slot) && 'bg-[#e07a5f]/10')}>
                <span className="text-xs text-[#5c4b3a]/60">{DAY_LABELS[i]}</span>
                <span className={cn('ml-1.5', isToday(slot) ? 'inline-flex h-6 w-6 items-center justify-center rounded-full bg-[#e07a5f] text-xs font-bold text-white' : 'text-sm font-semibold text-[#5c4b3a]')}>{slot.date.getDate()}</span>
              </div>
            ))}
          </div>

          {HOURS.map((hour) => (
            <div key={hour} className="relative grid grid-cols-[56px_repeat(7,1fr)] border-b border-dashed border-[#d4c9b8]/60 last:border-b-0">
              <div className="px-1 pr-2 pt-1 text-right text-[11px] text-[#5c4b3a]/50">{formatHour(hour)}</div>
              {slots.map((slot, dayIndex) => {
                const posts = slot.posts.filter((p) => p.scheduledAt.getHours() === hour);
                return (
                  <div key={dayIndex} className={cn('min-h-[44px] space-y-0.5 border-l border-dashed border-[#d4c9b8]/60 px-0.5 py-0.5', isToday(slot) && 'bg-[#e07a5f]/5')}>
                    {posts.map((post) => <PostCard key={post.id} post={post} />)}
                  </div>
                );
              })}
              {hour === currentHour && currentHour >= 8 && currentHour <= 18 && (
                <div className="pointer-events-none absolute left-[56px] right-0 z-10 h-0.5 bg-[#e07a5f]" style={{ top: `${(currentMinute / 60) * 100}%` }}>
                  <div className="absolute -left-1 -top-[3px] h-2 w-2 rounded-full bg-[#e07a5f]" />
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      <div className="rounded-xl border-2 border-dashed border-[#d4c9b8] md:hidden bg-[#faf8f5]">
        <div className="border-b-2 border-dashed border-[#d4c9b8] bg-[#f5f0e8] px-3 py-2 rounded-t-xl">
          <p className="text-sm font-semibold text-[#5c4b3a]">Today &middot; {now.toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' })}</p>
        </div>
        <div className="divide-y divide-dashed divide-[#d4c9b8]/60">
          {HOURS.map((hour) => {
            const posts = todaySlot?.posts.filter((p) => p.scheduledAt.getHours() === hour) ?? [];
            return (
              <div key={hour} className={cn('flex gap-2 px-3 py-2', hour === currentHour && 'bg-[#e07a5f]/5')}>
                <span className="w-10 shrink-0 pt-0.5 text-[11px] text-[#5c4b3a]/50">{formatHour(hour)}</span>
                <div className="min-h-[28px] flex-1 space-y-1">
                  {posts.map((post) => <PostCard key={post.id} post={post} />)}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </>
  );
}
