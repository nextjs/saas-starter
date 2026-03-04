"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import {
  LayoutDashboard,
  Kanban,
  List,
  Users,
  Building2,
  Activity,
  BarChart3,
  Settings,
  ChevronDown,
  ChevronRight,
} from "lucide-react";
import { useState } from "react";

const navGroups = [
  {
    label: "Overview",
    items: [
      { href: "/dashboard", icon: LayoutDashboard, label: "Dashboard" },
    ],
  },
  {
    label: "Pipeline",
    items: [
      { href: "/pipeline/board", icon: Kanban, label: "Board" },
      { href: "/pipeline/list", icon: List, label: "List View" },
    ],
  },
  {
    label: "CRM",
    items: [
      { href: "/contacts", icon: Users, label: "Contacts" },
      { href: "/accounts", icon: Building2, label: "Accounts" },
      { href: "/activities", icon: Activity, label: "Activities" },
    ],
  },
  {
    label: "Reports",
    items: [
      { href: "/reports/pipeline", icon: BarChart3, label: "Pipeline" },
      { href: "/reports/forecast", icon: BarChart3, label: "Forecast" },
      { href: "/reports/performance", icon: BarChart3, label: "Performance" },
    ],
  },
  {
    label: "Settings",
    items: [
      { href: "/settings/workspace", icon: Settings, label: "Workspace" },
      { href: "/settings/pipeline", icon: Settings, label: "Pipeline" },
      { href: "/settings/products", icon: Settings, label: "Products" },
      { href: "/settings/members", icon: Settings, label: "Members" },
      { href: "/settings/targets", icon: Settings, label: "Sales Targets" },
      { href: "/settings/integrations", icon: Settings, label: "Integrations" },
      { href: "/settings/webhooks", icon: Settings, label: "Webhooks" },
    ],
  },
];

export function Sidebar({ className }: { className?: string }) {
  const pathname = usePathname();
  const [collapsed, setCollapsed] = useState<Record<string, boolean>>({});

  const toggle = (label: string) =>
    setCollapsed((prev) => ({ ...prev, [label]: !prev[label] }));

  return (
    <aside
      className={cn(
        "flex flex-col w-60 border-r bg-gray-50/50 h-full overflow-y-auto",
        className
      )}
    >
      <nav className="flex-1 px-3 py-4 space-y-1">
        {navGroups.map((group) => {
          const isCollapsed = collapsed[group.label];
          return (
            <div key={group.label}>
              <button
                className="flex items-center w-full px-2 py-1.5 text-xs font-semibold text-gray-500 uppercase tracking-wider hover:text-gray-700"
                onClick={() => toggle(group.label)}
              >
                {isCollapsed ? (
                  <ChevronRight className="h-3 w-3 mr-1" />
                ) : (
                  <ChevronDown className="h-3 w-3 mr-1" />
                )}
                {group.label}
              </button>
              {!isCollapsed && (
                <div className="mt-1 space-y-0.5 mb-3">
                  {group.items.map((item) => {
                    const isActive =
                      pathname === item.href ||
                      (item.href !== "/dashboard" && pathname.startsWith(item.href));
                    return (
                      <Link
                        key={item.href}
                        href={item.href}
                        className={cn(
                          "flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors",
                          isActive
                            ? "bg-orange-50 text-orange-700 border border-orange-200"
                            : "text-gray-600 hover:bg-gray-100 hover:text-gray-900"
                        )}
                      >
                        <item.icon className="h-4 w-4 shrink-0" />
                        {item.label}
                      </Link>
                    );
                  })}
                </div>
              )}
            </div>
          );
        })}
      </nav>
    </aside>
  );
}
