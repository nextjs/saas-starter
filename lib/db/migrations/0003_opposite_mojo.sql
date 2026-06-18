CREATE TABLE "inspection_records" (
	"id" serial PRIMARY KEY NOT NULL,
	"job_id" integer NOT NULL,
	"operation_id" integer,
	"dimension" varchar(255),
	"nominal_spec" varchar(255),
	"actual_value" varchar(255),
	"result" varchar(20),
	"inspector" varchar(255),
	"inspected_at" timestamp,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "inspection_records" ADD CONSTRAINT "inspection_records_job_id_jobs_id_fk" FOREIGN KEY ("job_id") REFERENCES "public"."jobs"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "inspection_records" ADD CONSTRAINT "inspection_records_operation_id_job_operations_id_fk" FOREIGN KEY ("operation_id") REFERENCES "public"."job_operations"("id") ON DELETE no action ON UPDATE no action;