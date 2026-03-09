import { BookOpen } from 'lucide-react';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import type { Playbook } from '@/lib/types';

function formatDateShort(date: Date): string {
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

export function PlaybookCard({ playbook }: { playbook: Playbook }) {
  const completed = playbook.tasks.filter((t) => t.completed).length;
  const total = playbook.tasks.length;
  const progress = total > 0 ? Math.round((completed / total) * 100) : 0;

  const now = new Date();
  const totalDays = Math.ceil(
    (playbook.endDate.getTime() - playbook.startDate.getTime()) / (1000 * 60 * 60 * 24)
  );
  const elapsed = Math.ceil(
    (now.getTime() - playbook.startDate.getTime()) / (1000 * 60 * 60 * 24)
  );
  const currentDay = Math.max(1, Math.min(elapsed, totalDays));

  return (
    <div className="space-y-3">
      <h4 className="text-xs font-bold text-[#5c4b3a]/60 uppercase tracking-wider">
        Active Playbook
      </h4>
      <div className="rounded-xl border-2 border-dashed border-[#d4c9b8] bg-[#faf8f5] p-3 space-y-2.5">
        <div className="flex items-center gap-2">
          <BookOpen className="h-4 w-4 text-[#5c4b3a]/60" strokeWidth={1.75} />
          <span className="text-sm font-semibold flex-1 truncate text-[#5c4b3a]">{playbook.title}</span>
          <Badge variant="outline" className="text-[10px] px-1.5 py-0 shrink-0 border-dashed border-[#d4c9b8] text-[#5c4b3a]/70">
            Day {currentDay}/{totalDays}
          </Badge>
        </div>
        <Progress value={progress} className="h-2 sketchy-bar border border-[#d4c9b8] [&_[data-slot=progress-indicator]]:bg-[#7c9a6e]" />
        <div className="flex items-center justify-between text-[11px] text-[#5c4b3a]/60">
          <span>
            {completed}/{total} tasks done
          </span>
          <span>
            {formatDateShort(playbook.startDate)} - {formatDateShort(playbook.endDate)}
          </span>
        </div>
      </div>
    </div>
  );
}
