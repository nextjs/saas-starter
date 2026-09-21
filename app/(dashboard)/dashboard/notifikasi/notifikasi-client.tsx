'use client';

import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Loader2, Send } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Pesan, type IsiPesan } from '@/components/pesan';
import {
  JenisNotifikasi,
  LABEL_JENIS_NOTIFIKASI,
  LABEL_STATUS_NOTIFIKASI,
  StatusNotifikasi,
  VARIABEL_TEMPLATE,
  WARNA_STATUS_NOTIFIKASI,
} from '@/lib/laundry/enums';
import { tanggalJam } from '@/lib/format';
import { simpanPengaturanNotifikasi, tesKirimNotifikasi } from '@/lib/wa/actions';

type LogBaris = {
  id: number;
  jenis: string;
  tujuan: string;
  pesan: string;
  status: string;
  provider: string;
  galat: string | null;
  createdAt: string;
  orderId: number | null;
  nomorNota: string | null;
};

type Pengaturan = {
  aktifSiapAmbil: boolean;
  aktifPesananMasuk: boolean;
  templateSiapAmbil: string;
  templatePesananMasuk: string;
};

export function NotifikasiClient({
  provider,
  pengaturan: awal,
  log,
}: {
  provider: string;
  pengaturan: Pengaturan;
  log: LogBaris[];
}) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [pesan, setPesan] = useState<IsiPesan | null>(null);
  const [form, setForm] = useState<Pengaturan>(awal);
  const [nomorTes, setNomorTes] = useState('');
  const [lihatPesan, setLihatPesan] = useState<number | null>(null);

  function simpan() {
    setPesan(null);
    startTransition(async () => {
      const hasil = await simpanPengaturanNotifikasi(form);
      if (hasil.error) setPesan({ tipe: 'error', teks: hasil.error });
      else {
        setPesan({ tipe: 'ok', teks: hasil.success! });
        router.refresh();
      }
    });
  }

  function tes(template: string) {
    setPesan(null);
    if (!nomorTes.trim()) {
      setPesan({ tipe: 'error', teks: 'Isi nomor tujuan tes dulu.' });
      return;
    }
    startTransition(async () => {
      const hasil = await tesKirimNotifikasi({ nomor: nomorTes, template });
      setPesan(
        hasil.error
          ? { tipe: 'error', teks: hasil.error }
          : { tipe: 'ok', teks: hasil.success! }
      );
      router.refresh();
    });
  }

  return (
    <main className="mx-auto max-w-5xl px-4 py-6 sm:px-6 lg:px-8">
      <h1 className="mb-1 text-2xl font-semibold text-gray-900 dark:text-gray-50">
        Notifikasi WhatsApp
      </h1>
      <p className="mb-6 text-sm text-gray-600 dark:text-gray-400">
        Pesan otomatis ke pelanggan saat cucian siap diambil.
      </p>

      {provider === 'simulasi' && (
        <div className="mb-4 rounded-lg border border-amber-300 bg-amber-50 px-4 py-3 text-sm text-amber-900 dark:border-amber-800 dark:bg-amber-950 dark:text-amber-100">
          <strong>Mode simulasi.</strong> Pesan dirender dan dicatat di log, tapi belum
          benar-benar dikirim. Untuk mengaktifkan, isi <code>WA_PROVIDER</code> (
          <code>fonnte</code> atau <code>wablas</code>) dan <code>WA_TOKEN</code> di
          berkas <code>.env</code>, lalu jalankan ulang server.
        </div>
      )}

      <Pesan isi={pesan} />

      <section className="mb-6 rounded-lg border border-gray-200 bg-white p-4 dark:border-zinc-700 dark:bg-zinc-900">
        <h2 className="mb-3 text-sm font-semibold text-gray-900 dark:text-gray-50">
          Kapan pesan dikirim
        </h2>

        <div className="space-y-2">
          <Sakelar
            label="Saat cucian siap diambil"
            keterangan="Paling penting — ini yang membuat pelanggan datang mengambil."
            nilai={form.aktifSiapAmbil}
            onUbah={(v) => setForm((f) => ({ ...f, aktifSiapAmbil: v }))}
          />
          <Sakelar
            label="Saat pesanan masuk (struk digital)"
            keterangan="Dikirim tepat setelah kasir menyimpan nota."
            nilai={form.aktifPesananMasuk}
            onUbah={(v) => setForm((f) => ({ ...f, aktifPesananMasuk: v }))}
          />
        </div>
      </section>

      <section className="mb-6 rounded-lg border border-gray-200 bg-white p-4 dark:border-zinc-700 dark:bg-zinc-900">
        <h2 className="mb-1 text-sm font-semibold text-gray-900 dark:text-gray-50">
          Isi pesan
        </h2>
        <p className="mb-3 text-xs text-gray-600 dark:text-gray-400">
          Variabel yang tersedia:{' '}
          {VARIABEL_TEMPLATE.map((v) => (
            <code
              key={v}
              className="mr-1 rounded bg-gray-100 px-1 py-0.5 text-gray-900 dark:bg-zinc-800 dark:text-gray-50"
            >
              {`{${v}}`}
            </code>
          ))}
        </p>

        <div className="mb-4">
          <Label htmlFor="t-siap">Template: cucian siap diambil</Label>
          <textarea
            id="t-siap"
            rows={7}
            value={form.templateSiapAmbil}
            onChange={(e) =>
              setForm((f) => ({ ...f, templateSiapAmbil: e.target.value }))
            }
            className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-orange-500 dark:border-zinc-600 dark:bg-zinc-800 dark:text-gray-50"
          />
          <button
            type="button"
            onClick={() => tes(form.templateSiapAmbil)}
            disabled={pending}
            className="mt-1.5 inline-flex items-center gap-1 text-sm font-medium text-orange-700 hover:underline disabled:opacity-50 dark:text-orange-400"
          >
            <Send className="h-3.5 w-3.5" />
            Tes kirim template ini
          </button>
        </div>

        <div className="mb-4">
          <Label htmlFor="t-masuk">Template: struk pesanan masuk</Label>
          <textarea
            id="t-masuk"
            rows={7}
            value={form.templatePesananMasuk}
            onChange={(e) =>
              setForm((f) => ({ ...f, templatePesananMasuk: e.target.value }))
            }
            className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-orange-500 dark:border-zinc-600 dark:bg-zinc-800 dark:text-gray-50"
          />
          <button
            type="button"
            onClick={() => tes(form.templatePesananMasuk)}
            disabled={pending}
            className="mt-1.5 inline-flex items-center gap-1 text-sm font-medium text-orange-700 hover:underline disabled:opacity-50 dark:text-orange-400"
          >
            <Send className="h-3.5 w-3.5" />
            Tes kirim template ini
          </button>
        </div>

        <div className="max-w-xs">
          <Label htmlFor="nomor-tes">Nomor tujuan tes</Label>
          <Input
            id="nomor-tes"
            inputMode="tel"
            value={nomorTes}
            onChange={(e) => setNomorTes(e.target.value)}
            placeholder="08xxxxxxxxxx"
          />
          <p className="mt-1 text-xs text-gray-600 dark:text-gray-400">
            Tes memakai data contoh, bukan pesanan sungguhan.
          </p>
        </div>

        <Button type="button" onClick={simpan} disabled={pending} className="mt-4">
          {pending ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Simpan Pengaturan'}
        </Button>
      </section>

      <section className="rounded-lg border border-gray-200 bg-white p-4 dark:border-zinc-700 dark:bg-zinc-900">
        <h2 className="mb-3 text-sm font-semibold text-gray-900 dark:text-gray-50">
          Riwayat Pengiriman
        </h2>

        {log.length === 0 ? (
          <p className="py-8 text-center text-sm text-gray-600 dark:text-gray-400">
            Belum ada pesan terkirim.
          </p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[760px] text-sm">
              <thead>
                <tr className="border-b border-gray-200 text-left text-gray-700 dark:border-zinc-700 dark:text-gray-300">
                  <th className="py-2 font-medium">Waktu</th>
                  <th className="py-2 font-medium">Jenis</th>
                  <th className="py-2 font-medium">Tujuan</th>
                  <th className="py-2 font-medium">Nota</th>
                  <th className="py-2 font-medium">Status</th>
                  <th className="py-2 font-medium">Isi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 dark:divide-zinc-700">
                {log.map((l) => (
                  <tr key={l.id}>
                    <td className="py-2 text-gray-700 dark:text-gray-300">
                      {tanggalJam(l.createdAt)}
                    </td>
                    <td className="py-2 text-gray-700 dark:text-gray-300">
                      {LABEL_JENIS_NOTIFIKASI[l.jenis as JenisNotifikasi] ?? l.jenis}
                    </td>
                    <td className="py-2 text-gray-700 dark:text-gray-300">{l.tujuan}</td>
                    <td className="py-2">
                      {l.orderId && l.nomorNota ? (
                        <Link
                          href={`/dashboard/pesanan/${l.orderId}`}
                          className="text-orange-700 hover:underline dark:text-orange-400"
                        >
                          {l.nomorNota}
                        </Link>
                      ) : (
                        <span className="text-gray-600 dark:text-gray-400">—</span>
                      )}
                    </td>
                    <td className="py-2">
                      <span
                        className={`inline-block rounded-full px-2 py-0.5 text-xs font-medium ${
                          WARNA_STATUS_NOTIFIKASI[l.status as StatusNotifikasi] ?? ''
                        }`}
                      >
                        {LABEL_STATUS_NOTIFIKASI[l.status as StatusNotifikasi] ?? l.status}
                      </span>
                      {l.galat && (
                        <span className="block text-xs text-red-700 dark:text-red-400">
                          {l.galat}
                        </span>
                      )}
                    </td>
                    <td className="py-2">
                      <button
                        type="button"
                        onClick={() => setLihatPesan(lihatPesan === l.id ? null : l.id)}
                        className="text-xs font-medium text-orange-700 hover:underline dark:text-orange-400"
                      >
                        {lihatPesan === l.id ? 'Tutup' : 'Lihat'}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {lihatPesan !== null && (
              <pre className="mt-3 whitespace-pre-wrap rounded-lg bg-gray-50 p-3 text-xs text-gray-900 dark:bg-zinc-800 dark:text-gray-50">
                {log.find((l) => l.id === lihatPesan)?.pesan}
              </pre>
            )}
          </div>
        )}
      </section>
    </main>
  );
}

function Sakelar({
  label,
  keterangan,
  nilai,
  onUbah,
}: {
  label: string;
  keterangan: string;
  nilai: boolean;
  onUbah: (v: boolean) => void;
}) {
  return (
    <label className="flex cursor-pointer items-start gap-3 rounded-lg border border-gray-200 p-3 dark:border-zinc-700">
      <input
        type="checkbox"
        checked={nilai}
        onChange={(e) => onUbah(e.target.checked)}
        className="mt-0.5 h-4 w-4 shrink-0 accent-orange-600"
      />
      <span>
        <span className="block text-sm font-medium text-gray-900 dark:text-gray-50">
          {label}
        </span>
        <span className="block text-xs text-gray-600 dark:text-gray-400">
          {keterangan}
        </span>
      </span>
    </label>
  );
}
