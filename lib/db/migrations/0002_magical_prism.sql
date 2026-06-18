CREATE TABLE "job_operations" (
	"id" serial PRIMARY KEY NOT NULL,
	"job_id" integer NOT NULL,
	"sequence" integer NOT NULL,
	"description" varchar(255),
	"machine" varchar(255),
	"completed_by" varchar(255),
	"completed_at" timestamp,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "job_operations" ADD CONSTRAINT "job_operations_job_id_jobs_id_fk" FOREIGN KEY ("job_id") REFERENCES "public"."jobs"("id") ON DELETE no action ON UPDATE no action;