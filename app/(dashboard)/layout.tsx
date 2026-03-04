"use client";

import Link from "next/link";
import { Suspense, useState, useEffect, useRef, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { CircleIcon, LogOut, Menu, Search, X } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { signOutAction } from "@/app/(dashboard)/actions";
import { Sidebar } from "@/components/layout/Sidebar";

interface SearchResults {
  contacts: { id: string; firstName: string; lastName: string; email: string | null }[];
  accounts: { id: string; name: string; domain: string | null }[];
  opportunities: { id: string; name: string; stage: { name: string } | null }[];
}

function GlobalSearch() {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<SearchResults | null>(null);
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!query.trim()) {
      setResults(null);
      setOpen(false);
      return;
    }
    const timer = setTimeout(async () => {
      try {
        const res = await fetch(`/api/workspace/search?q=${encodeURIComponent(query.trim())}`);
        if (res.ok) {
          const data = await res.json();
          setResults(data);
          setOpen(true);
        }
      } catch {
        // silently ignore search errors
      }
    }, 300);
    return () => clearTimeout(timer);
  }, [query]);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleSelect = useCallback(() => {
    setOpen(false);
    setQuery("");
    setResults(null);
  }, []);

  const hasResults =
    results &&
    (results.contacts.length > 0 || results.accounts.length > 0 || results.opportunities.length > 0);

  return (
    <div ref={containerRef} className="relative hidden sm:block w-64 lg:w-80">
      <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 pointer-events-none" />
      <Input
        type="text"
        placeholder="Search contacts, accounts, deals..."
        className="pl-9 h-9 text-sm"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        onFocus={() => {
          if (hasResults) setOpen(true);
        }}
      />
      {open && hasResults && (
        <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-200 rounded-md shadow-lg z-50 max-h-80 overflow-y-auto">
          {results.contacts.length > 0 && (
            <div>
              <div className="px-3 py-1.5 text-xs font-semibold text-gray-500 uppercase tracking-wide bg-gray-50">
                Contacts
              </div>
              {results.contacts.map((c) => (
                <Link
                  key={c.id}
                  href={`/contacts/${c.id}`}
                  className="block px-3 py-2 text-sm hover:bg-gray-100 truncate"
                  onClick={handleSelect}
                >
                  <span className="font-medium">{c.firstName} {c.lastName}</span>
                  {c.email && <span className="ml-2 text-gray-400">{c.email}</span>}
                </Link>
              ))}
            </div>
          )}
          {results.accounts.length > 0 && (
            <div>
              <div className="px-3 py-1.5 text-xs font-semibold text-gray-500 uppercase tracking-wide bg-gray-50">
                Accounts
              </div>
              {results.accounts.map((a) => (
                <Link
                  key={a.id}
                  href={`/accounts/${a.id}`}
                  className="block px-3 py-2 text-sm hover:bg-gray-100 truncate"
                  onClick={handleSelect}
                >
                  <span className="font-medium">{a.name}</span>
                  {a.domain && <span className="ml-2 text-gray-400">{a.domain}</span>}
                </Link>
              ))}
            </div>
          )}
          {results.opportunities.length > 0 && (
            <div>
              <div className="px-3 py-1.5 text-xs font-semibold text-gray-500 uppercase tracking-wide bg-gray-50">
                Opportunities
              </div>
              {results.opportunities.map((o) => (
                <Link
                  key={o.id}
                  href={`/pipeline/${o.id}`}
                  className="block px-3 py-2 text-sm hover:bg-gray-100 truncate"
                  onClick={handleSelect}
                >
                  <span className="font-medium">{o.name}</span>
                  {o.stage && <span className="ml-2 text-gray-400">{o.stage.name}</span>}
                </Link>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function UserMenu() {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger>
        <Avatar className="cursor-pointer size-9">
          <AvatarFallback>U</AvatarFallback>
        </Avatar>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="flex flex-col gap-1">
        <DropdownMenuItem asChild>
          <form action={signOutAction}>
            <button type="submit" className="flex w-full items-center cursor-pointer">
              <LogOut className="mr-2 h-4 w-4" />
              <span>Sign out</span>
            </button>
          </form>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

function Header({ onToggleSidebar }: { onToggleSidebar: () => void }) {
  return (
    <header className="border-b border-gray-200 bg-white sticky top-0 z-30">
      <div className="px-4 sm:px-6 py-3 flex justify-between items-center">
        <div className="flex items-center gap-3">
          <Button
            variant="ghost"
            size="icon"
            className="lg:hidden"
            onClick={onToggleSidebar}
          >
            <Menu className="h-5 w-5" />
          </Button>
          <Link href="/dashboard" className="flex items-center">
            <CircleIcon className="h-6 w-6 text-orange-500" />
            <span className="ml-2 text-lg font-semibold text-gray-900">
              Orangeleaf CRM
            </span>
          </Link>
        </div>
        <div className="flex items-center space-x-3">
          <GlobalSearch />
          <Suspense fallback={<div className="h-9" />}>
            <UserMenu />
          </Suspense>
        </div>
      </div>
    </header>
  );
}

export default function Layout({ children }: { children: React.ReactNode }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <section className="flex flex-col min-h-screen">
      <Header onToggleSidebar={() => setSidebarOpen(!sidebarOpen)} />
      <div className="flex flex-1 overflow-hidden">
        {sidebarOpen && (
          <div className="fixed inset-0 z-40 lg:hidden">
            <div className="fixed inset-0 bg-black/50" onClick={() => setSidebarOpen(false)} />
            <div className="fixed inset-y-0 left-0 w-60 z-50 bg-white">
              <div className="flex items-center justify-end p-2">
                <Button variant="ghost" size="icon" onClick={() => setSidebarOpen(false)}>
                  <X className="h-5 w-5" />
                </Button>
              </div>
              <Sidebar />
            </div>
          </div>
        )}
        <Sidebar className="hidden lg:flex shrink-0" />
        <main className="flex-1 overflow-y-auto bg-gray-50/30">{children}</main>
      </div>
    </section>
  );
}
