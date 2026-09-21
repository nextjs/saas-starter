'use client';

import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { Loader2, Pencil, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { SearchableSelect } from '@/components/ui/searchable-select';
import { Pesan, type IsiPesan } from '@/components/pesan';
import { ServiceType } from '@/lib/laundry/enums';
import { toNum } from '@/lib/laundry/pricing';
import { angka, parseRupiah, rupiah } from '@/lib/format';
import { buatLayanan, ubahAktifLayanan, ubahLayanan } from '@/lib/laundry/actions-master';

type Layanan = {
  id: number;
  nama: string;
  tipe: string;
  satuan: string;
  hargaDefault: number;
  minQty: string;
  durasiJam: number;
  expressMultiplier: string;
  expressDurasiJam: number;
  aktif: boolean;
};

const FORM_KOSONG = {
  nama: '',
  tipe: ServiceType.KILOAN as string,
  satuan: 'kg',
  hargaDefault: '0',
  minQty: '1',
  durasiJam: '72',
  expressMultiplier: '1,5',
  expressDurasiJam: '24',
};

/** Terima "1,5" maupun "1.5" — kasir Indonesia mengetik koma. */
function keAngka(teks: string): number {
  return toNum(teks.replace(',', '.'));
}

function formatDesimal(n: number): string {
  return new Intl.NumberFormat('id-ID', { maximumFractionDigits: 2 }).format(n);
}

/** 72 jam → "3 hari", 30 jam → "1 hari 6 jam" */
function durasiManusiawi(jam: number): string {
  const hari = Math.floor(jam / 24);
  const sisa = jam % 24;
  if (hari === 0) return `${jam} jam`;
  if (sisa === 0) return `${hari} hari`;
  return `${hari} hari ${sisa} jam`;
}

export function LayananClient({ layanan }: { layanan: Layanan[] }) {
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

  function bukaEdit(s: Layanan) {
    setModeForm(s.id);
    setForm({
      nama: s.nama,
      tipe: s.tipe,
      satuan: s.satuan,
      hargaDefault: String(s.hargaDefault),
      minQty: formatDesimal(toNum(s.minQty)),
      durasiJam: String(s.durasiJam),
      expressMultiplier: formatDesimal(toNum(s.expressMultiplier)),
      expressDurasiJam: String(s.expressDurasiJam),
    });
    setPesan(null);
  }

  function simpan() {
    setPesan(null);
    const payload = {
      nama: form.nama,
      tipe: form.tipe as ServiceType,
      satuan: form.satuan,
      hargaDefault: parseRupiah(form.hargaDefault),
      minQty: keAngka(form.minQty),
      durasiJam: Math.round(keAngka(form.durasiJam)),
      expressMultiplier: keAngka(form.expressMultiplier),
      expressDurasiJam: Math.round(keAngka(form.expressDurasiJam)),
    };

    startTransition(async () => {
      const hasil =
        modeForm === 0
          ? await buatLayanan(payload)
          : await ubahLayanan({ ...payload, id: modeForm! });

      if (hasil.error) {
        setPesan({ tipe: 'error', teks: hasil.error });
        return;
      }
      setModeForm(null);
      setPesan({ tipe: 'ok', teks: hasil.success! });
      router.refresh();
    });
  }

  function toggleAktif(s: Layanan) {
    setPesan(null);
    startTransition(async () => {
      const hasil = await ubahAktifLayanan(s.id, !s.aktif);
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
        <div>
          <h1 className="text-2xl font-semibold text-gray-900 dark:text-gray-50">
            Layanan & Harga
          </h1>
          <p className="mt-0.5 text-sm text-gray-600 dark:text-gray-400">
            Mengubah harga di sini tidak mengubah nota yang sudah terbit.
          </p>
        </div>
        <Button type="button" onClick={bukaTambah}>
          <Plus className="mr-1.5 h-4 w-4" />
          Layanan Baru
        </Button>
      </div>

      <Pesan isi={pesan} />

      {modeForm !== null && (
        <section className="mb-6 rounded-lg border border-gray-200 bg-white p-4 dark:border-zinc-700 dark:bg-zinc-900">
          <h2 className="mb-3 text-sm font-semibold text-gray-900 dark:text-gray-50">
            {modeForm === 0 ? 'Tambah Layanan' : 'Ubah Layanan'}
          </h2>

          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            <div className="sm:col-span-2">
              <Label htmlFor="l-nama">Nama layanan</Label>
              <Input
                id="l-nama"
                value={form.nama}
                onChange={(e) => setForm((f) => ({ ...f, nama: e.target.value }))}
                placeholder="mis. Cuci Kering Lipat"
              />
            </div>

            <SearchableSelect
              label="Tipe"
              value={form.tipe}
              onChange={(v) =>
                setForm((f) => ({
                  ...f,
                  tipe: v ?? ServiceType.KILOAN,
                  // Satuan mengikuti tipe supaya tidak ada "kiloan per pcs".
                  satuan: v === ServiceType.SATUAN ? 'pcs' : 'kg',
                }))
              }
              options={[
                { value: ServiceType.KILOAN, label: 'Kiloan', hint: 'ditimbang, per kg' },
                { value: ServiceType.SATUAN, label: 'Satuan', hint: 'dihitung, per pcs' },
              ]}
            />

            <div>
              <Label htmlFor="l-satuan">Satuan</Label>
              <Input
                id="l-satuan"
                value={form.satuan}
                onChange={(e) => setForm((f) => ({ ...f, satuan: e.target.value }))}
                placeholder="kg / pcs"
              />
            </div>

            <div>
              <Label htmlFor="l-harga">Harga per satuan (Rp)</Label>
              <Input
                id="l-harga"
                inputMode="numeric"
                value={form.hargaDefault === '0' ? '' : angka(parseRupiah(form.hargaDefault))}
                onChange={(e) =>
                  setForm((f) => ({ ...f, hargaDefault: String(parseRupiah(e.target.value)) }))
                }
                placeholder="0"
              />
            </div>

            <div>
              <Label htmlFor="l-min">Minimum charge</Label>
              <Input
                id="l-min"
                inputMode="decimal"
                value={form.minQty}
                onChange={(e) =>
                  setForm((f) => ({ ...f, minQty: e.target.value.replace(/[^0-9.,]/g, '') }))
                }
                placeholder="3"
              />
              <p className="mt-1 text-xs text-gray-600 dark:text-gray-400">
                Hanya berlaku untuk kiloan
              </p>
            </div>

            <div>
              <Label htmlFor="l-durasi">Durasi reguler (jam)</Label>
              <Input
                id="l-durasi"
                inputMode="numeric"
                value={form.durasiJam}
                onChange={(e) =>
                  setForm((f) => ({ ...f, durasiJam: e.target.value.replace(/\D/g, '') }))
                }
                placeholder="72"
              />
            </div>

            <div>
              <Label htmlFor="l-mult">Pengali Express</Label>
              <Input
                id="l-mult"
                inputMode="decimal"
                value={form.expressMultiplier}
                onChange={(e) =>
                  setForm((f) => ({
                    ...f,
                    expressMultiplier: e.target.value.replace(/[^0-9.,]/g, ''),
                  }))
                }
                placeholder="1,5"
              />
            </div>

            <div>
              <Label htmlFor="l-edurasi">Durasi Express (jam)</Label>
              <Input
                id="l-edurasi"
                inputMode="numeric"
                value={form.expressDurasiJam}
                onChange={(e) =>
                  setForm((f) => ({
                    ...f,
                    expressDurasiJam: e.target.value.replace(/\D/g, ''),
                  }))
                }
                placeholder="24"
              />
            </div>
          </div>

          {parseRupiah(form.hargaDefault) > 0 && (
            <p className="mt-3 rounded bg-gray-50 p-2.5 text-sm text-gray-700 dark:bg-zinc-800 dark:text-gray-300">
              Pratinjau: reguler {rupiah(parseRupiah(form.hargaDefault))}/{form.satuan} ·
              express{' '}
              {rupiah(
                Math.round(parseRupiah(form.hargaDefault) * keAngka(form.expressMultiplier))
              )}
              /{form.satuan}
            </p>
          )}

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

      {layanan.length === 0 ? (
        <div className="rounded-lg border border-dashed border-gray-300 py-16 text-center dark:border-zinc-700">
          <p className="text-gray-700 dark:text-gray-300">Belum ada layanan.</p>
          <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
            Tambah layanan dulu supaya kasir bisa menerima pesanan.
          </p>
        </div>
      ) : (
        <div className="overflow-x-auto rounded-lg border border-gray-200 dark:border-zinc-700">
          <table className="w-full min-w-[860px] text-sm">
            <thead className="bg-gray-50 dark:bg-zinc-800">
              <tr className="text-left text-gray-700 dark:text-gray-300">
                <th className="px-4 py-3 font-medium">Layanan</th>
                <th className="px-4 py-3 font-medium">Tipe</th>
                <th className="px-4 py-3 text-right font-medium">Harga</th>
                <th className="px-4 py-3 text-right font-medium">Min.</th>
                <th className="px-4 py-3 font-medium">Reguler</th>
                <th className="px-4 py-3 font-medium">Express</th>
                <th className="px-4 py-3 text-right font-medium">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 dark:divide-zinc-700">
              {layanan.map((s) => (
                <tr
                  key={s.id}
                  className={
                    s.aktif
                      ? 'bg-white dark:bg-zinc-900'
                      : 'bg-gray-50 dark:bg-zinc-950/60'
                  }
                >
                  <td className="px-4 py-3">
                    <span className="font-medium text-gray-900 dark:text-gray-50">
                      {s.nama}
                    </span>
                    {!s.aktif && (
                      <span className="ml-2 rounded-full bg-gray-200 px-2 py-0.5 text-xs font-medium text-gray-800 dark:bg-zinc-700 dark:text-gray-200">
                        Nonaktif
                      </span>
                    )}
                  </td>
                  <td className="px-4 py-3 text-gray-700 dark:text-gray-300">
                    {s.tipe === ServiceType.KILOAN ? 'Kiloan' : 'Satuan'}
                  </td>
                  <td className="px-4 py-3 text-right text-gray-900 dark:text-gray-50">
                    {rupiah(s.hargaDefault)}
                    <span className="text-gray-600 dark:text-gray-400">/{s.satuan}</span>
                  </td>
                  <td className="px-4 py-3 text-right text-gray-700 dark:text-gray-300">
                    {s.tipe === ServiceType.KILOAN
                      ? `${formatDesimal(toNum(s.minQty))} ${s.satuan}`
                      : '—'}
                  </td>
                  <td className="px-4 py-3 text-gray-700 dark:text-gray-300">
                    {durasiManusiawi(s.durasiJam)}
                  </td>
                  <td className="px-4 py-3 text-gray-700 dark:text-gray-300">
                    ×{formatDesimal(toNum(s.expressMultiplier))} ·{' '}
                    {durasiManusiawi(s.expressDurasiJam)}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center justify-end gap-1">
                      <button
                        type="button"
                        onClick={() => bukaEdit(s)}
                        aria-label={`Ubah ${s.nama}`}
                        className="rounded p-1.5 text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-zinc-800"
                      >
                        <Pencil className="h-4 w-4" />
                      </button>
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        disabled={pending}
                        onClick={() => toggleAktif(s)}
                      >
                        {s.aktif ? 'Nonaktifkan' : 'Aktifkan'}
                      </Button>
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
