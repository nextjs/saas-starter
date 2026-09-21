'use client';

import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { Loader2, Pencil, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Pesan, type IsiPesan } from '@/components/pesan';
import { buatOutlet, ubahAktifOutlet, ubahOutlet } from '@/lib/laundry/actions-master';

type Outlet = {
  id: number;
  nama: string;
  kodeNota: string;
  alamat: string | null;
  telepon: string | null;
  aktif: boolean;
  jumlahPesanan: number;
};

const FORM_KOSONG = { nama: '', kodeNota: '', alamat: '', telepon: '' };

export function OutletClient({
  outlets,
  bisaUbah,
}: {
  outlets: Outlet[];
  bisaUbah: boolean;
}) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [pesan, setPesan] = useState<IsiPesan | null>(null);
  const [modeForm, setModeForm] = useState<number | null>(null);
  const [form, setForm] = useState(FORM_KOSONG);

  function bukaTambah() {
    setModeForm(0);
    setForm(FORM_KOSONG);
    setPesan(null);
  }

  function bukaEdit(o: Outlet) {
    setModeForm(o.id);
    setForm({
      nama: o.nama,
      kodeNota: o.kodeNota,
      alamat: o.alamat ?? '',
      telepon: o.telepon ?? '',
    });
    setPesan(null);
  }

  function simpan() {
    setPesan(null);
    const payload = {
      nama: form.nama,
      kodeNota: form.kodeNota,
      alamat: form.alamat || undefined,
      telepon: form.telepon || undefined,
    };

    startTransition(async () => {
      const hasil =
        modeForm === 0
          ? await buatOutlet(payload)
          : await ubahOutlet({ ...payload, id: modeForm! });

      if (hasil.error) {
        setPesan({ tipe: 'error', teks: hasil.error });
        return;
      }
      setModeForm(null);
      setPesan({ tipe: 'ok', teks: hasil.success! });
      router.refresh();
    });
  }

  function toggleAktif(o: Outlet) {
    setPesan(null);
    startTransition(async () => {
      const hasil = await ubahAktifOutlet(o.id, !o.aktif);
      if (hasil.error) setPesan({ tipe: 'error', teks: hasil.error });
      else {
        setPesan({ tipe: 'ok', teks: hasil.success! });
        router.refresh();
      }
    });
  }

  return (
    <main className="mx-auto max-w-5xl px-4 py-6 sm:px-6 lg:px-8">
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900 dark:text-gray-50">
            Outlet
          </h1>
          <p className="mt-0.5 text-sm text-gray-600 dark:text-gray-400">
            Kode nota jadi awalan nomor nota, mis. <code>PST-260825-001</code>.
          </p>
        </div>
        {bisaUbah && (
          <Button type="button" onClick={bukaTambah}>
            <Plus className="mr-1.5 h-4 w-4" />
            Outlet Baru
          </Button>
        )}
      </div>

      {!bisaUbah && (
        <div className="mb-4 rounded-lg border border-amber-300 bg-amber-50 px-4 py-3 text-sm text-amber-900 dark:border-amber-800 dark:bg-amber-950 dark:text-amber-100">
          Anda hanya bisa melihat. Perubahan outlet hanya boleh dilakukan Owner.
        </div>
      )}

      <Pesan isi={pesan} />

      {modeForm !== null && (
        <section className="mb-6 rounded-lg border border-gray-200 bg-white p-4 dark:border-zinc-700 dark:bg-zinc-900">
          <h2 className="mb-3 text-sm font-semibold text-gray-900 dark:text-gray-50">
            {modeForm === 0 ? 'Tambah Outlet' : 'Ubah Outlet'}
          </h2>
          <div className="grid gap-3 sm:grid-cols-2">
            <div>
              <Label htmlFor="o-nama">Nama outlet</Label>
              <Input
                id="o-nama"
                value={form.nama}
                onChange={(e) => setForm((f) => ({ ...f, nama: e.target.value }))}
                placeholder="mis. LaundryKu Cabang Sawojajar"
              />
            </div>
            <div>
              <Label htmlFor="o-kode">Kode nota</Label>
              <Input
                id="o-kode"
                value={form.kodeNota}
                onChange={(e) =>
                  setForm((f) => ({
                    ...f,
                    // Huruf besar & tanpa spasi, karena ikut jadi nomor nota.
                    kodeNota: e.target.value.replace(/[^A-Za-z0-9]/g, '').toUpperCase(),
                  }))
                }
                placeholder="SWJ"
                maxLength={10}
              />
              {modeForm !== 0 && (
                <p className="mt-1 text-xs text-amber-700 dark:text-amber-400">
                  Mengubah kode hanya memengaruhi nota baru.
                </p>
              )}
            </div>
            <div className="sm:col-span-2">
              <Label htmlFor="o-alamat">Alamat</Label>
              <Input
                id="o-alamat"
                value={form.alamat}
                onChange={(e) => setForm((f) => ({ ...f, alamat: e.target.value }))}
                placeholder="Dicetak di nota"
              />
            </div>
            <div>
              <Label htmlFor="o-telepon">Telepon / WA</Label>
              <Input
                id="o-telepon"
                inputMode="tel"
                value={form.telepon}
                onChange={(e) => setForm((f) => ({ ...f, telepon: e.target.value }))}
                placeholder="08xxxxxxxxxx"
              />
            </div>
          </div>
          <div className="mt-4 flex gap-2">
            <Button type="button" onClick={simpan} disabled={pending}>
              {pending ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Simpan'}
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={() => setModeForm(null)}
              disabled={pending}
            >
              Batal
            </Button>
          </div>
        </section>
      )}

      {outlets.length === 0 ? (
        <div className="rounded-lg border border-dashed border-gray-300 py-16 text-center dark:border-zinc-700">
          <p className="text-gray-700 dark:text-gray-300">Belum ada outlet.</p>
          <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
            POS baru bisa dipakai setelah ada minimal satu outlet aktif.
          </p>
        </div>
      ) : (
        <div className="overflow-x-auto rounded-lg border border-gray-200 dark:border-zinc-700">
          <table className="w-full min-w-[720px] text-sm">
            <thead className="bg-gray-50 dark:bg-zinc-800">
              <tr className="text-left text-gray-700 dark:text-gray-300">
                <th className="px-4 py-3 font-medium">Outlet</th>
                <th className="px-4 py-3 font-medium">Kode</th>
                <th className="px-4 py-3 font-medium">Kontak</th>
                <th className="px-4 py-3 text-right font-medium">Pesanan</th>
                {bisaUbah && <th className="px-4 py-3 text-right font-medium">Aksi</th>}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 dark:divide-zinc-700">
              {outlets.map((o) => (
                <tr
                  key={o.id}
                  className={
                    o.aktif ? 'bg-white dark:bg-zinc-900' : 'bg-gray-50 dark:bg-zinc-950/60'
                  }
                >
                  <td className="px-4 py-3">
                    <span className="font-medium text-gray-900 dark:text-gray-50">
                      {o.nama}
                    </span>
                    {!o.aktif && (
                      <span className="ml-2 rounded-full bg-gray-200 px-2 py-0.5 text-xs font-medium text-gray-800 dark:bg-zinc-700 dark:text-gray-200">
                        Nonaktif
                      </span>
                    )}
                    <span className="block text-xs text-gray-600 dark:text-gray-400">
                      {o.alamat || '—'}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <code className="rounded bg-gray-100 px-1.5 py-0.5 text-gray-900 dark:bg-zinc-800 dark:text-gray-50">
                      {o.kodeNota}
                    </code>
                  </td>
                  <td className="px-4 py-3 text-gray-700 dark:text-gray-300">
                    {o.telepon || '—'}
                  </td>
                  <td className="px-4 py-3 text-right text-gray-700 dark:text-gray-300">
                    {o.jumlahPesanan}
                  </td>
                  {bisaUbah && (
                    <td className="px-4 py-3">
                      <div className="flex items-center justify-end gap-1">
                        <button
                          type="button"
                          onClick={() => bukaEdit(o)}
                          aria-label={`Ubah ${o.nama}`}
                          className="rounded p-1.5 text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-zinc-800"
                        >
                          <Pencil className="h-4 w-4" />
                        </button>
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          disabled={pending}
                          onClick={() => toggleAktif(o)}
                        >
                          {o.aktif ? 'Nonaktifkan' : 'Aktifkan'}
                        </Button>
                      </div>
                    </td>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </main>
  );
}
