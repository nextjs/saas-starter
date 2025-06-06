// middleware.ts
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { signToken, verifyToken } from '@/lib/auth/session'; // Menggunakan fungsi dari lib/auth/session yang dimodifikasi

const protectedRoutes = '/dashboard'; // Rute yang memerlukan autentikasi

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const sessionCookie = request.cookies.get('session'); // Ambil cookie 'session' dari browser
  const isProtectedRoute = pathname.startsWith(protectedRoutes);

  // Jika rute dilindungi dan tidak ada cookie sesi, redirect ke halaman login
  if (isProtectedRoute && !sessionCookie) {
    return NextResponse.redirect(new URL('/sign-in', request.url));
  }

  let res = NextResponse.next(); // Lanjutkan ke rute berikutnya

  // Jika ada cookie sesi dan ini adalah permintaan GET (untuk memperbarui sesi)
  if (sessionCookie && request.method === 'GET') {
    try {
      // PENTING: verifyToken ini akan menggunakan AUTH_SECRET dari Next.js
      // yang diasumsikan SAMA dengan JWT_SECRET di Express.js Anda.
      // Ini memverifikasi JWT yang dikeluarkan oleh backend Express.js.
      const parsed = await verifyToken(sessionCookie.value);

      // Periksa apakah token sudah kedaluwarsa (dari payload JWT Express.js)
      if (new Date(parsed.expires) < new Date()) {
        throw new Error('Sesi kedaluwarsa');
      }

      // Perbarui waktu kedaluwarsa sesi di Next.js (perpanjang umur cookie Next.js)
      const expiresInOneDay = new Date(Date.now() + 24 * 60 * 60 * 1000);

      res.cookies.set({
        name: 'session',
        value: await signToken({
          userId: parsed.userId, // Gunakan payload user yang sudah diverifikasi
          username: parsed.username,
          expires: expiresInOneDay.toISOString() // Gunakan tanggal kedaluwarsa baru
        }),
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production', // Hanya secure di produksi
        sameSite: 'lax',
        expires: expiresInOneDay
      });
    } catch (error) {
      console.error('Kesalahan saat memverifikasi atau memperbarui sesi:', error);
      res.cookies.delete('session'); // Hapus cookie jika tidak valid
      if (isProtectedRoute) {
        // Redirect ke halaman login jika sesi tidak valid atau kedaluwarsa
        return NextResponse.redirect(new URL('/sign-in', request.url));
      }
    }
  }

  return res;
}

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)'],
  runtime: 'nodejs'
};
