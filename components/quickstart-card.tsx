'use client';

import { useState } from 'react';
import {
  Zap,
  Sparkles,
  Wand2,
  ChevronRight,
  RefreshCw,
  Sparkle,
  Music2,
  LayoutGrid,
  Volume2,
  Activity
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { SelectionModal } from './selection-modal';
import { Waveform } from './waveform';

const GENRE_CATEGORIES = {
  'ELECTRONIC': ['HOUSE', 'TECHNO', 'DRUM & BASS', 'DUBSTEP', 'SYNTHWAVE', 'TRANCE', 'AMBIENT', 'IDM', 'GARAGE'],
  'JAZZ': ['SWING', 'BEBOP', 'COOL JAZZ', 'FUSION', 'BOSSA NOVA', 'SMOOTH JAZZ', 'ACID JAZZ'],
  'METAL': ['HEAVY METAL', 'THRASH', 'DEATH METAL', 'BLACK METAL', 'METALCORE', 'DOOM METAL'],
  'POP': ['SYNTHPOP', 'DANCE POP', 'K-POP', 'INDIE POP', 'HYPERPOP'],
  'HIP HOP': ['TRAP', 'BOOM BAP', 'LOFI HIP HOP', 'DRILL', 'G-FUNK']
};

const INSTRUMENT_CATEGORIES = {
  'KEYBOARDS': ['PIANO', 'SYNTH', 'ORGAN', 'RHODES', 'CLAVINET'],
  'GUITARS': ['ELECTRIC GUITAR', 'ACOUSTIC GUITAR', 'BASS GUITAR', '12-STRING'],
  'DRUMS': ['ACOUSTIC DRUMS', '808', '909', 'PERCUSSION', 'TABLA'],
  'STRINGS': ['VIOLIN', 'CELLO', 'ORCHESTRAL', 'PIZZICATO'],
  'WOODWINDS': ['SAXOPHONE', 'FLUTE', 'CLARINET', 'OBOE']
};

const THEME_CATEGORIES = {
  'MOOD': ['MELANCHOLIC', 'EUPHORIC', 'DARK', 'DREAMY', 'AGGRESSIVE', 'NOSTALGIC'],
  'SUBJECT': ['LOVE', 'LOST', 'FUTURE', 'NATURE', 'REBELLION', 'SOLITUDE'],
  'SETTING': ['CITY NIGHTS', 'FOREST', 'SPACE', 'OCEAN', 'DESERT']
};

const VOCAL_CATEGORIES = {
  'GENDER': ['MALE', 'FEMALE', 'NON-BINARY', 'DUET'],
  'STYLE': ['AIRY', 'GRITTY', 'CLEAN', 'AUTO-TUNED', 'WHISPERED', 'CHORAL'],
  'RANGE': ['SOPRANO', 'ALTO', 'TENOR', 'BARITONE', 'BASS']
};

const PROJECT_CATEGORIES = {
  'FORMAT': ['SINGLE', 'EP', 'ALBUM', 'BEAT TAPE'],
  'TARGET': ['STREAMING', 'FILM/TV', 'SOCIAL MEDIA', 'LIVE PERFORMANCE'],
  'QUALITY': ['BALANCED', 'HIGH FIDELITY', 'LO-FI', 'EXPERIMENTAL']
};

const INSPIRATIONS = [
  { text: 'NEON NIGHTS', color: 'border-indigo-900 bg-indigo-500/10 text-indigo-400' },
  { text: 'SUMMER ANTHEM', color: 'border-amber-900 bg-amber-500/10 text-amber-400' },
  { text: 'CYBER CHASE', color: 'border-rose-900 bg-rose-500/10 text-rose-400' },
  { text: 'DREAM STATE', color: 'border-violet-900 bg-violet-500/10 text-violet-400' },
  { text: 'STREET STORIES', color: 'border-emerald-900 bg-emerald-500/10 text-emerald-400' },
  { text: 'QUIET CONFESSION', color: 'border-blue-900 bg-blue-500/10 text-blue-400' }
];

export function QuickstartCard() {
  const [inputText, setInputText] = useState('');
  const [activeModal, setActiveModal] = useState<string | null>(null);
  const [selections, setSelections] = useState<Record<string, string[]>>({
    GENRE: [],
    INSTRUMENT: [],
    THEME: [],
    VOCALS: [],
    PROJECT: []
  });
  const [isGenerating, setIsGenerating] = useState(false);
  const [generationStep, setGenerationStep] = useState('');
  const [result, setResult] = useState<{ summary: string, lyrics: string, mastering: string } | null>(null);

  const handleConfirmSelection = (tags: string[]) => {
    if (activeModal) {
      setSelections(prev => ({ ...prev, [activeModal]: tags }));
    }
    setActiveModal(null);
  };

  const handleSpark = () => {
    const ideas = [
      "A high-octane synthwave track set in a rain-slicked futuristic city.",
      "A melancholic acoustic ballad about a forgotten summer memory.",
      "An aggressive industrial techno anthem inspired by mechanical rhythms.",
      "A dreamy indie pop song exploring the feeling of weightlessness in space.",
      "A gritty boom-bap hip hop track reflecting on street-level reality."
    ];
    setInputText(ideas[Math.floor(Math.random() * ideas.length)]);
  };

  const handleEnhance = () => {
    if (inputText) {
      setInputText(prev => prev + " with layers of ethereal textures and complex rhythmic syncopation");
    }
  };

  const handlePolish = () => {
    if (inputText) {
      setInputText(prev => "A professionally polished " + prev.charAt(0).toLowerCase() + prev.slice(1) + ", optimized for high-fidelity streaming platforms.");
    }
  };

  const handleGenerate = () => {
    setIsGenerating(true);
    setResult(null);

    const steps = [
      "ANALYSING PROJECT DATA...",
      "SYNTHESIZING MELODIC HOOKS...",
      "GENERATING LYRICAL NARRATIVE...",
      "MASTERING AUDIO TEXTURES...",
      "FINALIZING TRACK..."
    ];

    let stepIdx = 0;
    const interval = setInterval(() => {
      if (stepIdx < steps.length) {
        setGenerationStep(steps[stepIdx]);
        stepIdx++;
      } else {
        clearInterval(interval);

        const summary = `Generated a ${selections.GENRE.join(' ')} inspired track. \n\nKey characteristics: \n- Genre: ${selections.GENRE.length > 0 ? selections.GENRE.join(', ') : 'Hybrid'} \n- Instruments: ${selections.INSTRUMENT.join(', ')} \n- Theme: ${selections.THEME.join(', ')} \n- Vocals: ${selections.VOCALS.join(', ')} \n- Description: ${inputText}`;

        const lyrics = `[Verse 1]\nBeyond the neon rain, the shadows start to play\nLost within the circuits of another digital day\nI hear your voice in every hum, in every frequency\nLocked inside the logic of this electric memory\n\n[Chorus]\nOh, we're building bridges out of starlight and code\nFollowing the rhythms on this high-speed road\nNo more silence, just the echo of the beat\nWhere the future and the ancient finally meet`;

        const mastering = `Loudness: -14 LUFS\nDynamic Range: 8.5 dB\nStereo Width: 120%\nEQ Profile: High-Fidelity Modern`;

        setResult({ summary, lyrics, mastering });
        setIsGenerating(false);
        setGenerationStep('');
      }
    }, 800);
  };

  return (
    <div className="w-full max-w-5xl mx-auto px-4 py-6 space-y-8">
      {/* Header */}
      <div className="flex items-center gap-4">
        <div className="size-12 sm:size-14 rounded-full border-2 border-gold flex items-center justify-center shadow-[0_0_20px_rgba(251,191,36,0.2)]">
          <Zap className="size-6 sm:size-7 text-gold fill-gold" />
        </div>
        <h1 className="text-3xl sm:text-5xl font-black tracking-[0.05em] text-white uppercase italic">QUICKSTART</h1>
      </div>

      {/* Main Container */}
      <div className="bg-[#0c0c12] border-2 border-zinc-900 rounded-[3rem] p-4 sm:p-10 shadow-2xl relative overflow-hidden">
        {/* Glow effect */}
        <div className="absolute -top-32 -left-32 size-64 bg-indigo-600/10 blur-[120px] pointer-events-none" />

        {/* Row 1: GENRE, INSTRUMENT */}
        <div className="grid grid-cols-2 gap-3 sm:gap-6 mb-4 sm:mb-6">
          <SelectionButton
            label="GENRE"
            tags={selections.GENRE}
            onClick={() => setActiveModal('GENRE')}
            border="border-emerald-900/30"
            icon={<ChevronRight className="size-4 text-emerald-900" />}
          />
          <SelectionButton
            label="INSTRUMENT"
            tags={selections.INSTRUMENT}
            onClick={() => setActiveModal('INSTRUMENT')}
            icon={<ChevronRight className="size-4 text-zinc-900" />}
          />
        </div>

        {/* Row 2: THEME, VOCALS, PROJECT */}
        <div className="grid grid-cols-3 gap-3 sm:gap-6 mb-6 sm:mb-8">
          <SelectionButton
            label="THEME"
            tags={selections.THEME}
            onClick={() => setActiveModal('THEME')}
            icon={<ChevronRight className="size-3 text-zinc-900" />}
          />
          <SelectionButton
            label="VOCALS"
            tags={selections.VOCALS}
            onClick={() => setActiveModal('VOCALS')}
            icon={<ChevronRight className="size-3 text-zinc-900" />}
          />
          <SelectionButton
            label="PROJECT"
            tags={selections.PROJECT}
            onClick={() => setActiveModal('PROJECT')}
            icon={<ChevronRight className="size-3 text-zinc-900" />}
          />
        </div>

        {/* Row 3: Action Buttons */}
        <div className="grid grid-cols-3 gap-3 sm:gap-6 mb-8 sm:mb-10">
           <ActionButton
            onClick={handleSpark}
            icon={<Zap className="size-4 text-gold fill-gold" />}
            label="SPARK"
            color="border-gold/20 bg-gold/5"
            textColor="text-gold"
          />
          <ActionButton
            onClick={handleEnhance}
            icon={<Sparkles className="size-4 text-rose" />}
            label="ENHANCE"
            color="border-rose/20 bg-rose/5"
            textColor="text-rose"
          />
          <ActionButton
            onClick={handlePolish}
            icon={<Wand2 className="size-4 text-cyan" />}
            label="POLISH"
            color="border-cyan/20 bg-cyan/5"
            textColor="text-cyan"
          />
        </div>

        {/* Text Area */}
        <div className="relative mb-8 sm:mb-10">
          <div className="bg-[#101018] border border-zinc-900 rounded-[2rem] p-8 min-h-[180px] sm:min-h-[260px] transition-all focus-within:border-zinc-800">
            <textarea
              value={inputText}
              onChange={(e) => setInputText(e.target.value.slice(0, 500))}
              placeholder="Describe your song idea..."
              className="w-full bg-transparent border-none text-zinc-400 placeholder:text-zinc-800 focus:ring-0 resize-none text-lg sm:text-3xl font-medium leading-relaxed"
            />
            <div className="absolute bottom-8 right-8 text-[11px] font-black text-zinc-800 tracking-widest uppercase">
              {inputText.length}/500
            </div>
          </div>
        </div>

        {/* Inspirations */}
        <div className="bg-[#0c0c14] border border-zinc-900 rounded-[2rem] p-8">
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-3">
              <Sparkle className="size-6 text-gold fill-gold" />
              <h2 className="text-[11px] sm:text-sm font-black tracking-[0.4em] text-zinc-400 uppercase italic">INSPIRATIONS</h2>
            </div>
            <button className="p-1 text-zinc-700 hover:text-white transition-colors">
              <RefreshCw className="size-5" />
            </button>
          </div>
          <div className="flex flex-wrap gap-3 sm:gap-4">
            {INSPIRATIONS.map((item) => (
              <button
                key={item.text}
                onClick={() => setInputText(prev => prev ? `${prev}, ${item.text}` : item.text)}
                className={cn(
                  "px-6 py-3 sm:px-8 sm:py-4 rounded-xl text-[10px] sm:text-xs font-black tracking-widest uppercase border-2 transition-all active:scale-95 hover:brightness-125",
                  item.color
                )}
              >
                {item.text}
              </button>
            ))}
          </div>
        </div>

        {/* Generate Button */}
        <div className="mt-10 sm:mt-12">
          <Button
            onClick={handleGenerate}
            disabled={!inputText || isGenerating}
            className="w-full py-12 sm:py-14 rounded-[2.5rem] bg-indigo hover:bg-indigo/90 text-zinc-300 font-black tracking-[0.5em] text-sm sm:text-2xl uppercase transition-all shadow-2xl shadow-indigo/20 active:scale-[0.99] disabled:opacity-50"
          >
            {isGenerating ? generationStep : 'GENERATE TRACK'}
          </Button>
        </div>

         {/* Results Area */}
         {result && (
          <div className="mt-10 p-4 sm:p-10 bg-zinc-950 rounded-[3rem] border border-zinc-900 animate-in fade-in slide-in-from-bottom-4 duration-500 space-y-10">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
              <div className="space-y-6">
                <h3 className="text-gold font-black tracking-widest text-xs flex items-center gap-2 uppercase italic">
                  <Music2 className="size-5" />
                  TRACK SUMMARY
                </h3>
                <div className="text-zinc-400 text-sm sm:text-base leading-relaxed font-medium bg-zinc-900/30 p-6 rounded-2xl border border-zinc-900 whitespace-pre-wrap italic">
                  {result.summary}
                </div>

                <h3 className="text-rose font-black tracking-widest text-xs flex items-center gap-2 uppercase italic">
                  <Activity className="size-5" />
                  AUDIO PREVIEW
                </h3>
                <div className="bg-zinc-900/30 p-8 rounded-2xl border border-zinc-900">
                  <Waveform active className="mb-6" />
                  <div className="flex items-center justify-between text-[10px] font-black uppercase tracking-widest text-zinc-600">
                    <span>0:00</span>
                    <span className="text-rose">PLAYING MOCK PREVIEW</span>
                    <span>3:42</span>
                  </div>
                </div>
              </div>

              <div className="space-y-6">
                <h3 className="text-cyan font-black tracking-widest text-xs flex items-center gap-2 uppercase italic">
                  <Volume2 className="size-5" />
                  MASTERING DETAILS
                </h3>
                <div className="bg-zinc-900/30 p-6 rounded-2xl border border-zinc-900 font-mono text-[10px] sm:text-xs text-cyan space-y-2">
                  {result.mastering.split('\n').map((line, i) => (
                    <div key={i} className="flex justify-between border-b border-cyan/10 pb-2 last:border-0 last:pb-0">
                      <span className="text-zinc-500 uppercase">{line.split(':')[0]}</span>
                      <span className="font-bold">{line.split(':')[1]}</span>
                    </div>
                  ))}
                </div>

                <h3 className="text-gold font-black tracking-widest text-xs flex items-center gap-2 uppercase italic">
                  <LayoutGrid className="size-5" />
                  LYRIC SHEET
                </h3>
                <div className="bg-zinc-900/30 p-8 rounded-2xl border border-zinc-900">
                  <pre className="text-zinc-500 font-mono text-xs sm:text-base whitespace-pre-wrap leading-relaxed italic">
                    {result.lyrics}
                  </pre>
                </div>
              </div>
            </div>

            <div className="flex gap-4">
              <Button className="flex-1 h-16 rounded-2xl bg-gold text-black hover:bg-gold/90 font-black uppercase tracking-widest">
                Save Project
              </Button>
              <Button variant="outline" className="flex-1 h-16 rounded-2xl border-zinc-800 text-zinc-400 hover:bg-zinc-900 font-black uppercase tracking-widest">
                Download Stems
              </Button>
            </div>
          </div>
        )}
      </div>

      {/* Selection Modals */}
      <SelectionModal
        title="SELECT GENRE"
        isOpen={activeModal === 'GENRE'}
        onClose={() => setActiveModal(null)}
        categories={GENRE_CATEGORIES}
        selectedTags={selections.GENRE}
        onConfirm={handleConfirmSelection}
      />
      <SelectionModal
        title="SELECT INSTRUMENT"
        isOpen={activeModal === 'INSTRUMENT'}
        onClose={() => setActiveModal(null)}
        categories={INSTRUMENT_CATEGORIES}
        selectedTags={selections.INSTRUMENT}
        onConfirm={handleConfirmSelection}
      />
      <SelectionModal
        title="SELECT THEME"
        isOpen={activeModal === 'THEME'}
        onClose={() => setActiveModal(null)}
        categories={THEME_CATEGORIES}
        selectedTags={selections.THEME}
        onConfirm={handleConfirmSelection}
      />
      <SelectionModal
        title="SELECT VOCALS"
        isOpen={activeModal === 'VOCALS'}
        onClose={() => setActiveModal(null)}
        categories={VOCAL_CATEGORIES}
        selectedTags={selections.VOCALS}
        onConfirm={handleConfirmSelection}
      />
      <SelectionModal
        title="SELECT PROJECT SETTINGS"
        isOpen={activeModal === 'PROJECT'}
        onClose={() => setActiveModal(null)}
        categories={PROJECT_CATEGORIES}
        selectedTags={selections.PROJECT}
        onConfirm={handleConfirmSelection}
      />
    </div>
  );
}

function SelectionButton({ label, tags, onClick, className, border, icon }: { label: string, tags: string[], onClick: () => void, className?: string, border?: string, icon?: React.ReactNode }) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "bg-[#101018] border-2 rounded-2xl p-5 sm:p-6 flex items-center justify-between transition-all hover:bg-zinc-900 active:scale-[0.98] group",
        border || "border-zinc-900",
        className
      )}
    >
      <div className="flex flex-col items-start gap-1 overflow-hidden">
        <span className="text-[10px] font-black tracking-widest text-zinc-600 uppercase">{label}</span>
        <div className="text-[11px] sm:text-sm font-black text-zinc-400 truncate w-full uppercase text-left">
          {tags.length > 0 ? tags.join(', ') : 'SELECT...'}
        </div>
      </div>
      <div className="flex-shrink-0 ml-2">
        {icon || <ChevronRight className="size-4 text-zinc-900 group-hover:text-zinc-600 transition-colors" />}
      </div>
    </button>
  );
}

function ActionButton({ onClick, icon, label, color, textColor }: { onClick: () => void, icon: React.ReactNode, label: string, color: string, textColor: string }) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "flex items-center justify-center gap-2 py-5 sm:py-6 border-2 rounded-2xl transition-all active:scale-[0.95] font-black tracking-[0.25em] text-[10px] sm:text-xs",
        color,
        textColor
      )}
    >
      {icon}
      {label}
    </button>
  );
}
