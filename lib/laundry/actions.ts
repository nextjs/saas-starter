'use server';

import { and, eq, sql } from 'drizzle-orm';
import { revalidatePath } from 'next/cache';
import { z } from 'zod';
import { db } from '@/lib/db/drizzle';
import {
  customers,
  orderItems,
  orders,
  orderStatusHistory,
  outlets,
  payments,
  servicePrices,
  services,
  OrderStatus,
  PaymentMethod,
  TeamRole,
} from '@/lib/db/schema';
import { getKonteks } from './queries';
import { kirimNotifikasiPesanan } from '@/lib/wa/notifikasi';
import { cekBatasPesanan } from '@/lib/billing/batas';
import { JenisNotifikasi } from './enums';
import { nomorNotaBerikutnya } from './nota';
import {
  AturanLayanan,
  hitungEstimasiSelesai,
  hitungSubtotalItem,
  hitungTotal,
  turunkanStatusBayar,
} from './pricing';

export type HasilAksi = { error?: string; success?: string; orderId?: number };

const BOLEH_POS = [TeamRole.OWNER, TeamRole.MANAJER, TeamRole.KASIR] as string[];
const BOLEH_UBAH_STATUS = [
  TeamRole.OWNER,
  TeamRole.MANAJER,
  TeamRole.KASIR,
  TeamRole.PRODUKSI,
] as string[];

const itemSchema = z.object({
  serviceId: z.number().int().positive(),
  qty: z.number().positive('Berat/jumlah harus lebih dari 0'),
  isExpress: z.boolean(),
  catatan: z.string().max(200).optional(),
});

const buatPesananSchema = z.object({
  outletId: z.number().int().positive(),
  customerId: z.number().int().positive(),
  items: z.array(itemSchema).min(1, 'Minimal satu layanan'),
  diskon: z.number().int().min(0),
  catatan: z.string().max(500).optional(),
  bayar: z.number().int().min(0),
  metodeBayar: z.nativeEnum(PaymentMethod),
});

export type InputBuatPesanan = z.infer<typeof buatPesananSchema>;

/**
 * Membuat pesanan baru beserta item, pembayaran awal (DP/lunas), dan baris
 * riwayat status pertama — semuanya dalam satu transaksi.
 *
 * Harga TIDAK diambil dari input client. Client hanya mengirim layanan mana,
 * berapa banyak, dan express atau tidak; harga dibaca ulang dari database di
 * sini. Kalau tidak, siapa pun bisa mengirim harga Rp 0 lewat DevTools.
 */
