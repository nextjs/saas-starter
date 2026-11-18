import test, { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import ts from 'typescript';
import vm from 'node:vm';
import Stripe from 'stripe';

// Read and transpile lib/payments/stripe.ts
const stripeSource = fs.readFileSync('lib/payments/stripe.ts', 'utf8');

const transpiled = ts.transpileModule(stripeSource, {
  compilerOptions: {
    module: ts.ModuleKind.CommonJS,
    target: ts.ScriptTarget.ES2022,
    esModuleInterop: true,
  }
});

let updatedSubscriptions = [];
let customerTeamMap = new Map();

function createStripeModule() {
  updatedSubscriptions = [];
  customerTeamMap = new Map([
    ['cus_123', { id: 1, name: 'Team Alpha', planName: 'Old Plan' }],
  ]);

  const mockQueries = {
    getTeamByStripeCustomerId: async (customerId) => customerTeamMap.get(customerId) || null,
    getUser: async () => null,
    updateTeamSubscription: async (teamId, data) => {
      updatedSubscriptions.push({ teamId, ...data });
    },
  };

  const context = vm.createContext({
    process: { env: { STRIPE_SECRET_KEY: 'sk_test_mock' } },
    console,
    require: (id) => {
      if (id === 'stripe') return Stripe;
      if (id === 'next/navigation') return { redirect: () => {} };
      if (id === '@/lib/db/queries') return mockQueries;
      if (id === '@/lib/db/schema') return {};
      return require(id);
    },
    exports: {},
    module: { exports: {} },
  });

  const script = new vm.Script(transpiled.outputText);
  script.runInContext(context);
  return context.exports;
}

describe('handleSubscriptionChange – product normalization', () => {
  it('persists the product ID when plan.product is a plain string', async () => {
    const { handleSubscriptionChange } = createStripeModule();
    const subscription = {
      id: 'sub_string',
      customer: 'cus_123',
      status: 'active',
      items: {
        data: [
          {
            plan: {
              id: 'plan_123',
              product: 'prod_string_id_123',
            },
          },
        ],
      },
    };
    await handleSubscriptionChange(subscription);
    assert.equal(updatedSubscriptions.length, 1);
    assert.equal(updatedSubscriptions[0].stripeProductId, 'prod_string_id_123');
    assert.equal(updatedSubscriptions[0].subscriptionStatus, 'active');
  });

  it('persists the product ID when plan.product is an expanded object (bug scenario)', async () => {
    const { handleSubscriptionChange } = createStripeModule();
    const subscription = {
      id: 'sub_expanded',
      customer: 'cus_123',
      status: 'active',
      items: {
        data: [
          {
            plan: {
              id: 'plan_456',
              product: {
                id: 'prod_object_id_456',
                name: 'Pro Plan',
                object: 'product',
                active: true,
              },
            },
          },
        ],
      },
    };
    await handleSubscriptionChange(subscription);
    assert.equal(updatedSubscriptions.length, 1);
    // The critical regression check: must NOT be '[object Object]'
    assert.notEqual(updatedSubscriptions[0].stripeProductId, '[object Object]');
    assert.equal(updatedSubscriptions[0].stripeProductId, 'prod_object_id_456');
    assert.equal(updatedSubscriptions[0].planName, 'Pro Plan');
    assert.equal(updatedSubscriptions[0].subscriptionStatus, 'active');
  });

  it('extracts planName from expanded product object', async () => {
    const { handleSubscriptionChange } = createStripeModule();
    const subscription = {
      id: 'sub_name',
      customer: 'cus_123',
      status: 'trialing',
      items: {
        data: [
          {
            plan: {
              id: 'plan_789',
              product: {
                id: 'prod_789',
                name: 'Enterprise',
                object: 'product',
                active: true,
              },
            },
          },
        ],
      },
    };
    await handleSubscriptionChange(subscription);
    assert.equal(updatedSubscriptions.length, 1);
    assert.equal(updatedSubscriptions[0].planName, 'Enterprise');
    assert.equal(updatedSubscriptions[0].subscriptionStatus, 'trialing');
  });

  it('sets planName to null when plan.product is a string (not expanded)', async () => {
    const { handleSubscriptionChange } = createStripeModule();
    const subscription = {
      id: 'sub_no_name',
      customer: 'cus_123',
      status: 'active',
      items: {
        data: [
          {
            plan: {
              id: 'plan_abc',
              product: 'prod_no_name_xyz',
            },
          },
        ],
      },
    };
    await handleSubscriptionChange(subscription);
    assert.equal(updatedSubscriptions.length, 1);
    assert.equal(updatedSubscriptions[0].stripeProductId, 'prod_no_name_xyz');
    assert.equal(updatedSubscriptions[0].planName, null);
  });

  it('nulls out subscription data on canceled status', async () => {
    const { handleSubscriptionChange } = createStripeModule();
    const subscription = {
      id: 'sub_cancel',
      customer: 'cus_123',
      status: 'canceled',
      items: { data: [] },
    };
    await handleSubscriptionChange(subscription);
    assert.equal(updatedSubscriptions.length, 1);
    assert.equal(updatedSubscriptions[0].stripeSubscriptionId, null);
    assert.equal(updatedSubscriptions[0].stripeProductId, null);
    assert.equal(updatedSubscriptions[0].planName, null);
    assert.equal(updatedSubscriptions[0].subscriptionStatus, 'canceled');
  });

  it('nulls out subscription data on unpaid status', async () => {
    const { handleSubscriptionChange } = createStripeModule();
    const subscription = {
      id: 'sub_unpaid',
      customer: 'cus_123',
      status: 'unpaid',
      items: { data: [] },
    };
    await handleSubscriptionChange(subscription);
    assert.equal(updatedSubscriptions.length, 1);
    assert.equal(updatedSubscriptions[0].stripeSubscriptionId, null);
    assert.equal(updatedSubscriptions[0].stripeProductId, null);
    assert.equal(updatedSubscriptions[0].planName, null);
    assert.equal(updatedSubscriptions[0].subscriptionStatus, 'unpaid');
  });

  it('does nothing when team is not found', async () => {
    const { handleSubscriptionChange } = createStripeModule();
    const subscription = {
      id: 'sub_unknown',
      customer: 'cus_unknown',
      status: 'active',
      items: { data: [{ plan: { id: 'plan_x', product: 'prod_x' } }] },
    };
    await handleSubscriptionChange(subscription);
    assert.equal(updatedSubscriptions.length, 0);
  });

  it('handles null product safely (stripeProductId becomes null)', async () => {
    const { handleSubscriptionChange } = createStripeModule();
    const subscription = {
      id: 'sub_null_prod',
      customer: 'cus_123',
      status: 'active',
      items: {
        data: [
          {
            plan: {
              id: 'plan_null',
              product: null,
            },
          },
        ],
      },
    };
    await handleSubscriptionChange(subscription);
    assert.equal(updatedSubscriptions.length, 1);
    assert.equal(updatedSubscriptions[0].stripeProductId, null);
    assert.equal(updatedSubscriptions[0].planName, null);
  });
});
