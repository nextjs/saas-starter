'use client';

import Link from 'next/link';
import {
  Music2,
  Library,
  Search,
  MoreVertical,
  Play,
  Clock,
  ArrowRight,
  Filter,
  LayoutGrid,
  List,
  Sparkles,
  Zap
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';
import { useState } from 'react';

const DRAFTS = [
  { id: 1, title: 'Midnight Echoes', genre: 'Synthpop', date: '2 hours ago', status: 'Completed', bpm: 124, key: 'Am' },
  { id: 2, title: 'Summer Rain', genre: 'Indie Pop', date: 'Yesterday', status: 'Draft', bpm: 98, key: 'C' },
  { id: 3, title: 'Neon Jungle', genre: 'Electronic', date: '3 days ago', status: 'In Progress', bpm: 128, key: 'F#m' },
  { id: 4, title: 'Quiet Confession', genre: 'Acoustic', date: '1 week ago', status: 'Completed', bpm: 75, key: 'G' },
  { id: 5, title: 'Celestial Triangle', genre: 'Ambient', date: '2 weeks ago', status: 'Draft', bpm: 110, key: 'D' },
];

export default function LibraryPage() {
  const [items] = useState(DRAFTS); // In real app, this would be from API

  return (
    <div className="flex-1 min-h-screen bg-[#050508] text-white pb-32">
      {/* Premium Header */}
      <div className="w-full max-w-7xl mx-auto px-6 py-12 flex flex-col md:flex-row md:items-end justify-between gap-8 border-b border-zinc-900/50 mb-12">
        <div className="flex flex-col">
          <h2 className="text-[10px] font-black text-zinc-600 uppercase tracking-[0.4em] italic mb-2">MY COLLECTION</h2>
          <h1 className="text-4xl sm:text-6xl font-black text-white uppercase italic tracking-tighter leading-none">
            Audio <span className="text-[#5850ec]">Archive</span>
          </h1>
        </div>

        <div className="flex items-center gap-4">
           <div className="hidden sm:flex items-center p-1 bg-zinc-900/50 border border-zinc-800 rounded-xl">
              <button className="p-2 bg-zinc-800 text-white rounded-lg"><LayoutGrid className="size-4" /></button>
              <button className="p-2 text-zinc-600 hover:text-white transition-colors"><List className="size-4" /></button>
           </div>
           <Link href="/dashboard">
             <Button className="h-14 px-8 rounded-2xl bg-[#5850ec] hover:bg-[#5850ec]/90 text-white font-black tracking-widest uppercase italic transition-all shadow-2xl shadow-[#5850ec]/20 active:scale-[0.98]">
               NEW PROJECT
             </Button>
           </Link>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6">
        {items.length > 0 ? (
          <div className="space-y-12">
            {/* Search & Filter Bar */}
            <div className="flex flex-col sm:flex-row gap-4 items-center">
              <div className="relative flex-1 w-full">
                <Search className="absolute left-6 top-1/2 -translate-y-1/2 size-5 text-zinc-700" />
                <Input
                  placeholder="SEARCH BY TITLE, GENRE OR SEED..."
                  className="bg-[#0c0c14] border-2 border-zinc-900 text-white rounded-[2rem] pl-16 h-16 focus:border-[#5850ec] transition-all font-black italic tracking-widest text-[10px] uppercase"
                />
              </div>
              <Button variant="outline" className="w-full sm:w-auto h-16 px-8 rounded-[2rem] border-2 border-zinc-900 bg-transparent text-zinc-500 hover:text-white hover:bg-zinc-900 transition-all font-black tracking-widest uppercase italic">
                <Filter className="size-4 mr-3" />
                FILTERS
              </Button>
            </div>

            {/* Premium Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {items.map((draft) => (
                <Link href={`/dashboard/song/${draft.id}`} key={draft.id} className="group">
                  <div className="bg-[#0c0c14] border-2 border-zinc-900 rounded-[2.5rem] p-8 hover:border-[#5850ec]/30 transition-all duration-500 relative overflow-hidden flex flex-col h-full active:scale-[0.98]">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-[#5850ec]/5 blur-[60px] group-hover:bg-[#5850ec]/10 transition-colors" />
                    <div className="flex justify-between items-start mb-10">
                      <div className={cn(
                        "px-4 py-1.5 rounded-full text-[9px] font-black tracking-[0.2em] uppercase border",
                        draft.status === 'Completed' ? "border-emerald-500/20 bg-emerald-500/5 text-emerald-500" :
                        draft.status === 'In Progress' ? "border-indigo-500/20 bg-indigo-500/5 text-indigo-500" :
                        "border-zinc-800 bg-zinc-900/50 text-zinc-500"
                      )}>
                        {draft.status}
                      </div>
                      <button className="p-2 text-zinc-800 hover:text-white transition-colors">
                         <MoreVertical className="size-5" />
                      </button>
                    </div>
                    <div className="flex-1 mb-10">
                      <div className="flex items-center gap-4 mb-4">
                         <div className="p-4 bg-zinc-900/50 rounded-2xl group-hover:bg-[#5850ec]/10 transition-colors">
                            <Music2 className="size-6 text-zinc-600 group-hover:text-[#5850ec]" />
                         </div>
                         <div>
                            <h3 className="text-2xl font-black text-white uppercase italic tracking-tighter leading-tight group-hover:text-[#5850ec] transition-colors truncate max-w-[200px]">
                              {draft.title}
                            </h3>
                            <p className="text-[10px] font-black text-zinc-600 tracking-[0.3em] uppercase">{draft.genre}</p>
                         </div>
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                         <div className="bg-zinc-950/50 border border-zinc-900 rounded-xl p-3">
                            <span className="text-[8px] font-black text-zinc-700 block mb-1 uppercase tracking-widest">BPM / KEY</span>
                            <span className="text-[10px] font-black text-zinc-400 uppercase tracking-widest">{draft.bpm} / {draft.key}</span>
                         </div>
                         <div className="bg-zinc-950/50 border border-zinc-900 rounded-xl p-3">
                            <span className="text-[8px] font-black text-zinc-700 block mb-1 uppercase tracking-widest">CREATED</span>
                            <span className="text-[10px] font-black text-zinc-400 uppercase tracking-widest">{draft.date}</span>
                         </div>
                      </div>
                    </div>
                    <div className="flex items-center justify-between pt-6 border-t border-zinc-900">
                      <span className="text-[10px] font-black text-zinc-700 tracking-[0.2em] uppercase">ACCESS STUDIO</span>
                      <div className="size-10 rounded-full border-2 border-zinc-900 flex items-center justify-center group-hover:bg-white group-hover:border-white transition-all group-hover:scale-110">
                        <ArrowRight className="size-5 text-zinc-800 group-hover:text-black" />
                      </div>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        ) : (
          /* Empty State */
          <div className="flex flex-col items-center justify-center py-32 text-center animate-in fade-in zoom-in duration-700">
             <div className="p-10 rounded-full bg-zinc-900/50 border-2 border-zinc-800 mb-12 relative group">
                <div className="absolute inset-0 bg-[#5850ec]/10 blur-3xl opacity-0 group-hover:opacity-100 transition-opacity" />
                <Library className="size-16 text-zinc-700 group-hover:text-[#5850ec] transition-colors relative z-10" />
             </div>
             <h3 className="text-3xl sm:text-5xl font-black uppercase italic tracking-tighter mb-6">Archive is <span className="text-zinc-700">Empty</span></h3>
             <p className="text-zinc-600 text-lg sm:text-xl font-black uppercase italic tracking-tight mb-12 max-w-md opacity-60">
                Your future masterpieces are waiting to be generated.
             </p>
             <Link href="/dashboard">
                <Button className="h-20 px-12 rounded-2xl bg-[#5850ec] hover:bg-[#5850ec]/90 text-white font-black tracking-widest uppercase italic shadow-2xl shadow-[#5850ec]/20 transition-all active:scale-[0.98]">
                   <Zap className="size-5 mr-3 fill-current" />
                   INITIALIZE SESSION
                </Button>
             </Link>
          </div>
        )}
      </div>
    </div>
  );
}
