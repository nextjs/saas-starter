ALTER TABLE "users" ADD COLUMN "email_verified" timestamp;
--> statement-breakpoint
CREATE TABLE "email_signup_tokens" (
  "email" varchar(255) PRIMARY KEY NOT NULL,
  "password_hash" text NOT NULL,
  "token_hash" text NOT NULL UNIQUE,
  "expires_at" timestamp NOT NULL,
  "created_at" timestamp DEFAULT now() NOT NULL
);
