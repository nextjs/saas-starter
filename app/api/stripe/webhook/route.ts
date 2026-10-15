import type Stripe from 'stripe';
import { handleSubscriptionChange, getStripe } from '@/lib/payments/stripe';
import { isStripeWebhookEnabled } from '@/lib/payments/config';
import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  if (!isStripeWebhookEnabled()) {
    return NextResponse.json({ error: 'Payments are disabled.' }, { status: 503 });
  }

  const stripe = getStripe();
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET!;
  const payload = await request.text();
  const signature = request.headers.get('stripe-signature') as string;

  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(payload, signature, webhookSecret);
  } catch (err) {
    console.error('Webhook signature verification failed.', err);
    return NextResponse.json(
      { error: 'Webhook signature verification failed.' },
      { status: 400 }
    );
  }

  switch (event.type) {
    case 'customer.subscription.updated':
    case 'customer.subscription.deleted':
      const subscription = event.data.object as Stripe.Subscription;
      await handleSubscriptionChange(subscription);
      break;
    default:
      console.log(`Unhandled event type ${event.type}`);
  }

  return NextResponse.json({ received: true });
}
