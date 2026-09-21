CREATE TABLE "invoices" (
	"id" serial PRIMARY KEY NOT NULL,
	"team_id" integer NOT NULL,
	"plan_id" integer NOT NULL,
	"nomor_invoice" varchar(40) NOT NULL,
	"siklus" varchar(20) NOT NULL,
	"jumlah" integer NOT NULL,
	"status" varchar(20) DEFAULT 'MENUNGGU' NOT NULL,
	"provider" varchar(20) NOT NULL,
	"provider_ref" text,
	"url_bayar" text,
	"dibayar_pada" timestamp with time zone,
	"kedaluwarsa_pada" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "invoices_team_nomor_unique" UNIQUE("team_id","nomor_invoice")
);
--> statement-breakpoint
CREATE TABLE "plans" (
	"id" serial PRIMARY KEY NOT NULL,
	"kode" varchar(20) NOT NULL,
	"nama" varchar(50) NOT NULL,
	"harga_bulanan" integer NOT NULL,
	"harga_tahunan" integer NOT NULL,
	"max_outlet" integer,
	"max_pengguna" integer,
	"max_pesanan_per_bulan" integer,
	"urutan" integer DEFAULT 0 NOT NULL,
	"aktif" boolean DEFAULT true NOT NULL,
	CONSTRAINT "plans_kode_unique" UNIQUE("kode")
);
--> statement-breakpoint
CREATE TABLE "subscriptions" (
	"id" serial PRIMARY KEY NOT NULL,
	"team_id" integer NOT NULL,
	"plan_id" integer NOT NULL,
	"status" varchar(20) DEFAULT 'TRIAL' NOT NULL,
	"siklus" varchar(20) DEFAULT 'BULANAN' NOT NULL,
	"mulai_pada" timestamp with time zone DEFAULT now() NOT NULL,
	"berakhir_pada" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "subscriptions_team_unique" UNIQUE("team_id")
);
--> statement-breakpoint
ALTER TABLE "teams" DROP CONSTRAINT "teams_stripe_customer_id_unique";--> statement-breakpoint
ALTER TABLE "teams" DROP CONSTRAINT "teams_stripe_subscription_id_unique";--> statement-breakpoint
ALTER TABLE "invoices" ADD CONSTRAINT "invoices_team_id_teams_id_fk" FOREIGN KEY ("team_id") REFERENCES "public"."teams"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "invoices" ADD CONSTRAINT "invoices_plan_id_plans_id_fk" FOREIGN KEY ("plan_id") REFERENCES "public"."plans"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "subscriptions" ADD CONSTRAINT "subscriptions_team_id_teams_id_fk" FOREIGN KEY ("team_id") REFERENCES "public"."teams"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "subscriptions" ADD CONSTRAINT "subscriptions_plan_id_plans_id_fk" FOREIGN KEY ("plan_id") REFERENCES "public"."plans"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "teams" DROP COLUMN "stripe_customer_id";--> statement-breakpoint
ALTER TABLE "teams" DROP COLUMN "stripe_subscription_id";--> statement-breakpoint
ALTER TABLE "teams" DROP COLUMN "stripe_product_id";--> statement-breakpoint
ALTER TABLE "teams" DROP COLUMN "plan_name";--> statement-breakpoint
ALTER TABLE "teams" DROP COLUMN "subscription_status";