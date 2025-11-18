"use client";

import { signOut } from "@/app/(login)/actions";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { useUser } from "@/contexts/UserContext";
import {
  Activity,
  Bookmark,
  LogOut,
  MessageSquare,
  Send,
  Settings,
  Shield,
  X,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Suspense, useCallback, useMemo, useState } from "react";
import { HiOutlineMenuAlt3 } from "react-icons/hi";

function UserMenu() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const { user, isLoading } = useUser();
  const router = useRouter();

  const handleSignOut = useCallback(async () => {
    await signOut();
    router.push("/");
  }, [router]);

  const closeMobileMenu = useCallback(() => {
    setIsMobileMenuOpen(false);
  }, []);

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

  // Show loading state while user data is being fetched
  if (isLoading) {
    return <div className="h-9 w-9 bg-gray-200 rounded-full animate-pulse" />;
  }

  if (!user) {
    // Desktop: keep inline Pricing + Sign Up
    // Mobile: provide a sheet menu
    return (
      <>
        <div className="hidden lg:flex items-center space-x-4">
          <Link
            href="/pricing"
            className="text-sm font-medium text-gray-700 hover:text-gray-900"
          >
            Pricing
          </Link>
          <Button asChild className="rounded-full">
            <Link href="/sign-up">Sign Up</Link>
          </Button>
        </div>

        <Sheet open={isMobileMenuOpen} onOpenChange={setIsMobileMenuOpen}>
          <SheetTrigger
            aria-label="Open menu"
            className="p-2 rounded-md lg:hidden text-gray-700 hover:bg-gray-100 transition-colors"
          >
            <HiOutlineMenuAlt3 className="h-6 w-6" />
          </SheetTrigger>

          <SheetContent side="right">
            <SheetHeader className="border-b-0">
              <div className="flex items-center justify-between">
                <SheetTitle>Menu</SheetTitle>
                <SheetClose className="p-2 rounded-md hover:bg-gray-100 transition-colors">
                  <X className="h-5 w-5 text-gray-500" />
                </SheetClose>
              </div>
            </SheetHeader>

            <nav className="flex flex-col gap-1 px-6 py-4">
              <Link
                href="/sign-in"
                onClick={closeMobileMenu}
                className="flex items-center gap-3 px-4 py-3 rounded-lg text-gray-700 hover:bg-gray-100 transition-colors"
              >
                <span className="font-medium">Sign In</span>
              </Link>

              <Link
                href="/sign-up"
                onClick={closeMobileMenu}
                className="flex items-center gap-3 px-4 py-3 rounded-lg text-gray-700 hover:bg-gray-100 transition-colors"
              >
                <span className="font-medium">Sign Up</span>
              </Link>

              <Link
                href="/pricing"
                onClick={closeMobileMenu}
                className="flex items-center gap-3 px-4 py-3 rounded-lg text-gray-700 hover:bg-gray-100 transition-colors"
              >
                <span className="font-medium">Pricing</span>
              </Link>
            </nav>
          </SheetContent>
        </Sheet>
      </>
    );
  }

  // nav items to show in the mobile menu (same as sidebar)
  return (
    <>
      {/* Desktop: Avatar dropdown */}
      <div className="hidden lg:block">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Avatar className="cursor-pointer size-9">
              <AvatarImage alt={user.name || ""} />
              <AvatarFallback>
                {user.email
                  .split(" ")
                  .map((n) => n[0])
                  .join("")}
              </AvatarFallback>
            </Avatar>
          </DropdownMenuTrigger>

          <DropdownMenuContent align="end" className="w-56">
            <DropdownMenuItem className="cursor-pointer">
              <Link
                href="/dashboard/settings"
                className="flex w-full items-center"
              >
                <Settings className="mr-2 h-4 w-4" />
                <span>Settings</span>
              </Link>
            </DropdownMenuItem>

            <DropdownMenuSeparator />

            <form action={handleSignOut} className="w-full">
              <button type="submit" className="flex w-full">
                <DropdownMenuItem className="w-full flex-1 cursor-pointer text-red-600">
                  <LogOut className="mr-2 h-4 w-4" />
                  <span>Sign out</span>
                </DropdownMenuItem>
              </button>
            </form>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {/* Mobile: Sheet menu */}
      <Sheet open={isMobileMenuOpen} onOpenChange={setIsMobileMenuOpen}>
        <SheetTrigger
          aria-label="Open menu"
          data-onboarding="mobile-menu"
          className="p-2 rounded-md lg:hidden text-gray-700 hover:bg-gray-100 transition-colors"
        >
          <HiOutlineMenuAlt3 className="h-6 w-6" />
        </SheetTrigger>

        <SheetContent side="right">
          <SheetHeader className="border-b-0">
            <div className="flex items-center justify-between">
              <SheetTitle>Menu</SheetTitle>
              <SheetClose className="p-2 rounded-md hover:bg-gray-100 transition-colors">
                <X className="h-5 w-5 text-gray-500" />
              </SheetClose>
            </div>
          </SheetHeader>

          <nav className="flex flex-col gap-1 px-6 py-4">
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                onClick={closeMobileMenu}
                className="flex items-center gap-3 px-4 py-3 rounded-lg text-gray-700 hover:bg-gray-100 transition-colors"
              >
                <item.icon className="h-5 w-5 text-gray-500" />
                <span className="font-medium">{item.label}</span>
              </Link>
            ))}

            <div className="mt-4 pt-4 border-t border-gray-200">
              <form action={handleSignOut} className="w-full">
                <button
                  type="submit"
                  className="flex items-center gap-3 px-4 py-3 rounded-lg text-red-600 hover:bg-red-50 transition-colors w-full"
                >
                  <LogOut className="h-5 w-5" />
                  <span className="font-medium">Sign out</span>
                </button>
              </form>
            </div>
          </nav>
        </SheetContent>
      </Sheet>
    </>
  );
}

function Logo() {
  const { user } = useUser();

  const logoContent = (
    <div className="flex items-center gap-2">
      <Image
        src="/unvios-logo.png"
        alt="Unvios logo"
        width={30}
        height={30}
        className="object-contain"
      />
      <span className="text-xl font-bold text-gray-900">UNVIOS</span>
    </div>
  );

  // If user is not logged in, make logo clickable and redirect to home
  if (!user) {
    return (
      <Link
        href="/"
        className="flex items-center hover:opacity-80 transition-opacity"
      >
        {logoContent}
      </Link>
    );
  }

  // If user is logged in, keep logo as plain div
  return <div className="flex items-center">{logoContent}</div>;
}

export default function Header() {
  return (
    <header className="border-b border-gray-200 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
        <Suspense fallback={<div className="flex items-center h-6" />}>
          <Logo />
        </Suspense>
        <div className="flex items-center space-x-4">
          <Suspense fallback={<div className="h-9" />}>
            <UserMenu />
          </Suspense>
        </div>
      </div>
    </header>
  );
}
