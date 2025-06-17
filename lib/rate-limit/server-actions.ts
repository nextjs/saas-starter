import { headers } from 'next/headers';
import type { RateLimitConfig } from './config';
import { defaultConfigs } from './config';
import { RateLimiter } from './index';

interface ServerActionRateLimitOptions {
  config?: Partial<RateLimitConfig>;
  keyGenerator?: (headers: Headers) => string;
  onRateLimited?: (error: RateLimitError) => any;
}

interface RateLimitError {
  error: string;
  retryAfter: number;
  rateLimited: true;
}

// Create a mock Request object from headers
function createMockRequest(headersList: Headers): Request {
  const baseUrl = process.env.BASE_URL || 'http://localhost:3000';
  return new Request(baseUrl, {
    headers: headersList
  });
}

// Extract IP from request headers
function getIpFromRequest(request: Request): string {
  const forwarded = request.headers.get('x-forwarded-for');
  const realIp = request.headers.get('x-real-ip');
  const ip = forwarded?.split(',')[0] || realIp || 'unknown';
  return ip;
}

// Create rate limiter for auth-related actions
function createAuthRateLimiter(config?: Partial<RateLimitConfig>): RateLimiter {
  return new RateLimiter({
    ...defaultConfigs.auth,
    ...config
  });
}

// Rate limiting wrapper for server actions
export function withServerActionRateLimit<T extends any[], R>(
  action: (...args: T) => Promise<R>,
  options: ServerActionRateLimitOptions = {}
) {
  return async (...args: T): Promise<R | RateLimitError> => {
    const { config, keyGenerator, onRateLimited } = options;

    try {
      // Create a mock request with minimal headers needed for rate limiting
      const headersList = new Headers();

      // Get headers synchronously
      const h = await headers();

      // Copy important headers for rate limiting
      const forwardedFor = h.get('x-forwarded-for');
      const realIp = h.get('x-real-ip');

      if (forwardedFor) headersList.set('x-forwarded-for', forwardedFor);
      if (realIp) headersList.set('x-real-ip', realIp);

      const mockRequest = createMockRequest(headersList);

      // Create rate limiter with auth config by default
      const rateLimiter = createAuthRateLimiter(config);

      // Generate key - prefer custom key generator, fallback to IP
      const key = keyGenerator
        ? keyGenerator(mockRequest.headers)
        : getIpFromRequest(mockRequest);

      // Check rate limit
      const result = await rateLimiter.limit(mockRequest, key);

      if (!result.success) {
        const rateLimitError: RateLimitError = {
          error: 'Too many attempts. Please try again later.',
          retryAfter: Math.ceil((result.reset - Date.now()) / 1000),
          rateLimited: true
        };

        if (onRateLimited) {
          return onRateLimited(rateLimitError);
        }

        return rateLimitError;
      }

      // Execute the original action
      return await action(...args);
    } catch (error) {
      // Check if this is a Next.js navigation error that should be re-thrown
      if (error && typeof error === 'object' && 'digest' in error) {
        const digest = (error as any).digest;
        if (typeof digest === 'string') {
          // Re-throw Next.js navigation errors (redirect, notFound, etc.)
          if (
            digest.startsWith('NEXT_REDIRECT') ||
            digest.startsWith('NEXT_NOT_FOUND')
          ) {
            throw error;
          }
        }
      }

      // Log error but don't expose internal details
      console.error('Server action rate limiting error:', error);

      // Return a generic error that matches the expected shape
      return {
        error: 'An error occurred while processing your request.',
        retryAfter: 60, // Default retry after 1 minute
        rateLimited: true
      } as RateLimitError;
    }
  };
}

// Specific wrapper for authentication actions
export function withAuthActionRateLimit<T extends any[], R>(
  action: (...args: T) => Promise<R>,
  options: Omit<ServerActionRateLimitOptions, 'config'> = {}
) {
  return withServerActionRateLimit(action, {
    ...options,
    config: {
      windowMs: 15 * 60 * 1000, // 15 minutes
      maxRequests: 5, // Very restrictive for auth actions
      message: 'Too many authentication attempts'
    }
  });
}

// Simple IP-based key generator helper
function generateIpKey(headers: Headers, prefix: string): string {
  const forwarded = headers.get('x-forwarded-for');
  const realIp = headers.get('x-real-ip');
  const ip = forwarded?.split(',')[0] || realIp || 'unknown';
  return `${prefix}:${ip}`;
}

// Wrapper with IP-based rate limiting for sign-in attempts
export function withSignInRateLimit<T extends any[], R>(
  action: (...args: T) => Promise<R>
) {
  return withAuthActionRateLimit(action, {
    keyGenerator: (headers) => generateIpKey(headers, 'signin'),
    onRateLimited: (result) => ({
      error: 'Too many sign-in attempts from this IP. Please try again later.',
      email: '',
      password: '',
      rateLimited: true,
      retryAfter: result.retryAfter
    })
  });
}

// Wrapper with IP-based rate limiting for sign-up attempts
export function withSignUpRateLimit<T extends any[], R>(
  action: (...args: T) => Promise<R>
) {
  return withAuthActionRateLimit(action, {
    keyGenerator: (headers) => generateIpKey(headers, 'signup'),
    onRateLimited: (result) => ({
      error: 'Too many sign-up attempts from this IP. Please try again later.',
      email: '',
      password: '',
      rateLimited: true,
      retryAfter: result.retryAfter
    })
  });
}
