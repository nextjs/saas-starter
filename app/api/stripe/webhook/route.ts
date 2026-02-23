import Stripe from 'stripe';
import { handleSubscriptionChange, stripe } from '@/lib/payments/stripe';
import { NextRequest, NextResponse } from 'next/server';
import {
  isStripeEventProcessed,
  markStripeEventProcessed,
  createCreditTransaction,
  getTeamByStripeCustomerId,
} from '@/lib/db/queries';
import { db } from '@/lib/db/drizzle';
import { teamMembers } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';

const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET!;

// Credit pack mappings (priceId -> credits)
const CREDIT_PACK_MAP: Record<string, { credits: number; name: string }> = {
  [process.env.STRIPE_PRICE_CREDITS_S || 'price_credits_s']: { credits: 500, name: 'Pack S' },
  [process.env.STRIPE_PRICE_CREDITS_M || 'price_credits_m']: { credits: 2000, name: 'Pack M' },
  [process.env.STRIPE_PRICE_CREDITS_L || 'price_credits_l']: { credits: 5000, name: 'Pack L' },
};

const MONTHLY_CREDITS_GRANT = 1000; // Credits given per subscription period

export async function POST(request: NextRequest) {
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

  // Idempotence check
  if (await isStripeEventProcessed(event.id)) {
    return NextResponse.json({ received: true, duplicate: true });
  }

  try {
    switch (event.type) {
      case 'customer.subscription.updated':
      case 'customer.subscription.deleted': {
        const subscription = event.data.object as Stripe.Subscription;
        await handleSubscriptionChange(subscription);
        break;
      }

      case 'invoice.paid': {
        const invoice = event.data.object as Stripe.Invoice;
        if ((invoice as any).subscription && invoice.customer) {
          const customerId = typeof invoice.customer === 'string' ? invoice.customer : invoice.customer.id;
          const team = await getTeamByStripeCustomerId(customerId);
          if (team) {
            // Find a team member to credit
            const members = await db
              .select()
              .from(teamMembers)
              .where(eq(teamMembers.teamId, team.id));

            for (const member of members) {
              await createCreditTransaction({
                userId: member.userId,
                type: 'grant',
                amount: MONTHLY_CREDITS_GRANT,
                reason: `Monthly subscription credit grant`,
                stripePaymentIntentId: (invoice as any).payment_intent as string || undefined,
              });
            }
          }
        }
        break;
      }

      case 'checkout.session.completed': {
        const session = event.data.object as Stripe.Checkout.Session;
        if (session.mode === 'payment' && session.client_reference_id) {
          // One-time credit pack purchase
          const userId = Number(session.client_reference_id);
          const lineItems = await stripe.checkout.sessions.listLineItems(session.id);
          const priceId = lineItems.data[0]?.price?.id;

          if (priceId && CREDIT_PACK_MAP[priceId]) {
            const pack = CREDIT_PACK_MAP[priceId];
            await createCreditTransaction({
              userId,
              type: 'purchase',
              amount: pack.credits,
              reason: `Credit pack purchase: ${pack.name}`,
              stripePaymentIntentId: session.payment_intent as string || undefined,
            });
          }
        }
        break;
      }

      default:
        console.log(`Unhandled event type ${event.type}`);
    }

    await markStripeEventProcessed(event.id);
  } catch (err) {
    console.error('Error processing webhook:', err);
    return NextResponse.json({ error: 'Processing failed' }, { status: 500 });
  }

  return NextResponse.json({ received: true });
}
