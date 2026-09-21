'use client';

import { useMemo, useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { Loader2, Plus, Trash2, Zap } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { SearchableSelect } from '@/components/ui/searchable-select';
import { PaymentMethod, LABEL_METODE_BAYAR, ServiceType } from '@/lib/laundry/enums';
import { hitungSubtotalItem, hitungTotal, toNum } from '@/lib/laundry/pricing';
import { angka, kuantitas, parseRupiah, rupiah } from '@/lib/format';
import { buatPelanggan, buatPesanan } from '@/lib/laundry/actions';

type Layanan = {
  id: number;
  nama: string;
  tipe: string;
  satuan: string;
  hargaDasar: number;
  minQty: string;
  durasiJam: number;
  expressMultiplier: string;
  expressDurasiJam: number;
};

type Props = {
  outlets: { id: number; nama: string; kodeNota: string }[];
  services: Layanan[];
  customers: { id: number; nama: string; telepon: string }[];
};

type BarisKeranjang = {
  key: string;
  serviceId: number;
  qty: string; // string supaya kasir bisa mengetik "3," tanpa langsung dinormalkan
  isExpress: boolean;
};

export function PosClient({ outlets, services, customers }: Props) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();

  const [outletId, setOutletId] = useState<string | null>(
    outlets.length === 1 ? String(outlets[0].id) : null
  );
  const [customerId, setCustomerId] = useState<string | null>(null);
  const [daftarPelanggan, setDaftarPelanggan] = useState(customers);
  const [keranjang, setKeranjang] = useState<BarisKeranjang[]>([]);
  const [diskon, setDiskon] = useState('0');
  const [bayar, setBayar] = useState('0');
  const [metode, setMetode] = useState<string | null>(PaymentMethod.TUNAI);
  const [catatan, setCatatan] = useState('');
  const [pesan, setPesan] = useState<{ tipe: 'error' | 'ok'; teks: string } | null>(null);

  // Form pelanggan baru
  const [formPelangganTerbuka, setFormPelangganTerbuka] = useState(false);
  const [pelangganBaru, setPelangganBaru] = useState({ nama: '', telepon: '', alamat: '' });

  const petaLayanan = useMemo(
    () => new Map(services.map((s) => [s.id, s])),
    [services]
  );

  /**
   * Perhitungan di sini murni untuk pratinjau layar. Angka yang benar-benar
   * disimpan dihitung ulang di server dari harga database — keduanya memakai
   * helper yang sama di lib/laundry/pricing.ts.
   */
  const baris = keranjang.map((b) => {
    const layanan = petaLayanan.get(b.serviceId)!;
    const qty = toNum(b.qty.replace(',', '.'));
    const { hargaSatuan, qtyEfektif, subtotal } = hitungSubtotalItem(
      layanan,
      qty,
      b.isExpress
    );
    return {
      ...b,
      layanan,
      qty,
      hargaSatuan,
      qtyEfektif,
      subtotal,
      kenaMinimum: qtyEfektif > qty,
    };
  });

  const nilaiDiskon = parseRupiah(diskon);
  const { subtotal, total } = hitungTotal(
    baris.map((b) => b.subtotal),
    nilaiDiskon
  );
  const nilaiBayar = Math.min(parseRupiah(bayar), total);
  const sisa = Math.max(0, total - nilaiBayar);

  function tambahLayanan(serviceId: number) {
    setKeranjang((k) => [
      ...k,
      {
        key: `${serviceId}-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
        serviceId,
        qty: '',
        isExpress: false,
      },
    ]);
  }

  function ubahBaris(key: string, patch: Partial<BarisKeranjang>) {
    setKeranjang((k) => k.map((b) => (b.key === key ? { ...b, ...patch } : b)));
  }

  function hapusBaris(key: string) {
    setKeranjang((k) => k.filter((b) => b.key !== key));
  }

  function simpanPelangganBaru() {
    setPesan(null);
    startTransition(async () => {
      const hasil = await buatPelanggan(pelangganBaru);
      if (hasil.error) {
        setPesan({ tipe: 'error', teks: hasil.error });
        return;
      }
      if (hasil.customerId) {
        setDaftarPelanggan((d) =>
          [...d, {
            id: hasil.customerId!,
            nama: pelangganBaru.nama,
            telepon: pelangganBaru.telepon,
          }].sort((a, b) => a.nama.localeCompare(b.nama))
        );
        setCustomerId(String(hasil.customerId));
      }
      setPelangganBaru({ nama: '', telepon: '', alamat: '' });
      setFormPelangganTerbuka(false);
      setPesan({ tipe: 'ok', teks: 'Pelanggan ditambahkan.' });
    });
  }

  function simpanPesanan() {
    setPesan(null);

    if (!outletId) return setPesan({ tipe: 'error', teks: 'Pilih outlet dulu.' });
    if (!customerId) return setPesan({ tipe: 'error', teks: 'Pilih pelanggan dulu.' });
    if (baris.length === 0)
      return setPesan({ tipe: 'error', teks: 'Belum ada layanan yang ditambahkan.' });
    if (baris.some((b) => b.qty <= 0))
      return setPesan({
        tipe: 'error',
        teks: 'Ada layanan yang berat/jumlahnya masih kosong.',
      });

    startTransition(async () => {
      const hasil = await buatPesanan({
        outletId: Number(outletId),
        customerId: Number(customerId),
        items: baris.map((b) => ({
          serviceId: b.serviceId,
          qty: b.qty,
          isExpress: b.isExpress,
        })),
        diskon: nilaiDiskon,
        catatan: catatan || undefined,
        bayar: nilaiBayar,
        metodeBayar: (metode as PaymentMethod) ?? PaymentMethod.TUNAI,
      });

      if (hasil.error) {
        setPesan({ tipe: 'error', teks: hasil.error });
        return;
      }
      // Langsung ke nota — kasir hampir selalu mencetak setelah menyimpan.
      router.push(`/dashboard/pesanan/${hasil.orderId}/nota`);
    });
  }

  const layananKiloan = services.filter((s) => s.tipe === ServiceType.KILOAN);
  const layananSatuan = services.filter((s) => s.tipe === ServiceType.SATUAN);

  return (
    <main className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
      <h1 className="mb-6 text-2xl font-semibold text-gray-900 dark:text-gray-50">
        POS Kasir
      </h1>

      {pesan && (
        <div
          role="status"
          className={
            pesan.tipe === 'error'
              ? 'mb-4 rounded-lg border border-red-300 bg-red-50 px-4 py-3 text-sm text-red-900 dark:border-red-900 dark:bg-red-950 dark:text-red-100'
              : 'mb-4 rounded-lg border border-green-300 bg-green-50 px-4 py-3 text-sm text-green-900 dark:border-green-900 dark:bg-green-950 dark:text-green-100'
          }
        >
          {pesan.teks}
        </div>
      )}

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Kolom kiri: pelanggan + katalog layanan */}
        <div className="space-y-6 lg:col-span-2">
          <section className="rounded-lg border border-gray-200 bg-white p-4 dark:border-zinc-700 dark:bg-zinc-900">
            <h2 className="mb-3 text-sm font-semibold text-gray-900 dark:text-gray-50">
              Pelanggan & Outlet
            </h2>
            <div className="grid gap-4 sm:grid-cols-2">
              <SearchableSelect
                label="Outlet"
                required
                value={outletId}
                onChange={setOutletId}
                placeholder="Pilih outlet"
                options={outlets.map((o) => ({
                  value: String(o.id),
                  label: o.nama,
                  hint: `Kode nota ${o.kodeNota}`,
                }))}
              />
              <div>
                <SearchableSelect
                  label="Pelanggan"
                  required
                  value={customerId}
                  onChange={setCustomerId}
                  placeholder="Cari nama / nomor HP"
                  emptyText="Pelanggan tidak ditemukan"
                  options={daftarPelanggan.map((c) => ({
                    value: String(c.id),
                    label: c.nama,
                    hint: c.telepon,
                  }))}
                />
                <button
                  type="button"
                  onClick={() => setFormPelangganTerbuka((v) => !v)}
                  className="mt-1.5 text-sm font-medium text-orange-700 hover:underline dark:text-orange-400"
                >
                  {formPelangganTerbuka ? 'Batal tambah pelanggan' : '+ Pelanggan baru'}
                </button>
              </div>
            </div>

            {formPelangganTerbuka && (
              <div className="mt-4 grid gap-3 rounded-lg border border-gray-200 bg-gray-50 p-3 sm:grid-cols-3 dark:border-zinc-700 dark:bg-zinc-800">
                <div>
                  <Label htmlFor="pb-nama">Nama</Label>
                  <Input
                    id="pb-nama"
                    value={pelangganBaru.nama}
                    onChange={(e) =>
                      setPelangganBaru((p) => ({ ...p, nama: e.target.value }))
                    }
                    placeholder="Nama pelanggan"
                  />
                </div>
                <div>
                  <Label htmlFor="pb-telepon">Nomor HP / WA</Label>
                  <Input
                    id="pb-telepon"
                    inputMode="tel"
                    value={pelangganBaru.telepon}
                    onChange={(e) =>
                      setPelangganBaru((p) => ({ ...p, telepon: e.target.value }))
                    }
                    placeholder="08xxxxxxxxxx"
                  />
                </div>
                <div className="flex items-end">
                  <Button
                    type="button"
                    onClick={simpanPelangganBaru}
                    disabled={pending}
                    className="w-full"
                  >
                    {pending ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      'Simpan Pelanggan'
                    )}
                  </Button>
                </div>
              </div>
            )}
          </section>

          <section className="rounded-lg border border-gray-200 bg-white p-4 dark:border-zinc-700 dark:bg-zinc-900">
            <h2 className="mb-3 text-sm font-semibold text-gray-900 dark:text-gray-50">
              Pilih Layanan
            </h2>
            <KatalogLayanan
              judul="Kiloan"
              layanan={layananKiloan}
              onPilih={tambahLayanan}
            />
            <KatalogLayanan
              judul="Satuan"
              layanan={layananSatuan}
              onPilih={tambahLayanan}
            />
          </section>

          <section className="rounded-lg border border-gray-200 bg-white p-4 dark:border-zinc-700 dark:bg-zinc-900">
            <h2 className="mb-3 text-sm font-semibold text-gray-900 dark:text-gray-50">
              Keranjang
            </h2>

            {baris.length === 0 ? (
              <p className="py-8 text-center text-sm text-gray-600 dark:text-gray-400">
                Belum ada layanan. Pilih dari daftar di atas.
              </p>
            ) : (
              <ul className="space-y-3">
                {baris.map((b) => (
                  <li
                    key={b.key}
                    className="rounded-lg border border-gray-200 p-3 dark:border-zinc-700"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="min-w-0">
                        <p className="truncate font-medium text-gray-900 dark:text-gray-50">
                          {b.layanan.nama}
                        </p>
                        <p className="text-xs text-gray-600 dark:text-gray-400">
                          {rupiah(b.hargaSatuan)} / {b.layanan.satuan}
                          {b.isExpress &&
                            ` (Express ×${new Intl.NumberFormat('id-ID').format(
                              toNum(b.layanan.expressMultiplier)
                            )})`}
                        </p>
                      </div>
                      <button
                        type="button"
                        onClick={() => hapusBaris(b.key)}
                        aria-label={`Hapus ${b.layanan.nama}`}
                        className="rounded p-1.5 text-red-700 hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-950"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>

                    <div className="mt-3 flex flex-wrap items-end gap-3">
                      <div className="w-32">
                        <Label htmlFor={`qty-${b.key}`}>
                          {b.layanan.tipe === ServiceType.KILOAN ? 'Berat' : 'Jumlah'} (
                          {b.layanan.satuan})
                        </Label>
                        <Input
                          id={`qty-${b.key}`}
                          inputMode="decimal"
                          value={b.qty}
                          onChange={(e) =>
                            ubahBaris(b.key, {
                              qty: e.target.value.replace(/[^0-9.,]/g, ''),
                            })
                          }
                          placeholder="0"
                        />
                      </div>

                      <button
                        type="button"
                        onClick={() => ubahBaris(b.key, { isExpress: !b.isExpress })}
                        aria-pressed={b.isExpress}
                        className={
                          b.isExpress
                            ? 'inline-flex h-9 items-center gap-1.5 rounded-lg bg-amber-500 px-3 text-sm font-medium text-amber-950'
                            : 'inline-flex h-9 items-center gap-1.5 rounded-lg border border-gray-300 px-3 text-sm font-medium text-gray-700 hover:bg-gray-50 dark:border-zinc-600 dark:text-gray-300 dark:hover:bg-zinc-800'
                        }
                      >
                        <Zap className="h-4 w-4" />
                        Express
                      </button>

                      <div className="ml-auto text-right">
                        <p className="text-xs text-gray-600 dark:text-gray-400">Subtotal</p>
                        <p className="font-semibold text-gray-900 dark:text-gray-50">
                          {rupiah(b.subtotal)}
                        </p>
                      </div>
                    </div>

                    {b.kenaMinimum && (
                      <p className="mt-2 text-xs text-amber-700 dark:text-amber-400">
                        Dihitung minimum {kuantitas(b.qtyEfektif, b.layanan.satuan)}
                      </p>
                    )}
                  </li>
                ))}
              </ul>
            )}
          </section>
        </div>

        {/* Kolom kanan: ringkasan pembayaran */}
        <aside className="lg:sticky lg:top-6 lg:h-fit">
          <div className="rounded-lg border border-gray-200 bg-white p-4 dark:border-zinc-700 dark:bg-zinc-900">
            <h2 className="mb-4 text-sm font-semibold text-gray-900 dark:text-gray-50">
              Ringkasan
            </h2>

            <dl className="space-y-2 text-sm">
              <div className="flex justify-between">
                <dt className="text-gray-700 dark:text-gray-300">Subtotal</dt>
                <dd className="font-medium text-gray-900 dark:text-gray-50">
                  {rupiah(subtotal)}
                </dd>
              </div>
            </dl>

            <div className="mt-4 space-y-3">
              <div>
                <Label htmlFor="diskon">Diskon (Rp)</Label>
                <Input
                  id="diskon"
                  inputMode="numeric"
                  value={diskon === '0' ? '' : angka(nilaiDiskon)}
                  onChange={(e) => setDiskon(String(parseRupiah(e.target.value)))}
                  placeholder="0"
                />
              </div>

              <div className="flex justify-between border-t border-gray-200 pt-3 dark:border-zinc-700">
                <span className="font-semibold text-gray-900 dark:text-gray-50">Total</span>
                <span className="text-lg font-bold text-gray-900 dark:text-gray-50">
                  {rupiah(total)}
                </span>
              </div>

              <div>
                <Label htmlFor="bayar">Bayar sekarang (Rp)</Label>
                <Input
                  id="bayar"
                  inputMode="numeric"
                  value={bayar === '0' ? '' : angka(parseRupiah(bayar))}
                  onChange={(e) => setBayar(String(parseRupiah(e.target.value)))}
                  placeholder="0 = belum bayar"
                />
                <div className="mt-1.5 flex gap-2">
                  <button
                    type="button"
                    onClick={() => setBayar(String(total))}
                    className="text-xs font-medium text-orange-700 hover:underline dark:text-orange-400"
                  >
                    Bayar lunas
                  </button>
                </div>
              </div>

              <SearchableSelect
                label="Metode bayar"
                value={metode}
                onChange={setMetode}
                options={Object.values(PaymentMethod).map((m) => ({
                  value: m,
                  label: LABEL_METODE_BAYAR[m],
                }))}
              />

              <div className="flex justify-between text-sm">
                <span className="text-gray-700 dark:text-gray-300">Sisa tagihan</span>
                <span
                  className={
                    sisa > 0
                      ? 'font-semibold text-red-700 dark:text-red-400'
                      : 'font-semibold text-green-700 dark:text-green-400'
                  }
                >
                  {rupiah(sisa)}
                </span>
              </div>

              <div>
                <Label htmlFor="catatan">Catatan</Label>
                <Input
                  id="catatan"
                  value={catatan}
                  onChange={(e) => setCatatan(e.target.value)}
                  placeholder="mis. noda oli di kerah"
                />
              </div>

              <Button
                type="button"
                onClick={simpanPesanan}
                disabled={pending}
                className="w-full"
                size="lg"
              >
                {pending ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Menyimpan...
                  </>
                ) : (
                  'Simpan & Cetak Nota'
                )}
              </Button>
            </div>
          </div>
        </aside>
      </div>
    </main>
  );
}

function KatalogLayanan({
  judul,
  layanan,
  onPilih,
}: {
  judul: string;
  layanan: Layanan[];
  onPilih: (id: number) => void;
}) {
  if (layanan.length === 0) return null;

  return (
    <div className="mb-4 last:mb-0">
      <p className="mb-2 text-xs font-medium uppercase tracking-wide text-gray-600 dark:text-gray-400">
        {judul}
      </p>
      <div className="grid gap-2 sm:grid-cols-2 xl:grid-cols-3">
        {layanan.map((s) => (
          <button
            key={s.id}
            type="button"
            onClick={() => onPilih(s.id)}
            className="flex items-center justify-between gap-2 rounded-lg border border-gray-300 px-3 py-2 text-left transition-colors hover:border-orange-400 hover:bg-orange-50 dark:border-zinc-600 dark:hover:border-orange-500 dark:hover:bg-zinc-800"
          >
            <span className="min-w-0">
              <span className="block truncate text-sm font-medium text-gray-900 dark:text-gray-50">
                {s.nama}
              </span>
              <span className="block text-xs text-gray-600 dark:text-gray-400">
                {rupiah(s.hargaDasar)} / {s.satuan}
              </span>
            </span>
            <Plus className="h-4 w-4 shrink-0 text-gray-600 dark:text-gray-400" />
          </button>
        ))}
      </div>
    </div>
  );
}
