import { redirect } from "next/navigation";
import { Settings } from "./settings";
import { getUser } from "@/lib/db/queries";

export default async function SettingsPage() {
  const user = await getUser();

  // El AuthWrapper ya maneja la redirección, pero por seguridad
  // verificamos también aquí para evitar errores de tipo
  if (!user) {
    redirect("/sign-in");
  }

  return <Settings userData={user} />;
}
