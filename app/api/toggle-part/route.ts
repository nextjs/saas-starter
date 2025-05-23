import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';

// Duplicate the handler logic to support both POST and GET
export async function GET(req: NextRequest) {
  try {
    return handleTogglePart(req);
  } catch (error) {
    console.error('[toggle-part GET] Unexpected error:', error);
    return NextResponse.json({ error: 'Server error', details: String(error) }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    return handleTogglePart(req);
  } catch (error) {
    console.error('[toggle-part POST] Unexpected error:', error);
    return NextResponse.json({ error: 'Server error', details: String(error) }, { status: 500 });
  }
}

// Shared handler function
async function handleTogglePart(req: NextRequest) {
  try {
    // Extract partId from URL search params instead of JSON body
    const url = new URL(req.url);
    console.log('[toggle-part] Processing request for URL:', url.toString());
    const partIdParam = url.searchParams.get('partId');
    console.log('[toggle-part] Raw partId param:', partIdParam);
    
    if (!partIdParam) {
      console.warn('[toggle-part] Missing partId parameter');
      return NextResponse.json(
        { error: 'Part ID is required' }, 
        { status: 400 }
      );
    }
    
    const partId = parseInt(partIdParam);
    console.log('[toggle-part] Parsed partId:', partId);

    // Validate partId is present and is a valid number
    if (isNaN(partId) || partId <= 0) {
      console.warn('[toggle-part] Invalid partId:', partId);
      return NextResponse.json(
        { error: 'Valid Part ID is required' }, 
        { status: 400 }
      );
    }

    // Pobierz aktualny stan widoczności części
    const cookieStore = await cookies();
    const openPartCookie = cookieStore.get('openPartId');
    const currentOpenPart = openPartCookie ? parseInt(openPartCookie.value) : 1;
    console.log('[toggle-part] Current open part:', currentOpenPart);

    // When clicking on a chapter, if it's already open, close it (set to 0)
    // Otherwise, open the clicked chapter and close others
    const newOpenPart = currentOpenPart === partId ? 0 : partId;
    console.log('[toggle-part] New open part:', newOpenPart);

    // Utwórz respons przekierowujący z powrotem na stronę główną
    const referer = req.headers.get('referer') || '/app';
    console.log('[toggle-part] Redirecting to:', referer);
    const response = NextResponse.redirect(referer);
    
    // Ustaw ciasteczko w response
    response.cookies.set({
      name: 'openPartId',
      value: newOpenPart.toString(),
      path: '/',
      httpOnly: true,
      maxAge: 60 * 60 * 24 * 30, // 30 dni
    });
    
    console.log('[toggle-part] Response prepared successfully');
    return response;
  } catch (error) {
    console.error('[toggle-part] Error in handler:', error);
    throw error; // Let the outer handler deal with this
  }
} 