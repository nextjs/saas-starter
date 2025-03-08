import './globals.css';
import type { Metadata, Viewport } from 'next';
import { Inter } from 'next/font/google';
import { UserProvider } from '@/lib/auth';
import { getUser } from '@/lib/db/queries';
import { ThemeProvider } from "@/components/theme-provider";
import { Toaster } from "@/components/ui/sonner";

export const metadata: Metadata = {
  title: 'AI SaaS Starter',
  description: 'A starter template for AI SaaS applications',
};

export const viewport: Viewport = {
  maximumScale: 1,
};

const inter = Inter({ subsets: ['latin'] });

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  let userPromise = getUser();

  return (
    <html
      lang="en"
      className={`bg-white dark:bg-gray-950 text-black dark:text-white ${inter.className}`}
      suppressHydrationWarning
    >
      <body className="min-h-[100dvh] bg-gray-50">
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <UserProvider userPromise={userPromise}>
            {children}
            <Toaster 
              position="top-right"
              closeButton={true}
            />
          </UserProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
