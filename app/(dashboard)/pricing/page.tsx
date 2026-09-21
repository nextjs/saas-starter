import Link from 'next/link';
import { Check } from 'lucide-react';
import { getSemuaPaket } from '@/lib/billing/langganan';
import { HARI_TRIAL, KODE_PAKET } from '@/lib/laundry/enums';
import { Button } from '@/components/ui/button';
import { rupiah } from '@/lib/format';

/**
 * Dirender per permintaan, bukan di-prerender saat build.
 *
 * Halaman ini membaca tabel `plans`, dan database TIDAK tersedia saat
 * `next build` berjalan di dalam image Docker. Dengan prerender, build-nya
 * gagal dengan ECONNREFUSED sebelum image jadi. Biayanya satu query ringan
 * ke tabel tiga baris per kunjungan — jauh lebih murah daripada build yang
 * tidak bisa jalan tanpa database.
 */
export const dynamic = 'force-dynamic';

function teksBatas(n: number | null): string {
  return n === null ? 'Tak terbatas' : String(n);
}

export default async function PricingPage() {
  const paket = await getSemuaPaket();

  return (
    <main className="mx-auto max-w-6xl px-4 py-14 sm:px-6 lg:px-8">
      <div className="mb-10 text-center">
        <h1 className="text-3xl font-semibold text-gray-900 dark:text-gray-50">
          Harga Langganan
        </h1>
        <p className="mt-2 text-gray-700 dark:text-gray-300">
          Coba paket Pro gratis {HARI_TRIAL} hari. Tanpa kartu kredit.
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        {paket.map((p) => {
          const unggulan = p.kode === KODE_PAKET.PRO;
          return (
            <div
              key={p.id}
              className={`rounded-xl border p-6 ${
                unggulan
                  ? 'border-orange-400 bg-orange-50 shadow-sm dark:border-orange-600 dark:bg-orange-950/30'
                  : 'border-gray-200 bg-white dark:border-zinc-700 dark:bg-zinc-900'
              }`}
            >
              {unggulan && (
                <p className="mb-2 inline-block rounded-full bg-orange-500 px-2.5 py-0.5 text-xs font-semibold text-white">
                  Paling banyak dipakai
                </p>
              )}

              <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-50">
                {p.nama}
              </h2>

              <p className="mt-2 text-3xl font-bold text-gray-900 dark:text-gray-50">
                {p.hargaBulanan === 0 ? 'Gratis' : rupiah(p.hargaBulanan)}
                {p.hargaBulanan > 0 && (
                  <span className="text-base font-normal text-gray-600 dark:text-gray-400">
                    {' '}
                    / bulan
                  </span>
                )}
              </p>
              {p.hargaTahunan > 0 && (
                <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
                  atau {rupiah(p.hargaTahunan)} / tahun — hemat 2 bulan
                </p>
              )}

              <ul className="mt-5 space-y-2.5 text-sm">
                <Fitur teks={`${teksBatas(p.maxOutlet)} outlet`} />
                <Fitur teks={`${teksBatas(p.maxPengguna)} pengguna`} />
                <Fitur teks={`${teksBatas(p.maxPesananPerBulan)} pesanan / bulan`} />
                <Fitur teks="POS kasir & nota thermal" />
                <Fitur teks="Papan antrian produksi" />
                <Fitur teks="Notifikasi WhatsApp" />
                <Fitur teks="Laporan omzet & piutang" />
              </ul>

              <Button asChild className="mt-6 w-full" variant={unggulan ? 'default' : 'outline'}>
                <Link href="/sign-up">
                  {p.hargaBulanan === 0 ? 'Mulai Gratis' : `Coba ${HARI_TRIAL} Hari Gratis`}
                </Link>
              </Button>
            </div>
          );
        })}
      </div>

      <p className="mt-8 text-center text-sm text-gray-600 dark:text-gray-400">
        Semua paket sudah termasuk seluruh fitur. Yang membedakan hanya kapasitasnya.
      </p>
    </main>
  );
}

function Fitur({ teks }: { teks: string }) {
  return (
    <li className="flex items-start gap-2 text-gray-700 dark:text-gray-300">
      <Check className="mt-0.5 h-4 w-4 shrink-0 text-green-700 dark:text-green-400" />
      {teks}
    </li>
  );
}
