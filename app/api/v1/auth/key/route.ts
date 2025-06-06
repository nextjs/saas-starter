// app/api/v1/auth/key/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { getUser } from '@/lib/db/queries'; // Untuk otentikasi user jika diperlukan

const EXPRESS_BACKEND_URL = process.env.NEXT_PUBLIC_EXPRESS_BACKEND_URL;

export async function GET(request: NextRequest) {
  // Opsional: Anda bisa memeriksa autentikasi pengguna di sini jika endpoint ini hanya untuk pengguna terautentikasi
  // const user = await getUser();
  // if (!user) {
  //   return NextResponse.json({ error: { message: 'Tidak terautentikasi' } }, { status: 401 });
  // }

  try {
    // URL disesuaikan: /v1/auth/key
    const backendResponse = await fetch(`${EXPRESS_BACKEND_URL}/v1/auth/key`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        // Jika Express.js mengharapkan API Key di header (misal 'Authorization' atau 'x-api-key')
        // Anda harus meneruskannya dari permintaan Next.js frontend atau mendapatkan dari tempat lain.
        // Jika Express.js menggunakan HttpOnly cookie, `credentials: 'include'` sudah cukup.
        // 'Authorization': request.headers.get('Authorization') || '', // Contoh: meneruskan header dari frontend
        // 'x-api-key': request.headers.get('x-api-key') || '', // Contoh: meneruskan header kustom
      },
      credentials: 'include', // Penting untuk meneruskan cookie jika ada
      cache: 'no-store', // Pastikan data selalu terbaru
    });

    const data = await backendResponse.json();
    return NextResponse.json(data, { status: backendResponse.status });
  } catch (error: any) {
    console.error('Kesalahan proxy auth/key:', error);
    return NextResponse.json({ error: { message: 'Kesalahan internal server proxy: ' + error.message } }, { status: 500 });
  }
}
