import { cookies } from "next/headers";
import { checkoutAction } from '@/lib/payments/actions';
import { Check, Music2 } from 'lucide-react';
import { getStripePrices, getStripeProducts } from '@/lib/payments/stripe';
import { SubmitButton } from './submit-button';

export default async function PricingPage() {
  await cookies();
  const [prices, products] = await Promise.all([
    getStripePrices(),
    getStripeProducts(),
  ]);

  const basePlan = products.find((product) => product.name === 'Base');
  const plusPlan = products.find((product) => product.name === 'Plus');

  const basePrice = prices.find((price) => price.productId === basePlan?.id);
  const plusPrice = prices.find((price) => price.productId === plusPlan?.id);

  return (
    <main className="bg-black min-h-screen py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto text-center mb-12">
        <h1 className="text-4xl font-black text-white tracking-tight sm:text-5xl uppercase italic mb-4">
          Simple <span className="text-gold">Pricing</span>
        </h1>
        <p className="text-zinc-400 text-lg max-w-2xl mx-auto">
          Choose the plan that fits your creative workflow. All plans include a 7-day free trial.
        </p>
      </div>

      <div className="grid md:grid-cols-2 gap-8 max-w-5xl mx-auto">
        <PricingCard
          name={basePlan?.name || 'Base'}
          price={basePrice?.unitAmount || 800}
          interval={basePrice?.interval || 'month'}
          trialDays={basePrice?.trialPeriodDays || 7}
          features={[
            'Unlimited Lyric Generation',
            'All Genres & Themes',
            'Standard AI Model',
            'Email Support',
          ]}
          priceId={basePrice?.id}
          isPopular={false}
        />
        <PricingCard
          name={plusPlan?.name || 'Plus'}
          price={plusPrice?.unitAmount || 1200}
          interval={plusPrice?.interval || 'month'}
          trialDays={plusPrice?.trialPeriodDays || 7}
          features={[
            'Everything in Base, plus:',
            'Advanced AI Songwriting Engine',
            'Vocal Style Customization',
            'Priority Support + Discord Access',
          ]}
          priceId={plusPrice?.id}
          isPopular={true}
        />
      </div>
    </main>
  );
}

function PricingCard({
  name,
  price,
  interval,
  trialDays,
  features,
  priceId,
  isPopular,
}: {
  name: string;
  price: number;
  interval: string;
  trialDays: number;
  features: string[];
  priceId?: string;
  isPopular?: boolean;
}) {
  return (
    <div className={`relative p-8 rounded-3xl border-2 transition-all duration-300 flex flex-col h-full ${
      isPopular
        ? 'bg-zinc-900 border-gold shadow-2xl shadow-gold/10'
        : 'bg-zinc-950 border-zinc-800'
    }`}>
      {isPopular && (
        <div className="absolute top-0 right-8 transform -translate-y-1/2 bg-gold text-black text-[10px] font-black tracking-widest px-3 py-1 rounded-full uppercase">
          Most Popular
        </div>
      )}

      <div className="flex items-center gap-3 mb-6">
        <div className={`p-2 rounded-xl ${isPopular ? 'bg-gold/20 text-gold' : 'bg-zinc-900 text-zinc-400'}`}>
          <Music2 className="size-6" />
        </div>
        <h2 className="text-2xl font-black text-white uppercase italic tracking-tight">{name}</h2>
      </div>

      <p className="text-zinc-500 text-sm mb-6">
        Unlock your creative potential with {trialDays} days for free.
      </p>

      <div className="mb-8">
        <span className="text-5xl font-black text-white italic tracking-tighter">${price / 100}</span>
        <span className="text-zinc-500 ml-2 font-medium tracking-wide">/ {interval}</span>
      </div>

      <ul className="space-y-4 mb-8 flex-1">
        {features.map((feature, index) => (
          <li key={index} className="flex items-start">
            <Check className="h-5 w-5 text-gold mr-3 mt-0.5 flex-shrink-0" />
            <span className="text-zinc-300 text-sm font-medium">{feature}</span>
          </li>
        ))}
      </ul>

      <form action={checkoutAction} className="mt-auto">
        <input type="hidden" name="priceId" value={priceId} />
        <SubmitButton isPopular={isPopular} />
      </form>
    </div>
  );
}
