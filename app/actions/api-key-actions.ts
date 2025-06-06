// app/actions/api-key-actions.ts
'use server';

import { z } from 'zod';
import { getUser } from '@/lib/db/queries'; // Menggunakan getUser yang sudah dimodifikasi
import { ActionState } from '@/lib/auth/middleware';
import { ApiKey } from '@/lib/db/schema'; // Menggunakan tipe ApiKey

const EXPRESS_BACKEND_URL = process.env.NEXT_PUBLIC_EXPRESS_BACKEND_URL;

// Skema untuk generate API key
const generateApiKeySchema = z.object({
  name: z.string().min(1).max(100).optional().default('Kunci Dihasilkan'),
  tier: z.string().optional().default('Free'),
});

export async function generateUserApiKey(prevState: ActionState, formData: FormData): Promise<ActionState & { apiKey?: ApiKey }> {
  const result = generateApiKeySchema.safeParse(Object.fromEntries(formData));

  if (!result.success) {
    return { error: result.error.errors[0].message, ...result.data };
  }

  const { name, tier } = result.data;
  const user = await getUser();

  if (!user) {
    return { error: 'Anda harus login untuk membuat kunci API.' };
  }

  try {
    // URL disesuaikan: /get/getkey
    const response = await fetch(`${EXPRESS_BACKEND_URL}/get/getkey?name=${encodeURIComponent(name)}&tier=${encodeURIComponent(tier)}`, {
      method: 'GET', // Endpoint Anda adalah GET
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'include', // Penting untuk mengirim cookie
    });

    const responseData = await response.json();

    if (!response.ok || !responseData.status) {
      console.error('Gagal menghasilkan kunci API di backend:', responseData);
      return { error: responseData.message || 'Gagal menghasilkan kunci API.' };
    }

    const generatedKeyData = responseData.result; // Asumsi struktur respons

    // Petakan data dari backend Express.js ke tipe ApiKey Next.js
    const newApiKey: ApiKey = {
      id: generatedKeyData.apikey, // Ini adalah 'id_key_string' atau 'api_key' dari Express.js
      keyInternalId: generatedKeyData.id, // Ini adalah 'key_uuid' atau 'id' internal dari Express.js (jika ada di respons)
      name: generatedKeyData.name,
      userId: user.id, // Gunakan user.id dari sesi Next.js
      tier: generatedKeyData.tier, // Nama tier
      dailyUsage: generatedKeyData.usage.daily.current,
      monthlyUsage: generatedKeyData.usage.monthly.current,
      dailyLimit: generatedKeyData.usage.daily.limit,
      monthlyLimit: generatedKeyData.usage.monthly.limit,
      isActive: true, // Kunci baru aktif
      createdAt: new Date(generatedKeyData.created_at),
      lastUsed: null, // Kunci baru belum digunakan
      dailyResetAt: new Date(generatedKeyData.usage.daily.reset_date),
      monthlyResetAt: new Date(generatedKeyData.usage.monthly.reset_date),
      creator: generatedKeyData.creator || 'Nusantara AI',
    };


    return {
      success: 'Kunci API berhasil dihasilkan!',
      apiKey: newApiKey,
    };
  } catch (error: any) {
    console.error('Kesalahan saat menghasilkan kunci API:', error);
    return { error: 'Terjadi kesalahan tak terduga: ' + error.message };
  }
}

// Skema untuk menonaktifkan API key
const deactivateApiKeySchema = z.object({
  apiKeyString: z.string().min(1),
});

export async function deactivateUserApiKey(prevState: ActionState, formData: FormData): Promise<ActionState> {
  const result = deactivateApiKeySchema.safeParse(Object.fromEntries(formData));
  if (!result.success) {
    return { error: result.error.errors[0].message };
  }
  const { apiKeyString } = result.data;
  const user = await getUser();
  if (!user) return { error: 'Tidak terautentikasi.' };

  try {
    // URL disesuaikan: /api/keys/:apiKeyString
    const response = await fetch(`${EXPRESS_BACKEND_URL}/api/keys/${apiKeyString}`, {
      method: 'DELETE',
      credentials: 'include',
    });
    const responseData = await response.json();
    if (!response.ok || !responseData.status) {
      return { error: responseData.message || 'Gagal menonaktifkan kunci API.' };
    }
    return { success: 'Kunci API berhasil dinonaktifkan.' };
  } catch (error: any) {
    return { error: 'Kesalahan saat menonaktifkan kunci API: ' + error.message };
  }
}

// Skema untuk menghapus permanen API key
const deleteApiKeyPermanentSchema = z.object({
  apiKeyString: z.string().min(1),
});

export async function deleteUserApiKeyPermanent(prevState: ActionState, formData: FormData): Promise<ActionState> {
  const result = deleteApiKeyPermanentSchema.safeParse(Object.fromEntries(formData));
  if (!result.success) {
    return { error: result.error.errors[0].message };
  }
  const { apiKeyString } = result.data;
  const user = await getUser();
  if (!user) return { error: 'Tidak terautentikasi.' };

  try {
    // URL disesuaikan: /api/keys/:apiKeyString/permanent
    const response = await fetch(`${EXPRESS_BACKEND_URL}/api/keys/${apiKeyString}/permanent`, {
      method: 'DELETE',
      credentials: 'include',
    });
    const responseData = await response.json();
    if (!response.ok || !responseData.status) {
      return { error: responseData.message || 'Gagal menghapus kunci API secara permanen.' };
    }
    return { success: 'Kunci API berhasil dihapus secara permanen.' };
  } catch (error: any) {
    return { error: 'Kesalahan saat menghapus kunci API secara permanen: ' + error.message };
  }
}
