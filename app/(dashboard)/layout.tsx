"use client";
import { redirect } from "next/navigation";
import { getUser } from "@/lib/db/queries";

export const metadata = {
  title: "Dashboard",
  description: "Dashboard",
};

// Crear layouts anidados para separar la página de precios
export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await getUser();

  if (!user) {
    redirect("/sign-in");
  }

  // Verificar si el usuario tiene una suscripción activa
  const hasActiveSubscription =
    user.subscriptionStatus &&
    ["active", "trialing"].includes(user.subscriptionStatus);

  return (
    <div className="flex min-h-screen flex-col">
      <header className="border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 py-4">
          {/* Header simple para layout */}
        </div>
      </header>
      {children}
    </div>
  );
}
