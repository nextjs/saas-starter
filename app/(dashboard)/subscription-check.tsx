"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { User } from "@/lib/db/schema";

export function ConfirmUserSubscription({ user }: { user: User }) {
  const router = useRouter();

  useEffect(() => {
    // Verificar si el usuario tiene una suscripción activa
    const hasActiveSubscription =
      user.subscriptionStatus &&
      ["active", "trialing"].includes(user.subscriptionStatus);

    // Si no tiene suscripción activa, redirigir a la página de precios
    if (!hasActiveSubscription) {
      router.push("/pricing");
    }
  }, [user, router]);

  // Este componente no renderiza nada, solo hace la verificación
  return null;
}
