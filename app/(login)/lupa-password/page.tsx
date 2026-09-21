'use client';

import { useState, useTransition } from 'react';
import Link from 'next/link';
import { CircleIcon, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Pesan, type IsiPesan } from '@/components/pesan';
import { mintaResetPassword } from '@/lib/auth/reset-password';

export default function LupaPasswordPage() {
  const [pending, startTransition] = useTransition();
  const [pesan, setPesan] = useState<IsiPesan | null>(null);
  const [email, setEmail] = useState('');

  function kirim() {
    setPesan(null);
    startTransition(async () => {
      const hasil = await mintaResetPassword({ email });
      setPesan(
        hasil.error
          ? { tipe: 'error', teks: hasil.error }
          : { tipe: 'ok', teks: hasil.success! }
      );
    });
  }

  return (
    <div className="flex min-h-[100dvh] flex-col justify-center px-4 py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <div className="flex justify-center">
          <CircleIcon className="h-12 w-12 text-orange-500" />
        </div>
        <h1 className="mt-6 text-center text-3xl font-extrabold text-gray-900 dark:text-gray-50">
          Lupa password
        </h1>
        <p className="mt-2 text-center text-sm text-gray-600 dark:text-gray-400">
          Masukkan email akun Anda. Kami kirimkan tautan untuk membuat password baru.
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <Pesan isi={pesan} />

        <form
          className="space-y-4"
          onSubmit={(e) => {
            e.preventDefault();
            kirim();
          }}
        >
          <div>
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              autoComplete="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Masukkan email Anda"
            />
          </div>

          <Button type="submit" className="w-full" disabled={pending}>
            {pending ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Mengirim...
              </>
            ) : (
              'Kirim Tautan Reset'
            )}
          </Button>
        </form>

        <p className="mt-6 text-center text-sm text-gray-600 dark:text-gray-400">
          Ingat passwordnya?{' '}
          <Link
            href="/sign-in"
            className="font-medium text-orange-700 hover:underline dark:text-orange-400"
          >
            Kembali ke halaman masuk
          </Link>
        </p>
      </div>
    </div>
  );
}
