import { NextRequest, NextResponse } from 'next/server';
import type { RateLimiter, RateLimitResult } from './index';
import { createApiRateLimiter, createAuthRateLimiter } from './index';

export interface RateLimitOptions {
  rateLimiter?: RateLimiter;
  onRateLimited?: (result: RateLimitResult) => Response | NextResponse;
  customKey?: string;
}

// Higher-order function for API route protection
export function withRateLimit(
  handler: (request: Request) => Promise<Response> | Response,
  options: RateLimitOptions = {}
) {
  return async (request: Request): Promise<Response> => {
    const {
      rateLimiter = createApiRateLimiter(),
      onRateLimited,
      customKey
    } = options;

    try {
      const result = await rateLimiter.limit(request, customKey);

      if (!result.success) {
        if (onRateLimited) {
          return onRateLimited(result);
        }

        return createRateLimitResponse(result);
      }

      // Execute the handler
      const response = await handler(request);

      // Add rate limit headers to successful responses
      return addRateLimitHeaders(response, result);
    } catch (error) {
      console.error('Rate limiting error:', error);
      // Fail open - execute handler if rate limiting fails
      return handler(request);
    }
  };
}

// Middleware helper for Next.js middleware
export async function checkRateLimit(
  request: NextRequest,
  options: RateLimitOptions = {}
): Promise<NextResponse | null> {
  const {
    rateLimiter = createApiRateLimiter(),
    onRateLimited,
    customKey
  } = options;

  try {
    const result = await rateLimiter.limit(request, customKey);

    if (!result.success) {
      if (onRateLimited) {
        const response = onRateLimited(result);
        return response instanceof NextResponse
          ? response
          : NextResponse.json(
              { error: 'Rate limit exceeded' },
              { status: 429 }
            );
      }

      return NextResponse.json(
        {
          error: 'Too many requests',
          message: 'Rate limit exceeded. Please try again later.',
          retryAfter: Math.ceil((result.reset - Date.now()) / 1000)
        },
        {
          status: 429,
          headers: getRateLimitHeaders(result)
        }
      );
    }

    return null; // No rate limiting, continue
  } catch (error) {
    console.error('Rate limiting error:', error);
    return null; // Fail open
  }
}

// Specific rate limiter for authentication endpoints
export function withAuthRateLimit(
  handler: (request: Request) => Promise<Response> | Response,
  options: Omit<RateLimitOptions, 'rateLimiter'> = {}
) {
  return withRateLimit(handler, {
    ...options,
    rateLimiter: createAuthRateLimiter()
  });
}

// Helper functions
function createRateLimitResponse(result: RateLimitResult): Response {
  return new Response(
    JSON.stringify({
      error: 'Rate limit exceeded',
      message: 'Too many requests. Please try again later.',
      retryAfter: Math.ceil((result.reset - Date.now()) / 1000)
    }),
    {
      status: 429,
      headers: {
        'Content-Type': 'application/json',
        ...getRateLimitHeaders(result)
      }
    }
  );
}

function addRateLimitHeaders(
  response: Response,
  result: RateLimitResult
): Response {
  const headers = new Headers(response.headers);

  Object.entries(getRateLimitHeaders(result)).forEach(([key, value]) => {
    headers.set(key, value);
  });

  return new Response(response.body, {
    status: response.status,
    statusText: response.statusText,
    headers
  });
}

function getRateLimitHeaders(result: RateLimitResult): Record<string, string> {
  const resetAfter = Math.ceil((result.reset - Date.now()) / 1000);

  return {
    'X-RateLimit-Limit': result.limit.toString(),
    'X-RateLimit-Remaining': result.remaining.toString(),
    'X-RateLimit-Reset': result.reset.toString(),
    'X-RateLimit-Reset-After': Math.max(0, resetAfter).toString(),
    'Retry-After': Math.max(0, resetAfter).toString()
  };
}

// Hook for client-side rate limit checking
export function createRateLimitInfo(result: RateLimitResult) {
  const now = Date.now();
  const resetAfter = Math.max(0, result.reset - now);

  return {
    limit: result.limit,
    remaining: result.remaining,
    reset: new Date(result.reset),
    resetAfter: Math.ceil(resetAfter / 1000),
    isLimited: !result.success,
    totalHits: result.totalHits
  };
}
