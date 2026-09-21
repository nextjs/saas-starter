'use client';

import { useState, useTransition } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ChevronLeft, ChevronRight, Clock, Loader2 } from 'lucide-react';
import { SearchableSelect } from '@/components/ui/searchable-select';
import { Pesan, type IsiPesan } from '@/components/pesan';
import {
  ALUR_STATUS,
  LABEL_STATUS,
  OrderStatus,
  PaymentStatus,
  WARNA_STATUS_BAYAR,
  LABEL_STATUS_BAYAR,
} from '@/lib/laundry/enums';
import { jam, kuantitas, tanggalJam } from '@/lib/format';
import { ubahStatusPesanan } from '@/lib/laundry/actions';

type Baris = {
  id: number;
  nomorNota: string;
  status: string;
  statusBayar: string;
  tanggalMasuk: string;
  estimasiSelesai: string;
  total: number;
  customerNama: string;
  customerTelepon: string;
  outletNama: string;
  items: { namaLayanan: string; qty: string; satuan: string; isExpress: boolean }[];
};

/** Kolom papan: alur produksi tanpa SELESAI dan BATAL. */
const KOLOM = ALUR_STATUS.filter((s) => s !== OrderStatus.SELESAI);

export function AntrianClient({
  antrian,
  outlets,
  outletTerpilih,
  outletTerkunci,
}: {
  antrian: Baris[];
  outlets: { id: number; nama: string }[];
  outletTerpilih: string | null;
  outletTerkunci: boolean;
}) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [pesan, setPesan] = useState<IsiPesan | null>(null);
  const [sedangProses, setSedangProses] = useState<number | null>(null);

  function pindah(order: Baris, arah: 1 | -1) {
    const i = ALUR_STATUS.indexOf(order.status as OrderStatus);
    const target = ALUR_STATUS[i + arah];
    if (!target) return;

    setPesan(null);
    setSedangProses(order.id);
    startTransition(async () => {
      const hasil = await ubahStatusPesanan({ orderId: order.id, status: target });
      setSedangProses(null);
      if (hasil.error) setPesan({ tipe: 'error', teks: hasil.error });
      else {
        setPesan({ tipe: 'ok', teks: `${order.nomorNota}: ${hasil.success}` });
        router.refresh();
      }
    });
  }

  const sekarang = Date.now();

  return (
    <main className="mx-auto max-w-[1600px] px-4 py-6 sm:px-6 lg:px-8">
      <div className="mb-4 flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900 dark:text-gray-50">
            Papan Antrian
          </h1>
          <p className="mt-0.5 text-sm text-gray-600 dark:text-gray-400">
            {antrian.length} cucian sedang dikerjakan.
          </p>
        </div>

        {!outletTerkunci && outlets.length > 1 && (
          <div className="w-full sm:w-64">
            <SearchableSelect
              label="Outlet"
              value={outletTerpilih}
              onChange={(v) =>
                router.push(v ? `/dashboard/antrian?outlet=${v}` : '/dashboard/antrian')
              }
              placeholder="Semua outlet"
              options={outlets.map((o) => ({ value: String(o.id), label: o.nama }))}
            />
          </div>
        )}
      </div>

      <Pesan isi={pesan} />

      {antrian.length === 0 ? (
        <div className="rounded-lg border border-dashed border-gray-300 py-16 text-center dark:border-zinc-700">
          <p className="text-gray-700 dark:text-gray-300">Tidak ada cucian dalam antrian.</p>
          <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
            Semua pekerjaan sudah selesai, atau belum ada pesanan masuk.
          </p>
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-5">
          {KOLOM.map((kolom) => {
            const isi = antrian.filter((o) => o.status === kolom);
            return (
              <section
                key={kolom}
                className="rounded-lg border border-gray-200 bg-gray-50 p-3 dark:border-zinc-700 dark:bg-zinc-900/60"
              >
                <div className="mb-3 flex items-center justify-between">
                  <h2 className="text-sm font-semibold text-gray-900 dark:text-gray-50">
                    {LABEL_STATUS[kolom]}
                  </h2>
                  <span className="rounded-full bg-gray-200 px-2 py-0.5 text-xs font-medium text-gray-800 dark:bg-zinc-700 dark:text-gray-200">
                    {isi.length}
                  </span>
                </div>

                {isi.length === 0 ? (
                  <p className="py-6 text-center text-xs text-gray-600 dark:text-gray-400">
                    Kosong
                  </p>
                ) : (
                  <ul className="space-y-2">
                    {isi.map((o) => {
                      const terlambat =
                        new Date(o.estimasiSelesai).getTime() < sekarang &&
                        o.status !== OrderStatus.SIAP_AMBIL;
                      const sibuk = pending && sedangProses === o.id;
                      const indeks = ALUR_STATUS.indexOf(o.status as OrderStatus);

                      return (
                        <li
                          key={o.id}
                          className={`rounded-lg border bg-white p-3 dark:bg-zinc-900 ${
                            terlambat
                              ? 'border-red-400 dark:border-red-800'
                              : 'border-gray-200 dark:border-zinc-700'
                          }`}
                        >
                          <div className="flex items-start justify-between gap-2">
                            <Link
                              href={`/dashboard/pesanan/${o.id}`}
                              className="text-sm font-semibold text-orange-700 hover:underline dark:text-orange-400"
                            >
                              {o.nomorNota}
                            </Link>
                            <span
                              className={`shrink-0 rounded-full px-2 py-0.5 text-[11px] font-medium ${
                                WARNA_STATUS_BAYAR[o.statusBayar as PaymentStatus] ?? ''
                              }`}
                            >
                              {LABEL_STATUS_BAYAR[o.statusBayar as PaymentStatus] ??
                                o.statusBayar}
                            </span>
                          </div>

                          <p className="mt-1 truncate text-sm text-gray-900 dark:text-gray-50">
                            {o.customerNama}
                          </p>
                          {outlets.length > 1 && (
                            <p className="truncate text-xs text-gray-600 dark:text-gray-400">
                              {o.outletNama}
                            </p>
                          )}

                          <ul className="mt-2 space-y-0.5">
                            {o.items.map((it, i) => (
                              <li
                                key={i}
                                className="truncate text-xs text-gray-700 dark:text-gray-300"
                              >
                                {it.namaLayanan} {kuantitas(it.qty, it.satuan)}
                                {it.isExpress && (
                                  <span className="ml-1 font-medium text-amber-700 dark:text-amber-400">
                                    Express
                                  </span>
                                )}
                              </li>
                            ))}
                          </ul>

                          <p
                            className={`mt-2 flex items-center gap-1 text-xs ${
                              terlambat
                                ? 'font-medium text-red-700 dark:text-red-400'
                                : 'text-gray-600 dark:text-gray-400'
                            }`}
                          >
                            <Clock className="h-3 w-3 shrink-0" />
                            {terlambat ? 'Terlambat — ' : ''}
                            {tanggalJam(o.estimasiSelesai)}
                          </p>

                          <div className="mt-2 flex gap-1">
                            <button
                              type="button"
                              disabled={sibuk || indeks <= 0}
                              onClick={() => pindah(o, -1)}
                              aria-label={`Mundurkan ${o.nomorNota}`}
                              className="rounded border border-gray-300 p-1.5 text-gray-700 hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-40 dark:border-zinc-600 dark:text-gray-300 dark:hover:bg-zinc-800"
                            >
                              <ChevronLeft className="h-4 w-4" />
                            </button>
                            <button
                              type="button"
                              disabled={sibuk}
                              onClick={() => pindah(o, 1)}
                              className="flex flex-1 items-center justify-center gap-1 rounded bg-gray-900 px-2 py-1.5 text-xs font-medium text-white hover:bg-gray-800 disabled:opacity-60 dark:bg-gray-50 dark:text-gray-900 dark:hover:bg-gray-200"
                            >
                              {sibuk ? (
                                <Loader2 className="h-3.5 w-3.5 animate-spin" />
                              ) : (
                                <>
                                  {o.status === OrderStatus.SIAP_AMBIL
                                    ? 'Diambil'
                                    : 'Lanjut'}
                                  <ChevronRight className="h-3.5 w-3.5" />
                                </>
                              )}
                            </button>
                          </div>

                          <p className="mt-1.5 text-[11px] text-gray-500 dark:text-gray-500">
                            Masuk {jam(o.tanggalMasuk)}
                          </p>
                        </li>
                      );
                    })}
                  </ul>
                )}
              </section>
            );
          })}
        </div>
      )}
    </main>
  );
}
