'use client';

import { useState } from 'react';
import {
  Play,
  Pause,
  Download,
  Save,
  Share2,
  RotateCcw,
  Music2,
  Mic2,
  ListMusic,
  Activity,
  ChevronDown
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Waveform } from './waveform';
import { cn } from '@/lib/utils';

interface QuickStartResultsProps {
  onReset: () => void;
  selections: any;
  prompt: string;
}

export function QuickStartResults({ onReset, selections, prompt }: QuickStartResultsProps) {
  const [isPlaying, setIsPlaying] = useState(false);

  return (
    <div className="w-full max-w-5xl mx-auto px-6 animate-in fade-in slide-in-from-bottom-8 duration-700">
      <div className="bg-[#0c0c14] border-2 border-zinc-900 rounded-[3rem] p-8 sm:p-12 relative overflow-hidden">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6 mb-12">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-emerald-500/10 border-2 border-emerald-500/20 rounded-2xl">
              <Activity className="size-6 text-emerald-500" />
            </div>
            <div className="flex flex-col">
              <h2 className="text-sm font-black tracking-[0.4em] text-white uppercase italic">GENERATION COMPLETE</h2>
              <span className="text-[10px] font-bold text-zinc-600 tracking-widest uppercase">SEED: #8F2A9L-2024</span>
            </div>
          </div>
          <div className="flex items-center gap-3">
             <button onClick={onReset} className="flex items-center gap-2 px-6 py-3 rounded-xl border-2 border-zinc-900 bg-zinc-900/50 text-[10px] font-black tracking-widest uppercase hover:bg-zinc-800 transition-all">
                <RotateCcw className="size-3" />
                RE-REGENERATE
             </button>
             <button className="p-3 rounded-xl border-2 border-zinc-900 bg-zinc-900/50">
                <Share2 className="size-4 text-zinc-400" />
             </button>
          </div>
        </div>

        {/* Player Section */}
        <div className="bg-[#050508] border-2 border-zinc-900 rounded-[2.5rem] p-8 sm:p-12 mb-12 relative overflow-hidden group">
          <div className="absolute top-0 right-0 p-8">
             <div className="px-4 py-1.5 rounded-full bg-[#fbbf24]/10 border border-[#fbbf24]/20 text-[9px] font-black text-[#fbbf24] tracking-widest uppercase">
                AI MASTERED
             </div>
          </div>

          <div className="flex flex-col items-center mb-10">
            <h3 className="text-3xl sm:text-5xl font-black italic tracking-tighter text-white uppercase mb-4 text-center">
              {prompt.slice(0, 30)}...
            </h3>
            <div className="flex flex-wrap justify-center gap-2">
               {selections.GENRE.map((g: string) => (
                 <span key={g} className="px-3 py-1 rounded-md bg-zinc-900 text-[10px] font-black text-zinc-500 tracking-widest uppercase">{g}</span>
               ))}
            </div>
          </div>

          <div className="mb-10">
            <Waveform active={isPlaying} className="h-24 sm:h-32 mb-6" />
            <div className="flex items-center justify-between text-[10px] font-black tracking-widest text-zinc-700 uppercase">
              <span>0:42</span>
              <span className="text-[#fbbf24] animate-pulse">L-R STEREO ANALYZED</span>
              <span>3:15</span>
            </div>
          </div>

          <div className="flex justify-center">
            <button
              onClick={() => setIsPlaying(!isPlaying)}
              className="size-24 sm:size-32 rounded-full bg-[#5850ec] flex items-center justify-center transition-all hover:scale-110 active:scale-95 shadow-2xl shadow-[#5850ec]/40 group"
            >
              {isPlaying ? (
                <Pause className="size-10 sm:size-14 text-white fill-white" />
              ) : (
                <Play className="size-10 sm:size-14 text-white fill-white ml-2" />
              )}
            </button>
          </div>
        </div>

        {/* Content Tabs / Info */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Lyrics Preview */}
          <div className="bg-[#050508]/50 border-2 border-zinc-900 rounded-[2rem] p-8">
            <div className="flex items-center justify-between mb-8">
               <div className="flex items-center gap-3">
                 <ListMusic className="size-5 text-indigo-400" />
                 <h4 className="text-[10px] font-black tracking-[0.4em] text-zinc-500 uppercase italic">LYRIC SHEET</h4>
               </div>
               <button className="text-[9px] font-black text-[#5850ec] tracking-widest uppercase flex items-center gap-2">
                  FULL VIEW
                  <ChevronDown className="size-3" />
               </button>
            </div>
            <div className="space-y-6 max-h-[300px] overflow-y-auto pr-4 scrollbar-thin scrollbar-thumb-zinc-800">
               <div className="space-y-2">
                 <span className="text-[9px] font-black text-zinc-700 tracking-widest uppercase">[VERSE 1]</span>
                 <p className="text-lg sm:text-xl font-black italic uppercase leading-tight text-white/80">
                   Neon lights reflect the rain<br />
                   Driving through the digital pain<br />
                   Electric hearts beat in the dark<br />
                   Searching for a human spark
                 </p>
               </div>
               <div className="space-y-2">
                 <span className="text-[9px] font-black text-rose-500 tracking-widest uppercase">[CHORUS]</span>
                 <p className="text-xl sm:text-2xl font-black italic uppercase leading-tight text-white">
                   Oh, we're the ghosts in the machine<br />
                   Living out a synthetic dream
                 </p>
               </div>
            </div>
          </div>

          {/* Technical Specs */}
          <div className="space-y-8">
            <div className="bg-[#050508]/50 border-2 border-zinc-900 rounded-[2rem] p-8">
               <div className="flex items-center gap-3 mb-8">
                 <Music2 className="size-5 text-[#fbbf24]" />
                 <h4 className="text-[10px] font-black tracking-[0.4em] text-zinc-500 uppercase italic">AUDIO PROFILE</h4>
               </div>
               <div className="space-y-4">
                  <SpecRow label="KEY" value="E MINOR" />
                  <SpecRow label="BPM" value="128" />
                  <SpecRow label="LOUDNESS" value="-14.2 LUFS" />
                  <SpecRow label="DYNAMICS" value="HIGH" />
               </div>
            </div>

            <div className="flex gap-4">
               <Button className="flex-1 h-20 rounded-2xl bg-[#fbbf24] hover:bg-[#fbbf24]/90 text-black font-black tracking-[0.2em] uppercase transition-all active:scale-[0.98]">
                  <Save className="size-4 mr-2" />
                  SAVE PROJECT
               </Button>
               <Button variant="outline" className="flex-1 h-20 rounded-2xl border-zinc-800 text-zinc-400 hover:bg-zinc-900 font-black tracking-[0.2em] uppercase transition-all active:scale-[0.98]">
                  <Download className="size-4 mr-2" />
                  STEMS (.WAV)
               </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function SpecRow({ label, value }: { label: string, value: string }) {
  return (
    <div className="flex items-center justify-between border-b border-zinc-900/50 pb-4 last:border-0 last:pb-0">
       <span className="text-[10px] font-black text-zinc-700 tracking-widest uppercase">{label}</span>
       <span className="text-xs font-black text-white tracking-widest uppercase">{value}</span>
    </div>
  );
}
