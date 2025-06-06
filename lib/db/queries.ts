// lib/db/queries.ts
import { cookies } from 'next/headers';
import { User, Team, ActivityLog, ApiKey } from './schema'; // Menggunakan tipe yang sudah disesuaikan
import { verifyToken } from '@/lib/auth/session'; // Untuk memverifikasi sesi Next.js

// URL backend Express.js
const EXPRESS_BACKEND_URL = process.env.NEXT_PUBLIC_EXPRESS_BACKEND_URL;

// Helper untuk memformat timestamp (tetap ada karena mungkin digunakan di frontend)
function formatTimestamp(date: Date): string {
  const year = date.getFullYear();
  const month = (date.getMonth() + 1).toString().padStart(2, '0');
  const day = date.getDate().toString().padStart(2, '0');
  const hours = date.getHours().toString().padStart(2, '0');
  const minutes = date.getMinutes().toString().padStart(2, '0');
  const seconds = date.getSeconds().toString().padStart(2, '0');
  return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
}

export async function getUser(): Promise<User | null> {
  const sessionCookie = (await cookies()).get('session');
  if (!sessionCookie || !sessionCookie.value) {
    return null;
  }

  try {
    // Verifikasi JWT lokal Next.js untuk memastikan sesi valid
    const sessionData = await verifyToken(sessionCookie.value);
    if (!sessionData || typeof sessionData.userId !== 'number') {
      return null;
    }
    if (new Date(sessionData.expires) < new Date()) {
      return null;
    }

    // Panggil endpoint /api/auth/profile di Express.js backend
    const response = await fetch(`${EXPRESS_BACKEND_URL}/api/auth/profile`, {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include', // PENTING: Untuk mengirim cookie otentikasi
      cache: 'no-store', // Pastikan data selalu terbaru
    });

    if (!response.ok) {
      console.error('Gagal mengambil profil pengguna dari backend:', response.status, await response.text());
      return null;
    }

    const responseData = await response.json();
    const backendUser = responseData.data; // Asumsi data user ada di responseData.data

    if (!backendUser) return null;

    // Petakan data dari backend Express.js ke tipe User Next.js
    // Sesuaikan dengan data yang DIKEMBALIKAN oleh endpoint /profile Anda
    const user: User = {
      id: backendUser.id,
      name: backendUser.username || backendUser.name || 'Pengguna', // Gunakan username jika ada
      email: backendUser.email,
      passwordHash: '***', // Dummy
      createdAt: new Date(backendUser.created_at),
      updatedAt: new Date(backendUser.last_login || backendUser.created_at), // Gunakan last_login jika ada
      deletedAt: null, // Asumsi /profile tidak mengembalikan deleted_at
      emailVerified: backendUser.email_verified === true, // Asumsi /profile mengembalikan email_verified
    };

    return user;
  } catch (error) {
    console.error('Kesalahan saat mengambil pengguna dari backend Express.js:', error);
    return null;
  }
}

// Fungsi ini tidak lagi relevan karena Stripe dihapus
export async function getTeamByStripeCustomerId(customerId: string) {
  console.warn('getTeamByStripeCustomerId dipanggil, tetapi Stripe dinonaktifkan. Mengembalikan null.');
  return null;
}

// Fungsi ini tidak lagi relevan karena Stripe dihapus
export async function updateTeamSubscription(
  teamId: number,
  subscriptionData: any
) {
  console.warn('updateTeamSubscription dipanggil, tetapi Stripe dinonaktifkan. Tidak ada aksi.');
}

