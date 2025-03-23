'use client';

import Link from 'next/link';
import Image from 'next/image';
import { use, useState, Suspense, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Home, LogOut } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger
} from '@/components/ui/dropdown-menu';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useUser } from '@/lib/auth';
import { signOut } from '@/app/(login)/actions';
import { useRouter } from 'next/navigation';
import { Sidebar } from '@/components/dashboards/Sidebar';

// Client-only component wrapper to prevent hydration errors
function ClientOnly({ children }: { children: React.ReactNode }) {
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  if (!isMounted) {
    return <div className="h-9" />; // Placeholder with same height
  }

  return <>{children}</>;
}

function UserMenu() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { userPromise } = useUser();
  const user = use(userPromise);
  const router = useRouter();

  async function handleSignOut() {
    await signOut();
    router.refresh();
    router.push('/');
  }

  if (!user) {
    return (
      <>
        <Link
          href="/pricing"
          className="text-sm font-medium text-gray-700 hover:text-gray-900"
        >
          Pricing
        </Link>
        <Button
          asChild
          className="bg-black hover:bg-gray-800 text-white text-sm px-4 py-2 rounded-full"
        >
          <Link href="/sign-up">Sign Up</Link>
        </Button>
      </>
    );
  }

  return (
    <DropdownMenu open={isMenuOpen} onOpenChange={setIsMenuOpen}>
      <DropdownMenuTrigger>
        <Avatar className="cursor-pointer size-9">
          <AvatarImage alt={user.name || ''} />
          <AvatarFallback>
            {user.email
              ?.split(' ')
              .map((n: string) => n[0])
              .join('') || ''}
          </AvatarFallback>
        </Avatar>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="flex flex-col gap-1">
        <DropdownMenuItem className="cursor-pointer">
          <Link href="/dashboard" className="flex w-full items-center">
            <Home className="mr-2 h-4 w-4" />
            <span>Dashboard</span>
          </Link>
        </DropdownMenuItem>
        <form action={handleSignOut} className="w-full">
          <button type="submit" className="flex w-full">
            <DropdownMenuItem className="w-full flex-1 cursor-pointer">
              <LogOut className="mr-2 h-4 w-4" />
              <span>Sign out</span>
            </DropdownMenuItem>
          </button>
        </form>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

function Header() {
  return (
    <header className="bg-white border-b border-gray-200 z-50 fixed top-0 left-0 right-0 w-full">
      <div className="w-full flex justify-between items-center">
        <Link href="/" className="flex items-center pl-4 py-4">
          <div style={{ position: 'relative', width: '160px', height: '40px' }}>
            <Image
              src="/logo.png"
              alt="ClinicDesk Logo"
              fill
              sizes="160px"
              style={{ objectFit: 'contain', objectPosition: 'left' }}
              priority
            />
          </div>
          <span className="ml-2 text-xl font-semibold text-gray-900"></span>
        </Link>
        <div className="flex items-center space-x-4 pr-4 py-4">
          <Suspense fallback={<div className="h-9" />}>
            <ClientOnly>
              <UserMenu />
            </ClientOnly>
          </Suspense>
        </div>
      </div>
    </header>
  );
}

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <section className="flex flex-col min-h-screen">
      <Header />
      {/* Add a spacer div to prevent content from being hidden under the fixed header */}
      <div className="h-[60px]"></div>
      <div className="flex flex-1 pt-0 relative">
        <Sidebar />
        <div className="flex-1 lg:ml-64">
          {children}
        </div>
      </div>
    </section>
  );
}