export async function buatPesanan(input: InputBuatPesanan): Promise<HasilAksi> {
  const konteks = await getKonteks();
  if (!konteks) return { error: 'Sesi tidak valid. Silakan masuk kembali.' };
  if (!BOLEH_POS.includes(konteks.role)) {
    return { error: 'Anda tidak punya akses ke POS.' };
  }

  // Dicek sebelum nomor nota dibuat, supaya penolakan tidak meninggalkan
  // lompatan nomor yang membingungkan saat audit (PRD-FASE-3.md §1).
  const lewatBatas = await cekBatasPesanan(konteks.teamId);
  if (lewatBatas) return lewatBatas;

  const parsed = buatPesananSchema.safeParse(input);
  if (!parsed.success) {
    return { error: parsed.error.errors[0].message };
  }
  const data = parsed.data;

  // Outlet wajib milik tenant ini, dan sesuai penugasan outlet anggota.
  const [outlet] = await db
    .select()
    .from(outlets)
    .where(and(eq(outlets.id, data.outletId), eq(outlets.teamId, konteks.teamId)))
    .limit(1);
  if (!outlet) return { error: 'Outlet tidak ditemukan.' };
  if (konteks.outletId && konteks.outletId !== outlet.id) {
    return { error: 'Anda tidak ditugaskan di outlet ini.' };
  }

  const [pelanggan] = await db
    .select()
    .from(customers)
    .where(
      and(eq(customers.id, data.customerId), eq(customers.teamId, konteks.teamId))
    )
    .limit(1);
  if (!pelanggan) return { error: 'Pelanggan tidak ditemukan.' };

  // Baca harga & aturan layanan dari database, bukan dari client.
  const idLayanan = [...new Set(data.items.map((i) => i.serviceId))];
  const daftarLayanan = await db
    .select({
      id: services.id,
      nama: services.nama,
      tipe: services.tipe,
      satuan: services.satuan,
      hargaDefault: services.hargaDefault,
      hargaOutlet: servicePrices.harga,
      minQty: services.minQty,
      durasiJam: services.durasiJam,
      expressMultiplier: services.expressMultiplier,
      expressDurasiJam: services.expressDurasiJam,
    })
    .from(services)
    .leftJoin(
      servicePrices,
      and(
        eq(servicePrices.serviceId, services.id),
        eq(servicePrices.outletId, outlet.id)
      )
    )
    .where(
      and(
        eq(services.teamId, konteks.teamId),
        eq(services.aktif, true),
        sql`${services.id} in ${idLayanan}`
      )
    );

  const petaLayanan = new Map(daftarLayanan.map((s) => [s.id, s]));

  type BarisItem = {
    serviceId: number;
    namaLayanan: string;
    tipe: string;
    satuan: string;
    qty: string;
    hargaSatuan: number;
    isExpress: boolean;
    subtotal: number;
    catatan: string | null;
    /** Dipakai untuk menghitung estimasi selesai, tidak ikut disimpan. */
    aturan: AturanLayanan;
  };

  const barisItem: BarisItem[] = [];
  for (const item of data.items) {
    const s = petaLayanan.get(item.serviceId);
    if (!s) return { error: 'Ada layanan yang tidak valid atau sudah nonaktif.' };

    const aturan = {
      tipe: s.tipe,
      hargaDasar: s.hargaOutlet ?? s.hargaDefault,
      minQty: s.minQty,
      durasiJam: s.durasiJam,
      expressMultiplier: s.expressMultiplier,
      expressDurasiJam: s.expressDurasiJam,
    };

    const { hargaSatuan, subtotal } = hitungSubtotalItem(
      aturan,
      item.qty,
      item.isExpress
    );

    barisItem.push({
      serviceId: s.id,
      namaLayanan: s.nama,
      tipe: s.tipe,
      satuan: s.satuan,
      qty: item.qty.toFixed(2),
      hargaSatuan,
      isExpress: item.isExpress,
      subtotal,
      catatan: item.catatan || null,
      aturan,
    });
  }

  const { subtotal, total } = hitungTotal(
    barisItem.map((b) => b.subtotal),
    data.diskon
  );

  const dibayar = Math.min(data.bayar, total);
  const statusBayar = turunkanStatusBayar(total, dibayar);

  const masuk = new Date();
  const estimasi = hitungEstimasiSelesai(
    masuk,
    barisItem.map((b) => ({ layanan: b.aturan, isExpress: b.isExpress }))
  );

  // Nomor nota bisa bentrok kalau dua kasir menyimpan bersamaan; unique
  // constraint (team_id, nomor_nota) yang menangkapnya, lalu kita ulang.
  const MAKS_PERCOBAAN = 5;
  for (let percobaan = 1; percobaan <= MAKS_PERCOBAAN; percobaan++) {
    const nomorNota = await nomorNotaBerikutnya(
      konteks.teamId,
      outlet.kodeNota,
      masuk
    );

    try {
      const orderId = await db.transaction(async (tx) => {
        const [order] = await tx
          .insert(orders)
          .values({
            teamId: konteks.teamId,
            outletId: outlet.id,
            customerId: pelanggan.id,
            nomorNota,
            status: OrderStatus.BARU,
            statusBayar,
            tanggalMasuk: masuk,
            estimasiSelesai: estimasi,
            subtotal,
            diskon: data.diskon,
            total,
            catatan: data.catatan || null,
            createdBy: konteks.user.id,
          })
          .returning();

        await tx.insert(orderItems).values(
          barisItem.map(({ aturan, ...b }) => ({ ...b, orderId: order.id }))
        );

        if (dibayar > 0) {
          await tx.insert(payments).values({
            orderId: order.id,
            jumlah: dibayar,
            metode: data.metodeBayar,
            receivedBy: konteks.user.id,
          });
        }

        await tx.insert(orderStatusHistory).values({
          orderId: order.id,
          status: OrderStatus.BARU,
          catatan: 'Pesanan dibuat',
          changedBy: konteks.user.id,
        });

        return order.id;
      });

      // Struk digital. Mati secara bawaan — hanya terkirim kalau pemilik
      // menyalakannya di Pengaturan Notifikasi.
      await kirimNotifikasiPesanan(
        konteks.teamId,
        orderId,
        JenisNotifikasi.PESANAN_MASUK
      );

      revalidatePath('/dashboard/pesanan');
      revalidatePath('/dashboard/antrian');
      return { success: `Nota ${nomorNota} tersimpan.`, orderId };
    } catch (error: any) {
      const bentrokNomor =
        error?.code === '23505' &&
        String(error?.constraint_name ?? error?.constraint ?? '').includes(
          'nomor_nota'
        );
      if (bentrokNomor && percobaan < MAKS_PERCOBAAN) continue;

      console.error('Gagal menyimpan pesanan:', error);
      return { error: 'Gagal menyimpan pesanan. Coba lagi.' };
    }
  }

  return { error: 'Nomor nota bentrok terus. Coba lagi sebentar lagi.' };
}

