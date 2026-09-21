CREATE TABLE "email_log" (
	"id" serial PRIMARY KEY NOT NULL,
	"team_id" integer,
	"jenis" varchar(30) NOT NULL,
	"tujuan" varchar(255) NOT NULL,
	"subjek" text NOT NULL,
	"isi" text NOT NULL,
	"status" varchar(20) NOT NULL,
	"provider" varchar(20) NOT NULL,
	"galat" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "password_reset_tokens" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" integer NOT NULL,
	"token_hash" varchar(64) NOT NULL,
	"kedaluwarsa_pada" timestamp with time zone NOT NULL,
	"dipakai_pada" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "password_reset_tokens_token_hash_unique" UNIQUE("token_hash")
);
--> statement-breakpoint
ALTER TABLE "email_log" ADD CONSTRAINT "email_log_team_id_teams_id_fk" FOREIGN KEY ("team_id") REFERENCES "public"."teams"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "password_reset_tokens" ADD CONSTRAINT "password_reset_tokens_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;