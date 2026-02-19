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
  Filter
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';

const DRAFTS = [
  { id: 1, title: 'Midnight Echoes', genre: 'Synthpop', date: '2 hours ago', status: 'Completed' },
  { id: 2, title: 'Summer Rain', genre: 'Indie Pop', date: 'Yesterday', status: 'Draft' },
  { id: 3, title: 'Neon Jungle', genre: 'Electronic', date: '3 days ago', status: 'In Progress' },
  { id: 4, title: 'Quiet Confession', genre: 'Acoustic', date: '1 week ago', status: 'Completed' },
  { id: 5, title: 'Celestial Triangle', genre: 'Ambient', date: '2 weeks ago', status: 'Draft' },
];

export default function LibraryPage() {
  return (
    <div className="flex-1 p-4 lg:p-8 bg-black min-h-screen">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6 mb-8">
        <div className="flex items-center gap-3">
          <div className="p-2 border-2 border-gold rounded-lg">
            <Library className="size-6 text-gold" />
          </div>
          <h1 className="text-2xl lg:text-3xl font-black tracking-tight text-white uppercase italic">
            Your <span className="text-gold">Library</span>
          </h1>
        </div>

        <Button className="bg-gold text-black hover:bg-yellow-500 rounded-full font-black uppercase tracking-widest text-xs px-6">
          New Song Draft
        </Button>
      </div>

      <div className="max-w-6xl space-y-6">
        {/* Search and Filter */}
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 size-4 text-zinc-500" />
            <Input
              placeholder="Search your drafts..."
              className="bg-zinc-950 border-zinc-800 text-white rounded-full pl-11 h-12 focus:border-gold transition-all"
            />
          </div>
          <Button variant="outline" className="rounded-full border-zinc-800 text-zinc-400 hover:bg-zinc-900 h-12 px-6">
            <Filter className="size-4 mr-2" />
            Filter
          </Button>
        </div>

        {/* Drafts List */}
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {DRAFTS.map((draft) => (
            <Link href={`/dashboard/song/${draft.id}`} key={draft.id} className="block group">
              <Card className="bg-zinc-950 border-2 border-zinc-900 rounded-3xl overflow-hidden hover:border-gold/50 transition-all cursor-pointer shadow-xl shadow-black">
                <CardContent className="p-6">
                  <div className="flex justify-between items-start mb-4">
                    <div className="p-3 bg-zinc-900 rounded-2xl group-hover:bg-gold/10 transition-colors">
                      <Music2 className="size-6 text-zinc-400 group-hover:text-gold transition-colors" />
                    </div>
                    <button className="text-zinc-600 hover:text-white transition-colors">
                      <MoreVertical className="size-5" />
                    </button>
                  </div>

                  <h3 className="text-xl font-black text-white uppercase italic tracking-tight mb-1 truncate">
                    {draft.title}
                  </h3>
                  <div className="flex items-center gap-2 text-zinc-500 text-[10px] font-bold tracking-widest uppercase mb-6">
                    <span className="text-gold">{draft.genre}</span>
                    <span className="size-1 bg-zinc-800 rounded-full" />
                    <span>{draft.date}</span>
                  </div>

                  <div className="flex items-center justify-between">
                    <div className={`px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest border ${
                      draft.status === 'Completed' ? 'border-emerald-900 text-emerald-500 bg-emerald-500/5' :
                      draft.status === 'In Progress' ? 'border-blue-900 text-blue-500 bg-blue-500/5' :
                      'border-zinc-800 text-zinc-500 bg-zinc-500/5'
                    }`}>
                      {draft.status}
                    </div>

                    <div className="flex items-center gap-2 text-gold font-black text-[10px] uppercase tracking-widest opacity-0 group-hover:opacity-100 transition-opacity">
                      Edit Lyrics
                      <ArrowRight className="size-3" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
