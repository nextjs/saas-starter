"use client";

import * as React from "react";
import {
  AudioWaveform,
  Key,
  Command,
  GalleryVerticalEnd,
  Settings2,
  ChartLine,
} from "lucide-react";

import { NavMain } from "@/components/nav-main";
import { NavUser } from "@/components/nav-user";
import { TeamSwitcher } from "@/components/team-switcher";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarRail,
} from "@/components/ui/sidebar";
import { ThemeToggle } from "@/components/theme-toggle";

// This is sample data.
const data = {
  teams: [
    {
      name: "Some team",
      avatar: "",
    },
  ],
};

export const navItems = {
  navMain: [
    {
      title: "API Keys",
      url: "#",
      icon: Key,
      items: [
        {
          title: "Overview",
          url: "#",
        },
        {
          title: "Manage API Keys",
          url: "#",
        },
      ],
    },
    {
      title: "Usage",
      url: "#",
      icon: ChartLine,
      items: [
        {
          title: "History",
          url: "#",
        },
      ],
    },
  ],
};

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  return (
    <Sidebar collapsible="icon" {...props}>
      <SidebarHeader>
        <TeamSwitcher teams={data.teams} />
      </SidebarHeader>
      <SidebarContent>
        <NavMain items={navItems.navMain} />
      </SidebarContent>
      <SidebarFooter>
        <NavUser />
        <ThemeToggle />
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  );
}
