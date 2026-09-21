'use server';

/**
 * CRUD data master: pelanggan, layanan, outlet.
 *
 * Dipisah dari `actions.ts` (yang mengurus transaksi POS) supaya batas
 * tanggung jawabnya jelas: file ini mengubah data acuan, file itu mencatat uang.
 *
 * Hak akses mengikuti PRD-FASE-1.md §5:
 *   pelanggan → OWNER, MANAJER, KASIR
 *   layanan   → OWNER, MANAJER
 *   outlet    → OWNER
 */

import { and, eq, sql } from 'drizzle-orm';
import { revalidatePath } from 'next/cache';
import { z } from 'zod';
import { db } from '@/lib/db/drizzle';
import {
  customers,
  orders,
  outlets,
  services,
  ServiceType,
  TeamRole,
} from '@/lib/db/schema';
import { getKonteks } from './queries';
import { cekBatasOutlet } from '@/lib/billing/batas';

export type HasilAksi = { error?: string; success?: string };

const BOLEH_PELANGGAN = [TeamRole.OWNER, TeamRole.MANAJER, TeamRole.KASIR] as string[];
const BOLEH_LAYANAN = [TeamRole.OWNER, TeamRole.MANAJER] as string[];
const BOLEH_OUTLET = [TeamRole.OWNER] as string[];

// --- Pelanggan -------------------------------------------------------------

const pelangganSchema = z.object({
  id: z.number().int().positive(),
  nama: z.string().min(2, 'Nama minimal 2 huruf').max(100),
  telepon: z
    .string()
    .min(8, 'Nomor HP minimal 8 digit')
    .max(30)
    .regex(/^[0-9+\-\s]+$/, 'Nomor HP hanya boleh angka'),
  alamat: z.string().max(300).optional(),
  catatan: z.string().max(500).optional(),
});

export async function ubahPelanggan(
  input: z.infer<typeof pelangganSchema>
): Promise<HasilAksi> {
  const konteks = await getKonteks();
  if (!konteks) return { error: 'Sesi tidak valid.' };
  if (!BOLEH_PELANGGAN.includes(konteks.role)) {
    return { error: 'Anda tidak punya akses mengubah pelanggan.' };
  }

  const parsed = pelangganSchema.safeParse(input);
  if (!parsed.success) return { error: parsed.error.errors[0].message };

  // Normalisasi sama seperti saat pembuatan, supaya aturan unik nomor HP konsisten.
  const telepon = parsed.data.telepon.replace(/[\s\-]/g, '');

  try {
    const hasil = await db
      .update(customers)
      .set({
        nama: parsed.data.nama,
        telepon,
        alamat: parsed.data.alamat || null,
        catatan: parsed.data.catatan || null,
        updatedAt: new Date(),
      })
      .where(
        and(eq(customers.id, parsed.data.id), eq(customers.teamId, konteks.teamId))
      )
      .returning({ id: customers.id });

    if (hasil.length === 0) return { error: 'Pelanggan tidak ditemukan.' };

    revalidatePath('/dashboard/pelanggan');
    return { success: 'Pelanggan diperbarui.' };
  } catch (error: any) {
    if (error?.code === '23505') {
      return { error: 'Nomor HP ini sudah dipakai pelanggan lain.' };
    }
    console.error('Gagal mengubah pelanggan:', error);
    return { error: 'Gagal mengubah pelanggan.' };
  }
}

/**
 * Pelanggan yang pernah bertransaksi tidak boleh dihapus — nota lama akan
 * kehilangan pemiliknya dan riwayat omzet jadi tidak bisa ditelusuri.
 */
export async function hapusPelanggan(id: number): Promise<HasilAksi> {
  const konteks = await getKonteks();
  if (!konteks) return { error: 'Sesi tidak valid.' };
  if (!BOLEH_PELANGGAN.includes(konteks.role)) {
    return { error: 'Anda tidak punya akses menghapus pelanggan.' };
  }

  const [{ jumlah }] = await db
    .select({ jumlah: sql<number>`count(*)` })
    .from(orders)
    .where(and(eq(orders.customerId, id), eq(orders.teamId, konteks.teamId)));

  if (Number(jumlah) > 0) {
    return { error: `Tidak bisa dihapus — pelanggan ini punya ${jumlah} pesanan.` };
  }

  const hasil = await db
    .delete(customers)
    .where(and(eq(customers.id, id), eq(customers.teamId, konteks.teamId)))
    .returning({ id: customers.id });

  if (hasil.length === 0) return { error: 'Pelanggan tidak ditemukan.' };

  revalidatePath('/dashboard/pelanggan');
  return { success: 'Pelanggan dihapus.' };
}

