ALTER TABLE "sessions" DISABLE ROW LEVEL SECURITY;--> statement-breakpoint
ALTER TABLE "customers" DISABLE ROW LEVEL SECURITY;--> statement-breakpoint
ALTER TABLE "webhook_events" DISABLE ROW LEVEL SECURITY;--> statement-breakpoint
ALTER TABLE "participants" DISABLE ROW LEVEL SECURITY;--> statement-breakpoint
ALTER TABLE "otps" DISABLE ROW LEVEL SECURITY;--> statement-breakpoint
ALTER TABLE "participant_refresh_tokens" DISABLE ROW LEVEL SECURITY;--> statement-breakpoint
DROP TABLE "sessions" CASCADE;--> statement-breakpoint
DROP TABLE "profile" CASCADE;--> statement-breakpoint
DROP TABLE "prompts" CASCADE;--> statement-breakpoint
DROP TABLE "customers" CASCADE;--> statement-breakpoint
DROP TABLE "webhook_events" CASCADE;--> statement-breakpoint
DROP TABLE "participants" CASCADE;--> statement-breakpoint
DROP TABLE "otps" CASCADE;--> statement-breakpoint
DROP TABLE "participant_refresh_tokens" CASCADE;--> statement-breakpoint
ALTER TABLE "teams" DROP CONSTRAINT "teams_stripe_customer_id_unique";--> statement-breakpoint
ALTER TABLE "teams" DROP CONSTRAINT "teams_stripe_subscription_id_unique";--> statement-breakpoint
ALTER TABLE "users" ALTER COLUMN "password_hash" DROP NOT NULL;--> statement-breakpoint
ALTER TABLE "teams" ALTER COLUMN "slug" SET DATA TYPE varchar(50);--> statement-breakpoint
ALTER TABLE "teams" ALTER COLUMN "slug" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "teams" ALTER COLUMN "s3_prefix" SET DATA TYPE varchar(100);--> statement-breakpoint
ALTER TABLE "teams" ALTER COLUMN "s3_prefix" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN "external_id" varchar(255);--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN "auth_provider" varchar(20) DEFAULT 'local' NOT NULL;--> statement-breakpoint
ALTER TABLE "teams" DROP COLUMN "stripe_customer_id";--> statement-breakpoint
ALTER TABLE "teams" DROP COLUMN "stripe_subscription_id";--> statement-breakpoint
ALTER TABLE "teams" DROP COLUMN "stripe_product_id";--> statement-breakpoint
ALTER TABLE "teams" DROP COLUMN "plan_name";--> statement-breakpoint
ALTER TABLE "teams" DROP COLUMN "subscription_status";--> statement-breakpoint
ALTER TABLE "teams" ADD CONSTRAINT "teams_s3_prefix_unique" UNIQUE("s3_prefix");