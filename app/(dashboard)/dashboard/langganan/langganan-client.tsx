'use client';

import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { Check, ExternalLink, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Pesan, type IsiPesan } from '@/components/pesan';
import {
  LABEL_SIKLUS,
  LABEL_STATUS_INVOICE,
  LABEL_STATUS_LANGGANAN,
  SiklusTagihan,
  StatusInvoice,
  StatusLangganan,
  WARNA_STATUS_INVOICE,
  WARNA_STATUS_LANGGANAN,
} from '@/lib/laundry/enums';
import { rupiah, tanggal } from '@/lib/format';
import { batalkanInvoice, mulaiUpgrade } from '@/lib/billing/actions';

type Paket = {
  id: number;
  kode: string;
  nama: string;
  hargaBulanan: number;
  hargaTahunan: number;
  maxOutlet: number | null;
  maxPengguna: number | null;
  maxPesananPerBulan: number | null;
};

type InvoiceBaris = {
  id: number;
  nomorInvoice: string;
  jumlah: number;
  siklus: string;
  status: string;
  urlBayar: string | null;
  namaPaket: string;
  createdAt: string;
  dibayarPada: string | null;
};

function teksBatas(n: number | null): string {
  return n === null ? 'Tak terbatas' : String(n);
}

export function LanggananClient({
  bisaUbah,
  gateway,
  langganan,
  paketAktif,
  semuaPaket,
  pemakaian,
  invoices,
}: {
  bisaUbah: boolean;
  gateway: string;
  langganan: { status: string; siklus: string; berakhirPada: string | null };
  paketAktif: Paket;
  semuaPaket: Paket[];
  pemakaian: { outlet: number; pengguna: number; pesananBulanIni: number };
  invoices: InvoiceBaris[];
}) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [pesan, setPesan] = useState<IsiPesan | null>(null);
  const [siklus, setSiklus] = useState<SiklusTagihan>(SiklusTagihan.BULANAN);

  function upgrade(planId: number) {
    setPesan(null);
    startTransition(async () => {
      const hasil = await mulaiUpgrade({ planId, siklus });
      if (hasil.error) {
        setPesan({ tipe: 'error', teks: hasil.error });
        return;
      }
      // Gateway sungguhan memberi URL eksternal; mode simulasi memberi halaman
      // internal berisi tombol pelunasan.
      if (hasil.urlBayar) {
        router.push(hasil.urlBayar);
        return;
      }
      setPesan({ tipe: 'ok', teks: hasil.success! });
      router.refresh();
    });
  }

  function batal(nomor: string) {
    setPesan(null);
    startTransition(async () => {
      const hasil = await batalkanInvoice(nomor);
      setPesan(
        hasil.error
          ? { tipe: 'error', teks: hasil.error }
          : { tipe: 'ok', teks: hasil.success! }
      );
      router.refresh();
    });
  }

  const statusLangganan = langganan.status as StatusLangganan;

  return (
    <main className="mx-auto max-w-5xl px-4 py-6 sm:px-6 lg:px-8">
      <h1 className="mb-1 text-2xl font-semibold text-gray-900 dark:text-gray-50">
        Langganan
      </h1>
      <p className="mb-6 text-sm text-gray-600 dark:text-gray-400">
        Paket menentukan berapa outlet, pengguna, dan pesanan per bulan yang bisa Anda
        pakai.
      </p>

      {gateway === 'simulasi' && (
        <div className="mb-4 rounded-lg border border-amber-300 bg-amber-50 px-4 py-3 text-sm text-amber-900 dark:border-amber-800 dark:bg-amber-950 dark:text-amber-100">
          <strong>Mode simulasi pembayaran.</strong> Tagihan dibuat sungguhan di database,
          tapi pelunasannya lewat tombol simulasi — tidak ada uang berpindah. Isi{' '}
          <code>BILLING_PROVIDER</code> (<code>xendit</code> atau <code>midtrans</code>)
          beserta kunci rahasianya di <code>.env</code> untuk mengaktifkan pembayaran asli.
        </div>
      )}

      <Pesan isi={pesan} />

      <section className="mb-6 rounded-lg border border-gray-200 bg-white p-4 dark:border-zinc-700 dark:bg-zinc-900">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <p className="text-xs text-gray-600 dark:text-gray-400">Paket sekarang</p>
            <p className="text-2xl font-semibold text-gray-900 dark:text-gray-50">
              {paketAktif.nama}
            </p>
            <div className="mt-2 flex flex-wrap items-center gap-2">
              <span
                className={`rounded-full px-2.5 py-1 text-xs font-medium ${
                  WARNA_STATUS_LANGGANAN[statusLangganan] ?? ''
                }`}
              >
                {LABEL_STATUS_LANGGANAN[statusLangganan] ?? langganan.status}
              </span>
              {langganan.berakhirPada ? (
                <span className="text-sm text-gray-700 dark:text-gray-300">
                  Berlaku sampai {tanggal(langganan.berakhirPada)} ·{' '}
                  {LABEL_SIKLUS[langganan.siklus as SiklusTagihan] ?? langganan.siklus}
                </span>
              ) : (
                <span className="text-sm text-gray-700 dark:text-gray-300">
                  Tanpa masa berlaku
                </span>
              )}
            </div>
          </div>
        </div>

        <div className="mt-4 grid gap-3 sm:grid-cols-3">
          <Pemakaian
            label="Outlet aktif"
            dipakai={pemakaian.outlet}
            batas={paketAktif.maxOutlet}
          />
          <Pemakaian
            label="Pengguna"
            dipakai={pemakaian.pengguna}
            batas={paketAktif.maxPengguna}
          />
          <Pemakaian
            label="Pesanan bulan ini"
            dipakai={pemakaian.pesananBulanIni}
            batas={paketAktif.maxPesananPerBulan}
          />
        </div>
      </section>

      <section className="mb-6">
        <div className="mb-3 flex flex-wrap items-center justify-between gap-3">
          <h2 className="text-sm font-semibold text-gray-900 dark:text-gray-50">
            Pilih Paket
          </h2>
          <div
            role="group"
            aria-label="Siklus tagihan"
            className="inline-flex rounded-lg border border-gray-300 bg-white p-0.5 dark:border-zinc-700 dark:bg-zinc-800"
          >
            {Object.values(SiklusTagihan).map((s) => (
              <button
                key={s}
                type="button"
                onClick={() => setSiklus(s)}
                aria-pressed={siklus === s}
                className={
                  siklus === s
                    ? 'rounded-md bg-gray-200 px-3 py-1.5 text-sm font-medium text-gray-900 dark:bg-zinc-700 dark:text-gray-50'
                    : 'rounded-md px-3 py-1.5 text-sm font-medium text-gray-600 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-zinc-700'
                }
              >
                {LABEL_SIKLUS[s]}
                {s === SiklusTagihan.TAHUNAN && (
                  <span className="ml-1 text-xs text-green-700 dark:text-green-400">
                    hemat 2 bulan
                  </span>
                )}
              </button>
            ))}
          </div>
        </div>

        <div className="grid gap-4 md:grid-cols-3">
          {semuaPaket.map((p) => {
            const harga =
              siklus === SiklusTagihan.TAHUNAN ? p.hargaTahunan : p.hargaBulanan;
            const aktif = p.id === paketAktif.id;

            return (
              <div
                key={p.id}
                className={`rounded-lg border p-4 ${
                  aktif
                    ? 'border-orange-400 bg-orange-50 dark:border-orange-600 dark:bg-orange-950/30'
                    : 'border-gray-200 bg-white dark:border-zinc-700 dark:bg-zinc-900'
                }`}
              >
                <p className="text-lg font-semibold text-gray-900 dark:text-gray-50">
                  {p.nama}
                </p>
                <p className="mt-1 text-2xl font-bold text-gray-900 dark:text-gray-50">
                  {harga === 0 ? 'Gratis' : rupiah(harga)}
                  {harga > 0 && (
                    <span className="text-sm font-normal text-gray-600 dark:text-gray-400">
                      {siklus === SiklusTagihan.TAHUNAN ? ' / tahun' : ' / bulan'}
                    </span>
                  )}
                </p>

                <ul className="mt-3 space-y-1.5 text-sm">
                  <Fitur teks={`${teksBatas(p.maxOutlet)} outlet`} />
                  <Fitur teks={`${teksBatas(p.maxPengguna)} pengguna`} />
                  <Fitur
                    teks={`${teksBatas(p.maxPesananPerBulan)} pesanan / bulan`}
                  />
                </ul>

                <div className="mt-4">
                  {aktif ? (
                    <p className="text-center text-sm font-medium text-orange-800 dark:text-orange-300">
                      Paket aktif
                    </p>
                  ) : harga === 0 ? (
                    <p className="text-center text-sm text-gray-600 dark:text-gray-400">
                      Paket dasar
                    </p>
                  ) : (
                    <Button
                      type="button"
                      className="w-full"
                      disabled={!bisaUbah || pending}
                      onClick={() => upgrade(p.id)}
                      title={bisaUbah ? undefined : 'Hanya Owner yang boleh mengubah'}
                    >
                      {pending ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        'Pilih Paket Ini'
                      )}
                    </Button>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {!bisaUbah && (
          <p className="mt-3 text-sm text-gray-600 dark:text-gray-400">
            Anda hanya bisa melihat. Perubahan langganan hanya boleh dilakukan Owner.
          </p>
        )}
      </section>

      <section className="rounded-lg border border-gray-200 bg-white p-4 dark:border-zinc-700 dark:bg-zinc-900">
        <h2 className="mb-3 text-sm font-semibold text-gray-900 dark:text-gray-50">
          Riwayat Tagihan
        </h2>

        {invoices.length === 0 ? (
          <p className="py-8 text-center text-sm text-gray-600 dark:text-gray-400">
            Belum ada tagihan.
          </p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[720px] text-sm">
              <thead>
                <tr className="border-b border-gray-200 text-left text-gray-700 dark:border-zinc-700 dark:text-gray-300">
                  <th className="py-2 font-medium">Nomor</th>
                  <th className="py-2 font-medium">Tanggal</th>
                  <th className="py-2 font-medium">Paket</th>
                  <th className="py-2 text-right font-medium">Jumlah</th>
                  <th className="py-2 font-medium">Status</th>
                  <th className="py-2 text-right font-medium">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 dark:divide-zinc-700">
                {invoices.map((i) => (
                  <tr key={i.id}>
                    <td className="py-2 font-medium text-gray-900 dark:text-gray-50">
                      {i.nomorInvoice}
                    </td>
                    <td className="py-2 text-gray-700 dark:text-gray-300">
                      {tanggal(i.createdAt)}
                    </td>
                    <td className="py-2 text-gray-700 dark:text-gray-300">
                      {i.namaPaket}{' '}
                      <span className="text-xs text-gray-600 dark:text-gray-400">
                        ({LABEL_SIKLUS[i.siklus as SiklusTagihan] ?? i.siklus})
                      </span>
                    </td>
                    <td className="py-2 text-right text-gray-900 dark:text-gray-50">
                      {rupiah(i.jumlah)}
                    </td>
                    <td className="py-2">
                      <span
                        className={`inline-block rounded-full px-2 py-0.5 text-xs font-medium ${
                          WARNA_STATUS_INVOICE[i.status as StatusInvoice] ?? ''
                        }`}
                      >
                        {LABEL_STATUS_INVOICE[i.status as StatusInvoice] ?? i.status}
                      </span>
                    </td>
                    <td className="py-2">
                      {i.status === StatusInvoice.MENUNGGU && bisaUbah && (
                        <div className="flex justify-end gap-2">
                          {i.urlBayar && (
                            <a
                              href={i.urlBayar}
                              className="inline-flex items-center gap-1 text-xs font-medium text-orange-700 hover:underline dark:text-orange-400"
                            >
                              Bayar <ExternalLink className="h-3 w-3" />
                            </a>
                          )}
                          <button
                            type="button"
                            onClick={() => batal(i.nomorInvoice)}
                            disabled={pending}
                            className="text-xs font-medium text-red-700 hover:underline disabled:opacity-50 dark:text-red-400"
                          >
                            Batalkan
                          </button>
                        </div>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
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

function Pemakaian({
  label,
  dipakai,
  batas,
}: {
  label: string;
  dipakai: number;
  batas: number | null;
}) {
  const persen = batas === null ? 0 : Math.min(100, Math.round((dipakai / batas) * 100));
  const penuh = batas !== null && dipakai >= batas;

  return (
    <div className="rounded-lg border border-gray-200 p-3 dark:border-zinc-700">
      <p className="text-xs text-gray-600 dark:text-gray-400">{label}</p>
      <p
        className={`mt-0.5 text-lg font-semibold ${
          penuh ? 'text-red-700 dark:text-red-400' : 'text-gray-900 dark:text-gray-50'
        }`}
      >
        {dipakai}
        <span className="text-sm font-normal text-gray-600 dark:text-gray-400">
          {' / '}
          {teksBatas(batas)}
        </span>
      </p>
      {batas !== null && (
        <div
          className="mt-2 h-1.5 overflow-hidden rounded-full bg-gray-200 dark:bg-zinc-700"
          role="presentation"
        >
          <div
            className={`h-full ${penuh ? 'bg-red-600' : 'bg-orange-500'}`}
            style={{ width: `${persen}%` }}
          />
        </div>
      )}
    </div>
  );
}
