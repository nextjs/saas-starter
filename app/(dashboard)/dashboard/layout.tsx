'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Users, Settings, Shield, Activity, Menu, FolderOpen, ChevronRight } from 'lucide-react';
import useSWR from 'swr';
import { Suspense } from 'react';

const fetcher = (url: string) => fetch(url).then((res) => res.json());

type Space = {
  id: number;
  name: string;
  slug: string;
  description: string;
  role: string;
  memberCount: number;
  fileCount: number;
  totalSize: number;
};

function SpacesSection() {
  const { data, error } = useSWR<{ spaces: Space[] }>('/api/spaces', fetcher);

  if (error) return null;
  if (!data) return <div className="animate-pulse space-y-2"><div className="h-8 bg-gray-200 rounded"></div></div>;

  return (
    <div className="mb-4">
      <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">
        Your Spaces
      </h3>
      <div className="space-y-1 max-h-64 overflow-y-auto">
        {data.spaces.map((space) => (
          <Link key={space.id} href={`/spaces/${space.slug}`}>
            <Button
              variant="ghost"
              className="w-full justify-start text-left h-auto p-2 hover:bg-gray-100"
            >
              <FolderOpen className="h-4 w-4 mr-2 flex-shrink-0" />
              <div className="flex-1 min-w-0">
                <div className="font-medium text-sm truncate">{space.name}</div>
                <div className="text-xs text-gray-500 truncate">{space.description}</div>
              </div>
              <ChevronRight className="h-3 w-3 text-gray-400 flex-shrink-0" />
            </Button>
          </Link>
        ))}
        {data.spaces.length === 0 && (
          <div className="text-sm text-gray-500 p-2">No spaces yet</div>
        )}
      </div>
    </div>
  );
}

export default function DashboardLayout({
  children
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const navItems = [
    { href: '/dashboard', icon: Users, label: 'Team' },
    { href: '/dashboard/general', icon: Settings, label: 'General' },
    { href: '/dashboard/activity', icon: Activity, label: 'Activity' },
    { href: '/dashboard/security', icon: Shield, label: 'Security' }
  ];

  return (
    <div className="flex flex-col h-[calc(100dvh-68px)] max-w-7xl mx-auto w-full">
      {/* Mobile header */}
      <div className="lg:hidden flex items-center justify-between bg-white border-b border-gray-200 p-4 flex-shrink-0">
        <div className="flex items-center">
          <span className="font-medium">Settings</span>
        </div>
        <Button
          className="-mr-3"
          variant="ghost"
          onClick={() => setIsSidebarOpen(!isSidebarOpen)}
        >
          <Menu className="h-6 w-6" />
          <span className="sr-only">Toggle sidebar</span>
        </Button>
      </div>

      <div className="flex flex-1 overflow-hidden min-h-0 relative">
        {/* Mobile overlay */}
        {isSidebarOpen && (
          <div 
            className="lg:hidden fixed inset-0 bg-black bg-opacity-50 z-30"
            onClick={() => setIsSidebarOpen(false)}
          />
        )}
        
        {/* Sidebar */}
        <aside
          className={`w-64 bg-white lg:bg-gray-50 border-r border-gray-200 lg:block flex-shrink-0 ${
            isSidebarOpen ? 'block' : 'hidden'
          } lg:relative absolute inset-y-0 left-0 z-40 transform transition-transform duration-300 ease-in-out lg:translate-x-0 ${
            isSidebarOpen ? 'translate-x-0' : '-translate-x-full'
          }`}
        >
          <nav className="h-full flex flex-col">
            {/* Scrollable content area */}
            <div className="flex-1 overflow-y-auto p-4">
              {/* Spaces Section - Top */}
              <Suspense fallback={<div className="animate-pulse space-y-2"><div className="h-8 bg-gray-200 rounded"></div></div>}>
                <SpacesSection />
              </Suspense>
            </div>
            
            {/* Settings Section - Bottom (Fixed) */}
            <div className="flex-shrink-0 p-4 pt-0 border-t border-gray-200 bg-white lg:bg-gray-50">
              <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">
                Settings
              </h3>
              <div className="space-y-1">
                {navItems.map((item) => (
                  <Link key={item.href} href={item.href} passHref>
                    <Button
                      variant={pathname === item.href ? 'secondary' : 'ghost'}
                      className={`shadow-none w-full justify-start ${
                        pathname === item.href ? 'bg-gray-100' : ''
                      }`}
                      onClick={() => setIsSidebarOpen(false)}
                    >
                      <item.icon className="h-4 w-4 mr-2" />
                      {item.label}
                    </Button>
                  </Link>
                ))}
              </div>
            </div>
          </nav>
        </aside>

        {/* Main content */}
        <main className="flex-1 overflow-y-auto p-0 lg:p-4 min-w-0">{children}</main>
      </div>
    </div>
  );
}
