"use client";

import { redirect } from "next/navigation";

export default function DashboardPage() {
  // Redirigir directamente a la página de dashboard (ahora solo gestión de suscripción)
  redirect("/dashboard");
}
