//<file path="app/layout.tsx">
import './globals.css';
import type { Metadata, Viewport } from 'next';
import { Manrope } from 'next/font/google';
import { getUser, getTeamsForUser } from '@/lib/db/queries';
import { SWRConfig } from 'swr';
import { ThemeProvider } from '@/components/theme-provider';

export const metadata: Metadata = {
    title: 'Next.js SaaS Starter',
    description: 'Get started quickly with Next.js, Postgres, and Stripe.'
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
                        // We do NOT await here
                        // Only components that read this data will suspend
                        '/api/user': getUser(),
                        '/api/team': getTeamsForUser()
                    }
                }}
            >
                {children}
            </SWRConfig>
        </ThemeProvider>
        </body>
        </html>
    );
}