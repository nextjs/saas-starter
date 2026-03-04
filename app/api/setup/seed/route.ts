import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

const MENDIX_STAGES = [
  { name: "Discovery",     position: 0, probability: 20,  color: "#3b82f6", isWon: false, isLost: false, rottenDays: 21 },
  { name: "Qualification", position: 1, probability: 35,  color: "#a855f7", isWon: false, isLost: false, rottenDays: 14 },
  { name: "Proposal",      position: 2, probability: 60,  color: "#fbbf24", isWon: false, isLost: false, rottenDays: 14 },
  { name: "Negotiation",   position: 3, probability: 80,  color: "#f97316", isWon: false, isLost: false, rottenDays: 10 },
  { name: "Won",           position: 4, probability: 100, color: "#22c55e", isWon: true,  isLost: false, rottenDays: null },
  { name: "Lost",          position: 5, probability: 0,   color: "#ef4444", isWon: false, isLost: true,  rottenDays: null },
];

const MENDIX_PRODUCTS = [
  { name: "Mendix Studio Pro License",          category: "License",     unitPrice: 15000, sku: "MX-LIC-STUDIO",   currency: "USD" },
  { name: "Mendix Enterprise License",          category: "License",     unitPrice: 40000, sku: "MX-LIC-ENT",      currency: "USD" },
  { name: "Mendix Starter Training (2 days)",   category: "Training",    unitPrice: 2500,  sku: "MX-TRN-START",    currency: "USD" },
  { name: "Mendix Advanced Developer Training", category: "Training",    unitPrice: 4500,  sku: "MX-TRN-ADV",      currency: "USD" },
  { name: "Mendix Architecture Bootcamp",       category: "Training",    unitPrice: 6500,  sku: "MX-TRN-ARCH",     currency: "USD" },
  { name: "Development Sprint (4 weeks)",       category: "Development", unitPrice: 24000, sku: "MX-DEV-SPRINT4",  currency: "USD" },
  { name: "Development Sprint (8 weeks)",       category: "Development", unitPrice: 44000, sku: "MX-DEV-SPRINT8",  currency: "USD" },
  { name: "Low-Code Strategy Consulting",       category: "Consulting",  unitPrice: 3500,  sku: "MX-CON-STRAT",    currency: "USD" },
  { name: "Platform Migration Assessment",      category: "Consulting",  unitPrice: 8500,  sku: "MX-CON-MIG",      currency: "USD" },
  { name: "Mendix Support SLA (annual)",        category: "Support",     unitPrice: 6000,  sku: "MX-SUP-ANNUAL",   currency: "USD" },
];

const DEFAULT_TAGS = [
  { name: "Decision Maker", color: "#f97316" },
  { name: "Champion",       color: "#22c55e" },
  { name: "Economic Buyer", color: "#3b82f6" },
  { name: "Influencer",     color: "#a855f7" },
  { name: "Technical",      color: "#06b6d4" },
  { name: "Blocker",        color: "#ef4444" },
];

export async function POST(req: Request) {
  // Protect with CRON_SECRET or AUTH_SECRET
  const authHeader = req.headers.get("authorization");
  const secret = process.env.CRON_SECRET || process.env.AUTH_SECRET;
  if (!secret || authHeader !== `Bearer ${secret}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const log: string[] = [];

    // Workspace
    const workspace = await prisma.workspace.upsert({
      where: { slug: "orangeleaf" },
      update: {},
      create: {
        name: "Orangeleaf Consulting",
        slug: "orangeleaf",
        subdomain: "orangeleaf",
        plan: "enterprise",
        reportingCurrency: "USD",
        timezone: "Asia/Singapore",
      },
    });
    log.push(`Workspace: ${workspace.name} (${workspace.id})`);

    // Pipeline
    const pipeline = await prisma.pipeline.upsert({
      where: { id: "pipeline-mendix-default" },
      update: {},
      create: {
        id: "pipeline-mendix-default",
        workspaceId: workspace.id,
        name: "Mendix Sales Pipeline",
        isDefault: true,
        currency: "USD",
      },
    });

    // Stages
    for (const stage of MENDIX_STAGES) {
      const stageId = `stage-${stage.name.toLowerCase().replace(/\s+/g, "-")}`;
      await prisma.stage.upsert({
        where: { id: stageId },
        update: stage,
        create: { id: stageId, pipelineId: pipeline.id, ...stage },
      });
    }
    log.push(`Stages: ${MENDIX_STAGES.length} created`);

    // Products
    for (const product of MENDIX_PRODUCTS) {
      const productId = `prod-${product.sku}`;
      await prisma.product.upsert({
        where: { id: productId },
        update: product,
        create: { id: productId, workspaceId: workspace.id, ...product },
      });
    }
    log.push(`Products: ${MENDIX_PRODUCTS.length} created`);

    // Tags
    for (const tag of DEFAULT_TAGS) {
      await prisma.tag.upsert({
        where: { workspaceId_name: { workspaceId: workspace.id, name: tag.name } },
        update: {},
        create: { workspaceId: workspace.id, ...tag },
      });
    }
    log.push(`Tags: ${DEFAULT_TAGS.length} created`);

    // Dev admin user
    const adminUser = await prisma.user.upsert({
      where: { email: "admin@orangeleaf.com" },
      update: {},
      create: {
        name: "Admin User",
        email: "admin@orangeleaf.com",
        emailVerified: new Date(),
      },
    });
    await prisma.workspaceMember.upsert({
      where: {
        workspaceId_userId: { workspaceId: workspace.id, userId: adminUser.id },
      },
      update: {},
      create: { workspaceId: workspace.id, userId: adminUser.id, role: "OWNER" },
    });
    log.push(`Admin: admin@orangeleaf.com (OWNER)`);

    // Allowed domains
    await prisma.allowedDomain.upsert({
      where: { workspaceId_domain: { workspaceId: workspace.id, domain: "orangeleaf.com" } },
      update: {},
      create: { workspaceId: workspace.id, domain: "orangeleaf.com", isInternal: true },
    });
    log.push(`Allowed domain: orangeleaf.com`);

    return NextResponse.json({ ok: true, log });
  } catch (error) {
    console.error("Seed failed:", error);
    return NextResponse.json(
      { error: "Seed failed", details: String(error) },
      { status: 500 },
    );
  }
}
