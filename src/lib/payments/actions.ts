'use server';

import { redirect } from 'next/navigation';
import { withTeam } from '../auth/middleware';
import { createCheckoutSession, createCustomerPortalSession } from './stripe';

export const checkoutAction = withTeam(async (formData, team) => {
  const priceId = formData.get('priceId') as string;
  await createCheckoutSession({ team: team, priceId });
});

export const customerPortalAction = withTeam(async (_, team) => {
  const portalSession = await createCustomerPortalSession(team);
  redirect(portalSession.url);
});
