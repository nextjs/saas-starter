import Link from 'next/link';
import { Button } from '@/components/ui/button';
import {
  ArrowRight,
  BarChart3,
  LayoutGrid,
  MessageCircle,
  Printer,
  Store,
} from 'lucide-react';
import { HARI_TRIAL } from '@/lib/laundry/enums';

const FITUR = [
  {
    icon: Store,
    judul: 'POS Kasir & Multi-Outlet',
    isi: 'Input cucian kiloan atau satuan, hitung otomatis termasuk minimum charge dan tarif express. Satu akun untuk semua cabang.',
  },
  {
    icon: Printer,
    judul: 'Nota Thermal',
    isi: 'Cetak langsung ke printer 58 mm atau 80 mm. Nomor nota berurutan per outlet, siap ditempel di cucian.',
  },
  {
    icon: LayoutGrid,
    judul: 'Papan Antrian Produksi',
    isi: 'Karyawan melihat semua cucian yang sedang dikerjakan dalam satu layar, dan memajukan statusnya lewat satu ketukan.',
  },
  {
    icon: MessageCircle,
    judul: 'Notifikasi WhatsApp',
    isi: 'Pelanggan otomatis dikabari begitu cucian siap diambil. Isi pesannya bisa Anda tulis sendiri.',
  },
  {
    icon: BarChart3,
    judul: 'Laporan & Piutang',
    isi: 'Omzet harian, layanan terlaris, dan sisa tagihan yang belum dibayar — per outlet maupun gabungan.',
  },
];

export default function HomePage() {
  return (
    <main>
      <section className="py-20">
        <div className="mx-auto max-w-3xl px-4 text-center sm:px-6 lg:px-8">
          <h1 className="text-4xl font-bold tracking-tight text-gray-900 dark:text-gray-50 sm:text-5xl md:text-6xl">
            Kelola Laundry Anda
            <span className="block text-orange-500">Tanpa Buku Tulis Lagi</span>
          </h1>
          <p className="mt-4 text-base text-gray-700 dark:text-gray-300 sm:text-xl">
            Catat pesanan, cetak nota, pantau antrian, dan kabari pelanggan lewat
            WhatsApp — semuanya dari satu aplikasi. Dibuat untuk laundry Indonesia.
          </p>
          <div className="mt-8 flex flex-wrap justify-center gap-3">
            <Button asChild size="lg" className="rounded-full text-lg">
              <Link href="/sign-up">
                Coba Gratis {HARI_TRIAL} Hari
                <ArrowRight className="ml-2 h-5 w-5" />
              </Link>
            </Button>
            <Button asChild size="lg" variant="outline" className="rounded-full text-lg">
              <Link href="/pricing">Lihat Harga</Link>
            </Button>
          </div>
          <p className="mt-3 text-sm text-gray-600 dark:text-gray-400">
            Tanpa kartu kredit. Bisa dipakai dari HP kasir.
          </p>
        </div>
      </section>

      <section className="bg-white py-16 dark:bg-zinc-900">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
            {FITUR.map(({ icon: Icon, judul, isi }) => (
              <div key={judul}>
                <div className="flex h-12 w-12 items-center justify-center rounded-md bg-orange-500 text-white">
                  <Icon className="h-6 w-6" />
                </div>
                <h2 className="mt-4 text-lg font-medium text-gray-900 dark:text-gray-50">
                  {judul}
                </h2>
                <p className="mt-2 text-gray-700 dark:text-gray-300">{isi}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-16">
        <div className="mx-auto max-w-3xl px-4 text-center sm:px-6 lg:px-8">
          <h2 className="text-3xl font-semibold text-gray-900 dark:text-gray-50">
            Siap mulai hari ini?
          </h2>
          <p className="mt-3 text-gray-700 dark:text-gray-300">
            Daftar, isi outlet dan layanan Anda dalam dua langkah, lalu kasir sudah bisa
            menerima cucian.
          </p>
          <Button asChild size="lg" className="mt-6 rounded-full text-lg">
            <Link href="/sign-up">
              Buat Akun
              <ArrowRight className="ml-2 h-5 w-5" />
            </Link>
          </Button>
        </div>
      </section>
    </main>
  );
}
