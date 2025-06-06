// lib/auth/session.ts
import { compare, hash } from 'bcryptjs'; // Tetap gunakan jika Anda ingin membandingkan hash password di frontend (jarang)
import { SignJWT, jwtVerify } from 'jose';
import { cookies } from 'next/headers';
import { User } from '@/lib/db/schema'; // Menggunakan tipe User yang sudah disesuaikan

// Kunci ini HARUS SAMA dengan JWT_SECRET di backend Express.js Anda
const key = new TextEncoder().encode(process.env.AUTH_SECRET);
const SALT_ROUNDS = 10; // Tidak relevan jika hash password dilakukan di backend

export async function hashPassword(password: string) {
  // Fungsi ini mungkin tidak lagi digunakan jika hashing dilakukan di backend Express.js
  return hash(password, SALT_ROUNDS);
}

export async function comparePasswords(
  plainTextPassword: string,
  hashedPassword: string
) {
  // Fungsi ini mungkin tidak lagi digunakan jika perbandingan dilakukan di backend Express.js
  return compare(plainTextPassword, hashedPassword);
}

// Tipe data payload JWT yang diharapkan dari Express.js
// Sesuaikan dengan struktur payload JWT yang dikeluarkan oleh backend Express.js Anda
// Berdasarkan endpoint yang Anda berikan, payload JWT setelah login/register
// kemungkinan hanya berisi userId dan username.
type SessionData = {
  userId: number; // Dari `req.user.id` di Express.js
  username: string; // Dari `req.user.username` di Express.js
  expires: string; // Tanggal kedaluwarsa token (dari Express.js JWT payload)
};

export async function signToken(payload: SessionData) {
  // Fungsi ini digunakan oleh Next.js untuk memperbarui cookie sesinya sendiri
  // dengan payload yang sudah diverifikasi dari Express.js.
  return await new SignJWT(payload)
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime('1 day from now') // Ini adalah umur cookie Next.js, bukan umur JWT dari Express.js
    .sign(key);
}

export async function verifyToken(input: string) {
  // Fungsi ini digunakan oleh Next.js middleware untuk memverifikasi JWT dari Express.js
  // menggunakan AUTH_SECRET yang sama.
  const { payload } = await jwtVerify(input, key, {
    algorithms: ['HS256'],
  });
  return payload as SessionData;
}

export async function getSession() {
  const session = (await cookies()).get('session')?.value;
  if (!session) return null;
  return await verifyToken(session);
}

// Fungsi ini akan dipanggil setelah login/registrasi berhasil di Next.js
// untuk mengatur cookie sesi Next.js.
// Parameter `user` harus mencerminkan data yang tersedia dari respons login/register Express.js.
export async function setSession(user: { id: number; username: string; email: string; emailVerified: boolean }) {
  const expiresInOneDay = new Date(Date.now() + 24 * 60 * 60 * 1000);
  const session: SessionData = {
    userId: user.id,
    username: user.username,
    expires: expiresInOneDay.toISOString(), // Menggunakan tanggal kedaluwarsa Next.js
  };
  const encryptedSession = await signToken(session);
  (await cookies()).set('session', encryptedSession, {
    expires: expiresInOneDay,
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
  });
}
