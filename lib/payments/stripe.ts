//<file path="lib/payments/stripe.ts">
import Stripe from 'stripe';
import { redirect } from 'next/navigation';
import { Team } from '@/lib/db/schema';
import {
  getTeamByStripeCustomerId,
  getUser,
  updateTeamSubscription
} from '@/lib/db/queries';

export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2025-04-30.basil'
});

async function getDevicePrice(interval: 'month' | 'year'): Promise<string | null> {
  const products = await stripe.products.list({ active: true });
  const deviceProduct = products.data.find(p => p.name === 'Device');

  if (!deviceProduct) {
    console.error("Device Subscription product not found in Stripe.");
    return null;
  }

  const prices = await stripe.prices.list({ product: deviceProduct.id, active: true });
  const price = prices.data.find(p => p.recurring?.interval === interval);
  return price ? price.id : null;
}

export async function createCheckoutSession({
                                              team,
                                              priceId,
                                              deviceCount,
                                              interval,
                                            }: {
  team: Team | null;
  priceId: string;
  deviceCount: number;
  interval: 'month' | 'year';
}) {
  const user = await getUser();

  if (!team || !user) {
    const redirectParams = new URLSearchParams({
      redirect: 'checkout',
      priceId: priceId,
      deviceCount: deviceCount.toString(),
      interval: interval
    });
    redirect(`/auth/sign-up?${redirectParams.toString()}`);
  }

  if (!priceId) {
    throw new Error("Price ID is required for checkout.");
  }

  const line_items: Stripe.Checkout.SessionCreateParams.LineItem[] = [
    {
      price: priceId,
      quantity: 1,
    },
  ];

  if (deviceCount > 0) {
    const devicePriceId = await getDevicePrice(interval);
    if (!devicePriceId) {
      throw new Error("Could not find a price for the device subscription. Please ensure it's set up in Stripe.");
    }
    line_items.push({
      price: devicePriceId,
      quantity: deviceCount,
    });
  }

  const session = await stripe.checkout.sessions.create({
    payment_method_types: ['card'],
    line_items: line_items,
    mode: 'subscription',
    success_url: `${process.env.BASE_URL}/api/stripe/checkout?session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `${process.env.BASE_URL}/pricing`,
    customer: team.stripeCustomerId || undefined,
    client_reference_id: user.id.toString(),
    allow_promotion_codes: true,
  });

  redirect(session.url!);
}

export async function createCustomerPortalSession(team: Team) {
  if (!team.stripeCustomerId) {
    // A team must be a Stripe customer to manage their subscription.
    // If they don't have a subscription, they should go to the pricing page.
    redirect('/pricing');
  }

  let configuration: Stripe.BillingPortal.Configuration;
  const configurations = await stripe.billingPortal.configurations.list({ active: true });

  if (configurations.data.length > 0) {
    configuration = configurations.data[0];
  } else {
    // If no configuration exists, create a default one.
    // This generic configuration will apply to all products and is more robust.
    configuration = await stripe.billingPortal.configurations.create({
      business_profile: {
        headline: 'Manage your subscription'
      },
      features: {
        subscription_update: {
          enabled: true,
          default_allowed_updates: ['price', 'quantity', 'promotion_code'],
          proration_behavior: 'create_prorations',
          // By not specifying `products`, this configuration applies to all of them.
        },
        subscription_cancel: {
          enabled: true,
          mode: 'at_period_end',
          cancellation_reason: {
            enabled: true,
            options: [
              'too_expensive',
              'missing_features',
              'switched_service',
              'unused',
              'other'
            ]
          }
        },
        payment_method_update: {
          enabled: true
        },
        invoice_history: {
          enabled: true
        }
      }
    });
  }

  return stripe.billingPortal.sessions.create({
    customer: team.stripeCustomerId,
    return_url: `${process.env.BASE_URL}/dashboard/team`,
    configuration: configuration.id
  });
}

export async function handleSubscriptionChange(
    subscription: Stripe.Subscription
) {
  const customerId = subscription.customer as string;
  const subscriptionId = subscription.id;
  const status = subscription.status;

  const team = await getTeamByStripeCustomerId(customerId);

  if (!team) {
    console.error('Team not found for Stripe customer:', customerId);
    return;
  }

  if (status === 'active' || status === 'trialing') {
    const plan = subscription.items.data[0]?.plan;
    await updateTeamSubscription(team.id, {
      stripeSubscriptionId: subscriptionId,
      stripeProductId: plan?.product as string,
      planName: (plan?.product as Stripe.Product).name,
      subscriptionStatus: status
    });
  } else if (status === 'canceled' || status === 'unpaid') {
    await updateTeamSubscription(team.id, {
      stripeSubscriptionId: null,
      stripeProductId: null,
      planName: null,
      subscriptionStatus: status
    });
  }
}

export async function getStripePrices() {
  const prices = await stripe.prices.list({
    expand: ['data.product'],
    active: true,
    type: 'recurring'
  });
  console.log('Stripe prices: ', prices);
  return prices.data.map((price) => ({
    id: price.id,
    productId:
        typeof price.product === 'string' ? price.product : price.product.id,
    unitAmount: price.unit_amount,
    currency: price.currency,
    interval: price.recurring?.interval,
    trialPeriodDays: price.recurring?.trial_period_days
  }));
}

export async function getStripeProducts() {
  const products = await stripe.products.list({
    active: true,
    expand: ['data.default_price']
  });
  console.log('Stripe products: ', products);
  return products.data.map((product) => ({
    id: product.id,
    name: product.name,
    description: product.description,
    defaultPriceId:
        typeof product.default_price === 'string'
            ? product.default_price
            : product.default_price?.id
  }));
}