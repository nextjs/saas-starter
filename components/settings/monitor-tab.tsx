'use client';

import { useState } from 'react';
import { Plus, X } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { Slider } from '@/components/ui/slider';
import { Switch } from '@/components/ui/switch';
import { Button } from '@/components/ui/button';
import { monitors } from '@/lib/mock-data';

function TagInput({
  label,
  description,
  values,
  onChange,
  placeholder,
}: {
  label: string;
  description: string;
  values: string[];
  onChange: (values: string[]) => void;
  placeholder: string;
}) {
  const [input, setInput] = useState('');

  function add() {
    const trimmed = input.trim();
    if (trimmed && !values.includes(trimmed)) {
      onChange([...values, trimmed]);
      setInput('');
    }
  }

  function remove(index: number) {
    onChange(values.filter((_, i) => i !== index));
  }

  return (
    <div className="space-y-2">
      <div>
        <Label>{label}</Label>
        <p className="text-xs text-muted-foreground">{description}</p>
      </div>
      <div className="flex flex-wrap gap-1.5">
        {values.map((v, i) => (
          <span
            key={i}
            className="inline-flex items-center gap-1 rounded-full bg-muted px-2.5 py-1 text-xs"
          >
            {v}
            <button onClick={() => remove(i)} className="text-muted-foreground hover:text-foreground cursor-pointer">
              <X className="h-3 w-3" strokeWidth={1.75} />
            </button>
          </span>
        ))}
      </div>
      <div className="flex gap-2">
        <Input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder={placeholder}
          onKeyDown={(e) => e.key === 'Enter' && add()}
          className="max-w-xs"
        />
        <Button variant="outline" size="sm" onClick={add}>
          <Plus className="mr-1 h-3 w-3" strokeWidth={1.75} />
          Add
        </Button>
      </div>
    </div>
  );
}

const defaultKeywords = monitors.flatMap((m) => m.keywords).filter((v, i, a) => a.indexOf(v) === i);
const defaultSubreddits = monitors.flatMap((m) => m.subreddits || []).filter((v, i, a) => a.indexOf(v) === i);
const defaultCompetitors = monitors.flatMap((m) => m.accounts || []).filter((v, i, a) => a.indexOf(v) === i);

export function MonitorTab() {
  const [keywords, setKeywords] = useState(defaultKeywords);
  const [subreddits, setSubreddits] = useState(defaultSubreddits);
  const [competitors, setCompetitors] = useState(defaultCompetitors);
  const [frequency, setFrequency] = useState(30);
  const [notifyAlerts, setNotifyAlerts] = useState(true);
  const [notifyMatches, setNotifyMatches] = useState(true);
  const [notifyMentions, setNotifyMentions] = useState(false);

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold">Monitor Settings</h3>
        <p className="text-sm text-muted-foreground">
          Configure what to monitor and how often to check.
        </p>
      </div>
      <Separator />

      <TagInput
        label="Keywords"
        description="Track these keywords across all monitored platforms."
        values={keywords}
        onChange={setKeywords}
        placeholder="Add a keyword..."
      />

      <Separator />

      <TagInput
        label="Subreddits"
        description="Reddit communities to watch."
        values={subreddits}
        onChange={setSubreddits}
        placeholder="e.g. r/SaaS"
      />

      <Separator />

      <TagInput
        label="Competitor Accounts"
        description="Track activity from these accounts."
        values={competitors}
        onChange={setCompetitors}
        placeholder="e.g. @competitor"
      />

      <Separator />

      {/* Check frequency */}
      <div className="space-y-3">
        <div>
          <Label>Check Frequency</Label>
          <p className="text-xs text-muted-foreground">
            How often to scan for new matches (in minutes).
          </p>
        </div>
        <div className="flex items-center gap-3 max-w-sm">
          <span className="text-xs text-muted-foreground w-10 shrink-0">15m</span>
          <Slider
            value={[frequency]}
            min={15}
            max={120}
            step={15}
            onValueChange={([v]) => setFrequency(v)}
            className="flex-1"
          />
          <span className="text-xs text-muted-foreground w-10 shrink-0 text-right">120m</span>
        </div>
        <p className="text-xs text-muted-foreground">
          Currently: every {frequency} minutes
        </p>
      </div>

      <Separator />

      {/* Notification preferences per monitor type */}
      <div className="space-y-3">
        <div>
          <Label>Notification Preferences</Label>
          <p className="text-xs text-muted-foreground">
            Choose which monitor events trigger notifications.
          </p>
        </div>
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-sm">Alerts (critical/warning)</span>
            <Switch checked={notifyAlerts} onCheckedChange={setNotifyAlerts} />
          </div>
          <div className="flex items-center justify-between">
            <span className="text-sm">Keyword matches</span>
            <Switch checked={notifyMatches} onCheckedChange={setNotifyMatches} />
          </div>
          <div className="flex items-center justify-between">
            <span className="text-sm">Brand mentions</span>
            <Switch checked={notifyMentions} onCheckedChange={setNotifyMentions} />
          </div>
        </div>
      </div>

      <div className="flex justify-end pt-4">
        <Button>Save changes</Button>
      </div>
    </div>
  );
}
