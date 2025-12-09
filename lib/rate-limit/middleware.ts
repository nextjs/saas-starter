import { NextRequest, NextResponse } from 'next/server';
import { rateLimit, getRateLimitKey, RateLimitConfig } from './service';

export function withRateLimit(config?: RateLimitConfig) {
  return async function rateLimitMiddleware(
    request: NextRequest,
    handler: (request: NextRequest) => Promise<NextResponse>
  ): Promise<NextResponse> {
    // Get identifier (IP address or API key or user ID)
    const identifier =
      request.headers.get('x-forwarded-for') ||
      request.headers.get('x-real-ip') ||
      'anonymous';

    const endpoint = new URL(request.url).pathname;
    const key = getRateLimitKey(identifier, endpoint);

    const result = rateLimit(key, config);

    if (!result.allowed) {
      return NextResponse.json(
        {
          error: 'Too many requests',
          limit: result.limit,
          resetAt: new Date(result.resetAt).toISOString(),
        },
        {
          status: 429,
          headers: {
            'X-RateLimit-Limit': result.limit.toString(),
            'X-RateLimit-Remaining': '0',
            'X-RateLimit-Reset': result.resetAt.toString(),
            'Retry-After': Math.ceil(
              (result.resetAt - Date.now()) / 1000
            ).toString(),
          },
        }
      );
    }

    const response = await handler(request);

    // Add rate limit headers to response
    response.headers.set('X-RateLimit-Limit', result.limit.toString());
    response.headers.set('X-RateLimit-Remaining', result.remaining.toString());
    response.headers.set('X-RateLimit-Reset', result.resetAt.toString());

    return response;
  };
}
