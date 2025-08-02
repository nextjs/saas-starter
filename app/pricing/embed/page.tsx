import { getStripePrices, getStripeProducts } from '@/lib/payments/stripe';
import { PricingTiers } from '@/components/pricing/pricing-tiers';

// Stale-while-revalidate for one hour.
export const revalidate = 3600;

export default async function EmbeddablePricingPage() {
    const [prices, products] = await Promise.all([
        getStripePrices(),
        getStripeProducts(),
    ]);

    return (
        <div className="bg-background text-foreground p-4 sm:p-6 lg:p-8">
            <PricingTiers products={products} prices={prices} />
        </div>
    );
}