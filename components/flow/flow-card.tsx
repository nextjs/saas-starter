'use client';

import {
  Flame,
  PenLine,
  MessageCircle,
  Repeat2,
  Send,
  Eye,
  Clock,
  Star,
  Twitter,
  Linkedin,
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { FlowActions } from '@/components/flow/flow-actions';
import type { FlowItem } from '@/lib/types';
import { FlowItemType } from '@/lib/types';
import { cn } from '@/lib/utils';

const typeConfig: Record<
  FlowItemType,
  { label: string; icon: typeof Flame; color: string; badgeBg: string }
> = {
  [FlowItemType.Trending]: {
    label: 'Trending',
    icon: Flame,
    color: 'text-[#e07a5f]',
    badgeBg: 'bg-[#e07a5f]/15 text-[#e07a5f] border-[#e07a5f]/30',
  },
  [FlowItemType.DailyPost]: {
    label: 'Daily Post',
    icon: PenLine,
    color: 'text-[#6b8cae]',
    badgeBg: 'bg-[#6b8cae]/15 text-[#6b8cae] border-[#6b8cae]/30',
  },
  [FlowItemType.ReplyNeeded]: {
    label: 'Reply Needed',
    icon: MessageCircle,
    color: 'text-[#7c9a6e]',
    badgeBg: 'bg-[#7c9a6e]/15 text-[#7c9a6e] border-[#7c9a6e]/30',
  },
  [FlowItemType.Repost]: {
    label: 'Repost',
    icon: Repeat2,
    color: 'text-[#7c9a6e]',
    badgeBg: 'bg-[#7c9a6e]/15 text-[#7c9a6e] border-[#7c9a6e]/30',
  },
  [FlowItemType.Outreach]: {
    label: 'Outreach',
    icon: Send,
    color: 'text-[#6b8cae]',
    badgeBg: 'bg-[#6b8cae]/15 text-[#6b8cae] border-[#6b8cae]/30',
  },
  [FlowItemType.MonitorAlert]: {
    label: 'From Monitor',
    icon: Eye,
    color: 'text-[#f2d98b]',
    badgeBg: 'bg-[#f2d98b]/20 text-[#5c4b3a] border-[#f2d98b]/40',
  },
};

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

function EngagementStars({ score }: { score: number }) {
  const stars = Math.round(score / 20);
  return (
    <div className="flex items-center gap-0.5" title={`Predicted engagement: ${score}%`}>
      {Array.from({ length: 5 }, (_, i) => (
        <Star
          key={i}
          className={cn(
            'h-3 w-3',
            i < stars ? 'fill-[#f2d98b] text-[#f2d98b]' : 'text-[#d4c9b8]/50'
          )}
          strokeWidth={1.75}
        />
      ))}
    </div>
  );
}

function TimeLeft({ expiresAt }: { expiresAt: Date }) {
  const now = new Date();
  const hoursLeft = Math.max(0, Math.round((expiresAt.getTime() - now.getTime()) / (1000 * 60 * 60)));
  if (hoursLeft === 0) return null;
  return (
    <span className="inline-flex items-center gap-1 text-xs text-[#e07a5f] font-semibold">
      <Clock className="h-3 w-3" strokeWidth={1.75} />
      ~{hoursLeft}hr left
    </span>
  );
}

interface FlowCardProps {
  item: FlowItem;
  onApprove: (id: string) => void;
  onChat: (id: string) => void;
  onSkip: (id: string) => void;
}

export function FlowCard({ item, onApprove, onChat, onSkip }: FlowCardProps) {
  const config = typeConfig[item.type];
  const TypeIcon = config.icon;
  const latestVersion = item.versions[item.versions.length - 1];

  return (
    <div className="relative sketch-card sketch-shadow p-4 space-y-3">
      {/* Pin circle at top */}
      <div className="absolute -top-2 left-1/2 -translate-x-1/2 w-3 h-3 rounded-full bg-[#e07a5f] border-2 border-[#c4654a] shadow-sm z-10" />

      <div className="flex items-start justify-between gap-2 pt-1">
        <div className="flex flex-wrap items-center gap-2">
          <Badge variant="outline" className={cn('gap-1 border-dashed', config.badgeBg)}>
            <TypeIcon className="h-3 w-3" strokeWidth={1.75} />
            {config.label}
          </Badge>
          <Badge variant="outline" className="gap-1 border-dashed border-[#d4c9b8] text-[#5c4b3a]/70">
            <PlatformIcon platform={item.platform} />
            {item.platform}
          </Badge>
          {item.type === FlowItemType.Trending && item.expiresAt && (
            <TimeLeft expiresAt={item.expiresAt} />
          )}
        </div>
        {latestVersion && (
          <EngagementStars score={latestVersion.predictedEngagement} />
        )}
      </div>

      <h3 className="text-sm font-bold leading-snug text-[#5c4b3a] font-heading">{item.title}</h3>
      <p className="text-xs text-[#5c4b3a]/60">{item.summary}</p>

      <div className="rounded-lg bg-[#faf8f5] p-3 border border-dashed border-[#d4c9b8]">
        <p className="text-sm leading-relaxed whitespace-pre-line line-clamp-6 text-[#5c4b3a]">
          {item.content}
        </p>
      </div>

      {latestVersion && (
        <div className="flex items-center gap-3 text-xs text-[#5c4b3a]/60">
          <span>Brand match: <span className="font-semibold text-[#5c4b3a]">{latestVersion.brandMatchScore}%</span></span>
        </div>
      )}

      <div className="pt-1">
        <FlowActions item={item} onApprove={onApprove} onChat={onChat} onSkip={onSkip} />
      </div>
    </div>
  );
}
