'use client';

import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { ArrowRight, Zap, Music2, Mic2, Wand2, Sparkles, Activity, Play } from 'lucide-react';
import Link from 'next/link';

export default function HomePage() {
  return (
    <main className="bg-[#050508] min-h-screen text-white relative overflow-hidden">
      {/* Background Ambience */}
      <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_50%_0%,rgba(88,80,236,0.15),transparent_50%)]" />
      <div className="absolute bottom-0 right-0 w-full h-full bg-[radial-gradient(circle_at_100%_100%,rgba(251,191,36,0.05),transparent_40%)]" />

      {/* Hero Section */}
      <section className="relative pt-24 sm:pt-40 pb-20 sm:pb-32 px-6">
        <div className="max-w-7xl mx-auto relative z-10">
          <div className="flex flex-col items-center text-center">
            {/* Status Indicator */}
            <div className="inline-flex items-center gap-3 px-6 py-2 rounded-full border border-[#fbbf24]/20 bg-[#fbbf24]/5 mb-10 animate-in fade-in slide-in-from-top-4 duration-1000">
              <div className="size-1.5 rounded-full bg-[#fbbf24] animate-pulse" />
              <span className="text-[9px] font-black tracking-[0.4em] text-[#fbbf24] uppercase">STUDIO ONLINE: v2.4</span>
            </div>

            <h1 className="text-5xl sm:text-7xl md:text-9xl font-black tracking-tighter mb-10 uppercase italic leading-[0.85] text-white">
              ENGINEERED <br />
              FOR <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#fbbf24] via-[#5850ec] to-[#06b6d4] animate-gradient">HITS</span>
            </h1>

            <p className="text-lg sm:text-2xl text-zinc-500 mb-14 max-w-3xl mx-auto font-black uppercase italic leading-tight tracking-tight opacity-80">
              The premium AI studio for modern songwriters. <br className="hidden sm:block" />
              Craft chart-ready lyrics in seconds.
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-6 w-full">
              <Link href="/dashboard" className="w-full sm:w-auto">
                <Button
                  className="w-full sm:w-auto h-20 sm:h-24 px-12 sm:px-16 rounded-[2rem] bg-[#5850ec] hover:bg-[#5850ec]/90 text-white font-black tracking-[0.3em] text-lg sm:text-xl uppercase transition-all shadow-2xl shadow-[#5850ec]/30 active:scale-[0.98] group"
                >
                  ENTER STUDIO
                  <ArrowRight className="ml-4 size-6 group-hover:translate-x-1 transition-transform" />
                </Button>
              </Link>
              <button className="flex items-center gap-4 px-10 h-20 sm:h-24 text-[10px] font-black tracking-[0.4em] text-zinc-500 hover:text-white transition-colors uppercase italic border-2 border-zinc-900 rounded-[2rem] w-full sm:w-auto justify-center">
                <Play className="size-4 fill-current" />
                WATCH PREVIEW
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Feature Section with Bento-like feel */}
      <section className="py-24 sm:py-32 px-6 border-y border-zinc-900 bg-[#08080c]/50 backdrop-blur-3xl relative">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            <FeatureCard
              icon={<Zap className="size-8 text-[#fbbf24]" />}
              title="NEURAL SPARK"
              description="Proprietary AI models trained on Billboard hits to provide instant, genre-perfect inspiration."
              accent="border-[#fbbf24]/10 bg-[#fbbf24]/5"
            />
            <FeatureCard
              icon={<Activity className="size-8 text-[#5850ec]" />}
              title="REALTIME FLOW"
              description="A state-of-the-art studio environment optimized for speed and creative momentum."
              accent="border-[#5850ec]/10 bg-[#5850ec]/5"
            />
            <FeatureCard
              icon={<Music2 className="size-8 text-[#06b6d4]" />}
              title="MULTI-GENRE"
              description="Seamlessly switch between over 50+ music styles with accurate linguistic mapping."
              accent="border-[#06b6d4]/10 bg-[#06b6d4]/5"
            />
          </div>
        </div>
      </section>

      {/* Social Proof Section */}
      <section className="py-32 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-20">
             <h2 className="text-3xl sm:text-5xl font-black uppercase italic tracking-tighter text-white mb-6 leading-none">
               TRUSTED BY <span className="text-[#5850ec]">PRODUCERS</span>
             </h2>
             <div className="h-1 w-24 bg-[#5850ec] mx-auto rounded-full" />
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-8">
            {['SONY', 'WARNER', 'UNIVERSAL', 'EPIC'].map(brand => (
              <div key={brand} className="group relative">
                <div className="absolute inset-0 bg-white/5 opacity-0 group-hover:opacity-100 transition-opacity blur-2xl rounded-3xl" />
                <div className="relative h-24 sm:h-32 flex items-center justify-center border-2 border-zinc-900 rounded-[2rem] bg-zinc-950/50 hover:border-zinc-800 transition-all">
                  <span className="text-lg sm:text-2xl font-black tracking-[0.6em] text-zinc-700 group-hover:text-white transition-colors uppercase italic">{brand}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="py-32 sm:py-48 px-6 bg-gradient-to-b from-[#08080c] to-black text-center">
         <div className="max-w-4xl mx-auto">
            <h2 className="text-4xl sm:text-7xl font-black uppercase italic tracking-tighter text-white mb-12 leading-[0.9]">
              READY TO <br />
              START THE <span className="text-[#fbbf24]">SESSION?</span>
            </h2>
            <Link href="/dashboard">
               <Button className="h-24 sm:h-32 px-16 sm:px-24 rounded-[3rem] bg-white text-black hover:bg-zinc-200 font-black tracking-[0.4em] text-xl sm:text-2xl uppercase transition-all shadow-2xl active:scale-[0.98]">
                  GET ACCESS
               </Button>
            </Link>
         </div>
      </section>
    </main>
  );
}

function FeatureCard({ icon, title, description, accent }: { icon: React.ReactNode, title: string, description: string, accent: string }) {
  return (
    <div className={cn(
      "group p-10 sm:p-12 rounded-[3rem] border-2 border-zinc-900 bg-zinc-950/30 transition-all duration-700 hover:border-zinc-800 relative overflow-hidden",
    )}>
      <div className={cn("absolute top-0 right-0 w-32 h-32 blur-[60px] opacity-20 group-hover:opacity-40 transition-opacity", accent)} />
      <div className="relative z-10">
        <div className="mb-10 group-hover:scale-110 transition-transform duration-500 w-fit">{icon}</div>
        <h3 className="text-2xl sm:text-3xl font-black uppercase italic mb-6 tracking-tight text-white">{title}</h3>
        <p className="text-zinc-600 text-lg leading-tight font-black uppercase italic opacity-80 group-hover:text-zinc-400 transition-colors">{description}</p>
      </div>
    </div>
  );
}
