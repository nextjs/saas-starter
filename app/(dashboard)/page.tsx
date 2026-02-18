import { Button } from '@/components/ui/button';
import { ArrowRight, Sparkles, Music2, Mic2, Wand2, Zap } from 'lucide-react';
import Link from 'next/link';

export default function HomePage() {
  return (
    <main className="bg-black">
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="lg:grid lg:grid-cols-12 lg:gap-8 lg:items-center">
            <div className="sm:text-center md:max-w-2xl md:mx-auto lg:col-span-6 lg:text-left">
              <h1 className="text-4xl font-black text-white tracking-tight sm:text-5xl md:text-6xl uppercase italic">
                Write Your Next
                <span className="block text-gold">Chart-Topping Hit</span>
              </h1>
              <p className="mt-3 text-base text-zinc-400 sm:mt-5 sm:text-xl lg:text-lg xl:text-xl">
                The ultimate AI-powered companion for songwriters. Break through writer's block,
                explore new genres, and craft perfect lyrics with the power of LyricFlow.
              </p>
              <div className="mt-8 sm:max-w-lg sm:mx-auto sm:text-center lg:text-left lg:mx-0">
                <Link href="/dashboard">
                  <Button
                    size="lg"
                    className="text-lg rounded-full bg-gold text-black hover:bg-yellow-500 font-bold px-8"
                  >
                    Start Writing Now
                    <ArrowRight className="ml-2 h-5 w-5" />
                  </Button>
                </Link>
              </div>
            </div>

            <div className="mt-12 relative sm:max-w-lg sm:mx-auto lg:mt-0 lg:max-w-none lg:mx-0 lg:col-span-6 lg:flex lg:items-center">
              {/* Simplified Quick Start Preview */}
              <div className="w-full border-2 border-zinc-800 rounded-3xl p-6 bg-zinc-950/50 shadow-2xl relative overflow-hidden transform lg:rotate-2 hover:rotate-0 transition-transform duration-500">
                <div className="flex items-center gap-2 mb-6">
                  <div className="p-1.5 border border-gold rounded-md">
                    <Wand2 className="size-4 text-gold" />
                  </div>
                  <span className="text-xs font-black tracking-widest text-white uppercase">QUICK START</span>
                </div>

                <div className="flex gap-2 mb-4">
                  <div className="h-8 w-24 rounded-full bg-zinc-900 border border-zinc-800" />
                  <div className="h-8 w-24 rounded-full bg-zinc-900 border border-zinc-800" />
                  <div className="flex-1" />
                  <div className="h-8 w-20 rounded-full bg-gradient-to-r from-rose-500/50 to-orange-500/50" />
                </div>

                <div className="h-32 w-full bg-zinc-900/30 rounded-xl mb-4 border border-zinc-900 flex flex-col p-4">
                   <div className="h-2 w-3/4 bg-zinc-800 rounded-full mb-2" />
                   <div className="h-2 w-1/2 bg-zinc-800 rounded-full mb-2" />
                   <div className="h-2 w-2/3 bg-zinc-800 rounded-full" />
                </div>

                <div className="flex flex-wrap gap-2 mb-6">
                  <div className="h-6 w-16 rounded-md bg-indigo-500/20" />
                  <div className="h-6 w-20 rounded-md bg-emerald-500/20" />
                  <div className="h-6 w-14 rounded-md bg-amber-500/20" />
                </div>

                <div className="h-12 w-full rounded-full border border-zinc-800 bg-zinc-900/50 flex items-center justify-center">
                  <span className="text-[10px] font-black tracking-widest text-zinc-600 uppercase">GENERATE TRACK</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="py-24 bg-zinc-950 w-full border-y border-zinc-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="lg:grid lg:grid-cols-3 lg:gap-12">
            <div>
              <div className="flex items-center justify-center h-12 w-12 rounded-xl bg-gold/10 text-gold border border-gold/20">
                <Zap className="h-6 w-6" />
              </div>
              <div className="mt-5">
                <h2 className="text-xl font-bold text-white uppercase tracking-tight">
                  AI Lyric Spark
                </h2>
                <p className="mt-2 text-base text-zinc-400">
                  Generate instant inspiration with genre-aware prompt templates that
                  kickstart your creative process in seconds.
                </p>
              </div>
            </div>

            <div className="mt-12 lg:mt-0">
              <div className="flex items-center justify-center h-12 w-12 rounded-xl bg-gold/10 text-gold border border-gold/20">
                <Music2 className="h-6 w-6" />
              </div>
              <div className="mt-5">
                <h2 className="text-xl font-bold text-white uppercase tracking-tight">
                  Genre Mastery
                </h2>
                <p className="mt-2 text-base text-zinc-400">
                  From Synthpop to Death Metal, our AI understands the nuances of
                  every style, instrumentation, and vocal delivery.
                </p>
              </div>
            </div>

            <div className="mt-12 lg:mt-0">
              <div className="flex items-center justify-center h-12 w-12 rounded-xl bg-gold/10 text-gold border border-gold/20">
                <Mic2 className="h-6 w-6" />
              </div>
              <div className="mt-5">
                <h2 className="text-xl font-bold text-white uppercase tracking-tight">
                  Vocal Synthesis
                </h2>
                <p className="mt-2 text-base text-zinc-400">
                  Define exactly how your lyrics should be delivered. Airy sopranos,
                  gritty tenors, or digital whispers—you control the voice.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="py-24 bg-black">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="lg:grid lg:grid-cols-2 lg:gap-8 lg:items-center">
            <div>
              <h2 className="text-3xl font-black text-white sm:text-4xl uppercase italic">
                Ready to find your <span className="text-gold">signature sound?</span>
              </h2>
              <p className="mt-3 max-w-3xl text-lg text-zinc-400">
                Stop staring at a blank page. Join thousands of songwriters
                using LyricFlow to turn their ideas into masterpieces.
              </p>
            </div>
            <div className="mt-8 lg:mt-0 flex justify-center lg:justify-end">
              <Link href="/sign-up">
                <Button
                  size="lg"
                  className="text-lg rounded-full bg-white text-black hover:bg-zinc-200 font-bold px-10"
                >
                  Join LyricFlow
                  <ArrowRight className="ml-3 h-6 w-6" />
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
