import { describe, it, expect, vi, beforeEach } from 'vitest';
import Stripe from 'stripe';

// Use vi.hoisted to define mocks that will be used in vi.mock()
const { mockPricesList, mockProductsList, mockProductsRetrieve, mockCheckoutSessionsCreate, mockBillingPortalConfigurationsList, mockBillingPortalConfigurationsCreate, mockBillingPortalSessionsCreate } = vi.hoisted(() => ({
  mockPricesList: vi.fn(),
  mockProductsList: vi.fn(),
  mockProductsRetrieve: vi.fn(),
  mockCheckoutSessionsCreate: vi.fn(),
  mockBillingPortalConfigurationsList: vi.fn(),
  mockBillingPortalConfigurationsCreate: vi.fn(),
  mockBillingPortalSessionsCreate: vi.fn()
}));

// Mock stripe module with a proper class constructor
vi.mock('stripe', () => {
  return {
    default: class MockStripe {
      prices = { list: mockPricesList };
      products = { list: mockProductsList, retrieve: mockProductsRetrieve };
      checkout = { sessions: { create: mockCheckoutSessionsCreate } };
      billingPortal = {
        configurations: { list: mockBillingPortalConfigurationsList, create: mockBillingPortalConfigurationsCreate },
        sessions: { create: mockBillingPortalSessionsCreate }
      };
      constructor() {}
    }
  };
});

// Mock database queries
vi.mock('@/lib/db/queries', () => ({
  getUser: vi.fn(),
  getTeamByStripeCustomerId: vi.fn(),
  updateTeamSubscription: vi.fn()
}));

import { getTeamByStripeCustomerId, updateTeamSubscription } from '@/lib/db/queries';

// Import after mocks are set up
import {
  stripe,
  getStripePrices,
  getStripeProducts,
  handleSubscriptionChange
} from './stripe';

