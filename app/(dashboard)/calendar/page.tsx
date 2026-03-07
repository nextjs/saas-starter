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

type CalendarView = 'day' | 'week' | 'month';

export default function CalendarPage() {
  const isMobile = useIsMobile();
  const [view, setView] = useState<CalendarView>('week');
  const [didInit, setDidInit] = useState(false);
  const slots = getCalendarSlots();
  const strategy = getStrategy();
  const playbook = getPlaybook();

  // Default to day view on mobile
  useEffect(() => {
    if (!didInit) {
      setView(isMobile ? 'day' : 'week');
      setDidInit(true);
    }
  }, [isMobile, didInit]);

  const views: CalendarView[] = isMobile ? ['day', 'week'] : ['day', 'week', 'month'];

  return (
    <div className="mx-auto w-full max-w-6xl space-y-8 px-4 py-6">
      {/* Header with view toggle */}
      <div className="flex items-center justify-between">
        <h1 className="text-lg font-semibold">Calendar</h1>
        <div className="flex items-center rounded-lg bg-muted p-1">
          {views.map((v) => (
            <button
              key={v}
              type="button"
              onClick={() => setView(v)}
              className={cn(
                'rounded-md px-3 py-1.5 text-sm font-medium transition-colors min-h-[36px] cursor-pointer',
                view === v
                  ? 'bg-background text-foreground shadow-sm'
                  : 'text-muted-foreground hover:text-foreground'
              )}
            >
              {v.charAt(0).toUpperCase() + v.slice(1)}
            </button>
          ))}
        </div>
      </div>

      {/* Calendar grid */}
      {view === 'day' ? (
        <DayView slots={slots} />
      ) : view === 'week' ? (
        <WeekView slots={slots} />
      ) : (
        <div className="flex items-center justify-center py-12 text-sm text-muted-foreground">
          Month view coming soon
        </div>
      )}

      {/* Today's Timeline */}
      <TodayTimeline slots={slots} />

      {/* Cadence Overview */}
      <CadenceOverview cadence={strategy.cadence} />

      {/* Playbook Timeline */}
      {playbook.active && <PlaybookTimeline playbook={playbook} />}
    </div>
  );
}
