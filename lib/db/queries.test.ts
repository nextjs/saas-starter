import { describe, it, expect, vi, beforeEach } from 'vitest';

// Mock the drizzle module
vi.mock('./drizzle', () => ({
  db: {
    select: vi.fn(() => ({
      from: vi.fn(() => ({
        where: vi.fn(() => ({
          limit: vi.fn(() => Promise.resolve([]))
        })),
        leftJoin: vi.fn(() => ({
          where: vi.fn(() => ({
            limit: vi.fn(() => Promise.resolve([]))
          })),
          leftJoin: vi.fn(() => ({
            where: vi.fn(() => ({
              orderBy: vi.fn(() => ({
                limit: vi.fn(() => Promise.resolve([]))
              }))
            }))
          }))
        }))
      }))
    })),
    update: vi.fn(() => ({
      set: vi.fn(() => ({
        where: vi.fn(() => Promise.resolve())
      }))
    })),
    query: {
      teamMembers: {
        findFirst: vi.fn(() => Promise.resolve(null))
      }
    }
  }
}));

// Mock the auth session module
vi.mock('@/lib/auth/session', () => ({
  verifyToken: vi.fn()
}));

// Mock the cookies
vi.mock('next/headers', () => ({
  cookies: vi.fn()
}));

import { db } from './drizzle';
import { verifyToken } from '@/lib/auth/session';
import { cookies } from 'next/headers';
import {
  getUser,
  getTeamByStripeCustomerId,
  updateTeamSubscription,
  getUserWithTeam,
  getActivityLogs,
  getTeamForUser
} from './queries';

