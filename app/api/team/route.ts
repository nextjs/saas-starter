import { getTeamsForUser } from '@/lib/db/queries';

export async function GET() {
  const teams = await getTeamsForUser();
  return Response.json(teams);
}