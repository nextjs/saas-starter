// Workspace resolution helpers — used by API routes and server components
// Resolves workspace from subdomain header (set by middleware)

import { headers } from "next/headers";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function getWorkspaceFromRequest() {
  const headersList = await headers();
  const subdomain = headersList.get("x-workspace-subdomain");

  // Dev fallback: no subdomain on localhost — use first workspace
  if (!subdomain) {
    return prisma.workspace.findFirst({
      include: { pipelines: { include: { stages: { orderBy: { position: "asc" } } } } },
    });
  }

  return prisma.workspace.findUnique({
    where: { subdomain },
    include: { pipelines: { include: { stages: { orderBy: { position: "asc" } } } } },
  });
}

export async function requireWorkspaceMember() {
  const session = await auth();
  if (!session?.user?.id) {
    return { error: NextResponse.json({ error: "Unauthorized" }, { status: 401 }) };
  }

  const workspace = await getWorkspaceFromRequest();
  if (!workspace) {
    return { error: NextResponse.json({ error: "Workspace not found" }, { status: 404 }) };
  }

  const member = await prisma.workspaceMember.findUnique({
    where: {
      workspaceId_userId: {
        workspaceId: workspace.id,
        userId: session.user.id,
      },
    },
    include: { user: true, salesTeams: { include: { salesTeam: true } } },
  });

  if (!member) {
    return { error: NextResponse.json({ error: "Forbidden" }, { status: 403 }) };
  }

  return { workspace, member, session };
}
