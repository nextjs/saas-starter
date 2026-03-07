'use client';

import {
  AlertTriangle,
  ShieldAlert,
  Info,
  Twitter,
  Linkedin,
  MessageSquare,
  Check,
  Pencil,
  Users,
  X,
  ArrowRight,
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import { AlertSeverity } from '@/lib/types';
import type { MonitorAlert } from '@/lib/types';

function PlatformIcon({ platform }: { platform: string }) {
  switch (platform) {
    case 'twitter':
      return <Twitter className="h-3.5 w-3.5" strokeWidth={1.75} />;
    case 'linkedin':
      return <Linkedin className="h-3.5 w-3.5" strokeWidth={1.75} />;
    case 'reddit':
      return <span className="text-xs font-bold leading-none">r/</span>;
    case 'producthunt':
      return <span className="text-xs font-bold leading-none">PH</span>;
    default:
      return null;
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
    icon: ShieldAlert,
    label: 'COMPLAINT DETECTED',
    border: 'border-l-red-500',
    bg: 'bg-red-500/5',
    badgeBg: 'bg-red-100 text-red-700 dark:bg-red-950 dark:text-red-400',
    iconColor: 'text-red-600 dark:text-red-400',
  },
  [AlertSeverity.Warning]: {
    icon: AlertTriangle,
    label: 'NEGATIVE MENTION',
    border: 'border-l-amber-500',
    bg: 'bg-amber-500/5',
    badgeBg: 'bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-400',
    iconColor: 'text-amber-600 dark:text-amber-400',
  },
  [AlertSeverity.Info]: {
    icon: Info,
    label: 'INFO',
    border: 'border-l-blue-500',
    bg: 'bg-blue-500/5',
    badgeBg: 'bg-blue-100 text-blue-700 dark:bg-blue-950 dark:text-blue-400',
    iconColor: 'text-blue-600 dark:text-blue-400',
  },
};

interface AlertsSectionProps {
  alerts: MonitorAlert[];
}

export function AlertsSection({ alerts }: AlertsSectionProps) {
  const urgentCount = alerts.filter(
    (a) => a.severity === AlertSeverity.Critical || a.severity === AlertSeverity.Warning
  ).length;

  return (
    <section className="space-y-3">
      <div className="flex items-center gap-2">
        <h2 className="text-sm font-semibold uppercase tracking-wider text-red-600 dark:text-red-400">
          ALERTS
        </h2>
        {urgentCount > 0 && (
          <Badge className="bg-red-600 text-white hover:bg-red-700 text-[11px] h-5 px-1.5">
            {urgentCount}
          </Badge>
        )}
      </div>

      <div className="space-y-3">
        {alerts.map((alert) => {
          const config = severityConfig[alert.severity];
          const SeverityIcon = config.icon;

          return (
            <Card
              key={alert.id}
              className={cn(
                'gap-0 border-l-4 py-0 overflow-hidden',
                config.border,
                config.bg
              )}
            >
              <CardContent className="p-4 space-y-3">
                {/* Severity + platform + time */}
                <div className="flex items-start justify-between gap-2">
                  <div className="flex flex-wrap items-center gap-2">
                    <Badge
                      variant="secondary"
                      className={cn('gap-1 border-0 font-semibold', config.badgeBg)}
                    >
                      <SeverityIcon className="h-3 w-3" strokeWidth={1.75} />
                      {config.label}
                    </Badge>
                    <div className="flex items-center gap-1 text-xs text-muted-foreground">
                      <PlatformIcon platform={alert.platform} />
                      <span>{formatTimeAgo(alert.createdAt)}</span>
                    </div>
                  </div>
                  {alert.pushedToFlow && (
                    <Badge
                      variant="outline"
                      className="text-[11px] gap-1 border-dashed"
                    >
                      <ArrowRight className="h-3 w-3" strokeWidth={1.75} />
                      In Flow
                    </Badge>
                  )}
                </div>

                {/* Title */}
                <h3 className="text-sm font-semibold leading-snug">
                  {alert.title}
                </h3>

                {/* Quoted content */}
                <div className="rounded-md bg-muted/60 p-3 border-l-2 border-muted-foreground/20">
                  <p className="text-sm leading-relaxed text-muted-foreground italic">
                    {alert.summary}
                  </p>
                </div>

                {/* Actions */}
                <div className="flex flex-wrap items-center gap-2 pt-1">
                  <Button size="sm" className="h-9 md:h-7 text-xs gap-1">
                    <Check className="h-3 w-3" strokeWidth={1.75} />
                    Reply
                  </Button>
                  <Button variant="outline" size="sm" className="h-9 md:h-7 text-xs gap-1">
                    <Pencil className="h-3 w-3" strokeWidth={1.75} />
                    Chat
                  </Button>
                  <Button variant="outline" size="sm" className="h-9 md:h-7 text-xs gap-1">
                    <Users className="h-3 w-3" strokeWidth={1.75} />
                    Escalate
                  </Button>
                  <Button variant="ghost" size="sm" className="h-9 md:h-7 text-xs gap-1 text-muted-foreground">
                    <X className="h-3 w-3" strokeWidth={1.75} />
                    Skip
                  </Button>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </section>
  );
}
