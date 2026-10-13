import { checkoutAction } from "@/lib/payments/actions";
import { Check } from "lucide-react";
import { getStripePrices, getStripeProducts } from "@/lib/payments/stripe";
import { SubmitButton } from "./submit-button";
import type { StripePrice, StripeProduct } from "@/types/stripe";

// Prices are fresh for one hour max
export const revalidate = 3600;

export default async function PricingPage() {
  const [prices, products]: [StripePrice[], StripeProduct[]] =
    await Promise.all([getStripePrices(), getStripeProducts()]);

  return (
    <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div>
        <h1 className="text-3xl font-bold text-gray-900 mb-4">
          Custom 3D Design
        </h1>
        <p className="text-gray-600 mb-8">
          Please Contact us for a custom quote. We will work with you to create
          a custom 3D design that meets your needs and budget.
        </p>
      </div>
      <div className="grid md:grid-cols-2 gap-8 max-w-xl mx-auto">
        {products
          .filter((p) => p.active && p.type === "service")
          .map((price) => (
            <PricingCard
              key={price.id}
              name={price?.name || "Base"}
              price={0}
              interval="once"
              trialDays={0}
              // price={price?.unitAmount || 800}
              // interval={price?.interval || "month"}
              // trialDays={price?.trialPeriodDays || 7}
              features={[
                "Unlimited Usage",
                "Unlimited Workspace Members",
                "Email Support",
              ]}
              priceId={price?.id}
            />
          ))}
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
}: {
  name: string;
  price: number;
  interval: string;
  trialDays: number;
  features: string[];
  priceId?: string;
}) {
  return (
    <div className="pt-6">
      <h2 className="text-2xl font-medium text-gray-900 mb-2">{name}</h2>
      <p className="text-sm text-gray-600 mb-4">
        with {trialDays} day free trial
      </p>
      <p className="text-4xl font-medium text-gray-900 mb-6">
        ${price / 100}{" "}
        <span className="text-xl font-normal text-gray-600">
          per user / {interval}
        </span>
      </p>
      <ul className="space-y-4 mb-8">
        {features.map((feature, index) => (
          <li key={index} className="flex items-start">
            <Check className="h-5 w-5 text-orange-500 mr-2 mt-0.5 flex-shrink-0" />
            <span className="text-gray-700">{feature}</span>
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
