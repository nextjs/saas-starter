// Session helper — loads workspace memberships from Prisma.
// Use this in API routes and server components (Node.js runtime only).
// Do NOT import this in middleware (edge runtime).

import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

export async function getSessionWithWorkspaces() {
  const session = await auth();
  if (!session?.user?.id) return null;

  const memberships = await prisma.workspaceMember.findMany({
    where: { userId: session.user.id },
    include: {
      workspace: {
        select: {
          id: true,
          slug: true,
          subdomain: true,
          plan: true,
        },
      },
    },
  });

  session.user.workspaces = memberships.map((m) => ({
    id: m.workspace.id,
    slug: m.workspace.slug,
    subdomain: m.workspace.subdomain,
    plan: m.workspace.plan,
    role: m.role,
    memberId: m.id,
  }));

  return session;
}
