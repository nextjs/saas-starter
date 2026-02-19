'use client';

import { useState, useCallback, useMemo } from 'react';
import {
  PlusCircle,
  Sparkles,
  RefreshCw,
  ChevronDown,
  Wand2,
  Zap,
  Music2,
  LayoutGrid,
  Search,
  Mic2,
  Palette,
  Piano,
  ArrowRight,
  Clock,
  History
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  DropdownMenuSub,
  DropdownMenuSubTrigger,
  DropdownMenuSubContent
} from '@/components/ui/dropdown-menu';

const GENRES = {
  'Pop': ['Synthpop', 'Bubblegum', 'Indie Pop', 'Bedroom Pop'],
  'Rock': ['Alternative', 'Punk', 'Hard Rock', 'Grunge'],
  'Hip Hop': ['Trap', 'Lo-fi', 'Old School', 'Drill'],
  'Electronic': ['EDM', 'Techno', 'House', 'Ambient'],
  'Jazz': ['Swing', 'Bebop', 'Fusion', 'Smooth Jazz'],
};

const VOCALS = {
  'Type': ['Male', 'Female', 'Non-binary', 'Duo', 'Group'],
  'Style': ['Deep', 'Tenor', 'Soprano', 'Soulful', 'Airy', 'Husky', 'Gritty'],
};

const THEMES = {
  'Atmosphere': ['Love', 'Heartbreak', 'Longing', 'Nostalgia', 'Joy'],
  'Setting': ['Nature', 'City', 'Space', 'Desert', 'Ocean'],
  'Vibe': ['Dark', 'Ethereal', 'Energetic', 'Melancholic', 'Aggressive'],
};

const INSTRUMENTATION = {
  'Acoustic': ['Guitar', 'Piano', 'Violin', 'Cello', 'Drums'],
  'Digital': ['Synthesizer', '808', 'Drum Machine', 'Glitch', 'Pad'],
  'Experimental': ['Found Sound', 'Modular Synth', 'Circuit Bent'],
};

const SUGGESTED_PROMPTS = [
  'NEON NIGHTS', 'QUIET CONFESSION', 'STREET STORIES', 'VIOLIN SYNTH',
  '808 CELLO', 'DISTORTED FLUTE', 'GLITCH PIANO', 'PSYCHEDELIC BASS DROP',
  'CELESTIAL TRIANGLE', 'DOUBLE TIME', 'MIDNIGHT RAIN', 'GHOST NOTES',
  'SUMMER HAZE', 'VELVET ECHO', 'SILVER LINING', 'URBAN JUNGLE'
];

const PROMPT_TEMPLATES = [
  "A {genre} track featuring {vocals} vocals. The theme is {theme} with heavy {instrumentation}.",
  "Experimental {genre} fusion with {instrumentation} and {style} {vocals} vocals.",
  "A {theme} inspired {genre} song. Focus on {instrumentation} and atmospheric soundscapes.",
  "High energy {genre} with a {vibe} feel. {vocals} vocals lead the way.",
  "Minimalist {instrumentation} accompanying a {theme} story. {vocals} vocals."
];

const RECENT_WORKS = [
  { id: 1, title: 'Midnight Echoes', genre: 'Synthpop', date: '2h ago' },
  { id: 2, title: 'Summer Rain', genre: 'Indie Pop', date: '5h ago' },
  { id: 3, title: 'Neon Jungle', genre: 'Electronic', date: 'Yesterday' },
];

