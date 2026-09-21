import { and, desc, eq, ilike, or, sql } from 'drizzle-orm';
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
  teamMembers,
  users,
} from '@/lib/db/schema';
import { getUser } from '@/lib/db/queries';

/**
 * Konteks tenant untuk semua query laundry.
 *
 * Setiap query di bawah menyaring dengan `teamId` dari sini, bukan dari
 * parameter yang dikirim client — kalau tidak, siapa pun yang mengubah
 * angka di form bisa membaca data tenant lain.
 *
 * Role dibaca fresh dari database setiap request, tidak dari isi cookie.
 */
export async function getKonteks() {
  const user = await getUser();
  if (!user) return null;

  const [anggota] = await db
    .select({
      teamId: teamMembers.teamId,
      role: teamMembers.role,
      outletId: teamMembers.outletId,
    })
    .from(teamMembers)
    .where(eq(teamMembers.userId, user.id))
    .limit(1);

  if (!anggota) return null;
  return { user, ...anggota };
}

export async function getOutlets(teamId: number) {
  return db
    .select()
    .from(outlets)
    .where(and(eq(outlets.teamId, teamId), eq(outlets.aktif, true)))
    .orderBy(outlets.nama);
}

export async function getServices(teamId: number) {
  return db
    .select()
    .from(services)
    .where(and(eq(services.teamId, teamId), eq(services.aktif, true)))
    .orderBy(services.tipe, services.nama);
}

/**
 * Layanan beserta harga yang berlaku di satu outlet: harga override outlet
 * kalau ada, kalau tidak harga default layanan.
 */
export async function getServicesDenganHarga(teamId: number, outletId: number) {
  const rows = await db
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
        eq(servicePrices.outletId, outletId)
      )
    )
    .where(and(eq(services.teamId, teamId), eq(services.aktif, true)))
    .orderBy(services.tipe, services.nama);

  return rows.map(({ hargaOutlet, hargaDefault, ...s }) => ({
    ...s,
    hargaDasar: hargaOutlet ?? hargaDefault,
  }));
}

export async function getCustomers(teamId: number) {
  return db
    .select()
    .from(customers)
    .where(eq(customers.teamId, teamId))
    .orderBy(customers.nama);
}

export type FilterPesanan = {
  status?: string;
  cari?: string;
  outletId?: number;
};

export async function getOrders(teamId: number, filter: FilterPesanan = {}) {
  const kondisi = [eq(orders.teamId, teamId)];

  if (filter.status) kondisi.push(eq(orders.status, filter.status));
  if (filter.outletId) kondisi.push(eq(orders.outletId, filter.outletId));
  if (filter.cari) {
    const q = `%${filter.cari}%`;
    kondisi.push(
      or(
        ilike(orders.nomorNota, q),
        ilike(customers.nama, q),
        ilike(customers.telepon, q)
      )!
    );
  }

  return db
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
      dibayar: sql<number>`coalesce(sum(${payments.jumlah}), 0)`,
    })
    .from(orders)
    .innerJoin(customers, eq(orders.customerId, customers.id))
    .innerJoin(outlets, eq(orders.outletId, outlets.id))
    .leftJoin(payments, eq(payments.orderId, orders.id))
    .where(and(...kondisi))
    .groupBy(orders.id, customers.id, outlets.id)
    .orderBy(desc(orders.createdAt))
    .limit(100);
}

/** Detail satu pesanan. Mengembalikan `null` kalau bukan milik tenant ini. */
export async function getOrderDetail(teamId: number, orderId: number) {
  const [order] = await db
    .select()
    .from(orders)
    .where(and(eq(orders.id, orderId), eq(orders.teamId, teamId)))
    .limit(1);

  if (!order) return null;

  const [outlet] = await db
    .select()
    .from(outlets)
    .where(eq(outlets.id, order.outletId))
    .limit(1);

  const [customer] = await db
    .select()
    .from(customers)
    .where(eq(customers.id, order.customerId))
    .limit(1);

  const items = await db
    .select()
    .from(orderItems)
    .where(eq(orderItems.orderId, order.id))
    .orderBy(orderItems.id);

  const daftarBayar = await db
    .select({
      id: payments.id,
      jumlah: payments.jumlah,
      metode: payments.metode,
      catatan: payments.catatan,
      createdAt: payments.createdAt,
      olehNama: users.name,
      olehEmail: users.email,
    })
    .from(payments)
    .leftJoin(users, eq(payments.receivedBy, users.id))
    .where(eq(payments.orderId, order.id))
    .orderBy(payments.createdAt);

  const riwayat = await db
    .select({
      id: orderStatusHistory.id,
      status: orderStatusHistory.status,
      catatan: orderStatusHistory.catatan,
      createdAt: orderStatusHistory.createdAt,
      olehNama: users.name,
      olehEmail: users.email,
    })
    .from(orderStatusHistory)
    .leftJoin(users, eq(orderStatusHistory.changedBy, users.id))
    .where(eq(orderStatusHistory.orderId, order.id))
    .orderBy(orderStatusHistory.createdAt);

  const dibayar = daftarBayar.reduce((a, p) => a + p.jumlah, 0);

  return { order, outlet, customer, items, payments: daftarBayar, riwayat, dibayar };
}

// --- Query untuk halaman kelola data master --------------------------------
//
// Statistik di bawah memakai LEFT JOIN + GROUP BY, bukan subquery berkorelasi.
// Alasannya: di dalam sql`` drizzle merender kolom tanpa prefix tabel, sehingga
// `where ${orders.customerId} = ${customers.id}` menjadi
// `where "customer_id" = "id"` — dan di dalam subquery `from orders`, "id"
// resolve ke orders.id, bukan customers.id. Hasilnya diam-diam salah.
//
// Berbeda dari getOutlets/getServices di atas yang hanya mengambil baris aktif
// (dipakai POS), query di bawah mengambil semuanya termasuk yang nonaktif,
// karena halaman kelola harus bisa mengaktifkan kembali.

export async function getSemuaOutlets(teamId: number) {
  return db
    .select({
      id: outlets.id,
      nama: outlets.nama,
      kodeNota: outlets.kodeNota,
      alamat: outlets.alamat,
      telepon: outlets.telepon,
      aktif: outlets.aktif,
      jumlahPesanan: sql<number>`count(${orders.id})`,
    })
    .from(outlets)
    .leftJoin(orders, eq(orders.outletId, outlets.id))
    .where(eq(outlets.teamId, teamId))
    .groupBy(outlets.id)
    .orderBy(outlets.nama);
}

export async function getSemuaServices(teamId: number) {
  return db
    .select()
    .from(services)
    .where(eq(services.teamId, teamId))
    .orderBy(services.tipe, services.nama);
}

/** Pelanggan beserta jumlah pesanannya — dipakai untuk memutuskan boleh hapus. */
export async function getPelangganDenganStatistik(teamId: number) {
  return db
    .select({
      id: customers.id,
      nama: customers.nama,
      telepon: customers.telepon,
      alamat: customers.alamat,
      catatan: customers.catatan,
      // count(orders.id) — bukan count(*) — supaya pelanggan tanpa pesanan
      // menghasilkan 0, bukan 1 dari baris LEFT JOIN yang kosong.
      jumlahPesanan: sql<number>`count(${orders.id})`,
      totalBelanja: sql<number>`coalesce(sum(${orders.total}), 0)`,
    })
    .from(customers)
    .leftJoin(orders, eq(orders.customerId, customers.id))
    .where(eq(customers.teamId, teamId))
    .groupBy(customers.id)
    .orderBy(customers.nama);
}
