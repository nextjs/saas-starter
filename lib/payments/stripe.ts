import Stripe from "stripe";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { auth } from "@/auth";
import type { Workspace } from "@prisma/client";

let _stripe: Stripe | null = null;

export function getStripe(): Stripe {
  if (!_stripe) {
    _stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
      apiVersion: "2025-04-30.basil",
    });
  }
  return _stripe;
}

export async function createCheckoutSession({
  workspace,
  priceId,
}: {
  workspace: Workspace | null;
  priceId: string;
}) {
  const session = await auth();

  if (!workspace || !session?.user?.id) {
    redirect(`/login`);
  }

  const checkoutSession = await getStripe().checkout.sessions.create({
    payment_method_types: ["card"],
    line_items: [{ price: priceId, quantity: 1 }],
    mode: "subscription",
    success_url: `${process.env.BASE_URL}/api/stripe/checkout?session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `${process.env.BASE_URL}/pricing`,
    customer: workspace.stripeCustomerId || undefined,
    client_reference_id: session.user.id,
    allow_promotion_codes: true,
    subscription_data: { trial_period_days: 14 },
  });

  redirect(checkoutSession.url!);
}

export async function createCustomerPortalSession(workspace: Workspace) {
  if (!workspace.stripeCustomerId || !workspace.stripeProductId) {
    redirect("/pricing");
  }

  const stripe = getStripe();

  let configuration: Stripe.BillingPortal.Configuration;
  const configurations = await stripe.billingPortal.configurations.list();

  if (configurations.data.length > 0) {
    configuration = configurations.data[0];
  } else {
    const product = await stripe.products.retrieve(workspace.stripeProductId);
    if (!product.active) {
      throw new Error("Workspace's product is not active in Stripe");
    }

    const prices = await stripe.prices.list({
      product: product.id,
      active: true,
    });
    if (prices.data.length === 0) {
      throw new Error("No active prices found for the workspace's product");
    }

    configuration = await stripe.billingPortal.configurations.create({
      business_profile: { headline: "Manage your subscription" },
      features: {
        subscription_update: {
          enabled: true,
          default_allowed_updates: ["price", "quantity", "promotion_code"],
          proration_behavior: "create_prorations",
          products: [
            {
              product: product.id,
              prices: prices.data.map((price) => price.id),
            },
          ],
        },
        subscription_cancel: {
          enabled: true,
          mode: "at_period_end",
          cancellation_reason: {
            enabled: true,
            options: [
              "too_expensive",
              "missing_features",
              "switched_service",
              "unused",
              "other",
            ],
          },
        },
        payment_method_update: { enabled: true },
      },
    });
  }

  return stripe.billingPortal.sessions.create({
    customer: workspace.stripeCustomerId,
    return_url: `${process.env.BASE_URL}/dashboard`,
    configuration: configuration.id,
  });
}

export async function handleSubscriptionChange(
  subscription: Stripe.Subscription
) {
  const customerId = subscription.customer as string;
  const subscriptionId = subscription.id;
  const status = subscription.status;

  const workspace = await prisma.workspace.findFirst({
    where: { stripeCustomerId: customerId },
  });

  if (!workspace) {
    console.error("Workspace not found for Stripe customer:", customerId);
    return;
  }

  if (status === "active" || status === "trialing") {
    const plan = subscription.items.data[0]?.plan;
    await prisma.workspace.update({
      where: { id: workspace.id },
      data: {
        stripeSubscriptionId: subscriptionId,
        stripeProductId: plan?.product as string,
        planName: (plan?.product as Stripe.Product).name,
        subscriptionStatus: status,
      },
    });
  } else if (status === "canceled" || status === "unpaid") {
    await prisma.workspace.update({
      where: { id: workspace.id },
      data: {
        stripeSubscriptionId: null,
        stripeProductId: null,
        planName: null,
        subscriptionStatus: status,
      },
    });
  }
}

export async function getStripePrices() {
  const prices = await getStripe().prices.list({
    expand: ["data.product"],
    active: true,
    type: "recurring",
  });

  return prices.data.map((price) => ({
    id: price.id,
    productId:
      typeof price.product === "string" ? price.product : price.product.id,
    unitAmount: price.unit_amount,
    currency: price.currency,
    interval: price.recurring?.interval,
    trialPeriodDays: price.recurring?.trial_period_days,
  }));
}

export async function getStripeProducts() {
  const products = await getStripe().products.list({
    active: true,
    expand: ["data.default_price"],
  });

  return products.data.map((product) => ({
    id: product.id,
    name: product.name,
    description: product.description,
    defaultPriceId:
      typeof product.default_price === "string"
        ? product.default_price
        : product.default_price?.id,
  }));
}
