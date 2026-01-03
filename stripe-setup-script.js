const Stripe = require('stripe');

async function setupBillingMeter(stripe) {
  try {
    const meter = await stripe.billing.meters.create({
      display_name: 'Credit Usage',
      event_name: 'credit_usage',
      value_settings: {
        aggregation: 'sum',
      },
    });
    console.log('Billing meter created successfully:');
    console.log(`Meter ID: ${meter.id}`);
    console.log(`Display Name: ${meter.display_name}`);
    console.log(`Event Name: ${meter.event_name}`);
    return meter.id;
  } catch (error) {
    if (error.code === 'resource_already_exists') {
      console.log('Billing meter "Credit Usage" already exists.');
      // Find and return the existing meter ID
      const meters = await stripe.billing.meters.list();
      const existingMeter = meters.data.find(m => m.display_name === 'Credit Usage');
      if (existingMeter) {
        console.log(`Found existing meter ID: ${existingMeter.id}`);
        return existingMeter.id;
      }
    } else {
      console.error('Error creating billing meter:', error.message);
      throw error;
    }
  }
}

async function createMeteredPrice(stripe, productId, meterId) {
  try {
    const price = await stripe.prices.create({
      product: productId,
      currency: 'usd',
      recurring: {
        interval: 'month',
        usage_type: 'metered',
      },
      billing_scheme: 'per_unit',
      unit_amount: 0, // No per-unit cost, usage is reported
      tax_behavior: 'unspecified',
      // The meter ID is not directly linked at price creation,
      // but through subscription items.
    });
    console.log(`Metered price created for product ${productId}: ${price.id}`);
    return price.id;
  } catch (error) {
    console.error(`Error creating metered price for product ${productId}:`, error.message);
    throw error;
  }
}

async function updateSubscriptionWithMeteredPrice(stripe, subscriptionId, meteredPriceId, meterId) {
  try {
    const subscription = await stripe.subscriptions.retrieve(subscriptionId);

    // Check if the metered price is already on the subscription
    const hasMeteredPrice = subscription.items.data.some(
      (item) => item.price.id === meteredPriceId
    );

    if (hasMeteredPrice) {
      console.log(`Subscription ${subscriptionId} already has the metered price.`);
      return;
    }

    await stripe.subscriptionItems.create({
      subscription: subscriptionId,
      price: meteredPriceId,
      metadata: {
        stripe_meter_id: meterId,
      },
    });
    console.log(`Added metered price to subscription ${subscriptionId}`);
  } catch (error) {
    console.error(`Error updating subscription ${subscriptionId}:`, error.message);
    throw error;
  }
}

async function setup() {
  const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
    apiVersion: '2024-04-10',
  });

  console.log('Setting up Stripe billing meter...');
  const meterId = await setupBillingMeter(stripe);

  if (meterId) {
    console.log('\nSetup complete.');
    console.log('Add this to your .env file:');
    console.log(`STRIPE_CREDIT_METER_ID=${meterId}`);
  }
}

async function fullSetup() {
  const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
    apiVersion: '2024-04-10',
  });

  console.log('Starting full Stripe setup for credit system...');
  const meterId = await setupBillingMeter(stripe);
  if (!meterId) {
    console.error('Could not create or find billing meter. Aborting.');
    return;
  }

  console.log('\nFetching all active products...');
  const products = await stripe.products.list({ active: true });

  for (const product of products.data) {
    console.log(`\nProcessing product: ${product.name} (${product.id})`);

    // Check if a metered price already exists
    const prices = await stripe.prices.list({ product: product.id });
    const existingMeteredPrice = prices.data.find(
      p => p.recurring && p.recurring.usage_type === 'metered'
    );

    let meteredPriceId;
    if (existingMeteredPrice) {
      meteredPriceId = existingMeteredPrice.id;
      console.log(`Found existing metered price: ${meteredPriceId}`);
    } else {
      meteredPriceId = await createMeteredPrice(stripe, product.id, meterId);
    }

    if (!meteredPriceId) continue;

    console.log(`Fetching subscriptions for product ${product.id}...`);
    const subscriptions = await stripe.subscriptions.list({
      price: prices.data.find(p => p.type === 'recurring' && p.recurring.usage_type !== 'metered')?.id,
      status: 'active',
      limit: 100, // Adjust limit as needed
    });

    if (subscriptions.data.length === 0) {
      console.log('No active subscriptions found for this product.');
      continue;
    }

    for (const subscription of subscriptions.data) {
      await updateSubscriptionWithMeteredPrice(stripe, subscription.id, meteredPriceId, meterId);
    }
  }

  console.log('\nFull setup complete.');
  console.log('Add this to your .env file if you haven\'t already:');
  console.log(`STRIPE_CREDIT_METER_ID=${meterId}`);
}

async function testGrant(customerId, credits) {
  const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
    apiVersion: '2024-04-10',
  });

  console.log(`Granting ${credits} credits to customer ${customerId}...`);
  try {
    const grant = await stripe.billing.creditGrants.create({
      customer: customerId,
      amount: credits * 100, // Assuming 1 credit = $0.01, adjust as needed
      description: `Test grant of ${credits} credits`,
    });
    console.log('Credit grant successful:', grant);
  } catch (error) {
    console.error('Error granting credits:', error.message);
  }
}

const command = process.argv[2];
const args = process.argv.slice(3);

switch (command) {
  case 'setup':
    setup();
    break;
  case 'full-setup':
    fullSetup();
    break;
  case 'test-grant':
    if (args.length < 2) {
      console.log('Usage: node stripe-setup-script.js test-grant <customer_id> <credits>');
    } else {
      testGrant(args[0], parseInt(args[1], 10));
    }
    break;
  default:
    console.log('Usage:');
    console.log('  node stripe-setup-script.js setup - Creates the billing meter.');
    console.log('  node stripe-setup-script.js full-setup - Sets up meter and updates all subscriptions.');
    console.log('  node stripe-setup-script.js test-grant <customer_id> <credits> - Grants test credits.');
}
