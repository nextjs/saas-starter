'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import {
  ArrowLeft,
  Send,
  CalendarPlus,
  PenLine,
  Star,
  Lightbulb,
  Check,
  X,
  Twitter,
  Linkedin,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { PostVersionCard } from '@/components/flow/post-version';
import type { FlowItem } from '@/lib/types';
import { FlowItemType } from '@/lib/types';
import { cn } from '@/lib/utils';

const mockFeedback: Record<string, { afterVersion: number; message: string }[]> = {
  'fi-1': [
    { afterVersion: 1, message: 'Make it shorter and more punchy. Cut the benchmark numbers -- focus on the agent builder angle.' },
    { afterVersion: 2, message: 'Good, but add a stronger hook at the beginning and end with a question.' },
  ],
  'fi-4': [
    { afterVersion: 1, message: 'Make it more personal -- lead with a specific anecdote from our experience, not an abstract statement.' },
  ],
};

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

const typeLabels: Record<FlowItemType, string> = {
  [FlowItemType.Trending]: 'Trending',
  [FlowItemType.DailyPost]: 'Daily Post',
  [FlowItemType.ReplyNeeded]: 'Reply',
  [FlowItemType.Repost]: 'Repost',
  [FlowItemType.Outreach]: 'Outreach',
  [FlowItemType.MonitorAlert]: 'Monitor',
};

function LearningNote({
  note,
  onConfirm,
}: {
  note: string;
  onConfirm: (remember: boolean) => void;
}) {
  const [dismissed, setDismissed] = useState(false);
  const [confirmation, setConfirmation] = useState<string | null>(null);

  if (dismissed && confirmation) {
    return (
      <div className="rounded-xl border-2 border-dashed border-[#d4c9b8] p-3 text-center text-xs text-[#5c4b3a]/60">
        {confirmation}
      </div>
    );
  }

  if (dismissed) return null;

  return (
    <div className="rounded-xl border-2 border-dashed border-[#f2d98b] bg-[#f2d98b]/15 p-4 space-y-3">
      <div className="flex items-start gap-2">
        <Lightbulb className="h-4 w-4 text-[#e07a5f] mt-0.5 shrink-0" strokeWidth={1.75} />
        <div className="space-y-1">
          <p className="text-xs font-bold text-[#5c4b3a]">AI learned from this interaction</p>
          <p className="text-sm text-[#5c4b3a]">{note}</p>
        </div>
      </div>
      <div className="flex items-center gap-2">
        <Button
          size="sm"
          variant="outline"
          className="gap-1.5 text-xs border-2 border-dashed border-[#7c9a6e] text-[#7c9a6e] hover:bg-[#7c9a6e]/10 rounded-xl"
          onClick={() => {
            onConfirm(true);
            setConfirmation('Got it -- I\'ll remember this for future drafts.');
            setDismissed(true);
          }}
        >
          <Check className="h-3 w-3" strokeWidth={1.75} />
          Remember this
        </Button>
        <Button
          size="sm"
          variant="ghost"
          className="gap-1.5 text-xs text-[#5c4b3a]/50 rounded-xl"
          onClick={() => {
            onConfirm(false);
            setConfirmation('Noted -- treating this as a one-time preference.');
            setDismissed(true);
          }}
        >
          <X className="h-3 w-3" strokeWidth={1.75} />
          One-time
        </Button>
      </div>
    </div>
  );
}

function WriteOwnVersion({
  initialContent,
  onSubmit,
}: {
  initialContent: string;
  onSubmit: (content: string) => void;
}) {
  const [content, setContent] = useState(initialContent);
  const [mockScore, setMockScore] = useState(
    Math.floor(Math.random() * 16) + 80
  );

  useEffect(() => {
    const timeout = setTimeout(() => {
      setMockScore(Math.floor(Math.random() * 16) + 80);
    }, 600);
    return () => clearTimeout(timeout);
  }, [content]);

  const scoreColor =
    mockScore >= 85 ? 'text-[#7c9a6e]' : 'text-[#f2d98b]';

  return (
    <div className="space-y-3 sketch-card p-4">
      <p className="text-xs font-bold text-[#5c4b3a]">Write your final version</p>
      <textarea
        className="w-full rounded-xl border-2 border-dashed border-[#d4c9b8] bg-[#faf8f5] px-3 py-2 text-sm text-[#5c4b3a] placeholder:text-[#5c4b3a]/40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#e07a5f] min-h-[120px] resize-y"
        value={content}
        onChange={(e) => setContent(e.target.value)}
      />
      <div className="flex items-center justify-between">
        <span className="text-xs text-[#5c4b3a]/60">
          Live Brand Match:{' '}
          <span className={cn('font-semibold', scoreColor)}>{mockScore}%</span>
        </span>
        <Button
          size="sm"
          className="gap-1.5 bg-[#e07a5f] hover:bg-[#c4654a] text-white rounded-xl"
          disabled={!content.trim()}
          onClick={() => onSubmit(content)}
        >
          <CalendarPlus className="h-3.5 w-3.5" strokeWidth={1.75} />
          Submit &rarr; Schedule
        </Button>
      </div>
    </div>
  );
}

interface PostChatProps {
  item: FlowItem;
  onBack: () => void;
}