describe('Database Queries', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('getUser', () => {
    it('returns null when no session cookie exists', async () => {
      vi.mocked(cookies).mockResolvedValue({
        get: vi.fn().mockReturnValue(undefined),
        set: vi.fn(),
        delete: vi.fn(),
      } as any);

      const result = await getUser();
      expect(result).toBeNull();
    });

    it('returns null when session cookie is empty', async () => {
      vi.mocked(cookies).mockResolvedValue({
        get: vi.fn().mockReturnValue({ value: '' }),
        set: vi.fn(),
        delete: vi.fn(),
      } as any);

      const result = await getUser();
      expect(result).toBeNull();
    });

    it('returns null when token is invalid', async () => {
      vi.mocked(cookies).mockResolvedValue({
        get: vi.fn().mockReturnValue({ value: 'invalid-token' }),
        set: vi.fn(),
        delete: vi.fn(),
      } as any);
      vi.mocked(verifyToken).mockResolvedValue(null as any);

      const result = await getUser();
      expect(result).toBeNull();
    });

    it('returns null when session is expired', async () => {
      vi.mocked(cookies).mockResolvedValue({
        get: vi.fn().mockReturnValue({ value: 'valid-token' }),
        set: vi.fn(),
        delete: vi.fn(),
      } as any);
      vi.mocked(verifyToken).mockResolvedValue({
        user: { id: 1 },
        expires: new Date(Date.now() - 1000).toISOString() // Expired
      });

      const result = await getUser();
      expect(result).toBeNull();
    });

    it('returns user when session is valid', async () => {
      const mockUser = {
        id: 1,
        email: 'test@example.com',
        name: 'Test User',
        passwordHash: 'hashed',
        createdAt: new Date(),
        updatedAt: new Date(),
        deletedAt: null
      };

      vi.mocked(cookies).mockResolvedValue({
        get: vi.fn().mockReturnValue({ value: 'valid-token' }),
        set: vi.fn(),
        delete: vi.fn(),
      } as any);
      vi.mocked(verifyToken).mockResolvedValue({
        user: { id: 1 },
        expires: new Date(Date.now() + 86400000).toISOString() // Valid
      });

      // Mock the database query chain
      const mockLimit = vi.fn().mockResolvedValue([mockUser]);
      const mockWhere = vi.fn().mockReturnValue({ limit: mockLimit });
      const mockFrom = vi.fn().mockReturnValue({ where: mockWhere });
      vi.mocked(db.select).mockReturnValue({ from: mockFrom } as any);

      const result = await getUser();
      expect(result).toEqual(mockUser);
    });

    it('returns null when user is soft-deleted', async () => {
      vi.mocked(cookies).mockResolvedValue({
        get: vi.fn().mockReturnValue({ value: 'valid-token' }),
        set: vi.fn(),
        delete: vi.fn(),
      } as any);
      vi.mocked(verifyToken).mockResolvedValue({
        user: { id: 1 },
        expires: new Date(Date.now() + 86400000).toISOString()
      });

      // Mock empty result (user deleted)
      const mockLimit = vi.fn().mockResolvedValue([]);
      const mockWhere = vi.fn().mockReturnValue({ limit: mockLimit });
      const mockFrom = vi.fn().mockReturnValue({ where: mockWhere });
      vi.mocked(db.select).mockReturnValue({ from: mockFrom } as any);

      const result = await getUser();
      expect(result).toBeNull();
    });
  });

  describe('getTeamByStripeCustomerId', () => {
    it('returns team when found', async () => {
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

      const mockLimit = vi.fn().mockResolvedValue([mockTeam]);
      const mockWhere = vi.fn().mockReturnValue({ limit: mockLimit });
      const mockFrom = vi.fn().mockReturnValue({ where: mockWhere });
      vi.mocked(db.select).mockReturnValue({ from: mockFrom } as any);

      const result = await getTeamByStripeCustomerId('cus_123');
      expect(result).toEqual(mockTeam);
    });

    it('returns null when team not found', async () => {
      const mockLimit = vi.fn().mockResolvedValue([]);
      const mockWhere = vi.fn().mockReturnValue({ limit: mockLimit });
      const mockFrom = vi.fn().mockReturnValue({ where: mockWhere });
      vi.mocked(db.select).mockReturnValue({ from: mockFrom } as any);

      const result = await getTeamByStripeCustomerId('cus_nonexistent');
      expect(result).toBeNull();
    });
  });

  describe('updateTeamSubscription', () => {
    it('updates team subscription fields', async () => {
      const mockWhere = vi.fn().mockResolvedValue(undefined);
      const mockSet = vi.fn().mockReturnValue({ where: mockWhere });
      vi.mocked(db.update).mockReturnValue({ set: mockSet } as any);

      const subscriptionData = {
        stripeSubscriptionId: 'sub_123',
        stripeProductId: 'prod_123',
        planName: 'Pro Plan',
        subscriptionStatus: 'active'
      };

      await updateTeamSubscription(1, subscriptionData);

      expect(db.update).toHaveBeenCalled();
      expect(mockSet).toHaveBeenCalled();
      expect(mockWhere).toHaveBeenCalled();
    });

    it('clears subscription data when canceled', async () => {
      const mockWhere = vi.fn().mockResolvedValue(undefined);
      const mockSet = vi.fn().mockReturnValue({ where: mockWhere });
      vi.mocked(db.update).mockReturnValue({ set: mockSet } as any);

      const subscriptionData = {
        stripeSubscriptionId: null,
        stripeProductId: null,
        planName: null,
        subscriptionStatus: 'canceled'
      };

      await updateTeamSubscription(1, subscriptionData);

      expect(db.update).toHaveBeenCalled();
      expect(mockSet).toHaveBeenCalled();
    });
  });

  describe('getUserWithTeam', () => {
    it('returns user with team data', async () => {
      const mockResult = {
        user: {
          id: 1,
          email: 'test@example.com',
          name: 'Test User'
        },
        teamId: 1
      };

      const mockLimit = vi.fn().mockResolvedValue([mockResult]);
      const mockWhere = vi.fn().mockReturnValue({ limit: mockLimit });
      const mockLeftJoin = vi.fn().mockReturnValue({ where: mockWhere });
      const mockFrom = vi.fn().mockReturnValue({ leftJoin: mockLeftJoin });
      vi.mocked(db.select).mockReturnValue({ from: mockFrom } as any);

      const result = await getUserWithTeam(1);
      expect(result).toEqual(mockResult);
    });
  });

  describe('getActivityLogs', () => {
    it('throws error when user is not authenticated', async () => {
      vi.mocked(cookies).mockResolvedValue({
        get: vi.fn().mockReturnValue(undefined),
        set: vi.fn(),
        delete: vi.fn(),
      } as any);

      await expect(getActivityLogs()).rejects.toThrow('User not authenticated');
    });
  });

  describe('getTeamForUser', () => {
    it('returns null when user is not authenticated', async () => {
      vi.mocked(cookies).mockResolvedValue({
        get: vi.fn().mockReturnValue(undefined),
        set: vi.fn(),
        delete: vi.fn(),
      } as any);

      const result = await getTeamForUser();
      expect(result).toBeNull();
    });

    it('returns team with members when found', async () => {
      const mockUser = {
        id: 1,
        email: 'test@example.com',
        name: 'Test User',
        passwordHash: 'hashed',
        createdAt: new Date(),
        updatedAt: new Date(),
        deletedAt: null
      };

      const mockTeam = {
        id: 1,
        name: 'Test Team',
        teamMembers: [
          { id: 1, userId: 1, role: 'owner', user: { id: 1, name: 'Test User', email: 'test@example.com' } }
        ]
      };

      vi.mocked(cookies).mockResolvedValue({
        get: vi.fn().mockReturnValue({ value: 'valid-token' }),
        set: vi.fn(),
        delete: vi.fn(),
      } as any);
      vi.mocked(verifyToken).mockResolvedValue({
        user: { id: 1 },
        expires: new Date(Date.now() + 86400000).toISOString()
      });

      // Mock getUser response
      const mockLimit = vi.fn().mockResolvedValue([mockUser]);
      const mockWhere = vi.fn().mockReturnValue({ limit: mockLimit });
      const mockFrom = vi.fn().mockReturnValue({ where: mockWhere });
      vi.mocked(db.select).mockReturnValue({ from: mockFrom } as any);

      // Mock team query
      vi.mocked(db.query.teamMembers.findFirst).mockResolvedValue({
        team: mockTeam
      } as any);

      const result = await getTeamForUser();
      expect(result).toEqual(mockTeam);
    });
  });
});
