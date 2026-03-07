'use client';

import { Star } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import type { PostVersion } from '@/lib/types';
import { cn } from '@/lib/utils';

function BrandMatchBadge({ score }: { score: number }) {
  const color =
    score >= 85
      ? 'text-green-700 bg-green-100 dark:text-green-400 dark:bg-green-950'
      : score >= 70
        ? 'text-yellow-700 bg-yellow-100 dark:text-yellow-400 dark:bg-yellow-950'
        : 'text-red-700 bg-red-100 dark:text-red-400 dark:bg-red-950';

  return (
    <span className={cn('inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium', color)}>
      Brand Match: {score}%
    </span>
  );
}

function EngagementStars({ score }: { score: number }) {
  const stars = Math.round(score / 20);
  return (
    <div className="flex items-center gap-1">
      <span className="text-xs text-muted-foreground">Predicted:</span>
      <div className="flex items-center gap-0.5">
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
    </div>
  );
}

interface PostVersionCardProps {
  version: PostVersion;
  isLatest: boolean;
}

export function PostVersionCard({ version, isLatest }: PostVersionCardProps) {
  return (
    <div className={cn(
      'rounded-lg border p-4 space-y-3',
      isLatest ? 'border-primary/30 bg-primary/5' : 'bg-muted/30'
    )}>
      {/* Version badge */}
      <div className="flex items-center justify-between gap-2">
        <Badge
          variant={isLatest ? 'default' : 'secondary'}
          className="text-xs"
        >
          V{version.version}
          {isLatest && ' (latest)'}
        </Badge>
      </div>

      {/* Content */}
      <div className="rounded-md bg-background p-3 border">
        <p className="text-sm leading-relaxed whitespace-pre-line">
          {version.content}
        </p>
      </div>

      {/* Scores */}
      <div className="flex flex-wrap items-center gap-3">
        <BrandMatchBadge score={version.brandMatchScore} />
        <EngagementStars score={version.predictedEngagement} />
      </div>
    </div>
  );
}
