import { NextRequest, NextResponse } from 'next/server';
import { microsoftAuth } from '@/app/(login)/microsoft-actions';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const code = searchParams.get('code');
  const error = searchParams.get('error');
  const errorDescription = searchParams.get('error_description');

  // Handle OAuth errors
  if (error) {
    console.error('Microsoft OAuth error:', error, errorDescription);
    return NextResponse.redirect(
      new URL(`/sign-in?error=${encodeURIComponent('Microsoft authentication failed. Please try again.')}`, request.url)
    );
  }

  // Check for authorization code
  if (!code) {
    return NextResponse.redirect(
      new URL('/sign-in?error=' + encodeURIComponent('No authorization code received'), request.url)
    );
  }

  try {
    // Process the Microsoft authentication
    const formData = new FormData();
    formData.append('code', code);
    const result = await microsoftAuth({ code }, formData);

    if (result?.error) {
      return NextResponse.redirect(
        new URL(`/sign-in?error=${encodeURIComponent(result.error)}`, request.url)
      );
    }

    // If successful, redirect to dashboard (this should not be reached due to redirect in microsoftAuth)
    return NextResponse.redirect(new URL('/dashboard', request.url));
  } catch (error) {
    console.error('Microsoft authentication callback error:', error);
    return NextResponse.redirect(
      new URL(`/sign-in?error=${encodeURIComponent('Authentication failed. Please try again.')}`, request.url)
    );
  }
}
