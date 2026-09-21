'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Button } from '@/components/ui/button';
import {
  Users,
  Settings,
  Shield,
  Activity,
  Menu,
  ShoppingCart,
  Receipt,
  Contact,
  Tags,
  Store,
  LayoutGrid,
  BarChart3,
  MessageCircle,
  CreditCard,
} from 'lucide-react';

export default function DashboardLayout({
  children
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  // Menu operasional laundry di atas, pengaturan akun/tim di bawah.
  const grupNav = [
    {
      judul: 'Operasional',
      items: [
        { href: '/dashboard/pos', icon: ShoppingCart, label: 'POS Kasir' },
        { href: '/dashboard/antrian', icon: LayoutGrid, label: 'Papan Antrian' },
        { href: '/dashboard/pesanan', icon: Receipt, label: 'Pesanan' },
        { href: '/dashboard/laporan', icon: BarChart3, label: 'Laporan' },
      ],
    },
    {
      judul: 'Data Master',
      items: [
        { href: '/dashboard/pelanggan', icon: Contact, label: 'Pelanggan' },
        { href: '/dashboard/layanan', icon: Tags, label: 'Layanan & Harga' },
        { href: '/dashboard/outlet', icon: Store, label: 'Outlet' },
        { href: '/dashboard/notifikasi', icon: MessageCircle, label: 'Notifikasi WA' },
      ],
    },
    {
      judul: 'Pengaturan',
      items: [
        { href: '/dashboard', icon: Users, label: 'Tim' },
        { href: '/dashboard/langganan', icon: CreditCard, label: 'Langganan' },
        { href: '/dashboard/general', icon: Settings, label: 'Umum' },
        { href: '/dashboard/activity', icon: Activity, label: 'Aktivitas' },
        { href: '/dashboard/security', icon: Shield, label: 'Keamanan' },
      ],
    },
  ];

  return (
    <div className="flex flex-col min-h-[calc(100dvh-68px)] max-w-7xl mx-auto w-full">
      {/* Mobile header */}
      <div className="lg:hidden flex items-center justify-between bg-white dark:bg-zinc-900 border-b border-gray-200 dark:border-zinc-700 p-4 print:hidden">
        <span className="font-medium text-gray-900 dark:text-gray-50">Menu</span>
        <Button
          className="-mr-3"
          variant="ghost"
          onClick={() => setIsSidebarOpen(!isSidebarOpen)}
        >
          <Menu className="h-6 w-6" />
          <span className="sr-only">Buka menu</span>
        </Button>
      </div>

      <div className="flex flex-1 overflow-hidden h-full">
        {/* Sidebar */}
        <aside
          className={`w-64 bg-white dark:bg-zinc-900 lg:bg-gray-50 lg:dark:bg-zinc-900 border-r border-gray-200 dark:border-zinc-700 lg:block print:hidden ${
            isSidebarOpen ? 'block' : 'hidden'
          } lg:relative absolute inset-y-0 left-0 z-40 transform transition-transform duration-300 ease-in-out lg:translate-x-0 ${
            isSidebarOpen ? 'translate-x-0' : '-translate-x-full'
          }`}
        >
          <nav className="h-full overflow-y-auto p-4">
            {grupNav.map((grup) => (
              <div key={grup.judul} className="mb-4 last:mb-0">
                <p className="mb-1 px-3 text-xs font-medium uppercase tracking-wide text-gray-600 dark:text-gray-400">
                  {grup.judul}
                </p>
                {grup.items.map((item) => {
                  const aktif =
                    item.href === '/dashboard'
                      ? pathname === '/dashboard'
                      : pathname.startsWith(item.href);
                  return (
                    <Link key={item.href} href={item.href} passHref>
                      <Button
                        variant={aktif ? 'secondary' : 'ghost'}
                        className={`shadow-none my-1 w-full justify-start ${
                          aktif ? 'bg-gray-100 dark:bg-zinc-800' : ''
                        }`}
                        onClick={() => setIsSidebarOpen(false)}
                      >
                        <item.icon className="h-4 w-4" />
                        {item.label}
                      </Button>
                    </Link>
                  );
                })}
              </div>
            ))}
          </nav>
        </aside>

        {/* Main content */}
        <main className="flex-1 overflow-y-auto p-0 lg:p-4">{children}</main>
      </div>
    </div>
  );
}
