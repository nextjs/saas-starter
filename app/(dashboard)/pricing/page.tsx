import { checkoutAction } from '@/lib/payments/actions';
import { Check } from 'lucide-react';
import { getStripePrices, getStripeProducts } from '@/lib/payments/stripe';
import { SubmitButton } from './submit-button';

// Prices are fresh for one hour max
export const revalidate = 3600;

export default async function PricingPage() {
  const [prices, products] = await Promise.all([
    getStripePrices(),
    getStripeProducts(),
  ]);

  const proPlan = products.find((product) => product.name === 'Pro');
  const unlimitedPlan = products.find((product) => product.name === 'Unlimited');

  const proPrice = prices.find((price) => price.productId === proPlan?.id);
  const unlimitedPrice = prices.find((price) => price.productId === unlimitedPlan?.id);

  return (
    <main className="min-h-screen bg-gradient-to-b from-gray-50 to-white dark:from-gray-900 dark:to-gray-800 py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
            Velg din plan
          </h1>
          <p className="text-xl text-gray-600 dark:text-gray-300">
            Oppgrader for å få flere tekstforbedringer hver dag
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
          {/* Free Plan */}
          <div className="pt-6 border border-gray-200 dark:border-gray-700 rounded-lg p-6 bg-white dark:bg-gray-800">
            <h2 className="text-2xl font-medium text-gray-900 dark:text-white mb-2">
              Gratis
            </h2>
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
              Prøv tjenesten gratis
            </p>
            <p className="text-4xl font-medium text-gray-900 dark:text-white mb-6">
              $0{' '}
              <span className="text-xl font-normal text-gray-600 dark:text-gray-400">
                / måned
              </span>
            </p>
            <ul className="space-y-4 mb-8">
              <li className="flex items-start">
                <Check className="h-5 w-5 text-orange-500 mr-2 mt-0.5 flex-shrink-0" />
                <span className="text-gray-700 dark:text-gray-300">
                  3 forbedringer per dag (anonym)
                </span>
              </li>
              <li className="flex items-start">
                <Check className="h-5 w-5 text-orange-500 mr-2 mt-0.5 flex-shrink-0" />
                <span className="text-gray-700 dark:text-gray-300">
                  4 forbedringer per dag (registrert)
                </span>
              </li>
              <li className="flex items-start">
                <Check className="h-5 w-5 text-orange-500 mr-2 mt-0.5 flex-shrink-0" />
                <span className="text-gray-700 dark:text-gray-300">
                  5 bonus forbedringer ved registrering
                </span>
              </li>
              <li className="flex items-start">
                <Check className="h-5 w-5 text-orange-500 mr-2 mt-0.5 flex-shrink-0" />
                <span className="text-gray-700 dark:text-gray-300">
                  Prompt og e-post forbedring
                </span>
              </li>
            </ul>
            <a
              href="/sign-up"
              className="w-full inline-block text-center py-2 px-4 border border-gray-300 dark:border-gray-600 rounded-lg text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600"
            >
              Kom i gang gratis
            </a>
          </div>

          {/* Pro Plan */}
          <PricingCard
            name="Pro"
            price={proPrice?.unitAmount || 990}
            interval={proPrice?.interval || 'month'}
            trialDays={proPrice?.trialPeriodDays || 14}
            features={[
              '50 forbedringer per dag',
              'Alt i Gratis, pluss:',
              'Prioritert AI-behandling',
              'Historikk over forbedringer',
              'E-poststøtte',
            ]}
            priceId={proPrice?.id}
            popular={true}
          />

          {/* Unlimited Plan */}
          <PricingCard
            name="Unlimited"
            price={unlimitedPrice?.unitAmount || 1990}
            interval={unlimitedPrice?.interval || 'month'}
            trialDays={unlimitedPrice?.trialPeriodDays || 14}
            features={[
              'Ubegrensede forbedringer',
              'Alt i Pro, pluss:',
              'Raskeste AI-behandling',
              'Eksporter til Word/PDF',
              'API-tilgang',
              'Prioritert 24/7 støtte',
            ]}
            priceId={unlimitedPrice?.id}
          />
        </div>

        <div className="mt-12 text-center">
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Alle betalte planer inkluderer 14 dagers gratis prøveperiode. Ingen kredittkort nødvendig.
          </p>
        </div>
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
  popular = false,
}: {
  name: string;
  price: number;
  interval: string;
  trialDays: number;
  features: string[];
  priceId?: string;
  popular?: boolean;
}) {
  return (
    <div className={`pt-6 border rounded-lg p-6 relative ${
      popular
        ? 'border-orange-500 bg-orange-50 dark:bg-orange-900/20'
        : 'border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800'
    }`}>
      {popular && (
        <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
          <span className="bg-orange-500 text-white px-4 py-1 rounded-full text-sm font-medium">
            Mest populær
          </span>
        </div>
      )}
      <h2 className="text-2xl font-medium text-gray-900 dark:text-white mb-2">{name}</h2>
      <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
        med {trialDays} dagers gratis prøveperiode
      </p>
      <p className="text-4xl font-medium text-gray-900 dark:text-white mb-6">
        ${price / 100}{' '}
        <span className="text-xl font-normal text-gray-600 dark:text-gray-400">
          / {interval === 'month' ? 'måned' : 'år'}
        </span>
      </p>
      <ul className="space-y-4 mb-8">
        {features.map((feature, index) => (
          <li key={index} className="flex items-start">
            <Check className="h-5 w-5 text-orange-500 mr-2 mt-0.5 flex-shrink-0" />
            <span className="text-gray-700 dark:text-gray-300">{feature}</span>
          </li>
        ))}
      </ul>
      <form action={checkoutAction}>
        <input type="hidden" name="priceId" value={priceId} />
        <SubmitButton />
      </form>
    </div>
  );
}