// --- Layanan ---------------------------------------------------------------

const layananSchema = z.object({
  nama: z.string().min(2, 'Nama layanan minimal 2 huruf').max(100),
  tipe: z.nativeEnum(ServiceType),
  satuan: z.string().min(1, 'Satuan wajib diisi').max(10),
  hargaDefault: z.number().int().positive('Harga harus lebih dari 0'),
  minQty: z.number().positive('Minimum harus lebih dari 0'),
  durasiJam: z.number().int().positive('Durasi harus lebih dari 0'),
  expressMultiplier: z
    .number()
    .min(1, 'Pengali express minimal 1')
    .max(9.99, 'Pengali express maksimal 9,99'),
  expressDurasiJam: z.number().int().positive('Durasi express harus lebih dari 0'),
});

export type InputLayanan = z.infer<typeof layananSchema>;

export async function buatLayanan(input: InputLayanan): Promise<HasilAksi> {
  const konteks = await getKonteks();
  if (!konteks) return { error: 'Sesi tidak valid.' };
  if (!BOLEH_LAYANAN.includes(konteks.role)) {
    return { error: 'Hanya Owner dan Manajer yang boleh mengelola layanan.' };
  }

  const parsed = layananSchema.safeParse(input);
  if (!parsed.success) return { error: parsed.error.errors[0].message };
  const d = parsed.data;

  await db.insert(services).values({
    teamId: konteks.teamId,
    nama: d.nama,
    tipe: d.tipe,
    satuan: d.satuan,
    hargaDefault: d.hargaDefault,
    minQty: d.minQty.toFixed(2),
    durasiJam: d.durasiJam,
    expressMultiplier: d.expressMultiplier.toFixed(2),
    expressDurasiJam: d.expressDurasiJam,
  });

  revalidatePath('/dashboard/layanan');
  revalidatePath('/dashboard/pos');
  return { success: 'Layanan ditambahkan.' };
}

export async function ubahLayanan(
  input: InputLayanan & { id: number }
): Promise<HasilAksi> {
  const konteks = await getKonteks();
  if (!konteks) return { error: 'Sesi tidak valid.' };
  if (!BOLEH_LAYANAN.includes(konteks.role)) {
    return { error: 'Hanya Owner dan Manajer yang boleh mengelola layanan.' };
  }

  const parsed = layananSchema
    .extend({ id: z.number().int().positive() })
    .safeParse(input);
  if (!parsed.success) return { error: parsed.error.errors[0].message };
  const d = parsed.data;

  // Aman mengubah harga: order_items menyimpan snapshot harga sendiri,
  // jadi nota yang sudah terbit tidak ikut berubah.
  const hasil = await db
    .update(services)
    .set({
      nama: d.nama,
      tipe: d.tipe,
      satuan: d.satuan,
      hargaDefault: d.hargaDefault,
      minQty: d.minQty.toFixed(2),
      durasiJam: d.durasiJam,
      expressMultiplier: d.expressMultiplier.toFixed(2),
      expressDurasiJam: d.expressDurasiJam,
      updatedAt: new Date(),
    })
    .where(and(eq(services.id, d.id), eq(services.teamId, konteks.teamId)))
    .returning({ id: services.id });

  if (hasil.length === 0) return { error: 'Layanan tidak ditemukan.' };

  revalidatePath('/dashboard/layanan');
  revalidatePath('/dashboard/pos');
  return { success: 'Layanan diperbarui.' };
}

/**
 * Layanan tidak pernah dihapus, hanya dinonaktifkan — `order_items` menunjuk
 * ke baris ini, menghapusnya akan memutus riwayat pesanan lama.
 */
export async function ubahAktifLayanan(
  id: number,
  aktif: boolean
): Promise<HasilAksi> {
  const konteks = await getKonteks();
  if (!konteks) return { error: 'Sesi tidak valid.' };
  if (!BOLEH_LAYANAN.includes(konteks.role)) {
    return { error: 'Hanya Owner dan Manajer yang boleh mengelola layanan.' };
  }

  const hasil = await db
    .update(services)
    .set({ aktif, updatedAt: new Date() })
    .where(and(eq(services.id, id), eq(services.teamId, konteks.teamId)))
    .returning({ id: services.id });

  if (hasil.length === 0) return { error: 'Layanan tidak ditemukan.' };

  revalidatePath('/dashboard/layanan');
  revalidatePath('/dashboard/pos');
  return { success: aktif ? 'Layanan diaktifkan.' : 'Layanan dinonaktifkan.' };
}