const pelangganSchema = z.object({
  nama: z.string().min(2, 'Nama minimal 2 huruf').max(100),
  telepon: z
    .string()
    .min(8, 'Nomor HP minimal 8 digit')
    .max(30)
    .regex(/^[0-9+\-\s]+$/, 'Nomor HP hanya boleh angka'),
  alamat: z.string().max(300).optional(),
});

/** Dipakai dari POS: kasir menambah pelanggan baru tanpa pindah halaman. */
export async function buatPelanggan(
  input: z.infer<typeof pelangganSchema>
): Promise<HasilAksi & { customerId?: number }> {
  const konteks = await getKonteks();
  if (!konteks) return { error: 'Sesi tidak valid.' };
  if (!BOLEH_POS.includes(konteks.role)) {
    return { error: 'Anda tidak punya akses menambah pelanggan.' };
  }

  const parsed = pelangganSchema.safeParse(input);
  if (!parsed.success) return { error: parsed.error.errors[0].message };

  // Normalisasi supaya "0812 3456" dan "08123456" tidak jadi dua pelanggan.
  const telepon = parsed.data.telepon.replace(/[\s\-]/g, '');

  try {
    const [pelanggan] = await db
      .insert(customers)
      .values({
        teamId: konteks.teamId,
        nama: parsed.data.nama,
        telepon,
        alamat: parsed.data.alamat || null,
      })
      .returning();

    revalidatePath('/dashboard/pos');
    return { success: 'Pelanggan ditambahkan.', customerId: pelanggan.id };
  } catch (error: any) {
    if (error?.code === '23505') {
      return { error: 'Nomor HP ini sudah terdaftar sebagai pelanggan lain.' };
    }
    console.error('Gagal menambah pelanggan:', error);
    return { error: 'Gagal menambah pelanggan.' };
  }
}

const ubahStatusSchema = z.object({
  orderId: z.number().int().positive(),
  status: z.nativeEnum(OrderStatus),
  catatan: z.string().max(300).optional(),
});

