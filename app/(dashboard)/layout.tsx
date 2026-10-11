"use client";

import Link from "next/link";
import { use, useState, Suspense } from "react";
import { Button } from "@/components/ui/button";
import { CircleIcon, Home, LogOut } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { signOut } from "next-auth/react";
import { useRouter } from "next/navigation";
import { User } from "@/lib/db/schema";
import useSWR, { mutate } from "swr";
// Import the SVG as a component properly
import Image from "next/image";
import LogoSrc from "@/lib/images/LastLayer-Full.svg";

const fetcher = (url: string) => fetch(url).then((res) => res.json());

function UserMenu() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { data: user } = useSWR<User>("/api/user", fetcher);
  const router = useRouter();

  async function handleSignOut() {
    await signOut({ callbackUrl: "/" });
    mutate("/api/user");
    router.push("/");
  }

  return (
    <>
      <Link
        href="/products"
        className="text-sm font-medium text-gray-700 hover:text-gray-900"
      >
        Products
      </Link>
      <Link
        href="/develop"
        className="text-sm font-medium text-gray-700 hover:text-gray-900"
      >
        Develop
      </Link>
      {!user && (
        <Button asChild className="rounded-full">
          <Link href="/sign-up">Sign Up</Link>
        </Button>
      )}
      {user && (
        <DropdownMenu open={isMenuOpen} onOpenChange={setIsMenuOpen}>
          <DropdownMenuTrigger>
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
          <DropdownMenuContent align="end" className="flex flex-col gap-1">
            <DropdownMenuItem className="cursor-pointer">
              <Link href="/dashboard" className="flex w-full items-center">
                <Home className="mr-2 h-4 w-4" />
                <span>Dashboard</span>
              </Link>
            </DropdownMenuItem>
            <form action={handleSignOut} className="w-full">
              <button type="submit" className="flex w-full">
                <DropdownMenuItem className="w-full flex-1 cursor-pointer">
                  <LogOut className="mr-2 h-4 w-4" />
                  <span>Sign out</span>
                </DropdownMenuItem>
              </button>
            </form>
          </DropdownMenuContent>
        </DropdownMenu>
      )}
    </>
  );
}

function Header() {
  return (
    <header className="border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
        <Link href="/" className="flex items-center">
          {/* Use the Logo component properly */}
          <Image src={LogoSrc} alt="Logo" className="ml-2 h-10 w-auto" />
        </Link>
        <div className="flex items-center space-x-4">
          <Suspense fallback={<div className="h-9" />}>
            <UserMenu />
          </Suspense>
        </div>
      </div>
    </header>
  );
}

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <section className="flex flex-col min-h-screen">
      <Header />
      {children}
    </section>
  );
}
