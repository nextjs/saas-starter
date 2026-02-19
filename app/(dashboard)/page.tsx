import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { ArrowRight, Zap, Music2, Mic2, Wand2, Sparkles } from 'lucide-react';
import Link from 'next/link';

export default function HomePage() {
  return (
    <main className="bg-[#050508] min-h-screen text-white">
      {/* Hero Section */}
      <section className="relative pt-32 pb-20 overflow-hidden">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-[500px] bg-gradient-to-b from-[#5850ec]/10 to-transparent blur-[120px] pointer-events-none" />

        <div className="max-w-7xl mx-auto px-6 relative z-10">
          <div className="text-center max-w-4xl mx-auto">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-zinc-800 bg-zinc-900/50 mb-8 animate-in fade-in slide-in-from-top-4 duration-1000">
              <Sparkles className="size-4 text-[#fbbf24]" />
              <span className="text-[10px] font-black tracking-[0.3em] text-zinc-400 uppercase">AI-POWERED SONGWRITING</span>
            </div>

            <h1 className="text-5xl md:text-8xl font-black tracking-tighter mb-8 uppercase italic leading-[0.9]">
              Write Your Next <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#fbbf24] via-[#5850ec] to-[#fbbf24] animate-gradient">Chart-Topping Hit</span>
            </h1>

            <p className="text-lg md:text-2xl text-zinc-500 mb-12 max-w-2xl mx-auto font-medium leading-relaxed italic">
              The ultimate AI companion for songwriters. Break through writer's block and craft perfect lyrics with LyricFlow.
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-6">
              <Link href="/dashboard" className="w-full sm:w-auto">
                <Button
                  size="lg"
                  className="w-full sm:w-auto h-20 px-12 rounded-[2rem] bg-[#5850ec] hover:bg-[#5850ec]/90 text-white font-black tracking-[0.2em] text-lg uppercase transition-all shadow-2xl shadow-[#5850ec]/20 active:scale-95"
                >
                  Start Writing Now
                  <ArrowRight className="ml-3 size-6" />
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section className="py-24 border-y border-zinc-900 bg-[#08080c]">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
            <FeatureCard
              icon={<Zap className="size-8 text-[#fbbf24]" />}
              title="AI Lyric Spark"
              description="Generate instant inspiration with genre-aware templates that kickstart your creative process."
              color="hover:border-[#fbbf24]/30"
            />
            <FeatureCard
              icon={<Music2 className="size-8 text-[#06b6d4]" />}
              title="Genre Mastery"
              description="From Synthpop to Metal, our AI understands the nuances of every style and instrumentation."
              color="hover:border-[#06b6d4]/30"
            />
            <FeatureCard
              icon={<Mic2 className="size-8 text-[#e11d48]" />}
              title="Vocal Delivery"
              description="Define exactly how your lyrics should be delivered. Airy, gritty, or digital—you control the voice."
              color="hover:border-[#e11d48]/30"
            />
          </div>
        </div>
      </section>

      {/* Social Proof */}
      <section className="py-24 bg-[#050508]">
        <div className="max-w-7xl mx-auto px-6 text-center">
          <h2 className="text-3xl md:text-5xl font-black uppercase italic mb-16 tracking-tight">
            Loved by <span className="text-[#5850ec]">Thousands</span> of Creators
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 opacity-40">
            {['SONY', 'WARNER', 'UNIVERSAL', 'SPOTIFY'].map(brand => (
              <div key={brand} className="flex items-center justify-center h-20 border border-zinc-800 rounded-2xl font-black tracking-[0.4em] text-xl">
                {brand}
              </div>
            ))}
          </div>
        </div>
      </section>
    </main>
  );
}

function FeatureCard({ icon, title, description, color }: { icon: React.ReactNode, title: string, description: string, color: string }) {
  return (
    <div className={cn(
      "p-10 rounded-[2.5rem] border-2 border-zinc-900 bg-zinc-950/50 transition-all duration-500",
      color
    )}>
      <div className="mb-6">{icon}</div>
      <h3 className="text-2xl font-black uppercase italic mb-4 tracking-tight">{title}</h3>
      <p className="text-zinc-500 leading-relaxed font-medium italic">{description}</p>
    </div>
  );
}
