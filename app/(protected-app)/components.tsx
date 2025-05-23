'use client';

import Link from 'next/link';
import { Home, LogOut, Menu } from 'lucide-react';
import { useState } from 'react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger
} from '@/components/ui/dropdown-menu';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { signOut } from '@/app/login/actions';
import { useRouter } from 'next/navigation';
import type { Team } from '@/lib/db/schema';

export function UserMenu({ user }: { user: any }) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const router = useRouter();

  if (!user) {
    return (
      <Link href="/login/sign-in">
        <button className="px-4 py-2 bg-gradient-to-r from-blue-600 to-teal-500 hover:from-blue-700 hover:to-teal-600 text-white rounded-full shadow-md hover:shadow-lg transition-all duration-200">
          Sign In
        </button>
      </Link>
    );
  }

  const getUserInitials = (user: { name?: string; email?: string }) => {
    if (user.name) {
      return user.name
        .split(' ')
        .map((n) => n[0])
        .join('');
    }
    return user.email && user.email[0] ? user.email[0].toUpperCase() : 'U';
  };

  async function handleSignOut() {
    await signOut();
    router.refresh();
    router.push('/');
  }

  return (
    <DropdownMenu open={isMenuOpen} onOpenChange={setIsMenuOpen}>
      <DropdownMenuTrigger>
        <Avatar className="cursor-pointer h-9 w-9 relative avatar-border-gradient shadow-md hover:shadow-lg transition-all duration-200">
          <AvatarImage alt={user?.name || 'User'} />
          <AvatarFallback className="bg-gradient-to-r from-blue-100 to-teal-100 text-teal-800 font-medium">
            {getUserInitials(user || { email: '' })}
          </AvatarFallback>
        </Avatar>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="flex flex-col gap-2 p-0 shadow-lg rounded-xl border border-gray-100 w-60 overflow-hidden">
        <div className="p-4 bg-gradient-to-r from-blue-50 to-teal-50 border-b border-gray-100">
          <div className="flex items-center gap-3">
            <div className="flex-1 min-w-0">
              <p className="font-medium text-gray-900 truncate">{user?.name || 'User'}</p>
              <p className="text-xs text-gray-500 truncate">{user?.email}</p>
            </div>
          </div>
        </div>
        <div className="p-2">
          <DropdownMenuItem className="cursor-pointer rounded-lg hover:bg-gradient-to-r hover:from-blue-50 hover:to-green-50 py-2">
            <Link href="/dashboard" className="flex w-full items-center">
              <Home className="mr-3 h-4 w-4 text-teal-500" />
              <span>Dashboard</span>
            </Link>
          </DropdownMenuItem>
          <form action={handleSignOut} className="w-full">
            <button type="submit" className="flex w-full">
              <DropdownMenuItem className="w-full flex-1 cursor-pointer rounded-lg hover:bg-gradient-to-r hover:from-blue-50 hover:to-green-50 py-2">
                <LogOut className="mr-3 h-4 w-4 text-teal-500" />
                <span>Sign out</span>
              </DropdownMenuItem>
            </button>
          </form>
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

export function Header({ user, team }: { user: any; team: Team | null }) {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  
  return (
    <header className="border-b border-gray-100 bg-white/80 backdrop-blur-sm sticky top-0 z-30 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3 flex justify-between items-center">
        <div className="flex items-center space-x-8">
          <Link href="/" className="flex items-center">
            <img src="/Logo_all.svg" alt="Logo" className="h-7 w-7" />
            <span className="ml-2 text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-teal-500 truncate">
              Focus your AI
            </span>
          </Link>
          {user && (
            <nav className="hidden md:flex space-x-6">
              {(team?.subscriptionStatus === 'active' || team?.subscriptionStatus === 'trialing') && (
                <>
                  <Link href="/app" className="flex items-center text-gray-600 hover:text-gray-800 transition-colors">
                    <i className="fa-solid fa-book-open mr-2" aria-hidden="true"></i>
                    Learn
                  </Link>
                  <Link href="/ai-op" className="flex items-center text-gray-600 hover:text-gray-800 transition-colors">
                    <i className="fa-solid fa-robot mr-2" aria-hidden="true"></i>
                    AI-Driven Operating Procedures
                  </Link>
                  <Link href="/ai-guides" className="flex items-center text-gray-600 hover:text-gray-800 transition-colors">
                    <i className="fa-solid fa-book-open mr-2" aria-hidden="true"></i>
                    AI Guides
                  </Link>
                  <Link href="/challenges" className="flex items-center text-gray-600 hover:text-gray-800 transition-colors">
                    <i className="fa-solid fa-trophy mr-2" aria-hidden="true"></i>
                    Challenges
                  </Link>
                </>
              )}
            </nav>
          )}
        </div>
        <div className="flex items-center space-x-4">
          {user ? (
            <UserMenu user={user} />
          ) : (
            <Link href="/login/sign-in">
              <button className="px-4 py-2 bg-blue-600 text-white rounded-full hover:bg-blue-700 transition-colors">
                Sign In
              </button>
            </Link>
          )}
        </div>
      </div>
    </header>
  );
} 