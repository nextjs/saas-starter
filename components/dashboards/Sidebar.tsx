'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Button } from '@/components/ui/button';
import {
  Users,
  Settings,
  Activity,
  FileText,
  Home,
  Menu,
  X,
  Shield
} from 'lucide-react';

export function Sidebar() {
  const pathname = usePathname();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const navItems = [
    { href: "/dashboard", icon: Home, label: "Dashboard" },
    { href: "/dashboard/encounters", icon: FileText, label: "Encounters" },
    { href: "/dashboard/team", icon: Users, label: "Team" },
    { href: "/dashboard/activity", icon: Activity, label: "Activity" },
    { href: "/dashboard/general", icon: Settings, label: "General" },
    { href: "/dashboard/security", icon: Shield, label: "Security" },
  ];

  return (
    <>
      {/* Mobile menu button */}
      <div className="lg:hidden fixed bottom-4 right-4 z-50">
        <Button
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          className="rounded-full w-12 h-12 p-0 flex items-center justify-center shadow-lg"
        >
          {isMobileMenuOpen ? (
            <X className="h-6 w-6" />
          ) : (
            <Menu className="h-6 w-6" />
          )}
        </Button>
      </div>

      {/* Sidebar for both mobile and desktop */}
      <aside
        className={`
          bg-white border-r border-gray-200 w-64 fixed inset-y-0 left-0 z-40
          transform transition-transform duration-300 ease-in-out
          lg:translate-x-0 pt-16
          ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
        `}
      >
        <nav className="h-full overflow-y-auto p-4">
          <div className="space-y-2">
            {navItems.map((item) => {
              const isActive = pathname === item.href || pathname.startsWith(`${item.href}/`);

              return (
                <Link key={item.href} href={item.href} passHref>
                  <Button
                    variant={isActive ? 'secondary' : 'ghost'}
                    className={`w-full justify-start ${
                      isActive ? 'bg-gray-100' : ''
                    }`}
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    <item.icon className="mr-2 h-4 w-4" />
                    {item.label}
                  </Button>
                </Link>
              );
            })}
          </div>
        </nav>
      </aside>
    </>
  );
}
