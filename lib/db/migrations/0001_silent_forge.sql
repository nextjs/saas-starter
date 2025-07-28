CREATE TABLE "team_restaraunts" (
	"id" serial PRIMARY KEY NOT NULL,
	"team_id" integer NOT NULL,
	"restaraunt_id" uuid NOT NULL
);
--> statement-breakpoint
ALTER TABLE "team_restaraunts" ADD CONSTRAINT "team_restaraunts_team_id_teams_id_fk" FOREIGN KEY ("team_id") REFERENCES "public"."teams"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "team_restaraunts" ADD CONSTRAINT "team_restaraunts_restaraunt_id_restaraunts_id_fk" FOREIGN KEY ("restaraunt_id") REFERENCES "public"."restaraunts"("id") ON DELETE cascade ON UPDATE no action;