'use client';

import {
  CheckCircle2,
  Clock,
  Twitter,
  Linkedin,
  Eye,
  Pencil,
  CalendarClock,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import type { CalendarSlot, ScheduledPost } from '@/lib/types';

function PlatformIcon({ platform }: { platform: string }) {
  switch (platform) {
    case 'twitter': return <Twitter className="h-3.5 w-3.5 shrink-0" strokeWidth={1.75} />;
    case 'linkedin': return <Linkedin className="h-3.5 w-3.5 shrink-0" strokeWidth={1.75} />;
    case 'reddit': return <span className="shrink-0 text-xs font-bold leading-none">r/</span>;
    case 'producthunt': return <span className="shrink-0 text-xs font-bold leading-none">PH</span>;
    default: return null;
  }
}

function formatTime(date: Date): string {
  return date.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true });
}

function PublishedItem({ post }: { post: ScheduledPost }) {
  return (
    <div className="flex items-start gap-3 px-4 py-3">
      <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-[#7c9a6e]" strokeWidth={1.75} />
      <div className="min-w-0 flex-1 space-y-1">
        <div className="flex items-center gap-2">
          <span className="text-xs text-[#5c4b3a]/60">{formatTime(post.publishedAt!)}</span>
          <PlatformIcon platform={post.platform} />
          <span className="text-xs capitalize text-[#5c4b3a]/60">{post.platform}</span>
        </div>
        <p className="line-clamp-2 text-sm text-[#5c4b3a]">{post.content}</p>
        {post.performance && (
          <div className="flex flex-wrap items-center gap-3 text-xs text-[#5c4b3a]/60">
            <span>{post.performance.impressions.toLocaleString()} impressions</span>
            <span>{post.performance.engagement} engagements</span>
            <span>{post.performance.clicks} clicks</span>
          </div>
        )}
      </div>
    </div>
  );
}

function ScheduledItem({ post }: { post: ScheduledPost }) {
  return (
    <div className="flex items-start gap-3 px-4 py-3">
      <Clock className="mt-0.5 h-4 w-4 shrink-0 text-[#6b8cae]" strokeWidth={1.75} />
      <div className="min-w-0 flex-1 space-y-2">
        <div className="flex items-center gap-2">
          <span className="text-xs text-[#5c4b3a]/60">{formatTime(post.scheduledAt)}</span>
          <PlatformIcon platform={post.platform} />
          <span className="text-xs capitalize text-[#5c4b3a]/60">{post.platform}</span>
        </div>
        <p className="line-clamp-2 text-sm text-[#5c4b3a]">{post.content}</p>
        <div className="flex flex-wrap items-center gap-2">
          <Button variant="outline" size="sm" className="h-7 text-xs border-dashed border-[#d4c9b8] text-[#5c4b3a] rounded-lg" onClick={() => console.log('preview', post.id)}>
            <Eye className="mr-1 h-3 w-3" strokeWidth={1.75} />Preview
          </Button>
          <Button variant="outline" size="sm" className="h-7 text-xs border-dashed border-[#d4c9b8] text-[#5c4b3a] rounded-lg" onClick={() => console.log('edit', post.id)}>
            <Pencil className="mr-1 h-3 w-3" strokeWidth={1.75} />Edit
          </Button>
          <Button variant="outline" size="sm" className="h-7 text-xs border-dashed border-[#d4c9b8] text-[#5c4b3a] rounded-lg" onClick={() => console.log('reschedule', post.id)}>
            <CalendarClock className="mr-1 h-3 w-3" strokeWidth={1.75} />Reschedule
          </Button>
        </div>
      </div>
    </div>
  );
}

function DraftItem({ post }: { post: ScheduledPost }) {
  return (
    <div className="flex items-start gap-3 px-4 py-3">
      <div className="mt-0.5 h-4 w-4 shrink-0 rounded-full border-2 border-dashed border-[#d4c9b8]" />
      <div className="min-w-0 flex-1 space-y-1">
        <div className="flex items-center gap-2">
          <span className="text-xs text-[#5c4b3a]/60">{formatTime(post.scheduledAt)}</span>
          <PlatformIcon platform={post.platform} />
          <span className="text-xs capitalize text-[#5c4b3a]/60">{post.platform}</span>
          <span className="rounded-lg bg-[#ebe5d9] px-1.5 py-0.5 text-xs text-[#5c4b3a]/60">Draft</span>
        </div>
        <p className="line-clamp-2 text-sm text-[#5c4b3a]/60">{post.content}</p>
      </div>
    </div>
  );
}

interface TodayTimelineProps { slots: CalendarSlot[]; }

export function TodayTimeline({ slots }: TodayTimelineProps) {
  const today = new Date();
  const todaySlot = slots.find((s) => s.date.getDate() === today.getDate() && s.date.getMonth() === today.getMonth());
  const posts = (todaySlot?.posts ?? []).sort((a, b) => a.scheduledAt.getTime() - b.scheduledAt.getTime());

  const published = posts.filter((p) => p.status === 'published');
  const scheduled = posts.filter((p) => p.status === 'scheduled');
  const drafts = posts.filter((p) => p.status === 'draft');

  return (
    <section>
      <h2 className="mb-3 text-sm font-bold text-[#5c4b3a]">Today&apos;s Timeline</h2>
      <div className="sketch-card">
        {posts.length === 0 ? (
          <div className="py-8 text-center text-sm text-[#5c4b3a]/50">No posts scheduled for today</div>
        ) : (
          <div className="divide-y divide-dashed divide-[#d4c9b8]">
            {published.map((post) => <PublishedItem key={post.id} post={post} />)}
            {scheduled.map((post) => <ScheduledItem key={post.id} post={post} />)}
            {drafts.map((post) => <DraftItem key={post.id} post={post} />)}
          </div>
        )}
      </div>
    </section>
  );
}
