'use client';

import { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface SelectionModalProps {
  title: string;
  isOpen: boolean;
  onClose: () => void;
  categories: Record<string, string[]>;
  selectedTags: string[];
  onConfirm: (tags: string[]) => void;
}

export function SelectionModal({
  title,
  isOpen,
  onClose,
  categories,
  selectedTags: initialSelectedTags,
  onConfirm,
}: SelectionModalProps) {
  const [currentSelected, setCurrentSelected] = useState<string[]>(initialSelectedTags);

  useEffect(() => {
    if (isOpen) {
      setCurrentSelected(initialSelectedTags);
    }
  }, [isOpen, initialSelectedTags]);

  if (!isOpen) return null;

  const toggleTag = (tag: string) => {
    setCurrentSelected((prev) =>
      prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]
    );
  };

  const clearAll = () => setCurrentSelected([]);

  return (
    <div className="fixed inset-0 z-50 flex flex-col bg-[#0a0a0f] animate-in fade-in duration-300">
      {/* Header */}
      <div className="flex items-center justify-between p-6 border-b border-zinc-900/50">
        <h2 className="text-sm font-black tracking-[0.3em] text-white uppercase italic">{title}</h2>
        <button onClick={onClose} className="p-2 text-zinc-500 hover:text-white transition-colors">
          <X className="size-6" />
        </button>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-6 space-y-12 pb-64">
        {Object.entries(categories).map(([category, tags]) => (
          <div key={category} className="space-y-6">
            <div className="flex items-center gap-4">
              <h3 className="text-[10px] font-black tracking-[0.2em] text-[#06b6d4] uppercase">
                {category}
              </h3>
              <div className="h-px flex-1 bg-zinc-900" />
            </div>
            <div className="flex flex-wrap gap-3">
              {tags.map((tag) => (
                <button
                  key={tag}
                  onClick={() => toggleTag(tag)}
                  className={cn(
                    "px-5 py-3 rounded-xl text-[10px] font-black tracking-widest transition-all uppercase border-2",
                    currentSelected.includes(tag)
                      ? "bg-[#5850ec] border-[#5850ec] text-white"
                      : "bg-[#161620] text-zinc-400 border-zinc-900 hover:border-zinc-800"
                  )}
                >
                  {tag}
                </button>
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* Footer */}
      <div className="fixed bottom-0 left-0 right-0 p-6 bg-[#0a0a0f] border-t border-zinc-900/50 shadow-[0_-10px_40px_rgba(0,0,0,0.5)]">
        <div className="max-w-3xl mx-auto space-y-6">
          <div className="flex items-center justify-between">
            <div className="flex flex-col gap-3">
              <span className="text-[9px] font-black tracking-[0.2em] text-zinc-600 uppercase">
                SELECTED ({currentSelected.length})
              </span>
              <div className="flex flex-wrap gap-2">
                {currentSelected.map(tag => (
                   <span key={tag} className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-[#5850ec]/20 border border-[#5850ec]/30 text-[9px] font-black text-[#5850ec] tracking-widest uppercase">
                     {tag}
                     <button onClick={() => toggleTag(tag)} className="hover:text-white transition-colors">
                        <X className="size-3" />
                     </button>
                   </span>
                ))}
              </div>
            </div>
            <button
              onClick={clearAll}
              className="text-[10px] font-black tracking-[0.1em] text-zinc-700 hover:text-zinc-400 uppercase transition-colors"
            >
              Clear All
            </button>
          </div>
          <Button
            onClick={() => onConfirm(currentSelected)}
            className="w-full py-8 rounded-2xl bg-[#5850ec] hover:bg-[#5850ec]/90 text-white font-black tracking-[0.3em] text-xs uppercase transition-all active:scale-[0.98]"
          >
            CONFIRM SELECTION
          </Button>
        </div>
      </div>
    </div>
  );
}
