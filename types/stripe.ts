import * as Stripe from "@/types/schema/stripe";
import { z } from "zod";
export type StripeCustomer = z.infer<typeof Stripe.stripeCustomerSchema>;
export type StripeProduct = z.infer<typeof Stripe.stripeProductSchema>;
export type StripePrice = z.infer<typeof Stripe.stripePriceSchema>;
