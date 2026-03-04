import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireWorkspaceMember } from "@/lib/db/workspace";
import { resolveSharePointUrl, getGraphTokenForMember } from "@/lib/integrations/sharepoint";
import { z } from "zod";

const LinkDocSchema = z.object({
  url: z.string().url(),
  title: z.string().optional(), // Falls back to resolved title from Graph
});

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const ctx = await requireWorkspaceMember();
  if ("error" in ctx) return ctx.error;
  const { workspace } = ctx;
  const { id } = await params;

  const documents = await prisma.linkedDocument.findMany({
    where: { workspaceId: workspace.id, opportunityId: id },
    orderBy: { createdAt: "desc" },
    include: {
      linkedBy: { include: { user: { select: { name: true } } } },
    },
  });

  return NextResponse.json({ documents });
}

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const ctx = await requireWorkspaceMember();
  if ("error" in ctx) return ctx.error;
  const { workspace, member } = ctx;
  const { id } = await params;

  if (member.role === "VIEWER") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  // Verify opportunity exists in this workspace
  const opp = await prisma.opportunity.findFirst({
    where: { id, workspaceId: workspace.id },
    select: { id: true },
  });
  if (!opp) return NextResponse.json({ error: "Opportunity not found" }, { status: 404 });

  const body = await req.json();
  const parsed = LinkDocSchema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: parsed.error.flatten() }, { status: 422 });

  // Try to resolve metadata from Microsoft Graph
  let metadata: Awaited<ReturnType<typeof resolveSharePointUrl>> = null;
  const token = await getGraphTokenForMember(workspace.id, member.userId);
  if (token) {
    metadata = await resolveSharePointUrl(token, parsed.data.url);
  }

  const document = await prisma.linkedDocument.create({
    data: {
      workspaceId: workspace.id,
      opportunityId: id,
      title: parsed.data.title ?? metadata?.title ?? "Document",
      url: parsed.data.url,
      driveItemId: metadata?.driveItemId,
      siteId: metadata?.siteId,
      fileType: metadata?.fileType,
      fileSize: metadata?.fileSize,
      lastModifiedAt: metadata?.lastModifiedAt,
      lastModifiedBy: metadata?.lastModifiedBy,
      linkedById: member.id,
    },
    include: {
      linkedBy: { include: { user: { select: { name: true } } } },
    },
  });

  return NextResponse.json({ document }, { status: 201 });
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const ctx = await requireWorkspaceMember();
  if ("error" in ctx) return ctx.error;
  const { workspace, member } = ctx;
  const { id: opportunityId } = await params;

  const docId = req.nextUrl.searchParams.get("docId");
  if (!docId) return NextResponse.json({ error: "docId required" }, { status: 400 });

  const doc = await prisma.linkedDocument.findFirst({
    where: { id: docId, workspaceId: workspace.id, opportunityId },
  });
  if (!doc) return NextResponse.json({ error: "Not found" }, { status: 404 });

  // Only the linker, admin, or owner can unlink
  if (doc.linkedById !== member.id && !["ADMIN", "OWNER"].includes(member.role)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  await prisma.linkedDocument.delete({ where: { id: docId } });
  return NextResponse.json({ ok: true });
}
