import 'server-only';

import { and, desc, eq, gte, inArray, lte, ne, sql } from 'drizzle-orm';
import { db } from '@/lib/db/drizzle';
import {
  customers,
  notifications,
  orderItems,
  orders,
  outlets,
  payments,
  users,
} from '@/lib/db/schema';
import { OrderStatus } from './enums';

/** Status yang tampil di papan antrian — pekerjaan yang masih berjalan. */
export const STATUS_ANTRIAN = [
  OrderStatus.BARU,
  OrderStatus.PROSES_CUCI,
  OrderStatus.PROSES_KERING,
  OrderStatus.PROSES_SETRIKA,
  OrderStatus.SIAP_AMBIL,
];

export async function getAntrian(teamId: number, outletId?: number) {
  const kondisi = [
    eq(orders.teamId, teamId),
    inArray(orders.status, STATUS_ANTRIAN as unknown as string[]),
  ];
  if (outletId) kondisi.push(eq(orders.outletId, outletId));

  const daftar = await db
    .select({
      id: orders.id,
      nomorNota: orders.nomorNota,
      status: orders.status,
      statusBayar: orders.statusBayar,
      tanggalMasuk: orders.tanggalMasuk,
      estimasiSelesai: orders.estimasiSelesai,
      total: orders.total,
      customerNama: customers.nama,
      customerTelepon: customers.telepon,
      outletNama: outlets.nama,
    })
    .from(orders)
    .innerJoin(customers, eq(orders.customerId, customers.id))
    .innerJoin(outlets, eq(orders.outletId, outlets.id))
    .where(and(...kondisi))
    .orderBy(orders.estimasiSelesai);

  if (daftar.length === 0) return [];

  // Ringkasan item diambil terpisah, bukan lewat JOIN ke order_items — kalau
  // digabung, satu pesanan berisi 3 layanan akan muncul 3 kali di papan.
  const item = await db
    .select({
      orderId: orderItems.orderId,
      namaLayanan: orderItems.namaLayanan,
      qty: orderItems.qty,
      satuan: orderItems.satuan,
      isExpress: orderItems.isExpress,
    })
    .from(orderItems)
    .where(
      inArray(
        orderItems.orderId,
        daftar.map((o) => o.id)
      )
    )
    .orderBy(orderItems.id);

  const peta = new Map<number, typeof item>();
  for (const it of item) {
    const arr = peta.get(it.orderId) ?? [];
    arr.push(it);
    peta.set(it.orderId, arr);
  }

  return daftar.map((o) => ({ ...o, items: peta.get(o.id) ?? [] }));
}

export type BarisAntrian = Awaited<ReturnType<typeof getAntrian>>[number];

export async function getNotifikasi(teamId: number, limit = 50) {
  return db
    .select({
      id: notifications.id,
      jenis: notifications.jenis,
      tujuan: notifications.tujuan,
      pesan: notifications.pesan,
      status: notifications.status,
      provider: notifications.provider,
      galat: notifications.galat,
      createdAt: notifications.createdAt,
      orderId: notifications.orderId,
      nomorNota: orders.nomorNota,
    })
    .from(notifications)
    .leftJoin(orders, eq(notifications.orderId, orders.id))
    .where(eq(notifications.teamId, teamId))
    .orderBy(desc(notifications.createdAt))
    .limit(limit);
}

export type RentangLaporan = { dari: Date; sampai: Date; outletId?: number };

function kondisiLaporan(teamId: number, r: RentangLaporan) {
  const k = [
    eq(orders.teamId, teamId),
    gte(orders.tanggalMasuk, r.dari),
    lte(orders.tanggalMasuk, r.sampai),
    // Pesanan batal bukan omzet.
    ne(orders.status, OrderStatus.BATAL),
  ];
  if (r.outletId) k.push(eq(orders.outletId, r.outletId));
  return k;
}

