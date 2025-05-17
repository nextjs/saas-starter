import { stripe } from '../payments/stripe';
import { db } from './drizzle';
import { users, teams, teamMembers } from './schema';
import { hashPassword } from '@/lib/auth/session';

const DEFAULT_USER_EMAIL = 'test@test.com';
const DEFAULT_USER_PASSWORD = 'admin123';

async function createStripeProducts() {
  console.log('Creating Stripe products and prices...');

  const baseProduct = await stripe.products.create({
    name: 'Base',
    description: 'Base subscription plan',
  });

  await stripe.prices.create({
    product: baseProduct.id,
    unit_amount: 800, // $8 in cents
    currency: 'usd',
    recurring: {
      interval: 'month',
      trial_period_days: 7,
    },
  });

  const plusProduct = await stripe.products.create({
    name: 'Plus',
    description: 'Plus subscription plan',
  });

  await stripe.prices.create({
    product: plusProduct.id,
    unit_amount: 1200, // $12 in cents
    currency: 'usd',
    recurring: {
      interval: 'month',
      trial_period_days: 7,
    },
  });

  console.log('Stripe products and prices created successfully.');
}

async function createTeam() {
  const [team] = await db
    .insert(teams)
    .values({
      name: 'Test Team',
    })
  .returning();

  console.log(`Team "${team.name}" created.`);

  return team;
}

async function createUser({ teamId, role }: { teamId: number, role: string }) { 
  const email = DEFAULT_USER_EMAIL.replace('@', `+${role}@`);
  const password = await hashPassword(DEFAULT_USER_PASSWORD);
  const [user] = await db
    .insert(users)
    .values({
      email,
      passwordHash: password,
      role,
    })
    .returning();
  
  await db.insert(teamMembers).values({
    teamId,
    userId: user.id,
    role,
  });

  console.log(`User "${user.email}" created with role "${role}".`);

  return user;
}

async function seed() {
  const team = await createTeam();
  await Promise.all([
    createUser({ teamId: team.id, role: 'owner' }),
    createUser({ teamId: team.id, role: 'member' }),
  ]);

  await createStripeProducts();
}

seed()
  .catch((error) => {
    console.error('Seed process failed:', error);
    process.exit(1);
  })
  .finally(() => {
    console.log('Seed process finished. Exiting...');
    process.exit(0);
  });
