import { redirect } from 'next/navigation';
import { getKonteks, getOutlets } from '@/lib/laundry/queries';
import {
  getLayananTerlaris,
  getOmzetPerOutlet,
  getPerformaKasir,
  getRingkasanLaporan,
  getSebaranStatus,
} from '@/lib/laundry/queries-fase2';
import {
  LABEL_STATUS,
  OrderStatus,
  TeamRole,
  WARNA_STATUS,
} from '@/lib/db/schema';
import { AksesDitolak } from '@/components/akses-ditolak';
import { kuantitas, rupiah, tanggal } from '@/lib/format';
import { rentangDariPreset, type Preset } from '@/lib/laundry/periode';
import { FilterLaporan } from './filter-laporan';

export default async function LaporanPage({
  searchParams,
}: {
  searchParams: Promise<{ periode?: string; dari?: string; sampai?: string; outlet?: string }>;
}) {
  const konteks = await getKonteks();
  if (!konteks) redirect('/sign-in');

  const boleh = [TeamRole.OWNER, TeamRole.MANAJER] as string[];
  if (!boleh.includes(konteks.role)) {
    return <AksesDitolak role={konteks.role} keterangan="melihat laporan" />;
  }

  const sp = await searchParams;
  const preset = (sp.periode as Preset) || 'bulan-ini';
  const { dari, sampai } = rentangDariPreset(preset, sp.dari, sp.sampai);

  const filterOutlet = konteks.outletId ?? (sp.outlet ? Number(sp.outlet) : undefined);
  const rentang = { dari, sampai, outletId: filterOutlet };

  const [ringkas, terlaris, perOutlet, kasir, sebaran, daftarOutlet] = await Promise.all([
    getRingkasanLaporan(konteks.teamId, rentang),
    getLayananTerlaris(konteks.teamId, rentang),
    getOmzetPerOutlet(konteks.teamId, rentang),
    getPerformaKasir(konteks.teamId, rentang),
    getSebaranStatus(konteks.teamId, rentang),
    getOutlets(konteks.teamId),
  ]);

  return (
    <main className="mx-auto max-w-6xl px-4 py-6 sm:px-6 lg:px-8">
      <div className="mb-1 flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-2xl font-semibold text-gray-900 dark:text-gray-50">Laporan</h1>
      </div>
      <p className="mb-6 text-sm text-gray-600 dark:text-gray-400">
        {tanggal(dari)} – {tanggal(sampai)}
      </p>

      <FilterLaporan
        preset={preset}
        dari={sp.dari ?? ''}
        sampai={sp.sampai ?? ''}
        outlets={daftarOutlet.map((o) => ({ id: o.id, nama: o.nama }))}
        outletTerpilih={filterOutlet ? String(filterOutlet) : null}
        outletTerkunci={konteks.outletId !== null}
      />

      <div className="mb-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
        <Kpi label="Omzet" nilai={rupiah(ringkas.omzet)} utama />
        <Kpi label="Jumlah Nota" nilai={String(ringkas.jumlahNota)} />
        <Kpi label="Rata-rata / Nota" nilai={rupiah(ringkas.rataRata)} />
        <Kpi label="Sudah Dibayar" nilai={rupiah(ringkas.dibayar)} />
        <Kpi
          label="Piutang"
          nilai={rupiah(ringkas.piutang)}
          peringatan={ringkas.piutang > 0}
        />
      </div>

      <p className="mb-6 rounded-lg bg-gray-50 p-3 text-xs text-gray-700 dark:bg-zinc-800 dark:text-gray-300">
        Omzet dihitung dari nilai nota yang <strong>masuk</strong> pada periode ini
        (pesanan batal tidak dihitung), bukan dari uang yang diterima. Selisihnya ada di
        kolom Piutang.
      </p>

      {ringkas.jumlahNota === 0 ? (
        <div className="rounded-lg border border-dashed border-gray-300 py-16 text-center dark:border-zinc-700">
          <p className="text-gray-700 dark:text-gray-300">
            Belum ada pesanan pada periode ini.
          </p>
          <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
            Coba pilih rentang tanggal yang lain.
          </p>
        </div>
      ) : (
        <div className="space-y-6">
          <Kartu judul="Layanan Terlaris">
            <Tabel
              kepala={['Layanan', 'Transaksi', 'Total Qty', 'Omzet']}
              rata={[false, true, true, true]}
              baris={terlaris.map((s) => [
                s.namaLayanan,
                String(Number(s.jumlahTransaksi)),
                kuantitas(Number(s.totalQty), s.satuan),
                rupiah(Number(s.omzet)),
              ])}
            />
          </Kartu>

          {perOutlet.length > 1 && (
            <Kartu judul="Per Outlet">
              <Tabel
                kepala={['Outlet', 'Nota', 'Omzet']}
                rata={[false, true, true]}
                baris={perOutlet.map((o) => [
                  o.outletNama,
                  String(Number(o.jumlahNota)),
                  rupiah(Number(o.omzet)),
                ])}
              />
            </Kartu>
          )}

          <Kartu judul="Nota Dibuat Oleh">
            <Tabel
              kepala={['Pengguna', 'Nota', 'Nilai']}
              rata={[false, true, true]}
              baris={kasir.map((k) => [
                k.nama || k.email,
                String(Number(k.jumlahNota)),
                rupiah(Number(k.omzet)),
              ])}
            />
          </Kartu>

          <Kartu judul="Status Pesanan Periode Ini">
            <div className="flex flex-wrap gap-2">
              {sebaran.map((s) => (
                <span
                  key={s.status}
                  className={`rounded-full px-3 py-1 text-sm font-medium ${
                    WARNA_STATUS[s.status as OrderStatus] ?? ''
                  }`}
                >
                  {LABEL_STATUS[s.status as OrderStatus] ?? s.status}: {Number(s.jumlah)}
                </span>
              ))}
            </div>
          </Kartu>
        </div>
      )}
    </main>
  );
}

