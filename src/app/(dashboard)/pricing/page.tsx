import { checkoutAction } from '@/src/lib/payments/actions';
import { getStripePrices, getStripeProducts } from '@/src/lib/payments/stripe';
import { Check, Star } from 'lucide-react';
import { SubmitButton } from './submit-button';

// Prices are fresh for one hour max
export const revalidate = 3600;

export default async function PricingPage() {
  const [prices, products] = await Promise.all([
    getStripePrices(),
    getStripeProducts(),
  ]);

  const basePlan = products.find((product) => product.name === 'Base');
  const plusPlan = products.find((product) => product.name === 'Plus');

  const basePrice = prices.find((price) => price.productId === basePlan?.id);
  const plusPrice = prices.find((price) => price.productId === plusPlan?.id);

  return (
    <main className="relative min-h-screen w-full bg-gradient-to-br from-zinc-50 via-white to-zinc-100 py-16 px-4 flex flex-col items-center">
      <div className="max-w-2xl mx-auto text-center mb-12">
        <h1 className="text-4xl font-bold text-gray-900 mb-4">Simple, transparent pricing</h1>
        <p className="text-lg text-gray-600 mb-2">Choose the plan that fits your team. No hidden fees, cancel anytime.</p>
      </div>
      <div className="grid w-full max-w-4xl md:grid-cols-2 gap-8">
        <PricingCard
          name={basePlan?.name || 'Base'}
          price={basePrice?.unitAmount || 800}
          interval={basePrice?.interval || 'month'}
          trialDays={basePrice?.trialPeriodDays || 7}
          features={[
            'Unlimited Usage',
            'Unlimited Workspace Members',
            'Email Support',
          ]}
          priceId={basePrice?.id}
          highlight={false}
        />
        <PricingCard
          name={plusPlan?.name || 'Plus'}
          price={plusPrice?.unitAmount || 1200}
          interval={plusPrice?.interval || 'month'}
          trialDays={plusPrice?.trialPeriodDays || 7}
          features={[
            'Everything in Base, and:',
            'Early Access to New Features',
            '24/7 Support + Slack Access',
          ]}
          priceId={plusPrice?.id}
          highlight={true}
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
  highlight = false,
}: {
  name: string;
  price: number;
  interval: string;
  trialDays: number;
  features: string[];
  priceId?: string;
  highlight?: boolean;
}) {
  return (
    <div
      className={`relative flex flex-col bg-white rounded-3xl shadow-xl border transition-transform duration-200 hover:-translate-y-1 hover:shadow-2xl p-8 ${
        highlight
          ? 'border-primary ring-2 ring-primary/20 scale-105 z-10'
          : 'border-zinc-200'
      }`}
      tabIndex={0}
      aria-label={`${name} plan`}
    >
      {highlight && (
        <div className="absolute -top-4 left-1/2 -translate-x-1/2 flex items-center gap-1 bg-primary text-white px-3 py-1 rounded-full text-xs font-semibold shadow-md">
          <Star className="h-4 w-4 mr-1" /> Most Popular
        </div>
      )}
      <h2 className="text-2xl font-bold text-gray-900 mb-2 text-center">{name}</h2>
      <p className="text-sm text-gray-600 mb-4 text-center">
        {trialDays} day free trial
      </p>
      <p className="text-5xl font-extrabold text-gray-900 mb-6 text-center">
        ${price / 100}{' '}
        <span className="text-xl font-normal text-gray-600">
          / {interval}
        </span>
      </p>
      <ul className="space-y-4 mb-8">
        {features.map((feature, index) => (
          <li key={index} className="flex items-start">
            <Check className="h-5 w-5 text-primary mr-2 mt-0.5 flex-shrink-0" />
            <span className="text-gray-700">{feature}</span>
          </li>
        ))}
      </ul>
      <form action={checkoutAction} className="mt-auto">
        <input type="hidden" name="priceId" value={priceId} />
        <SubmitButton />
      </form>
    </div>
  );
}
