import { redirect } from "next/navigation";
import { Settings } from "./settings";
import { getUser } from "@/lib/db/queries";

export default async function SettingsPage() {
  const user = await getUser();

  if (!user) {
    redirect("/sign-in");
  }

  return <Settings userData={user} />;
}
