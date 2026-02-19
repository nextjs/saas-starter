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
    <div className="fixed inset-0 z-50 flex flex-col bg-black/90 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="flex items-center justify-between p-4 border-b border-zinc-800">
        <h2 className="text-xl font-black tracking-widest text-white uppercase italic">{title}</h2>
        <button onClick={onClose} className="p-2 text-zinc-400 hover:text-white transition-colors">
          <X className="size-6" />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-8 pb-32">
        {Object.entries(categories).map(([category, tags]) => (
          <div key={category} className="space-y-4">
            <div className="flex items-center gap-2">
              <h3 className="text-xs font-black tracking-widest text-cyan-400 uppercase italic">
                {category}
              </h3>
              <div className="h-px flex-1 bg-zinc-800/50" />
            </div>
            <div className="flex flex-wrap gap-2">
              {tags.map((tag) => (
                <button
                  key={tag}
                  onClick={() => toggleTag(tag)}
                  className={cn(
                    "px-4 py-2 rounded-lg text-xs font-bold tracking-wider transition-all uppercase",
                    currentSelected.includes(tag)
                      ? "bg-indigo-600 text-white shadow-lg shadow-indigo-600/20"
                      : "bg-zinc-900 text-zinc-400 hover:bg-zinc-800 border border-zinc-800"
                  )}
                >
                  {tag}
                </button>
              ))}
            </div>
          </div>
        ))}
      </div>

      <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black via-black/95 to-transparent border-t border-zinc-800/50">
        <div className="max-w-4xl mx-auto space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-black tracking-widest text-zinc-500 uppercase">
                SELECTED ({currentSelected.length})
              </span>
              <div className="flex flex-wrap gap-1">
                {currentSelected.map(tag => (
                   <span key={tag} className="flex items-center gap-1 px-2 py-0.5 rounded bg-indigo-600/20 border border-indigo-600/30 text-[10px] font-bold text-indigo-400 uppercase">
                     {tag}
                     <button onClick={() => toggleTag(tag)}><X className="size-3" /></button>
                   </span>
                ))}
              </div>
            </div>
            <button
              onClick={clearAll}
              className="text-[10px] font-black tracking-widest text-zinc-600 hover:text-zinc-400 uppercase transition-colors"
            >
              Clear All
            </button>
          </div>
          <Button
            onClick={() => onConfirm(currentSelected)}
            className="w-full py-6 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-black tracking-[0.2em] text-sm uppercase shadow-xl shadow-indigo-600/20 transition-all active:scale-[0.98]"
          >
            CONFIRM SELECTION
          </Button>
        </div>
      </div>
    </div>
  );
}
