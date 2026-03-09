'use client';

import {
  AlertTriangle, ShieldAlert, Info, Twitter, Linkedin,
  Check, Pencil, Users, X, ArrowRight,
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { AlertSeverity } from '@/lib/types';
import type { MonitorAlert } from '@/lib/types';

function PlatformIcon({ platform }: { platform: string }) {
  switch (platform) {
    case 'twitter': return <Twitter className="h-3.5 w-3.5" strokeWidth={1.75} />;
    case 'linkedin': return <Linkedin className="h-3.5 w-3.5" strokeWidth={1.75} />;
    case 'reddit': return <span className="text-xs font-bold leading-none">r/</span>;
    case 'producthunt': return <span className="text-xs font-bold leading-none">PH</span>;
    default: return null;
  }
}

function formatTimeAgo(date: Date): string {
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMin = Math.round(diffMs / 60000);
  if (diffMin < 60) return `${diffMin}m ago`;
  const diffHr = Math.round(diffMin / 60);
  if (diffHr < 24) return `${diffHr}h ago`;
  return `${Math.round(diffHr / 24)}d ago`;
}

const severityConfig = {
  [AlertSeverity.Critical]: {
    icon: ShieldAlert, label: 'COMPLAINT DETECTED',
    border: 'border-[#e07a5f]', bg: 'bg-[#e07a5f]/5',
    badgeBg: 'bg-[#e07a5f]/15 text-[#e07a5f]', iconColor: 'text-[#e07a5f]',
  },
  [AlertSeverity.Warning]: {
    icon: AlertTriangle, label: 'NEGATIVE MENTION',
    border: 'border-[#f2d98b]', bg: 'bg-[#f2d98b]/10',
    badgeBg: 'bg-[#f2d98b]/20 text-[#5c4b3a]', iconColor: 'text-[#f2d98b]',
  },
  [AlertSeverity.Info]: {
    icon: Info, label: 'INFO',
    border: 'border-[#6b8cae]', bg: 'bg-[#6b8cae]/5',
    badgeBg: 'bg-[#6b8cae]/15 text-[#6b8cae]', iconColor: 'text-[#6b8cae]',
  },
};

interface AlertsSectionProps { alerts: MonitorAlert[]; }

export function AlertsSection({ alerts }: AlertsSectionProps) {
  const urgentCount = alerts.filter((a) => a.severity === AlertSeverity.Critical || a.severity === AlertSeverity.Warning).length;

  return (
    <section className="space-y-3">
      <div className="flex items-center gap-2">
        <h2 className="text-sm font-bold uppercase tracking-wider text-[#e07a5f] font-heading">ALERTS</h2>
        {urgentCount > 0 && (
          <Badge className="bg-[#e07a5f] text-white hover:bg-[#c4654a] text-[11px] h-5 px-1.5">{urgentCount}</Badge>
        )}
      </div>

      <div className="space-y-3">
        {alerts.map((alert) => {
          const config = severityConfig[alert.severity];
          const SeverityIcon = config.icon;
          return (
            <div key={alert.id} className={cn('relative sketch-card sketch-shadow p-4 space-y-3 border-l-4', config.border, config.bg)}>
              <div className="absolute -top-2 right-4 w-3 h-3 rounded-full bg-[#e07a5f] border-2 border-[#c4654a] shadow-sm z-10" />
              <div className="flex items-start justify-between gap-2">
                <div className="flex flex-wrap items-center gap-2">
                  <Badge variant="secondary" className={cn('gap-1 border-0 font-bold', config.badgeBg)}>
                    <SeverityIcon className="h-3 w-3" strokeWidth={1.75} />{config.label}
                  </Badge>
                  <div className="flex items-center gap-1 text-xs text-[#5c4b3a]/60">
                    <PlatformIcon platform={alert.platform} />
                    <span>{formatTimeAgo(alert.createdAt)}</span>
                  </div>
                </div>
                {alert.pushedToFlow && (
                  <Badge variant="outline" className="text-[11px] gap-1 border-dashed border-[#d4c9b8] text-[#5c4b3a]/60">
                    <ArrowRight className="h-3 w-3" strokeWidth={1.75} />In Flow
                  </Badge>
                )}
              </div>
              <h3 className="text-sm font-bold leading-snug text-[#5c4b3a]">{alert.title}</h3>
              <div className="rounded-lg bg-[#faf8f5] p-3 border-l-2 border-dashed border-[#d4c9b8]">
                <p className="text-sm leading-relaxed text-[#5c4b3a]/70 italic">{alert.summary}</p>
              </div>
              <div className="flex flex-wrap items-center gap-2 pt-1">
                <Button size="sm" className="h-9 md:h-7 text-xs gap-1 bg-[#e07a5f] hover:bg-[#c4654a] text-white sketch-btn">
                  <Check className="h-3 w-3" strokeWidth={1.75} />Reply
                </Button>
                <Button variant="outline" size="sm" className="h-9 md:h-7 text-xs gap-1 border-dashed border-[#d4c9b8] text-[#5c4b3a] sketch-btn">
                  <Pencil className="h-3 w-3" strokeWidth={1.75} />Chat
                </Button>
                <Button variant="outline" size="sm" className="h-9 md:h-7 text-xs gap-1 border-dashed border-[#d4c9b8] text-[#5c4b3a] sketch-btn">
                  <Users className="h-3 w-3" strokeWidth={1.75} />Escalate
                </Button>
                <Button variant="ghost" size="sm" className="h-9 md:h-7 text-xs gap-1 text-[#5c4b3a]/50 sketch-btn">
                  <X className="h-3 w-3" strokeWidth={1.75} />Skip
                </Button>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}