// Fungsi ini akan mengambil data tim dari backend Express.js
// Karena Anda tidak ingin teamMembers, kita akan mengembalikan objek Team sederhana.
export async function getTeamForUser(): Promise<Team | null> {
  const user = await getUser();
  if (!user) {
    return null;
  }

  try {
    // Asumsi ada endpoint di Express.js yang mengembalikan data tim terkait user
    // Misalnya, /api/team atau /user/:userId/team
    // Jika tidak ada konsep 'team' di backend Anda sama sekali,
    // maka fungsi ini harus mengembalikan null atau disesuaikan.
    // Untuk saat ini, kita berasumsi ada endpoint `/api/team` sederhana.
    const response = await fetch(`${EXPRESS_BACKEND_URL}/api/team`, { // Sesuaikan endpoint Express.js Anda
      method: 'GET',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      cache: 'no-store',
    });

    if (!response.ok) {
      console.warn('Gagal mengambil data tim dari backend. Mungkin tidak ada konsep tim.');
      return null;
    }

    const responseData = await response.json();
    const backendTeam = responseData.team; // Asumsi data tim ada di responseData.team

    if (!backendTeam) return null;

    // Petakan data dari backend Express.js ke tipe Team Next.js
    const team: Team = {
      id: backendTeam.id,
      name: backendTeam.name,
      createdAt: new Date(backendTeam.created_at),
      updatedAt: new Date(backendTeam.updated_at),
      planName: backendTeam.plan_name || null,
      subscriptionStatus: backendTeam.subscription_status || null,
    };

    return team;
  } catch (error) {
    console.error('Kesalahan saat mengambil data tim dari backend Express.js:', error);
    return null;
  }
}

// Fungsi ini akan mengambil log aktivitas dari backend Express.js
// Berdasarkan endpoint /v1/usage yang Anda berikan
export async function getActivityLogs(): Promise<ActivityLog[]> {
  const user = await getUser();
  if (!user) {
    return [];
  }

  try {
    const response = await fetch(`${EXPRESS_BACKEND_URL}/v1/usage`, {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      cache: 'no-store',
    });

    if (!response.ok) {
      console.error('Gagal mengambil log aktivitas dari backend:', response.status, await response.text());
      return [];
    }

    const responseData = await response.json();
    const backendLogs = responseData.data; // Asumsi responseData.data adalah array log aktivitas dari Express.js

    if (!backendLogs) return [];

    const logs: ActivityLog[] = backendLogs.map((log: any) => ({
      id: log.id || Math.random(), // Gunakan ID yang unik jika backend tidak konsisten
      teamId: log.team_id || null, // Jika backend mengembalikan, jika tidak, null
      userId: user.id, // Gunakan user.id dari sesi Next.js
      action: log.request_type || log.model_used || ActivityType.UNKNOWN_ACTION, // Sesuaikan dengan kolom Express.js
      timestamp: new Date(log.usage_date || log.created_at),
      ipAddress: log.ip_address || null, // Jika backend mengembalikan, jika tidak, null
      userName: user.name || 'Unknown', // Gunakan user.name dari sesi Next.js
    })) || [];

    return logs;
  } catch (error) {
    console.error('Kesalahan saat mengambil log aktivitas dari backend Express.js:', error);
    return [];
  }
}

// Fungsi ini akan mengambil daftar API Keys dari backend Express.js
export async function getApiKeys(): Promise<ApiKey[]> {
  const user = await getUser();
  if (!user) {
    return [];
  }

  try {
    const response = await fetch(`${EXPRESS_BACKEND_URL}/api/keys`, {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      cache: 'no-store',
    });

    if (!response.ok) {
      console.error('Gagal mengambil kunci API dari backend:', response.status, await response.text());
      return [];
    }

    const responseData = await response.json();
    const backendKeys = responseData.keys; // Asumsi data kunci API ada di responseData.keys

    if (!backendKeys) return [];

    const apiKeys: ApiKey[] = backendKeys.map((key: any) => ({
      id: key.id_key_string, // Ini adalah 'id_key_string' dari Express.js
      keyInternalId: key.key_uuid, // Ini adalah 'key_uuid' dari Express.js
      name: key.name,
      userId: user.id, // Gunakan user.id dari sesi Next.js
      tier: key.tier, // Nama tier
      dailyUsage: key.usage.daily.current,
      monthlyUsage: key.usage.monthly.current,
      dailyLimit: key.usage.daily.limit,
      monthlyLimit: key.usage.monthly.limit,
      isActive: key.is_active,
      createdAt: new Date(key.created_at),
      lastUsed: key.last_used ? new Date(key.last_used) : null,
      dailyResetAt: new Date(key.usage.daily.reset_date),
      monthlyResetAt: new Date(key.usage.monthly.reset_date),
      creator: key.creator || 'Nusantara AI',
    }));

    return apiKeys;
  } catch (error) {
    console.error('Kesalahan saat mengambil kunci API dari backend Express.js:', error);
    return [];
  }
}
