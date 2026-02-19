'use client';

import { QuickstartCard } from '@/components/quickstart-card';
import { History, Music2, Clock, ArrowRight, LayoutGrid } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Link from 'next/link';

const RECENT_WORKS = [
  { id: '1', title: 'Neon Shadows', genre: 'Synthwave', date: '2h ago' },
  { id: '2', title: 'Summer Breeze', genre: 'Acoustic Pop', date: '5h ago' },
  { id: '3', title: 'Digital Rebellion', genre: 'Industrial Techno', date: '1d ago' },
];

export default function DashboardPage() {
  return (
    <div className="min-h-screen bg-[#050508] text-white pb-32">
      {/* Top Navigation / Status (Mobile Optimized) */}
      <div className="w-full max-w-5xl mx-auto px-6 py-8 flex items-center justify-between lg:border-b lg:border-zinc-900/50 mb-12">
        <div className="flex flex-col">
          <h2 className="text-[10px] font-black text-zinc-600 uppercase tracking-[0.4em] italic mb-1">DASHBOARD</h2>
          <h1 className="text-2xl font-black text-white uppercase italic tracking-tight">LyricFlow Studio</h1>
        </div>
        <div className="flex items-center gap-4">
          <div className="hidden sm:flex items-center gap-2 px-4 py-2 rounded-xl bg-zinc-900 border border-zinc-800">
            <div className="size-2 rounded-full bg-[#fbbf24] animate-pulse" />
            <span className="text-[9px] font-black text-zinc-400 uppercase tracking-widest">AI ONLINE</span>
          </div>
          <button className="p-3 bg-zinc-900 border border-zinc-800 rounded-xl">
             <LayoutGrid className="size-5 text-zinc-400" />
          </button>
        </div>
      </div>

      {/* QUICK START Section */}
      <QuickstartCard />

      {/* Recent Works Section */}
      <div className="w-full max-w-5xl mx-auto px-6 mt-20">
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-3">
            <History className="size-6 text-[#fbbf24]" />
            <h2 className="text-xl font-black text-white uppercase italic tracking-widest">Recent Works</h2>
          </div>
          <Link href="/dashboard/library">
            <Button variant="link" className="text-[#fbbf24] text-[10px] font-black uppercase tracking-[0.2em] p-0 h-auto hover:no-underline hover:text-white transition-colors">
              VIEW LIBRARY
              <ArrowRight className="size-3 ml-2" />
            </Button>
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {RECENT_WORKS.map((work) => (
            <Link href={`/dashboard/song/${work.id}`} key={work.id} className="bg-[#0c0c14] border-2 border-zinc-900 p-6 rounded-[2rem] hover:border-[#fbbf24]/20 transition-all cursor-pointer group hover:translate-y-[-4px]">
              <div className="flex items-center gap-4 mb-4">
                <div className="p-4 bg-zinc-900 rounded-2xl group-hover:bg-[#fbbf24]/10 transition-colors">
                  <Music2 className="size-6 text-zinc-500 group-hover:text-[#fbbf24] transition-colors" />
                </div>
                <div className="min-w-0">
                  <h3 className="text-lg font-black text-white truncate uppercase italic mb-1">{work.title}</h3>
                  <p className="text-[10px] text-zinc-600 font-black tracking-widest uppercase">{work.genre}</p>
                </div>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-[10px] text-zinc-700 font-black uppercase tracking-widest">
                  <Clock className="size-3" />
                  {work.date}
                </div>
                <div className="size-8 rounded-full border border-zinc-800 flex items-center justify-center group-hover:bg-white group-hover:border-white transition-all">
                  <ArrowRight className="size-4 text-zinc-800 group-hover:text-black" />
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
