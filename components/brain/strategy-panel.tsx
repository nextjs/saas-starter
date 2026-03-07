'use client';

import { useState } from 'react';
import { ChevronDown, ChevronUp } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Switch } from '@/components/ui/switch';
import { Separator } from '@/components/ui/separator';
import { Button } from '@/components/ui/button';
import { GoalsList } from '@/components/brain/goals-list';
import { ContentPillars } from '@/components/brain/content-pillars';
import { PlaybookCard } from '@/components/brain/playbook-card';
import type { Goal, Strategy, Playbook } from '@/lib/types';

interface StrategyPanelProps {
  goals: Goal[];
  strategy: Strategy;
  playbook: Playbook | null;
}

function StrategyPanelContent({ goals, strategy, playbook }: StrategyPanelProps) {
  return (
    <div className="space-y-5 p-4">
      <GoalsList goals={goals} />
      <Separator />
      <div className="space-y-4">
        <h3 className="text-sm font-semibold">Strategy</h3>
        <ContentPillars
          pillars={strategy.contentPillars}
          cadence={strategy.cadence}
        />

        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs font-medium">Auto-Reply</p>
            <p className="text-[11px] text-muted-foreground">
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
          <Separator />
          <PlaybookCard playbook={playbook} />
        </>
      )}
    </div>
  );
}

export function StrategyPanel({ goals, strategy, playbook }: StrategyPanelProps) {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <>
      {/* Desktop: fixed-width sidebar */}
      <aside className="hidden md:block w-80 shrink-0 border-r overflow-y-auto">
        <StrategyPanelContent goals={goals} strategy={strategy} playbook={playbook} />
      </aside>

      {/* Mobile: collapsible section */}
      <div className="md:hidden border-b">
        <Button
          variant="ghost"
          className="w-full flex items-center justify-between rounded-none px-4 py-3 h-auto"
          onClick={() => setMobileOpen(!mobileOpen)}
        >
          <span className="text-sm font-semibold">Strategy Overview</span>
          {mobileOpen ? (
            <ChevronUp className="h-4 w-4 text-muted-foreground" strokeWidth={1.75} />
          ) : (
            <ChevronDown className="h-4 w-4 text-muted-foreground" strokeWidth={1.75} />
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
