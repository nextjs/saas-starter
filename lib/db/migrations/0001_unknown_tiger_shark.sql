CREATE TABLE "plans" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" varchar(100) NOT NULL,
	"description" text,
	"price" numeric(10, 2) NOT NULL,
	"interval" varchar(20) DEFAULT 'month' NOT NULL,
	"active" boolean DEFAULT true NOT NULL,
	"credits_per_cycle" integer NOT NULL,
	"features" json,
	"stripe_product_id" text,
	"stripe_price_id" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	"deleted_at" timestamp,
	CONSTRAINT "plans_stripe_product_id_unique" UNIQUE("stripe_product_id"),
	CONSTRAINT "plans_stripe_price_id_unique" UNIQUE("stripe_price_id")
);
