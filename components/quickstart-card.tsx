'use client';

import { useState } from 'react';
import {
  Wand2, Zap, Sparkles, Music2, Mic2,
  Palette, Piano, ChevronRight, RefreshCw,
  LayoutGrid, History, Clock, ArrowRight,
  ChevronDown, Sparkle
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { SelectionModal } from './selection-modal';
import { cn } from '@/lib/utils';

// --- DATA ---

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
  'TYPE': ['MALE', 'FEMALE', 'NON-BINARY', 'CHOIR', 'CHILDREN'],
  'STYLE': ['CLEAN', 'GRITTY', 'BREATHY', 'OPERATIC', 'RAP', 'SPOKEN WORD'],
  'EFFECTS': ['REVERB', 'DELAY', 'AUTOTUNE', 'VOCODER', 'HARMONY']
};

const PROJECT_CATEGORIES = {
  'LENGTH & STRUCTURE': ['SHORT (1:30)', 'MEDIUM (3:00)', 'LONG (5:00)', 'VERSE-CHORUS', 'AABA', 'THROUGH-COMPOSED'],
  'MASTERING': ['ANALOG WARMTH', 'DIGITAL CLARITY', 'LO-FI VIBE', 'VINYL CRACKLE'],
  'CINEMATIC': ['SURROUND SOUND', 'IMAX STYLE', 'BINAURAL', 'WIDE STEREO'],
  'SPECIAL': ['BASS DROPS', 'INSTRUMENTAL SOLOS', 'PROGRESSIVE BUILDS', 'KEY CHANGE']
};

