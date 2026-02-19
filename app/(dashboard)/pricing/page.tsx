'use client';

import { Check, Zap, Sparkles, Crown, ArrowRight } from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';

const PLANS = [
  {
    name: 'Free Session',
    price: '$0',
    description: 'Perfect for exploring the AI lyric engine.',
    features: ['3 Generations / month', 'Standard AI Model', 'Basic Text Editor', 'Community Support'],
    buttonText: 'START EXPLORING',
    highlight: false,
    icon: Zap
  },
  {
    name: 'Pro Producer',
    price: '$29',
    description: 'Unlimited creativity for serious songwriters.',
    features: ['Unlimited Generations', 'Advanced Llama-3 Model', 'Full Studio Suite', 'Priority Rendering', 'Commercial Rights', 'Cloud Backup'],
    buttonText: 'ACTIVATE PRO',
    highlight: true,
    icon: Crown
  },
  {
    name: 'Studio Enterprise',
    price: 'Custom',
    description: 'Tailored solutions for labels and agencies.',
    features: ['Custom AI Models', 'API Access', 'Multi-user Teams', 'Dedicated Account Manager', 'White-label Options'],
    buttonText: 'CONTACT SALES',
    highlight: false,
    icon: Sparkles
  }
];

export default function PricingPage() {
  return (
    <div className="min-h-screen bg-[#050508] text-white selection:bg-[#5850ec] selection:text-white">
      <main className="pt-24 pb-40 px-6">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="text-center mb-24 max-w-3xl mx-auto">
            <h2 className="text-[10px] font-black text-[#5850ec] uppercase tracking-[0.6em] italic mb-6 animate-in fade-in slide-in-from-bottom-4 duration-700">PRICING ARCHITECTURE</h2>
            <h1 className="text-5xl sm:text-7xl lg:text-8xl font-black uppercase italic tracking-tighter leading-none mb-8 animate-in fade-in slide-in-from-bottom-8 duration-1000">
              Fuel Your <span className="text-white/20">Creativity</span>
            </h1>
            <p className="text-zinc-500 text-lg sm:text-xl font-black uppercase italic tracking-tight opacity-80 animate-in fade-in slide-in-from-bottom-12 duration-1000">
              Choose the tier that matches your production output. No hidden fees, just pure inspiration.
            </p>
          </div>

          {/* Pricing Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-24">
            {PLANS.map((plan, i) => (
              <div
                key={plan.name}
                className={`relative group p-10 rounded-[3rem] border-2 transition-all duration-500 hover:scale-[1.02] ${
                  plan.highlight
                    ? 'bg-[#0c0c14] border-[#5850ec] shadow-2xl shadow-[#5850ec]/10'
                    : 'bg-zinc-950/50 border-zinc-900 hover:border-zinc-800'
                } animate-in fade-in slide-in-from-bottom-16`}
                style={{ animationDelay: `${i * 150}ms` }}
              >
                {plan.highlight && (
                   <div className="absolute -top-5 left-1/2 -translate-x-1/2 bg-[#5850ec] text-white text-[10px] font-black uppercase tracking-widest px-6 py-2 rounded-full italic shadow-xl">
                      MOST POPULAR
                   </div>
                )}

                <div className="flex items-start justify-between mb-10">
                   <div className={`p-4 rounded-2xl ${plan.highlight ? 'bg-[#5850ec]/10 text-[#5850ec]' : 'bg-zinc-900 text-zinc-600'}`}>
                      <plan.icon className="size-8" />
                   </div>
                   <div className="text-right">
                      <div className="text-4xl font-black italic tracking-tighter">{plan.price}</div>
                      <div className="text-[10px] font-black text-zinc-700 uppercase tracking-widest">{plan.price !== 'Custom' && '/ MONTH'}</div>
                   </div>
                </div>

                <h3 className="text-2xl font-black uppercase italic tracking-tight mb-4">{plan.name}</h3>
                <p className="text-zinc-500 text-sm font-black uppercase italic tracking-tight mb-10 leading-relaxed min-h-[40px]">
                   {plan.description}
                </p>

                <div className="space-y-4 mb-12">
                   {plan.features.map((feature) => (
                      <div key={feature} className="flex items-center gap-3">
                         <div className={`size-5 rounded-full flex items-center justify-center border ${plan.highlight ? 'border-[#5850ec]/30 text-[#5850ec]' : 'border-zinc-800 text-zinc-700'}`}>
                            <Check className="size-3" />
                         </div>
                         <span className="text-[11px] font-black text-zinc-400 uppercase tracking-widest">{feature}</span>
                      </div>
                   ))}
                </div>

                <Link href="/dashboard">
                  <Button className={`w-full h-16 rounded-2xl font-black tracking-widest uppercase italic transition-all active:scale-[0.98] ${
                    plan.highlight
                      ? 'bg-[#5850ec] hover:bg-[#5850ec]/90 text-white shadow-xl shadow-[#5850ec]/20'
                      : 'bg-white text-black hover:bg-zinc-200'
                  }`}>
                    {plan.buttonText}
                  </Button>
                </Link>
              </div>
            ))}
          </div>

          {/* FAQ/Trust Section */}
          <div className="bg-[#08080c] border-2 border-zinc-900 rounded-[3rem] p-12 lg:p-20 text-center">
             <h4 className="text-[10px] font-black text-zinc-700 uppercase tracking-[0.4em] italic mb-8">TRANSPARENCY FIRST</h4>
             <h2 className="text-3xl sm:text-5xl font-black uppercase italic tracking-tighter mb-12">Frequently Asked <span className="text-zinc-500">Inquiries</span></h2>

             <div className="grid grid-cols-1 md:grid-cols-2 gap-12 text-left">
                <div className="space-y-4">
                   <h5 className="text-sm font-black uppercase italic tracking-tight text-white">Can I cancel anytime?</h5>
                   <p className="text-[11px] text-zinc-600 font-black uppercase tracking-widest leading-relaxed">Yes, all subscriptions are month-to-month and can be terminated instantly through your studio settings dashboard.</p>
                </div>
                <div className="space-y-4">
                   <h5 className="text-sm font-black uppercase italic tracking-tight text-white">Do I own the lyrics?</h5>
                   <p className="text-[11px] text-zinc-600 font-black uppercase tracking-widest leading-relaxed">Full commercial rights are included with the Pro and Studio plans. Free tier is for non-commercial exploration only.</p>
                </div>
                <div className="space-y-4">
                   <h5 className="text-sm font-black uppercase italic tracking-tight text-white">Which AI models do you use?</h5>
                   <p className="text-[11px] text-zinc-600 font-black uppercase tracking-widest leading-relaxed">We utilize a fine-tuned ensemble of Llama-3 and specialized semantic engines trained specifically for lyrical cadence and rhyme structure.</p>
                </div>
                <div className="space-y-4">
                   <h5 className="text-sm font-black uppercase italic tracking-tight text-white">Is there a bulk discount?</h5>
                   <p className="text-[11px] text-zinc-600 font-black uppercase tracking-widest leading-relaxed">Yes, annual billing saves you 20% across all paid tiers. Contact our studio team for label-wide deployments.</p>
                </div>
             </div>
          </div>
        </div>
      </main>

      <footer className="py-20 border-t border-zinc-900/50">
        <div className="max-w-7xl mx-auto px-6 flex flex-col items-center gap-8">
          <div className="flex items-center gap-2">
            <div className="size-6 bg-white rounded-full flex items-center justify-center">
               <div className="size-2 bg-black rounded-full" />
            </div>
            <span className="text-sm font-black uppercase italic tracking-tighter">LYRICFLOW</span>
          </div>
          <p className="text-zinc-800 text-[10px] font-black uppercase tracking-[0.4em] italic">© 2025 STUDIO ENGINE. ALL RIGHTS RESERVED.</p>
        </div>
      </footer>
    </div>
  );
}
