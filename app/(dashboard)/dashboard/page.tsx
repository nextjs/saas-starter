import { redirect } from "next/navigation";
import { Settings } from "./settings";
import { getTeamForUser, getUser } from "@/lib/db/queries";
import { getSession } from "@/lib/auth/session";

export default async function SettingsPage() {
  const userSession = await getSession();

  if (!userSession) {
    redirect("/sign-in");
  }

  const teamData = await getTeamForUser(userSession.user.id);

  if (!teamData) {
    throw new Error("Team not found");
  }

  return <Settings teamData={teamData} />;
}