// --- Outlet ----------------------------------------------------------------

const outletSchema = z.object({
  nama: z.string().min(2, 'Nama outlet minimal 2 huruf').max(100),
  kodeNota: z
    .string()
    .min(2, 'Kode nota minimal 2 karakter')
    .max(10, 'Kode nota maksimal 10 karakter')
    .regex(/^[A-Za-z0-9]+$/, 'Kode nota hanya boleh huruf dan angka'),
  alamat: z.string().max(300).optional(),
  telepon: z.string().max(30).optional(),
});

export type InputOutlet = z.infer<typeof outletSchema>;

export async function buatOutlet(input: InputOutlet): Promise<HasilAksi> {
  const konteks = await getKonteks();
  if (!konteks) return { error: 'Sesi tidak valid.' };
  if (!BOLEH_OUTLET.includes(konteks.role)) {
    return { error: 'Hanya Owner yang boleh mengelola outlet.' };
  }

  const lewatBatas = await cekBatasOutlet(konteks.teamId);
  if (lewatBatas) return lewatBatas;

  const parsed = outletSchema.safeParse(input);
  if (!parsed.success) return { error: parsed.error.errors[0].message };

  try {
    await db.insert(outlets).values({
      teamId: konteks.teamId,
      nama: parsed.data.nama,
      // Selalu huruf besar supaya nomor nota seragam: PST-260825-001.
      kodeNota: parsed.data.kodeNota.toUpperCase(),
      alamat: parsed.data.alamat || null,
      telepon: parsed.data.telepon || null,
    });

    revalidatePath('/dashboard/outlet');
    revalidatePath('/dashboard/pos');
    return { success: 'Outlet ditambahkan.' };
  } catch (error: any) {
    if (error?.code === '23505') {
      return { error: 'Kode nota ini sudah dipakai outlet lain.' };
    }
    console.error('Gagal menambah outlet:', error);
    return { error: 'Gagal menambah outlet.' };
  }
}

export async function ubahOutlet(
  input: InputOutlet & { id: number }
): Promise<HasilAksi> {
  const konteks = await getKonteks();
  if (!konteks) return { error: 'Sesi tidak valid.' };
  if (!BOLEH_OUTLET.includes(konteks.role)) {
    return { error: 'Hanya Owner yang boleh mengelola outlet.' };
  }

  const parsed = outletSchema
    .extend({ id: z.number().int().positive() })
    .safeParse(input);
  if (!parsed.success) return { error: parsed.error.errors[0].message };
  const d = parsed.data;

  try {
    const hasil = await db
      .update(outlets)
      .set({
        nama: d.nama,
        kodeNota: d.kodeNota.toUpperCase(),
        alamat: d.alamat || null,
        telepon: d.telepon || null,
        updatedAt: new Date(),
      })
      .where(and(eq(outlets.id, d.id), eq(outlets.teamId, konteks.teamId)))
      .returning({ id: outlets.id });

    if (hasil.length === 0) return { error: 'Outlet tidak ditemukan.' };

    revalidatePath('/dashboard/outlet');
    revalidatePath('/dashboard/pos');
    return { success: 'Outlet diperbarui.' };
  } catch (error: any) {
    if (error?.code === '23505') {
      return { error: 'Kode nota ini sudah dipakai outlet lain.' };
    }
    console.error('Gagal mengubah outlet:', error);
    return { error: 'Gagal mengubah outlet.' };
  }
}

export async function ubahAktifOutlet(
  id: number,
  aktif: boolean
): Promise<HasilAksi> {
  const konteks = await getKonteks();
  if (!konteks) return { error: 'Sesi tidak valid.' };
  if (!BOLEH_OUTLET.includes(konteks.role)) {
    return { error: 'Hanya Owner yang boleh mengelola outlet.' };
  }

  const hasil = await db
    .update(outlets)
    .set({ aktif, updatedAt: new Date() })
    .where(and(eq(outlets.id, id), eq(outlets.teamId, konteks.teamId)))
    .returning({ id: outlets.id });

  if (hasil.length === 0) return { error: 'Outlet tidak ditemukan.' };

  revalidatePath('/dashboard/outlet');
  revalidatePath('/dashboard/pos');
  return { success: aktif ? 'Outlet diaktifkan.' : 'Outlet dinonaktifkan.' };
}
