import './globals.css'
import type { Metadata, Viewport } from 'next'
import { Manrope } from 'next/font/google'
import { UserProvider } from '@/lib/auth'
import { getTeamForUser, getUser } from '@/lib/db/queries'
import { FlowgladProvider } from '@flowglad/nextjs'

export const metadata: Metadata = {
  title: 'Next.js SaaS Starter',
  description:
    'Get started quickly with Next.js, Postgres, and Flowglad.',
}

export const viewport: Viewport = {
  maximumScale: 1,
}

const manrope = Manrope({ subsets: ['latin'] })

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  let userPromise = getUser()
  const user = await userPromise
  const teamId = user ? await getTeamForUser(user.id) : null
  return (
    <html
      lang="en"
      className={`bg-white dark:bg-gray-950 text-black dark:text-white ${manrope.className}`}
    >
      <body className="min-h-[100dvh] bg-gray-50">
        <UserProvider userPromise={userPromise}>
          <FlowgladProvider loadBilling={!!teamId}>
            {children}
          </FlowgladProvider>
        </UserProvider>
      </body>
    </html>
  )
}
