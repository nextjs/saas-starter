import { checkoutAction } from '@/lib/payments/actions';
import { Check } from 'lucide-react';
import { SubmitButton } from './submit-button';
import { getPlans } from '@/lib/db/queries';

// 价格每天刷新一次， Next.js ISR function， 1 day = 86400 seconds
export const revalidate = 86400;

export default async function PricingPage() {
  // 直接从数据库获取plans数据
  const dbPlans = await getPlans();

  return (
    <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 min-h-[80vh]">
      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold text-foreground mb-4">Awesome, Simple Pricing</h1>
        <p className="text-l text-muted-foreground max-w-2xl mx-auto">
          Choose the plan that's what your needs.
        </p>
      </div>
      
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {dbPlans.map((plan) => (
          <PricingCard
            key={plan.id}
            name={plan.name}
            price={Number(plan.price)}
            interval={plan.interval}
            features={plan.features as string[] || []}
            priceId={plan.stripePriceId || undefined}
            // show popular plan
            popular={plan.name.toLowerCase().includes('pro')}
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
  features,
  priceId,
  popular = false,
}: {
  name: string;
  price: number;
  interval: string;
  features: string[];
  priceId?: string;
  popular?: boolean;
}) {
  return (
    <div className={`rounded-xl overflow-hidden transition-all duration-200 ${
      popular 
        ? 'bg-gradient-to-b from-orange-50 to-orange-100 dark:from-orange-950/30 dark:to-orange-900/20 border-orange-200 dark:border-orange-800 shadow-lg transform hover:-translate-y-1' 
        : 'bg-card border hover:shadow-md'
    } border p-6 flex flex-col h-full relative`}>
      {popular && (
        <div className="absolute top-0 right-0 bg-orange-500 text-white text-xs font-bold px-3 py-1 rounded-bl-lg">
          Hot
        </div>
      )}
      
      <h2 className="text-xl font-semibold text-foreground mb-2">{name}</h2>
      
      <div className="mb-6">
        <p className="text-3xl font-bold text-foreground">
          ${price}
        </p>
        <p className="text-sm text-muted-foreground">
          per user / {interval}
        </p>
      </div>
      
      <ul className="space-y-3 mb-8 flex-grow">
        {features.map((feature, index) => (
          <li key={index} className="flex items-start text-sm">
            <Check className="h-4 w-4 text-orange-500 mr-2 mt-0.5 flex-shrink-0" />
            <span className="text-foreground">{feature}</span>
          </li>
        ))}
      </ul>
      
      <form action={checkoutAction} className="mt-auto">
        <input type="hidden" name="priceId" value={priceId} />
        <SubmitButton 
          className={`w-full ${
            popular 
              ? 'bg-orange-500 hover:bg-orange-600 text-white' 
              : ''
          }`} 
        />
      </form>
    </div>
  );
}
