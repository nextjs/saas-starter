'use client';

import { QuickstartCard } from '@/components/quickstart-card';
import { History, Music2, Clock, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Link from 'next/link';

const RECENT_WORKS = [
  { id: '1', title: 'Neon Shadows', genre: 'Synthwave', date: '2h ago' },
  { id: '2', title: 'Summer Breeze', genre: 'Acoustic Pop', date: '5h ago' },
  { id: '3', title: 'Digital Rebellion', genre: 'Industrial Techno', date: '1d ago' },
];

export default function DashboardPage() {
  return (
    <div className="min-h-screen bg-black text-white pb-20">
      {/* QUICK START Section */}
      <QuickstartCard />

      {/* Recent Works Section */}
      <div className="w-full max-w-5xl mx-auto px-4 mt-12">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-2">
            <History className="size-5 text-zinc-500" />
            <h2 className="text-lg font-black text-white uppercase italic tracking-widest">Recent Works</h2>
          </div>
          <Link href="/dashboard/library">
            <Button variant="link" className="text-gold text-xs font-bold uppercase tracking-widest p-0 h-auto">
              View Library
              <ArrowRight className="size-3 ml-2" />
            </Button>
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {RECENT_WORKS.map((work) => (
            <Link href={`/dashboard/song/${work.id}`} key={work.id} className="bg-zinc-950 border border-zinc-900 p-4 rounded-2xl hover:border-zinc-700 transition-colors cursor-pointer group">
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
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
