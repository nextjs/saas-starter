'use client';

import { useState } from 'react';
import { ChevronDown, ChevronUp } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Switch } from '@/components/ui/switch';
import { Button } from '@/components/ui/button';
import { GoalsList } from '@/components/brain/goals-list';
import { ContentPillars } from '@/components/brain/content-pillars';
import { PlaybookCard } from '@/components/brain/playbook-card';
import type { Goal, Strategy, Playbook } from '@/lib/types';

function SketchyDivider() {
  return (
    <svg width="100%" height="12" viewBox="0 0 400 12" preserveAspectRatio="none" className="my-4 text-[#d4c9b8]">
      <path d="M0,6 C30,2 60,10 100,6 C140,2 170,10 200,6 C230,2 260,10 300,6 C330,2 360,10 400,6"
        stroke="currentColor" strokeWidth="2" fill="none" strokeDasharray="6,4" strokeLinecap="round"/>
    </svg>
  );
}

interface StrategyPanelProps {
  goals: Goal[];
  strategy: Strategy;
  playbook: Playbook | null;
}

function StrategyPanelContent({ goals, strategy, playbook }: StrategyPanelProps) {
  return (
    <div className="space-y-3 p-4">
      {/* Chapter: Goals */}
      <div className="sketch-card p-3">
        <GoalsList goals={goals} />
      </div>

      <SketchyDivider />

      {/* Chapter: Strategy */}
      <div className="sketch-card p-3 space-y-4">
        <h3 className="text-sm font-bold text-[#5c4b3a] font-heading sketchy-underline">Strategy</h3>
        <ContentPillars
          pillars={strategy.contentPillars}
          cadence={strategy.cadence}
        />

        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-[#5c4b3a]">Auto-Reply</p>
            <p className="text-[11px] text-[#5c4b3a]/60">
              {strategy.autoReplyEnabled ? 'Enabled' : 'Disabled'}
            </p>
          </div>
          <Switch
            size="sm"
            checked={strategy.autoReplyEnabled}
            onCheckedChange={() => {}}
          />
        </div>
      </div>

      {playbook && playbook.active && (
        <>
          <SketchyDivider />
          <div className="sketch-card p-3">
            <PlaybookCard playbook={playbook} />
          </div>
        </>
      )}
    </div>
  );
}

export function StrategyPanel({ goals, strategy, playbook }: StrategyPanelProps) {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <>
      {/* Desktop: fixed-width sidebar with lined paper */}
      <aside className="hidden md:block w-80 shrink-0 border-r-2 border-dashed border-[#d4c9b8] overflow-y-auto lined-paper bg-[#faf8f5]">
        <StrategyPanelContent goals={goals} strategy={strategy} playbook={playbook} />
      </aside>

      {/* Mobile: collapsible section */}
      <div className="md:hidden border-b-2 border-dashed border-[#d4c9b8]">
        <Button
          variant="ghost"
          className="w-full flex items-center justify-between rounded-none px-4 py-3 h-auto"
          onClick={() => setMobileOpen(!mobileOpen)}
        >
          <span className="text-sm font-bold text-[#5c4b3a] font-heading">Strategy Overview</span>
          {mobileOpen ? (
            <ChevronUp className="h-4 w-4 text-[#5c4b3a]/60" strokeWidth={1.75} />
          ) : (
            <ChevronDown className="h-4 w-4 text-[#5c4b3a]/60" strokeWidth={1.75} />
          )}
        </Button>
        <div
          className={cn(
            'overflow-hidden transition-all duration-200',
            mobileOpen ? 'max-h-[2000px]' : 'max-h-0'
          )}
        >
          <StrategyPanelContent goals={goals} strategy={strategy} playbook={playbook} />
        </div>
      </div>
    </>
  );
}
