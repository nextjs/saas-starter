'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { Users, Settings, Shield, Activity, Menu } from 'lucide-react';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  // Navigation items with descriptions for tooltips
  const navItems = [
    { href: '/dashboard', icon: Users, label: 'Team', description: 'Manage your team members and their accounts' },
    { href: '/dashboard/general', icon: Settings, label: 'General', description: 'View and update your general settings' },
    { href: '/dashboard/activity', icon: Activity, label: 'Activity', description: 'See your account activity and events' },
    { href: '/dashboard/security', icon: Shield, label: 'Security', description: 'Manage your security preferences' },
  ];

  return (
    <div className="flex flex-col min-h-[calc(100dvh-68px)] max-w-7xl mx-auto w-full">
      {/* Mobile header */}
      <div className="lg:hidden flex items-center justify-between bg-white border-b border-gray-200 p-4">
        <div className="flex items-center">
          <span className="font-medium">Settings</span>
        </div>
        
        {/* Mobile menu dialog */}
        <Dialog open={isSidebarOpen} onOpenChange={setIsSidebarOpen}>
          <DialogTrigger asChild>
            <Button
              className="-mr-3"
              variant="ghost"
            >
              <Menu className="h-6 w-6" />
              <span className="sr-only">Open menu</span>
            </Button>
          </DialogTrigger>
          <DialogContent size="sm" className="sm:max-w-[300px] p-0">
            <DialogHeader className="p-4 border-b">
              <DialogTitle>Navigation</DialogTitle>
            </DialogHeader>
            <nav className="p-4">
              {navItems.map((item) => (
                <Link key={item.href} href={item.href} passHref>
                  <Button
                    variant={pathname === item.href ? "orange" : "ghost"}
                    className="shadow-none my-1 w-full justify-start"
                    onClick={() => setIsSidebarOpen(false)}
                  >
                    <item.icon className="mr-2 h-4 w-4" />
                    {item.label}
                  </Button>
                </Link>
              ))}
            </nav>
          </DialogContent>
        </Dialog>
      </div>

      <div className="flex flex-1 overflow-hidden h-full">
        {/* Sidebar - desktop only */}
        <aside
          className="w-64 bg-white lg:bg-gray-50 border-r border-gray-200 hidden lg:block"
        >
          <nav className="h-full overflow-y-auto p-4">
            {navItems.map((item) => (
              <Tooltip key={item.href} delayDuration={300}>
                <TooltipTrigger asChild>
                  <Link href={item.href} passHref>
                    <Button
                      variant={pathname === item.href ? "orange" : "ghost"}
                      className={`shadow-none my-1 w-full justify-start ${
                        pathname === item.href ? 'text-white' : ''
                      }`}
                    >
                      <item.icon className="mr-2 h-4 w-4" />
                      {item.label}
                    </Button>
                  </Link>
                </TooltipTrigger>
                <TooltipContent side="right">
                  {item.description}
                </TooltipContent>
              </Tooltip>
            ))}
          </nav>
        </aside>

        {/* Legacy mobile sidebar (hidden but kept for compatibility) */}
        <aside
          className={`w-64 bg-white lg:bg-gray-50 border-r border-gray-200 lg:hidden ${
            isSidebarOpen ? 'block' : 'hidden'
          } lg:relative absolute inset-y-0 left-0 z-40 transform transition-transform duration-300 ease-in-out lg:translate-x-0 ${
            isSidebarOpen ? 'translate-x-0' : '-translate-x-full'
          }`}
        >
          <nav className="h-full overflow-y-auto p-4">
            {navItems.map((item) => (
              <Link key={item.href} href={item.href} passHref>
                <Button
                  variant={pathname === item.href ? "orange" : "ghost"}
                  className={`shadow-none my-1 w-full justify-start ${
                    pathname === item.href ? 'text-white' : ''
                  }`}
                  onClick={() => setIsSidebarOpen(false)}
                >
                  <item.icon className="mr-2 h-4 w-4" />
                  {item.label}
                </Button>
              </Link>
            ))}
          </nav>
        </aside>

        {/* Main content */}
        <main className="flex-1 overflow-y-auto p-0 lg:p-4">{children}</main>
      </div>
    </div>
  );
}
