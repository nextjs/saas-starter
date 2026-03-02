import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

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

async function main() {
  console.log("Seeding Orangeleaf CRM...");

  // Create the Orangeleaf workspace
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
  console.log(`Workspace: ${workspace.name} (${workspace.id})`);

  // Create default Mendix pipeline
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

  // Create stages
  for (const stage of MENDIX_STAGES) {
    const stageId = `stage-${stage.name.toLowerCase().replace(/\s+/g, "-")}`;
    await prisma.stage.upsert({
      where: { id: stageId },
      update: stage,
      create: {
        id: stageId,
        pipelineId: pipeline.id,
        ...stage,
      },
    });
  }
  console.log(`Pipeline stages: ${MENDIX_STAGES.length} stages created`);

  // Create products
  for (const product of MENDIX_PRODUCTS) {
    const productId = `prod-${product.sku}`;
    await prisma.product.upsert({
      where: { id: productId },
      update: product,
      create: {
        id: productId,
        workspaceId: workspace.id,
        ...product,
      },
    });
  }
  console.log(`Products: ${MENDIX_PRODUCTS.length} catalog items created`);

  // Create default tags
  for (const tag of DEFAULT_TAGS) {
    await prisma.tag.upsert({
      where: {
        workspaceId_name: { workspaceId: workspace.id, name: tag.name },
      },
      update: {},
      create: { workspaceId: workspace.id, ...tag },
    });
  }
  console.log(`Tags: ${DEFAULT_TAGS.length} default tags created`);

  // Create a dev admin user for local testing (email: admin@orangeleaf.com, password: admin)
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
      workspaceId_userId: {
        workspaceId: workspace.id,
        userId: adminUser.id,
      },
    },
    update: {},
    create: {
      workspaceId: workspace.id,
      userId: adminUser.id,
      role: "OWNER",
    },
  });
  console.log(`Dev admin: admin@orangeleaf.com / admin (OWNER)`);

  // Create allowed domains for Orangeleaf
  await prisma.allowedDomain.upsert({
    where: {
      workspaceId_domain: { workspaceId: workspace.id, domain: "orangeleaf.com" },
    },
    update: {},
    create: {
      workspaceId: workspace.id,
      domain: "orangeleaf.com",
      isInternal: true,
    },
  });
  console.log("Allowed domains: orangeleaf.com (internal)");

  console.log("\nSeed complete!");
  console.log(`  Workspace ID: ${workspace.id}`);
  console.log(`  Subdomain:    ${workspace.subdomain}.orangeleaf.app`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
