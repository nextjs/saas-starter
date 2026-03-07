'use client';

import { Plus, Pin } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import type { ChatSession } from '@/lib/types';

function timeAgo(date: Date): string {
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMin = Math.floor(diffMs / 60000);
  if (diffMin < 1) return 'just now';
  if (diffMin < 60) return `${diffMin}m ago`;
  const diffHr = Math.floor(diffMin / 60);
  if (diffHr < 24) return `${diffHr}h ago`;
  const diffDay = Math.floor(diffHr / 24);
  if (diffDay < 7) return `${diffDay}d ago`;
  return `${Math.floor(diffDay / 7)}w ago`;
}

interface SessionListProps {
  sessions: ChatSession[];
  activeSessionId: string;
  onSelectSession: (id: string) => void;
  onNewSession: () => void;
}

export function SessionList({
  sessions,
  activeSessionId,
  onSelectSession,
  onNewSession,
}: SessionListProps) {
  return (
    <div className="flex items-center gap-1.5 overflow-x-auto px-3 py-2 border-b scrollbar-hide">
      <Button
        variant="outline"
        size="sm"
        className="shrink-0 h-8 md:h-7 px-2.5 text-xs gap-1"
        onClick={onNewSession}
      >
        <Plus className="h-3.5 w-3.5" strokeWidth={1.75} />
        New
      </Button>

      {sessions.map((session) => (
        <button
          key={session.id}
          onClick={() => onSelectSession(session.id)}
          className={cn(
            'shrink-0 flex items-center gap-1.5 rounded-full px-3 py-1.5 md:py-1 text-xs font-medium transition-colors cursor-pointer',
            'border hover:bg-accent',
            session.id === activeSessionId
              ? 'bg-foreground text-background border-foreground'
              : 'bg-background text-muted-foreground border-border'
          )}
        >
          {session.pinned && (
            <Pin className="h-3 w-3 shrink-0" strokeWidth={1.75} />
          )}
          <span className="truncate max-w-[120px]">{session.title}</span>
          <span className="text-[10px] opacity-60 shrink-0">
            {timeAgo(session.lastMessageAt)}
          </span>
        </button>
      ))}
    </div>
  );
}
