import { withRateLimit } from '@/lib/rate-limit/utils';
import { getTeamForUser } from '@/lib/db/queries';

async function handleGetTeam() {
  const team = await getTeamForUser();
  return Response.json(team);
}

export const GET = withRateLimit(handleGetTeam);
