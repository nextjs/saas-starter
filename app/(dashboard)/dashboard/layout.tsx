'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Users, Settings, Shield, Activity, Menu, Building, Bot, GitBranch } from 'lucide-react';
import type { ElementType, ReactNode } from 'react';

interface NavItem {
  href: string;
  icon: ElementType;
  label: string;
  description: string;
  roles?: Array<'owner' | 'admin' | 'member'>;
}

interface DashboardLayoutProps {
  children: ReactNode;
}

export default function DashboardLayout({ children }: DashboardLayoutProps) {
  const pathname = usePathname();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  // Navigation items with descriptions for tooltips
  const navItems: NavItem[] = [
    { 
      href: '/dashboard', 
      icon: Users, 
      label: 'Team', 
      description: 'Manage your team members and their accounts',
      roles: ['owner', 'admin', 'member']
    },
    { 
      href: '/dashboard/organization', 
      icon: Building, 
      label: 'Organization', 
      description: 'Manage your organization settings and members', 
      roles: ['owner', 'admin']
    },
    { 
      href: '/dashboard/bots', 
      icon: Bot, 
      label: 'Bots', 
      description: 'Create and manage your AI bots',
      roles: ['owner', 'admin', 'member']
    },
    { 
      href: '/dashboard/workflows', 
      icon: GitBranch, 
      label: 'Workflows', 
      description: 'Design and manage your AI workflows',
      roles: ['owner', 'admin', 'member']
    },
    { 
      href: '/dashboard/general', 
      icon: Settings, 
      label: 'General', 
      description: 'View and update your general settings',
      roles: ['owner', 'admin', 'member']
    },
    { 
      href: '/dashboard/activity', 
      icon: Activity, 
      label: 'Activity', 
      description: 'See your account activity and events',
      roles: ['owner', 'admin', 'member']
    },
    { 
      href: '/dashboard/security', 
      icon: Shield, 
      label: 'Security', 
      description: 'Manage your security preferences',
      roles: ['owner', 'admin', 'member']
    },
  ];

  // For future RBAC implementation - currently showing all links
  // const filteredNavItems = navItems.filter(item => {
  //   if (!item.roles) return true;
  //   return item.roles.includes(userRole);
  // });

  const renderNavItems = (onClick?: () => void) => (
    navItems.map((item) => (
      <Link key={item.href} href={item.href} passHref>
        <Button
          variant={pathname === item.href ? "orange" : "ghost"}
          className={`shadow-none my-1 w-full justify-start ${
            pathname === item.href ? 'text-white' : ''
          }`}
          onClick={onClick}
        >
          <item.icon className="mr-2 h-4 w-4" />
          {item.label}
        </Button>
      </Link>
    ))
  );

  return (
    <div className="flex flex-col min-h-[calc(100dvh-68px)] max-w-7xl mx-auto w-full">
      {/* Mobile header */}
      <div className="lg:hidden flex items-center justify-between bg-white dark:bg-gray-950 border-b border-gray-200 dark:border-gray-800 p-4">
        <div className="flex items-center">
          <span className="font-medium">Settings</span>
        </div>
        
        {/* Mobile menu dialog */}
        <Dialog open={isSidebarOpen} onOpenChange={setIsSidebarOpen}>
          <DialogTrigger asChild>
            <Button
              variant="ghost"
              size="sm"
              className="-mr-3"
            >
              <Menu className="h-6 w-6" />
              <span className="sr-only">Open menu</span>
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[300px] p-0">
            <DialogHeader className="p-4 border-b">
              <DialogTitle>Navigation</DialogTitle>
            </DialogHeader>
            <nav className="p-4">
              {renderNavItems(() => setIsSidebarOpen(false))}
            </nav>
          </DialogContent>
        </Dialog>
      </div>

      <div className="flex flex-1 overflow-hidden h-full">
        {/* Sidebar - desktop only */}
        <aside
          className="w-64 bg-white dark:bg-gray-950 border-r border-gray-200 dark:border-gray-800 hidden lg:block"
        >
          <nav className="h-full overflow-y-auto p-4">
            <TooltipProvider delayDuration={300}>
              {navItems.map((item) => (
                <Tooltip key={item.href}>
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
                  <TooltipContent side="right" align="center" className="text-sm">
                    {item.description}
                  </TooltipContent>
                </Tooltip>
              ))}
            </TooltipProvider>
          </nav>
        </aside>

        {/* Main content */}
        <main className="flex-1 overflow-y-auto p-0 lg:p-4 bg-gray-50 dark:bg-gray-900">
          {children}
        </main>
      </div>
    </div>
  );
}
