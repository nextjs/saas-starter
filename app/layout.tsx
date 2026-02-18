import './globals.css';
import type { Metadata, Viewport } from 'next';
import { Manrope } from 'next/font/google';
import { getUser, getTeamForUser } from '@/lib/db/queries';
import { SWRConfig } from 'swr';
import { Suspense } from 'react';
import { cookies } from 'next/headers';

export const metadata: Metadata = {
  title: 'LyricFlow - AI Songwriting',
  description: 'The ultimate AI-powered companion for songwriters and poets.'
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
      lang="en"
      className={`bg-white dark:bg-gray-950 text-black dark:text-white ${manrope.className}`}
    >
      <body className="min-h-[100dvh] bg-gray-50">
        <Suspense fallback={children}>
          <SWRConfigWithData>{children}</SWRConfigWithData>
        </Suspense>
      </body>
    </html>
  );
}

async function SWRConfigWithData({ children }: { children: React.ReactNode }) {
  await cookies();
  const user = await getUser();
  const team = await getTeamForUser();

  return (
    <SWRConfig
      value={{
        fallback: {
          '/api/user': user,
          '/api/team': team
        }
      }}
    >
      {children}
    </SWRConfig>
  );
}
