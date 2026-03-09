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
    <svg width="160" height="85" viewBox="0 0 160 85" fill="none" className="mx-auto mb-3 sketch-float">
      {/* Scribble doodles */}
      <path d="M8,70 Q12,67 16,71" stroke="#d4c9b8" strokeWidth="0.8" fill="none" />
      <path d="M145,68 Q148,65 152,69" stroke="#d4c9b8" strokeWidth="0.8" fill="none" />
      {/* Mailbox - bigger */}
      <rect x="58" y="22" width="44" height="48" rx="4" fill="#f5f0e8" stroke="#5c4b3a" strokeWidth="1.5" strokeDasharray="4,3"/>
      <path d="M58,34 L80,24 L102,34" stroke="#5c4b3a" strokeWidth="1.5" fill="none" strokeLinecap="round"/>
      <rect x="72" y="42" width="16" height="2.5" rx="1" fill="#d4c9b8"/>
      {/* Flag on mailbox */}
      <line x1="102" y1="28" x2="102" y2="38" stroke="#5c4b3a" strokeWidth="1.5" strokeLinecap="round"/>
      <path d="M102,28 L112,31 L102,34" fill="#e07a5f" opacity="0.7"/>
      <line x1="80" y1="70" x2="80" y2="82" stroke="#5c4b3a" strokeWidth="2" strokeLinecap="round"/>
      {/* Flying envelopes - more detail */}
      <rect x="15" y="16" width="22" height="14" rx="2" fill="#f2d98b" stroke="#e07a5f" strokeWidth="1" transform="rotate(-8 26 23)"/>
      <path d="M16,17 L26,26 L36,17" stroke="#e07a5f" strokeWidth="1" fill="none" transform="rotate(-8 26 23)"/>
      <rect x="115" y="10" width="22" height="14" rx="2" fill="#f2d98b" stroke="#7c9a6e" strokeWidth="1" transform="rotate(6 126 17)"/>
      <path d="M116,11 L126,20 L136,11" stroke="#7c9a6e" strokeWidth="1" fill="none" transform="rotate(6 126 17)"/>
      <rect x="30" y="2" width="18" height="12" rx="2" fill="#f2d98b" stroke="#6b8cae" strokeWidth="1" transform="rotate(-15 39 8)"/>
      <path d="M31,3 L39,10 L47,3" stroke="#6b8cae" strokeWidth="0.8" fill="none" transform="rotate(-15 39 8)"/>
      {/* Extra small envelope */}
      <rect x="120" y="38" width="14" height="10" rx="1.5" fill="#f2d98b" stroke="#e07a5f" strokeWidth="0.8" transform="rotate(12 127 43)" opacity="0.6"/>
      {/* Motion lines - more */}
      <line x1="42" y1="20" x2="55" y2="28" stroke="#d4c9b8" strokeWidth="1" strokeDasharray="2,2"/>
      <line x1="105" y1="24" x2="113" y2="16" stroke="#d4c9b8" strokeWidth="1" strokeDasharray="2,2"/>
      <line x1="48" y1="8" x2="54" y2="14" stroke="#d4c9b8" strokeWidth="0.8" strokeDasharray="2,2"/>
      {/* Sparkles */}
      <circle cx="10" cy="30" r="2" fill="#7c9a6e" opacity="0.5"/>
      <circle cx="150" cy="28" r="1.5" fill="#e07a5f" opacity="0.5"/>
      {/* Tiny star */}
      <path d="M142,52 L143.5,48 L145,52 L141.5,50 L146.5,50 Z" fill="#f2d98b" opacity="0.4"/>
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
                'inline-flex items-center px-4 py-2 text-sm font-semibold transition-colors whitespace-nowrap min-h-[44px] cursor-pointer border-2 border-dashed sketch-btn',
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
