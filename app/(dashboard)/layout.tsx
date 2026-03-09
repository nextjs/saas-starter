'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useState, Suspense } from 'react';
import {
  Brain,
  Zap,
  Calendar,
  Eye,
  BarChart3,
  Settings,
  LogOut,
  PanelLeft,
  PanelLeftClose,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Sheet, SheetContent, SheetTitle } from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { IdentitySwitcher } from '@/components/identity-switcher';
import { signOut } from '@/app/(login)/actions';
import { User } from '@/lib/db/schema';
import useSWR, { mutate } from 'swr';

const fetcher = (url: string) => fetch(url).then((res) => res.json());

function SketchyDivider() {
  return (
    <svg width="100%" height="12" viewBox="0 0 400 12" preserveAspectRatio="none" className="my-3 text-[#d4c9b8]">
      <path d="M0,6 C30,2 60,10 100,6 C140,2 170,10 200,6 C230,2 260,10 300,6 C330,2 360,10 400,6"
        stroke="currentColor" strokeWidth="2" fill="none" strokeDasharray="6,4" strokeLinecap="round"/>
    </svg>
  );
}

const navItems = [
  { href: '/brain', icon: Brain, label: 'Brain' },
  { href: '/flow', icon: Zap, label: 'Flow' },
  { href: '/calendar', icon: Calendar, label: 'Calendar' },
  { href: '/monitor', icon: Eye, label: 'Monitor' },
  { href: '/pulse', icon: BarChart3, label: 'Pulse' },
  { href: '/settings', icon: Settings, label: 'Settings' },
];

function UserMenu() {
  const { data: user } = useSWR<User>('/api/user', fetcher);
  const router = useRouter();

  async function handleSignOut() {
    await signOut();
    mutate('/api/user');
    router.push('/');
  }

  if (!user) return null;

  return (
    <DropdownMenu>
      <DropdownMenuTrigger className="flex w-full items-center gap-2 rounded-xl px-2 py-1.5 text-left text-sm hover:bg-[#ebe5d9] outline-none cursor-pointer transition-colors">
        <Avatar className="h-6 w-6">
          <AvatarImage alt={user.name || ''} />
          <AvatarFallback className="text-[10px] bg-[#e07a5f]/15 text-[#e07a5f]">
            {(user.name || user.email)
              .split(' ')
              .map((n) => n[0])
              .join('')
              .toUpperCase()}
          </AvatarFallback>
        </Avatar>
        <span className="flex-1 truncate text-sm text-[#5c4b3a]">{user.name || user.email}</span>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start" className="w-[200px] border-dashed border-2 border-[#d4c9b8] bg-[#faf8f5]">
        <DropdownMenuItem className="cursor-pointer text-[#5c4b3a]" onClick={handleSignOut}>
          <LogOut className="mr-2 h-4 w-4" strokeWidth={1.75} />
          Sign out
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

function NavLinks({ onNavigate }: { onNavigate?: () => void }) {
  const pathname = usePathname();

  return (
    <nav className="flex flex-col gap-0.5 px-1">
      {navItems.map((item) => {
        const isActive = pathname === item.href;
        return (
          <Link
            key={item.href}
            href={item.href}
            onClick={onNavigate}
            className={cn(
              'flex items-center gap-3 px-3 py-2.5 text-sm font-semibold transition-all duration-200',
              isActive
                ? 'notebook-tab-active text-[#e07a5f]'
                : 'rounded-xl text-[#5c4b3a]/70 hover:bg-[#ebe5d9] hover:text-[#5c4b3a]'
            )}
          >
            <item.icon className="h-4 w-4" strokeWidth={1.75} />
            {item.label}
          </Link>
        );
      })}
    </nav>
  );
}

function SpiralBinding() {
  return (
    <div className="flex justify-center gap-[18px] py-1.5 overflow-hidden" aria-hidden="true">
      {Array.from({ length: 8 }, (_, i) => (
        <svg key={i} width="16" height="20" viewBox="0 0 16 20" fill="none">
          <ellipse cx="8" cy="10" rx="5" ry="8" stroke="#c4b9a8" strokeWidth="1.5" fill="none" />
          <ellipse cx="8" cy="10" rx="3" ry="5.5" stroke="#d4c9b8" strokeWidth="0.8" fill="none" strokeDasharray="2,2" />
        </svg>
      ))}
    </div>
  );
}

function PencilIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" className="text-[#5c4b3a]/40">
      <path d="M2,14 L3,10 L11,2 L14,5 L6,13 Z" stroke="currentColor" strokeWidth="1.2" fill="none" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M3,10 L6,13" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" />
      <path d="M2,14 L3,10" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" />
      <line x1="11" y1="2" x2="14" y2="5" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" />
    </svg>
  );
}

function HolePunchDots() {
  return (
    <div className="absolute top-12 left-2 flex flex-col gap-[80px]" aria-hidden="true">
      {Array.from({ length: 4 }, (_, i) => (
        <div key={i} className="w-[10px] h-[10px] rounded-full bg-[#ebe5d9] border-[1.5px] border-[#d4c9b8]" />
      ))}
    </div>
  );
}

function SidebarContent({ onNavigate }: { onNavigate?: () => void }) {
  return (
    <div className="relative flex h-full flex-col paper-texture">
      <SpiralBinding />
      <div className="px-2 py-2">
        <IdentitySwitcher />
      </div>
      <SketchyDivider />
      <div className="flex-1 overflow-y-auto py-1">
        <NavLinks onNavigate={onNavigate} />
      </div>
      <SketchyDivider />
      <div className="px-2 py-2 flex items-center gap-2">
        <div className="flex-1">
          <Suspense fallback={<div className="h-9" />}>
            <UserMenu />
          </Suspense>
        </div>
        <PencilIcon />
      </div>
    </div>
  );
}

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <div className="flex h-[100dvh] overflow-hidden bg-[#f3ece0]">
      {/* Desktop sidebar - notebook edge */}
      <aside className="relative hidden md:flex w-60 shrink-0 flex-col border-r-2 border-dashed border-[#d4c9b8] bg-[#ede4d4]">
        <HolePunchDots />
        <SidebarContent />
      </aside>

      {/* Mobile sheet sidebar */}
      <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
        <SheetContent side="left" className="w-60 p-0 bg-[#ede4d4] border-r-2 border-dashed border-[#d4c9b8]" showCloseButton={false}>
          <SheetTitle className="sr-only">Navigation</SheetTitle>
          <SidebarContent onNavigate={() => setMobileOpen(false)} />
        </SheetContent>
      </Sheet>

      {/* Main area */}
      <div className="flex flex-1 flex-col overflow-hidden">
        {/* Mobile header */}
        <header className="sticky top-0 z-30 flex items-center gap-2 border-b-2 border-dashed border-[#d4c9b8] bg-[#f3ece0] px-4 py-3 md:hidden">
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 text-[#5c4b3a]"
            onClick={() => setMobileOpen(!mobileOpen)}
            aria-label={mobileOpen ? 'Close navigation' : 'Open navigation'}
          >
            {mobileOpen ? (
              <PanelLeftClose className="h-[18px] w-[18px]" strokeWidth={1.75} />
            ) : (
              <PanelLeft className="h-[18px] w-[18px]" strokeWidth={1.75} />
            )}
          </Button>
          <span className="text-sm font-bold text-[#5c4b3a]">Deely</span>
        </header>

        {/* Page content */}
        <main className="flex-1 overflow-y-auto paper-texture">
          {children}
        </main>
      </div>
    </div>
  );
}
