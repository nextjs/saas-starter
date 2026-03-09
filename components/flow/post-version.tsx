'use client';

import { Star } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import type { PostVersion } from '@/lib/types';
import { cn } from '@/lib/utils';

function BrandMatchBadge({ score }: { score: number }) {
  const color =
    score >= 85
      ? 'text-[#7c9a6e] bg-[#7c9a6e]/15'
      : score >= 70
        ? 'text-[#f2d98b] bg-[#f2d98b]/20'
        : 'text-[#e07a5f] bg-[#e07a5f]/15';

  return (
    <span className={cn('inline-flex items-center rounded-full px-2 py-0.5 text-xs font-semibold border border-dashed border-[#d4c9b8]', color)}>
      Brand Match: {score}%
    </span>
  );
}

function EngagementStars({ score }: { score: number }) {
  const stars = Math.round(score / 20);
  return (
    <div className="flex items-center gap-1">
      <span className="text-xs text-[#5c4b3a]/60">Predicted:</span>
      <div className="flex items-center gap-0.5">
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
      'rounded-xl p-4 space-y-3 border-2 border-dashed',
      isLatest ? 'border-[#e07a5f] bg-[#e07a5f]/5' : 'border-[#d4c9b8] bg-[#f5f0e8]'
    )}>
      <div className="flex items-center justify-between gap-2">
        <Badge
          variant={isLatest ? 'default' : 'secondary'}
          className={cn(
            'text-xs rounded-lg',
            isLatest ? 'bg-[#e07a5f] text-white' : 'bg-[#ebe5d9] text-[#5c4b3a]'
          )}
        >
          V{version.version}
          {isLatest && ' (latest)'}
        </Badge>
      </div>

      <div className="rounded-lg bg-[#faf8f5] p-3 border border-dashed border-[#d4c9b8]">
        <p className="text-sm leading-relaxed whitespace-pre-line text-[#5c4b3a]">
          {version.content}
        </p>
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <BrandMatchBadge score={version.brandMatchScore} />
        <EngagementStars score={version.predictedEngagement} />
      </div>
    </div>
  );
}
