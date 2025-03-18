"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { useUser } from "@/lib/auth";
import { use } from "react";
import { CircleIcon } from "lucide-react";

export default function Navigation() {
  const { userPromise } = useUser();
  const user = use(userPromise);

  return (
    <header className="bg-white border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
        <Link href="/" className="flex items-center">
          <CircleIcon className="h-6 w-6 text-orange-500" />
          <span className="ml-2 text-xl font-semibold text-gray-900">ACME</span>
        </Link>
        <nav className="flex items-center space-x-4">
          {user ? (
            <Link href="/dashboard">
              <Button className="bg-orange-500 hover:bg-orange-600 text-white rounded-full">
                Mi dashboard
              </Button>
            </Link>
          ) : (
            <>
              <Link
                href="/sign-in"
                className="text-sm font-medium text-gray-700 hover:text-gray-900"
              >
                Iniciar sesión
              </Link>
              <Link href="/sign-up">
                <Button className="bg-orange-500 hover:bg-orange-600 text-white rounded-full">
                  Crear cuenta
                </Button>
              </Link>
            </>
          )}
        </nav>
      </div>
    </header>
  );
}
