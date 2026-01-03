import { db } from '@/lib/db/drizzle';
import { teams, creditUsageLogs, creditGrantsLogs } from '@/lib/db/schema';
import { stripe } from '@/lib/payments/stripe';
import { eq } from 'drizzle-orm';
import { InsufficientCreditsError } from '@/lib/errors';

const CREDIT_PLANS = {
    'price_basic_monthly': { credits: 100, name: 'Basic' },
    'price_pro_monthly': { credits: 500, name: 'Pro' },
    'price_enterprise_monthly': { credits: 2000, name: 'Enterprise' },
    'price_basic_yearly': { credits: 1200, name: 'Basic (Yearly)' },
    'price_pro_yearly': { credits: 6000, name: 'Pro (Yearly)' },
    'price_enterprise_yearly': { credits: 24000, name: 'Enterprise (Yearly)' },
};

class CreditService {
    async getCreditBalance(teamId: number) {
        const team = await db.select().from(teams).where(eq(teams.id, teamId));
        if (!team.length) {
            throw new Error('Team not found');
        }
        return {
            balance: team[0].creditBalance,
            limit: team[0].creditLimit,
            usage: team[0].creditLimit - team[0].creditBalance,
        };
    }

    async useCredits(
        teamId: number,
        userId: number | null,
        credits: number,
        actionType: string,
        description?: string,
        metadata?: object
    ) {
        const team = await db.select().from(teams).where(eq(teams.id, teamId));
        if (!team.length) {
            throw new Error('Team not found');
        }

        if (team[0].creditBalance < credits) {
            throw new InsufficientCreditsError('Insufficient credits');
        }

        const newBalance = team[0].creditBalance - credits;
        await db.update(teams).set({ creditBalance: newBalance }).where(eq(teams.id, teamId));

        await db.insert(creditUsageLogs).values({
            teamId,
            userId,
            creditsUsed: credits,
            actionType,
            description,
            metadata: metadata ? JSON.stringify(metadata) : null,
        });

        if (team[0].stripeMeterId && team[0].stripeSubscriptionId) {
            await stripe.billing.meterEvents.create({
                event_name: 'credit_usage',
                payload: {
                    value: credits,
                    stripe_customer_id: team[0].stripeCustomerId,
                },
            });
        }

        return {
            balance: newBalance,
            limit: team[0].creditLimit,
            usage: team[0].creditLimit - newBalance,
        };
    }

    async grantCreditsForSubscription(subscription: any) {
        const team = await db.select().from(teams).where(eq(teams.stripeSubscriptionId, subscription.id));
        if (!team.length) {
            console.warn(`No team found for subscription ${subscription.id}`);
            return;
        }

        const plan = CREDIT_PLANS[subscription.items.data[0].price.id];
        if (!plan) {
            console.warn(`No credit plan found for price ${subscription.items.data[0].price.id}`);
            return;
        }

        const creditsToGrant = plan.credits;
        const newLimit = creditsToGrant;
        const newBalance = creditsToGrant;

        await db.update(teams).set({
            creditLimit: newLimit,
            creditBalance: newBalance,
            creditsGrantedThisPeriod: creditsToGrant,
            billingPeriodStart: new Date(subscription.current_period_start * 1000),
            billingPeriodEnd: new Date(subscription.current_period_end * 1000),
            stripeMeterId: process.env.STRIPE_CREDIT_METER_ID,
        }).where(eq(teams.id, team[0].id));

        await db.insert(creditGrantsLogs).values({
            teamId: team[0].id,
            creditsGranted: creditsToGrant,
            grantReason: 'subscription_payment',
            stripeGrantId: subscription.latest_invoice,
            billingPeriodStart: new Date(subscription.current_period_start * 1000),
            billingPeriodEnd: new Date(subscription.current_period_end * 1000),
        });
    }
}

export const creditService = new CreditService();
