'use client';

import { useState, useTransition } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Pesan, type IsiPesan } from '@/components/pesan';
import { gantiPasswordDenganToken } from '@/lib/auth/reset-password';

export function ResetClient({ token }: { token: string }) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [pesan, setPesan] = useState<IsiPesan | null>(null);
  const [berhasil, setBerhasil] = useState(false);
  const [form, setForm] = useState({ password: '', konfirmasi: '' });

  function simpan() {
    setPesan(null);
    startTransition(async () => {
      const hasil = await gantiPasswordDenganToken({ token, ...form });
      if (hasil.error) {
        setPesan({ tipe: 'error', teks: hasil.error });
        return;
      }
      setBerhasil(true);
      setPesan({ tipe: 'ok', teks: hasil.success! });
      // Beri jeda supaya pesannya sempat terbaca sebelum pindah halaman.
      setTimeout(() => router.push('/sign-in'), 1800);
    });
  }

  return (
    <>
      <Pesan isi={pesan} />

      {!berhasil && (
        <form
          className="space-y-4"
          onSubmit={(e) => {
            e.preventDefault();
            simpan();
          }}
        >
          <div>
            <Label htmlFor="password">Password baru</Label>
            <Input
              id="password"
              type="password"
              autoComplete="new-password"
              required
              minLength={8}
              value={form.password}
              onChange={(e) => setForm((f) => ({ ...f, password: e.target.value }))}
              placeholder="Minimal 8 karakter"
            />
          </div>

          <div>
            <Label htmlFor="konfirmasi">Ulangi password baru</Label>
            <Input
              id="konfirmasi"
              type="password"
              autoComplete="new-password"
              required
              minLength={8}
              value={form.konfirmasi}
              onChange={(e) => setForm((f) => ({ ...f, konfirmasi: e.target.value }))}
              placeholder="Ketik ulang password"
            />
          </div>

          <Button type="submit" className="w-full" disabled={pending}>
            {pending ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Menyimpan...
              </>
            ) : (
              'Simpan Password Baru'
            )}
          </Button>
        </form>
      )}

      <p className="mt-6 text-center text-sm text-gray-600 dark:text-gray-400">
        <Link
          href="/sign-in"
          className="font-medium text-orange-700 hover:underline dark:text-orange-400"
        >
          Kembali ke halaman masuk
        </Link>
      </p>
    </>
  );
}
