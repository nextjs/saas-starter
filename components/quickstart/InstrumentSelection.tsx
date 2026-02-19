import { Layers, ChevronRight } from 'lucide-react';
import { SelectionProps } from './types';

export function InstrumentSelection({ selectedTags, onClick }: SelectionProps) {
  return (
    <button
      onClick={onClick}
      className="bg-[#050508] border-2 border-zinc-900 rounded-2xl p-6 flex items-center justify-between transition-all hover:bg-zinc-900 active:scale-[0.98] group"
    >
      <div className="flex items-start gap-4">
        <div className="p-3 bg-zinc-900 border border-zinc-800 rounded-xl text-zinc-500 group-hover:text-white transition-colors">
          <Layers className="size-5" />
        </div>
        <div className="flex flex-col items-start gap-1 overflow-hidden">
          <span className="text-[9px] font-black tracking-widest text-zinc-600 uppercase">INSTRUMENTS</span>
          <div className="text-[11px] font-black text-zinc-400 truncate w-full uppercase text-left tracking-wider">
            {selectedTags.length > 0 ? selectedTags.join(', ') : 'SELECT...'}
          </div>
        </div>
      </div>
      <ChevronRight className="size-4 text-zinc-900 group-hover:text-zinc-600 transition-colors" />
    </button>
  );
}
