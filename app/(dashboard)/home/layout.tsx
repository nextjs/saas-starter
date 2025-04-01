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
  Plus,
} from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Twitter } from "@/app/assets/svg";
import Image from "next/image";
import UserCard from "./user-card";
import ClickSpark from "@/components/Animations/ClickSpark/ClickSpark";
import NullCreate from "@/app/components/slidebar/null-create";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const navItems: any[] = [
    // { href: "/home", icon: House, label: "Home" },
    // { href: "/home/general", icon: Grip, label: "Kol List" },
  ];

  return (
    <div className="flex flex-col min-h-[calc(100dvh)] max-w-full mx-auto w-full">
      {/* Mobile header */}
      <div className="md:hidden flex items-center justify-between bg-white shadow-sm p-2 text-primary">
        <div className="flex items-center">
          <Link href="/home" className="flex items-center">
            <CircleIcon className="h-4 w-4 text-secondary md:w-6 md:h-6" />
            <span className="ml-2 text-base font-bold text-primary md:text-xl">
              KOL AGENT
            </span>
          </Link>
        </div>
        <Button
          className=""
          variant="ghost"
          onClick={() => setIsSidebarOpen(!isSidebarOpen)}
        >
          <Menu className="h-6 w-6" />
        </Button>
      </div>

      <div className="flex flex-1 overflow-hidden h-full w-full relative">
        {/* mask */}
        <div
          className={`absolute inset-0 bg-black/20 z-30 transition-opacity duration-300 backdrop-blur-sm ease-in-out md:hidden ${
            isSidebarOpen ? "opacity-100" : "opacity-0"
          }`}
          onClick={() => setIsSidebarOpen(false)}
        ></div>
        {/* Sidebar */}
        <aside
          className={`w-50 h-full bg-white shadow-sm md:block text-primary transform transition-transform duration-300 ease-in-out md:translate-x-0 absolute   left-0 top-0 z-40 ${
            isSidebarOpen ? "translate-x-0" : "-translate-x-full w-0"
          }`}
        >
          <div className="w-full h-full flex flex-col">
            <div className="items-center justify-center py-6 pb-0 px-4 hidden md:flex">
              <Link href="/home" className="flex items-center">
                <CircleIcon className="h-6 w-6 text-secondary" />
                <span className="ml-2 text-lg font-bold text-primary">
                  KOL AGENT
                </span>
              </Link>
            </div>
            <nav className="h-full overflow-y-auto p-4 flex flex-col gap-1">
              <div className="flex items-center justify-center my-2">
                <Button className="w-full flex items-center justify-center gap-2">
                  <Plus className="h-4 w-4" />
                  <span className="text-base">Create KOL Agent</span>
                </Button>
              </div>
              {navItems.map((item) => (
                <Link key={item.href} href={item.href} passHref>
                  <Button
                    variant={pathname === item.href ? "secondary" : "ghost"}
                    className={`shadow-none w-full justify-start text-base px-2 ${
                      pathname === item.href ? "bg-gray-100" : ""
                    }`}
                    onClick={() => setIsSidebarOpen(false)}
                  >
                    <item.icon className="mr-2 h-3 w-3" />
                    {item.label}
                  </Button>
                </Link>
              ))}
              <div className="w-full h-full">
                {true ? <NullCreate /> : null}
              </div>
            </nav>
            <div className="flex items-center justify-center p-4 mt-auto">
              {true ? (
                <UserCard />
              ) : (
                <Button className="w-full flex items-center justify-center gap-2">
                  <Image
                    src={Twitter}
                    alt="Twitter"
                    className="h-4 w-4 text-white"
                  />
                  <span className="inline-block text-base">Sign In</span>
                </Button>
              )}
            </div>
          </div>
        </aside>

        {/* Main content */}
        <ScrollArea className="w-full h-screen flex-1 overflow-y-auto p-0 transition-all duration-300 ease-in-out md:pl-50">
          <ClickSpark
            sparkColor="#000"
            sparkSize={10}
            sparkRadius={15}
            sparkCount={8}
            duration={400}
          >
            <main className="w-full h-full">{children}</main>
          </ClickSpark>
        </ScrollArea>
      </div>
    </div>
  );
}
