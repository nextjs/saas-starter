import { getUser } from '@/lib/db/queries';

export const dynamic = 'force-dynamic';

export async function GET() {
  const user = await getUser();
  return Response.json(user);
}
