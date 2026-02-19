'use client';

import { useState } from 'react';
import {
  Zap,
  Sparkles,
  Wand2,
  ChevronRight,
  RefreshCw,
  Music2,
  Mic2,
  Layers,
  Settings2,
  Sparkle
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { SelectionModal } from './selection-modal';
import { QuickStartProcessing } from './quickstart-processing';
import { QuickStartResults } from './quickstart-results';

const GENRE_CATEGORIES = {
  'ELECTRONIC': ['HOUSE', 'TECHNO', 'DRUM & BASS', 'DUBSTEP', 'SYNTHWAVE', 'TRANCE', 'AMBIENT', 'IDM', 'GARAGE'],
  'JAZZ': ['SWING', 'BEBOP', 'COOL JAZZ', 'FUSION', 'BOSSA NOVA', 'SMOOTH JAZZ', 'ACID JAZZ'],
  'METAL': ['HEAVY METAL', 'THRASH', 'DEATH METAL', 'BLACK METAL', 'DOOM METAL', 'METALCORE', 'PROG METAL']
};

const INSTRUMENT_CATEGORIES = {
  'STRINGS': ['ACOUSTIC GUITAR', 'ELECTRIC GUITAR', 'BASS GUITAR', 'CELLO', 'VIOLIN'],
  'KEYS': ['PIANO', 'SYNTHESIZER', 'RHODES', 'ORGAN'],
  'DRUMS': ['DRUM MACHINE', 'ACOUSTIC KIT', 'PERCUSSION']
};

const THEME_CATEGORIES = {
  'EMOTION': ['LONELY', 'EUPHORIC', 'NOSTALGIC', 'ANGRY', 'HOPEFUL'],
  'SETTING': ['CITY NIGHTS', 'FOREST', 'DEEP SPACE', 'UNDERWATER']
};

const VOCAL_CATEGORIES = {
  'STYLE': ['MALE TENOR', 'FEMALE SOPRANO', 'GRITTY', 'AIRY', 'DIGITAL'],
  'TECHNIQUE': ['HARMONIZED', 'DRY', 'REVERB-HEAVY', 'SPOKEN WORD']
};

const INSPIRATIONS = [
  { text: "80s Cyberpunk Chase", color: "border-[#06b6d4]/20 text-[#06b6d4]" },
  { text: "Midnight Jazz Cafe", color: "border-[#fbbf24]/20 text-[#fbbf24]" },
  { text: "Ethereal Dream Pop", color: "border-[#e11d48]/20 text-[#e11d48]" },
  { text: "Heavy Industrial Riffs", color: "border-[#5850ec]/20 text-[#5850ec]" },
];

export function QuickstartCard() {
  const [inputText, setInputText] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const [activeModal, setActiveModal] = useState<'GENRE' | 'INSTRUMENT' | 'THEME' | 'VOCALS' | null>(null);
  const [selections, setSelections] = useState({
    GENRE: [] as string[],
    INSTRUMENT: [] as string[],
    THEME: [] as string[],
    VOCALS: [] as string[]
  });

  const handleConfirmSelection = (tags: string[]) => {
    if (activeModal) {
      setSelections(prev => ({ ...prev, [activeModal]: tags }));
    }
    setActiveModal(null);
  };

  const handleGenerate = () => {
    setIsGenerating(true);
    // Simulation of generation process handled in QuickStartProcessing
  };

  const handleReset = () => {
    setIsGenerating(false);
    setShowResults(false);
    setInputText('');
    setSelections({
      GENRE: [],
      INSTRUMENT: [],
      THEME: [],
      VOCALS: []
    });
  };

  if (isGenerating && !showResults) {
    return <QuickStartProcessing onComplete={() => setShowResults(true)} />;
  }

  if (showResults) {
    return <QuickStartResults onReset={handleReset} selections={selections} prompt={inputText} />;
  }

  return (
    <div className="w-full max-w-5xl mx-auto px-6">
      <div className="bg-[#0c0c14] border-2 border-zinc-900 rounded-[3rem] p-8 sm:p-12 relative overflow-hidden">
        {/* Background Accent */}
        <div className="absolute top-0 right-0 w-[400px] h-[400px] bg-[#5850ec]/5 blur-[100px] pointer-events-none" />

        <div className="flex items-center gap-3 mb-10">
          <div className="p-2 border-2 border-[#fbbf24]/50 rounded-xl bg-[#fbbf24]/10">
            <Zap className="size-5 text-[#fbbf24] fill-[#fbbf24]" />
          </div>
          <h2 className="text-sm font-black tracking-[0.4em] text-white uppercase italic">QUICK START COMPOSER</h2>
        </div>

        {/* Selection Rows */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8">
          <SelectionButton
            label="GENRE"
            tags={selections.GENRE}
            onClick={() => setActiveModal('GENRE')}
            icon={<Music2 className="size-5" />}
          />
          <SelectionButton
            label="INSTRUMENTS"
            tags={selections.INSTRUMENT}
            onClick={() => setActiveModal('INSTRUMENT')}
            icon={<Layers className="size-5" />}
          />
          <SelectionButton
            label="THEME / MOOD"
            tags={selections.THEME}
            onClick={() => setActiveModal('THEME')}
            icon={<Settings2 className="size-5" />}
          />
          <SelectionButton
            label="VOCAL STYLE"
            tags={selections.VOCALS}
            onClick={() => setActiveModal('VOCALS')}
            icon={<Mic2 className="size-5" />}
          />
        </div>

        {/* Action Presets */}
        <div className="grid grid-cols-3 gap-4 mb-8">
           <ActionButton
            label="SPARK"
            icon={<Zap className="size-4 fill-[#fbbf24]" />}
            color="border-[#fbbf24]/20 bg-[#fbbf24]/5 text-[#fbbf24]"
            onClick={() => setInputText("Generate a high-energy synthwave track with a driving bassline.")}
          />
          <ActionButton
            label="ENHANCE"
            icon={<Sparkles className="size-4" />}
            color="border-[#e11d48]/20 bg-[#e11d48]/5 text-[#e11d48]"
            onClick={() => setInputText(prev => prev ? `${prev} Make it more atmospheric and cinematic.` : "Make my idea more cinematic.")}
          />
          <ActionButton
            label="POLISH"
            icon={<Wand2 className="size-4" />}
            color="border-[#06b6d4]/20 bg-[#06b6d4]/5 text-[#06b6d4]"
            onClick={() => setInputText(prev => prev ? `${prev} Add professional mastering and spatial audio.` : "Professional mastering.")}
          />
        </div>

        {/* Prompt Input */}
        <div className="relative mb-10 group">
          <div className="bg-[#050508] border-2 border-zinc-900 rounded-[2.5rem] p-10 min-h-[220px] transition-all focus-within:border-zinc-700 group-hover:border-zinc-800">
            <textarea
              value={inputText}
              onChange={(e) => setInputText(e.target.value.slice(0, 500))}
              placeholder="What are we creating today?"
              className="w-full bg-transparent border-none text-white placeholder:text-zinc-800 focus:ring-0 resize-none text-xl sm:text-4xl font-black italic uppercase leading-tight"
            />
            <div className="absolute bottom-10 right-10 text-[10px] font-black text-zinc-800 tracking-widest uppercase">
              {inputText.length}/500
            </div>
          </div>
        </div>

        {/* Inspirations */}
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
                onClick={() => setInputText(item.text)}
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

        {/* Generate Button */}
        <div className="mt-12">
          <Button
            onClick={handleGenerate}
            disabled={!inputText}
            className="w-full h-24 sm:h-32 rounded-[2.5rem] bg-[#5850ec] hover:bg-[#5850ec]/90 text-white font-black tracking-[0.6em] text-sm sm:text-2xl uppercase transition-all shadow-2xl shadow-[#5850ec]/20 active:scale-[0.98] disabled:opacity-20"
          >
            GENERATE TRACK
          </Button>
        </div>
      </div>

      {/* Modals */}
      <SelectionModal
        title="SELECT GENRE"
        isOpen={activeModal === 'GENRE'}
        onClose={() => setActiveModal(null)}
        categories={GENRE_CATEGORIES}
        selectedTags={selections.GENRE}
        onConfirm={handleConfirmSelection}
      />
      <SelectionModal
        title="SELECT INSTRUMENTS"
        isOpen={activeModal === 'INSTRUMENT'}
        onClose={() => setActiveModal(null)}
        categories={INSTRUMENT_CATEGORIES}
        selectedTags={selections.INSTRUMENT}
        onConfirm={handleConfirmSelection}
      />
      <SelectionModal
        title="SELECT THEME / MOOD"
        isOpen={activeModal === 'THEME'}
        onClose={() => setActiveModal(null)}
        categories={THEME_CATEGORIES}
        selectedTags={selections.THEME}
        onConfirm={handleConfirmSelection}
      />
      <SelectionModal
        title="SELECT VOCAL STYLE"
        isOpen={activeModal === 'VOCALS'}
        onClose={() => setActiveModal(null)}
        categories={VOCAL_CATEGORIES}
        selectedTags={selections.VOCALS}
        onConfirm={handleConfirmSelection}
      />
    </div>
  );
}

function SelectionButton({ label, tags, onClick, icon }: { label: string, tags: string[], onClick: () => void, icon: React.ReactNode }) {
  return (
    <button
      onClick={onClick}
      className="bg-[#050508] border-2 border-zinc-900 rounded-2xl p-6 flex items-center justify-between transition-all hover:bg-zinc-900 active:scale-[0.98] group"
    >
      <div className="flex items-start gap-4">
        <div className="p-3 bg-zinc-900 border border-zinc-800 rounded-xl text-zinc-500 group-hover:text-white transition-colors">
          {icon}
        </div>
        <div className="flex flex-col items-start gap-1 overflow-hidden">
          <span className="text-[9px] font-black tracking-widest text-zinc-600 uppercase">{label}</span>
          <div className="text-[11px] font-black text-zinc-400 truncate w-full uppercase text-left tracking-wider">
            {tags.length > 0 ? tags.join(', ') : 'SELECT...'}
          </div>
        </div>
      </div>
      <ChevronRight className="size-4 text-zinc-900 group-hover:text-zinc-600 transition-colors" />
    </button>
  );
}

function ActionButton({ label, icon, color, onClick }: { label: string, icon: React.ReactNode, color: string, onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "flex items-center justify-center gap-2 py-6 border-2 rounded-2xl transition-all active:scale-[0.95] font-black tracking-[0.3em] text-[10px] uppercase italic",
        color
      )}
    >
      {icon}
      {label}
    </button>
  );
}
