import './globals.css';
import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import { Toaster } from '@/components/ui/sonner';
import { ThemeProvider } from '@/components/theme-provider';
import { AuthProvider } from '@/lib/auth';

export const metadata: Metadata = {
  title: 'AI SaaS Starter',
  description: 'Next.js SaaS starter template with Supabase Auth and Stripe'
};

const inter = Inter({ subsets: ['latin'] });

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        {process.env.NODE_ENV === 'development' && (
          <meta httpEquiv="Content-Security-Policy" content="default-src 'self' 'unsafe-inline' 'unsafe-eval' blob: data: https://*.supabase.co wss://*.supabase.co; connect-src 'self' https://*.supabase.co wss://*.supabase.co; script-src 'self' 'unsafe-inline' 'unsafe-eval' https://*.supabase.co; style-src 'self' 'unsafe-inline'; img-src 'self' blob: data: https://*.supabase.co; font-src 'self' data:; frame-src 'self' https://*.supabase.co;" />
        )}
      </head>
      <body className={inter.className}>
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <AuthProvider>
            {children}
            <Toaster />
          </AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
