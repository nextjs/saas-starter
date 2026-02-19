import { Eye } from 'lucide-react';

export function ReviewTrack() {
  return (
    <div className="space-y-6">
      <h3 className="text-[11px] font-black uppercase tracking-[0.4em] text-zinc-500 flex items-center gap-2">
        <Eye className="size-4 text-gold fill-gold" />
        REVIEW TRACK
      </h3>
      <div className="p-6 rounded-3xl bg-zinc-900 border-2 border-zinc-800 shadow-xl">
        <p className="text-xs text-zinc-400 italic leading-relaxed">Check for consistency and quality across all sections.</p>
      </div>
    </div>
  );
}
