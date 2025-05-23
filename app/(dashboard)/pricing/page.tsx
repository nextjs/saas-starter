import { checkoutAction } from '@/lib/payments/actions';
import { Check, AlertCircle } from 'lucide-react';
import { getStripePrices, getStripeProducts } from '@/lib/payments/stripe';
import { SubmitButton } from './submit-button';
import { cookies } from 'next/headers';

// Prices are fresh for one hour max
export const revalidate = 3600;

export default async function PricingPage({
  searchParams,
}: {
  searchParams: { [key: string]: string | string[] | undefined };
}) {
  const [prices, products] = await Promise.all([
    getStripePrices(),
    getStripeProducts(),
  ]);

  const basePlan = products.find((product) => product.name === 'Base');
  const plusPlan = products.find((product) => product.name === 'Plus');

  const basePrice = prices.find((price) => price.productId === basePlan?.id);
  const plusPrice = prices.find((price) => price.productId === plusPlan?.id);

  const orderedProducts = ['Base', 'Plus', 'Master']
    .map((name) => products.find((p) => p.name === name))
    .filter((p): p is typeof products[number] => !!p);

  // Await searchParams promise to access its properties safely
  const { access } = await searchParams;
  const needsSubscription = access === 'premium';

  return (
    <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      {needsSubscription && (
        <div className="mb-8 bg-amber-50 border border-amber-200 rounded-xl p-4 text-amber-800 shadow-sm">
          <div className="flex items-start">
            <div className="flex-shrink-0 rounded-full bg-amber-100 p-1 mr-3">
              <AlertCircle className="h-5 w-5 text-amber-600" />
            </div>
            <div>
              <h5 className="font-medium">Subscription Required</h5>
              <p className="text-sm mt-1">
                You need an active subscription to access premium features.
                Please choose a plan below to continue.
              </p>
            </div>
          </div>
        </div>
      )}
      
      {/* Header Section */}
      <div className="text-center mb-8">
        <h1 className="text-4xl font-bold tracking-tight sm:text-5xl md:text-6xl">
          Start Your <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-teal-500">Smart Learning</span> Journey Today
        </h1>
        <p className="mt-4 text-lg text-gray-600 max-w-3xl mx-auto">
          Transform Curiosity into Expertise: Where Knowledge Meets Opportunity
        </p>
      </div>
      {/* Pricing Grid (dynamic from Stripe) */}
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
        {orderedProducts.map((product) => {
          const planPrice = prices.find((p) => p.productId === product.id);
          return (
            <PricingCard
              key={product.id}
              name={product.name}
              price={planPrice?.unitAmount || 0}
              interval={planPrice?.interval || 'month'}
              intervalCount={planPrice?.intervalCount || 1}
              trialDays={planPrice?.trialPeriodDays || 0}
              features={
                product.name === 'Base'
                  ? ['Unlimited Usage', 'Unlimited Workspace Members', 'Email Support']
                  : product.name === 'Plus'
                  ? ['Everything in Base', 'Early Access to New Features']
                  : product.name === 'Master'
                  ? ['Everything in Plus']
                  : []
              }
              priceId={planPrice?.id}
              highlighted={product.name === 'Plus'}
              currencySymbol={planPrice?.currencySymbol}
            />
          );
        })}
      </div>
      <div className="text-center mt-12 mb-8 space-y-4">
        <p className="text-lg text-gray-700">We've applied special pricing to our subscription plans:</p>
        <div className="flex flex-col md:flex-row justify-center items-center space-y-2 md:space-y-0 md:space-x-12 text-gray-800 font-medium">
          <div className="px-4 py-2 bg-gray-100 rounded-lg">
            €6.99 <span className="text-sm text-gray-600">/ week</span>
          </div>
          <div className="px-4 py-2 bg-gray-100 rounded-lg">
            €19.99 <span className="text-sm text-green-600">/ month</span><span className="text-sm text-gray-500"> (save 28%)</span>
          </div>
          <div className="px-4 py-2 bg-gray-100 rounded-lg">
            €39.99 <span className="text-sm text-green-600">/ quarter</span><span className="text-sm text-gray-500"> (save 33%)</span>
          </div>
        </div>
        <p className="text-sm text-gray-600">
          By clicking <strong>'Get Started'</strong>, you agree to automatic subscription renewal until you cancel. You can cancel anytime in your account settings.
        </p>
      </div>
      {/* Disclaimer Section */}
      <div className="bg-white border border-gray-200 rounded-xl p-6 mb-8">
        <p className="text-lg font-bold mb-2">Disclaimer</p>
        <p>
          Focus your AI serves exclusively as an educational platform and explicitly does not provide any financial, investment, or career advice under any circumstances. All content is presented for informational and educational purposes only. Prior to making any career or financial decisions, we strongly urge you to consult with qualified professional advisors. Focus your AI maintains absolute neutrality and has no bias whatsoever towards or against any stocks, companies, or entities mentioned throughout this platform. Nothing contained within this site should be interpreted as a recommendation or endorsement of any kind.
        </p>
      </div>
      <div className="text-center text-gray-500 text-sm mt-4">
        Product by DexterLab 2025 ©All Rights Reserved.
      </div>
    </main>
  );
}

function PricingCard({
  name,
  price,
  interval,
  intervalCount,
  trialDays,
  features,
  priceId,
  highlighted = false,
  currencySymbol,
}: {
  name: string;
  price: number;
  interval: string;
  intervalCount: number;
  trialDays: number;
  features: string[];
  priceId?: string;
  highlighted?: boolean;
  currencySymbol: string;
}) {
  return (
    <div className={`pt-6 rounded-xl ${highlighted ? 'ring-2 ring-teal-500 p-4 bg-white shadow-lg' : ''}`}>
      {highlighted && (
        <div className="bg-gradient-to-r from-blue-600 to-teal-500 text-white text-xs font-semibold px-3 py-1 rounded-full inline-block mb-4">
          Recommended
        </div>
      )}
      <h2 className="text-2xl font-medium text-gray-900 mb-2">{name}</h2>
      {trialDays > 0 && (
        <p className="text-sm text-gray-600 mb-4">
          with {trialDays} day free trial
        </p>
      )}
      <p className="text-4xl font-medium text-gray-900 mb-6">
        {currencySymbol}{price / 100}{' '}
        <span className="text-xl font-normal text-gray-600">
          per user / {intervalCount > 1 ? `${intervalCount} ${interval}s` : interval}
        </span>
      </p>
      <ul className="space-y-4 mb-8">
        {features.map((feature, index) => (
          <li key={index} className="flex items-start">
            <Check className="h-5 w-5 text-orange-500 mr-2 mt-0.5 flex-shrink-0" />
            <span className="text-gray-700">{feature}</span>
          </li>
        ))}
        {name === 'Master' && (
          <li className="flex items-start">
            <Check className="h-5 w-5 text-orange-500 mr-2 mt-0.5 flex-shrink-0" />
            <span className="text-gray-700">save 33%</span>
          </li>
        )}
      </ul>
      <form action={checkoutAction}>
        <input type="hidden" name="priceId" value={priceId} />
        <SubmitButton highlighted={highlighted} />
      </form>
    </div>
  );
}
