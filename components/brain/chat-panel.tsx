'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import { Send } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { SessionList } from '@/components/brain/session-list';
import { ChatMessageBubble } from '@/components/brain/chat-message';
import type { ChatSession, ChatMessage } from '@/lib/types';

const mockAIResponses = [
  "Got it! I've noted that and will factor it into your upcoming content strategy. Want me to update your content pillars to reflect this?",
  "Interesting direction. Based on your recent engagement data, this could work well. Your audience has been responding positively to this type of content. Let me draft something.",
  "I'll look into that. In the meantime, your Twitter engagement is up 18% this week - your agent-focused content is resonating. Want me to double down on that pillar?",
  "Done! I've updated the strategy. You should see the changes reflected in your Flow queue within the next cycle. Anything else you'd like to adjust?",
  "That's a smart move. I've seen similar patterns work well for accounts in your niche. Let me put together a plan and we can review it together.",
];

interface ChatPanelProps {
  sessions: ChatSession[];
  initialMessages: ChatMessage[];
  initialSessionId: string;
}

export function ChatPanel({
  sessions,
  initialMessages,
  initialSessionId,
}: ChatPanelProps) {
  const [activeSessionId, setActiveSessionId] = useState(initialSessionId);
  const [messagesBySession, setMessagesBySession] = useState<
    Record<string, ChatMessage[]>
  >({ [initialSessionId]: initialMessages });
  const [inputValue, setInputValue] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const messages = messagesBySession[activeSessionId] ?? [];

  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages.length, scrollToBottom]);

  function handleSelectSession(id: string) {
    setActiveSessionId(id);
    if (!messagesBySession[id]) {
      setMessagesBySession((prev) => ({ ...prev, [id]: [] }));
    }
  }

  function handleNewSession() {
    const newId = `cs-new-${Date.now()}`;
    const newSession: ChatSession = {
      id: newId,
      identityId: 'id-lekro',
      title: 'New Session',
      pinned: false,
      lastMessageAt: new Date(),
      createdAt: new Date(),
      messageCount: 0,
    };
    sessions.unshift(newSession);
    setMessagesBySession((prev) => ({ ...prev, [newId]: [] }));
    setActiveSessionId(newId);
  }

  function handleSend() {
    const text = inputValue.trim();
    if (!text || isTyping) return;

    const userMessage: ChatMessage = {
      id: `cm-${Date.now()}`,
      sessionId: activeSessionId,
      role: 'user',
      content: text,
      createdAt: new Date(),
    };

    setMessagesBySession((prev) => ({
      ...prev,
      [activeSessionId]: [...(prev[activeSessionId] ?? []), userMessage],
    }));
    setInputValue('');
    setIsTyping(true);

    // Reset textarea height
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
    }

    // Mock AI response after delay
    setTimeout(() => {
      const aiContent =
        mockAIResponses[Math.floor(Math.random() * mockAIResponses.length)];
      const aiMessage: ChatMessage = {
        id: `cm-ai-${Date.now()}`,
        sessionId: activeSessionId,
        role: 'assistant',
        content: aiContent,
        actionButtons: [
          { label: 'Sounds good', action: 'confirm', variant: 'default' },
          { label: 'Tell me more', action: 'elaborate', variant: 'outline' },
        ],
        createdAt: new Date(),
      };
      setMessagesBySession((prev) => ({
        ...prev,
        [activeSessionId]: [...(prev[activeSessionId] ?? []), aiMessage],
      }));
      setIsTyping(false);
    }, 500);
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  }

  function handleTextareaInput(e: React.ChangeEvent<HTMLTextAreaElement>) {
    setInputValue(e.target.value);
    // Auto-resize
    const ta = e.target;
    ta.style.height = 'auto';
    ta.style.height = Math.min(ta.scrollHeight, 160) + 'px';
  }

  return (
    <div className="flex flex-1 flex-col overflow-hidden">
      {/* Session tabs */}
      <SessionList
        sessions={sessions}
        activeSessionId={activeSessionId}
        onSelectSession={handleSelectSession}
        onNewSession={handleNewSession}
      />

      {/* Messages area */}
      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-4">
        {messages.length === 0 && (
          <div className="flex flex-col items-center justify-center h-full text-muted-foreground gap-1">
            <p className="text-sm">Start a conversation with Brain</p>
            <p className="text-xs">
              Ask about strategy, content ideas, or analytics
            </p>
          </div>
        )}

        {messages.map((msg) => (
          <ChatMessageBubble key={msg.id} message={msg} />
        ))}

        {isTyping && (
          <div className="flex gap-2.5 mr-auto max-w-[85%]">
            <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-muted mt-0.5">
              <div className="flex gap-1">
                <span className="h-1.5 w-1.5 rounded-full bg-muted-foreground animate-bounce [animation-delay:0ms]" />
                <span className="h-1.5 w-1.5 rounded-full bg-muted-foreground animate-bounce [animation-delay:150ms]" />
                <span className="h-1.5 w-1.5 rounded-full bg-muted-foreground animate-bounce [animation-delay:300ms]" />
              </div>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input area */}
      <div className="border-t p-3">
        <div className="flex items-end gap-2 rounded-xl border bg-background px-3 py-2 focus-within:ring-1 focus-within:ring-ring">
          <textarea
            ref={textareaRef}
            value={inputValue}
            onChange={handleTextareaInput}
            onKeyDown={handleKeyDown}
            placeholder="Ask Brain anything..."
            rows={1}
            className={cn(
              'flex-1 resize-none bg-transparent text-sm outline-none',
              'placeholder:text-muted-foreground',
              'max-h-[160px]'
            )}
          />
          <Button
            size="icon"
            className="h-9 w-9 md:h-7 md:w-7 shrink-0 rounded-lg"
            onClick={handleSend}
            disabled={!inputValue.trim() || isTyping}
          >
            <Send className="h-3.5 w-3.5" strokeWidth={1.75} />
          </Button>
        </div>
        <p className="mt-1.5 text-center text-[10px] text-muted-foreground">
          Brain learns your preferences over time. Press Enter to send, Shift+Enter for new line.
        </p>
      </div>
    </div>
  );
}
