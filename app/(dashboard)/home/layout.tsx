"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
  Users,
  Settings,
  Shield,
  Activity,
  Menu,
  CircleIcon,
  House,
  List,
  Grip,
} from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const navItems = [
    { href: "/home", icon: House, label: "Home" },
    { href: "/home/general", icon: Grip, label: "Kol List" },
    // { href: "/dashboard/activity", icon: Activity, label: "Activity" },
    // { href: "/dashboard/security", icon: Shield, label: "Security" },
  ];

  return (
    <div className="flex flex-col min-h-[calc(100dvh)] max-w-full mx-auto w-full">
      {/* Mobile header */}
      <div className="lg:hidden flex items-center justify-between bg-white border-b border-gray-200 p-4 text-primary">
        <div className="flex items-center">
          <Link href="/" className="flex items-center">
            <CircleIcon className="h-6 w-6 text-secondary" />
            <span className="ml-2 text-xl font-bold text-primary">
              KOL AGENT
            </span>
          </Link>
        </div>
        <Button
          className="-mr-3"
          variant="ghost"
          onClick={() => setIsSidebarOpen(!isSidebarOpen)}
        >
          <Menu className="h-6 w-6" />
        </Button>
      </div>

      <div className="flex flex-1 overflow-hidden h-full fixed w-full">
        {/* Sidebar */}
        <aside
          className={`w-56 bg-white border-r border-gray-200 lg:block text-primary lg:relative sticky top-0 inset-y-0 left-0 z-40 transform transition-transform duration-300 ease-in-out lg:translate-x-0 ${
            isSidebarOpen ? "translate-x-0" : "-translate-x-full"
          }`}
        >
          <div className="flex items-center justify-center py-8 pb-6 px-4">
            <Link href="/" className="flex items-center">
              <CircleIcon className="h-6 w-6 text-secondary" />
              <span className="ml-2 text-xl font-bold text-primary">
                KOL AGENT
              </span>
            </Link>
          </div>
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
                  <item.icon className="mr-2 h-4 w-4" />
                  {item.label}
                </Button>
              </Link>
            ))}
          </nav>
        </aside>

        {/* Main content */}
        <ScrollArea className="flex-1 overflow-y-auto p-0 lg:p-4">
          <main className="w-full">{children}</main>
        </ScrollArea>
      </div>
    </div>
  );
}
