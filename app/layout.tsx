import './globals.css';
import type { Metadata, Viewport } from 'next';
import { Manrope } from 'next/font/google';
import { UserProvider } from '@/lib/auth';
import { getUser } from '@/lib/db/queries';
import { cookies } from 'next/headers';
import Script from 'next/script';

export const metadata: Metadata = {
  title: 'Next.js SaaS Starter',
  description: 'Get started quickly with Next.js, Postgres, and Stripe.',
};

export const viewport: Viewport = {
  maximumScale: 1,
};

const manrope = Manrope({ subsets: ['latin'] });

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Get the stored theme from cookies
  const cookieStore = await cookies();
  const storedTheme = cookieStore.get('next-sass-starter-theme')?.value;
  const userPromise = getUser();
  const isDark = storedTheme === 'dark';

  return (
    <html lang="en" className={`${manrope.className} ${isDark ? 'dark' : ''}`}>
      <head>
        {/* This script will run before React hydration */}
        <Script
          id="theme-script"
          strategy="beforeInteractive"
          dangerouslySetInnerHTML={{
            __html: `
              (function() {
                  // If there's no stored theme, check system preference.
                  if (!document.documentElement.classList.contains('dark')) {
                    var storedTheme = localStorage.getItem('next-sass-starter-theme');
                    if (storedTheme === 'dark' || (!storedTheme && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
                      document.documentElement.classList.add('dark');
                      document.documentElement.style.setProperty('color-scheme', 'dark');
                    }
                  }
              })();
            `,
          }}
        />
      </head>
      <body className="min-h-[100dvh] bg-gray-50 dark:bg-gray-900">
        <UserProvider userPromise={userPromise}>{children}</UserProvider>
      </body>
    </html>
  );
}