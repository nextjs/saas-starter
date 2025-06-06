// app/(login)/actions.ts
'use server';

import { z } from 'zod';
import { redirect } from 'next/navigation';
import { cookies } from 'next/headers';

import { ActionState } from '@/lib/auth/middleware';
import { User } from '@/lib/db/schema'; // Menggunakan tipe User yang sudah disesuaikan

const EXPRESS_BACKEND_URL = process.env.NEXT_PUBLIC_EXPRESS_BACKEND_URL;

// Skema validasi untuk Sign In
const signInSchema = z.object({
  email: z.string().email().min(3).max(255),
  password: z.string().min(8).max(100),
  redirect: z.string().optional(),
  priceId: z.string().optional(), // Untuk alur "berlangganan via email"
});

export async function signIn(prevState: ActionState, formData: FormData): Promise<ActionState> {
  const data = Object.fromEntries(formData);
  const result = signInSchema.safeParse(data);

  if (!result.success) {
    return { error: result.error.errors[0].message, ...result.data };
  }

  const { email, password, redirect: redirectTo, priceId } = result.data;

  try {
    // URL disesuaikan: /api/auth/login
    const response = await fetch(`${EXPRESS_BACKEND_URL}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username: email, password }), // Express.js Anda menerima 'username' atau 'email'
      credentials: 'include', // PENTING: Untuk mengirim dan menerima HttpOnly cookie
    });

    const responseData = await response.json();

    if (!response.ok || !responseData.status) { // Periksa status dari backend Express.js
      console.error('Login gagal di backend:', responseData);
      return {
        error: responseData.message || 'Login gagal. Periksa kredensial Anda.',
        email,
        password: '',
      };
    }

    // Jika Express.js mengatur HttpOnly cookie 'session', Next.js middleware akan menanganinya.
    // Tidak perlu setSession eksplisit di sini.

    // Alur berlangganan via email (menggantikan Stripe)
    if (redirectTo === 'checkout' && priceId) {
      // Redirect ke halaman pricing untuk memicu aksi pengiriman email
      redirect(`/pricing?action=request-subscription&priceId=${priceId}`);
      return { success: 'Permintaan berlangganan akan diproses. Silakan cek email Anda.' };
    }

    redirect('/dashboard');
    return { success: 'Login berhasil' }; // Tidak akan tercapai karena redirect
  } catch (error: any) {
    console.error('Terjadi kesalahan saat login:', error);
    return {
      error: 'Terjadi kesalahan tak terduga: ' + (error.message || 'Silakan coba lagi.'),
      email,
      password: '',
    };
  }
}

// Skema validasi untuk Sign Up
const signUpSchema = z.object({
  username: z.string().min(3).max(50),
  email: z.string().email(),
  password: z.string().min(8).max(100),
  inviteId: z.string().optional(), // Jika Express.js mendukung inviteId
  redirect: z.string().optional(),
  priceId: z.string().optional(),
});

export async function signUp(prevState: ActionState, formData: FormData): Promise<ActionState> {
  const data = Object.fromEntries(formData);
  const result = signUpSchema.safeParse(data);

  if (!result.success) {
    return { error: result.error.errors[0].message, ...result.data };
  }

  const { username, email, password, inviteId, redirect: redirectTo, priceId } = result.data;

  try {
    // URL disesuaikan: /api/auth/register
    const response = await fetch(`${EXPRESS_BACKEND_URL}/api/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, email, password, inviteId }), // Teruskan inviteId jika Express.js menggunakannya
      credentials: 'include', // PENTING: Untuk mengirim dan menerima HttpOnly cookie
    });

    const responseData = await response.json();

    if (!response.ok || !responseData.status) { // Periksa status dari backend Express.js
      console.error('Registrasi gagal di backend:', responseData);
      return {
        error: responseData.message || 'Registrasi gagal. Silakan coba lagi.',
        email,
        password: '',
      };
    }

    // Alur berlangganan via email setelah registrasi
    if (redirectTo === 'checkout' && priceId) {
      redirect(`/pricing?action=request-subscription&priceId=${priceId}`);
      return { success: 'Registrasi berhasil! Permintaan berlangganan akan diproses. Silakan cek email Anda.' };
    }

    // Setelah registrasi, biasanya pengguna perlu memverifikasi email
    redirect('/sign-in?message=Registrasi berhasil! Silakan periksa email Anda untuk verifikasi.');
    return { success: 'Registrasi berhasil! Silakan periksa email Anda untuk verifikasi.' }; // Tidak akan tercapai karena redirect
  } catch (error: any) {
    console.error('Terjadi kesalahan saat registrasi:', error);
    return {
      error: 'Terjadi kesalahan tak terduga: ' + (error.message || 'Silakan coba lagi.'),
      email,
      password: '',
    };
  }
}

