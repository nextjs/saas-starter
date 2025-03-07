import { stripe } from '../payments/stripe';
import { db } from './drizzle';
import { users, teams, teamMembers } from './schema';
import { hashPassword } from '@/lib/auth/session';
import { eq } from 'drizzle-orm';
// Import the correct PostgreSQL type from drizzle-orm
import { type PostgresJsDatabase } from 'drizzle-orm/postgres-js';

// No need for type assertion anymore since db is properly typed in drizzle.ts

async function createStripeProducts() {
  // Skip Stripe product creation if no valid API key is provided
  if (!process.env.STRIPE_SECRET_KEY || process.env.STRIPE_SECRET_KEY === 'xxxxxxx') {
    console.log('Skipping Stripe product creation (no valid API key provided)');
    return;
  }

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

async function seed() {
  const email = 'test@test.com';
  const password = 'admin123';
  
  // Check if user already exists
  const existingUser = await db.select().from(users).where(eq(users.email, email)).limit(1);
  
  let user;
  
  if (existingUser.length === 0) {
    // User doesn't exist, create it
    const passwordHash = await hashPassword(password);
    
    [user] = await db
      .insert(users)
      .values([
        {
          email: email,
          passwordHash: passwordHash,
          role: "owner",
        },
      ])
      .returning();
      
    console.log('Initial user created.');
  } else {
    // User already exists
    user = existingUser[0];
    console.log('User already exists, skipping creation.');
  }

  // Check if team already exists for this user
  const existingTeamMember = await db
    .select()
    .from(teamMembers)
    .where(eq(teamMembers.userId, user.id))
    .limit(1);
    
  if (existingTeamMember.length === 0) {
    // Create team and team member
    const [team] = await db
      .insert(teams)
      .values({
        name: 'Test Team',
      })
      .returning();

    await db.insert(teamMembers).values({
      teamId: team.id,
      userId: user.id,
      role: 'owner',
    });
    
    console.log('Team and team member created.');
  } else {
    console.log('Team membership already exists, skipping creation.');
  }

  try {
    await createStripeProducts();
  } catch (error: any) {
    console.log('Skipping Stripe product creation due to error:', error.message);
  }
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
