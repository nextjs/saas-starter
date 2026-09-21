'use client';

import { useState, useTransition } from 'react';
import useSWR from 'swr';
import { Loader2, MailX, Send } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Pesan, type IsiPesan } from '@/components/pesan';
import { tanggalJam } from '@/lib/format';
import { batalkanUndangan, kirimUlangUndangan } from '@/lib/auth/undangan';

type Baris = {
  id: number;
  email: string;
  role: string;
  invitedAt: string;
  olehNama: string | null;
  olehEmail: string;
};

const fetcher = (url: string) => fetch(url).then((r) => r.json());

/**
 * Daftar orang yang sudah diundang tapi belum bergabung.
 *
 * Sebelum Fase 4 informasi ini tidak terlihat sama sekali: undangan masuk ke
 * database dan menghilang dari pandangan pemilik, padahal ikut memakan kuota
 * pengguna.
 */
export function UndanganTertunda() {
  const { data, mutate } = useSWR<Baris[]>('/api/invitations', fetcher);
  const [pending, startTransition] = useTransition();
  const [pesan, setPesan] = useState<IsiPesan | null>(null);
  const [sedang, setSedang] = useState<number | null>(null);

  function jalankan(id: number, aksi: 'kirim' | 'batal') {
    setPesan(null);
    setSedang(id);
    startTransition(async () => {
      const hasil =
        aksi === 'kirim' ? await kirimUlangUndangan(id) : await batalkanUndangan(id);
      setSedang(null);
      setPesan(
        hasil.error
          ? { tipe: 'error', teks: hasil.error }
          : { tipe: 'ok', teks: hasil.success! }
      );
      mutate();
    });
  }

  // Kartu disembunyikan kalau tidak ada undangan tertunda — tidak ada gunanya
  // menampilkan tabel kosong permanen di halaman yang sudah padat.
  if (!data || data.length === 0) return null;

  return (
    <Card className="mb-8">
      <CardHeader>
        <CardTitle>Undangan Belum Diterima</CardTitle>
      </CardHeader>
      <CardContent>
        <Pesan isi={pesan} />

        <ul className="divide-y divide-gray-200 dark:divide-zinc-700">
          {data.map((u) => {
            const sibuk = pending && sedang === u.id;
            return (
              <li
                key={u.id}
                className="flex flex-wrap items-center justify-between gap-3 py-3"
              >
                <div className="min-w-0">
                  <p className="truncate font-medium text-gray-900 dark:text-gray-50">
                    {u.email}
                  </p>
                  <p className="text-xs text-gray-600 dark:text-gray-400">
                    {u.role} · diundang {tanggalJam(u.invitedAt)} oleh{' '}
                    {u.olehNama || u.olehEmail}
                  </p>
                </div>

                <div className="flex gap-1">
                  <button
                    type="button"
                    disabled={sibuk}
                    onClick={() => jalankan(u.id, 'kirim')}
                    className="inline-flex items-center gap-1 rounded border border-gray-300 px-2.5 py-1.5 text-xs font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 dark:border-zinc-600 dark:text-gray-300 dark:hover:bg-zinc-800"
                  >
                    {sibuk ? (
                      <Loader2 className="h-3.5 w-3.5 animate-spin" />
                    ) : (
                      <Send className="h-3.5 w-3.5" />
                    )}
                    Kirim ulang
                  </button>
                  <button
                    type="button"
                    disabled={sibuk}
                    onClick={() => jalankan(u.id, 'batal')}
                    className="inline-flex items-center gap-1 rounded border border-gray-300 px-2.5 py-1.5 text-xs font-medium text-red-700 hover:bg-red-50 disabled:opacity-50 dark:border-zinc-600 dark:text-red-400 dark:hover:bg-red-950"
                  >
                    <MailX className="h-3.5 w-3.5" />
                    Batalkan
                  </button>
                </div>
              </li>
            );
          })}
        </ul>
      </CardContent>
    </Card>
  );
}
