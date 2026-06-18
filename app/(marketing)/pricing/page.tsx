import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { checkoutAction } from '@/lib/payments/actions';
import { getStripePrices, getStripeProducts } from '@/lib/payments/stripe';
import { ArrowRight, CheckCircle2 } from 'lucide-react';

export const metadata = {
  title: 'Pricing – OpsTrace',
  description:
    'Simple pricing for precision machine shops. Digital job travelers with inspection sign-offs, audit-ready records, and PDF export — built for AS9100, ISO 13485, and ITAR compliance.'
};

const tiers = [
  {
    name: 'Shop',
    price: 299,
    summary: 'Up to 100 jobs/month · 3 users',
    highlighted: false,
    features: [
      'Up to 100 active jobs per month',
      'Unlimited operations per job',
      'Inspection sign-off records',
      'PDF traveler export',
      'Audit log (90-day retention)',
      'Up to 3 team members',
      'Email support'
    ]
  },
  {
    name: 'Production',
    price: 499,
    summary: 'Unlimited jobs · up to 10 users',
    highlighted: true,
    features: [
      'Unlimited jobs per month',
      'Unlimited operations per job',
      'Inspection sign-off records',
      'PDF traveler export',
      'Audit log (2-year retention)',
      'Up to 10 team members',
      'Role-based access (operator / inspector / manager)',
      'Priority email support'
    ]
  },
  {
    name: 'Enterprise',
    price: 799,
    summary: 'Unlimited everything',
    highlighted: false,
    features: [
      'Everything in Production',
      'Unlimited team members',
      'Unlimited audit log retention',
      'Custom PDF traveler branding',
      'CSV/JSON data export',
      'Dedicated onboarding call',
      'Priority phone + email support',
      'SLA guarantee'
    ]
  }
] as const;

const faqs = [
  {
    question: 'What counts as a "job"?',
    answer:
      'A job is a single work order — one part number, one traveler. Each new work order you open counts toward your monthly job limit.'
  },
  {
    question: 'Can I upgrade or downgrade mid-month?',
    answer:
      'Yes. Changes take effect at the start of your next billing cycle. Your data and history are never affected.'
  },
  {
    question: 'Are inspection records locked after sign-off?',
    answer:
      'Yes. Once an inspector signs off an operation, the record is locked and timestamped. The sign-off cannot be edited — by design, for audit integrity.'
  },
  {
    question: 'Does OpsTrace support multiple shifts?',
    answer:
      'Yes. Every user gets their own login. Each sign-off is attributed to a named individual, so shift hand-offs are fully traceable.'
  },
  {
    question: 'Is my data exportable?',
    answer:
      'All plans can export individual job travelers as PDF. The Enterprise plan adds bulk CSV/JSON export for integration with your ERP or QMS.'
  }
];

function findPriceIdForTier(
  tierName: string,
  products: Awaited<ReturnType<typeof getStripeProducts>>,
  prices: Awaited<ReturnType<typeof getStripePrices>>
) {
  const product = products.find((p) =>
    p.name.toLowerCase().includes(tierName.toLowerCase())
  );
  if (!product) return undefined;
  return prices.find((price) => price.productId === product.id)?.id;
}

function TierCta({
  tierName,
  priceId
}: {
  tierName: string;
  priceId?: string;
}) {
  if (tierName === 'Enterprise') {
    return (
      <Button
        asChild
        variant="outline"
        className="w-full border-orange-600 text-orange-600 hover:bg-orange-50"
      >
        <Link href="mailto:hello@opstrace.io">
          Contact Sales
          <ArrowRight className="ml-2 h-4 w-4" />
        </Link>
      </Button>
    );
  }

  if (priceId) {
    return (
      <form action={checkoutAction}>
        <input type="hidden" name="priceId" value={priceId} />
        <Button
          type="submit"
          className="w-full bg-orange-600 hover:bg-orange-700 text-white"
        >
          Start Free Trial
        </Button>
      </form>
    );
  }

  return (
    <Button asChild className="w-full bg-orange-600 hover:bg-orange-700 text-white">
      <Link href="/sign-up">Start Free Trial</Link>
    </Button>
  );
}

export default async function PricingPage() {
  let prices: Awaited<ReturnType<typeof getStripePrices>> = [];
  let products: Awaited<ReturnType<typeof getStripeProducts>> = [];

  try {
    [prices, products] = await Promise.all([
      getStripePrices(),
      getStripeProducts()
    ]);
  } catch {
    // Stripe unavailable — fall back to sign-up links for Shop and Production
  }

  return (
    <main className="py-16 lg:py-24">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto mb-16">
          <h1 className="text-4xl font-bold tracking-tight text-gray-900 sm:text-5xl">
            Simple pricing for precision shops
          </h1>
          <p className="mt-4 text-lg text-gray-600">
            Digital job travelers with inspection sign-offs and audit-ready
            records. 14-day free trial on all plans — no credit card required.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
          {tiers.map((tier) => {
            const priceId =
              tier.name === 'Enterprise'
                ? undefined
                : findPriceIdForTier(tier.name, products, prices);

            return (
              <div
                key={tier.name}
                className={`relative rounded-2xl bg-white p-8 ${
                  tier.highlighted
                    ? 'border border-orange-500 ring-2 ring-orange-500 shadow-xl'
                    : 'border border-gray-200 shadow-sm'
                }`}
              >
                {tier.highlighted && (
                  <span className="absolute -top-3 left-1/2 -translate-x-1/2 inline-flex items-center rounded-full bg-orange-600 px-4 py-1 text-sm font-medium text-white">
                    Most Popular
                  </span>
                )}

                <h2 className="text-2xl font-bold text-gray-900">
                  {tier.name}
                </h2>
                <p className="mt-1 text-sm text-gray-500">{tier.summary}</p>
                <p className="mt-6">
                  <span className="text-4xl font-bold text-gray-900">
                    ${tier.price}
                  </span>
                  <span className="text-gray-500">/month</span>
                </p>

                <ul className="mt-8 space-y-3">
                  {tier.features.map((feature) => (
                    <li key={feature} className="flex items-start gap-2">
                      <CheckCircle2 className="h-5 w-5 text-orange-600 shrink-0 mt-0.5" />
                      <span className="text-sm text-gray-700">{feature}</span>
                    </li>
                  ))}
                </ul>

                <div className="mt-8">
                  <TierCta tierName={tier.name} priceId={priceId} />
                </div>
              </div>
            );
          })}
        </div>

        <section className="mt-20 pt-16 border-t border-gray-200">
          <h2 className="text-2xl font-bold text-gray-900 text-center mb-10">
            Common questions
          </h2>
          <dl className="max-w-3xl mx-auto space-y-8">
            {faqs.map((faq) => (
              <div key={faq.question}>
                <dt className="text-lg font-semibold text-gray-900">
                  {faq.question}
                </dt>
                <dd className="mt-2 text-gray-600 leading-relaxed">
                  {faq.answer}
                </dd>
              </div>
            ))}
          </dl>
        </section>
      </div>
    </main>
  );
}
