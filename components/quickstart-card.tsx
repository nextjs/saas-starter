'use client';

import { useState } from 'react';
import {
  Wand2, Zap, Sparkles, Music2, Mic2,
  Palette, Piano, ChevronRight, RefreshCw,
  LayoutGrid, History, Clock, ArrowRight,
  ChevronDown
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
  { text: 'NEON NIGHTS', color: 'bg-purple-900/50 text-purple-400 border-purple-800' },
  { text: 'SUMMER ANTHEM', color: 'bg-amber-900/50 text-amber-400 border-amber-800' },
  { text: 'CYBER CHASE', color: 'bg-indigo-900/50 text-indigo-400 border-indigo-800' },
  { text: 'STREET STORIES', color: 'bg-emerald-900/50 text-emerald-400 border-emerald-800' },
  { text: 'QUIET CONFESSION', color: 'bg-cyan-900/50 text-cyan-400 border-cyan-800' },
  { text: '808 CELLO', color: 'bg-blue-900/50 text-blue-400 border-blue-800' },
  { text: 'VIOLIN SYNTH', color: 'bg-fuchsia-900/50 text-fuchsia-400 border-fuchsia-800' },
  { text: 'DISTORTED FLUTE', color: 'bg-lime-900/50 text-lime-400 border-lime-800' },
  { text: 'GLITCH PIANO', color: 'bg-yellow-900/50 text-yellow-400 border-yellow-800' },
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
    <div className="w-full max-w-5xl mx-auto px-4 py-6 space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <div className="size-10 sm:size-12 rounded-full border-2 border-gold flex items-center justify-center shadow-[0_0_15px_rgba(251,191,36,0.3)]">
          <Zap className="size-5 sm:size-6 text-gold fill-gold" />
        </div>
        <h1 className="text-2xl sm:text-4xl font-black tracking-[0.1em] text-white uppercase italic">QUICKSTART</h1>
      </div>

      {/* Main Container */}
      <div className="bg-[#09090b] border-2 border-[#18181b] rounded-[2.5rem] p-4 sm:p-8 shadow-2xl relative overflow-hidden">
        {/* Glow effect */}
        <div className="absolute -top-24 -left-24 size-48 bg-indigo-600/5 blur-[100px] pointer-events-none" />

        {/* Row 1: GENRE, INSTRUMENT */}
        <div className="grid grid-cols-2 gap-2 sm:gap-4 mb-3 sm:mb-4">
          <SelectionButton
            label="GENRE"
            tags={selections.GENRE}
            onClick={() => setActiveModal('GENRE')}
            border="border-emerald-900/30"
            icon={<ChevronRight className="size-4 text-emerald-800" />}
          />
          <SelectionButton
            label="INSTRUMENT"
            tags={selections.INSTRUMENT}
            onClick={() => setActiveModal('INSTRUMENT')}
            icon={<ChevronRight className="size-4 text-zinc-800" />}
          />
        </div>

        {/* Row 2: THEME, VOCALS, PROJECT */}
        <div className="grid grid-cols-3 gap-2 sm:gap-4 mb-4 sm:mb-6">
          <SelectionButton
            label="THEME"
            tags={selections.THEME}
            onClick={() => setActiveModal('THEME')}
            icon={<ChevronRight className="size-4 text-zinc-800" />}
          />
          <SelectionButton
            label="VOCALS"
            tags={selections.VOCALS}
            onClick={() => setActiveModal('VOCALS')}
            icon={<ChevronRight className="size-4 text-zinc-800" />}
          />
          <SelectionButton
            label="PROJECT"
            tags={selections.PROJECT}
            onClick={() => setActiveModal('PROJECT')}
            icon={<ChevronRight className="size-4 text-zinc-800" />}
          />
        </div>

        {/* Row 3: Action Buttons */}
        <div className="grid grid-cols-3 gap-2 sm:gap-4 mb-6 sm:mb-8">
           <ActionButton
            onClick={handleSpark}
            icon={<Zap className="size-4 text-gold fill-gold" />}
            label="SPARK"
            color="border-gold/20 bg-gold/5"
            textColor="text-gold"
          />
          <ActionButton
            onClick={handleEnhance}
            icon={<Sparkles className="size-4 text-[#e11d48]" />}
            label="ENHANCE"
            color="border-[#e11d48]/20 bg-[#e11d48]/5"
            textColor="text-[#e11d48]"
          />
          <ActionButton
            onClick={handlePolish}
            icon={<Wand2 className="size-4 text-[#06b6d4]" />}
            label="POLISH"
            color="border-[#06b6d4]/20 bg-[#06b6d4]/5"
            textColor="text-[#06b6d4]"
          />
        </div>

        {/* Text Area */}
        <div className="relative mb-6 sm:mb-8">
          <div className="bg-[#101014] border border-[#18181b] rounded-3xl p-6 min-h-[150px] sm:min-h-[220px] transition-all focus-within:border-zinc-700">
            <textarea
              value={inputText}
              onChange={(e) => setInputText(e.target.value.slice(0, 500))}
              placeholder="Describe your song idea..."
              className="w-full bg-transparent border-none text-zinc-300 placeholder:text-zinc-700 focus:ring-0 resize-none text-base sm:text-2xl font-medium leading-relaxed"
            />
            <div className="absolute bottom-6 right-6 text-[10px] font-black text-zinc-800 tracking-widest uppercase">
              {inputText.length}/500
            </div>
          </div>
        </div>

        {/* Inspirations */}
        <div className="bg-[#0c0c10] border border-[#18181b] rounded-3xl p-6">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <Sparkles className="size-5 text-gold" />
              <h2 className="text-[10px] sm:text-sm font-black tracking-[0.3em] text-zinc-400 uppercase italic">INSPIRATIONS</h2>
            </div>
            <button className="p-1 text-zinc-600 hover:text-white transition-colors">
              <RefreshCw className="size-5" />
            </button>
          </div>
          <div className="flex flex-wrap gap-2 sm:gap-3">
            {INSPIRATIONS.map((item) => (
              <button
                key={item.text}
                onClick={() => setInputText(prev => prev ? `${prev}, ${item.text}` : item.text)}
                className={cn(
                  "px-4 py-2 sm:px-6 sm:py-3 rounded-xl text-[9px] sm:text-xs font-black tracking-widest uppercase border transition-all active:scale-95 hover:brightness-125",
                  item.color
                )}
              >
                {item.text}
              </button>
            ))}
          </div>
        </div>

        {/* Generate Button */}
        <div className="mt-8 sm:mt-10">
          <Button
            onClick={() => setIsGenerating(true)}
            disabled={!inputText || isGenerating}
            className="w-full py-10 sm:py-12 rounded-[2rem] bg-[#4338ca] hover:bg-[#4f46e5] text-zinc-300 font-black tracking-[0.4em] text-sm sm:text-xl uppercase transition-all shadow-2xl shadow-indigo-900/20 active:scale-[0.99] disabled:opacity-50"
          >
            {isGenerating ? 'ANALYSING PROJECT...' : 'GENERATE TRACK'}
          </Button>
        </div>

         {/* Results Area */}
         {result && (
          <div className="mt-8 p-6 bg-zinc-900/80 rounded-[2.5rem] border border-zinc-800 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <h3 className="text-gold font-black tracking-widest text-xs mb-3 flex items-center gap-2 uppercase italic">
              <Music2 className="size-4" />
              TRACK SUMMARY
            </h3>
            <div className="text-zinc-300 text-sm leading-relaxed mb-6 font-medium bg-zinc-950/50 p-4 rounded-xl border border-zinc-800 whitespace-pre-wrap italic">
              {result.summary}
            </div>

            <h3 className="text-gold font-black tracking-widest text-xs mb-3 flex items-center gap-2 uppercase italic">
              <LayoutGrid className="size-4" />
              LYRIC SHEET
            </h3>
            <div className="bg-zinc-950/50 p-6 rounded-xl border border-zinc-800">
              <pre className="text-zinc-400 font-mono text-xs sm:text-sm whitespace-pre-wrap leading-relaxed italic">
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
        "bg-[#101014] border-2 rounded-2xl p-4 sm:p-5 flex items-center justify-between transition-all hover:bg-zinc-900 active:scale-[0.98] group",
        border || "border-[#18181b]",
        className
      )}
    >
      <div className="flex flex-col items-start gap-1 overflow-hidden">
        <span className="text-[10px] font-black tracking-widest text-zinc-500 uppercase">{label}</span>
        <div className="text-[11px] sm:text-xs font-black text-zinc-300 truncate w-full uppercase text-left">
          {tags.length > 0 ? tags.join(', ') : 'SELECT...'}
        </div>
      </div>
      <div className="flex-shrink-0 ml-2">
        {icon || <ChevronRight className="size-4 text-zinc-800 group-hover:text-zinc-500 transition-colors" />}
      </div>
    </button>
  );
}

function ActionButton({ onClick, icon, label, color, textColor }: { onClick: () => void, icon: React.ReactNode, label: string, color: string, textColor: string }) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "flex items-center justify-center gap-2 py-4 sm:py-5 border-2 rounded-2xl transition-all active:scale-[0.95] font-black tracking-[0.2em] text-[10px] sm:text-xs",
        color,
        textColor
      )}
    >
      {icon}
      {label}
    </button>
  );
}
