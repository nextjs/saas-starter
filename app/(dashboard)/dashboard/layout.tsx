import { redirect } from "next/navigation";
import { getUser } from "@/lib/db/queries";

export default async function DashboardPagesLayout({
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

  // Si no tiene suscripción activa, redirigir a precios
  if (!hasActiveSubscription) {
    redirect("/pricing");
  }

  return <>{children}</>;
}
