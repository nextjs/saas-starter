import dotenv from 'dotenv';
import Stripe from 'stripe';

dotenv.config();

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2025-04-30.basil'
});

const PRODUCTS = [
  {
    name: 'OpsTrace Shop',
    unitAmount: 29900,
    metadata: { tier: 'shop', jobLimit: '100', userLimit: '3' }
  },
  {
    name: 'OpsTrace Production',
    unitAmount: 49900,
    metadata: {
      tier: 'production',
      jobLimit: 'unlimited',
      userLimit: '10'
    }
  },
  {
    name: 'OpsTrace Enterprise',
    unitAmount: 79900,
    metadata: {
      tier: 'enterprise',
      jobLimit: 'unlimited',
      userLimit: 'unlimited'
    }
  }
] as const;

async function findProductByName(name: string): Promise<Stripe.Product | null> {
  const result = await stripe.products.search({
    query: `name:'${name}' AND active:'true'`
  });

  return result.data[0] ?? null;
}

async function seedStripe() {
  for (const productDef of PRODUCTS) {
    let product = await findProductByName(productDef.name);

    if (!product) {
      product = await stripe.products.create({
        name: productDef.name,
        metadata: productDef.metadata
      });
    }

    const price = await stripe.prices.create({
      product: product.id,
      unit_amount: productDef.unitAmount,
      currency: 'usd',
      recurring: {
        interval: 'month'
      }
    });

    console.log(`${productDef.name}:`);
    console.log(`  Product ID: ${product.id}`);
    console.log(`  Price ID: ${price.id}`);
  }
}

seedStripe()
  .then(() => {
    process.exit(0);
  })
  .catch((error) => {
    console.error('Stripe seed failed:', error);
    process.exit(1);
  });