export async function signOut() {
  try {
    // URL disesuaikan: /api/auth/logout (Asumsi ada endpoint logout di routes/auth.js)
    await fetch(`${EXPRESS_BACKEND_URL}/api/auth/logout`, {
      method: 'POST',
      credentials: 'include',
    });
  } catch (error) {
    console.error('Gagal memanggil logout backend:', error);
  }

  cookies().delete('session');
  redirect('/');
}

// Skema dan Aksi untuk updatePassword
const updatePasswordSchema = z.object({
  currentPassword: z.string().min(8).max(100),
  newPassword: z.string().min(8).max(100),
  confirmPassword: z.string().min(8).max(100)
});

export async function updatePassword(prevState: ActionState, formData: FormData): Promise<ActionState> {
  const data = Object.fromEntries(formData);
  const result = updatePasswordSchema.safeParse(data);

  if (!result.success) {
    return { error: result.error.errors[0].message, ...result.data };
  }

  const { currentPassword, newPassword, confirmPassword } = result.data;

  if (newPassword !== confirmPassword) {
    return { error: 'Password baru dan konfirmasi password tidak cocok.' };
  }

  try {
    // URL disesuaikan: /api/auth/update-password (Asumsi ada di routes/auth.js)
    const response = await fetch(`${EXPRESS_BACKEND_URL}/api/auth/update-password`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ currentPassword, newPassword }),
      credentials: 'include',
    });

    const responseData = await response.json();

    if (!response.ok || !responseData.status) {
      console.error('Gagal memperbarui password di backend:', responseData);
      return { error: responseData.message || 'Gagal memperbarui password.' };
    }

    return { success: 'Password berhasil diperbarui.' };
  } catch (error: any) {
    console.error('Kesalahan saat memperbarui password:', error);
    return { error: 'Terjadi kesalahan tak terduga: ' + error.message };
  }
}

// Skema dan Aksi untuk deleteAccount
const deleteAccountSchema = z.object({
  password: z.string().min(8).max(100)
});

export async function deleteAccount(prevState: ActionState, formData: FormData): Promise<ActionState> {
  const data = Object.fromEntries(formData);
  const result = deleteAccountSchema.safeParse(data);

  if (!result.success) {
    return { error: result.error.errors[0].message, ...result.data };
  }

  const { password } = result.data;

  try {
    // URL disesuaikan: /api/auth/delete-account (Asumsi ada di routes/auth.js)
    const response = await fetch(`${EXPRESS_BACKEND_URL}/api/auth/delete-account`, {
      method: 'POST', // Atau DELETE jika backend Anda mendukung
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ password }),
      credentials: 'include',
    });

    const responseData = await response.json();

    if (!response.ok || !responseData.status) {
      console.error('Gagal menghapus akun di backend:', responseData);
      return { error: responseData.message || 'Gagal menghapus akun.' };
    }

    cookies().delete('session');
    redirect('/sign-in');
    return { success: 'Akun berhasil dihapus.' };
  } catch (error: any) {
    console.error('Kesalahan saat menghapus akun:', error);
    return { error: 'Terjadi kesalahan tak terduga: ' + error.message };
  }
}

// Skema dan Aksi untuk updateAccount
const updateAccountSchema = z.object({
  name: z.string().min(1, 'Nama diperlukan').max(100),
  email: z.string().email('Alamat email tidak valid')
});

export async function updateAccount(prevState: ActionState, formData: FormData): Promise<ActionState> {
  const data = Object.fromEntries(formData);
  const result = updateAccountSchema.safeParse(data);

  if (!result.success) {
    return { error: result.error.errors[0].message, ...result.data };
  }

  const { name, email } = result.data;

  try {
    // URL disesuaikan: /api/auth/update-profile (Asumsi ada di routes/auth.js)
    const response = await fetch(`${EXPRESS_BACKEND_URL}/api/auth/update-profile`, {
      method: 'POST', // Atau PUT
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, email }),
      credentials: 'include',
    });

    const responseData = await response.json();

    if (!response.ok || !responseData.status) {
      console.error('Gagal memperbarui akun di backend:', responseData);
      return { error: responseData.message || 'Gagal memperbarui akun.' };
    }

    return { success: 'Akun berhasil diperbarui.' };
  } catch (error: any) {
    console.error('Kesalahan saat memperbarui akun:', error);
    return { error: 'Terjadi kesalahan tak terduga: ' + error.message };
  }
}

// Aksi terkait teamMembers DIHILANGKAN karena Anda tidak ingin fitur ini
// removeTeamMember dan inviteTeamMember tidak akan diimplementasikan di Next.js.