describe('Stripe Integration', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('getStripePrices', () => {
    it('fetches and transforms prices correctly', async () => {
      const mockPrices = {
        data: [
          {
            id: 'price_123',
            product: 'prod_123',
            unit_amount: 1999,
            currency: 'usd',
            recurring: {
              interval: 'month',
              trial_period_days: 14
            }
          },
          {
            id: 'price_456',
            product: { id: 'prod_456' },
            unit_amount: 9999,
            currency: 'usd',
            recurring: {
              interval: 'year',
              trial_period_days: null
            }
          }
        ]
      };

      mockPricesList.mockResolvedValue(mockPrices);

      const result = await getStripePrices();

      expect(mockPricesList).toHaveBeenCalledWith({
        expand: ['data.product'],
        active: true,
        type: 'recurring'
      });

      expect(result).toEqual([
        {
          id: 'price_123',
          productId: 'prod_123',
          unitAmount: 1999,
          currency: 'usd',
          interval: 'month',
          trialPeriodDays: 14
        },
        {
          id: 'price_456',
          productId: 'prod_456',
          unitAmount: 9999,
          currency: 'usd',
          interval: 'year',
          trialPeriodDays: null
        }
      ]);
    });

    it('returns empty array when no prices', async () => {
      mockPricesList.mockResolvedValue({ data: [] });

      const result = await getStripePrices();
      expect(result).toEqual([]);
    });
  });

  describe('getStripeProducts', () => {
    it('fetches and transforms products correctly', async () => {
      const mockProducts = {
        data: [
          {
            id: 'prod_123',
            name: 'Basic Plan',
            description: 'Basic features',
            default_price: 'price_123'
          },
          {
            id: 'prod_456',
            name: 'Pro Plan',
            description: 'Pro features',
            default_price: { id: 'price_456' }
          }
        ]
      };

      mockProductsList.mockResolvedValue(mockProducts);

      const result = await getStripeProducts();

      expect(mockProductsList).toHaveBeenCalledWith({
        active: true,
        expand: ['data.default_price']
      });

      expect(result).toEqual([
        {
          id: 'prod_123',
          name: 'Basic Plan',
          description: 'Basic features',
          defaultPriceId: 'price_123'
        },
        {
          id: 'prod_456',
          name: 'Pro Plan',
          description: 'Pro features',
          defaultPriceId: 'price_456'
        }
      ]);
    });

    it('handles product with no default price', async () => {
      const mockProducts = {
        data: [
          {
            id: 'prod_123',
            name: 'Basic Plan',
            description: null,
            default_price: null
          }
        ]
      };

      mockProductsList.mockResolvedValue(mockProducts);

      const result = await getStripeProducts();

      expect(result).toEqual([
        {
          id: 'prod_123',
          name: 'Basic Plan',
          description: null,
          defaultPriceId: undefined
        }
      ]);
    });
  });

  describe('handleSubscriptionChange', () => {
    const mockTeam = {
      id: 1,
      name: 'Test Team',
      stripeCustomerId: 'cus_123',
      stripeSubscriptionId: null,
      stripeProductId: null,
      planName: null,
      subscriptionStatus: 'active',
      createdAt: new Date(),
      updatedAt: new Date()
    };

    it('updates team subscription when active', async () => {
      vi.mocked(getTeamByStripeCustomerId).mockResolvedValue(mockTeam);

      const mockSubscription = {
        id: 'sub_123',
        customer: 'cus_123',
        status: 'active',
        items: {
          data: [
            {
              plan: {
                product: { name: 'Pro Plan' }
              }
            }
          ]
        }
      } as unknown as Stripe.Subscription;

      await handleSubscriptionChange(mockSubscription);

      expect(getTeamByStripeCustomerId).toHaveBeenCalledWith('cus_123');
      expect(updateTeamSubscription).toHaveBeenCalledWith(1, {
        stripeSubscriptionId: 'sub_123',
        stripeProductId: { name: 'Pro Plan' },
        planName: 'Pro Plan',
        subscriptionStatus: 'active'
      });
    });

    it('updates team subscription when trialing', async () => {
      vi.mocked(getTeamByStripeCustomerId).mockResolvedValue(mockTeam);

      const mockSubscription = {
        id: 'sub_123',
        customer: 'cus_123',
        status: 'trialing',
        items: {
          data: [
            {
              plan: {
                product: 'prod_123'
              }
            }
          ]
        }
      } as unknown as Stripe.Subscription;

      await handleSubscriptionChange(mockSubscription);

      expect(updateTeamSubscription).toHaveBeenCalledWith(1, expect.objectContaining({
        subscriptionStatus: 'trialing'
      }));
    });

    it('clears subscription data when canceled', async () => {
      vi.mocked(getTeamByStripeCustomerId).mockResolvedValue(mockTeam);

      const mockSubscription = {
        id: 'sub_123',
        customer: 'cus_123',
        status: 'canceled',
        items: { data: [] }
      } as unknown as Stripe.Subscription;

      await handleSubscriptionChange(mockSubscription);

      expect(updateTeamSubscription).toHaveBeenCalledWith(1, {
        stripeSubscriptionId: null,
        stripeProductId: null,
        planName: null,
        subscriptionStatus: 'canceled'
      });
    });

    it('clears subscription data when unpaid', async () => {
      vi.mocked(getTeamByStripeCustomerId).mockResolvedValue(mockTeam);

      const mockSubscription = {
        id: 'sub_123',
        customer: 'cus_123',
        status: 'unpaid',
        items: { data: [] }
      } as unknown as Stripe.Subscription;

      await handleSubscriptionChange(mockSubscription);

      expect(updateTeamSubscription).toHaveBeenCalledWith(1, {
        stripeSubscriptionId: null,
        stripeProductId: null,
        planName: null,
        subscriptionStatus: 'unpaid'
      });
    });

    it('logs error when team not found', async () => {
      vi.mocked(getTeamByStripeCustomerId).mockResolvedValue(null);
      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

      const mockSubscription = {
        id: 'sub_123',
        customer: 'cus_unknown',
        status: 'active',
        items: { data: [] }
      } as unknown as Stripe.Subscription;

      await handleSubscriptionChange(mockSubscription);

      expect(consoleSpy).toHaveBeenCalledWith(
        'Team not found for Stripe customer:',
        'cus_unknown'
      );
      expect(updateTeamSubscription).not.toHaveBeenCalled();

      consoleSpy.mockRestore();
    });

    it('does nothing for other statuses', async () => {
      vi.mocked(getTeamByStripeCustomerId).mockResolvedValue(mockTeam);

      const mockSubscription = {
        id: 'sub_123',
        customer: 'cus_123',
        status: 'incomplete',
        items: { data: [] }
      } as unknown as Stripe.Subscription;

      await handleSubscriptionChange(mockSubscription);

      expect(updateTeamSubscription).not.toHaveBeenCalled();
    });
  });
});
