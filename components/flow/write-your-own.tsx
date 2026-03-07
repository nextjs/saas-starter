'use client';

import { useState } from 'react';
import { Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { cn } from '@/lib/utils';

const platforms = [
  { id: 'twitter', label: '\ud835\udd4f', title: 'Twitter/X' },
  { id: 'linkedin', label: 'in', title: 'LinkedIn' },
  { id: 'instagram', label: '\ud83d\udcf7', title: 'Instagram' },
  { id: 'tiktok', label: '\ud83c\udfb5', title: 'TikTok' },
  { id: 'reddit', label: '\ud83d\udfe0', title: 'Reddit' },
  { id: 'producthunt', label: 'PH', title: 'Product Hunt' },
] as const;

export function WriteYourOwn() {
  const [content, setContent] = useState('');
  const [selectedPlatforms, setSelectedPlatforms] = useState<string[]>(['twitter']);

  function togglePlatform(id: string) {
    setSelectedPlatforms((prev) =>
      prev.includes(id)
        ? prev.filter((p) => p !== id)
        : [...prev, id]
    );
  }

  return (
    <Card className="gap-0 py-0">
      <CardContent className="p-4 space-y-3">
        <h3 className="text-sm font-semibold">Write your own</h3>
        <textarea
          className="w-full rounded-md border bg-transparent px-3 py-2 text-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring min-h-[80px] resize-y"
          placeholder="Drop a seed idea and let AI expand it..."
          value={content}
          onChange={(e) => setContent(e.target.value)}
        />
        <div className="flex flex-wrap items-center gap-1.5">
          {platforms.map((p) => (
            <button
              key={p.id}
              type="button"
              title={p.title}
              onClick={() => togglePlatform(p.id)}
              className={cn(
                'inline-flex h-8 w-8 items-center justify-center rounded-md text-xs font-medium transition-colors border cursor-pointer',
                selectedPlatforms.includes(p.id)
                  ? 'bg-primary text-primary-foreground border-primary'
                  : 'bg-background text-muted-foreground border-border hover:bg-accent'
              )}
            >
              {p.label}
            </button>
          ))}
        </div>
        <Button
          size="sm"
          className="gap-1.5"
          disabled={!content.trim() || selectedPlatforms.length === 0}
        >
          <Sparkles className="h-3.5 w-3.5" strokeWidth={1.75} />
          Generate Draft
        </Button>
      </CardContent>
    </Card>
  );
}
