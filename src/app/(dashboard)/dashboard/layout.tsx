"use client";

import Logo from "@/src/components/logo";
import { Button } from "@/src/components/ui/button";
import {
  Activity,
  Menu,
  PanelRight,
  Settings,
  Shield,
  Users,
} from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);

  const navItems = [
    { href: "/dashboard", icon: Users, label: "Team" },
    { href: "/dashboard/general", icon: Settings, label: "General" },
    { href: "/dashboard/activity", icon: Activity, label: "Activity" },
    { href: "/dashboard/security", icon: Shield, label: "Security" },
  ];

  // Add PanelRight as nav item only when collapsed
  const navItemsWithExpand = isSidebarCollapsed
    ? [
        {
          href: "#expand-sidebar",
          icon: PanelRight,
          label: "Expand",
          isExpand: true,
        },
        ...navItems,
      ]
    : navItems;

  return (
    <div className="flex flex-col min-h-[calc(100dvh-68px)] max-w-8xl mx-auto w-full">
      {/* Mobile header */}
      <div className="lg:hidden flex items-center justify-between bg-white border-b border-gray-200 p-4">
        <div className="flex items-center">
          <Logo />
        </div>
        <Button
          className="-mr-3"
          variant="ghost"
          onClick={() => setIsSidebarOpen(!isSidebarOpen)}
        >
          <Menu className="h-6 w-6 cursor-pointer" />
          <span className="sr-only">Toggle sidebar</span>
        </Button>
      </div>

      <div className="flex flex-1 overflow-hidden h-full">
        {/* Sidebar */}
        <aside
          className={`
            bg-white lg:bg-gray-50 border-r border-gray-200
            lg:block ${isSidebarOpen ? "block" : "hidden"}
            lg:relative absolute inset-y-0 left-0 z-40 transform transition-transform duration-300 ease-in-out lg:translate-x-0
            ${isSidebarOpen ? "translate-x-0" : "-translate-x-full"}
            flex flex-col
            ${isSidebarCollapsed ? "w-20" : "w-64"}
          `}
        >
          <div
            className={`flex items-center justify-between p-4 ${
              isSidebarCollapsed ? "" : "px-4"
            }`}
          >
            <div className={`${isSidebarCollapsed ? "px-2 mx-auto" : "px-0"}`}>
              <Logo collapsed={isSidebarCollapsed} />
            </div>
            {/* Show PanelRight beside Logo only when expanded */}
            {!isSidebarCollapsed && (
              <Button
                variant="ghost"
                size="icon"
                aria-label="Collapse sidebar"
                onClick={() => setIsSidebarCollapsed(true)}
              >
                <PanelRight className="h-5 w-5 cursor-pointer" />
              </Button>
            )}
          </div>
          <nav
            className={`flex-1 overflow-y-auto ${
              isSidebarCollapsed ? "px-2" : "px-4"
            } flex flex-col gap-2`}
          >
            {navItemsWithExpand.map((item) =>
              "isExpand" in item && item.isExpand ? (
                <Button
                  key="expand-sidebar"
                  variant="ghost"
                  className={`shadow-none w-full flex items-center gap-3 hover:bg-gray-100 justify-center transition-colors px-0 mt-2 cursor-pointer`}
                  aria-label="Expand sidebar"
                  onClick={() => setIsSidebarCollapsed(false)}
                >
                  <item.icon className="h-5 w-5" />
                </Button>
              ) : (
                <Link key={item.href} href={item.href} passHref>
                  <Button
                    variant={pathname === item.href ? "secondary" : "ghost"}
                    className={`shadow-none w-full flex items-center gap-3 hover:bg-gray-100 justify-start transition-colors cursor-pointer ${
                      pathname === item.href ? "bg-gray-200" : ""
                    } ${isSidebarCollapsed ? "justify-center px-0" : "px-3"}`}
                    onClick={() => setIsSidebarOpen(false)}
                  >
                    <item.icon className="h-5 w-5" />
                    {!isSidebarCollapsed && (
                      <span className="truncate">{item.label}</span>
                    )}
                  </Button>
                </Link>
              )
            )}
          </nav>
        </aside>

        {/* Main content */}
        <main className="flex-1 overflow-y-auto p-0 lg:p-4">{children}</main>
      </div>
    </div>
  );
}
