'use client';

import { useMemo, useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { Loader2, Pencil, Plus, Search, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Pesan, type IsiPesan } from '@/components/pesan';
import { rupiah } from '@/lib/format';
import { buatPelanggan } from '@/lib/laundry/actions';
import { hapusPelanggan, ubahPelanggan } from '@/lib/laundry/actions-master';

type Pelanggan = {
  id: number;
  nama: string;
  telepon: string;
  alamat: string | null;
  catatan: string | null;
  jumlahPesanan: number;
  totalBelanja: number;
};

const FORM_KOSONG = { nama: '', telepon: '', alamat: '', catatan: '' };

export function PelangganClient({ pelanggan }: { pelanggan: Pelanggan[] }) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [pesan, setPesan] = useState<IsiPesan | null>(null);
  const [cari, setCari] = useState('');

  // `null` = form tertutup, 0 = mode tambah, >0 = mode edit pelanggan itu.
  const [modeForm, setModeForm] = useState<number | null>(null);
  const [form, setForm] = useState(FORM_KOSONG);

  const terlihat = useMemo(() => {
    const q = cari.trim().toLowerCase();
    if (!q) return pelanggan;
    return pelanggan.filter(
      (p) =>
        p.nama.toLowerCase().includes(q) ||
        p.telepon.includes(q) ||
        (p.alamat ?? '').toLowerCase().includes(q)
    );
  }, [pelanggan, cari]);

  function bukaTambah() {
    setModeForm(0);
    setForm(FORM_KOSONG);
    setPesan(null);
  }

  function bukaEdit(p: Pelanggan) {
    setModeForm(p.id);
    setForm({
      nama: p.nama,
      telepon: p.telepon,
      alamat: p.alamat ?? '',
      catatan: p.catatan ?? '',
    });
    setPesan(null);
  }

  function simpan() {
    setPesan(null);
    startTransition(async () => {
      const hasil =
        modeForm === 0
          ? await buatPelanggan({
              nama: form.nama,
              telepon: form.telepon,
              alamat: form.alamat || undefined,
            })
          : await ubahPelanggan({
              id: modeForm!,
              nama: form.nama,
              telepon: form.telepon,
              alamat: form.alamat || undefined,
              catatan: form.catatan || undefined,
            });

      if (hasil.error) {
        setPesan({ tipe: 'error', teks: hasil.error });
        return;
      }
      setModeForm(null);
      setForm(FORM_KOSONG);
      setPesan({ tipe: 'ok', teks: hasil.success! });
      router.refresh();
    });
  }

  function hapus(p: Pelanggan) {
    setPesan(null);
    startTransition(async () => {
      const hasil = await hapusPelanggan(p.id);
      if (hasil.error) setPesan({ tipe: 'error', teks: hasil.error });
      else {
        setPesan({ tipe: 'ok', teks: hasil.success! });
        router.refresh();
      }
    });
  }

  return (
    <main className="mx-auto max-w-6xl px-4 py-6 sm:px-6 lg:px-8">
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-2xl font-semibold text-gray-900 dark:text-gray-50">
          Pelanggan
        </h1>
        <Button type="button" onClick={bukaTambah}>
          <Plus className="mr-1.5 h-4 w-4" />
          Pelanggan Baru
        </Button>
      </div>

      <Pesan isi={pesan} />

      {modeForm !== null && (
        <section className="mb-6 rounded-lg border border-gray-200 bg-white p-4 dark:border-zinc-700 dark:bg-zinc-900">
          <h2 className="mb-3 text-sm font-semibold text-gray-900 dark:text-gray-50">
            {modeForm === 0 ? 'Tambah Pelanggan' : 'Ubah Pelanggan'}
          </h2>
          <div className="grid gap-3 sm:grid-cols-2">
            <div>
              <Label htmlFor="p-nama">Nama</Label>
              <Input
                id="p-nama"
                value={form.nama}
                onChange={(e) => setForm((f) => ({ ...f, nama: e.target.value }))}
                placeholder="Nama pelanggan"
              />
            </div>
            <div>
              <Label htmlFor="p-telepon">Nomor HP / WA</Label>
              <Input
                id="p-telepon"
                inputMode="tel"
                value={form.telepon}
                onChange={(e) => setForm((f) => ({ ...f, telepon: e.target.value }))}
                placeholder="08xxxxxxxxxx"
              />
            </div>
            <div className="sm:col-span-2">
              <Label htmlFor="p-alamat">Alamat</Label>
              <Input
                id="p-alamat"
                value={form.alamat}
                onChange={(e) => setForm((f) => ({ ...f, alamat: e.target.value }))}
                placeholder="Alamat lengkap"
              />
            </div>
            {modeForm !== 0 && (
              <div className="sm:col-span-2">
                <Label htmlFor="p-catatan">Catatan</Label>
                <Input
                  id="p-catatan"
                  value={form.catatan}
                  onChange={(e) => setForm((f) => ({ ...f, catatan: e.target.value }))}
                  placeholder="mis. alergi pewangi tertentu"
                />
              </div>
            )}
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

      <div className="mb-4 max-w-sm">
        <Label htmlFor="cari-pelanggan">Cari</Label>
        <div className="relative">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-500 dark:text-gray-400" />
          <Input
            id="cari-pelanggan"
            className="pl-9"
            value={cari}
            onChange={(e) => setCari(e.target.value)}
            placeholder="Nama / no HP / alamat"
          />
        </div>
      </div>

      {terlihat.length === 0 ? (
        <div className="rounded-lg border border-dashed border-gray-300 py-16 text-center dark:border-zinc-700">
          <p className="text-gray-700 dark:text-gray-300">
            {pelanggan.length === 0 ? 'Belum ada pelanggan.' : 'Tidak ada yang cocok.'}
          </p>
          <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
            {pelanggan.length === 0
              ? 'Tambah pelanggan lewat tombol di atas, atau langsung dari POS.'
              : 'Coba kata kunci lain.'}
          </p>
        </div>
      ) : (
        <div className="overflow-x-auto rounded-lg border border-gray-200 dark:border-zinc-700">
          <table className="w-full min-w-[720px] text-sm">
            <thead className="bg-gray-50 dark:bg-zinc-800">
              <tr className="text-left text-gray-700 dark:text-gray-300">
                <th className="px-4 py-3 font-medium">Nama</th>
                <th className="px-4 py-3 font-medium">No. HP / WA</th>
                <th className="px-4 py-3 font-medium">Alamat</th>
                <th className="px-4 py-3 text-right font-medium">Pesanan</th>
                <th className="px-4 py-3 text-right font-medium">Total Belanja</th>
                <th className="px-4 py-3 text-right font-medium">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 dark:divide-zinc-700">
              {terlihat.map((p) => (
                <tr key={p.id} className="bg-white dark:bg-zinc-900">
                  <td className="px-4 py-3 font-medium text-gray-900 dark:text-gray-50">
                    {p.nama}
                    {p.catatan && (
                      <span className="block text-xs font-normal text-gray-600 dark:text-gray-400">
                        {p.catatan}
                      </span>
                    )}
                  </td>
                  <td className="px-4 py-3 text-gray-700 dark:text-gray-300">
                    {p.telepon}
                  </td>
                  <td className="px-4 py-3 text-gray-700 dark:text-gray-300">
                    {p.alamat || '—'}
                  </td>
                  <td className="px-4 py-3 text-right text-gray-700 dark:text-gray-300">
                    {p.jumlahPesanan}
                  </td>
                  <td className="px-4 py-3 text-right text-gray-900 dark:text-gray-50">
                    {rupiah(p.totalBelanja)}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex justify-end gap-1">
                      <button
                        type="button"
                        onClick={() => bukaEdit(p)}
                        aria-label={`Ubah ${p.nama}`}
                        className="rounded p-1.5 text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-zinc-800"
                      >
                        <Pencil className="h-4 w-4" />
                      </button>
                      <button
                        type="button"
                        onClick={() => hapus(p)}
                        disabled={pending || p.jumlahPesanan > 0}
                        aria-label={`Hapus ${p.nama}`}
                        title={
                          p.jumlahPesanan > 0
                            ? 'Tidak bisa dihapus — sudah punya pesanan'
                            : 'Hapus pelanggan'
                        }
                        className="rounded p-1.5 text-red-700 hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-40 dark:text-red-400 dark:hover:bg-red-950"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
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
