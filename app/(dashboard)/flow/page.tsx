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

function FlowIllustration() {
  return (
    <svg width="140" height="70" viewBox="0 0 140 70" fill="none" className="mx-auto mb-3">
      {/* Mailbox */}
      <rect x="55" y="20" width="30" height="40" rx="3" fill="#f5f0e8" stroke="#5c4b3a" strokeWidth="1.5" strokeDasharray="4,3"/>
      <path d="M55,30 L70,22 L85,30" stroke="#5c4b3a" strokeWidth="1.5" fill="none" strokeLinecap="round"/>
      <rect x="63" y="36" width="14" height="2" rx="1" fill="#d4c9b8"/>
      <line x1="70" y1="60" x2="70" y2="68" stroke="#5c4b3a" strokeWidth="2" strokeLinecap="round"/>
      {/* Flying envelopes */}
      <rect x="20" y="15" width="18" height="12" rx="2" fill="#f2d98b" stroke="#e07a5f" strokeWidth="1" transform="rotate(-8 29 21)"/>
      <path d="M21,16 L29,23 L37,16" stroke="#e07a5f" strokeWidth="1" fill="none" transform="rotate(-8 29 21)"/>
      <rect x="100" y="10" width="18" height="12" rx="2" fill="#f2d98b" stroke="#7c9a6e" strokeWidth="1" transform="rotate(6 109 16)"/>
      <path d="M101,11 L109,18 L117,11" stroke="#7c9a6e" strokeWidth="1" fill="none" transform="rotate(6 109 16)"/>
      <rect x="30" y="3" width="14" height="10" rx="2" fill="#f2d98b" stroke="#6b8cae" strokeWidth="1" transform="rotate(-15 37 8)"/>
      {/* Motion lines */}
      <line x1="42" y1="18" x2="52" y2="24" stroke="#d4c9b8" strokeWidth="1" strokeDasharray="2,2"/>
      <line x1="88" y1="22" x2="98" y2="15" stroke="#d4c9b8" strokeWidth="1" strokeDasharray="2,2"/>
    </svg>
  );
}

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

const rotations = ['postit-rotate-1', 'postit-rotate-2', 'postit-rotate-3', 'postit-rotate-4', 'postit-rotate-5', 'postit-rotate-6'];

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

  const chatItem = chatItemId
    ? allFlowItems.find((i) => i.id === chatItemId)
    : null;

  if (chatItem && !isMobile) {
    return (
      <div className="mx-auto w-full max-w-2xl h-[calc(100dvh-3.5rem)]">
        <PostChat item={chatItem} onBack={closeChat} />
      </div>
    );
  }

  return (
    <>
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

      <div className="mx-auto w-full max-w-3xl px-4 py-6 space-y-6">
        <FlowIllustration />

        {/* Filter bar */}
        <div className="flex items-center gap-2 overflow-x-auto">
          {filters.map((f) => (
            <button
              key={f.id}
              type="button"
              onClick={() => setActiveFilter(f.id)}
              className={cn(
                'inline-flex items-center rounded-xl px-4 py-2 text-sm font-semibold transition-colors whitespace-nowrap min-h-[44px] cursor-pointer border-2 border-dashed',
                activeFilter === f.id
                  ? 'bg-[#e07a5f] text-white border-[#e07a5f]'
                  : 'bg-[#f5f0e8] text-[#5c4b3a]/70 border-[#d4c9b8] hover:bg-[#ebe5d9] hover:text-[#5c4b3a]'
              )}
            >
              {f.label}
            </button>
          ))}
        </div>

        {/* Counter */}
        <p className="text-sm text-[#5c4b3a]/60 font-medium">
          Today &middot; {filtered.length} {filtered.length === 1 ? 'item' : 'items'} to review
        </p>

        {/* Feed — 2-column masonry on desktop */}
        {filtered.length > 0 ? (
          <div className="columns-1 md:columns-2 gap-4 space-y-4">
            {filtered.map((item, idx) => (
              <div key={item.id} className={cn('break-inside-avoid', rotations[idx % rotations.length])}>
                <FlowCard
                  item={item}
                  onApprove={handleApprove}
                  onChat={handleChat}
                  onSkip={handleSkip}
                />
              </div>
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center gap-2 py-16 text-[#5c4b3a]/60">
            <CheckCircle2 className="h-10 w-10 text-[#7c9a6e]" strokeWidth={1.75} />
            <p className="text-sm font-semibold text-[#5c4b3a]">All done for now</p>
            <p className="text-xs">No more items to review. Nice work!</p>
          </div>
        )}

        <WriteYourOwn />
      </div>
    </>
  );
}
