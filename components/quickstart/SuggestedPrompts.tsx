import { Sparkle, RefreshCw } from 'lucide-react';
import { cn } from '@/lib/utils';

interface Prompt {
  text: string;
  color: string;
}

const INSPIRATIONS: Prompt[] = [
  { text: "Lo-fi beats for studying", color: "border-[#fbbf24]/20 bg-[#fbbf24]/5 text-[#fbbf24]" },
  { text: "Dark synthwave chase scene", color: "border-[#5850ec]/20 bg-[#5850ec]/5 text-[#5850ec]" },
  { text: "Epic cinematic orchestral", color: "border-[#06b6d4]/20 bg-[#06b6d4]/5 text-[#06b6d4]" },
  { text: "Minimalist ambient piano", color: "border-zinc-800 bg-[#050508] text-zinc-500" },
];

interface SuggestedPromptsProps {
  onSelect: (text: string) => void;
}

export function SuggestedPrompts({ onSelect }: SuggestedPromptsProps) {
  return (
    <div className="bg-[#050508]/50 border-2 border-zinc-900 rounded-[2rem] p-8">
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-3">
          <Sparkle className="size-5 text-[#fbbf24] fill-[#fbbf24]" />
          <h2 className="text-[10px] font-black tracking-[0.4em] text-zinc-600 uppercase italic">INSPIRATIONS</h2>
        </div>
        <button className="p-2 text-zinc-800 hover:text-white transition-colors">
          <RefreshCw className="size-4" />
        </button>
      </div>
      <div className="flex flex-wrap gap-3">
        {INSPIRATIONS.map((item) => (
          <button
            key={item.text}
            onClick={() => onSelect(item.text)}
            className={cn(
              "px-6 py-3 rounded-xl text-[10px] font-black tracking-widest uppercase border-2 transition-all active:scale-95 hover:brightness-125",
              item.color
            )}
          >
            {item.text}
          </button>
        ))}
      </div>
    </div>
  );
}
