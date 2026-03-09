import type { ContentPillar, CadenceTarget } from '@/lib/types';

function PillarBar({ pillar }: { pillar: ContentPillar }) {
  return (
    <div className="space-y-1">
      <div className="flex items-center justify-between text-xs">
        <div className="flex items-center gap-1.5">
          <span
            className="h-2.5 w-2.5 rounded-full shrink-0 border border-[#d4c9b8]"
            style={{ backgroundColor: pillar.color }}
          />
          <span className="font-medium text-[#5c4b3a]">{pillar.name}</span>
        </div>
        <span className="text-[#5c4b3a]/60">{pillar.allocation}%</span>
      </div>
      <div className="h-2 w-full rounded-full bg-[#ebe5d9] border border-[#d4c9b8] sketchy-bar">
        <div
          className="h-full rounded-full transition-all sketchy-bar"
          style={{ width: `${pillar.allocation}%`, backgroundColor: pillar.color }}
        />
      </div>
    </div>
  );
}

const platformIcons: Record<string, string> = {
  twitter: '\ud835\udd4f',
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
        <span className="w-5 text-center font-bold text-[#5c4b3a]/60">
          {platformIcons[target.platform] ?? target.platform}
        </span>
        <span className="capitalize text-[#5c4b3a]">{target.platform}</span>
      </div>
      <span className="text-[#5c4b3a]/60">
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
        <h4 className="text-xs font-bold text-[#5c4b3a]/60 uppercase tracking-wider">
          Content Pillars
        </h4>
        {pillars.map((p) => (
          <PillarBar key={p.id} pillar={p} />
        ))}
      </div>

      <div className="space-y-2">
        <h4 className="text-xs font-bold text-[#5c4b3a]/60 uppercase tracking-wider">
          Platform Cadence
        </h4>
        {cadence.map((c) => (
          <CadenceItem key={c.platform} target={c} />
        ))}
      </div>
    </div>
  );
}
