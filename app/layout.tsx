import './globals.css';
import type { Metadata, Viewport } from 'next';
import { Manrope } from 'next/font/google';
import { getUser, getTeamForUser } from '@/lib/db/queries';
import { SWRConfig } from 'swr';
import { ThemeScript } from '@/components/theme-script';

export const metadata: Metadata = {
  title: 'LaundryKu - Manajemen Laundry',
  description: 'Kelola outlet, pelanggan, layanan, dan pesanan laundry dalam satu aplikasi.'
};

export const viewport: Viewport = {
  maximumScale: 1
};

const manrope = Manrope({ subsets: ['latin'] });

export default function RootLayout({
  children
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="id"
      className={`bg-white dark:bg-gray-950 text-black dark:text-white ${manrope.className}`}
      suppressHydrationWarning
    >
      <body className="min-h-[100dvh] bg-gray-50 dark:bg-zinc-950">
        {/*
          Harus jalan sebelum React hydrate, kalau tidak layar berkedip putih
          di mode gelap. Sengaja TIDAK dibungkus <head> manual: di App Router
          Next mengelola <head> sendiri, dan menyisipkannya sendiri mengganggu
          skrip streaming yang menyelesaikan promise SWRConfig di klien.
        */}
        <ThemeScript />
        <SWRConfig
          value={{
            fallback: {
              // We do NOT await here
              // Only components that read this data will suspend
              '/api/user': getUser(),
              '/api/team': getTeamForUser()
            }
          }}
        >
          {children}
        </SWRConfig>
      </body>
    </html>
  );
}
