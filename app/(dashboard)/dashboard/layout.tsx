'use client';

import { Suspense, useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Users, Settings, Shield, Activity, Menu, X, LayoutDashboard, Library } from 'lucide-react';
import { cn } from '@/lib/utils';

export default function DashboardLayout({
  children
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const isSongPage = pathname?.startsWith('/dashboard/song/') || false;

  const navItems = [
    { href: '/dashboard', icon: LayoutDashboard, label: 'Overview' },
    { href: '/dashboard/library', icon: Library, label: 'Library' },
    { href: '/dashboard/team', icon: Users, label: 'Team' },
    { href: '/dashboard/general', icon: Settings, label: 'General' },
    { href: '/dashboard/activity', icon: Activity, label: 'Activity' },
    { href: '/dashboard/security', icon: Shield, label: 'Security' }
  ];

  const bottomNavItems = [
    { href: '/dashboard', icon: LayoutDashboard, label: 'Home' },
    { href: '/dashboard/library', icon: Library, label: 'Library' },
    { href: '/dashboard/team', icon: Users, label: 'Team' },
    { href: '/dashboard/general', icon: Settings, label: 'Settings' }
  ];

  if (isSongPage) {
    return <div className="flex-1 flex flex-col">{children}</div>;
  }

  return (
    <div className="flex flex-col min-h-[calc(100dvh-68px)] max-w-7xl mx-auto w-full pb-16 lg:pb-0">
      {/* Mobile header */}
      <div className="lg:hidden flex items-center justify-between bg-black border-b border-zinc-800 p-4 sticky top-0 z-30">
        <div className="flex items-center">
          <span className="font-black text-white uppercase italic tracking-tight">
            {navItems.find((item) => item.href === pathname)?.label || 'Dashboard'}
          </span>
        </div>
      </div>

      <div className="flex flex-1 overflow-hidden h-full relative">
        {/* Mobile Sidebar Overlay */}
        {isSidebarOpen && (
          <div
            className="fixed inset-0 bg-black/50 z-30 lg:hidden backdrop-blur-sm"
            onClick={() => setIsSidebarOpen(false)}
          />
        )}

        {/* Sidebar (Desktop) */}
        <aside
          className={`w-64 bg-black lg:bg-black border-r border-zinc-800 hidden lg:block h-full`}
        >
          <nav className="h-full overflow-y-auto p-4 space-y-1 text-white">
            {navItems.map((item) => (
              <Link key={item.href} href={item.href} passHref>
                <Button
                  variant={pathname === item.href ? 'secondary' : 'ghost'}
                  className={`w-full justify-start rounded-xl font-bold uppercase tracking-wider text-xs transition-all ${
                    pathname === item.href
                      ? 'bg-zinc-900 text-gold border border-zinc-800 shadow-lg'
                      : 'text-zinc-500 hover:text-white hover:bg-zinc-900'
                  }`}
                >
                  <item.icon className={`h-4 w-4 mr-3 ${pathname === item.href ? 'text-gold' : 'text-zinc-500'}`} />
                  {item.label}{item.href === '/dashboard/library' && <span className="ml-auto bg-gold text-black text-[8px] px-1.5 py-0.5 rounded-full">PRO</span>}
                </Button>
              </Link>
            ))}
          </nav>
        </aside>

        {/* Main content */}
        <main className="flex-1 overflow-y-auto p-0 lg:p-4 bg-black">
          <Suspense fallback={null}>{children}</Suspense>
        </main>
      </div>

      {/* Mobile Bottom Navigation */}
      <div className="lg:hidden fixed bottom-0 left-0 right-0 bg-zinc-950/80 backdrop-blur-lg border-t border-zinc-900 px-6 py-3 flex justify-between items-center z-40">
        {bottomNavItems.map((item) => (
          <Link key={item.href} href={item.href} className="flex flex-col items-center gap-1 group">
            <div className={`p-1 rounded-lg transition-colors ${
              pathname === item.href ? 'text-gold bg-gold/10' : 'text-zinc-600 group-hover:text-zinc-400'
            }`}>
              <item.icon className="size-5" />
            </div>
            <span className={`text-[8px] font-black uppercase tracking-widest ${
              pathname === item.href ? 'text-gold' : 'text-zinc-600'
            }`}>
              {item.label}
            </span>
          </Link>
        ))}
        <button
          onClick={() => setIsSidebarOpen(true)}
          className="flex flex-col items-center gap-1 group"
        >
          <div className="p-1 rounded-lg text-zinc-600 group-hover:text-zinc-400">
            <Menu className="size-5" />
          </div>
          <span className="text-[8px] font-black uppercase tracking-widest text-zinc-600">
            Menu
          </span>
        </button>
      </div>

      {/* Full Mobile Sidebar Drawer */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 w-72 bg-black border-r border-zinc-900 transform transition-transform duration-300 ease-in-out lg:hidden ${
          isSidebarOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="p-6">
          <div className="flex items-center justify-between mb-8">
            <span className="font-black text-gold uppercase italic tracking-tighter text-xl">LyricFlow</span>
            <Button variant="ghost" size="sm" onClick={() => setIsSidebarOpen(false)} className="text-white">
              <X className="h-6 w-6" />
            </Button>
          </div>
          <nav className="space-y-2">
            {navItems.map((item) => (
              <Link key={item.href} href={item.href} passHref>
                <Button
                  variant={pathname === item.href ? 'secondary' : 'ghost'}
                  className={`w-full justify-start rounded-xl font-bold uppercase tracking-wider text-xs h-12 ${
                    pathname === item.href
                      ? 'bg-zinc-900 text-gold border border-zinc-800'
                      : 'text-zinc-500 hover:text-white'
                  }`}
                  onClick={() => setIsSidebarOpen(false)}
                >
                  <item.icon className="h-4 w-4 mr-3" />
                  {item.label}
                </Button>
              </Link>
            ))}
          </nav>
        </div>
      </aside>
    </div>
  );
}
