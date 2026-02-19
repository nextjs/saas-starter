'use client';

import {
  Plus,
  Clock,
  ArrowRight,
  Music2,
  Sparkles,
  Zap,
  Activity,
  ChevronRight,
  MonitorPlay,
  Mic2,
  ListMusic
} from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { QuickStart } from '@/components/quickstart';

const RECENT_WORKS = [
  { id: 1, title: 'MIDNIGHT ECHOES', genre: 'SYNTHPOP', status: 'COMPLETED', bpm: 124, key: 'Am' },
  { id: 2, title: 'SUMMER RAIN', genre: 'INDIE POP', status: 'DRAFT', bpm: 98, key: 'C' },
  { id: 3, title: 'NEON JUNGLE', genre: 'ELECTRONIC', status: 'IN PROGRESS', bpm: 128, key: 'F#m' },
];

export default function DashboardPage() {
  return (
    <div className="flex-1 min-h-screen bg-[#050508] text-white">
      {/* Studio Header */}
      <div className="w-full bg-[#08080c] border-b border-zinc-900/50">
        <div className="max-w-7xl mx-auto px-6 py-12 flex flex-col md:flex-row md:items-end justify-between gap-8">
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <span className="flex h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
              <span className="text-[10px] font-black text-emerald-500 uppercase tracking-[0.4em] italic">STUDIO ONLINE</span>
            </div>
            <h1 className="text-5xl md:text-7xl font-black uppercase italic tracking-tighter leading-none">
              LyricFlow <span className="text-[#5850ec]">Studio</span>
            </h1>
            <p className="text-zinc-600 font-black uppercase italic tracking-[0.2em] text-xs">
              AI-POWERED LYRIC PRODUCTION ENGINE v2.4.0
            </p>
          </div>

          <div className="flex items-center gap-4">
             <div className="flex flex-col items-end">
                <span className="text-[8px] font-black text-zinc-700 uppercase tracking-widest mb-1">CURRENT PLAN</span>
                <span className="px-4 py-1 rounded-full bg-zinc-900 border border-zinc-800 text-[10px] font-black text-zinc-400 uppercase tracking-widest">PRO ACCESS</span>
             </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
          {/* Main Workspace */}
          <div className="lg:col-span-8 space-y-12">
            <section>
              <div className="flex items-center justify-between mb-8">
                <div className="flex items-center gap-4">
                  <div className="size-10 rounded-xl bg-[#5850ec]/10 flex items-center justify-center border border-[#5850ec]/20">
                    <Zap className="size-5 text-[#5850ec] fill-[#5850ec]/20" />
                  </div>
                  <h2 className="text-2xl font-black uppercase italic tracking-tighter">Quick <span className="text-zinc-500">Initialize</span></h2>
                </div>
              </div>

              <QuickStart />
            </section>

            <section>
               <div className="flex items-center justify-between mb-8">
                <div className="flex items-center gap-4">
                  <div className="size-10 rounded-xl bg-indigo-500/10 flex items-center justify-center border border-indigo-500/20">
                    <MonitorPlay className="size-5 text-indigo-500" />
                  </div>
                  <h2 className="text-2xl font-black uppercase italic tracking-tighter">Recent <span className="text-zinc-500">Projects</span></h2>
                </div>
                <Link href="/dashboard/library" className="group flex items-center gap-2 text-[10px] font-black text-zinc-600 hover:text-white transition-colors uppercase tracking-widest">
                  VIEW ALL ARCHIVE <ChevronRight className="size-3 group-hover:translate-x-1 transition-transform" />
                </Link>
              </div>

              {RECENT_WORKS.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {RECENT_WORKS.map((work) => (
                    <Link key={work.id} href={`/dashboard/song/${work.id}`} className="group">
                      <div className="p-6 bg-[#0c0c14] border-2 border-zinc-900 rounded-[2rem] hover:border-[#5850ec]/30 transition-all active:scale-[0.98]">
                        <div className="flex justify-between items-start mb-6">
                          <div className={cn(
                            "px-3 py-1 rounded-full text-[8px] font-black tracking-widest uppercase",
                            work.status === 'COMPLETED' ? "bg-emerald-500/10 text-emerald-500" : "bg-zinc-900 text-zinc-600"
                          )}>
                            {work.status}
                          </div>
                          <Clock className="size-4 text-zinc-800" />
                        </div>
                        <h3 className="text-lg font-black uppercase italic tracking-tight mb-1 truncate group-hover:text-[#5850ec] transition-colors">{work.title}</h3>
                        <p className="text-[10px] font-black text-zinc-600 tracking-widest uppercase mb-4">{work.genre}</p>
                        <div className="flex items-center justify-between pt-4 border-t border-zinc-900/50">
                          <span className="text-[9px] font-black text-zinc-800 uppercase tracking-widest">{work.bpm} BPM / {work.key}</span>
                          <ArrowRight className="size-4 text-zinc-800 group-hover:text-white transition-colors" />
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>
              ) : (
                <div className="p-12 border-2 border-dashed border-zinc-900 rounded-[2.5rem] flex flex-col items-center justify-center text-center">
                   <div className="size-16 rounded-full bg-zinc-900 flex items-center justify-center mb-6">
                      <ListMusic className="size-6 text-zinc-700" />
                   </div>
                   <p className="text-zinc-600 font-black uppercase italic tracking-widest text-xs">NO RECENT PROJECTS FOUND</p>
                </div>
              )}
            </section>
          </div>

          {/* Sidebar / Stats */}
          <div className="lg:col-span-4 space-y-12">
            <section className="bg-gradient-to-br from-[#0c0c14] to-[#050508] border-2 border-zinc-900 rounded-[3rem] p-10 relative overflow-hidden group">
               <div className="absolute -top-24 -right-24 w-64 h-64 bg-[#5850ec]/5 blur-[100px] group-hover:bg-[#5850ec]/10 transition-colors" />
               <h3 className="text-[10px] font-black text-zinc-700 uppercase tracking-[0.4em] italic mb-6">ENGINE TELEMETRY</h3>

               <div className="space-y-8">
                  <div className="flex justify-between items-end">
                     <div>
                        <p className="text-[8px] font-black text-zinc-500 uppercase tracking-widest mb-1">TOTAL SESSIONS</p>
                        <p className="text-4xl font-black italic">142</p>
                     </div>
                     <div className="text-right">
                        <p className="text-[8px] font-black text-emerald-500 uppercase tracking-widest mb-1">+12% WEEKLY</p>
                        <Activity className="size-6 text-emerald-500 ml-auto" />
                     </div>
                  </div>

                  <div className="space-y-3 pt-8 border-t border-zinc-900">
                     <div className="flex justify-between items-center">
                        <span className="text-[9px] font-black text-zinc-600 uppercase tracking-widest">API LATENCY</span>
                        <span className="text-[9px] font-black text-white uppercase tracking-widest">24ms</span>
                     </div>
                     <div className="h-1 bg-zinc-900 rounded-full overflow-hidden">
                        <div className="h-full w-[85%] bg-[#5850ec]" />
                     </div>
                  </div>

                  <div className="space-y-3">
                     <div className="flex justify-between items-center">
                        <span className="text-[9px] font-black text-zinc-600 uppercase tracking-widest">MODEL STABILITY</span>
                        <span className="text-[9px] font-black text-white uppercase tracking-widest">99.9%</span>
                     </div>
                     <div className="h-1 bg-zinc-900 rounded-full overflow-hidden">
                        <div className="h-full w-[99%] bg-emerald-500" />
                     </div>
                  </div>
               </div>
            </section>

            <section className="bg-gradient-to-br from-[#0c0c14] to-[#050508] border-2 border-zinc-900 rounded-[3rem] p-10">
               <h3 className="text-[10px] font-black text-zinc-700 uppercase tracking-[0.4em] italic mb-8">STUDIO NEWS</h3>
               <div className="space-y-6">
                  <div className="group cursor-pointer">
                     <p className="text-[8px] font-black text-[#5850ec] uppercase tracking-widest mb-2">UPDATE v2.4.0</p>
                     <h4 className="text-sm font-black uppercase italic group-hover:text-[#5850ec] transition-colors leading-tight">NEW VOCAL HARMONY AI MODULE RELEASED</h4>
                     <p className="text-[10px] text-zinc-600 font-medium mt-2">Enhanced semantic analysis for backing tracks.</p>
                  </div>
                  <div className="w-full h-px bg-zinc-900" />
                  <div className="group cursor-pointer">
                     <p className="text-[8px] font-black text-zinc-700 uppercase tracking-widest mb-2">COMMUNITY</p>
                     <h4 className="text-sm font-black uppercase italic group-hover:text-[#5850ec] transition-colors leading-tight">JOIN THE JANUARY LYRIC JAM SESSION</h4>
                     <p className="text-[10px] text-zinc-600 font-medium mt-2">$2,500 prize pool for the best AI-assisted lyrics.</p>
                  </div>
               </div>
            </section>
          </div>
        </div>
      </div>
    </div>
  );
}
