import { PrismaClient } from "@prisma/client";

const db = new PrismaClient();

// Default Mendix pipeline stages for Orangeleaf
const MENDIX_STAGES = [
  { name: "Discovery",     position: 0, probability: 20, color: "#3b82f6", isWon: false, isLost: false, rottenDays: 21 },
  { name: "Qualification", position: 1, probability: 35, color: "#a855f7", isWon: false, isLost: false, rottenDays: 14 },
  { name: "Proposal",      position: 2, probability: 60, color: "#fbbf24", isWon: false, isLost: false, rottenDays: 14 },
  { name: "Negotiation",   position: 3, probability: 80, color: "#f97316", isWon: false, isLost: false, rottenDays: 10 },
  { name: "Won",           position: 4, probability: 100, color: "#22c55e", isWon: true,  isLost: false, rottenDays: null },
  { name: "Lost",          position: 5, probability: 0,   color: "#ef4444", isWon: false, isLost: true,  rottenDays: null },
];

// Default Mendix products catalog
const MENDIX_PRODUCTS = [
  { name: "Mendix Studio Pro License",           category: "License",     unitPrice: 15000, sku: "MX-LIC-STUDIO" },
  { name: "Mendix Enterprise License",           category: "License",     unitPrice: 40000, sku: "MX-LIC-ENT" },
  { name: "Mendix Starter Training (2 days)",    category: "Training",    unitPrice: 2500,  sku: "MX-TRN-START" },
  { name: "Mendix Advanced Developer Training",  category: "Training",    unitPrice: 4500,  sku: "MX-TRN-ADV" },
  { name: "Mendix Architecture Bootcamp",        category: "Training",    unitPrice: 6500,  sku: "MX-TRN-ARCH" },
  { name: "Development Sprint (4 weeks)",        category: "Development", unitPrice: 24000, sku: "MX-DEV-SPRINT4" },
  { name: "Development Sprint (8 weeks)",        category: "Development", unitPrice: 44000, sku: "MX-DEV-SPRINT8" },
  { name: "Low-Code Strategy Consulting",        category: "Consulting",  unitPrice: 3500,  sku: "MX-CON-STRAT" },
  { name: "Platform Migration Assessment",       category: "Consulting",  unitPrice: 8500,  sku: "MX-CON-MIG" },
  { name: "Mendix Support SLA (annual)",         category: "Support",     unitPrice: 6000,  sku: "MX-SUP-ANNUAL" },
];

async function main() {
  console.log("🌱 Seeding Orangeleaf CRM...");

  // Create the Orangeleaf workspace
  const workspace = await db.workspace.upsert({
    where: { slug: "orangeleaf" },
    update: {},
    create: {
      name: "Orangeleaf Consulting",
      slug: "orangeleaf",
      subdomain: "orangeleaf",
      plan: "ENTERPRISE",
      currency: "EUR",
      timezone: "Europe/Amsterdam",
    },
  });

  console.log(`✅ Workspace: ${workspace.name}`);

  // Create default pipeline
  const pipeline = await db.pipeline.upsert({
    where: { id: "cldefault" },
    update: {},
    create: {
      id: "cldefault",
      workspaceId: workspace.id,
      name: "Mendix Sales Pipeline",
      isDefault: true,
      currency: "EUR",
    },
  });

  // Create stages
  for (const stage of MENDIX_STAGES) {
    await db.stage.upsert({
      where: { id: `stage-${stage.name.toLowerCase().replace(" ", "-")}` },
      update: stage,
      create: {
        id: `stage-${stage.name.toLowerCase().replace(" ", "-")}`,
        pipelineId: pipeline.id,
        ...stage,
      },
    });
  }
  console.log(`✅ Pipeline stages: ${MENDIX_STAGES.length} stages`);

  // Create products
  for (const product of MENDIX_PRODUCTS) {
    await db.product.upsert({
      where: { id: `prod-${product.sku}` },
      update: product,
      create: {
        id: `prod-${product.sku}`,
        workspaceId: workspace.id,
        ...product,
      },
    });
  }
  console.log(`✅ Products: ${MENDIX_PRODUCTS.length} catalog items`);

  // Seed default tags
  const defaultTags = [
    { name: "Decision Maker", color: "#f97316" },
    { name: "Champion",       color: "#22c55e" },
    { name: "Economic Buyer", color: "#3b82f6" },
    { name: "Influencer",     color: "#a855f7" },
    { name: "Technical",      color: "#06b6d4" },
    { name: "Blocker",        color: "#ef4444" },
  ];

  for (const tag of defaultTags) {
    await db.tag.upsert({
      where: { workspaceId_name: { workspaceId: workspace.id, name: tag.name } },
      update: {},
      create: { workspaceId: workspace.id, ...tag },
    });
  }
  console.log(`✅ Tags: ${defaultTags.length} default tags`);

  console.log("\n🎉 Seed complete!");
  console.log(`   Workspace ID: ${workspace.id}`);
  console.log(`   Subdomain:    ${workspace.subdomain}.crm.orangeleaf.nl`);
}

main()
  .catch(e => { console.error(e); process.exit(1); })
  .finally(() => db.$disconnect());
