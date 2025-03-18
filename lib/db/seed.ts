import { stripe } from "../payments/stripe";
import { db } from "./drizzle";
import { users } from "./schema";
import { hashPassword } from "@/lib/auth/session";
import { eq, sql } from "drizzle-orm";

async function createStripeProducts() {
  console.log("Creating Stripe products and prices...");

  // Verificar si ya existen productos
  const existingProducts = await stripe.products.list({
    limit: 10,
  });

  // Crear producto Base si no existe
  let baseProduct = existingProducts.data.find((p) => p.name === "Base");
  if (!baseProduct) {
    baseProduct = await stripe.products.create({
      name: "Base",
      description: "Base subscription plan",
    });

    await stripe.prices.create({
      product: baseProduct.id,
      unit_amount: 800, // $8 in cents
      currency: "usd",
      recurring: {
        interval: "month",
      },
    });
  }

  // Crear producto Plus si no existe
  let plusProduct = existingProducts.data.find((p) => p.name === "Plus");
  if (!plusProduct) {
    plusProduct = await stripe.products.create({
      name: "Plus",
      description: "Plus subscription plan",
    });

    await stripe.prices.create({
      product: plusProduct.id,
      unit_amount: 1200, // $12 in cents
      currency: "usd",
      recurring: {
        interval: "month",
      },
    });
  }

  console.log("Stripe products and prices verified/created.");
}

async function seed() {
  try {
    // Limpiar datos existentes
    console.log("Cleaning existing data...");

    // Eliminar los datos de usuario (borrado suave)
    await db
      .update(users)
      .set({
        deletedAt: new Date(),
        email: sql`CONCAT(email, '-', id, '-deleted')`,
      })
      .where(eq(users.email, "test@test.com"));

    console.log("Existing data cleaned.");

    // Crear nuevo usuario
    const email = "test@test.com";
    const password = "admin123";
    const passwordHash = await hashPassword(password);

    const [user] = await db
      .insert(users)
      .values([
        {
          email: email,
          passwordHash: passwordHash,
          role: "owner",
          name: "Test User",
        },
      ])
      .returning();

    console.log("Initial user created:", user);

    await createStripeProducts();
    console.log("Seed completed successfully.");
  } catch (error) {
    console.error("Error in seed process:", error);
    throw error;
  }
}

seed()
  .catch((error) => {
    console.error("Seed process failed:", error);
    process.exit(1);
  })
  .finally(() => {
    console.log("Seed process finished. Exiting...");
    process.exit(0);
  });
