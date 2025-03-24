import { NextResponse } from 'next/server';

/**
 * Health check endpoint for AWS ALB
 * Returns 200 OK if the application is running
 * 
 * This endpoint is intentionally simple and fast to respond,
 * making it ideal for ALB health checks.
 */
export async function GET() {
  return NextResponse.json(
    { 
      status: 'healthy',
      timestamp: new Date().toISOString()
    },
    { status: 200 }
  );
}
