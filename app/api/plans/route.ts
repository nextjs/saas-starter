import { getPlans } from '@/lib/db/queries';

export async function GET() {
  const plans = await getPlans();
  return Response.json(plans);
}