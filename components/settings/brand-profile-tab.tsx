'use client';

import { useState } from 'react';
import { Plus, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { Slider } from '@/components/ui/slider';
import { Textarea } from '@/components/ui/textarea';
import { identities, currentIdentityId } from '@/lib/mock-data';

const identity = identities.find((i) => i.id === currentIdentityId)!;
const bv = identity.brandVoice;

const voiceSliders = [
  { key: 'formality', label: 'Formality', left: 'Casual', right: 'Formal' },
  { key: 'technicality', label: 'Technicality', left: 'Simple', right: 'Technical' },
  { key: 'humor', label: 'Humor', left: 'Serious', right: 'Humorous' },
  { key: 'assertiveness', label: 'Assertiveness', left: 'Gentle', right: 'Bold' },
  { key: 'emojiUsage', label: 'Emoji Usage', left: 'None', right: 'Frequent' },
] as const;

export function BrandProfileTab() {
  const [voiceParams, setVoiceParams] = useState(bv.voiceParams);
  const [pillars, setPillars] = useState(
    bv.contentPillars.map((p) => ({ topic: p.name, weight: p.allocation }))
  );
  const [rules, setRules] = useState(bv.rules.join('\n'));
  const [anchors, setAnchors] = useState(bv.anchors);
  const [anchorInput, setAnchorInput] = useState('');

  function addPillar() {
    setPillars([...pillars, { topic: '', weight: 10 }]);
  }

  function removePillar(index: number) {
    setPillars(pillars.filter((_, i) => i !== index));
  }

  function updatePillar(index: number, field: 'topic' | 'weight', value: string | number) {
    const updated = [...pillars];
    updated[index] = { ...updated[index], [field]: value };
    setPillars(updated);
  }

  function addAnchor() {
    if (anchorInput.trim()) {
      setAnchors([...anchors, anchorInput.trim()]);
      setAnchorInput('');
    }
  }

  function removeAnchor(index: number) {
    setAnchors(anchors.filter((_, i) => i !== index));
  }

  return (
    <div className="space-y-8">
      {/* Identity Section */}
      <div className="space-y-4">
        <div>
          <h3 className="text-lg font-semibold">Identity</h3>
          <p className="text-sm text-muted-foreground">
            Basic information about this brand identity.
          </p>
        </div>
        <Separator />
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="name">Name</Label>
            <Input id="name" defaultValue={identity.name} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="handle">Handle</Label>
            <Input id="handle" defaultValue={identity.handle} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="type">Type</Label>
            <Input id="type" defaultValue={identity.type} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="domain">Domain</Label>
            <Input id="domain" defaultValue="AI Agents & Developer Tools" />
          </div>
          <div className="space-y-2 sm:col-span-2">
            <Label htmlFor="positioning">Positioning</Label>
            <Input id="positioning" defaultValue="Builder sharing lessons from the trenches of AI agent development" />
          </div>
        </div>
      </div>

      {/* Voice Parameters */}
      <div className="space-y-4">
        <div>
          <h3 className="text-lg font-semibold">Voice Parameters</h3>
          <p className="text-sm text-muted-foreground">
            Fine-tune how your brand voice sounds across all generated content.
          </p>
        </div>
        <Separator />
        <div className="space-y-6">
          {voiceSliders.map((s) => (
            <div key={s.key} className="space-y-2">
              <div className="flex items-center justify-between">
                <Label>{s.label}</Label>
                <span className="text-xs text-muted-foreground tabular-nums">
                  {voiceParams[s.key]}
                </span>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-xs text-muted-foreground w-16 shrink-0">{s.left}</span>
                <Slider
                  value={[voiceParams[s.key]]}
                  min={0}
                  max={100}
                  step={1}
                  onValueChange={([v]) =>
                    setVoiceParams({ ...voiceParams, [s.key]: v })
                  }
                  className="flex-1"
                />
                <span className="text-xs text-muted-foreground w-16 shrink-0 text-right">{s.right}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Content Pillars */}
      <div className="space-y-4">
        <div>
          <h3 className="text-lg font-semibold">Content Pillars</h3>
          <p className="text-sm text-muted-foreground">
            Topics and their weight in your content mix.
          </p>
        </div>
        <Separator />
        <div className="space-y-3">
          {pillars.map((pillar, i) => (
            <div key={i} className="flex items-center gap-3">
              <Input
                value={pillar.topic}
                onChange={(e) => updatePillar(i, 'topic', e.target.value)}
                placeholder="Topic name"
                className="flex-1"
              />
              <div className="flex items-center gap-2 shrink-0">
                <Input
                  type="number"
                  value={pillar.weight}
                  onChange={(e) => updatePillar(i, 'weight', Number(e.target.value))}
                  className="w-16 text-center"
                  min={0}
                  max={100}
                />
                <span className="text-xs text-muted-foreground">%</span>
              </div>
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 shrink-0"
                onClick={() => removePillar(i)}
              >
                <X className="h-4 w-4" strokeWidth={1.75} />
              </Button>
            </div>
          ))}
          <Button variant="outline" size="sm" onClick={addPillar}>
            <Plus className="mr-1 h-4 w-4" strokeWidth={1.75} />
            Add pillar
          </Button>
        </div>
      </div>

      {/* Rules */}
      <div className="space-y-4">
        <div>
          <h3 className="text-lg font-semibold">Rules</h3>
          <p className="text-sm text-muted-foreground">
            Prohibited topics, words, or guidelines the AI must follow.
          </p>
        </div>
        <Separator />
        <Textarea
          value={rules}
          onChange={(e) => setRules(e.target.value)}
          rows={4}
          placeholder="One rule per line..."
        />
      </div>

      {/* Anchor Creators */}
      <div className="space-y-4">
        <div>
          <h3 className="text-lg font-semibold">Anchor Phrases</h3>
          <p className="text-sm text-muted-foreground">
            Example phrases that capture your voice.
          </p>
        </div>
        <Separator />
        <div className="flex flex-wrap gap-2">
          {anchors.map((anchor, i) => (
            <span
              key={i}
              className="inline-flex items-center gap-1 rounded-full bg-muted px-3 py-1 text-sm"
            >
              {anchor}
              <button onClick={() => removeAnchor(i)} className="text-muted-foreground hover:text-foreground cursor-pointer">
                <X className="h-3 w-3" strokeWidth={1.75} />
              </button>
            </span>
          ))}
        </div>
        <div className="flex gap-2">
          <Input
            value={anchorInput}
            onChange={(e) => setAnchorInput(e.target.value)}
            placeholder="Add an anchor phrase..."
            onKeyDown={(e) => e.key === 'Enter' && addAnchor()}
          />
          <Button variant="outline" size="sm" onClick={addAnchor}>
            Add
          </Button>
        </div>
      </div>

      <div className="flex justify-end pt-4">
        <Button>Save changes</Button>
      </div>
    </div>
  );
}
