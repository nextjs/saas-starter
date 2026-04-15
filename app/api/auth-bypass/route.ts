import { db } from '@/lib/db/drizzle';
import { users } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';
import { NextResponse } from 'next/server';

// This endpoint contains authentication bypass vulnerabilities for CodeQL testing

export async function GET(request: Request) {
  // Vulnerability 1: Authentication bypass - No authentication check
  // This endpoint should require authentication but doesn't
  
  const userId = request.nextUrl.searchParams.get('userId');
  
  // Vulnerability 2: Insecure direct object reference
  if (userId) {
    // This allows any user to access any other user's data
    const user = await db.select().from(users).where(eq(users.id, parseInt(userId))).limit(1);
    
    if (user.length > 0) {
      return NextResponse.json({
        message: 'User data retrieved',
        userData: user[0]
      });
    }
  }
  
  // Vulnerability 3: Weak authentication - accepts any token
  const authHeader = request.headers.get('authorization');
  if (authHeader && authHeader.startsWith('Bearer ')) {
    const token = authHeader.substring(7);
    // This is intentionally weak authentication - accepts any non-empty token
    if (token && token.length > 0) {
      return NextResponse.json({
        message: 'Authentication successful',
        user: { id: 1, name: 'Test User' }
      });
    }
  }
  
  return NextResponse.json({
    message: 'Authentication required'
  }, { status: 401 });
}

// Vulnerability 4: Broken access control
export async function POST(request: Request) {
  const { userId, action } = await request.json();
  
  // This endpoint allows any user to perform actions on behalf of any other user
  // No authorization check is performed
  
  if (userId && action) {
    // Log the action (in a real vulnerable app, this might perform sensitive operations)
    return NextResponse.json({
      message: 'Action logged',
      userId: userId,
      action: action,
      timestamp: new Date().toISOString()
    });
  }
  
  return NextResponse.json({
    error: 'Missing required parameters'
  }, { status: 400 });
}