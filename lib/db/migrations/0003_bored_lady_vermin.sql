CREATE TABLE "notification_settings" (
	"id" serial PRIMARY KEY NOT NULL,
	"team_id" integer NOT NULL,
	"aktif_siap_ambil" boolean DEFAULT true NOT NULL,
	"aktif_pesanan_masuk" boolean DEFAULT false NOT NULL,
	"template_siap_ambil" text NOT NULL,
	"template_pesanan_masuk" text NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "notification_settings_team_unique" UNIQUE("team_id")
);
--> statement-breakpoint
CREATE TABLE "notifications" (
	"id" serial PRIMARY KEY NOT NULL,
	"team_id" integer NOT NULL,
	"order_id" integer,
	"jenis" varchar(20) NOT NULL,
	"tujuan" varchar(30) NOT NULL,
	"pesan" text NOT NULL,
	"status" varchar(20) NOT NULL,
	"provider" varchar(20) NOT NULL,
	"referensi" text,
	"galat" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "notification_settings" ADD CONSTRAINT "notification_settings_team_id_teams_id_fk" FOREIGN KEY ("team_id") REFERENCES "public"."teams"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "notifications" ADD CONSTRAINT "notifications_team_id_teams_id_fk" FOREIGN KEY ("team_id") REFERENCES "public"."teams"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "notifications" ADD CONSTRAINT "notifications_order_id_orders_id_fk" FOREIGN KEY ("order_id") REFERENCES "public"."orders"("id") ON DELETE no action ON UPDATE no action;