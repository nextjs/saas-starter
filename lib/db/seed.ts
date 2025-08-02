import { stripe } from '../payments/stripe';
import { db } from './drizzle';
import { users, teams, teamMembers } from './schema';
import { createClient } from '@supabase/supabase-js';

async function createStripeProducts() {
  console.log('Deleting existing Stripe products and prices...');
  const existingProducts = await stripe.products.list({ limit: 100 });
  for (const product of existingProducts.data) {
    await stripe.products.update(product.id, { active: false });
  }
  const existingPrices = await stripe.prices.list({ limit: 100 });
  for (const price of existingPrices.data) {
    await stripe.prices.update(price.id, { active: false });
  }
  console.log('Existing products and prices deactivated.');

  console.log('Creating new Stripe products and prices...');

  const plans = [
    {
      name: 'Standard',
      description: 'Essential AI agents for restaurant operations',
      priceCalculation: () => 399
    },
    {
      name: 'Pro - Drive Thru',
      description: 'Enhanced with a specialized Drive Thru agent',
      priceCalculation: () => (399 + 299) * (1 - 0.10) // Base + DriveThru with 10% discount
    },
    {
      name: 'Pro - Hospitality',
      description: 'Enhanced with a specialized Booking agent',
      priceCalculation: () => (399 + 199) * (1 - 0.10) // Base + Hospitality with 10% discount
    },
    {
      name: 'All Inclusive',
      description: 'Complete AI solution with all agents',
      priceCalculation: () => (399 + 299 + 199) * (1 - 0.15) // All agents with 15% discount
    }
  ];

  for (const plan of plans) {
    const product = await stripe.products.create({
      name: plan.name,
      description: plan.description,
    });
    const monthlyPrice = Math.round(plan.priceCalculation());
    const yearlyPrice = Math.round(monthlyPrice * 12 * 0.9);
    await stripe.prices.create({ product: product.id, unit_amount: monthlyPrice * 100, currency: 'usd', recurring: { interval: 'month' } });
    await stripe.prices.create({ product: product.id, unit_amount: yearlyPrice * 100, currency: 'usd', recurring: { interval: 'year' } });
    console.log(`Created product: ${plan.name}`);
  }

  // --- Create Device Add-on Product ---
  console.log('Creating Device Add-on product...');
  const deviceProduct = await stripe.products.create({
    name: 'Device Subscription',
    description: 'iPad Air 13-inch and Stand + includes device warranty, updates, and remote support',
  });

  await stripe.prices.create({
    product: deviceProduct.id,
    unit_amount: 9900, // $99 in cents
    currency: 'usd',
    recurring: { interval: 'month' },
  });
  await stripe.prices.create({
    product: deviceProduct.id,
    unit_amount: Math.round(9900 * 12),
    currency: 'usd',
    recurring: { interval: 'year' },
  });
  console.log('Device Add-on product created successfully.');

  console.log('Stripe products and prices creation finished.');
}


async function seed() {
  const supabaseAdmin = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!,
      { auth: { autoRefreshToken: false, persistSession: false } }
  );

  const email = 'test@test.com';
  const password = 'admin123';
  const { data: { users: existingUsers } } = await supabaseAdmin.auth.admin.listUsers();
  const userExists = existingUsers.some(u => u.email === email);

  if (!userExists) {
    const { data: { user: authUser }, error } = await supabaseAdmin.auth.admin.createUser({ email, password, email_confirm: true });
    if (error || !authUser) { console.error('Error creating seed user:', error); process.exit(1); }
    const [user] = await db.insert(users).values([{ id: authUser.id, email: email, role: "owner" }]).returning();
    console.log('Initial user and profile created.');
    const [team] = await db.insert(teams).values({ name: 'Test Team' }).returning();
    await db.insert(teamMembers).values({ teamId: team.id, userId: user.id, role: 'owner' });
  } else {
    console.log('Seed user already exists. Skipping user creation.');
  }

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