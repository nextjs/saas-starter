'use client';

import { Check, Pencil, X, Reply, Send, Repeat2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import type { FlowItem } from '@/lib/types';
import { FlowItemType } from '@/lib/types';

function getPrimaryAction(item: FlowItem) {
  switch (item.type) {
    case FlowItemType.ReplyNeeded:
    case FlowItemType.MonitorAlert:
      return { label: 'Reply', icon: Reply };
    case FlowItemType.Outreach:
      return { label: 'Send', icon: Send };
    case FlowItemType.Repost:
      return { label: 'Repost', icon: Repeat2 };
    default:
      return { label: 'Approve', icon: Check };
  }
}

interface FlowActionsProps {
  item: FlowItem;
  onApprove: (id: string) => void;
  onChat: (id: string) => void;
  onSkip: (id: string) => void;
}

export function FlowActions({ item, onApprove, onChat, onSkip }: FlowActionsProps) {
  const primary = getPrimaryAction(item);
  const PrimaryIcon = primary.icon;

  return (
    <div className="flex items-center gap-2">
      <Button
        size="sm"
        className="gap-1.5 min-h-[44px] md:min-h-0"
        onClick={() => onApprove(item.id)}
      >
        <PrimaryIcon className="h-3.5 w-3.5" strokeWidth={1.75} />
        {primary.label}
      </Button>
      <Button
        variant="secondary"
        size="sm"
        className="gap-1.5 min-h-[44px] md:min-h-0"
        onClick={() => onChat(item.id)}
      >
        <Pencil className="h-3.5 w-3.5" strokeWidth={1.75} />
        Chat
      </Button>
      <Button
        variant="ghost"
        size="sm"
        className="gap-1.5 text-muted-foreground min-h-[44px] md:min-h-0"
        onClick={() => onSkip(item.id)}
      >
        <X className="h-3.5 w-3.5" strokeWidth={1.75} />
        Skip
      </Button>
    </div>
  );
}
