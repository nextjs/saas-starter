'use client';

import { Twitter, Linkedin, MessageSquare } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
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
    <div className="flex gap-3 rounded-lg border p-3">
      <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-muted text-xs font-bold">
        {rank}
      </div>
      <div className="min-w-0 flex-1 space-y-2">
        <div className="flex items-center gap-1.5">
          <PlatformIcon platform={item.platform} />
          <span className="capitalize text-xs text-muted-foreground">{item.platform}</span>
        </div>
        <p className="text-sm line-clamp-2">{item.content}</p>
        <div className="flex gap-3 text-xs text-muted-foreground">
          <span>{formatNumber(item.impressions)} imp</span>
          <span>{formatNumber(item.engagement)} engage</span>
        </div>
        <p className="text-xs italic text-muted-foreground">{analysisLabel}: {item.aiAnalysis}</p>
        <Button variant="ghost" size="sm" className="h-6 gap-1 px-2 text-xs">
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
    <Card>
      <CardHeader>
        <CardTitle className="text-sm">Top Content</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Best */}
        <div className="space-y-3">
          <h4 className="text-xs font-medium text-muted-foreground">This week&apos;s best</h4>
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
            <h4 className="text-xs font-medium text-muted-foreground">This week&apos;s worst</h4>
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
      </CardContent>
    </Card>
  );
}