export async function ubahStatusPesanan(
  input: z.infer<typeof ubahStatusSchema>
): Promise<HasilAksi> {
  const konteks = await getKonteks();
  if (!konteks) return { error: 'Sesi tidak valid.' };
  if (!BOLEH_UBAH_STATUS.includes(konteks.role)) {
    return { error: 'Anda tidak punya akses mengubah status.' };
  }

  const parsed = ubahStatusSchema.safeParse(input);
  if (!parsed.success) return { error: parsed.error.errors[0].message };
  const { orderId, status, catatan } = parsed.data;

  const [order] = await db
    .select()
    .from(orders)
    .where(and(eq(orders.id, orderId), eq(orders.teamId, konteks.teamId)))
    .limit(1);
  if (!order) return { error: 'Pesanan tidak ditemukan.' };

  // Cucian tidak boleh ditandai sudah diambil kalau tagihannya belum lunas.
  if (status === OrderStatus.SELESAI && order.statusBayar !== 'LUNAS') {
    return { error: 'Belum bisa diselesaikan — pembayaran belum lunas.' };
  }

  // Hanya transisi yang memicu notifikasi. Menekan tombol status yang sama
  // dua kali tidak boleh mengirim WhatsApp dua kali ke pelanggan.
  const baruSiapAmbil =
    status === OrderStatus.SIAP_AMBIL && order.status !== OrderStatus.SIAP_AMBIL;

  const sekarang = new Date();
  await db.transaction(async (tx) => {
    await tx
      .update(orders)
      .set({
        status,
        updatedAt: sekarang,
        ...(status === OrderStatus.SIAP_AMBIL && !order.tanggalSelesai
          ? { tanggalSelesai: sekarang }
          : {}),
        ...(status === OrderStatus.SELESAI ? { tanggalDiambil: sekarang } : {}),
      })
      .where(eq(orders.id, orderId));

    await tx.insert(orderStatusHistory).values({
      orderId,
      status,
      catatan: catatan || null,
      changedBy: konteks.user.id,
    });
  });

  // Sengaja di luar transaksi: panggilan jaringan ke provider WA tidak boleh
  // menahan kunci baris database, dan kegagalannya tidak boleh membatalkan
  // perubahan status yang sudah benar (PRD-FASE-2.md §4).
  let catatanNotifikasi: string | undefined;
  if (baruSiapAmbil) {
    const hasil = await kirimNotifikasiPesanan(
      konteks.teamId,
      orderId,
      JenisNotifikasi.SIAP_AMBIL
    );
    if (hasil.status === 'GAGAL') {
      catatanNotifikasi = ` Namun WhatsApp gagal dikirim: ${hasil.galat ?? 'penyebab tidak diketahui'}.`;
    } else if (hasil.status === 'SIMULASI') {
      catatanNotifikasi = hasil.dilewati
        ? ` Notifikasi WhatsApp dilewati (${hasil.dilewati}).`
        : ' WhatsApp dicatat dalam mode simulasi.';
    } else {
      catatanNotifikasi = ' WhatsApp terkirim ke pelanggan.';
    }
  }

  revalidatePath('/dashboard/pesanan');
  revalidatePath('/dashboard/antrian');
  revalidatePath(`/dashboard/pesanan/${orderId}`);
  return { success: `Status diperbarui.${catatanNotifikasi ?? ''}` };
}

const bayarSchema = z.object({
  orderId: z.number().int().positive(),
  jumlah: z.number().int().positive('Jumlah bayar harus lebih dari 0'),
  metode: z.nativeEnum(PaymentMethod),
  catatan: z.string().max(200).optional(),
});

/** Pelunasan atau tambahan DP setelah nota dibuat. */
export async function catatPembayaran(
  input: z.infer<typeof bayarSchema>
): Promise<HasilAksi> {
  const konteks = await getKonteks();
  if (!konteks) return { error: 'Sesi tidak valid.' };
  if (!BOLEH_POS.includes(konteks.role)) {
    return { error: 'Anda tidak punya akses mencatat pembayaran.' };
  }

  const parsed = bayarSchema.safeParse(input);
  if (!parsed.success) return { error: parsed.error.errors[0].message };
  const { orderId, jumlah, metode, catatan } = parsed.data;

  const [order] = await db
    .select()
    .from(orders)
    .where(and(eq(orders.id, orderId), eq(orders.teamId, konteks.teamId)))
    .limit(1);
  if (!order) return { error: 'Pesanan tidak ditemukan.' };

  await db.transaction(async (tx) => {
    await tx.insert(payments).values({
      orderId,
      jumlah,
      metode,
      catatan: catatan || null,
      receivedBy: konteks.user.id,
    });

    // Hitung ulang dari seluruh baris pembayaran, bukan menambah ke nilai lama —
    // supaya status tetap benar walau ada pembayaran yang dikoreksi manual.
    const [{ total: dibayar }] = await tx
      .select({ total: sql<number>`coalesce(sum(${payments.jumlah}), 0)` })
      .from(payments)
      .where(eq(payments.orderId, orderId));

    await tx
      .update(orders)
      .set({
        statusBayar: turunkanStatusBayar(order.total, Number(dibayar)),
        updatedAt: new Date(),
      })
      .where(eq(orders.id, orderId));
  });

  revalidatePath(`/dashboard/pesanan/${orderId}`);
  revalidatePath('/dashboard/pesanan');
  return { success: 'Pembayaran dicatat.' };
}