export function PostChat({ item, onBack }: PostChatProps) {
  const [feedbackInput, setFeedbackInput] = useState('');
  const [localVersions, setLocalVersions] = useState(item.versions);
  const [localFeedback, setLocalFeedback] = useState(
    mockFeedback[item.id] ?? []
  );
  const [showWriteOwn, setShowWriteOwn] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  const latestVersion = localVersions[localVersions.length - 1];

  const scrollToBottom = useCallback(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [localVersions.length, localFeedback.length, scrollToBottom]);

  function handleSendFeedback() {
    if (!feedbackInput.trim()) return;

    const currentVersion = latestVersion.version;
    setLocalFeedback((prev) => [
      ...prev,
      { afterVersion: currentVersion, message: feedbackInput },
    ]);

    const newVersion = currentVersion + 1;
    const mockNewContent = `[AI-generated V${newVersion} based on your feedback]\n\n${latestVersion.content}`;
    const newVersionObj = {
      id: `pv-gen-${Date.now()}`,
      version: newVersion,
      content: mockNewContent,
      brandMatchScore: Math.min(99, latestVersion.brandMatchScore + Math.floor(Math.random() * 6) + 1),
      predictedEngagement: Math.min(99, latestVersion.predictedEngagement + Math.floor(Math.random() * 8) + 1),
      createdAt: new Date(),
    };

    setTimeout(() => {
      setLocalVersions((prev) => [...prev, newVersionObj]);
    }, 500);

    setFeedbackInput('');
  }

  const timeline: { type: 'version' | 'feedback'; data: unknown; key: string }[] = [];
  for (const v of localVersions) {
    timeline.push({ type: 'version', data: v, key: `v-${v.id}` });
    const fb = localFeedback.find((f) => f.afterVersion === v.version);
    if (fb) {
      timeline.push({ type: 'feedback', data: fb, key: `fb-${v.version}` });
    }
  }

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="sticky top-0 z-10 border-b-2 border-dashed border-[#d4c9b8] bg-[#f5f0e8] px-4 py-3">
        <div className="flex items-center gap-3">
          <Button
            variant="ghost"
            size="sm"
            className="gap-1.5 -ml-2 min-h-[44px] md:min-h-0 text-[#5c4b3a]"
            onClick={onBack}
          >
            <ArrowLeft className="h-4 w-4" strokeWidth={1.75} />
            <span className="hidden sm:inline">Back to Flow</span>
          </Button>
          <div className="flex items-center gap-2 ml-auto">
            <Badge variant="outline" className="gap-1 border-dashed border-[#d4c9b8] text-[#5c4b3a]/70">
              <PlatformIcon platform={item.platform} />
              {item.platform}
            </Badge>
            <Badge className="text-xs bg-[#ebe5d9] text-[#5c4b3a] border-dashed border border-[#d4c9b8]">
              {typeLabels[item.type]}
            </Badge>
          </div>
        </div>
        <h2 className="text-sm font-bold mt-2 line-clamp-1 text-[#5c4b3a]">{item.title}</h2>
      </div>

      {/* Timeline */}
      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-4 lined-paper bg-[#faf8f5]">
        {timeline.map((entry) => {
          if (entry.type === 'version') {
            const v = entry.data as (typeof localVersions)[number];
            return (
              <PostVersionCard key={entry.key} version={v} isLatest={v.id === latestVersion.id} />
            );
          }

          const fb = entry.data as { afterVersion: number; message: string };
          return (
            <div key={entry.key} className="flex justify-end">
              <div className="max-w-[85%] rounded-xl rounded-br-sm bg-[#5c4b3a] px-3.5 py-2.5 text-sm text-[#faf8f5] sketch-shadow">
                {fb.message}
              </div>
            </div>
          );
        })}

        {item.learningNote && (
          <LearningNote note={item.learningNote.note} onConfirm={() => {}} />
        )}

        {showWriteOwn && (
          <WriteOwnVersion
            initialContent={latestVersion.content}
            onSubmit={() => {
              setShowWriteOwn(false);
              onBack();
            }}
          />
        )}

        <div ref={bottomRef} />
      </div>

      {/* Bottom action bar */}
      <div className="border-t-2 border-dashed border-[#d4c9b8] bg-[#f5f0e8] px-4 py-3 space-y-3">
        {!showWriteOwn && (
          <div className="flex items-end gap-2">
            <textarea
              className="flex-1 rounded-xl border-2 border-dashed border-[#d4c9b8] bg-[#faf8f5] px-3 py-2 text-sm text-[#5c4b3a] placeholder:text-[#5c4b3a]/40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#e07a5f] min-h-[40px] max-h-[120px] resize-none"
              placeholder="Give feedback to refine this draft..."
              rows={1}
              value={feedbackInput}
              onChange={(e) => setFeedbackInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  handleSendFeedback();
                }
              }}
            />
            <Button
              size="sm"
              disabled={!feedbackInput.trim()}
              onClick={handleSendFeedback}
              className="bg-[#e07a5f] hover:bg-[#c4654a] text-white rounded-xl"
            >
              <Send className="h-4 w-4" strokeWidth={1.75} />
            </Button>
          </div>
        )}

        <div className="flex flex-wrap items-center gap-2">
          <Button
            size="sm"
            className="gap-1.5 min-h-[44px] md:min-h-0 bg-[#e07a5f] hover:bg-[#c4654a] text-white rounded-xl"
            onClick={onBack}
          >
            <CalendarPlus className="h-3.5 w-3.5" strokeWidth={1.75} />
            Approve V{latestVersion.version} &rarr; Schedule
          </Button>
          {!showWriteOwn && (
            <Button
              variant="outline"
              size="sm"
              className="gap-1.5 min-h-[44px] md:min-h-0 border-2 border-dashed border-[#d4c9b8] text-[#5c4b3a] hover:bg-[#ebe5d9] rounded-xl"
              onClick={() => setShowWriteOwn(true)}
            >
              <PenLine className="h-3.5 w-3.5" strokeWidth={1.75} />
              Write my own
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
