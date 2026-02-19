'use client';

import { useState, useEffect } from 'react';
import { X, ChevronDown } from 'lucide-react';
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
    <div className="fixed inset-0 z-50 flex flex-col bg-black/95 backdrop-blur-md animate-in fade-in duration-300">
      {/* Header */}
      <div className="flex items-center justify-between p-6 border-b border-zinc-900">
        <h2 className="text-2xl font-black tracking-[0.1em] text-white uppercase italic">{title}</h2>
        <button onClick={onClose} className="p-2 text-zinc-500 hover:text-white transition-colors">
          <X className="size-8" />
        </button>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-6 space-y-10 pb-48">
        {Object.entries(categories).map(([category, tags]) => (
          <div key={category} className="space-y-6">
            <div className="flex items-center gap-4">
              <h3 className="text-sm font-black tracking-[0.3em] text-cyan uppercase">
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
                    "px-6 py-3 rounded-xl text-xs font-black tracking-widest transition-all uppercase border-2",
                    currentSelected.includes(tag)
                      ? "bg-indigo border-indigo text-white shadow-xl shadow-indigo/20"
                      : "bg-zinc-950 text-zinc-500 hover:bg-zinc-900 border-zinc-900 hover:text-zinc-300"
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
      <div className="absolute bottom-0 left-0 right-0 p-8 bg-gradient-to-t from-black via-black/95 to-transparent border-t border-zinc-900">
        <div className="max-w-5xl mx-auto space-y-6">
          <div className="flex items-center justify-between">
            <div className="flex flex-col gap-2">
              <span className="text-[11px] font-black tracking-[0.2em] text-zinc-600 uppercase">
                SELECTED ({currentSelected.length})
              </span>
              <div className="flex flex-wrap gap-2">
                {currentSelected.map(tag => (
                   <span key={tag} className="flex items-center gap-2 px-4 py-1.5 rounded-lg bg-indigo/10 border border-indigo/20 text-[10px] font-black text-indigo tracking-widest uppercase">
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
              className="text-[11px] font-black tracking-[0.2em] text-zinc-700 hover:text-zinc-400 uppercase transition-colors"
            >
              Clear All
            </button>
          </div>
          <Button
            onClick={() => onConfirm(currentSelected)}
            className="w-full py-10 rounded-[2rem] bg-indigo hover:bg-indigo/90 text-zinc-300 font-black tracking-[0.5em] text-sm sm:text-xl uppercase transition-all shadow-2xl shadow-indigo/20 active:scale-[0.98]"
          >
            CONFIRM SELECTION
          </Button>
        </div>
      </div>
    </div>
  );
}
