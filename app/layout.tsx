import './globals.css';
import type { Metadata, Viewport } from 'next';
import { Manrope } from 'next/font/google';
import { getUser, getTeamForUser } from '@/lib/db/queries';
import { SWRConfig } from 'swr';
import { ThemeProvider } from '@/components/theme-provider';
import { Toaster } from '@/components/ui/sonner';

export const metadata: Metadata = {
  title: 'MCP.Day - Ship your MCP SaaS in one day',
  description: 'Build your MCP SaaS app with Next.js, Postgres and Stripe in one day'
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
      className={`${manrope.className}`}
      suppressHydrationWarning
    >
      <body className="min-h-[100dvh]">
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <SWRConfig
            value={{
              fallback: {
                '/api/user': getUser(),
                '/api/team': getTeamForUser()
              }
            }}
          >
            <main className="flex-1">
              {children}
            </main>
            <Toaster />
          </SWRConfig>
        </ThemeProvider>
      </body>
    </html>
  );
}
