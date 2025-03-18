"use client";

import { useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { useUser } from "@/lib/auth";

// Rutas que no requieren autenticación
const publicRoutes = [
  "/sign-in",
  "/sign-up",
  "/pricing",
  "/reset-password",
  "/verify",
];

// Rutas que no requieren verificación de membresía
const noSubscriptionRequiredRoutes = [...publicRoutes, "/billing"];

export default function AuthWrapper({
  children,
}: {
  children: React.ReactNode;
}) {
  const { userPromise } = useUser();
  const router = useRouter();
  const pathname = usePathname();
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function checkAuth() {
      try {
        // Verificar si la ruta actual es pública
        if (publicRoutes.some((route) => pathname.startsWith(route))) {
          setIsLoading(false);
          return;
        }

        // Obtener usuario
        const user = await userPromise;

        // Si no hay usuario y no estamos en una ruta pública, redirigir a sign-in
        if (
          !user &&
          !publicRoutes.some((route) => pathname.startsWith(route))
        ) {
          router.push("/sign-in");
          return;
        }

        // Verificar si el usuario necesita una suscripción para esta ruta
        const requiresSubscription = !noSubscriptionRequiredRoutes.some(
          (route) => pathname.startsWith(route)
        );

        // Si la ruta requiere suscripción, verificar si el usuario tiene una activa
        if (requiresSubscription && user) {
          const hasActiveSubscription =
            user.subscriptionStatus &&
            ["active", "trialing"].includes(user.subscriptionStatus);

          if (!hasActiveSubscription) {
            router.push("/pricing");
            return;
          }
        }

        setIsLoading(false);
      } catch (error) {
        console.error("Auth check error:", error);
        setIsLoading(false);
      }
    }

    checkAuth();
  }, [userPromise, router, pathname]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        Cargando...
      </div>
    );
  }

  return <>{children}</>;
}
