'use client';

import { useState, useCallback } from 'react';
import { CheckCircle2 } from 'lucide-react';
import { FlowCard } from '@/components/flow/flow-card';
import { WriteYourOwn } from '@/components/flow/write-your-own';
import { PostChat } from '@/components/flow/post-chat';
import { Sheet, SheetContent, SheetTitle } from '@/components/ui/sheet';
import { cn } from '@/lib/utils';
import { flowItems as allFlowItems } from '@/lib/mock-data';
import { FlowItemType } from '@/lib/types';
import { useIsMobile } from '@/lib/hooks/use-is-mobile';
import type { FlowItem } from '@/lib/types';

const filters = [
  { id: 'all', label: 'All' },
  { id: 'posts', label: 'Posts' },
  { id: 'replies', label: 'Replies' },
  { id: 'dms', label: 'DMs' },
  { id: 'alerts', label: 'Alerts' },
] as const;

type FilterId = (typeof filters)[number]['id'];

function filterItems(items: FlowItem[], filter: FilterId): FlowItem[] {
  switch (filter) {
    case 'posts':
      return items.filter(
        (i) =>
          i.type === FlowItemType.DailyPost ||
          i.type === FlowItemType.Trending ||
          i.type === FlowItemType.Repost
      );
    case 'replies':
      return items.filter((i) => i.type === FlowItemType.ReplyNeeded);
    case 'dms':
      return items.filter((i) => i.type === FlowItemType.Outreach);
    case 'alerts':
      return items.filter((i) => i.type === FlowItemType.MonitorAlert);
    default:
      return items;
  }
}

export default function FlowPage() {
  const isMobile = useIsMobile();
  const [activeFilter, setActiveFilter] = useState<FilterId>('all');
  const [dismissed, setDismissed] = useState<Set<string>>(new Set());
  const [chatItemId, setChatItemId] = useState<string | null>(null);

  const visibleItems = allFlowItems
    .filter((i) => !dismissed.has(i.id))
    .sort((a, b) => a.priority - b.priority);

  const filtered = filterItems(visibleItems, activeFilter);

  const handleApprove = useCallback((id: string) => {
    setDismissed((prev) => new Set(prev).add(id));
  }, []);

  const handleSkip = useCallback((id: string) => {
    setDismissed((prev) => new Set(prev).add(id));
  }, []);

  const handleChat = useCallback((id: string) => {
    setChatItemId(id);
  }, []);

  const closeChat = useCallback(() => setChatItemId(null), []);

  // Post Chat mode
  const chatItem = chatItemId
    ? allFlowItems.find((i) => i.id === chatItemId)
    : null;

  // Desktop: full page replacement for PostChat
  if (chatItem && !isMobile) {
    return (
      <div className="mx-auto w-full max-w-2xl h-[calc(100dvh-3.5rem)]">
        <PostChat item={chatItem} onBack={closeChat} />
      </div>
    );
  }

  return (
    <>
      {/* Mobile: bottom sheet for PostChat */}
      {isMobile && (
        <Sheet open={!!chatItem} onOpenChange={(open) => !open && closeChat()}>
          <SheetContent
            side="bottom"
            className="h-[calc(100dvh-3rem)] rounded-t-2xl p-0"
            showCloseButton={false}
          >
            <SheetTitle className="sr-only">Post Chat</SheetTitle>
            {chatItem && <PostChat item={chatItem} onBack={closeChat} />}
          </SheetContent>
        </Sheet>
      )}

      <div className="mx-auto w-full max-w-2xl px-4 py-6 space-y-6">
        {/* Filter bar */}
        <div className="flex items-center gap-2 overflow-x-auto">
          {filters.map((f) => (
            <button
              key={f.id}
              type="button"
              onClick={() => setActiveFilter(f.id)}
              className={cn(
                'inline-flex items-center rounded-full px-3.5 py-2 text-sm font-medium transition-colors whitespace-nowrap min-h-[44px] cursor-pointer',
                activeFilter === f.id
                  ? 'bg-primary text-primary-foreground'
                  : 'bg-muted text-muted-foreground hover:bg-accent hover:text-accent-foreground'
              )}
            >
              {f.label}
            </button>
          ))}
        </div>

        {/* Counter */}
        <p className="text-sm text-muted-foreground">
          Today &middot; {filtered.length} {filtered.length === 1 ? 'item' : 'items'} to review
        </p>

        {/* Feed */}
        {filtered.length > 0 ? (
          <div className="space-y-4">
            {filtered.map((item) => (
              <FlowCard
                key={item.id}
                item={item}
                onApprove={handleApprove}
                onChat={handleChat}
                onSkip={handleSkip}
              />
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center gap-2 py-16 text-muted-foreground">
            <CheckCircle2 className="h-10 w-10 text-green-500" strokeWidth={1.75} />
            <p className="text-sm font-medium text-foreground">All done for now</p>
            <p className="text-xs">No more items to review. Nice work!</p>
          </div>
        )}

        {/* Write your own */}
        <WriteYourOwn />
      </div>
    </>
  );
}
