import { stripe } from '../payments/stripe';
import { connectToDatabase } from './mongodb';
import { User, Team } from './models';
import { hashPassword } from '@/lib/auth/session';

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

async function seed() {
  // Connect to MongoDB
  await connectToDatabase();

  const email = 'test@test.com';
  const password = 'admin123';
  const passwordHash = await hashPassword(password);

  // Create test team first
  const team = await Team.create({
    name: 'Test Team',
    members: [], // Will be updated after user creation
  });

  console.log('Initial team created.');

  // Create test user with team membership
  const user = await User.create({
    email: email,
    passwordHash: passwordHash,
    role: 'owner',
    teamMemberships: [
      {
        teamId: team._id,
        role: 'owner',
        joinedAt: new Date(),
      },
    ],
  });

  console.log('Initial user created.');

  // Update team with member details (denormalized)
  team.members = [
    {
      userId: user._id,
      name: user.name,
      email: user.email,
      role: 'owner',
      joinedAt: new Date(),
    },
  ];
  await team.save();

  console.log('Team updated with member.');

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
