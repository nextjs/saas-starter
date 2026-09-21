'use server';

import { eq } from 'drizzle-orm';
import { revalidatePath } from 'next/cache';
import { z } from 'zod';
import { db } from '@/lib/db/drizzle';
import { outlets, services, TeamRole } from '@/lib/db/schema';
import { getKonteks } from './queries';
import { LAYANAN_BAWAAN } from './layanan-bawaan';

export type HasilAksi = { error?: string; success?: string };

const skema = z.object({
  nama: z.string().min(2, 'Nama outlet minimal 2 huruf').max(100),
  kodeNota: z
    .string()
    .min(2, 'Kode nota minimal 2 karakter')
    .max(10)
    .regex(/^[A-Za-z0-9]+$/, 'Kode nota hanya boleh huruf dan angka'),
  alamat: z.string().max(300).optional(),
  telepon: z.string().max(30).optional(),
  layanan: z.array(z.string()).min(1, 'Pilih minimal satu layanan'),
});

/**
 * Menyiapkan tenant baru: outlet pertama + layanan awal, dalam satu transaksi.
 *
 * Batas paket sengaja **tidak** dicek di sini. Ini outlet pertama tenant, dan
 * semua paket termasuk Gratis mengizinkan minimal satu outlet — menolak di sini
 * hanya akan mengunci pengguna baru di luar aplikasinya sendiri.
 */
export async function selesaikanOnboarding(
  input: z.infer<typeof skema>
): Promise<HasilAksi> {
  const konteks = await getKonteks();
  if (!konteks) return { error: 'Sesi tidak valid.' };
  if (konteks.role !== TeamRole.OWNER) {
    return { error: 'Hanya Owner yang boleh menyiapkan outlet pertama.' };
  }

  const parsed = skema.safeParse(input);
  if (!parsed.success) return { error: parsed.error.errors[0].message };
  const d = parsed.data;

  const sudahAda = await db
    .select({ id: outlets.id })
    .from(outlets)
    .where(eq(outlets.teamId, konteks.teamId))
    .limit(1);
  if (sudahAda.length > 0) {
    return { error: 'Outlet sudah pernah dibuat. Gunakan menu Outlet untuk menambah.' };
  }

  const dipilih = LAYANAN_BAWAAN.filter((l) => d.layanan.includes(l.kunci));
  if (dipilih.length === 0) return { error: 'Pilih minimal satu layanan.' };

  try {
    await db.transaction(async (tx) => {
      await tx.insert(outlets).values({
        teamId: konteks.teamId,
        nama: d.nama,
        kodeNota: d.kodeNota.toUpperCase(),
        alamat: d.alamat || null,
        telepon: d.telepon || null,
      });

      await tx.insert(services).values(
        dipilih.map((l) => ({
          teamId: konteks.teamId,
          nama: l.nama,
          tipe: l.tipe,
          satuan: l.satuan,
          hargaDefault: l.hargaDefault,
          minQty: l.minQty.toFixed(2),
          durasiJam: l.durasiJam,
          expressMultiplier: l.expressMultiplier.toFixed(2),
          expressDurasiJam: l.expressDurasiJam,
        }))
      );
    });
  } catch (error: any) {
    if (error?.code === '23505') {
      return { error: 'Kode nota ini sudah dipakai. Coba kode lain.' };
    }
    console.error('Gagal menyelesaikan onboarding:', error);
    return { error: 'Gagal menyiapkan outlet. Coba lagi.' };
  }

  revalidatePath('/dashboard', 'layout');
  return { success: 'Outlet dan layanan siap.' };
}
