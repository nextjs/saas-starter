import { getUser } from "@/src/lib/db/queries";

export async function GET() {
  const user = await getUser();
  return Response.json(user);
}
