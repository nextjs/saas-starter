'use client';

import { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { cadenceTargets } from '@/lib/mock-data';

const platformLabels: Record<string, string> = {
  twitter: 'Twitter / X',
  linkedin: 'LinkedIn',
  reddit: 'Reddit',
};

const defaultSlots: Record<string, string[]> = {
  twitter: ['9:00 AM', '12:00 PM', '5:00 PM'],
  linkedin: ['9:00 AM', '10:00 AM'],
  reddit: ['12:00 PM'],
};

const timezones = [
  'America/New_York',
  'America/Chicago',
  'America/Denver',
  'America/Los_Angeles',
  'Europe/London',
  'Europe/Paris',
  'Asia/Tokyo',
  'Asia/Shanghai',
  'Australia/Sydney',
];

export function ScheduleTab() {
  const [cadence, setCadence] = useState(
    cadenceTargets.map((c) => ({ ...c }))
  );
  const [timezone, setTimezone] = useState('America/Los_Angeles');

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold">Posting Schedule</h3>
        <p className="text-sm text-muted-foreground">
          Set your posting frequency and preferred times per platform.
        </p>
      </div>
      <Separator />

      <div className="space-y-2">
        <Label>Timezone</Label>
        <Select value={timezone} onValueChange={setTimezone}>
          <SelectTrigger className="w-full max-w-xs">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {timezones.map((tz) => (
              <SelectItem key={tz} value={tz}>
                {tz.replace(/_/g, ' ')}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <Separator />

      <div className="space-y-6">
        {cadence.map((c, idx) => (
          <div key={c.platform} className="space-y-3">
            <h4 className="font-medium text-sm">{platformLabels[c.platform] || c.platform}</h4>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label>Posts per week</Label>
                <Input
                  type="number"
                  value={c.postsPerWeek}
                  onChange={(e) => {
                    const updated = [...cadence];
                    updated[idx] = { ...updated[idx], postsPerWeek: Number(e.target.value) };
                    setCadence(updated);
                  }}
                  className="w-24"
                  min={0}
                  max={21}
                />
              </div>
              <div className="space-y-2">
                <Label>Preferred time slots</Label>
                <div className="flex flex-wrap gap-1.5">
                  {(defaultSlots[c.platform] || []).map((slot) => (
                    <span
                      key={slot}
                      className="inline-flex items-center rounded-md bg-muted px-2 py-1 text-xs"
                    >
                      {slot}
                    </span>
                  ))}
                </div>
              </div>
            </div>
            {idx < cadence.length - 1 && <Separator />}
          </div>
        ))}
      </div>

      <div className="flex justify-end pt-4">
        <Button>Save changes</Button>
      </div>
    </div>
  );
}
