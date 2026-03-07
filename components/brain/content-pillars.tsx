import type { ContentPillar, CadenceTarget } from '@/lib/types';

function PillarBar({ pillar }: { pillar: ContentPillar }) {
  return (
    <div className="space-y-1">
      <div className="flex items-center justify-between text-xs">
        <div className="flex items-center gap-1.5">
          <span
            className="h-2 w-2 rounded-full shrink-0"
            style={{ backgroundColor: pillar.color }}
          />
          <span>{pillar.name}</span>
        </div>
        <span className="text-muted-foreground">{pillar.allocation}%</span>
      </div>
      <div className="h-1.5 w-full rounded-full bg-muted">
        <div
          className="h-full rounded-full transition-all"
          style={{ width: `${pillar.allocation}%`, backgroundColor: pillar.color }}
        />
      </div>
    </div>
  );
}

const platformIcons: Record<string, string> = {
  twitter: '𝕏',
  linkedin: 'in',
  reddit: 'r/',
  producthunt: 'PH',
  instagram: 'IG',
  tiktok: 'TT',
};

function CadenceItem({ target }: { target: CadenceTarget }) {
  return (
    <div className="flex items-center justify-between text-xs">
      <div className="flex items-center gap-2">
        <span className="w-5 text-center font-medium text-muted-foreground">
          {platformIcons[target.platform] ?? target.platform}
        </span>
        <span className="capitalize">{target.platform}</span>
      </div>
      <span className="text-muted-foreground">
        {target.currentWeek}/{target.postsPerWeek} this week
      </span>
    </div>
  );
}

export function ContentPillars({
  pillars,
  cadence,
}: {
  pillars: ContentPillar[];
  cadence: CadenceTarget[];
}) {
  return (
    <div className="space-y-4">
      <div className="space-y-2.5">
        <h4 className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
          Content Pillars
        </h4>
        {pillars.map((p) => (
          <PillarBar key={p.id} pillar={p} />
        ))}
      </div>

      <div className="space-y-2">
        <h4 className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
          Platform Cadence
        </h4>
        {cadence.map((c) => (
          <CadenceItem key={c.platform} target={c} />
        ))}
      </div>
    </div>
  );
}
