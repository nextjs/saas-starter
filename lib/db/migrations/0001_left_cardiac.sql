CREATE TABLE "automation_logs" (
	"id" serial PRIMARY KEY NOT NULL,
	"event" text NOT NULL,
	"timestamp" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "performance_metrics" (
	"id" serial PRIMARY KEY NOT NULL,
	"metric" text NOT NULL,
	"value" text NOT NULL,
	"change" integer DEFAULT 0
);
