"use client";

import { Button } from "@/components/ui/button";
import { useUser } from "@/contexts/UserContext";
import {
  Activity,
  Bookmark,
  MessageSquare,
  Send,
  Settings,
  Shield,
} from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useMemo, useState } from "react";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [showMobilePrompt, setShowMobilePrompt] = useState(false);

  const { user } = useUser();

  useEffect(() => {
    // Check if user has mobile number
    if (
      user &&
      !user.mobileNumber &&
      pathname !== "/dashboard/integrations" &&
      pathname !== "/dashboard/settings"
    ) {
      setShowMobilePrompt(true);
    } else {
      setShowMobilePrompt(false);
    }
  }, [user, pathname]);

  const navItems = useMemo(
    () => [
      { href: "/dashboard/memories", icon: Bookmark, label: "Memories" },
      { href: "/dashboard/chat", icon: MessageSquare, label: "Chat" },
      { href: "/dashboard/metrics", icon: Activity, label: "Metrics" },
      { href: "/dashboard/integrations", icon: Send, label: "Integrations" },
      { href: "/dashboard/security", icon: Shield, label: "Security" },
      { href: "/dashboard/settings", icon: Settings, label: "Settings" },
    ],
    []
  );

  return (
    <div className="flex flex-col min-h-[calc(100dvh-68px)] max-w-7xl mx-auto w-full">
      {/* Mobile header removed - no duplicate 'Settings' navbar on small screens */}

      <div className="flex flex-1 overflow-hidden h-full">
        {/* Sidebar */}
        <aside
          className={`w-64 bg-white lg:bg-gray-50 border-r border-gray-200 lg:block ${
            isSidebarOpen ? "block" : "hidden"
          } lg:relative absolute inset-y-0 left-0 z-40 transform transition-transform duration-300 ease-in-out lg:translate-x-0 ${
            isSidebarOpen ? "translate-x-0" : "-translate-x-full"
          }`}
        >
          <nav className="h-full overflow-y-auto p-4">
            {navItems.map((item) => (
              <Link key={item.href} href={item.href} passHref>
                <Button
                  variant={pathname === item.href ? "secondary" : "ghost"}
                  className={`shadow-none my-1 w-full justify-start ${
                    pathname === item.href ? "bg-gray-100" : ""
                  }`}
                  onClick={() => setIsSidebarOpen(false)}
                >
                  <item.icon className="h-4 w-4" />
                  {item.label}
                </Button>
              </Link>
            ))}
          </nav>
        </aside>

        {/* Main content */}
        <main className="flex-1 overflow-y-auto p-0 lg:p-4">
          {showMobilePrompt && (
            <div className="bg-amber-50 border-l-4 border-amber-400 p-4 mb-4 mx-4 lg:mx-0">
              <div className="flex items-start">
                <div className="flex-shrink-0">
                  <svg
                    className="h-5 w-5 text-amber-400"
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                  >
                    <path
                      fillRule="evenodd"
                      d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z"
                      clipRule="evenodd"
                    />
                  </svg>
                </div>
                <div className="ml-3 flex-1">
                  <p className="text-sm text-amber-700">
                    Please add and verify your mobile number to access WhatsApp
                    services.
                  </p>
                  <Link href="/dashboard/integrations">
                    <Button
                      className="mt-2 bg-amber-600 hover:bg-amber-700 text-white text-sm"
                      size="sm"
                    >
                      Add Mobile Number
                    </Button>
                  </Link>
                </div>
                <button
                  onClick={() => setShowMobilePrompt(false)}
                  className="ml-auto flex-shrink-0 text-amber-500 hover:text-amber-600"
                >
                  <svg
                    className="h-5 w-5"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                  >
                    <path
                      fillRule="evenodd"
                      d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                      clipRule="evenodd"
                    />
                  </svg>
                </button>
              </div>
            </div>
          )}
          {children}
        </main>
      </div>
    </div>
  );
}
