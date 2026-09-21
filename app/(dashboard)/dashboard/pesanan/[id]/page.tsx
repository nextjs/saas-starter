import Link from 'next/link';
import { notFound, redirect } from 'next/navigation';
import { Printer } from 'lucide-react';
import { getKonteks, getOrderDetail } from '@/lib/laundry/queries';
import {
  LABEL_METODE_BAYAR,
  LABEL_STATUS,
  LABEL_STATUS_BAYAR,
  OrderStatus,
  PaymentMethod,
  PaymentStatus,
  WARNA_STATUS,
  WARNA_STATUS_BAYAR,
} from '@/lib/laundry/enums';
import { kuantitas, rupiah, tanggalJam } from '@/lib/format';
import { Button } from '@/components/ui/button';
import { AksiPesanan } from './aksi-pesanan';

export default async function DetailPesananPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const konteks = await getKonteks();
  if (!konteks) redirect('/sign-in');

  const { id } = await params;
  const orderId = Number(id);
  if (!Number.isInteger(orderId)) notFound();

  const detail = await getOrderDetail(konteks.teamId, orderId);
  if (!detail) notFound();

  const { order, outlet, customer, items, payments, riwayat, dibayar } = detail;
  const sisa = Math.max(0, order.total - dibayar);

  return (
    <main className="mx-auto max-w-5xl px-4 py-6 sm:px-6 lg:px-8">
      <div className="mb-6 flex flex-wrap items-start justify-between gap-3">
        <div>
          <Link
            href="/dashboard/pesanan"
            className="text-sm text-gray-600 hover:underline dark:text-gray-400"
          >
            ← Kembali ke daftar
          </Link>
          <h1 className="mt-1 text-2xl font-semibold text-gray-900 dark:text-gray-50">
            {order.nomorNota}
          </h1>
          <p className="text-sm text-gray-600 dark:text-gray-400">{outlet.nama}</p>
        </div>
        <Button asChild variant="outline">
          <Link href={`/dashboard/pesanan/${order.id}/nota`}>
            <Printer className="mr-1.5 h-4 w-4" />
            Cetak Nota
          </Link>
        </Button>
      </div>

      <div className="mb-6 flex flex-wrap gap-2">
        <span
          className={`rounded-full px-3 py-1 text-sm font-medium ${
            WARNA_STATUS[order.status as OrderStatus] ?? ''
          }`}
        >
          {LABEL_STATUS[order.status as OrderStatus] ?? order.status}
        </span>
        <span
          className={`rounded-full px-3 py-1 text-sm font-medium ${
            WARNA_STATUS_BAYAR[order.statusBayar as PaymentStatus] ?? ''
          }`}
        >
          {LABEL_STATUS_BAYAR[order.statusBayar as PaymentStatus] ?? order.statusBayar}
        </span>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="space-y-6 lg:col-span-2">
          <Kartu judul="Pelanggan">
            <dl className="grid gap-2 text-sm sm:grid-cols-2">
              <Baris label="Nama" nilai={customer.nama} />
              <Baris label="No. HP / WA" nilai={customer.telepon} />
              <Baris label="Alamat" nilai={customer.alamat || '—'} />
            </dl>
          </Kartu>

          <Kartu judul="Rincian Cucian">
            <div className="overflow-x-auto">
              <table className="w-full min-w-[480px] text-sm">
                <thead>
                  <tr className="border-b border-gray-200 text-left text-gray-700 dark:border-zinc-700 dark:text-gray-300">
                    <th className="py-2 font-medium">Layanan</th>
                    <th className="py-2 font-medium">Qty</th>
                    <th className="py-2 font-medium">Harga</th>
                    <th className="py-2 text-right font-medium">Subtotal</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 dark:divide-zinc-700">
                  {items.map((it) => (
                    <tr key={it.id}>
                      <td className="py-2 text-gray-900 dark:text-gray-50">
                        {it.namaLayanan}
                        {it.isExpress && (
                          <span className="ml-1.5 rounded bg-amber-100 px-1.5 py-0.5 text-xs font-medium text-amber-900 dark:bg-amber-950 dark:text-amber-100">
                            Express
                          </span>
                        )}
                      </td>
                      <td className="py-2 text-gray-700 dark:text-gray-300">
                        {kuantitas(it.qty, it.satuan)}
                      </td>
                      <td className="py-2 text-gray-700 dark:text-gray-300">
                        {rupiah(it.hargaSatuan)}
                      </td>
                      <td className="py-2 text-right font-medium text-gray-900 dark:text-gray-50">
                        {rupiah(it.subtotal)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <dl className="mt-4 space-y-1.5 border-t border-gray-200 pt-3 text-sm dark:border-zinc-700">
              <div className="flex justify-between">
                <dt className="text-gray-700 dark:text-gray-300">Subtotal</dt>
                <dd className="text-gray-900 dark:text-gray-50">{rupiah(order.subtotal)}</dd>
              </div>
              {order.diskon > 0 && (
                <div className="flex justify-between">
                  <dt className="text-gray-700 dark:text-gray-300">Diskon</dt>
                  <dd className="text-gray-900 dark:text-gray-50">
                    − {rupiah(order.diskon)}
                  </dd>
                </div>
              )}
              <div className="flex justify-between text-base font-semibold">
                <dt className="text-gray-900 dark:text-gray-50">Total</dt>
                <dd className="text-gray-900 dark:text-gray-50">{rupiah(order.total)}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-gray-700 dark:text-gray-300">Dibayar</dt>
                <dd className="text-gray-900 dark:text-gray-50">{rupiah(dibayar)}</dd>
              </div>
              <div className="flex justify-between font-semibold">
                <dt className="text-gray-700 dark:text-gray-300">Sisa</dt>
                <dd
                  className={
                    sisa > 0
                      ? 'text-red-700 dark:text-red-400'
                      : 'text-green-700 dark:text-green-400'
                  }
                >
                  {rupiah(sisa)}
                </dd>
              </div>
            </dl>

            {order.catatan && (
              <p className="mt-3 rounded bg-gray-50 p-2.5 text-sm text-gray-700 dark:bg-zinc-800 dark:text-gray-300">
                <strong>Catatan:</strong> {order.catatan}
              </p>
            )}
          </Kartu>

          <Kartu judul="Riwayat Status">
            <ol className="space-y-3">
              {riwayat.map((r) => (
                <li key={r.id} className="flex gap-3 text-sm">
                  <span className="mt-1.5 h-2 w-2 shrink-0 rounded-full bg-orange-500" />
                  <div>
                    <p className="font-medium text-gray-900 dark:text-gray-50">
                      {LABEL_STATUS[r.status as OrderStatus] ?? r.status}
                    </p>
                    <p className="text-xs text-gray-600 dark:text-gray-400">
                      {tanggalJam(r.createdAt)}
                      {(r.olehNama || r.olehEmail) &&
                        ` · ${r.olehNama || r.olehEmail}`}
                    </p>
                    {r.catatan && (
                      <p className="text-xs text-gray-700 dark:text-gray-300">
                        {r.catatan}
                      </p>
                    )}
                  </div>
                </li>
              ))}
            </ol>
          </Kartu>

          <Kartu judul="Pembayaran">
            {payments.length === 0 ? (
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Belum ada pembayaran tercatat.
              </p>
            ) : (
              <ul className="divide-y divide-gray-200 text-sm dark:divide-zinc-700">
                {payments.map((p) => (
                  <li key={p.id} className="flex justify-between py-2">
                    <div>
                      <p className="text-gray-900 dark:text-gray-50">
                        {LABEL_METODE_BAYAR[p.metode as PaymentMethod] ?? p.metode}
                      </p>
                      <p className="text-xs text-gray-600 dark:text-gray-400">
                        {tanggalJam(p.createdAt)}
                        {(p.olehNama || p.olehEmail) && ` · ${p.olehNama || p.olehEmail}`}
                      </p>
                    </div>
                    <span className="font-medium text-gray-900 dark:text-gray-50">
                      {rupiah(p.jumlah)}
                    </span>
                  </li>
                ))}
              </ul>
            )}
          </Kartu>
        </div>

        <aside className="lg:sticky lg:top-6 lg:h-fit">
          <AksiPesanan
            orderId={order.id}
            status={order.status}
            sisa={sisa}
            role={konteks.role}
          />
          <div className="mt-4 rounded-lg border border-gray-200 bg-white p-4 text-sm dark:border-zinc-700 dark:bg-zinc-900">
            <dl className="space-y-2">
              <Baris label="Masuk" nilai={tanggalJam(order.tanggalMasuk)} />
              <Baris label="Estimasi selesai" nilai={tanggalJam(order.estimasiSelesai)} />
              {order.tanggalSelesai && (
                <Baris label="Selesai" nilai={tanggalJam(order.tanggalSelesai)} />
              )}
              {order.tanggalDiambil && (
                <Baris label="Diambil" nilai={tanggalJam(order.tanggalDiambil)} />
              )}
            </dl>
          </div>
        </aside>
      </div>
    </main>
  );
}

function Kartu({ judul, children }: { judul: string; children: React.ReactNode }) {
  return (
    <section className="rounded-lg border border-gray-200 bg-white p-4 dark:border-zinc-700 dark:bg-zinc-900">
      <h2 className="mb-3 text-sm font-semibold text-gray-900 dark:text-gray-50">
        {judul}
      </h2>
      {children}
    </section>
  );
}

function Baris({ label, nilai }: { label: string; nilai: string }) {
  return (
    <div>
      <dt className="text-xs text-gray-600 dark:text-gray-400">{label}</dt>
      <dd className="text-gray-900 dark:text-gray-50">{nilai}</dd>
    </div>
  );
}