const INSPIRATIONS = [
  { text: 'NEON NIGHTS', color: 'bg-indigo-900/20 text-indigo-400 border-indigo-900/50' },
  { text: 'SUMMER ANTHEM', color: 'bg-amber-900/20 text-amber-500 border-amber-900/50' },
  { text: 'CYBER CHASE', color: 'bg-rose-900/20 text-rose-400 border-rose-900/50' },
  { text: 'DREAM STATE', color: 'bg-purple-900/20 text-purple-400 border-purple-900/50' },
  { text: 'STREET STORIES', color: 'bg-emerald-900/20 text-emerald-400 border-emerald-900/50' },
  { text: 'QUIET CONFESSION', color: 'bg-blue-900/20 text-blue-400 border-blue-900/50' },
  { text: '808 CELLO', color: 'bg-cyan-900/20 text-cyan-400 border-cyan-900/50' },
  { text: 'DESERT SUN', color: 'bg-orange-900/20 text-orange-400 border-orange-900/50' },
  { text: 'VIOLIN SYNTH', color: 'bg-indigo-900/20 text-indigo-400 border-indigo-900/50' },
  { text: 'DISTORTED FLUTE', color: 'bg-lime-900/20 text-lime-400 border-lime-900/50' },
  { text: 'GLITCH PIANO', color: 'bg-amber-900/20 text-amber-500 border-amber-900/50' },
  { text: 'CELESTE', color: 'bg-pink-900/20 text-pink-400 border-pink-900/50' },
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
  const [result, setResult] = useState<{ summary: string; lyrics: string } | null>(null);

  const handleConfirmSelection = (tags: string[]) => {
    if (activeModal) {
      setSelections(prev => ({ ...prev, [activeModal]: tags }));
      setActiveModal(null);
    }
  };

  const handleSpark = () => {
    const ideas = [
      "A cinematic synthwave track exploring the neon-drenched streets of a futuristic Tokyo after midnight.",
      "An atmospheric lofi-jazz arrangement reflecting on the quiet solitude of a rainy Sunday afternoon.",
      "A high-octane industrial techno anthem inspired by the chaotic energy of a digital uprising.",
      "A melancholic indie-folk ballad about a long-lost letter discovered in a dusty attic trunk.",
      "An ethereal dream-pop journey through the surreal landscapes of a lucid dream at sunrise."
    ];
    const idea = ideas[Math.floor(Math.random() * ideas.length)];
    setInputText(idea.slice(0, 100));
  };

  const handleEnhance = () => {
    if (!inputText) return;
    setIsGenerating(true);
    setTimeout(() => {
      const enhanced = `${inputText} [ENHANCED]: Integrate driving 124BPM rhythmic structures with lush, side-chained analog pads and a deep, resonant 808 sub-bass profile. Establish a wide cinematic stereo field using subtle rhythmic delays and immersive spatial reverb to create a professional audio landscape.`;
      setInputText(enhanced.slice(0, 250));
      setIsGenerating(false);
    }, 1000);
  };

  const handlePolish = () => {
    if (!inputText) return;
    setIsGenerating(true);
    setTimeout(() => {
      const polishedText = `MASTERPIECE CONFIGURATION: Orchestrate a sophisticated sonic blend of vintage Moog basslines and crystalline FM leads. Implement a dynamic 4-stage track structure—Atmospheric Intro, Ethereal Verse, Explosive Chorus, and Cinematic Outro—using professional transition effects, automation sweeps, and 24-bit high-fidelity mastering for a signature commercial sound profile.`;
      const summary = `PROJECT AUDIT: 10/10 (Suno Optimized). This production blueprint outlines a high-fidelity 126 BPM arrangement with a focus on wide-stereo spatialization and frequency-specific side-chaining. Audio Context: High-resolution 48kHz/24-bit depth. Track Architecture: [Intro: 0:00-0:15] - Minimalist textures with slow-attack filters. [Verse: 0:15-1:00] - Rhythmic foundation with layered percussion. [Build: 1:00-1:15] - Progressive frequency opening. [Chorus: 1:15-2:00] - Full harmonic spectrum with centered lead vocals and wide backings. [Outro: 2:00-2:30] - Atmospheric decay with legacy reverb tails. Mastering Details: Analog warmth emulation with digital brick-wall limiting to -14 LUFS. Harmonic saturation applied to mid-range for presence. Cinematic binaural panning for immersive surround experience. Target Audience: High-end audio enthusiasts and commercial sync placements.`;
      const lyrics = `[Verse 1]\nNeon glimmers on the wet pavement\nTracing shadows of a life we once knew\nSilicon pulse in the heart of the basement\nEverything's changed, but I'm still seeking you\n\n[Chorus]\nElectric heart, beating in the wire\nBurning with a cold, blue fire\nWe're digital ghosts in a physical cage\nWriting our love on a pixelated page\n\n[Bridge]\n(Wait for the drop)\nSYSTEM OVERLOAD\n[Instrumental Solo: Glitch Synth]\n\n[Outro]\nStatic remains...`;

      setInputText(polishedText.slice(0, 300));
      setResult({ summary, lyrics });
      setIsGenerating(false);
    }, 1500);
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
            onClick={() => setIsGenerating(true)}
            disabled={!inputText || isGenerating}
            className="w-full py-12 sm:py-14 rounded-[2.5rem] bg-indigo hover:bg-indigo/90 text-zinc-300 font-black tracking-[0.5em] text-sm sm:text-2xl uppercase transition-all shadow-2xl shadow-indigo/20 active:scale-[0.99] disabled:opacity-50"
          >
            {isGenerating ? 'ANALYSING PROJECT...' : 'GENERATE TRACK'}
          </Button>
        </div>

         {/* Results Area */}
         {result && (
          <div className="mt-10 p-8 bg-zinc-950 rounded-[3rem] border border-zinc-900 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <h3 className="text-gold font-black tracking-widest text-xs mb-4 flex items-center gap-2 uppercase italic">
              <Music2 className="size-5" />
              TRACK SUMMARY
            </h3>
            <div className="text-zinc-400 text-sm sm:text-base leading-relaxed mb-8 font-medium bg-zinc-900/30 p-6 rounded-2xl border border-zinc-900 whitespace-pre-wrap italic">
              {result.summary}
            </div>

            <h3 className="text-gold font-black tracking-widest text-xs mb-4 flex items-center gap-2 uppercase italic">
              <LayoutGrid className="size-5" />
              LYRIC SHEET
            </h3>
            <div className="bg-zinc-900/30 p-8 rounded-2xl border border-zinc-900">
              <pre className="text-zinc-500 font-mono text-xs sm:text-base whitespace-pre-wrap leading-relaxed italic">
                {result.lyrics}
              </pre>
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