export default function DashboardPage() {
  const [inputText, setInputText] = useState('');
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [prompts, setPrompts] = useState(SUGGESTED_PROMPTS.slice(0, 10));
  const [isGenerating, setIsGenerating] = useState(false);
  const [result, setResult] = useState<{lyrics: string, summary: string} | null>(null);

  const refreshPrompts = () => {
    const shuffled = [...SUGGESTED_PROMPTS].sort(() => 0.5 - Math.random());
    setPrompts(shuffled.slice(0, 10));
  };

  const addTag = (tag: string) => {
    if (!selectedTags.includes(tag)) {
      setSelectedTags(prev => [...prev, tag]);
      setInputText(prev => prev ? `${prev}, ${tag}` : tag);
    }
  };

  const handleSpark = () => {
    const randomTemplate = PROMPT_TEMPLATES[Math.floor(Math.random() * PROMPT_TEMPLATES.length)];
    const genreKeys = Object.keys(GENRES);
    const genre = genreKeys[Math.floor(Math.random() * genreKeys.length)];
    const subGenres = GENRES[genre as keyof typeof GENRES];
    const subGenre = subGenres[Math.floor(Math.random() * subGenres.length)];
    const vocalType = VOCALS.Type[Math.floor(Math.random() * VOCALS.Type.length)];
    const theme = THEMES.Atmosphere[Math.floor(Math.random() * THEMES.Atmosphere.length)];
    const instr = INSTRUMENTATION.Acoustic[Math.floor(Math.random() * INSTRUMENTATION.Acoustic.length)];

    const prompt = randomTemplate
      .replace('{genre}', subGenre)
      .replace('{vocals}', vocalType)
      .replace('{theme}', theme)
      .replace('{instrumentation}', instr);

    setInputText(prompt);
  };

  const handleEnhance = () => {
    if (!inputText) return;
    const enhancements = [
      "Add layers of atmospheric depth and intricate rhythmic patterns.",
      "Incorporate a sudden bridge with soaring melodies and complex harmonies.",
      "Explore the juxtaposition between the raw acoustic elements and modern digital processing.",
      "Expand on the emotional narrative with vivid sensory details and metaphorical lyricism.",
      "Build a cinematic soundscape that evolves from a quiet whisper to a thunderous climax."
    ];
    const randomEnhancement = enhancements[Math.floor(Math.random() * enhancements.length)];
    const enhanced = `${inputText}. ${randomEnhancement} Incorporate layered vocal harmonies and a dynamic bridge that builds tension before a satisfying resolution. The arrangement should favor organic textures blended with subtle electronic pulses to create a unique sonic signature that resonates with the core emotional theme of the composition.`;
    setInputText(enhanced.slice(0, 300));
  };

  const handleGenerate = () => {
    setIsGenerating(true);
    setResult(null);
    setTimeout(() => {
      setResult({
        summary: `A professional ${inputText.split(',')[0] || 'custom'} track with a focus on ${selectedTags.join(' and ') || 'emotional resonance'}.`,
        lyrics: `[Verse 1]\nNeon lights reflecting in the rain\nWalking through the streets, hiding all the pain\nEvery shadow whispers secrets of the night\nWaiting for the moment, waiting for the light\n\n[Chorus]\nOh, the city never sleeps, and neither do I\nUnderneath the heavy clouds of a digital sky\nWe're just echoes in the static, ghosts in the machine\nLiving in a dream that nobody has seen\n\n[Verse 2]\nSilicon hearts beating to a steady drum\nLooking for a feeling, but we're feeling numb\nSwitch the circuit, break the code, find a way out\nBeyond the wall of silence, beyond the wall of doubt`
      });
      setIsGenerating(false);
    }, 1500);
  };

  return (
    <div className="min-h-screen bg-black text-white p-4 lg:p-8 flex flex-col items-center overflow-x-hidden">
      {/* QUICK START Header */}
      <div className="w-full max-w-4xl mb-6 flex items-center gap-3">
        <div className="p-1.5 sm:p-2 border-2 border-gold rounded-lg flex-shrink-0">
          <Wand2 className="size-5 sm:size-6 text-gold" />
        </div>
        <h1 className="text-xl sm:text-3xl font-black tracking-[0.2em] text-white truncate uppercase italic">QUICK START</h1>
      </div>

      {/* Main Dashboard Container */}
      <div className="w-full max-w-4xl border-2 border-zinc-800 rounded-3xl sm:rounded-[2.5rem] p-4 sm:p-8 bg-zinc-950/50 relative overflow-hidden shadow-2xl mb-12">
        <div className="absolute inset-0 bg-gradient-to-br from-zinc-900/50 to-transparent pointer-events-none" />

        {/* Dropdowns Row */}
        <div className="flex flex-col sm:flex-row flex-wrap gap-3 mb-6 sm:mb-8 relative z-10">
          <div className="grid grid-cols-2 lg:flex lg:flex-wrap gap-2 sm:gap-3 w-full lg:w-auto lg:flex-1">
            <DropdownItem label="GENRE" icon={<Music2 className="size-3 sm:size-4 mr-1 sm:mr-2" />} data={GENRES} onSelect={addTag} />
            <DropdownItem label="VOCALS" icon={<Mic2 className="size-3 sm:size-4 mr-1 sm:mr-2" />} data={VOCALS} onSelect={addTag} />
            <DropdownItem label="THEME" icon={<Palette className="size-3 sm:size-4 mr-1 sm:mr-2" />} data={THEMES} onSelect={addTag} />
            <DropdownItem label="INSTR." icon={<Piano className="size-3 sm:size-4 mr-1 sm:mr-2" />} data={INSTRUMENTATION} onSelect={addTag} />
          </div>

          <div className="grid grid-cols-2 gap-2 sm:gap-3 w-full sm:w-auto">
            <Button
              onClick={handleEnhance}
              className="rounded-full bg-gradient-to-r from-rose-500 to-orange-500 hover:from-rose-600 hover:to-orange-600 font-bold px-4 sm:px-6 shadow-lg shadow-rose-500/20 text-xs sm:text-sm h-9 sm:h-10"
            >
              ENHANCE
            </Button>
            <Button
              onClick={handleSpark}
              className="rounded-full bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 font-bold px-4 sm:px-6 shadow-lg shadow-indigo-500/20 text-xs sm:text-sm h-9 sm:h-10"
            >
              <Zap className="size-3 sm:size-4 mr-1 sm:mr-2 fill-current" />
              SPARK
            </Button>
          </div>
        </div>

        {/* Text Input Area */}
        <div className="relative mb-6 sm:mb-8 z-10">
          <textarea
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            placeholder="Describe a dream, a memory, or a vibe..."
            className="w-full bg-transparent border-none text-lg sm:text-2xl font-medium placeholder:text-zinc-700 focus:ring-0 min-h-[100px] sm:min-h-[120px] resize-none"
          />
        </div>

        {/* Suggested Prompts */}
        <div className="mb-6 sm:mb-8 z-10 relative">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2 text-zinc-400 text-[10px] sm:text-sm font-bold tracking-widest uppercase">
              <Sparkles className="size-3 sm:size-4 text-yellow-400" />
              SUGGESTED PROMPTS
            </div>
            <button onClick={refreshPrompts} className="text-zinc-500 hover:text-white transition-colors">
              <RefreshCw className="size-4 sm:size-5" />
            </button>
          </div>

          <div className="flex flex-wrap gap-1.5 sm:gap-2">
            {prompts.map((prompt, i) => (
              <button
                key={prompt + i}
                onClick={() => setInputText(prev => prev ? `${prev}, ${prompt}` : prompt)}
                className={`px-2.5 sm:px-4 py-1.5 sm:py-2 rounded-lg text-[9px] sm:text-xs font-bold tracking-wider transition-all hover:scale-105 active:scale-95 ${getPromptColor(i)}`}
              >
                {prompt}
              </button>
            ))}
          </div>
        </div>

        {/* Generate Button */}
        <div className="z-10 relative">
          <Button
            onClick={handleGenerate}
            disabled={!inputText || isGenerating}
            className="w-full py-6 sm:py-8 rounded-full border-2 border-zinc-800 bg-zinc-900/50 hover:bg-zinc-800 text-zinc-500 hover:text-white font-black tracking-[0.1em] sm:tracking-[0.3em] text-base sm:text-xl transition-all disabled:opacity-50"
          >
            {isGenerating ? 'GENERATING...' : 'GENERATE TRACK'}
          </Button>
        </div>

        {/* Results Area */}
        {result && (
          <div className="mt-6 sm:mt-8 p-4 sm:p-6 bg-zinc-900/80 rounded-2xl sm:rounded-3xl border border-zinc-800 animate-in fade-in slide-in-from-bottom-4 duration-500 z-10 relative">
            <h3 className="text-gold font-bold text-xs sm:text-sm mb-2 flex items-center gap-2">
              <Music2 className="size-3 sm:size-4" />
              TRACK SUMMARY
            </h3>
            <p className="text-zinc-300 text-sm sm:text-base mb-4 sm:mb-6 italic">{result.summary}</p>

            <h3 className="text-gold font-bold text-xs sm:text-sm mb-3 sm:mb-4 flex items-center gap-2">
              <LayoutGrid className="size-3 sm:size-4" />
              LYRIC SHEET
            </h3>
            <pre className="text-zinc-400 font-mono text-xs sm:text-sm whitespace-pre-wrap leading-relaxed">
              {result.lyrics}
            </pre>
          </div>
        )}
      </div>

      {/* Recent Works Section */}
      <div className="w-full max-w-4xl px-2">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-2">
            <History className="size-5 text-zinc-500" />
            <h2 className="text-lg font-black text-white uppercase italic tracking-widest">Recent Works</h2>
          </div>
          <Button variant="link" className="text-gold text-xs font-bold uppercase tracking-widest p-0 h-auto">
            View Library
            <ArrowRight className="size-3 ml-2" />
          </Button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {RECENT_WORKS.map((work) => (
            <div key={work.id} className="bg-zinc-950 border border-zinc-900 p-4 rounded-2xl hover:border-zinc-700 transition-colors cursor-pointer group">
              <div className="flex items-center gap-3 mb-3">
                <div className="p-2 bg-zinc-900 rounded-lg group-hover:bg-gold/10 transition-colors">
                  <Music2 className="size-4 text-zinc-500 group-hover:text-gold transition-colors" />
                </div>
                <div className="min-w-0">
                  <h3 className="text-sm font-bold text-white truncate uppercase italic">{work.title}</h3>
                  <p className="text-[10px] text-zinc-600 font-bold tracking-widest">{work.genre}</p>
                </div>
              </div>
              <div className="flex items-center gap-2 text-[9px] text-zinc-700 font-black uppercase tracking-[0.2em]">
                <Clock className="size-3" />
                {work.date}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function DropdownItem({ label, icon, data, onSelect }: { label: string, icon: any, data: any, onSelect: (val: string) => void }) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" className="w-full rounded-full bg-zinc-900/50 border-zinc-800 hover:bg-zinc-800 text-zinc-400 font-bold px-2 sm:px-4 text-[10px] sm:text-sm h-9 sm:h-10 justify-between sm:justify-center">
          <span className="flex items-center overflow-hidden">
            {icon}
            <span className="truncate">{label}</span>
          </span>
          <ChevronDown className="size-3 sm:size-4 ml-1 sm:ml-2 flex-shrink-0" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="bg-zinc-900 border-zinc-800 text-zinc-300 min-w-[160px] sm:min-w-[200px]">
        {Object.entries(data).map(([category, items]) => (
          <DropdownMenuSub key={category}>
            <DropdownMenuSubTrigger className="hover:bg-zinc-800 focus:bg-zinc-800 text-xs sm:text-sm">
              {category}
            </DropdownMenuSubTrigger>
            <DropdownMenuSubContent className="bg-zinc-900 border-zinc-800 text-zinc-300">
              {(items as string[]).map(item => (
                <DropdownMenuItem
                  key={item}
                  onClick={() => onSelect(item)}
                  className="hover:bg-zinc-800 focus:bg-zinc-800 cursor-pointer text-xs sm:text-sm"
                >
                  {item}
                </DropdownMenuItem>
              ))}
            </DropdownMenuSubContent>
          </DropdownMenuSub>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

function getPromptColor(index: number) {
  const colors = [
    'bg-indigo-500/80 text-white',
    'bg-sky-500/80 text-white',
    'bg-emerald-500/80 text-white',
    'bg-lime-500/80 text-white',
    'bg-violet-500/80 text-white',
    'bg-cyan-500/80 text-white',
    'bg-teal-500/80 text-white',
    'bg-amber-500/80 text-white',
    'bg-green-500/80 text-white',
    'bg-rose-500/80 text-white',
  ];
  return colors[index % colors.length];
}
