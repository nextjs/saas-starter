import { NextRequest, NextResponse } from 'next/server';
import { withRateLimit } from '@/lib/rate-limit/middleware';

/**
 * Example rate-limited API endpoint
 * Limited to 10 requests per minute
 */
export async function GET(request: NextRequest) {
  return withRateLimit({ maxRequests: 10, windowMs: 60000 })(request, async () => {
    return NextResponse.json({
      message: 'This endpoint is rate limited to 10 requests per minute',
      timestamp: new Date().toISOString(),
    });
  });
}
