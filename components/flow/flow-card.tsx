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
import { Card, CardContent } from '@/components/ui/card';
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
    color: 'text-red-600 dark:text-red-400',
    badgeBg: 'bg-red-100 text-red-700 dark:bg-red-950 dark:text-red-400',
  },
  [FlowItemType.DailyPost]: {
    label: 'Daily Post',
    icon: PenLine,
    color: 'text-blue-600 dark:text-blue-400',
    badgeBg: 'bg-blue-100 text-blue-700 dark:bg-blue-950 dark:text-blue-400',
  },
  [FlowItemType.ReplyNeeded]: {
    label: 'Reply Needed',
    icon: MessageCircle,
    color: 'text-purple-600 dark:text-purple-400',
    badgeBg: 'bg-purple-100 text-purple-700 dark:bg-purple-950 dark:text-purple-400',
  },
  [FlowItemType.Repost]: {
    label: 'Repost',
    icon: Repeat2,
    color: 'text-green-600 dark:text-green-400',
    badgeBg: 'bg-green-100 text-green-700 dark:bg-green-950 dark:text-green-400',
  },
  [FlowItemType.Outreach]: {
    label: 'Outreach',
    icon: Send,
    color: 'text-teal-600 dark:text-teal-400',
    badgeBg: 'bg-teal-100 text-teal-700 dark:bg-teal-950 dark:text-teal-400',
  },
  [FlowItemType.MonitorAlert]: {
    label: 'From Monitor',
    icon: Eye,
    color: 'text-amber-600 dark:text-amber-400',
    badgeBg: 'bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-400',
  },
};

function PlatformIcon({ platform }: { platform: string }) {
  switch (platform) {
    case 'twitter':
      return <Twitter className="h-3.5 w-3.5" strokeWidth={1.75} />;
    case 'linkedin':
      return <Linkedin className="h-3.5 w-3.5" strokeWidth={1.75} />;
    case 'reddit':
      return (
        <span className="text-xs font-bold leading-none">r/</span>
      );
    default:
      return null;
  }
}

function EngagementStars({ score }: { score: number }) {
  const stars = Math.round(score / 20); // 0-100 -> 0-5
  return (
    <div className="flex items-center gap-0.5" title={`Predicted engagement: ${score}%`}>
      {Array.from({ length: 5 }, (_, i) => (
        <Star
          key={i}
          className={cn(
            'h-3 w-3',
            i < stars
              ? 'fill-amber-400 text-amber-400'
              : 'text-muted-foreground/30'
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
    <span className="inline-flex items-center gap-1 text-xs text-red-600 dark:text-red-400 font-medium">
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
    <Card className="gap-0 py-0 overflow-hidden transition-all">
      <CardContent className="p-4 space-y-3">
        {/* Header: type badge + platform + engagement */}
        <div className="flex items-start justify-between gap-2">
          <div className="flex flex-wrap items-center gap-2">
            <Badge variant="secondary" className={cn('gap-1 border-0', config.badgeBg)}>
              <TypeIcon className="h-3 w-3" strokeWidth={1.75} />
              {config.label}
            </Badge>
            <Badge variant="outline" className="gap-1">
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

        {/* Title */}
        <h3 className="text-sm font-semibold leading-snug">{item.title}</h3>

        {/* Summary */}
        <p className="text-xs text-muted-foreground">{item.summary}</p>

        {/* Content preview */}
        <div className="rounded-md bg-muted/50 p-3">
          <p className="text-sm leading-relaxed whitespace-pre-line line-clamp-6">
            {item.content}
          </p>
        </div>

        {/* Brand match score */}
        {latestVersion && (
          <div className="flex items-center gap-3 text-xs text-muted-foreground">
            <span>Brand match: <span className="font-medium text-foreground">{latestVersion.brandMatchScore}%</span></span>
          </div>
        )}

        {/* Actions */}
        <div className="pt-1">
          <FlowActions
            item={item}
            onApprove={onApprove}
            onChat={onChat}
            onSkip={onSkip}
          />
        </div>
      </CardContent>
    </Card>
  );
}