/**
 * Ringkasan uang.
 *
 * Omzet dan pembayaran dihitung lewat DUA query terpisah, bukan satu JOIN.
 * Menggabung orders dengan payments melipatgandakan baris pesanan yang punya
 * lebih dari satu pembayaran (DP lalu pelunasan), dan omzetnya jadi menggelembung.
 */
export async function getRingkasanLaporan(teamId: number, r: RentangLaporan) {
  const [ringkas] = await db
    .select({
      jumlahNota: sql<number>`count(*)`,
      omzet: sql<number>`coalesce(sum(${orders.total}), 0)`,
    })
    .from(orders)
    .where(and(...kondisiLaporan(teamId, r)));

  const [bayar] = await db
    .select({ dibayar: sql<number>`coalesce(sum(${payments.jumlah}), 0)` })
    .from(payments)
    .where(
      inArray(
        payments.orderId,
        db
          .select({ id: orders.id })
          .from(orders)
          .where(and(...kondisiLaporan(teamId, r)))
      )
    );

  const jumlahNota = Number(ringkas?.jumlahNota ?? 0);
  const omzet = Number(ringkas?.omzet ?? 0);
  const dibayar = Number(bayar?.dibayar ?? 0);

  return {
    jumlahNota,
    omzet,
    dibayar,
    piutang: Math.max(0, omzet - dibayar),
    rataRata: jumlahNota > 0 ? Math.round(omzet / jumlahNota) : 0,
  };
}

export async function getLayananTerlaris(teamId: number, r: RentangLaporan) {
  return db
    .select({
      namaLayanan: orderItems.namaLayanan,
      satuan: orderItems.satuan,
      jumlahTransaksi: sql<number>`count(*)`,
      totalQty: sql<number>`coalesce(sum(${orderItems.qty}), 0)`,
      omzet: sql<number>`coalesce(sum(${orderItems.subtotal}), 0)`,
    })
    .from(orderItems)
    .innerJoin(orders, eq(orderItems.orderId, orders.id))
    .where(and(...kondisiLaporan(teamId, r)))
    .groupBy(orderItems.namaLayanan, orderItems.satuan)
    .orderBy(sql`coalesce(sum(${orderItems.subtotal}), 0) desc`)
    .limit(15);
}

export async function getOmzetPerOutlet(teamId: number, r: RentangLaporan) {
  return db
    .select({
      outletNama: outlets.nama,
      jumlahNota: sql<number>`count(*)`,
      omzet: sql<number>`coalesce(sum(${orders.total}), 0)`,
    })
    .from(orders)
    .innerJoin(outlets, eq(orders.outletId, outlets.id))
    .where(and(...kondisiLaporan(teamId, r)))
    .groupBy(outlets.id)
    .orderBy(sql`coalesce(sum(${orders.total}), 0) desc`);
}

export async function getPerformaKasir(teamId: number, r: RentangLaporan) {
  return db
    .select({
      nama: users.name,
      email: users.email,
      jumlahNota: sql<number>`count(*)`,
      omzet: sql<number>`coalesce(sum(${orders.total}), 0)`,
    })
    .from(orders)
    .innerJoin(users, eq(orders.createdBy, users.id))
    .where(and(...kondisiLaporan(teamId, r)))
    .groupBy(users.id)
    .orderBy(sql`coalesce(sum(${orders.total}), 0) desc`);
}

/** Sebaran status untuk periode tersebut — termasuk BATAL, sebagai informasi. */
export async function getSebaranStatus(teamId: number, r: RentangLaporan) {
  const k = [
    eq(orders.teamId, teamId),
    gte(orders.tanggalMasuk, r.dari),
    lte(orders.tanggalMasuk, r.sampai),
  ];
  if (r.outletId) k.push(eq(orders.outletId, r.outletId));

  return db
    .select({
      status: orders.status,
      jumlah: sql<number>`count(*)`,
    })
    .from(orders)
    .where(and(...k))
    .groupBy(orders.status);
}
