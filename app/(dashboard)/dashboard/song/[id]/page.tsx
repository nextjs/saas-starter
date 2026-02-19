'use client';

import { useState, useEffect } from 'react';
import {
  Music2,
  Save,
  Share2,
  Wand2,
  Sparkles,
  Mic2,
  History,
  ChevronLeft,
  Search,
  Check,
  MoreVertical,
  Type,
  Layout,
  Plus
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { Input } from '@/components/ui/input';

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
  const [activeTab, setActiveTab] = useState<'lyrics' | 'ai'>('lyrics');
  const [isSaving, setIsSaving] = useState(false);

  const handleSave = () => {
    setIsSaving(true);
    setTimeout(() => setIsSaving(false), 1000);
  };

  return (
    <div className="flex flex-col h-[calc(100vh-120px)] lg:h-[calc(100vh-140px)] bg-black overflow-hidden relative">
      {/* Editor Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-zinc-900 bg-zinc-950/50 backdrop-blur-md sticky top-0 z-20">
        <div className="flex items-center gap-3 min-w-0">
          <Link href="/dashboard/library">
            <Button variant="ghost" size="icon" className="text-zinc-500 hover:text-white rounded-full">
              <ChevronLeft className="size-5" />
            </Button>
          </Link>
          <div className="flex flex-col min-w-0">
            <input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="bg-transparent border-none text-white font-black uppercase italic tracking-tight focus:ring-0 p-0 text-sm sm:text-lg w-full truncate"
            />
            <span className="text-[10px] text-zinc-600 font-bold uppercase tracking-widest flex items-center gap-1">
              {isSaving ? 'Saving...' : <><Check className="size-3 text-emerald-500" /> All changes saved</>}
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Button
            onClick={handleSave}
            variant="ghost"
            size="sm"
            className="text-zinc-400 hover:text-white hidden sm:flex font-bold uppercase tracking-widest text-[10px]"
          >
            <Save className="size-4 mr-2" />
            Save
          </Button>
          <Button className="bg-gold text-black hover:bg-yellow-500 rounded-full font-black uppercase tracking-widest text-[10px] px-4 h-9 shadow-lg shadow-gold/20">
            <Share2 className="size-3 sm:size-4 sm:mr-2" />
            <span className="hidden sm:inline">Export</span>
          </Button>
        </div>
      </div>

      {/* Mobile Tabs */}
      <div className="flex lg:hidden border-b border-zinc-900 bg-zinc-950">
        <button
          onClick={() => setActiveTab('lyrics')}
          className={`flex-1 py-3 text-[10px] font-black uppercase tracking-[0.2em] transition-all relative ${
            activeTab === 'lyrics' ? 'text-gold' : 'text-zinc-600'
          }`}
        >
          Lyrics
          {activeTab === 'lyrics' && <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-gold" />}
        </button>
        <button
          onClick={() => setActiveTab('ai')}
          className={`flex-1 py-3 text-[10px] font-black uppercase tracking-[0.2em] transition-all relative ${
            activeTab === 'ai' ? 'text-gold' : 'text-zinc-600'
          }`}
        >
          AI Assistant
          {activeTab === 'ai' && <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-gold" />}
        </button>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 flex overflow-hidden">
        {/* Lyrics Editor */}
        <div className={`flex-1 flex flex-col min-w-0 ${activeTab === 'ai' ? 'hidden lg:flex' : 'flex'}`}>
          <textarea
            value={lyrics}
            onChange={(e) => setLyrics(e.target.value)}
            className="flex-1 w-full bg-black text-zinc-300 font-mono text-sm sm:text-base p-6 sm:p-10 focus:ring-0 border-none resize-none leading-relaxed"
            placeholder="Start writing your masterpiece..."
          />
        </div>

        {/* AI Sidebar */}
        <div className={`w-full lg:w-80 border-l border-zinc-900 bg-zinc-950/30 flex flex-col overflow-y-auto ${activeTab === 'lyrics' ? 'hidden lg:flex' : 'flex'}`}>
          <div className="p-6 space-y-8 pb-32 lg:pb-8">
            {/* AI Generator Box */}
            <div className="p-5 rounded-2xl bg-zinc-900 border border-zinc-800 shadow-xl relative overflow-hidden group">
              <div className="absolute inset-0 bg-gradient-to-br from-gold/5 to-transparent pointer-events-none" />
              <div className="relative z-10">
                <div className="flex items-center gap-2 mb-4">
                  <Sparkles className="size-4 text-gold" />
                  <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-white">AI Suggestion</h3>
                </div>
                <p className="text-sm text-zinc-400 italic mb-4 leading-relaxed">"Maybe add a bridge here about the silence between the heartbeats?"</p>
                <Button size="sm" className="w-full bg-zinc-800 text-zinc-300 hover:text-white rounded-xl text-[10px] font-black uppercase tracking-widest h-9 border border-zinc-700">
                  Generate Line
                </Button>
              </div>
            </div>

            {/* Rhyme Finder */}
            <div className="space-y-4">
              <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-500 flex items-center gap-2">
                <Search className="size-3" />
                Rhyme Finder
              </h3>
              <div className="space-y-3">
                <Input
                  placeholder="Word to rhyme..."
                  className="bg-zinc-900 border-zinc-800 text-white rounded-xl h-12 text-xs px-4"
                />
                <div className="flex flex-wrap gap-2">
                  {['Sky', 'Fly', 'Bye', 'My', 'High', 'Cry', 'Why', 'Try'].map(word => (
                    <span key={word} className="px-4 py-2 bg-zinc-900 border border-zinc-800 rounded-xl text-[10px] text-zinc-400 font-black uppercase tracking-widest hover:border-gold hover:text-white transition-all cursor-pointer">
                      {word}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            {/* Structure Guide */}
            <div className="space-y-4">
              <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-500 flex items-center gap-2">
                <Layout className="size-3" />
                Song Structure
              </h3>
              <div className="space-y-2">
                {['Verse 1', 'Chorus', 'Verse 2', 'Chorus', 'Bridge', 'Chorus', 'Outro'].map((part, i) => (
                  <div key={part + i} className="flex items-center justify-between p-4 bg-zinc-900/30 border border-zinc-900 rounded-2xl group cursor-pointer hover:bg-zinc-900/50 transition-colors">
                    <span className="text-[10px] font-black uppercase tracking-widest text-zinc-400 group-hover:text-gold transition-colors">{part}</span>
                    <div className="h-1.5 w-16 bg-zinc-800 rounded-full overflow-hidden">
                      <div className={`h-full rounded-full transition-all duration-500 ${i % 2 === 0 ? 'bg-gold w-3/4' : 'bg-rose-500 w-1/2'}`} />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Floating Action Button (Mobile Only) */}
      {activeTab === 'lyrics' && (
        <button
          onClick={() => setActiveTab('ai')}
          className="lg:hidden fixed bottom-24 right-6 size-14 bg-gold text-black rounded-full shadow-2xl flex items-center justify-center animate-bounce shadow-gold/20 z-50"
        >
          <Sparkles className="size-6" />
        </button>
      )}
    </div>
  );
}
