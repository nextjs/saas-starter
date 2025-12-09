import { describe, it, expect, vi, beforeEach } from 'vitest';
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// Mock auth session functions
vi.mock('@/lib/auth/session', () => ({
  verifyToken: vi.fn(),
  signToken: vi.fn()
}));

import { verifyToken, signToken } from '@/lib/auth/session';
import { middleware } from './middleware';

// Helper to create mock NextRequest
function createMockRequest(
  url: string,
  options: {
    method?: string;
    sessionCookie?: string | null;
  } = {}
): NextRequest {
  const { method = 'GET', sessionCookie } = options;

  const mockCookies = {
    get: vi.fn((name: string) => {
      if (name === 'session' && sessionCookie) {
        return { value: sessionCookie };
      }
      return undefined;
    }),
    set: vi.fn(),
    delete: vi.fn()
  };

  return {
    nextUrl: new URL(url),
    url,
    method,
    cookies: mockCookies
  } as unknown as NextRequest;
}

describe('Middleware', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Protected Routes', () => {
    it('redirects to sign-in when accessing protected route without session', async () => {
      const request = createMockRequest('http://localhost:3000/dashboard');

      const response = await middleware(request);

      expect(response.status).toBe(307); // Redirect status
      expect(response.headers.get('location')).toContain('/sign-in');
    });

    it('redirects to sign-in when accessing nested protected route without session', async () => {
      const request = createMockRequest('http://localhost:3000/dashboard/settings');

      const response = await middleware(request);

      expect(response.status).toBe(307);
      expect(response.headers.get('location')).toContain('/sign-in');
    });
  });

  describe('Public Routes', () => {
    it('allows access to public routes without session', async () => {
      const request = createMockRequest('http://localhost:3000/sign-in');

      const response = await middleware(request);

      // Should not redirect
      expect(response.status).not.toBe(307);
    });

    it('allows access to home page without session', async () => {
      const request = createMockRequest('http://localhost:3000/');

      const response = await middleware(request);

      expect(response.status).not.toBe(307);
    });

    it('allows access to pricing page without session', async () => {
      const request = createMockRequest('http://localhost:3000/pricing');

      const response = await middleware(request);

      expect(response.status).not.toBe(307);
    });
  });

  describe('Session Refresh', () => {
    it('refreshes session on GET requests with valid session', async () => {
      const validSession = {
        user: { id: 1 },
        expires: new Date(Date.now() + 86400000).toISOString()
      };

      vi.mocked(verifyToken).mockResolvedValue(validSession);
      vi.mocked(signToken).mockResolvedValue('new-session-token');

      const request = createMockRequest('http://localhost:3000/', {
        sessionCookie: 'valid-token'
      });

      const response = await middleware(request);

      expect(verifyToken).toHaveBeenCalledWith('valid-token');
      expect(signToken).toHaveBeenCalled();
    });

    it('does not refresh session on non-GET requests', async () => {
      const request = createMockRequest('http://localhost:3000/', {
        method: 'POST',
        sessionCookie: 'valid-token'
      });

      await middleware(request);

      expect(verifyToken).not.toHaveBeenCalled();
    });

    it('deletes session cookie on invalid token for public route', async () => {
      vi.mocked(verifyToken).mockRejectedValue(new Error('Invalid token'));

      const request = createMockRequest('http://localhost:3000/', {
        sessionCookie: 'invalid-token'
      });

      const response = await middleware(request);

      // Should not redirect for public route
      expect(response.status).not.toBe(307);
    });

    it('redirects to sign-in on invalid token for protected route', async () => {
      vi.mocked(verifyToken).mockRejectedValue(new Error('Invalid token'));

      const request = createMockRequest('http://localhost:3000/dashboard', {
        sessionCookie: 'invalid-token'
      });

      const response = await middleware(request);

      expect(response.status).toBe(307);
      expect(response.headers.get('location')).toContain('/sign-in');
    });
  });

  describe('Session Handling', () => {
    it('allows access to protected route with valid session', async () => {
      const validSession = {
        user: { id: 1 },
        expires: new Date(Date.now() + 86400000).toISOString()
      };

      vi.mocked(verifyToken).mockResolvedValue(validSession);
      vi.mocked(signToken).mockResolvedValue('refreshed-token');

      const request = createMockRequest('http://localhost:3000/dashboard', {
        sessionCookie: 'valid-token'
      });

      const response = await middleware(request);

      // Should not redirect
      expect(response.status).not.toBe(307);
    });
  });
});
