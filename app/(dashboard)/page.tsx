import { redirect } from "next/navigation";

export default function DashboardPage() {
  // Redirigir a la página de dashboard general
  redirect("/dashboard/general");
}
