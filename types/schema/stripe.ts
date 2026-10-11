import { z } from "zod";

const metadataSchema = z.record(z.string(), z.string());

export const stripeCustomerSchema = z
  .object({
    id: z.string(),
    object: z.literal("customer"),
    address: z
      .object({
        city: z.string().nullable(),
        country: z.string().nullable(),
        line1: z.string().nullable(),
        line2: z.string().nullable(),
        postal_code: z.string().nullable(),
        state: z.string().nullable(),
      })
      .nullable(),
    balance: z.number().int(),
    created: z.number().int(),
    currency: z.string().nullable(),
    delinquent: z.boolean(),
    description: z.string().nullable(),
    email: z.string().email().nullable(),
    livemode: z.boolean(),
    metadata: metadataSchema,
    name: z.string().nullable(),
    phone: z.string().nullable(),
    preferred_locales: z.array(z.string()),
    tax_exempt: z.enum(["none", "exempt", "reverse"]),
  })
  .passthrough();

export const stripeProductSchema = z
  .object({
    id: z.string(),
    name: z.string(),
    description: z.string().nullable(),
    defaultPriceId: z.string().nullable().optional(),
    active: z.boolean(),
    type: z.enum(["good", "service"]),
    category: z.string().nullable(),
    subcategory: z.string().nullable(),
  })
  .passthrough();

export const stripePriceSchema = z
  .object({
    id: z.string(),
    productId: z.string(),
    productName: z.string(),
    unitAmount: z.number().int().nullable(),
    currency: z.string().length(3),
    interval: z.enum(["day", "week", "month", "year"]).optional(),
    trialPeriodDays: z.number().int().nullable().optional(),
    active: z.boolean(),
    type: z.enum(["one_time", "recurring"]),
  })
  .passthrough();
