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
  Piano
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
    const genre = Object.keys(GENRES)[Math.floor(Math.random() * Object.keys(GENRES).length)];
    const subGenre = GENRES[genre as keyof typeof GENRES][Math.floor(Math.random() * GENRES[genre as keyof typeof GENRES].length)];
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
    const enhanced = `${inputText}. ${randomEnhancement} Ensure the transition between sections is seamless yet surprising. Incorporate layered vocal harmonies and a dynamic bridge that builds tension before a satisfying resolution. The arrangement should favor organic textures blended with subtle electronic pulses to create a unique sonic signature that resonates with the core emotional theme of the composition.`;
    setInputText(enhanced.slice(0, 300));
  };

  const handleGenerate = () => {
    setIsGenerating(true);
    setResult(null);
    // Simulate API call
    setTimeout(() => {
      setResult({
        summary: `A professional ${inputText.split(',')[0] || 'custom'} track with a focus on ${selectedTags.join(' and ') || 'emotional resonance'}.`,
        lyrics: `[Verse 1]\nNeon lights reflecting in the rain\nWalking through the streets, hiding all the pain\nEvery shadow whispers secrets of the night\nWaiting for the moment, waiting for the light\n\n[Chorus]\nOh, the city never sleeps, and neither do I\nUnderneath the heavy clouds of a digital sky\nWe're just echoes in the static, ghosts in the machine\nLiving in a dream that nobody has seen\n\n[Verse 2]\nSilicon hearts beating to a steady drum\nLooking for a feeling, but we're feeling numb\nSwitch the circuit, break the code, find a way out\nBeyond the wall of silence, beyond the wall of doubt`
      });
      setIsGenerating(false);
    }, 1500);
  };

  return (
    <div className="min-h-screen bg-black text-white p-4 lg:p-8 flex flex-col items-center">
      {/* QUICK START Header */}
      <div className="w-full max-w-4xl mb-6 flex items-center gap-3">
        <div className="p-2 border-2 border-gold rounded-lg">
          <Wand2 className="size-6 text-gold" />
        </div>
        <h1 className="text-3xl font-black tracking-[0.2em] text-white">QUICK START</h1>
      </div>

      {/* Main Dashboard Container */}
      <div className="w-full max-w-4xl border-2 border-zinc-800 rounded-[2.5rem] p-8 bg-zinc-950/50 relative overflow-hidden shadow-2xl">
        <div className="absolute inset-0 bg-gradient-to-br from-zinc-900/50 to-transparent pointer-events-none" />

        {/* Dropdowns Row */}
        <div className="flex flex-wrap gap-3 mb-8 relative z-10">
          <DropdownItem label="GENRE" icon={<Music2 className="size-4 mr-2" />} data={GENRES} onSelect={addTag} />
          <DropdownItem label="VOCALS" icon={<Mic2 className="size-4 mr-2" />} data={VOCALS} onSelect={addTag} />
          <DropdownItem label="THEME" icon={<Palette className="size-4 mr-2" />} data={THEMES} onSelect={addTag} />
          <DropdownItem label="INSTRUMENTATION" icon={<Piano className="size-4 mr-2" />} data={INSTRUMENTATION} onSelect={addTag} />

          <div className="flex-1" />

          <div className="flex gap-3">
            <Button
              onClick={handleEnhance}
              className="rounded-full bg-gradient-to-r from-rose-500 to-orange-500 hover:from-rose-600 hover:to-orange-600 font-bold px-6 shadow-lg shadow-rose-500/20"
            >
              ENHANCE
            </Button>
            <Button
              onClick={handleSpark}
              className="rounded-full bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 font-bold px-6 shadow-lg shadow-indigo-500/20"
            >
              <Zap className="size-4 mr-2 fill-current" />
              SPARK
            </Button>
          </div>
        </div>

        {/* Text Input Area */}
        <div className="relative mb-8 z-10">
          <textarea
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            placeholder="Describe a dream, a memory, or a vibe..."
            className="w-full bg-transparent border-none text-2xl font-medium placeholder:text-zinc-700 focus:ring-0 min-h-[120px] resize-none"
          />
        </div>

        {/* Suggested Prompts */}
        <div className="mb-8 z-10 relative">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2 text-zinc-400 text-sm font-bold tracking-widest">
              <Sparkles className="size-4 text-yellow-400" />
              SUGGESTED PROMPTS
            </div>
            <button onClick={refreshPrompts} className="text-zinc-500 hover:text-white transition-colors">
              <RefreshCw className="size-5" />
            </button>
          </div>

          <div className="flex flex-wrap gap-2">
            {prompts.map((prompt, i) => (
              <button
                key={prompt + i}
                onClick={() => setInputText(prev => prev ? `${prev}, ${prompt}` : prompt)}
                className={`px-4 py-2 rounded-lg text-xs font-bold tracking-wider transition-all hover:scale-105 active:scale-95 ${getPromptColor(i)}`}
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
            className="w-full py-8 rounded-full border-2 border-zinc-800 bg-zinc-900/50 hover:bg-zinc-800 text-zinc-500 hover:text-white font-black tracking-[0.3em] text-xl transition-all disabled:opacity-50"
          >
            {isGenerating ? 'GENERATING...' : 'GENERATE TRACK'}
          </Button>
        </div>

        {/* Results Area */}
        {result && (
          <div className="mt-8 p-6 bg-zinc-900/80 rounded-3xl border border-zinc-800 animate-in fade-in slide-in-from-bottom-4 duration-500 z-10 relative">
            <h3 className="text-gold font-bold mb-2 flex items-center gap-2">
              <Music2 className="size-4" />
              TRACK SUMMARY
            </h3>
            <p className="text-zinc-300 mb-6 italic">{result.summary}</p>

            <h3 className="text-gold font-bold mb-4 flex items-center gap-2">
              <LayoutGrid className="size-4" />
              LYRIC SHEET
            </h3>
            <pre className="text-zinc-400 font-mono text-sm whitespace-pre-wrap leading-relaxed">
              {result.lyrics}
            </pre>
          </div>
        )}
      </div>
    </div>
  );
}

function DropdownItem({ label, icon, data, onSelect }: { label: string, icon: any, data: any, onSelect: (val: string) => void }) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" className="rounded-full bg-zinc-900/50 border-zinc-800 hover:bg-zinc-800 text-zinc-400 font-bold px-4">
          {label}
          <ChevronDown className="size-4 ml-2" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="bg-zinc-900 border-zinc-800 text-zinc-300 min-w-[200px]">
        {Object.entries(data).map(([category, items]) => (
          <DropdownMenuSub key={category}>
            <DropdownMenuSubTrigger className="hover:bg-zinc-800 focus:bg-zinc-800">
              {category}
            </DropdownMenuSubTrigger>
            <DropdownMenuSubContent className="bg-zinc-900 border-zinc-800 text-zinc-300">
              {(items as string[]).map(item => (
                <DropdownMenuItem
                  key={item}
                  onClick={() => onSelect(item)}
                  className="hover:bg-zinc-800 focus:bg-zinc-800 cursor-pointer"
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
