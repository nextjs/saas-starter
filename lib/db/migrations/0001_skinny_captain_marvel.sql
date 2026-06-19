CREATE TABLE "api_call_logs" (
	"id" serial PRIMARY KEY NOT NULL,
	"team_id" integer NOT NULL,
	"ebay_account_id" integer,
	"sync_job_id" integer,
	"api_name" varchar(100) NOT NULL,
	"endpoint" text NOT NULL,
	"method" varchar(10) NOT NULL,
	"status_code" integer,
	"success" boolean DEFAULT false NOT NULL,
	"request_started_at" timestamp NOT NULL,
	"response_received_at" timestamp,
	"duration_ms" integer,
	"error_message" text,
	"request_id" varchar(255),
	"metadata" jsonb,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "audit_logs" (
	"id" serial PRIMARY KEY NOT NULL,
	"team_id" integer NOT NULL,
	"user_id" integer,
	"entity_type" varchar(100) NOT NULL,
	"entity_id" varchar(255),
	"action" varchar(100) NOT NULL,
	"old_value" jsonb,
	"new_value" jsonb,
	"ip_address" varchar(45),
	"user_agent" text,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "ebay_accounts" (
	"id" serial PRIMARY KEY NOT NULL,
	"team_id" integer NOT NULL,
	"seller_username" varchar(255) NOT NULL,
	"seller_account_id" varchar(255) NOT NULL,
	"environment" varchar(20) NOT NULL,
	"default_marketplace_id" varchar(50),
	"status" varchar(20) DEFAULT 'active' NOT NULL,
	"last_synced_at" timestamp,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "ebay_marketplaces" (
	"id" serial PRIMARY KEY NOT NULL,
	"marketplace_id" varchar(50) NOT NULL,
	"name" varchar(100) NOT NULL,
	"country" varchar(2) NOT NULL,
	"currency" varchar(3) NOT NULL,
	"site_id" varchar(20),
	"is_enabled" boolean DEFAULT true NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "ebay_tokens" (
	"id" serial PRIMARY KEY NOT NULL,
	"team_id" integer NOT NULL,
	"ebay_account_id" integer NOT NULL,
	"encrypted_access_token" text NOT NULL,
	"encrypted_refresh_token" text NOT NULL,
	"access_token_expires_at" timestamp NOT NULL,
	"refresh_token_expires_at" timestamp NOT NULL,
	"scopes" text,
	"token_type" varchar(50) DEFAULT 'Bearer' NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "sync_jobs" (
	"id" serial PRIMARY KEY NOT NULL,
	"team_id" integer NOT NULL,
	"ebay_account_id" integer,
	"job_type" varchar(50) NOT NULL,
	"status" varchar(20) DEFAULT 'pending' NOT NULL,
	"started_at" timestamp,
	"finished_at" timestamp,
	"records_processed" integer DEFAULT 0 NOT NULL,
	"records_succeeded" integer DEFAULT 0 NOT NULL,
	"records_failed" integer DEFAULT 0 NOT NULL,
	"error_message" text,
	"metadata" jsonb,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "api_call_logs" ADD CONSTRAINT "api_call_logs_team_id_teams_id_fk" FOREIGN KEY ("team_id") REFERENCES "public"."teams"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "api_call_logs" ADD CONSTRAINT "api_call_logs_ebay_account_id_ebay_accounts_id_fk" FOREIGN KEY ("ebay_account_id") REFERENCES "public"."ebay_accounts"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "api_call_logs" ADD CONSTRAINT "api_call_logs_sync_job_id_sync_jobs_id_fk" FOREIGN KEY ("sync_job_id") REFERENCES "public"."sync_jobs"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "audit_logs" ADD CONSTRAINT "audit_logs_team_id_teams_id_fk" FOREIGN KEY ("team_id") REFERENCES "public"."teams"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "audit_logs" ADD CONSTRAINT "audit_logs_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "ebay_accounts" ADD CONSTRAINT "ebay_accounts_team_id_teams_id_fk" FOREIGN KEY ("team_id") REFERENCES "public"."teams"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "ebay_tokens" ADD CONSTRAINT "ebay_tokens_team_id_teams_id_fk" FOREIGN KEY ("team_id") REFERENCES "public"."teams"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "ebay_tokens" ADD CONSTRAINT "ebay_tokens_ebay_account_id_ebay_accounts_id_fk" FOREIGN KEY ("ebay_account_id") REFERENCES "public"."ebay_accounts"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "sync_jobs" ADD CONSTRAINT "sync_jobs_team_id_teams_id_fk" FOREIGN KEY ("team_id") REFERENCES "public"."teams"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "sync_jobs" ADD CONSTRAINT "sync_jobs_ebay_account_id_ebay_accounts_id_fk" FOREIGN KEY ("ebay_account_id") REFERENCES "public"."ebay_accounts"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "api_call_logs_team_id_idx" ON "api_call_logs" USING btree ("team_id");--> statement-breakpoint
CREATE INDEX "api_call_logs_ebay_account_id_idx" ON "api_call_logs" USING btree ("ebay_account_id");--> statement-breakpoint
CREATE INDEX "api_call_logs_api_name_idx" ON "api_call_logs" USING btree ("api_name");--> statement-breakpoint
CREATE INDEX "api_call_logs_success_idx" ON "api_call_logs" USING btree ("success");--> statement-breakpoint
CREATE INDEX "api_call_logs_status_code_idx" ON "api_call_logs" USING btree ("status_code");--> statement-breakpoint
CREATE INDEX "api_call_logs_created_at_idx" ON "api_call_logs" USING btree ("created_at");--> statement-breakpoint
CREATE INDEX "audit_logs_team_id_idx" ON "audit_logs" USING btree ("team_id");--> statement-breakpoint
CREATE INDEX "audit_logs_user_id_idx" ON "audit_logs" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "audit_logs_entity_type_idx" ON "audit_logs" USING btree ("entity_type");--> statement-breakpoint
CREATE INDEX "audit_logs_entity_id_idx" ON "audit_logs" USING btree ("entity_id");--> statement-breakpoint
CREATE INDEX "audit_logs_action_idx" ON "audit_logs" USING btree ("action");--> statement-breakpoint
CREATE INDEX "audit_logs_created_at_idx" ON "audit_logs" USING btree ("created_at");--> statement-breakpoint
CREATE INDEX "ebay_accounts_team_id_idx" ON "ebay_accounts" USING btree ("team_id");--> statement-breakpoint
CREATE INDEX "ebay_accounts_status_idx" ON "ebay_accounts" USING btree ("status");--> statement-breakpoint
CREATE UNIQUE INDEX "ebay_accounts_team_seller_environment_unique_idx" ON "ebay_accounts" USING btree ("team_id","seller_account_id","environment");--> statement-breakpoint
CREATE UNIQUE INDEX "ebay_marketplaces_marketplace_id_unique_idx" ON "ebay_marketplaces" USING btree ("marketplace_id");--> statement-breakpoint
CREATE INDEX "ebay_tokens_team_id_idx" ON "ebay_tokens" USING btree ("team_id");--> statement-breakpoint
CREATE INDEX "ebay_tokens_ebay_account_id_idx" ON "ebay_tokens" USING btree ("ebay_account_id");--> statement-breakpoint
CREATE INDEX "ebay_tokens_access_token_expires_at_idx" ON "ebay_tokens" USING btree ("access_token_expires_at");--> statement-breakpoint
CREATE INDEX "sync_jobs_team_id_idx" ON "sync_jobs" USING btree ("team_id");--> statement-breakpoint
CREATE INDEX "sync_jobs_ebay_account_id_idx" ON "sync_jobs" USING btree ("ebay_account_id");--> statement-breakpoint
CREATE INDEX "sync_jobs_job_type_idx" ON "sync_jobs" USING btree ("job_type");--> statement-breakpoint
CREATE INDEX "sync_jobs_status_idx" ON "sync_jobs" USING btree ("status");--> statement-breakpoint
CREATE INDEX "sync_jobs_created_at_idx" ON "sync_jobs" USING btree ("created_at");