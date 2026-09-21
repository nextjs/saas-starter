import Link from 'next/link';
import { redirect } from 'next/navigation';
import { Plus } from 'lucide-react';
import { getKonteks, getOrders } from '@/lib/laundry/queries';
import {
  LABEL_STATUS,
  LABEL_STATUS_BAYAR,
  OrderStatus,
  PaymentStatus,
  WARNA_STATUS,
  WARNA_STATUS_BAYAR,
} from '@/lib/laundry/enums';
import { rupiah, tanggalJam } from '@/lib/format';
import { Button } from '@/components/ui/button';
import { FilterPesanan } from './filter-pesanan';

export default async function PesananPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string; cari?: string }>;
}) {
  const konteks = await getKonteks();
  if (!konteks) redirect('/sign-in');

  const { status, cari } = await searchParams;

  const daftar = await getOrders(konteks.teamId, {
    status: status || undefined,
    cari: cari || undefined,
    outletId: konteks.outletId ?? undefined,
  });

  return (
    <main className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-2xl font-semibold text-gray-900 dark:text-gray-50">
          Pesanan
        </h1>
        <Button asChild>
          <Link href="/dashboard/pos">
            <Plus className="mr-1.5 h-4 w-4" />
            Pesanan Baru
          </Link>
        </Button>
      </div>

      <FilterPesanan statusAktif={status ?? ''} cariAwal={cari ?? ''} />

      {daftar.length === 0 ? (
        <div className="rounded-lg border border-dashed border-gray-300 py-16 text-center dark:border-zinc-700">
          <p className="text-gray-700 dark:text-gray-300">Belum ada pesanan.</p>
          <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
            {cari || status
              ? 'Coba ubah filter atau kata kunci pencarian.'
              : 'Buat pesanan pertama lewat POS Kasir.'}
          </p>
        </div>
      ) : (
        <div className="overflow-x-auto rounded-lg border border-gray-200 dark:border-zinc-700">
          <table className="w-full min-w-[820px] text-sm">
            <thead className="bg-gray-50 dark:bg-zinc-800">
              <tr className="text-left text-gray-700 dark:text-gray-300">
                <th className="px-4 py-3 font-medium">Nota</th>
                <th className="px-4 py-3 font-medium">Pelanggan</th>
                <th className="px-4 py-3 font-medium">Masuk</th>
                <th className="px-4 py-3 font-medium">Estimasi</th>
                <th className="px-4 py-3 font-medium">Status</th>
                <th className="px-4 py-3 font-medium">Bayar</th>
                <th className="px-4 py-3 text-right font-medium">Total</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 dark:divide-zinc-700">
              {daftar.map((o) => (
                <tr
                  key={o.id}
                  className="bg-white hover:bg-gray-50 dark:bg-zinc-900 dark:hover:bg-zinc-800"
                >
                  <td className="px-4 py-3">
                    <Link
                      href={`/dashboard/pesanan/${o.id}`}
                      className="font-medium text-orange-700 hover:underline dark:text-orange-400"
                    >
                      {o.nomorNota}
                    </Link>
                    <span className="block text-xs text-gray-600 dark:text-gray-400">
                      {o.outletNama}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <span className="text-gray-900 dark:text-gray-50">
                      {o.customerNama}
                    </span>
                    <span className="block text-xs text-gray-600 dark:text-gray-400">
                      {o.customerTelepon}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-gray-700 dark:text-gray-300">
                    {tanggalJam(o.tanggalMasuk)}
                  </td>
                  <td className="px-4 py-3 text-gray-700 dark:text-gray-300">
                    {tanggalJam(o.estimasiSelesai)}
                  </td>
                  <td className="px-4 py-3">
                    <span
                      className={`inline-block rounded-full px-2.5 py-1 text-xs font-medium ${
                        WARNA_STATUS[o.status as OrderStatus] ?? ''
                      }`}
                    >
                      {LABEL_STATUS[o.status as OrderStatus] ?? o.status}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <span
                      className={`inline-block rounded-full px-2.5 py-1 text-xs font-medium ${
                        WARNA_STATUS_BAYAR[o.statusBayar as PaymentStatus] ?? ''
                      }`}
                    >
                      {LABEL_STATUS_BAYAR[o.statusBayar as PaymentStatus] ??
                        o.statusBayar}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-right font-medium text-gray-900 dark:text-gray-50">
                    {rupiah(o.total)}
                    {Number(o.dibayar) < o.total && (
                      <span className="block text-xs font-normal text-red-700 dark:text-red-400">
                        sisa {rupiah(o.total - Number(o.dibayar))}
                      </span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </main>
  );
}
