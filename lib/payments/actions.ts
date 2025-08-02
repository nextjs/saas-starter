//<file path="lib/payments/actions.ts">
'use server';

import { redirect } from 'next/navigation';
import { createCustomerPortalSession } from './stripe';
import { getTeamsForUser } from '@/lib/db/queries';
import { z } from 'zod';
import { validatedActionWithUser } from '../auth/middleware';

const customerPortalSchema = z.object({
  teamId: z.coerce.number()
});

export const customerPortalAction = validatedActionWithUser(customerPortalSchema, async (data, user) => {
  const { teamId } = data;

  // Get all teams for the user to verify membership
  const userTeams = await getTeamsForUser();
  const team = userTeams.find(t => t.id === teamId);

  if (!team) {
    // This is a safeguard; the UI should prevent this state.
    throw new Error("Team not found or user is not a member.");
  }

  const portalSession = await createCustomerPortalSession(team);
  redirect(portalSession.url);
});