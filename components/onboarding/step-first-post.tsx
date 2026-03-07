'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { MessageCircle, CalendarClock, ArrowRight } from 'lucide-react';

const mockDraft = {
  content:
    "Everyone's building AI agents but nobody talks about memory.\n\nYour agent is only as good as what it remembers. Here's how to think about it:\n\n1. Working memory — current task context\n2. Episodic memory — past interactions\n3. Semantic memory — learned patterns\n\nMost frameworks only give you #1. That's why agents feel dumb.\n\nWhat's your approach to agent memory?",
  brandMatchScore: 91,
  platform: 'Twitter',
};

export function StepFirstPost({
  onNext,
  onBack,
}: {
  onNext: () => void;
  onBack: () => void;
}) {
  const [showChat, setShowChat] = useState(false);
  const [chatInput, setChatInput] = useState('');

  return (
    <div className="flex flex-col gap-6">
      <div className="text-center space-y-2">
        <h1 className="text-2xl font-semibold tracking-tight">
          Your first post
        </h1>
        <p className="text-muted-foreground">
          We drafted something in your voice. What do you think?
        </p>
      </div>

      {/* Draft card */}
      <div className="rounded-xl border bg-card overflow-hidden">
        <div className="flex items-center justify-between px-4 py-2.5 border-b bg-muted/40">
          <span className="text-xs font-medium text-muted-foreground">
            {mockDraft.platform}
          </span>
          <Badge
            variant="secondary"
            className="text-xs"
          >
            Brand Match: {mockDraft.brandMatchScore}%
          </Badge>
        </div>
        <div className="px-4 py-4">
          <p className="text-sm leading-relaxed whitespace-pre-line">
            {mockDraft.content}
          </p>
        </div>
      </div>

      {/* Chat input for editing */}
      {showChat && (
        <div className="flex gap-2 animate-in fade-in slide-in-from-bottom-2 duration-300">
          <input
            type="text"
            value={chatInput}
            onChange={(e) => setChatInput(e.target.value)}
            placeholder="Tell me how to adjust this..."
            className="flex-1 rounded-xl border bg-background px-4 py-2.5 text-sm outline-none focus:border-primary transition-colors"
            autoFocus
          />
          <Button
            size="icon"
            className="rounded-xl shrink-0"
            disabled={!chatInput.trim()}
          >
            <ArrowRight className="h-4 w-4" strokeWidth={1.75} />
          </Button>
        </div>
      )}

      {/* Actions */}
      <div className="flex flex-col gap-2 pt-2">
        <Button
          className="w-full rounded-xl h-12 text-base gap-2"
          onClick={onNext}
        >
          <CalendarClock className="h-4 w-4" strokeWidth={1.75} />
          Approve &amp; Schedule
        </Button>
        <div className="flex gap-2">
          <Button
            variant="outline"
            className="flex-1 rounded-xl gap-2"
            onClick={() => setShowChat(!showChat)}
          >
            <MessageCircle className="h-4 w-4" strokeWidth={1.75} />
            {showChat ? 'Hide chat' : 'Edit with AI'}
          </Button>
          <Button
            variant="ghost"
            className="flex-1 rounded-xl text-muted-foreground"
            onClick={onNext}
          >
            Skip for now
          </Button>
        </div>
      </div>
    </div>
  );
}
