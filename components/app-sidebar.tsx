"use client";

import * as React from "react";

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
import { NAVIGATION } from "@/lib/constants";

// This is sample data.
const data = {
  teams: [
    {
      name: "Some team",
      avatar: "",
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
        <NavMain items={NAVIGATION.navMain} />
      </SidebarContent>
      <SidebarFooter>
        <NavUser />
        <ThemeToggle />
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  );
}
