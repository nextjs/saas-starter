// app/api/v1/usage/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { getUser } from '@/lib/db/queries'; // Untuk otentikasi user jika diperlukan

const EXPRESS_BACKEND_URL = process.env.NEXT_PUBLIC_EXPRESS_BACKEND_URL;

export async function GET(request: NextRequest) {
  // Opsional: Anda bisa memeriksa autentikasi pengguna di sini
  // const user = await getUser();
  // if (!user) {
  //   return NextResponse.json({ error: { message: 'Tidak terautentikasi' } }, { status: 401 });
  // }

  // Teruskan query params dari Next.js ke Express.js
  const searchParams = request.nextUrl.searchParams.toString();
  const url = `${EXPRESS_BACKEND_URL}/v1/usage${searchParams ? `?${searchParams}` : ''}`;

  try {
    // URL disesuaikan: /v1/usage
    const backendResponse = await fetch(url, {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      cache: 'no-store',
    });

    const data = await backendResponse.json();
    return NextResponse.json(data, { status: backendResponse.status });
  } catch (error: any) {
    console.error('Kesalahan proxy usage:', error);
    return NextResponse.json({ error: { message: 'Kesalahan internal server proxy: ' + error.message } }, { status: 500 });
  }
}
