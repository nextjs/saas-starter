import { getStripePrices, getStripeProducts } from '@/lib/payments/stripe';
import { PricingTiers } from '@/components/pricing/pricing-tiers';

export const revalidate = 3600;

export default async function PricingPage() {
    const [prices, products] = await Promise.all([
        getStripePrices(),
        getStripeProducts(),
    ]);

    return (
        <main className="py-12">
            <PricingTiers products={products} prices={prices} />
        </main>
    );
}