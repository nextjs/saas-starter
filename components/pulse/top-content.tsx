'use client';

import { Twitter, Linkedin, MessageSquare } from 'lucide-react';
import { Button } from '@/components/ui/button';
import type { TopContent as TopContentType } from '@/lib/types';

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

function formatNumber(n: number): string {
  if (n >= 1000) return `${(n / 1000).toFixed(1)}K`;
  return n.toString();
}

function ContentCard({
  item,
  rank,
  analysisLabel,
}: {
  item: TopContentType;
  rank: number;
  analysisLabel: string;
}) {
  return (
    <div className="flex gap-3 rounded-xl border-2 border-dashed border-[#d4c9b8] p-3">
      <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-[#ebe5d9] text-xs font-bold text-[#5c4b3a]">
        {rank}
      </div>
      <div className="min-w-0 flex-1 space-y-2">
        <div className="flex items-center gap-1.5 text-[#5c4b3a]">
          <PlatformIcon platform={item.platform} />
          <span className="capitalize text-xs text-[#5c4b3a]/60">{item.platform}</span>
        </div>
        <p className="text-sm line-clamp-2 text-[#5c4b3a]">{item.content}</p>
        <div className="flex gap-3 text-xs text-[#5c4b3a]/60">
          <span>{formatNumber(item.impressions)} imp</span>
          <span>{formatNumber(item.engagement)} engage</span>
        </div>
        <p className="text-xs italic text-[#5c4b3a]/60">{analysisLabel}: {item.aiAnalysis}</p>
        <Button variant="ghost" size="sm" className="h-6 gap-1 px-2 text-xs text-[#5c4b3a]/60">
          <MessageSquare className="h-3 w-3" strokeWidth={1.75} />
          Open Post Chat
        </Button>
      </div>
    </div>
  );
}

export function TopContentCard({
  bestContent,
  worstContent,
}: {
  bestContent: TopContentType[];
  worstContent: TopContentType[];
}) {
  return (
    <div className="rounded-xl border-2 border-dashed border-[#d4c9b8] bg-[#faf8f5] p-4 space-y-6">
      <h3 className="text-sm font-bold text-[#5c4b3a]">Top Content</h3>

      {/* Best */}
      <div className="space-y-3">
        <h4 className="text-xs font-medium text-[#5c4b3a]/60">This week&apos;s best</h4>
        {bestContent.map((item, i) => (
          <ContentCard
            key={item.id}
            item={item}
            rank={i + 1}
            analysisLabel="Why it worked"
          />
        ))}
      </div>

      {/* Worst */}
      {worstContent.length > 0 && (
        <div className="space-y-3">
          <h4 className="text-xs font-medium text-[#5c4b3a]/60">This week&apos;s worst</h4>
          {worstContent.map((item, i) => (
            <ContentCard
              key={item.id}
              item={item}
              rank={i + 1}
              analysisLabel="Why it flopped"
            />
          ))}
        </div>
      )}
    </div>
  );
}
