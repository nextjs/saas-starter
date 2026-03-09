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
    <svg width="155" height="90" viewBox="0 0 155 90" fill="none" className="mx-auto mb-3 sketch-float">
      {/* Scribble corner doodles */}
      <path d="M5,78 Q9,74 13,78" stroke="#d4c9b8" strokeWidth="0.8" fill="none" />
      <path d="M142,74 Q145,71 149,75" stroke="#d4c9b8" strokeWidth="0.8" fill="none" />
      {/* Binoculars - larger */}
      <circle cx="50" cy="40" r="22" fill="#f5f0e8" stroke="#5c4b3a" strokeWidth="2" strokeDasharray="4,3"/>
      <circle cx="100" cy="40" r="22" fill="#f5f0e8" stroke="#5c4b3a" strokeWidth="2" strokeDasharray="4,3"/>
      <circle cx="50" cy="40" r="13" fill="#6b8cae" opacity="0.25" stroke="#6b8cae" strokeWidth="1.5"/>
      <circle cx="100" cy="40" r="13" fill="#6b8cae" opacity="0.25" stroke="#6b8cae" strokeWidth="1.5"/>
      {/* Lens glare */}
      <ellipse cx="45" cy="35" rx="3" ry="5" fill="white" opacity="0.15" transform="rotate(-20 45 35)"/>
      <ellipse cx="95" cy="35" rx="3" ry="5" fill="white" opacity="0.15" transform="rotate(-20 95 35)"/>
      <rect x="68" y="32" width="14" height="16" rx="4" fill="#d4c9b8" stroke="#5c4b3a" strokeWidth="1.5"/>
      {/* Speech bubbles - more detail */}
      <ellipse cx="18" cy="15" rx="14" ry="10" fill="#f2d98b" stroke="#e07a5f" strokeWidth="1" strokeDasharray="3,2"/>
      <line x1="12" y1="12" x2="24" y2="12" stroke="#e07a5f" strokeWidth="1"/>
      <line x1="12" y1="17" x2="21" y2="17" stroke="#e07a5f" strokeWidth="1"/>
      <path d="M22,24 L18,20 L26,22" fill="#f2d98b" stroke="#e07a5f" strokeWidth="0.8"/>
      <ellipse cx="132" cy="12" rx="16" ry="10" fill="#f2d98b" stroke="#7c9a6e" strokeWidth="1" strokeDasharray="3,2"/>
      <line x1="124" y1="10" x2="140" y2="10" stroke="#7c9a6e" strokeWidth="1"/>
      <line x1="124" y1="15" x2="137" y2="15" stroke="#7c9a6e" strokeWidth="1"/>
      <path d="M128,22 L132,18 L124,20" fill="#f2d98b" stroke="#7c9a6e" strokeWidth="0.8"/>
      {/* Extra small bubble */}
      <ellipse cx="140" cy="42" rx="8" ry="6" fill="#f2d98b" opacity="0.4" stroke="#6b8cae" strokeWidth="0.8" strokeDasharray="2,1.5"/>
      <line x1="136" y1="41" x2="144" y2="41" stroke="#6b8cae" strokeWidth="0.6"/>
      {/* Sparkles */}
      <circle cx="35" cy="70" r="2.5" fill="#e07a5f" opacity="0.6"/>
      <circle cx="115" cy="68" r="2" fill="#7c9a6e" opacity="0.6"/>
      <circle cx="75" cy="8" r="1.5" fill="#f2d98b" opacity="0.5"/>
      {/* Tiny star */}
      <path d="M10,55 L11.5,51 L13,55 L9.5,53 L14.5,53 Z" fill="#6b8cae" opacity="0.4"/>
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
          <h1 className="text-lg font-bold text-[#5c4b3a] font-heading sketchy-underline">Monitor</h1>
          <p className="text-xs text-[#5c4b3a]/60">
            Surveillance radar -- tracking mentions, keywords, and competitors
          </p>
        </div>
      </div>

      {/* Pinboard layout */}
      <div className="cork-texture rounded-xl border-2 border-dashed border-[#d4c9b8] p-4 space-y-2 relative">
        <ActiveMonitors monitors={monitors} />

        <SketchyDivider />

        <AlertsSection alerts={alerts} />

        <SketchyDivider />

        <MonitorFeed items={feedItems} />

        <SketchyDivider />

        <ReplyTracker items={replyItems} />

        {/* Coffee stain ring decoration */}
        <svg width="60" height="60" viewBox="0 0 60 60" className="absolute -bottom-4 -right-4 opacity-[0.12] pointer-events-none" aria-hidden="true">
          <circle cx="30" cy="30" r="24" fill="none" stroke="#a0845c" strokeWidth="3"/>
          <circle cx="30" cy="30" r="20" fill="none" stroke="#a0845c" strokeWidth="1.5" opacity="0.5"/>
          <circle cx="30" cy="30" r="28" fill="none" stroke="#a0845c" strokeWidth="0.8" opacity="0.3"/>
        </svg>
      </div>
    </div>
  );
}