function Kpi({
  label,
  nilai,
  utama,
  peringatan,
}: {
  label: string;
  nilai: string;
  utama?: boolean;
  peringatan?: boolean;
}) {
  return (
    <div className="rounded-lg border border-gray-200 bg-white p-4 dark:border-zinc-700 dark:bg-zinc-900">
      <p className="text-xs text-gray-600 dark:text-gray-400">{label}</p>
      <p
        className={`mt-1 font-semibold ${utama ? 'text-2xl' : 'text-lg'} ${
          peringatan
            ? 'text-red-700 dark:text-red-400'
            : 'text-gray-900 dark:text-gray-50'
        }`}
      >
        {nilai}
      </p>
    </div>
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

function Tabel({
  kepala,
  baris,
  rata,
}: {
  kepala: string[];
  baris: string[][];
  rata: boolean[];
}) {
  if (baris.length === 0) {
    return (
      <p className="py-6 text-center text-sm text-gray-600 dark:text-gray-400">
        Belum ada data.
      </p>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full min-w-[480px] text-sm">
        <thead>
          <tr className="border-b border-gray-200 text-gray-700 dark:border-zinc-700 dark:text-gray-300">
            {kepala.map((h, i) => (
              <th
                key={h}
                className={`py-2 font-medium ${rata[i] ? 'text-right' : 'text-left'}`}
              >
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-200 dark:divide-zinc-700">
          {baris.map((r, i) => (
            <tr key={i}>
              {r.map((sel, j) => (
                <td
                  key={j}
                  className={`py-2 ${rata[j] ? 'text-right' : 'text-left'} ${
                    j === 0
                      ? 'font-medium text-gray-900 dark:text-gray-50'
                      : 'text-gray-700 dark:text-gray-300'
                  }`}
                >
                  {sel}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
