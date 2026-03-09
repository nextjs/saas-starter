'use client';

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

function SketchyDivider() {
  return (
    <svg width="100%" height="12" viewBox="0 0 400 12" preserveAspectRatio="none" className="my-6 text-[#d4c9b8]">
      <path d="M0,6 C30,2 60,10 100,6 C140,2 170,10 200,6 C230,2 260,10 300,6 C330,2 360,10 400,6"
        stroke="currentColor" strokeWidth="2" fill="none" strokeDasharray="6,4" strokeLinecap="round"/>
    </svg>
  );
}

function MonitorIllustration() {
  return (
    <svg width="130" height="75" viewBox="0 0 130 75" fill="none" className="mx-auto mb-3">
      {/* Binoculars */}
      <circle cx="45" cy="35" r="18" fill="#f5f0e8" stroke="#5c4b3a" strokeWidth="2" strokeDasharray="4,3"/>
      <circle cx="85" cy="35" r="18" fill="#f5f0e8" stroke="#5c4b3a" strokeWidth="2" strokeDasharray="4,3"/>
      <circle cx="45" cy="35" r="10" fill="#6b8cae" opacity="0.3" stroke="#6b8cae" strokeWidth="1.5"/>
      <circle cx="85" cy="35" r="10" fill="#6b8cae" opacity="0.3" stroke="#6b8cae" strokeWidth="1.5"/>
      <rect x="60" y="28" width="10" height="14" rx="3" fill="#d4c9b8" stroke="#5c4b3a" strokeWidth="1.5"/>
      {/* Speech bubbles */}
      <ellipse cx="20" cy="15" rx="12" ry="8" fill="#f2d98b" stroke="#e07a5f" strokeWidth="1" strokeDasharray="3,2"/>
      <line x1="16" y1="13" x2="24" y2="13" stroke="#e07a5f" strokeWidth="1"/>
      <line x1="16" y1="17" x2="22" y2="17" stroke="#e07a5f" strokeWidth="1"/>
      <ellipse cx="110" cy="12" rx="14" ry="9" fill="#f2d98b" stroke="#7c9a6e" strokeWidth="1" strokeDasharray="3,2"/>
      <line x1="104" y1="10" x2="116" y2="10" stroke="#7c9a6e" strokeWidth="1"/>
      <line x1="104" y1="14" x2="113" y2="14" stroke="#7c9a6e" strokeWidth="1"/>
      {/* Sparkle */}
      <circle cx="35" cy="60" r="2" fill="#e07a5f"/>
      <circle cx="100" cy="58" r="1.5" fill="#7c9a6e"/>
    </svg>
  );
}

export default function MonitorPage() {
  const monitors = getMonitors();
  const alerts = getMonitorAlerts();
  const feedItems = getMonitorFeed();
  const replyItems = getReplyTrackerItems();

  return (
    <div className="mx-auto w-full max-w-3xl px-4 py-6 space-y-2">
      <MonitorIllustration />

      {/* Page header */}
      <div className="flex items-center gap-3 mb-6">
        <div className="flex h-9 w-9 items-center justify-center rounded-xl border-2 border-dashed border-[#d4c9b8] bg-[#f5f0e8]">
          <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
            <circle cx="10" cy="10" r="7" stroke="#5c4b3a" strokeWidth="1.5" strokeDasharray="3,2"/>
            <circle cx="10" cy="10" r="3" fill="#e07a5f"/>
            <line x1="10" y1="3" x2="10" y2="1" stroke="#5c4b3a" strokeWidth="1.5" strokeLinecap="round"/>
          </svg>
        </div>
        <div>
          <h1 className="text-lg font-bold text-[#5c4b3a]">Monitor</h1>
          <p className="text-xs text-[#5c4b3a]/60">
            Surveillance radar -- tracking mentions, keywords, and competitors
          </p>
        </div>
      </div>

      {/* Pinboard layout */}
      <div className="cork-texture rounded-xl border-2 border-dashed border-[#d4c9b8] p-4 space-y-2">
        <ActiveMonitors monitors={monitors} />

        <SketchyDivider />

        <AlertsSection alerts={alerts} />

        <SketchyDivider />

        <MonitorFeed items={feedItems} />

        <SketchyDivider />

        <ReplyTracker items={replyItems} />
      </div>
    </div>
  );
}
