import { handleStripeWebhook } from '@/lib/services/stripe-webhook-handler';
import { NextRequest } from 'next/server';

export async function POST(request: NextRequest) {
  return handleStripeWebhook(request);
}
