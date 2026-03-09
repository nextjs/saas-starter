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
    <svg width="130" height="80" viewBox="0 0 130 80" fill="none" className="mx-auto mb-3">
      {/* Desk calendar */}
      <rect x="30" y="15" width="50" height="55" rx="4" fill="#f5f0e8" stroke="#d4c9b8" strokeWidth="2" strokeDasharray="4,3"/>
      <rect x="30" y="15" width="50" height="14" rx="4" fill="#e07a5f" stroke="#c4654a" strokeWidth="1.5"/>
      {/* Calendar rings */}
      <circle cx="42" cy="15" r="3" fill="none" stroke="#5c4b3a" strokeWidth="1.5"/>
      <circle cx="58" cy="15" r="3" fill="none" stroke="#5c4b3a" strokeWidth="1.5"/>
      <circle cx="68" cy="15" r="3" fill="none" stroke="#5c4b3a" strokeWidth="1.5"/>
      {/* Day grid dots */}
      <circle cx="40" cy="38" r="2" fill="#d4c9b8"/><circle cx="50" cy="38" r="2" fill="#d4c9b8"/>
      <circle cx="60" cy="38" r="2" fill="#d4c9b8"/><circle cx="70" cy="38" r="2" fill="#7c9a6e"/>
      <circle cx="40" cy="48" r="2" fill="#d4c9b8"/><circle cx="50" cy="48" r="2" fill="#e07a5f"/>
      <circle cx="60" cy="48" r="2" fill="#d4c9b8"/><circle cx="70" cy="48" r="2" fill="#d4c9b8"/>
      <circle cx="40" cy="58" r="2" fill="#6b8cae"/><circle cx="50" cy="58" r="2" fill="#d4c9b8"/>
      {/* Coffee cup */}
      <rect x="90" y="45" width="18" height="22" rx="3" fill="#f5f0e8" stroke="#5c4b3a" strokeWidth="1.5" strokeDasharray="3,2"/>
      <path d="M108,52 Q115,52 115,58 Q115,63 108,63" stroke="#5c4b3a" strokeWidth="1.5" fill="none"/>
      {/* Steam */}
      <path d="M95,42 Q96,38 97,42" stroke="#d4c9b8" strokeWidth="1" fill="none"/>
      <path d="M100,40 Q101,36 102,40" stroke="#d4c9b8" strokeWidth="1" fill="none"/>
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
        <h1 className="text-lg font-bold text-[#5c4b3a]">Calendar</h1>
        <div className="flex items-center rounded-xl border-2 border-dashed border-[#d4c9b8] bg-[#f5f0e8] p-1">
          {views.map((v) => (
            <button
              key={v}
              type="button"
              onClick={() => setView(v)}
              className={cn(
                'rounded-lg px-3 py-1.5 text-sm font-semibold transition-colors min-h-[36px] cursor-pointer',
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
