import { describe, it, expect, vi, beforeEach } from 'vitest';

// Mock the queries module
vi.mock('@/lib/db/queries', () => ({
  getUser: vi.fn()
}));

import { getUser } from '@/lib/db/queries';
import { GET } from './route';

describe('User API Route', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('GET /api/user', () => {
    it('returns user data when authenticated', async () => {
      const mockUser = {
        id: 1,
        email: 'test@example.com',
        name: 'Test User',
        createdAt: new Date(),
        updatedAt: new Date()
      };

      vi.mocked(getUser).mockResolvedValue(mockUser as any);

      const response = await GET();
      const data = await response.json();

      expect(getUser).toHaveBeenCalled();
      // JSON serializes Date to string, so check specific fields
      expect(data.id).toBe(mockUser.id);
      expect(data.email).toBe(mockUser.email);
      expect(data.name).toBe(mockUser.name);
    });

    it('returns null when not authenticated', async () => {
      vi.mocked(getUser).mockResolvedValue(null);

      const response = await GET();
      const data = await response.json();

      expect(getUser).toHaveBeenCalled();
      expect(data).toBeNull();
    });

    it('returns Response object', async () => {
      vi.mocked(getUser).mockResolvedValue(null);

      const response = await GET();

      expect(response).toBeInstanceOf(Response);
    });
  });
});
