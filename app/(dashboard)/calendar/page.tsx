'use client';

import { useState, useEffect } from 'react';
import { cn } from '@/lib/utils';
import { WeekView } from '@/components/calendar/week-view';
import { DayView } from '@/components/calendar/day-view';
import { TodayTimeline } from '@/components/calendar/today-timeline';
import { CadenceOverview } from '@/components/calendar/cadence-overview';
import { PlaybookTimeline } from '@/components/calendar/playbook-timeline';
import { getCalendarSlots, getStrategy, getPlaybook } from '@/lib/mock-data-helpers';
import { useIsMobile } from '@/lib/hooks/use-is-mobile';

function CalendarIllustration() {
  return (
    <svg width="160" height="95" viewBox="0 0 160 95" fill="none" className="mx-auto mb-3 sketch-sway">
      {/* Scribble doodles */}
      <path d="M8,82 Q12,78 16,82" stroke="#d4c9b8" strokeWidth="0.8" fill="none" />
      <path d="M148,78 Q151,75 155,79" stroke="#d4c9b8" strokeWidth="0.8" fill="none" />
      {/* Desk calendar - larger */}
      <rect x="30" y="15" width="62" height="65" rx="4" fill="#f5f0e8" stroke="#d4c9b8" strokeWidth="2" strokeDasharray="4,3"/>
      <rect x="30" y="15" width="62" height="16" rx="4" fill="#e07a5f" stroke="#c4654a" strokeWidth="1.5"/>
      {/* Calendar rings */}
      <circle cx="42" cy="15" r="3.5" fill="none" stroke="#5c4b3a" strokeWidth="1.5"/>
      <circle cx="55" cy="15" r="3.5" fill="none" stroke="#5c4b3a" strokeWidth="1.5"/>
      <circle cx="68" cy="15" r="3.5" fill="none" stroke="#5c4b3a" strokeWidth="1.5"/>
      <circle cx="80" cy="15" r="3.5" fill="none" stroke="#5c4b3a" strokeWidth="1.5"/>
      {/* Day grid dots - more */}
      <circle cx="42" cy="40" r="2.5" fill="#d4c9b8"/><circle cx="55" cy="40" r="2.5" fill="#d4c9b8"/>
      <circle cx="68" cy="40" r="2.5" fill="#d4c9b8"/><circle cx="80" cy="40" r="2.5" fill="#7c9a6e"/>
      <circle cx="42" cy="52" r="2.5" fill="#d4c9b8"/><circle cx="55" cy="52" r="2.5" fill="#e07a5f"/>
      <circle cx="68" cy="52" r="2.5" fill="#d4c9b8"/><circle cx="80" cy="52" r="2.5" fill="#d4c9b8"/>
      <circle cx="42" cy="64" r="2.5" fill="#6b8cae"/><circle cx="55" cy="64" r="2.5" fill="#d4c9b8"/>
      <circle cx="68" cy="64" r="2.5" fill="#f2d98b"/><circle cx="80" cy="64" r="2.5" fill="#d4c9b8"/>
      {/* Circled date */}
      <circle cx="55" cy="52" r="6" fill="none" stroke="#e07a5f" strokeWidth="1.2" strokeDasharray="2,1.5"/>
      {/* Coffee cup - with stain ring */}
      <rect x="105" y="45" width="22" height="28" rx="4" fill="#f5f0e8" stroke="#5c4b3a" strokeWidth="1.5" strokeDasharray="3,2"/>
      <path d="M127,54 Q136,54 136,62 Q136,68 127,68" stroke="#5c4b3a" strokeWidth="1.5" fill="none"/>
      {/* Coffee stain ring */}
      <circle cx="116" cy="82" r="12" fill="none" stroke="rgba(180,140,100,0.1)" strokeWidth="2"/>
      <circle cx="116" cy="82" r="10" fill="none" stroke="rgba(180,140,100,0.06)" strokeWidth="1.5"/>
      {/* Steam - animated feel */}
      <path d="M110,42 Q111,36 112,42" stroke="#d4c9b8" strokeWidth="1" fill="none"/>
      <path d="M116,39 Q117,33 118,39" stroke="#d4c9b8" strokeWidth="1" fill="none"/>
      <path d="M122,41 Q123,35 124,41" stroke="#d4c9b8" strokeWidth="1" fill="none"/>
      {/* Pen next to calendar */}
      <line x1="15" y1="30" x2="25" y2="75" stroke="#5c4b3a" strokeWidth="1.5" strokeLinecap="round"/>
      <path d="M25,75 L26,80 L24,80 Z" fill="#5c4b3a"/>
      <line x1="14.5" y1="28" x2="16" y2="33" stroke="#e07a5f" strokeWidth="2.5" strokeLinecap="round"/>
      {/* Sparkles */}
      <circle cx="140" cy="25" r="2" fill="#7c9a6e" opacity="0.5"/>
      <circle cx="8" cy="50" r="1.5" fill="#f2d98b" opacity="0.5"/>
    </svg>
  );
}

type CalendarView = 'day' | 'week' | 'month';

export default function CalendarPage() {
  const isMobile = useIsMobile();
  const [view, setView] = useState<CalendarView>('week');
  const [didInit, setDidInit] = useState(false);
  const slots = getCalendarSlots();
  const strategy = getStrategy();
  const playbook = getPlaybook();

  useEffect(() => {
    if (!didInit) {
      setView(isMobile ? 'day' : 'week');
      setDidInit(true);
    }
  }, [isMobile, didInit]);

  const views: CalendarView[] = isMobile ? ['day', 'week'] : ['day', 'week', 'month'];

  return (
    <div className="mx-auto w-full max-w-6xl space-y-8 px-4 py-6">
      <CalendarIllustration />

      {/* Header with view toggle */}
      <div className="flex items-center justify-between">
        <h1 className="text-lg font-bold text-[#5c4b3a] font-heading sketchy-underline">Calendar</h1>
        <div className="flex items-center sketch-border border-2 border-dashed border-[#d4c9b8] bg-[#f5f0e8] p-1">
          {views.map((v) => (
            <button
              key={v}
              type="button"
              onClick={() => setView(v)}
              className={cn(
                'sketch-btn px-3 py-1.5 text-sm font-semibold transition-colors min-h-[36px] cursor-pointer',
                view === v
                  ? 'bg-[#e07a5f] text-white shadow-sm'
                  : 'text-[#5c4b3a]/60 hover:text-[#5c4b3a]'
              )}
            >
              {v.charAt(0).toUpperCase() + v.slice(1)}
            </button>
          ))}
        </div>
      </div>

      {/* Calendar grid with dotted background */}
      <div className="dotted-grid rounded-xl p-4">
        {view === 'day' ? (
          <DayView slots={slots} />
        ) : view === 'week' ? (
          <WeekView slots={slots} />
        ) : (
          <div className="flex items-center justify-center py-12 text-sm text-[#5c4b3a]/50">
            Month view coming soon
          </div>
        )}
      </div>

      <TodayTimeline slots={slots} />
      <CadenceOverview cadence={strategy.cadence} />
      {playbook.active && <PlaybookTimeline playbook={playbook} />}
    </div>
  );
}
