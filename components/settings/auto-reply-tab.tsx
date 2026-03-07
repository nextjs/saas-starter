'use client';

import { useState } from 'react';
import { Badge } from '@/components/ui/badge';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { Switch } from '@/components/ui/switch';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { autoReplyRules } from '@/lib/mock-data';

const platformLabels: Record<string, string> = {
  twitter: 'Twitter / X',
  linkedin: 'LinkedIn',
  reddit: 'Reddit',
};

const recentAutoReplies = [
  { platform: 'twitter', to: '@dev_sarah', content: 'Thanks! Glad you found the thread useful.', time: '2h ago' },
  { platform: 'twitter', to: '@ai_builder', content: 'Appreciate the kind words! More agent content coming.', time: '4h ago' },
  { platform: 'twitter', to: '@indie_maker', content: 'Thanks for sharing!', time: '6h ago' },
  { platform: 'twitter', to: '@startup_ops', content: 'Glad it resonated! Working on a follow-up thread.', time: '1d ago' },
  { platform: 'linkedin', to: 'Jordan M.', content: 'Thank you for the thoughtful comment, Jordan.', time: '2d ago' },
];

export function AutoReplyTab() {
  const [rules, setRules] = useState(
    autoReplyRules.map((r) => ({ ...r }))
  );
  const [escalation, setEscalation] = useState(
    'Escalate if: mentions pricing, complaints, requests for demo, negative sentiment'
  );

  function togglePlatform(id: string) {
    setRules(
      rules.map((r) =>
        r.id === id ? { ...r, enabled: !r.enabled } : r
      )
    );
  }

  function updateTone(id: string, tone: 'friendly' | 'professional' | 'casual') {
    setRules(
      rules.map((r) => (r.id === id ? { ...r, tone } : r))
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold">Auto-Reply Settings</h3>
        <p className="text-sm text-muted-foreground">
          Configure automatic replies per platform. AI responds to common interactions.
        </p>
      </div>
      <Separator />

      <div className="space-y-6">
        {rules.map((rule) => (
          <div key={rule.id} className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <h4 className="font-medium text-sm">
                  {platformLabels[rule.platform] || rule.platform}
                </h4>
                <Badge variant={rule.enabled ? 'default' : 'secondary'}>
                  {rule.enabled ? 'Active' : 'Off'}
                </Badge>
              </div>
              <Switch
                checked={rule.enabled}
                onCheckedChange={() => togglePlatform(rule.id)}
              />
            </div>
            <div className="flex items-center gap-4">
              <div className="space-y-1">
                <Label className="text-xs">Reply style</Label>
                <Select
                  value={rule.tone}
                  onValueChange={(v) =>
                    updateTone(rule.id, v as 'friendly' | 'professional' | 'casual')
                  }
                >
                  <SelectTrigger className="w-36">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="friendly">Friendly</SelectItem>
                    <SelectItem value="professional">Professional</SelectItem>
                    <SelectItem value="casual">Casual</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1">
                <Label className="text-xs">Max per day</Label>
                <span className="block text-sm">{rule.maxPerDay}</span>
              </div>
            </div>
            <Separator />
          </div>
        ))}
      </div>

      {/* Escalation */}
      <div className="space-y-3">
        <div>
          <h4 className="font-medium text-sm">Escalation Conditions</h4>
          <p className="text-xs text-muted-foreground">
            When these conditions are met, the AI will flag the reply for manual review instead.
          </p>
        </div>
        <Textarea
          value={escalation}
          onChange={(e) => setEscalation(e.target.value)}
          rows={3}
        />
      </div>

      <Separator />

      {/* Recent auto-replies */}
      <div className="space-y-3">
        <h4 className="font-medium text-sm">Recent Auto-Replies</h4>
        <div className="space-y-2">
          {recentAutoReplies.map((reply, i) => (
            <div
              key={i}
              className="flex items-start gap-3 rounded-md border p-3 text-sm"
            >
              <Badge variant="outline" className="shrink-0 text-xs">
                {reply.platform}
              </Badge>
              <div className="flex-1 min-w-0">
                <p className="text-xs text-muted-foreground">
                  to {reply.to} &middot; {reply.time}
                </p>
                <p className="mt-0.5 text-sm">{reply.content}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="flex justify-end pt-4">
        <Button>Save changes</Button>
      </div>
    </div>
  );
}
