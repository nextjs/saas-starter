'use client';

import { Brain, User } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import type { ChatMessage as ChatMessageType, ActionButton } from '@/lib/types';

function formatTime(date: Date): string {
  return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
}

function renderContent(content: string) {
  // Split by newlines and handle basic formatting
  return content.split('\n').map((line, i) => {
    if (line.trim() === '') return <br key={i} />;

    // Bold: **text**
    const parts = line.split(/(\*\*[^*]+\*\*)/g).map((part, j) => {
      if (part.startsWith('**') && part.endsWith('**')) {
        return <strong key={j}>{part.slice(2, -2)}</strong>;
      }
      // Inline code: `text`
      const codeParts = part.split(/(`[^`]+`)/g).map((cp, k) => {
        if (cp.startsWith('`') && cp.endsWith('`')) {
          return (
            <code
              key={k}
              className="rounded bg-muted px-1 py-0.5 text-[13px] font-mono"
            >
              {cp.slice(1, -1)}
            </code>
          );
        }
        return cp;
      });
      return <span key={j}>{codeParts}</span>;
    });

    // Numbered list items
    if (/^\d+[/.]\s/.test(line)) {
      return (
        <p key={i} className="ml-1">
          {parts}
        </p>
      );
    }

    // Bullet points
    if (line.trimStart().startsWith('- ')) {
      return (
        <p key={i} className="ml-3">
          {parts}
        </p>
      );
    }

    return <p key={i}>{parts}</p>;
  });
}

interface ChatMessageProps {
  message: ChatMessageType;
  onAction?: (action: string) => void;
}

export function ChatMessageBubble({ message, onAction }: ChatMessageProps) {
  const isUser = message.role === 'user';

  return (
    <div
      className={cn(
        'flex gap-2.5 max-w-[85%]',
        isUser ? 'ml-auto flex-row-reverse' : 'mr-auto'
      )}
    >
      {/* Avatar */}
      <div
        className={cn(
          'flex h-7 w-7 shrink-0 items-center justify-center rounded-full mt-0.5',
          isUser ? 'bg-foreground' : 'bg-muted'
        )}
      >
        {isUser ? (
          <User className="h-3.5 w-3.5 text-background" strokeWidth={1.75} />
        ) : (
          <Brain className="h-3.5 w-3.5 text-foreground" strokeWidth={1.75} />
        )}
      </div>

      {/* Content */}
      <div className="space-y-2">
        <div
          className={cn(
            'rounded-2xl px-3.5 py-2.5 text-sm leading-relaxed',
            isUser
              ? 'bg-foreground text-background rounded-tr-sm'
              : 'bg-muted rounded-tl-sm'
          )}
        >
          <div className="space-y-1.5">{renderContent(message.content)}</div>
        </div>

        {/* Action buttons */}
        {message.actionButtons && message.actionButtons.length > 0 && (
          <div className="flex flex-wrap gap-1.5">
            {message.actionButtons.map((btn: ActionButton) => (
              <Button
                key={btn.action}
                variant={btn.variant === 'default' ? 'default' : btn.variant === 'outline' ? 'outline' : 'ghost'}
                size="sm"
                className="h-7 text-xs px-3 rounded-full"
                onClick={() => onAction?.(btn.action)}
              >
                {btn.label}
              </Button>
            ))}
          </div>
        )}

        {/* Timestamp */}
        <p className={cn(
          'text-[10px] text-muted-foreground',
          isUser ? 'text-right' : 'text-left'
        )}>
          {formatTime(message.createdAt)}
        </p>
      </div>
    </div>
  );
}
