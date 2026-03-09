import './globals.css';
import type { Metadata, Viewport } from 'next';
import { Nunito, Varela_Round } from 'next/font/google';
import { cn } from '@/lib/utils';
import { getUser, getTeamForUser } from '@/lib/db/queries';
import { SWRConfig } from 'swr';

export const metadata: Metadata = {
  title: 'Deely',
  description: 'Social media strategy & content management platform.'
};

export const viewport: Viewport = {
  maximumScale: 1
};

const nunito = Nunito({ subsets: ['latin'], variable: '--font-nunito' });
const varelaRound = Varela_Round({ weight: '400', subsets: ['latin'], variable: '--font-varela' });

export default function RootLayout({
  children
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="en"
      className={cn('bg-background text-foreground', nunito.variable, varelaRound.variable, nunito.className)}
    >
      <body className="min-h-[100dvh] paper-texture">
        {/* Hidden SVG filters for hand-drawn effect */}
        <svg style={{ position: 'absolute', width: 0, height: 0 }} aria-hidden="true">
          <filter id="sketchy">
            <feTurbulence type="turbulence" baseFrequency="0.02" numOctaves={3} result="noise" seed={2} />
            <feDisplacementMap in="SourceGraphic" in2="noise" scale={2} xChannelSelector="R" yChannelSelector="G" />
          </filter>
          <filter id="sketchy-strong">
            <feTurbulence type="turbulence" baseFrequency="0.03" numOctaves={4} result="noise" seed={5} />
            <feDisplacementMap in="SourceGraphic" in2="noise" scale={3} xChannelSelector="R" yChannelSelector="G" />
          </filter>
        </svg>
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
