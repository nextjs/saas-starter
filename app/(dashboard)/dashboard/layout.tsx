'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Users, Settings, Shield, Activity, Menu, X } from 'lucide-react';
import SupportModal from './components/SupportModal';

export default function DashboardLayout({
  children
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isSupportModalOpen, setIsSupportModalOpen] = useState(false);
  const [userData, setUserData] = useState<{ name?: string; email: string } | null>(null);

  // Fetch user data when needed
  useEffect(() => {
    async function loadUserData() {
      if (isSupportModalOpen && !userData) {
        try {
          const response = await fetch('/api/user');
          if (response.ok) {
            const data = await response.json();
            setUserData(data.user);
          }
        } catch (error) {
          console.error('Error fetching user data:', error);
        }
      }
    }

    loadUserData();
  }, [isSupportModalOpen, userData]);

  const navItems = [
    { href: '/dashboard', icon: Users, label: 'Account' },
    { href: '/dashboard/general', icon: Settings, label: 'General' },
    { href: '/dashboard/activity', icon: Activity, label: 'Activity' },
    { href: '/dashboard/security', icon: Shield, label: 'Security' }
  ];

  return (
    <div className="flex flex-col min-h-[calc(100dvh-68px)] max-w-7xl mx-auto w-full">
      {/* Support Modal */}
      <SupportModal 
        isOpen={isSupportModalOpen} 
        onOpenChange={setIsSupportModalOpen} 
        userName={userData?.name || ''}
        userEmail={userData?.email || ''}
      />

      {/* Mobile header */}
      <div className="lg:hidden flex items-center justify-between bg-white shadow-sm p-4 sticky top-0 z-20">
        <div className="flex items-center">
          <span className="font-medium text-gray-800">Settings</span>
        </div>
        <Button
          className="p-1.5 rounded-full hover:bg-blue-50"
          variant="ghost"
          onClick={() => setIsSidebarOpen(!isSidebarOpen)}
        >
          {isSidebarOpen ? (
            <X className="h-5 w-5 text-teal-600" />
          ) : (
            <Menu className="h-5 w-5 text-teal-600" />
          )}
          <span className="sr-only">Toggle sidebar</span>
        </Button>
      </div>

      <div className="flex flex-1 overflow-hidden h-full">
        {/* Sidebar */}
        <aside
          className={`w-72 bg-white shadow-lg lg:block ${
            isSidebarOpen ? 'block' : 'hidden'
          } lg:relative fixed inset-y-0 left-0 z-40 transform transition-all duration-300 ease-in-out lg:translate-x-0 ${
            isSidebarOpen ? 'translate-x-0' : '-translate-x-full'
          }`}
        >
          <div className="h-full flex flex-col">
            <div className="p-4 border-b border-gray-100">
              <h2 className="text-lg font-bold text-gray-900">Dashboard</h2>
            </div>
            <nav className="flex-1 overflow-y-auto p-4 space-y-2">
              {navItems.map((item) => (
                <Link key={item.href} href={item.href} passHref>
                  <Button
                    variant="ghost"
                    className={`shadow-none w-full justify-start rounded-xl py-6 px-5 transition-all ${
                      pathname === item.href 
                        ? 'bg-gradient-to-r from-blue-500 to-teal-500 text-white font-medium' 
                        : 'hover:bg-gradient-to-r hover:from-blue-50 hover:to-teal-50 text-gray-700'
                    }`}
                    onClick={() => setIsSidebarOpen(false)}
                  >
                    <item.icon className={`h-5 w-5 mr-3 ${pathname === item.href ? 'text-white' : 'text-teal-500'}`} />
                    {item.label}
                  </Button>
                </Link>
              ))}
            </nav>
            <div className="p-4 mt-auto border-t border-gray-100">
              <div className="bg-gradient-to-r from-blue-50 to-teal-50 p-4 rounded-xl">
                <p className="text-sm text-gray-600">Need help with your account?</p>
                <Button 
                  className="mt-2 w-full text-white bg-gradient-to-r from-blue-600 to-teal-500 hover:from-blue-700 hover:to-teal-600"
                  onClick={() => setIsSupportModalOpen(true)}
                >
                  Contact Support
                </Button>
              </div>
            </div>
          </div>
        </aside>

        {/* Main content */}
        <main className="flex-1 overflow-y-auto p-0 lg:p-6 bg-slate-50">{children}</main>
      </div>
    </div>
  );
}
