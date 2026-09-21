import 'server-only';

import { and, count, eq, gte, isNull, lt, ne, or } from 'drizzle-orm';
import { db } from '@/lib/db/drizzle';
import {
  customers,
  invitations,
  orders,
  outlets,
  plans,
  subscriptions,
  teamMembers,
} from '@/lib/db/schema';
import {
  HARI_TRIAL,
  KODE_PAKET,
  OrderStatus,
  SiklusTagihan,
  StatusLangganan,
} from '@/lib/laundry/enums';

export async function getPaketByKode(kode: string) {
  const [p] = await db.select().from(plans).where(eq(plans.kode, kode)).limit(1);
  return p ?? null;
}

export async function getSemuaPaket() {
  return db
    .select()
    .from(plans)
    .where(eq(plans.aktif, true))
    .orderBy(plans.urutan);
}

/**
 * Langganan tenant beserta paketnya.
 *
 * Kalau belum ada, dibuatkan uji coba Pro selama {@link HARI_TRIAL} hari. Dibuat
 * malas seperti ini supaya tenant yang terdaftar sebelum Fase 3 tidak perlu
 * migrasi data — barisnya lahir saat pertama dibutuhkan.
 *
 * Sekalian mengevaluasi kedaluwarsa: langganan yang lewat masa berlakunya
 * diturunkan ke Gratis di sini, bukan lewat cron. Untuk aplikasi sebesar ini,
 * mengevaluasi saat dibaca jauh lebih sederhana daripada menjalankan penjadwal,
 * dan tidak ada jendela waktu di mana batas lama masih berlaku.
 */
export async function getLangganan(teamId: number) {
  let [baris] = await db
    .select({ langganan: subscriptions, paket: plans })
    .from(subscriptions)
    .innerJoin(plans, eq(subscriptions.planId, plans.id))
    .where(eq(subscriptions.teamId, teamId))
    .limit(1);

  if (!baris) {
    const pro = await getPaketByKode(KODE_PAKET.PRO);
    const gratis = await getPaketByKode(KODE_PAKET.GRATIS);
    const paketAwal = pro ?? gratis;
    if (!paketAwal) {
      throw new Error('Tabel paket kosong — jalankan `pnpm db:seed:paket` dulu.');
    }

    const berakhir = new Date(Date.now() + HARI_TRIAL * 24 * 60 * 60 * 1000);
    await db
      .insert(subscriptions)
      .values({
        teamId,
        planId: paketAwal.id,
        status: pro ? StatusLangganan.TRIAL : StatusLangganan.AKTIF,
        siklus: SiklusTagihan.BULANAN,
        berakhirPada: pro ? berakhir : null,
      })
      .onConflictDoNothing();

    [baris] = await db
      .select({ langganan: subscriptions, paket: plans })
      .from(subscriptions)
      .innerJoin(plans, eq(subscriptions.planId, plans.id))
      .where(eq(subscriptions.teamId, teamId))
      .limit(1);
  }

  const { langganan, paket } = baris;

  const sudahLewat =
    langganan.berakhirPada !== null && langganan.berakhirPada.getTime() < Date.now();

  if (sudahLewat && langganan.status !== StatusLangganan.KEDALUWARSA) {
    const gratis = await getPaketByKode(KODE_PAKET.GRATIS);
    if (gratis) {
      // Turun ke Gratis, bukan dikunci: laundry yang lupa memperpanjang tetap
      // harus bisa melihat data pelanggannya (PRD-FASE-3.md §2).
      await db
        .update(subscriptions)
        .set({
          planId: gratis.id,
          status: StatusLangganan.KEDALUWARSA,
          berakhirPada: null,
          updatedAt: new Date(),
        })
        .where(eq(subscriptions.teamId, teamId));

      return {
        langganan: {
          ...langganan,
          planId: gratis.id,
          status: StatusLangganan.KEDALUWARSA as string,
          berakhirPada: null,
        },
        paket: gratis,
      };
    }
  }

  return { langganan, paket };
}

/** Awal bulan berjalan menurut WIB — batas pesanan dihitung per bulan kalender. */
function awalBulanWIB(): Date {
  const OFFSET = 7 * 60 * 60 * 1000;
  const wib = new Date(Date.now() + OFFSET);
  return new Date(Date.UTC(wib.getUTCFullYear(), wib.getUTCMonth(), 1) - OFFSET);
}

export async function getPemakaian(teamId: number) {
  const [[outletAktif], [anggota], [undangan], [pesananBulanIni], [pelanggan]] =
    await Promise.all([
      db
        .select({ n: count() })
        .from(outlets)
        .where(and(eq(outlets.teamId, teamId), eq(outlets.aktif, true))),
      db.select({ n: count() }).from(teamMembers).where(eq(teamMembers.teamId, teamId)),
      db
        .select({ n: count() })
        .from(invitations)
        .where(
          and(eq(invitations.teamId, teamId), eq(invitations.status, 'pending'))
        ),
      db
        .select({ n: count() })
        .from(orders)
        .where(
          and(
            eq(orders.teamId, teamId),
            gte(orders.tanggalMasuk, awalBulanWIB()),
            ne(orders.status, OrderStatus.BATAL)
          )
        ),
      db.select({ n: count() }).from(customers).where(eq(customers.teamId, teamId)),
    ]);

  return {
    outlet: Number(outletAktif?.n ?? 0),
    // Undangan tertunda ikut dihitung, kalau tidak batas bisa dilewati dengan
    // mengundang banyak orang sekaligus sebelum satu pun menerima.
    pengguna: Number(anggota?.n ?? 0) + Number(undangan?.n ?? 0),
    pesananBulanIni: Number(pesananBulanIni?.n ?? 0),
    pelanggan: Number(pelanggan?.n ?? 0),
  };
}

export type Pemakaian = Awaited<ReturnType<typeof getPemakaian>>;

/** `null` pada batas berarti tak terbatas — bukan nol. */
export function batasTercapai(dipakai: number, batas: number | null): boolean {
  return batas !== null && dipakai >= batas;
}

export function teksBatas(batas: number | null): string {
  return batas === null ? 'tak terbatas' : String(batas);
}
