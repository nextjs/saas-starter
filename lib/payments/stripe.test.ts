import type Stripe from 'stripe';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { handleSubscriptionChange } from './stripe';

const mocks = vi.hoisted(() => ({
  retrieve: vi.fn(),
  getTeamByStripeCustomerId: vi.fn(),
  updateTeamSubscription: vi.fn()
}));

vi.mock('stripe', () => ({
  default: class {
    subscriptions = { retrieve: mocks.retrieve };
  }
}));

vi.mock('@/lib/db/queries', () => ({
  getTeamByStripeCustomerId: mocks.getTeamByStripeCustomerId,
  getUser: vi.fn(),
  updateTeamSubscription: mocks.updateTeamSubscription
}));

function subscription(id: string, status: Stripe.Subscription.Status, name: string) {
  const product = { id: `prod_${name.toLowerCase()}`, name };

  return {
    id,
    status,
    customer: 'cus_test',
    items: { data: [{ price: { product }, plan: { product } }] }
  } as Stripe.Subscription;
}

describe('handleSubscriptionChange', () => {
  beforeEach(() => {
    vi.resetAllMocks();
    mocks.getTeamByStripeCustomerId.mockResolvedValue({
      id: 42,
      stripeSubscriptionId: 'sub_current'
    });
  });

  it('writes the current plan when Stripe delivers an older update', async () => {
    mocks.retrieve.mockResolvedValue(
      subscription('sub_current', 'active', 'Pro')
    );

    await handleSubscriptionChange(
      subscription('sub_current', 'active', 'Basic')
    );

    expect(mocks.updateTeamSubscription).toHaveBeenCalledWith(42, {
      stripeSubscriptionId: 'sub_current',
      stripeProductId: 'prod_pro',
      planName: 'Pro',
      subscriptionStatus: 'active'
    });
    expect(mocks.retrieve).toHaveBeenCalledWith('sub_current', {
      expand: ['items.data.price.product']
    });
  });

  it('clears the current subscription if Stripe reports it canceled', async () => {
    mocks.retrieve.mockResolvedValue(
      subscription('sub_current', 'canceled', 'Pro')
    );

    await handleSubscriptionChange(
      subscription('sub_current', 'active', 'Pro')
    );

    expect(mocks.updateTeamSubscription).toHaveBeenCalledWith(42, {
      stripeSubscriptionId: null,
      stripeProductId: null,
      planName: null,
      subscriptionStatus: 'canceled'
    });
  });

  it('keeps a replacement subscription when the previous one is canceled', async () => {
    const canceled = subscription('sub_previous', 'canceled', 'Basic');
    mocks.retrieve.mockResolvedValue(canceled);

    await handleSubscriptionChange(canceled);

    expect(mocks.updateTeamSubscription).not.toHaveBeenCalled();
  });
});
