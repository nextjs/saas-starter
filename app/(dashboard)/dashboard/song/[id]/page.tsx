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
  Layout
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
    <div className="flex flex-col h-[calc(100vh-120px)] lg:h-[calc(100vh-140px)] bg-black overflow-hidden">
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
          <Button className="bg-gold text-black hover:bg-yellow-500 rounded-full font-black uppercase tracking-widest text-[10px] px-4 h-9">
            <Share2 className="size-3 sm:size-4 sm:mr-2" />
            <span className="hidden sm:inline">Export</span>
          </Button>
        </div>
      </div>

      {/* Mobile Tabs */}
      <div className="flex lg:hidden border-b border-zinc-900">
        <button
          onClick={() => setActiveTab('lyrics')}
          className={`flex-1 py-3 text-[10px] font-black uppercase tracking-[0.2em] transition-all ${
            activeTab === 'lyrics' ? 'text-gold border-b-2 border-gold' : 'text-zinc-600'
          }`}
        >
          Lyrics
        </button>
        <button
          onClick={() => setActiveTab('ai')}
          className={`flex-1 py-3 text-[10px] font-black uppercase tracking-[0.2em] transition-all ${
            activeTab === 'ai' ? 'text-gold border-b-2 border-gold' : 'text-zinc-600'
          }`}
        >
          AI Assistant
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
          <div className="p-6 space-y-8">
            {/* AI Generator Box */}
            <div className="p-5 rounded-2xl bg-zinc-900 border border-zinc-800 shadow-xl">
              <div className="flex items-center gap-2 mb-4">
                <Sparkles className="size-4 text-gold" />
                <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-white">AI Suggestion</h3>
              </div>
              <p className="text-sm text-zinc-400 italic mb-4">"Maybe add a bridge here about the silence between the heartbeats?"</p>
              <Button size="sm" className="w-full bg-zinc-800 text-zinc-300 hover:text-white rounded-xl text-[10px] font-black uppercase tracking-widest h-9">
                Generate Line
              </Button>
            </div>

            {/* Rhyme Finder */}
            <div>
              <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-500 mb-4 flex items-center gap-2">
                <Search className="size-3" />
                Rhyme Finder
              </h3>
              <div className="space-y-3">
                <Input
                  placeholder="Word to rhyme..."
                  className="bg-zinc-900 border-zinc-800 text-white rounded-xl h-10 text-xs"
                />
                <div className="flex flex-wrap gap-2">
                  {['Sky', 'Fly', 'Bye', 'My', 'High', 'Cry'].map(word => (
                    <span key={word} className="px-3 py-1.5 bg-zinc-900 border border-zinc-800 rounded-lg text-[10px] text-zinc-400 font-bold hover:border-gold hover:text-white transition-all cursor-pointer">
                      {word}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            {/* Visual Guide */}
            <div>
              <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-500 mb-4 flex items-center gap-2">
                <Layout className="size-3" />
                Structure
              </h3>
              <div className="space-y-2">
                {['Verse 1', 'Chorus', 'Verse 2', 'Chorus', 'Bridge', 'Chorus', 'Outro'].map((part, i) => (
                  <div key={part + i} className="flex items-center justify-between p-3 bg-zinc-900/50 border border-zinc-900 rounded-xl">
                    <span className="text-[10px] font-bold text-zinc-400">{part}</span>
                    <div className="h-1 w-12 bg-zinc-800 rounded-full">
                      <div className="h-full bg-gold rounded-full w-3/4" />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
