'use client';

import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, ArrowRight, Loader2, Store, Tags } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Pesan, type IsiPesan } from '@/components/pesan';
import { ServiceType } from '@/lib/laundry/enums';
import { rupiah } from '@/lib/format';
import { selesaikanOnboarding } from '@/lib/laundry/onboarding';

type LayananPilihan = {
  kunci: string;
  nama: string;
  tipe: string;
  satuan: string;
  hargaDefault: number;
  disarankan: boolean;
};

export function MulaiClient({ layanan }: { layanan: LayananPilihan[] }) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [pesan, setPesan] = useState<IsiPesan | null>(null);
  const [langkah, setLangkah] = useState<1 | 2>(1);

  const [outlet, setOutlet] = useState({
    nama: '',
    kodeNota: '',
    alamat: '',
    telepon: '',
  });

  // Yang disarankan dicentang lebih dulu supaya pengguna bisa langsung lanjut.
  const [dipilih, setDipilih] = useState<string[]>(
    layanan.filter((l) => l.disarankan).map((l) => l.kunci)
  );

  function lanjutKeLangkah2() {
    setPesan(null);
    if (outlet.nama.trim().length < 2) {
      setPesan({ tipe: 'error', teks: 'Isi nama outlet dulu.' });
      return;
    }
    if (outlet.kodeNota.trim().length < 2) {
      setPesan({ tipe: 'error', teks: 'Isi kode nota minimal 2 karakter.' });
      return;
    }
    setLangkah(2);
  }

  function simpan() {
    setPesan(null);
    if (dipilih.length === 0) {
      setPesan({ tipe: 'error', teks: 'Pilih minimal satu layanan.' });
      return;
    }

    startTransition(async () => {
      const hasil = await selesaikanOnboarding({
        nama: outlet.nama,
        kodeNota: outlet.kodeNota,
        alamat: outlet.alamat || undefined,
        telepon: outlet.telepon || undefined,
        layanan: dipilih,
      });

      if (hasil.error) {
        setPesan({ tipe: 'error', teks: hasil.error });
        // Kode nota bentrok diperbaiki di langkah 1, jadi kembalikan ke sana.
        if (hasil.error.includes('Kode nota')) setLangkah(1);
        return;
      }
      router.push('/dashboard/pos');
    });
  }

  return (
    <main className="mx-auto max-w-2xl px-4 py-10">
      <h1 className="text-2xl font-semibold text-gray-900 dark:text-gray-50">
        Selamat datang di LaundryKu
      </h1>
      <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
        Dua langkah singkat, lalu kasir Anda sudah bisa menerima cucian.
      </p>

      <ol className="my-6 flex items-center gap-3 text-sm" aria-label="Langkah">
        <Langkah nomor={1} aktif={langkah === 1} selesai={langkah > 1} label="Outlet" />
        <span className="h-px flex-1 bg-gray-300 dark:bg-zinc-700" />
        <Langkah nomor={2} aktif={langkah === 2} selesai={false} label="Layanan" />
      </ol>

      <Pesan isi={pesan} />

      {langkah === 1 ? (
        <section className="rounded-lg border border-gray-200 bg-white p-5 dark:border-zinc-700 dark:bg-zinc-900">
          <h2 className="mb-1 flex items-center gap-2 text-sm font-semibold text-gray-900 dark:text-gray-50">
            <Store className="h-4 w-4" />
            Outlet pertama
          </h2>
          <p className="mb-4 text-xs text-gray-600 dark:text-gray-400">
            Data ini yang tercetak di nota pelanggan.
          </p>

          <div className="grid gap-3 sm:grid-cols-2">
            <div className="sm:col-span-2">
              <Label htmlFor="m-nama">Nama outlet</Label>
              <Input
                id="m-nama"
                value={outlet.nama}
                onChange={(e) => setOutlet((o) => ({ ...o, nama: e.target.value }))}
                placeholder="mis. Laundry Bersih Sawojajar"
              />
            </div>
            <div>
              <Label htmlFor="m-kode">Kode nota</Label>
              <Input
                id="m-kode"
                value={outlet.kodeNota}
                onChange={(e) =>
                  setOutlet((o) => ({
                    ...o,
                    kodeNota: e.target.value.replace(/[^A-Za-z0-9]/g, '').toUpperCase(),
                  }))
                }
                placeholder="SWJ"
                maxLength={10}
              />
              <p className="mt-1 text-xs text-gray-600 dark:text-gray-400">
                Jadi awalan nomor nota, mis. <code>SWJ-260825-001</code>
              </p>
            </div>
            <div>
              <Label htmlFor="m-telepon">Telepon / WA</Label>
              <Input
                id="m-telepon"
                inputMode="tel"
                value={outlet.telepon}
                onChange={(e) => setOutlet((o) => ({ ...o, telepon: e.target.value }))}
                placeholder="08xxxxxxxxxx"
              />
            </div>
            <div className="sm:col-span-2">
              <Label htmlFor="m-alamat">Alamat</Label>
              <Input
                id="m-alamat"
                value={outlet.alamat}
                onChange={(e) => setOutlet((o) => ({ ...o, alamat: e.target.value }))}
                placeholder="Alamat outlet"
              />
            </div>
          </div>

          <Button type="button" className="mt-5 w-full" onClick={lanjutKeLangkah2}>
            Lanjut
            <ArrowRight className="ml-1.5 h-4 w-4" />
          </Button>
        </section>
      ) : (
        <section className="rounded-lg border border-gray-200 bg-white p-5 dark:border-zinc-700 dark:bg-zinc-900">
          <h2 className="mb-1 flex items-center gap-2 text-sm font-semibold text-gray-900 dark:text-gray-50">
            <Tags className="h-4 w-4" />
            Layanan yang Anda tawarkan
          </h2>
          <p className="mb-4 text-xs text-gray-600 dark:text-gray-400">
            Centang yang sesuai. Harga ini hanya titik awal — bisa diubah kapan saja di menu
            Layanan.
          </p>

          <div className="space-y-2">
            {layanan.map((l) => {
              const aktif = dipilih.includes(l.kunci);
              return (
                <label
                  key={l.kunci}
                  className={`flex cursor-pointer items-center gap-3 rounded-lg border p-3 ${
                    aktif
                      ? 'border-orange-400 bg-orange-50 dark:border-orange-600 dark:bg-orange-950/30'
                      : 'border-gray-200 dark:border-zinc-700'
                  }`}
                >
                  <input
                    type="checkbox"
                    checked={aktif}
                    onChange={(e) =>
                      setDipilih((d) =>
                        e.target.checked
                          ? [...d, l.kunci]
                          : d.filter((k) => k !== l.kunci)
                      )
                    }
                    className="h-4 w-4 shrink-0 accent-orange-600"
                  />
                  <span className="min-w-0 flex-1">
                    <span className="block text-sm font-medium text-gray-900 dark:text-gray-50">
                      {l.nama}
                    </span>
                    <span className="block text-xs text-gray-600 dark:text-gray-400">
                      {l.tipe === ServiceType.KILOAN ? 'Kiloan' : 'Satuan'} ·{' '}
                      {rupiah(l.hargaDefault)}/{l.satuan}
                    </span>
                  </span>
                </label>
              );
            })}
          </div>

          <div className="mt-5 flex gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => setLangkah(1)}
              disabled={pending}
            >
              <ArrowLeft className="mr-1.5 h-4 w-4" />
              Kembali
            </Button>
            <Button type="button" className="flex-1" onClick={simpan} disabled={pending}>
              {pending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Menyiapkan...
                </>
              ) : (
                'Selesai & Mulai Berjualan'
              )}
            </Button>
          </div>
        </section>
      )}
    </main>
  );
}

function Langkah({
  nomor,
  label,
  aktif,
  selesai,
}: {
  nomor: number;
  label: string;
  aktif: boolean;
  selesai: boolean;
}) {
  return (
    <li className="flex items-center gap-2">
      <span
        className={`flex h-7 w-7 items-center justify-center rounded-full text-xs font-semibold ${
          aktif || selesai
            ? 'bg-orange-500 text-white'
            : 'bg-gray-200 text-gray-700 dark:bg-zinc-700 dark:text-gray-300'
        }`}
      >
        {nomor}
      </span>
      <span
        className={`font-medium ${
          aktif
            ? 'text-gray-900 dark:text-gray-50'
            : 'text-gray-600 dark:text-gray-400'
        }`}
      >
        {label}
      </span>
    </li>
  );
}
