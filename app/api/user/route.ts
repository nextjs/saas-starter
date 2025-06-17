import { getUser } from '@/lib/db/queries';
import { withRateLimit } from '@/lib/rate-limit/utils';

async function handleGetUser() {
  const user = await getUser();
  return Response.json(user);
}

// Apply rate limiting to the GET handler
export const GET = withRateLimit(handleGetUser);
