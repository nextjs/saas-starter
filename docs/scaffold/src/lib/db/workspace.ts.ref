// src/lib/db/workspace.ts
// Workspace resolution helpers — used by server components and API routes

import { cache } from "react";
import { headers } from "next/headers";
import { auth } from "@/lib/auth/config";
import { db } from "@/lib/db";

// Resolve the current workspace from the subdomain.
// Called once per request — React cache() deduplicates within a render.
export const getWorkspaceFromRequest = cache(async () => {
  const host = headers().get("host") ?? "";

  // e.g. "orangeleaf.crm.com" → "orangeleaf"
  // or   "localhost:3000"  → dev fallback
  const subdomain = host.split(".")[0];

  if (!subdomain || subdomain === "www" || subdomain === "localhost") {
    return null;
  }

  return db.workspace.findUnique({
    where: { subdomain },
    include: { pipelines: { include: { stages: { orderBy: { position: "asc" } } } } },
  });
});

// Get the current user's membership in the resolved workspace
export const getWorkspaceMembership = cache(async () => {
  const [session, workspace] = await Promise.all([
    auth(),
    getWorkspaceFromRequest(),
  ]);

  if (!session?.user?.id || !workspace) return null;

  return db.workspaceMember.findUnique({
    where: {
      workspaceId_userId: {
        workspaceId: workspace.id,
        userId: session.user.id,
      },
    },
    include: { user: true, workspace: true },
  });
});

// Guard: require authenticated workspace member, throw redirect if not
export async function requireWorkspaceMember() {
  const membership = await getWorkspaceMembership();
  if (!membership) {
    throw new Error("UNAUTHORIZED"); // caught by middleware
  }
  return membership;
}
