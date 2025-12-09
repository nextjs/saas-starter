import { describe, it, expect, vi, beforeEach } from 'vitest';

// Mock the queries module
vi.mock('@/lib/db/queries', () => ({
  getTeamForUser: vi.fn()
}));

import { getTeamForUser } from '@/lib/db/queries';
import { GET } from './route';

describe('Team API Route', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('GET /api/team', () => {
    it('returns team data when authenticated with team', async () => {
      const mockTeam = {
        id: 1,
        name: 'Test Team',
        stripeCustomerId: null,
        stripeSubscriptionId: null,
        stripeProductId: null,
        planName: null,
        subscriptionStatus: 'active',
        createdAt: new Date(),
        updatedAt: new Date(),
        teamMembers: [
          {
            id: 1,
            userId: 1,
            teamId: 1,
            role: 'owner',
            joinedAt: new Date(),
            user: {
              id: 1,
              name: 'Test User',
              email: 'test@example.com'
            }
          }
        ]
      };

      vi.mocked(getTeamForUser).mockResolvedValue(mockTeam as any);

      const response = await GET();
      const data = await response.json();

      expect(getTeamForUser).toHaveBeenCalled();
      // JSON serializes Date to string, so check specific fields
      expect(data.id).toBe(mockTeam.id);
      expect(data.name).toBe(mockTeam.name);
      expect(data.subscriptionStatus).toBe(mockTeam.subscriptionStatus);
      expect(data.teamMembers).toHaveLength(1);
    });

    it('returns null when not authenticated', async () => {
      vi.mocked(getTeamForUser).mockResolvedValue(null);

      const response = await GET();
      const data = await response.json();

      expect(getTeamForUser).toHaveBeenCalled();
      expect(data).toBeNull();
    });

    it('returns null when user has no team', async () => {
      vi.mocked(getTeamForUser).mockResolvedValue(null);

      const response = await GET();
      const data = await response.json();

      expect(data).toBeNull();
    });

    it('returns Response object', async () => {
      vi.mocked(getTeamForUser).mockResolvedValue(null);

      const response = await GET();

      expect(response).toBeInstanceOf(Response);
    });

    it('returns team with multiple members', async () => {
      const mockTeam = {
        id: 1,
        name: 'Test Team',
        teamMembers: [
          {
            id: 1,
            userId: 1,
            role: 'owner',
            user: { id: 1, name: 'Owner', email: 'owner@example.com' }
          },
          {
            id: 2,
            userId: 2,
            role: 'member',
            user: { id: 2, name: 'Member', email: 'member@example.com' }
          }
        ]
      };

      vi.mocked(getTeamForUser).mockResolvedValue(mockTeam as any);

      const response = await GET();
      const data = await response.json();

      expect(data.teamMembers).toHaveLength(2);
      expect(data.teamMembers[0].role).toBe('owner');
      expect(data.teamMembers[1].role).toBe('member');
    });
  });
});
