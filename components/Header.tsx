'use client';

import Link from 'next/link';
import { useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { CircleIcon, Home, LogOut, Menu, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator
} from '@/components/ui/dropdown-menu';
import { signOut } from '@/app/(auth)/actions';
import { User } from '@/lib/db/schema';
import useSWR from 'swr';
import { ThemeToggle } from '@/components/theme-toggle';

const fetcher = (url: string) => fetch(url).then((res) => res.json());

export function UserMenu() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { data: user } = useSWR<User>('/api/user', fetcher);
  const router = useRouter();

  async function handleSignOut() {
    await signOut();
    router.refresh();
    router.push('/');
  }

  if (!user) {
    return (
      <>
        <Button asChild className="rounded-full">
          <Link href="/sign-in">Getting Started</Link>
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
              .split(' ')
              .map((n) => n[0])
              .join('')}
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
        <DropdownMenuSeparator />

        <form action={handleSignOut} className="w-full">
          <button type="submit" className="flex w-full">
            <DropdownMenuItem className="w-full flex-1 cursor-pointer">
              <LogOut className="mr-2 h-4 w-4" />
              <span>Sign Out</span>
            </DropdownMenuItem>
          </button>
        </form>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

export function Header() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const pathname = usePathname();

  const navItems = [
    { href: '/blog', label: 'Blog' },
    { href: '/about', label: 'About' },
    { href: '/docs', label: 'Docs' },
    { href: '/pricing', label: 'Pricing' },
  ];

  return (
    <header className="sticky top-0 z-40 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
        <div className="flex justify-between items-center">
          <div className="flex items-center">
            <Link href="/" className="flex items-center">
              <CircleIcon className="h-6 w-6 text-orange-500" />
              <span className="ml-2 text-xl font-semibold text-foreground">MCP.Day</span>
            </Link>

            {/* 桌面导航 */}
            <nav className="hidden md:ml-10 md:flex md:space-x-8">
              {navItems.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`text-sm font-medium ${
                    pathname === item.href
                      ? 'text-orange-500'
                      : 'text-muted-foreground hover:text-foreground'
                  }`}
                >
                  {item.label}
                </Link>
              ))}
            </nav>
          </div>

          {/* 移动端菜单按钮 */}
          <div className="flex md:hidden">
            <button
              type="button"
              className="text-muted-foreground hover:text-foreground"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              <span className="sr-only">打开菜单</span>
              {mobileMenuOpen ? (
                <X className="h-6 w-6" />
              ) : (
                <Menu className="h-6 w-6" />
              )}
            </button>
          </div>

          {/* 用户菜单 */}
          <div className="hidden md:flex items-center space-x-4">
            <UserMenu />
            <ThemeToggle />
          </div>
         
        </div>

        {/* 移动端导航菜单 */}
        {mobileMenuOpen && (
          <div className="md:hidden pt-2 pb-4">
            <div className="space-y-1">
              {navItems.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`block py-2 text-base font-medium ${
                    pathname === item.href
                      ? 'text-orange-500'
                      : 'text-muted-foreground hover:text-foreground'
                  }`}
                  onClick={() => setMobileMenuOpen(false)}
                >
                  {item.label}
                </Link>
              ))}
            </div>
            <div className="mt-4 pt-4 border-t border-border">
              <UserMenu />
              <ThemeToggle />
            </div>
          </div>
        )}
      </div>
    </header>
  );
}
