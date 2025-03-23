import { redirect } from 'next/navigation';
import { Settings } from './settings';
import { getUser } from '@/utils/supabase/server';

export default async function SettingsPage() {
  const user = await getUser();

  if (!user) {
    redirect("/sign-in");
  }

  const teamData = {
    id: 1,
    name: "My Team",
    createdAt: new Date(),
    updatedAt: new Date(),
    members: [
      {
        id: 1,
        userId: parseInt(user.id),
        role: "admin",
        user: {
          id: parseInt(user.id),
          name: user.user_metadata.name || null,
          email: user.email || ""
        }
      }
    ]
  }

  if (!teamData) {
    throw new Error("Team not found");
  }

  return <Settings teamData={teamData} />;
}
