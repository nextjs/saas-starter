'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

const mockProfile = {
  identityTags: ['AI builder', 'Startup founder', 'Developer tools', 'Fintech'],
  voiceDescription:
    'Direct, conversational, and technical. You favor short punchy sentences over long explanations. You use concrete examples and avoid corporate jargon. Your tone is confident but approachable.',
  topics: [
    { name: 'AI Agents', allocation: 35 },
    { name: 'Startup Building', allocation: 25 },
    { name: 'Payment Infra', allocation: 25 },
    { name: 'Dev Tools', allocation: 15 },
  ],
  sampleAnchors: [
    'shipped this over the weekend',
    "here's what actually happened",
    'hot take:',
    'the thing nobody tells you about',
  ],
};

export function StepConfirm({
  onNext,
  onBack,
}: {
  onNext: () => void;
  onBack: () => void;
}) {
  const [editing, setEditing] = useState(false);
  const [voiceDesc, setVoiceDesc] = useState(mockProfile.voiceDescription);

  return (
    <div className="flex flex-col gap-6">
      <div className="text-center space-y-2">
        <h1 className="text-2xl font-semibold tracking-tight">
          Here&apos;s what we learned
        </h1>
        <p className="text-muted-foreground">
          Does this feel like you?
        </p>
      </div>

      {/* Identity tags */}
      <div className="space-y-2">
        <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
          Identity
        </p>
        <div className="flex flex-wrap gap-2">
          {mockProfile.identityTags.map((tag) => (
            <Badge key={tag} variant="secondary" className="text-sm px-3 py-1">
              {tag}
            </Badge>
          ))}
        </div>
      </div>

      {/* Voice description */}
      <div className="space-y-2">
        <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
          Your Voice
        </p>
        {editing ? (
          <textarea
            value={voiceDesc}
            onChange={(e) => setVoiceDesc(e.target.value)}
            rows={4}
            className="w-full rounded-lg border bg-background px-3 py-2 text-sm outline-none focus:border-primary transition-colors resize-none"
          />
        ) : (
          <p className="text-sm leading-relaxed rounded-lg border bg-card p-3">
            {voiceDesc}
          </p>
        )}
      </div>

      {/* Topics */}
      <div className="space-y-2">
        <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
          Content Pillars
        </p>
        <div className="space-y-2">
          {mockProfile.topics.map((topic) => (
            <div key={topic.name} className="flex items-center gap-3">
              <span className="text-sm flex-1">{topic.name}</span>
              <div className="w-24 h-1.5 rounded-full bg-muted overflow-hidden">
                <div
                  className="h-full rounded-full bg-primary transition-all"
                  style={{ width: `${topic.allocation}%` }}
                />
              </div>
              <span className="text-xs text-muted-foreground w-8 text-right">
                {topic.allocation}%
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Signature phrases */}
      <div className="space-y-2">
        <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
          Your Signature Phrases
        </p>
        <div className="flex flex-wrap gap-2">
          {mockProfile.sampleAnchors.map((anchor) => (
            <span
              key={anchor}
              className="rounded-lg bg-muted px-3 py-1.5 text-sm italic text-muted-foreground"
            >
              &ldquo;{anchor}&rdquo;
            </span>
          ))}
        </div>
      </div>

      {/* Actions */}
      <div className="flex gap-3 pt-2">
        <Button
          variant="outline"
          className="flex-1 rounded-xl h-12"
          onClick={() => {
            if (editing) {
              setEditing(false);
            } else {
              setEditing(true);
            }
          }}
        >
          {editing ? 'Done editing' : 'Adjust'}
        </Button>
        <Button
          className="flex-1 rounded-xl h-12 text-base"
          onClick={onNext}
        >
          That&apos;s me!
        </Button>
      </div>
    </div>
  );
}
