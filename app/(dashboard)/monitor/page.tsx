'use client';

import { Radar } from 'lucide-react';
import { Separator } from '@/components/ui/separator';
import { ActiveMonitors } from '@/components/monitor/active-monitors';
import { AlertsSection } from '@/components/monitor/alerts-section';
import { MonitorFeed } from '@/components/monitor/monitor-feed';
import { ReplyTracker } from '@/components/monitor/reply-tracker';
import {
  getMonitors,
  getMonitorAlerts,
  getMonitorFeed,
  getReplyTrackerItems,
} from '@/lib/mock-data-helpers';

export default function MonitorPage() {
  const monitors = getMonitors();
  const alerts = getMonitorAlerts();
  const feedItems = getMonitorFeed();
  const replyItems = getReplyTrackerItems();

  return (
    <div className="mx-auto w-full max-w-3xl px-4 py-6 space-y-8">
      {/* Page header */}
      <div className="flex items-center gap-3">
        <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-muted">
          <Radar className="h-5 w-5 text-foreground" strokeWidth={1.75} />
        </div>
        <div>
          <h1 className="text-lg font-semibold">Monitor</h1>
          <p className="text-xs text-muted-foreground">
            Surveillance radar — tracking mentions, keywords, and competitors
          </p>
        </div>
      </div>

      {/* Section 1: Active Monitors */}
      <ActiveMonitors monitors={monitors} />

      <Separator />

      {/* Section 2: Alerts */}
      <AlertsSection alerts={alerts} />

      <Separator />

      {/* Section 3: Feed */}
      <MonitorFeed items={feedItems} />

      <Separator />

      {/* Section 4: Reply Tracker */}
      <ReplyTracker items={replyItems} />
    </div>
  );
}
