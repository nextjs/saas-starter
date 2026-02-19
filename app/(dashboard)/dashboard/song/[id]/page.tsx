'use client';

import { useState, useEffect } from 'react';
import {
  Music2,
  Save,
  Share2,
  Sparkles,
  ChevronLeft,
  Search,
  Check,
  Layout,
  Mic2,
  Volume2,
  History,
  Copy,
  Zap,
  RotateCcw
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { Input } from '@/components/ui/input';
import { Waveform } from '@/components/waveform';

export default function SongEditorPage() {
  const [title, setTitle] = useState('Midnight Echoes');
  const [lyrics, setLyrics] = useState(`[Verse 1]
The city lights are fading out
A silent scream, a shadow of a doubt
Walking through the neon rain
Hiding all the pleasure and the pain

[Chorus]
Oh, the echoes in the midnight sky
Searching for a reason, asking why
We're just ghosts in a digital dream
Nothing is ever as it seems`);
  const [activeTab, setActiveTab] = useState<'lyrics' | 'ai' | 'audio'>('lyrics');
  const [isSaving, setIsSaving] = useState(false);

  const handleSave = () => {
    setIsSaving(true);
    setTimeout(() => setIsSaving(false), 1000);
  };

  const getSyllableCount = (text: string) => {
    // Very simple approximation
    return text.split(' ').filter(word => word.length > 0).length * 1.5;
  };

  return (
    <div className="flex flex-col h-[calc(100vh-120px)] lg:h-[calc(100vh-140px)] bg-black overflow-hidden relative">
      {/* Editor Header */}
      <div className="flex items-center justify-between px-6 py-4 border-b border-zinc-900 bg-zinc-950/50 backdrop-blur-md sticky top-0 z-20">
        <div className="flex items-center gap-4 min-w-0">
          <Link href="/dashboard/library">
            <Button variant="ghost" size="icon" className="text-zinc-500 hover:text-white rounded-xl bg-zinc-900/50 border border-zinc-800">
              <ChevronLeft className="size-5" />
            </Button>
          </Link>
          <div className="flex flex-col min-w-0">
            <input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="bg-transparent border-none text-white font-black uppercase italic tracking-tight focus:ring-0 p-0 text-sm sm:text-xl w-full truncate"
            />
            <span className="text-[10px] text-zinc-600 font-bold uppercase tracking-[0.2em] flex items-center gap-1.5 mt-0.5">
              {isSaving ? (
                <span className="flex items-center gap-1.5"><RotateCcw className="size-3 animate-spin" /> Saving changes...</span>
              ) : (
                <span className="flex items-center gap-1.5"><Check className="size-3 text-gold" /> Cloud Synced</span>
              )}
            </span>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <Button
            onClick={handleSave}
            variant="ghost"
            className="text-zinc-400 hover:text-white hidden sm:flex font-black uppercase tracking-widest text-[10px] bg-zinc-900/30 border border-zinc-900 px-4 h-10 rounded-xl"
          >
            <History className="size-4 mr-2 text-zinc-600" />
            History
          </Button>
          <Button className="bg-gold text-black hover:bg-gold/90 rounded-xl font-black uppercase tracking-widest text-[10px] px-6 h-10 shadow-lg shadow-gold/20">
            <Share2 className="size-4 sm:mr-2" />
            <span className="hidden sm:inline">Export Draft</span>
          </Button>
        </div>
      </div>

      {/* Desktop Layout */}
      <div className="flex-1 flex overflow-hidden">
        {/* Editor Main */}
        <div className="flex-1 flex flex-col min-w-0 bg-[#050508]">
          <div className="flex-1 overflow-y-auto p-6 sm:p-12 lg:p-20 scrollbar-hide">
            <div className="max-w-3xl mx-auto space-y-12">
              <textarea
                value={lyrics}
                onChange={(e) => setLyrics(e.target.value)}
                className="w-full bg-transparent text-zinc-300 font-mono text-base sm:text-lg focus:ring-0 border-none resize-none leading-[2.5] italic"
                placeholder="The first line of your next masterpiece..."
                rows={20}
              />
            </div>
          </div>

          {/* Editor Footer / Stats */}
          <div className="h-12 border-t border-zinc-900 bg-zinc-950 px-6 flex items-center justify-between text-[10px] font-black uppercase tracking-[0.3em] text-zinc-600">
            <div className="flex gap-6">
              <span>Lines: {lyrics.split('\n').length}</span>
              <span>Words: {lyrics.split(/\s+/).filter(Boolean).length}</span>
              <span>Est. Duration: 3:45</span>
            </div>
            <div className="flex items-center gap-2">
               <div className="size-2 rounded-full bg-gold animate-pulse" />
               LIVE ANALYTICS
            </div>
          </div>
        </div>

        {/* Right Sidebar - Tools */}
        <div className="hidden lg:flex w-96 border-l border-zinc-900 bg-zinc-950 flex-col overflow-y-auto">
          <div className="p-8 space-y-10">
            {/* AI Generator Box */}
            <div className="space-y-4">
               <h3 className="text-[11px] font-black uppercase tracking-[0.4em] text-zinc-500 flex items-center gap-2">
                <Zap className="size-4 text-gold fill-gold" />
                LYRIC SPARK
              </h3>
              <div className="p-6 rounded-3xl bg-zinc-900 border-2 border-zinc-800 shadow-xl relative overflow-hidden group">
                <div className="absolute inset-0 bg-gradient-to-br from-gold/5 to-transparent pointer-events-none" />
                <div className="relative z-10 space-y-4">
                  <p className="text-xs text-zinc-400 italic leading-relaxed">"Add a bridge about the silence between heartbeats..."</p>
                  <Button className="w-full bg-gold/10 text-gold hover:bg-gold hover:text-black rounded-xl text-[10px] font-black uppercase tracking-widest h-11 border border-gold/20 transition-all">
                    Generate Variation
                  </Button>
                </div>
              </div>
            </div>

            {/* Rhyme Finder */}
            <div className="space-y-6">
              <h3 className="text-[11px] font-black uppercase tracking-[0.4em] text-zinc-500 flex items-center gap-2">
                <Search className="size-4" />
                RHYME ENGINE
              </h3>
              <div className="space-y-4">
                <div className="relative">
                  <Input
                    placeholder="Word to rhyme..."
                    className="bg-zinc-900 border-2 border-zinc-800 text-white rounded-xl h-12 text-xs px-10 italic focus:border-gold transition-all"
                  />
                  <Search className="absolute left-4 top-1/2 -translate-y-1/2 size-4 text-zinc-600" />
                </div>
                <div className="grid grid-cols-2 gap-2">
                  {['Sky', 'Fly', 'Bye', 'My', 'High', 'Cry'].map(word => (
                    <div key={word} className="p-3 bg-zinc-900 border border-zinc-800 rounded-xl text-[10px] text-zinc-400 font-black uppercase tracking-widest hover:border-gold hover:text-white transition-all cursor-pointer flex items-center justify-between group">
                      {word}
                      <Copy className="size-3 opacity-0 group-hover:opacity-100 transition-opacity" />
                    </div>
                  ))}
                </div>
              </div>
            </div>

             {/* Structure */}
             <div className="space-y-6">
              <h3 className="text-[11px] font-black uppercase tracking-[0.4em] text-zinc-500 flex items-center gap-2">
                <Layout className="size-4" />
                TRACK STRUCTURE
              </h3>
              <div className="space-y-3">
                {[
                  { label: 'VERSE 1', progress: 100, color: 'bg-emerald-500' },
                  { label: 'CHORUS', progress: 100, color: 'bg-gold' },
                  { label: 'VERSE 2', progress: 40, color: 'bg-emerald-500' },
                  { label: 'BRIDGE', progress: 0, color: 'bg-rose-500' }
                ].map((item, i) => (
                  <div key={item.label} className="p-4 bg-zinc-900/30 border border-zinc-900 rounded-2xl space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-black uppercase tracking-widest text-zinc-400">{item.label}</span>
                      <span className="text-[9px] font-black text-zinc-700">{item.progress}%</span>
                    </div>
                    <div className="h-1 w-full bg-zinc-950 rounded-full overflow-hidden">
                      <div className={`h-full rounded-full transition-all duration-1000 ${item.color}`} style={{ width: `${item.progress}%` }} />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Audio Preview Mini */}
            <div className="space-y-6 pt-4">
               <h3 className="text-[11px] font-black uppercase tracking-[0.4em] text-zinc-500 flex items-center gap-2">
                <Volume2 className="size-4" />
                AUDIO CONTEXT
              </h3>
              <div className="bg-zinc-900/50 border border-zinc-900 p-6 rounded-[2rem] space-y-4">
                <Waveform active className="h-8" />
                <div className="flex items-center justify-center gap-4">
                   <Button variant="ghost" size="icon" className="size-10 rounded-full border border-zinc-800 text-zinc-400">
                     <Mic2 className="size-4" />
                   </Button>
                   <Button size="icon" className="size-12 rounded-full bg-gold text-black shadow-lg shadow-gold/20">
                     <Volume2 className="size-5" />
                   </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile Bottom Navigation (Tabs) */}
      <div className="lg:hidden fixed bottom-0 left-0 right-0 bg-zinc-950 border-t border-zinc-900 h-16 flex items-center justify-around px-6 z-50">
        {[
          { id: 'lyrics', icon: Music2, label: 'Editor' },
          { id: 'ai', icon: Zap, label: 'Assistant' },
          { id: 'audio', icon: Volume2, label: 'Audio' }
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            className={`flex flex-col items-center gap-1.5 transition-all ${
              activeTab === tab.id ? 'text-gold' : 'text-zinc-600'
            }`}
          >
            <tab.icon className="size-5" />
            <span className="text-[8px] font-black uppercase tracking-[0.2em]">{tab.label}</span>
          </button>
        ))}
      </div>
    </div>
  );
}
