"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Menu } from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";
import UserCard from "./user-card";
import ClickSpark from "@/components/Animations/ClickSpark/ClickSpark";
import NullCreate from "@/app/components/slidebar/null-create";
import Login from "./login";
import { useAppSelector } from "@/app/store/hooks";
import SidebarNav from "@/app/components/slidebar/sidebar-nav";
import { useEffect } from "react";
import { getAgentList } from "@/app/request/api";
import AgentList from "@/app/components/slidebar/agent-list";
export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const isLoggedIn = useAppSelector((state) => state.userReducer.isLoggedIn);
  const navItems: any[] = [
    // { href: "/home", icon: House, label: "Home" },
    // { href: "/home/general", icon: Grip, label: "Kol List" },
  ];

  const [agents, setAgents] = useState<any[]>([]);
  const getAgents = async () => {
    const res = await getAgentList();
    if (res && res.code === 200) {
      setAgents(res.data.filter((item: any) => !!item.x_username));
    }
  };

  useEffect(() => {
    getAgents();
  }, []);

  return (
    <div className="flex flex-col h-[100dvh] max-w-full mx-auto w-full text-primary">
      {/* Mobile header */}
      <div className="md:hidden flex items-center justify-between bg-white shadow-sm p-2 text-primary sticky top-0 left-0 z-50 w-full">
        <div className="flex items-center px-2">
          <Link className="text-2xl font-bold" href="/home">
            Linkol
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

      <div className="flex flex-1 overflow-hidden w-full relative">
        {/* mask */}
        <div
          className={`absolute inset-0 bg-white/20 z-30 transition-opacity duration-300 backdrop-blur-sm ease-in-out md:hidden ${
            isSidebarOpen ? "opacity-100" : "opacity-0 z-[-1]"
          }`}
          onClick={() => setIsSidebarOpen(false)}
        ></div>
        {/* Sidebar */}
        <aside
          className={`w-56 h-full bg-white shadow-sm md:block text-primary transform transition-transform duration-300 ease-in-out md:translate-x-0 absolute   left-0 top-0 z-40 ${
            isSidebarOpen ? "translate-x-0" : "-translate-x-full w-0"
          }`}
        >
          <div className="w-full h-full flex flex-col">
            <div className="items-center justify-center p-6 pb-2 hidden md:flex">
              <Link className="text-2xl font-bold" href="/home">
                Linkol
              </Link>
            </div>
            <SidebarNav />
            <nav className="h-full overflow-y-auto p-4 flex flex-col gap-1">
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
                {isLoggedIn && agents.length === 0 ? (
                  <AgentList agents={agents} />
                ) : (
                  <NullCreate />
                )}
              </div>
            </nav>
            <div className="flex items-center justify-center p-4 mt-auto">
              {isLoggedIn ? <UserCard /> : <Login />}
            </div>
          </div>
        </aside>

        {/* Main content */}
        <ScrollArea className="w-full h-screen flex-1 overflow-y-auto p-0 transition-all duration-300 ease-in-out md:pl-56">
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
