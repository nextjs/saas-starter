'use client';

import Link from 'next/link';
import { use, useState, Suspense, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Music2, LogOut, LayoutDashboard, Library, User, Menu, X } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger
} from '@/components/ui/dropdown-menu';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { signOut } from '@/app/(login)/actions';
import { useRouter, usePathname } from 'next/navigation';
import { User as UserType } from '@/lib/db/schema';
import useSWR, { mutate } from 'swr';
import { cn } from '@/lib/utils';

const fetcher = (url: string) => fetch(url).then((res) => res.json());

function NavItem({ href, icon: Icon, label, active }: { href: string, icon: any, label: string, active: boolean }) {
  return (
    <Link
      href={href}
      className={cn(
        "flex items-center gap-3 px-4 py-2 rounded-xl transition-all font-black tracking-widest text-[10px] uppercase",
        active ? "bg-[#5850ec]/10 text-[#5850ec] border border-[#5850ec]/20" : "text-zinc-600 hover:text-white"
      )}
    >
      <Icon className="size-4" />
      {label}
    </Link>
  );
}

function UserMenu() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { data: user } = useSWR<UserType>('/api/user', fetcher);
  const router = useRouter();

  async function handleSignOut() {
    await signOut();
    mutate('/api/user');
    router.push('/');
  }

  if (!user) {
    return (
      <div className="flex items-center gap-4">
        <Link
          href="/pricing"
          className="text-[10px] font-black tracking-widest text-zinc-600 hover:text-white uppercase transition-colors"
        >
          PRICING
        </Link>
        <Button asChild className="rounded-xl bg-[#5850ec] text-white hover:bg-[#5850ec]/90 font-black tracking-widest text-[10px] uppercase h-10 px-6">
          <Link href="/sign-up">JOIN NOW</Link>
        </Button>
      </div>
    );
  }

  return (
    <DropdownMenu open={isMenuOpen} onOpenChange={setIsMenuOpen}>
      <DropdownMenuTrigger className="focus:outline-none">
        <Avatar className="cursor-pointer size-10 border-2 border-zinc-900 hover:border-[#5850ec] transition-colors">
          <AvatarImage alt={user.name || ''} />
          <AvatarFallback className="bg-zinc-900 text-[#5850ec] font-black uppercase text-xs">
            {user.email?.[0] || 'U'}
          </AvatarFallback>
        </Avatar>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56 bg-[#0c0c14] border-2 border-zinc-900 text-white rounded-2xl p-2 shadow-2xl">
        <div className="px-4 py-3 border-b border-zinc-900 mb-2">
           <p className="text-[9px] font-black text-zinc-600 tracking-widest uppercase">LOGGED IN AS</p>
           <p className="text-xs font-black truncate">{user.email}</p>
        </div>
        <DropdownMenuItem asChild className="cursor-pointer rounded-xl hover:bg-zinc-900 focus:bg-zinc-900 py-3">
          <Link href="/dashboard/activity" className="flex w-full items-center">
            <User className="mr-3 h-4 w-4 text-[#5850ec]" />
            <span className="text-[10px] font-black tracking-widest uppercase">Profile Settings</span>
          </Link>
        </DropdownMenuItem>
        <form action={handleSignOut} className="w-full">
          <button type="submit" className="w-full">
            <DropdownMenuItem className="cursor-pointer rounded-xl hover:bg-rose-500/10 focus:bg-rose-500/10 py-3 text-rose-500">
              <LogOut className="mr-3 h-4 w-4" />
              <span className="text-[10px] font-black tracking-widest uppercase">Terminate Session</span>
            </DropdownMenuItem>
          </button>
        </form>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

function NavLinks() {
  const pathname = usePathname();
  return (
    <nav className="hidden lg:flex items-center gap-2">
      <NavItem href="/dashboard" icon={LayoutDashboard} label="STUDIO" active={pathname === '/dashboard'} />
      <NavItem href="/dashboard/library" icon={Library} label="LIBRARY" active={pathname === '/dashboard/library'} />
    </nav>
  );
}

function Header() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 border-b border-zinc-900 bg-[#050508]/80 backdrop-blur-xl">
      <div className="max-w-7xl mx-auto px-6 py-5 flex justify-between items-center">
        <div className="flex items-center gap-10">
          <Link href="/" className="flex items-center group">
            <div className="p-1.5 bg-[#5850ec] rounded-lg group-hover:rotate-12 transition-transform">
              <Music2 className="h-5 w-5 text-white" />
            </div>
            <span className="ml-3 text-xl font-black tracking-[-0.05em] text-white uppercase italic">LyricFlow</span>
          </Link>

          <Suspense fallback={<div className="h-10 w-40 bg-zinc-900 rounded-xl animate-pulse hidden lg:block" />}>
            <NavLinks />
          </Suspense>
        </div>

        <div className="flex items-center gap-6">
          <Suspense fallback={<div className="h-10 w-10 bg-zinc-900 rounded-full animate-pulse" />}>
            <UserMenu />
          </Suspense>
          <button
            className="lg:hidden p-2 text-zinc-400 hover:text-white"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          >
            {isMobileMenuOpen ? <X className="size-6" /> : <Menu className="size-6" />}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      {isMobileMenuOpen && (
        <div className="lg:hidden fixed inset-0 top-[73px] z-50 bg-[#050508] p-6 animate-in slide-in-from-right duration-300">
           <nav className="flex flex-col gap-4">
              <Link
                href="/dashboard"
                onClick={() => setIsMobileMenuOpen(false)}
                className="flex items-center justify-between p-6 rounded-2xl bg-zinc-900 border border-zinc-800"
              >
                <div className="flex items-center gap-4">
                  <LayoutDashboard className="size-6 text-[#5850ec]" />
                  <span className="font-black tracking-widest uppercase italic">STUDIO DASHBOARD</span>
                </div>
              </Link>
              <Link
                href="/dashboard/library"
                onClick={() => setIsMobileMenuOpen(false)}
                className="flex items-center justify-between p-6 rounded-2xl bg-zinc-900 border border-zinc-800"
              >
                <div className="flex items-center gap-4">
                  <Library className="size-6 text-emerald-500" />
                  <span className="font-black tracking-widest uppercase italic">MY LIBRARY</span>
                </div>
              </Link>
           </nav>
        </div>
      )}
    </header>
  );
}

function MobileTabBar() {
  const pathname = usePathname();
  return (
    <footer className="lg:hidden fixed bottom-0 left-0 right-0 z-50 bg-[#050508]/80 backdrop-blur-xl border-t border-zinc-900 px-6 py-4">
       <div className="flex items-center justify-around">
          <Link href="/dashboard" className={cn("flex flex-col items-center gap-1", pathname === '/dashboard' ? "text-[#5850ec]" : "text-white opacity-40")}>
             <LayoutDashboard className="size-6" />
             <span className="text-[8px] font-black tracking-widest">STUDIO</span>
          </Link>
          <Link href="/dashboard/library" className={cn("flex flex-col items-center gap-1", pathname === '/dashboard/library' ? "text-emerald-500" : "text-white opacity-40")}>
             <Library className="size-6" />
             <span className="text-[8px] font-black tracking-widest">LIBRARY</span>
          </Link>
          <Link href="/dashboard/activity" className={cn("flex flex-col items-center gap-1", pathname === '/dashboard/activity' ? "text-gold" : "text-white opacity-40")}>
             <User className="size-6" />
             <span className="text-[8px] font-black tracking-widest">PROFILE</span>
          </Link>
       </div>
    </footer>
  );
}

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <section className="flex flex-col min-h-screen bg-[#050508] text-white selection:bg-[#5850ec] selection:text-white">
      <Header />
      <Suspense fallback={null}>
        <main className="flex-1">
          {children}
        </main>
      </Suspense>

      <Suspense fallback={null}>
        <MobileTabBar />
      </Suspense>
    </section>
  );
}
