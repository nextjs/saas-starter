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

// This is sample data.
const data = {
  user: {
    name: "Someone",
    email: "someone@example.com",
    avatar: "",
  },
  teams: [
    {
      name: "Some team",
      avatar: "",
    }
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
        }
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
        }
      ],
    },
    {
      title: "Settings",
      url: "#",
      icon: Settings2,
      items: [
        {
          title: "General",
          url: "/dashboard/general",
        },
        {
          title: "User Log",
          url: "/dashboard/user-log",
        }
      ],
    },
  ]
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
        <NavUser/>
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  );
}
