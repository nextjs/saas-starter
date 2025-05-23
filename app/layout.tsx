import './globals.css';
// Import FontAwesome CSS for icons
import '@fortawesome/fontawesome-free/css/all.min.css';
import type { Metadata, Viewport } from 'next';
import { Inter } from 'next/font/google';
import { UserProvider } from '@/lib/auth';
import { getUser } from '@/lib/db/queries';
import SchemaOrg from './components/SchemaOrg';
import PosthogProvider from '@/components/PosthogProvider';

export const metadata: Metadata = {
  title: 'Focus your AI',
  description: 'A next-generation SaaS platform with modern UI and powerful features.',
  keywords: [
    "AI prompt engineering",
    "prompt training",
    "AI learning",
    "chatbot interaction",
    "language model training",
    "AI skill development",
    "prompt crafting",
    "artificial intelligence education",
    "machine learning communication",
    "AI conversation skills",
    "natural language processing",
    "interactive AI learning",
    "generative AI training",
    "prompt optimization",
    "AI communication techniques",
    "conversational AI",
    "AI literacy",
    "prompt design",
    "AI interaction mastery",
    "language model prompting"
  ],
  openGraph: {
    title: 'Focus your AI',
    description: 'A next-generation SaaS platform for AI prompt engineering and training',
    url: 'https://your-domain.com',
    siteName: 'Focus your AI',
    images: [
      {
        url: 'https://your-domain.com/og-image.jpg',
        width: 1200,
        height: 630,
      }
    ],
    locale: 'en_US',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Focus your AI',
    description: 'A next-generation SaaS platform for AI prompt engineering and training',
    images: ['https://your-domain.com/twitter-image.jpg'],
  },
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  minimumScale: 1,
  maximumScale: 5,
  userScalable: true,
  viewportFit: 'cover',
};

const inter = Inter({ 
  subsets: ['latin'],
  display: 'swap', // Ensure text is visible during load
  variable: '--font-inter', // Assign variable to be used in CSS
});

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const userPromise = getUser();

  return (
    <html
      lang="en"
      className={inter.variable} // Only apply the font variable to HTML
      suppressHydrationWarning
    >
      <body 
        className="min-h-[100dvh] antialiased bg-gradient-to-br from-blue-50 to-green-50 dark:from-blue-950 dark:to-green-950" 
        suppressHydrationWarning
      >
        <PosthogProvider>
          <UserProvider userPromise={userPromise}>
            {children}
          </UserProvider>
        </PosthogProvider>
        <SchemaOrg />
      </body>
    </html>
  );
}
