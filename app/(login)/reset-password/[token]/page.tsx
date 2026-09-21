import Link from 'next/link';
import { CircleIcon } from 'lucide-react';
import { tokenResetValid } from '@/lib/auth/reset-password';
import { ResetClient } from './reset-client';

export default async function ResetPasswordPage({
  params,
}: {
  params: Promise<{ token: string }>;
}) {
  const { token } = await params;
  const valid = await tokenResetValid(token);

  return (
    <div className="flex min-h-[100dvh] flex-col justify-center px-4 py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <div className="flex justify-center">
          <CircleIcon className="h-12 w-12 text-orange-500" />
        </div>
        <h1 className="mt-6 text-center text-3xl font-extrabold text-gray-900 dark:text-gray-50">
          Buat password baru
        </h1>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        {valid ? (
          <ResetClient token={token} />
        ) : (
          <>
            {/*
              Sengaja tidak menjelaskan apakah tokennya salah, kedaluwarsa, atau
              sudah dipakai — ketiganya sama-sama tidak bisa dipakai, dan
              membedakannya hanya memberi petunjuk bagi yang mencoba menebak.
            */}
            <div className="rounded-lg border border-red-300 bg-red-50 px-4 py-3 text-sm text-red-900 dark:border-red-900 dark:bg-red-950 dark:text-red-100">
              Tautan ini sudah tidak berlaku. Tautan reset hanya berlaku sebentar dan
              hanya bisa dipakai satu kali.
            </div>
            <Link
              href="/lupa-password"
              className="mt-4 block text-center text-sm font-medium text-orange-700 hover:underline dark:text-orange-400"
            >
              Minta tautan baru
            </Link>
          </>
        )}
      </div>
    </div>
  );
}
