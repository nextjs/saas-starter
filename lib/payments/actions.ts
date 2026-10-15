'use server';

import { redirect } from 'next/navigation';
import { createCheckoutSession, createCustomerPortalSession } from './stripe';
import { withTeam } from '@/lib/auth/middleware';
import { isPaymentsEnabled } from './config';

const checkoutWithTeam = withTeam(async (formData, team) => {
  const priceId = formData.get('priceId') as string;
  await createCheckoutSession({ team: team, priceId });
});

const customerPortalWithTeam = withTeam(async (_, team) => {
  const portalSession = await createCustomerPortalSession(team);
  redirect(portalSession.url);
});

export async function checkoutAction(formData: FormData) {
  if (!isPaymentsEnabled()) redirect('/pricing');
  return checkoutWithTeam(formData);
}

export async function customerPortalAction(formData: FormData) {
  if (!isPaymentsEnabled()) redirect('/pricing');
  return customerPortalWithTeam(formData);
}
