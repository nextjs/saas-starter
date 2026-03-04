import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireWorkspaceMember } from "@/lib/db/workspace";

export async function GET(req: NextRequest) {
  const ctx = await requireWorkspaceMember();
  if ("error" in ctx) return ctx.error;
  const { workspace } = ctx;

  const q = req.nextUrl.searchParams.get("q")?.trim();
  if (!q || q.length === 0) {
    return NextResponse.json({ contacts: [], accounts: [], opportunities: [] });
  }

  const [contacts, accounts, opportunities] = await Promise.all([
    prisma.contact.findMany({
      where: {
        workspaceId: workspace.id,
        OR: [
          { firstName: { contains: q, mode: "insensitive" } },
          { lastName: { contains: q, mode: "insensitive" } },
          { email: { contains: q, mode: "insensitive" } },
        ],
      },
      select: {
        id: true,
        firstName: true,
        lastName: true,
        email: true,
      },
      take: 5,
      orderBy: { updatedAt: "desc" },
    }),
    prisma.crmAccount.findMany({
      where: {
        workspaceId: workspace.id,
        OR: [
          { name: { contains: q, mode: "insensitive" } },
          { domain: { contains: q, mode: "insensitive" } },
        ],
      },
      select: {
        id: true,
        name: true,
        domain: true,
      },
      take: 5,
      orderBy: { updatedAt: "desc" },
    }),
    prisma.opportunity.findMany({
      where: {
        workspaceId: workspace.id,
        name: { contains: q, mode: "insensitive" },
      },
      select: {
        id: true,
        name: true,
        stage: { select: { name: true } },
      },
      take: 5,
      orderBy: { updatedAt: "desc" },
    }),
  ]);

  return NextResponse.json({ contacts, accounts, opportunities });
}
