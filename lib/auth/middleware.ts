// lib/auth/middleware.ts
import { z } from 'zod';
import { User } from '@/lib/db/schema'; // Menggunakan tipe User yang sudah disesuaikan
import { getUser } from '@/lib/db/queries'; // Menggunakan fungsi getUser yang sudah dimodifikasi
import { redirect } from 'next/navigation';

export type ActionState = {
  error?: string;
  success?: string;
  [key: string]: any; // Ini memungkinkan properti tambahan
};

type ValidatedActionFunction<S extends z.ZodType<any, any>, T> = (
  data: z.infer<S>,
  formData: FormData
) => Promise<T>;

export function validatedAction<S extends z.ZodType<any, any>, T>(
  schema: S,
  action: ValidatedActionFunction<S, T>
) {
  return async (prevState: ActionState, formData: FormData) => {
    const result = schema.safeParse(Object.fromEntries(formData));
    if (!result.success) {
      return { error: result.error.errors[0].message };
    }

    return action(result.data, formData);
  };
}

type ValidatedActionWithUserFunction<S extends z.ZodType<any, any>, T> = (
  data: z.infer<S>,
  formData: FormData,
  user: User
) => Promise<T>;

export function validatedActionWithUser<S extends z.ZodType<any, any>, T>(
  schema: S,
  action: ValidatedActionWithUserFunction<S, T>
) {
  return async (prevState: ActionState, formData: FormData) => {
    const user = await getUser(); // Mengambil user dari backend Express.js
    if (!user) {
      throw new Error('Pengguna tidak terautentikasi');
    }

    const result = schema.safeParse(Object.fromEntries(formData));
    if (!result.success) {
      return { error: result.error.errors[0].message };
    }

    return action(result.data, formData, user);
  };
}

// Fungsi `withTeam` DIHAPUS karena konsep Team dan teamMembers dihilangkan dari frontend.
// Jika Anda perlu otorisasi atau data terkait tim dari backend, Anda harus mengadaptasi
// `validatedActionWithUser` untuk mendapatkan data tersebut secara langsung dari Express.js
// atau membuat fungsi helper baru yang memanggil endpoint tim di backend.
