import { getTeamForUser } from "@/src/lib/db/queries";

export async function GET() {
  const team = await getTeamForUser();
  return Response.json(team);
}
