CREATE TABLE "prompts" (
	"id" serial PRIMARY KEY NOT NULL,
	"paragraph_content" text,
	"code_content" text,
	"content_date" timestamp NOT NULL
);
--> statement-breakpoint
CREATE TABLE "quiz_results" (
	"id" serial PRIMARY KEY NOT NULL,
	"session_id" varchar(255) NOT NULL,
	"email" varchar(255),
	"registered_email" varchar(255),
	"user_id" integer,
	"current_step" integer,
	"last_completed_step" integer,
	"score" integer,
	"answers" json,
	"step_1_answer" text,
	"step_2_answer" text,
	"step_3_answer" text,
	"step_4_answer" text,
	"step_5_answer" text,
	"newsletter_opted_in" boolean DEFAULT false,
	"terms_accepted" boolean DEFAULT false,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	"completed_at" timestamp,
	"time_spent_seconds" integer,
	"referrer" text,
	"utm_source" text,
	"utm_medium" text,
	"utm_campaign" text,
	"browser" text,
	"device" text,
	CONSTRAINT "quiz_results_session_id_unique" UNIQUE("session_id")
);
--> statement-breakpoint
CREATE TABLE "tool" (
	"id" serial PRIMARY KEY NOT NULL,
	"type" varchar(50),
	"code_content" varchar(255),
	"paragraph_content" text,
	"content_date" timestamp NOT NULL,
	"icon" text,
	"link" text,
	"tags" text,
	"price_model" text,
	"price" text,
	"billing" text,
	"refund" text
);
