CREATE TABLE "customers" (
	"id" serial PRIMARY KEY NOT NULL,
	"team_id" integer NOT NULL,
	"nama" varchar(100) NOT NULL,
	"telepon" varchar(30) NOT NULL,
	"alamat" text,
	"catatan" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "customers_team_telepon_unique" UNIQUE("team_id","telepon")
);
--> statement-breakpoint
CREATE TABLE "order_items" (
	"id" serial PRIMARY KEY NOT NULL,
	"order_id" integer NOT NULL,
	"service_id" integer NOT NULL,
	"nama_layanan" varchar(100) NOT NULL,
	"tipe" varchar(10) NOT NULL,
	"satuan" varchar(10) NOT NULL,
	"qty" numeric(6, 2) NOT NULL,
	"harga_satuan" integer NOT NULL,
	"is_express" boolean DEFAULT false NOT NULL,
	"subtotal" integer NOT NULL,
	"catatan" text
);
--> statement-breakpoint
CREATE TABLE "order_status_history" (
	"id" serial PRIMARY KEY NOT NULL,
	"order_id" integer NOT NULL,
	"status" varchar(20) NOT NULL,
	"catatan" text,
	"changed_by" integer,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "orders" (
	"id" serial PRIMARY KEY NOT NULL,
	"team_id" integer NOT NULL,
	"outlet_id" integer NOT NULL,
	"customer_id" integer NOT NULL,
	"nomor_nota" varchar(30) NOT NULL,
	"status" varchar(20) DEFAULT 'BARU' NOT NULL,
	"status_bayar" varchar(20) DEFAULT 'BELUM_BAYAR' NOT NULL,
	"tanggal_masuk" timestamp with time zone DEFAULT now() NOT NULL,
	"estimasi_selesai" timestamp with time zone NOT NULL,
	"tanggal_selesai" timestamp with time zone,
	"tanggal_diambil" timestamp with time zone,
	"subtotal" integer DEFAULT 0 NOT NULL,
	"diskon" integer DEFAULT 0 NOT NULL,
	"total" integer DEFAULT 0 NOT NULL,
	"catatan" text,
	"created_by" integer NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "orders_team_nomor_nota_unique" UNIQUE("team_id","nomor_nota")
);
--> statement-breakpoint
CREATE TABLE "outlets" (
	"id" serial PRIMARY KEY NOT NULL,
	"team_id" integer NOT NULL,
	"nama" varchar(100) NOT NULL,
	"kode_nota" varchar(10) NOT NULL,
	"alamat" text,
	"telepon" varchar(30),
	"aktif" boolean DEFAULT true NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "payments" (
	"id" serial PRIMARY KEY NOT NULL,
	"order_id" integer NOT NULL,
	"jumlah" integer NOT NULL,
	"metode" varchar(20) NOT NULL,
	"catatan" text,
	"received_by" integer,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "service_prices" (
	"id" serial PRIMARY KEY NOT NULL,
	"service_id" integer NOT NULL,
	"outlet_id" integer NOT NULL,
	"harga" integer NOT NULL,
	CONSTRAINT "service_prices_service_outlet_unique" UNIQUE("service_id","outlet_id")
);
--> statement-breakpoint
CREATE TABLE "services" (
	"id" serial PRIMARY KEY NOT NULL,
	"team_id" integer NOT NULL,
	"nama" varchar(100) NOT NULL,
	"tipe" varchar(10) NOT NULL,
	"satuan" varchar(10) NOT NULL,
	"harga_default" integer NOT NULL,
	"min_qty" numeric(6, 2) DEFAULT '1' NOT NULL,
	"durasi_jam" integer DEFAULT 72 NOT NULL,
	"express_multiplier" numeric(3, 2) DEFAULT '1.5' NOT NULL,
	"express_durasi_jam" integer DEFAULT 24 NOT NULL,
	"aktif" boolean DEFAULT true NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "team_members" ADD COLUMN "outlet_id" integer;--> statement-breakpoint
ALTER TABLE "customers" ADD CONSTRAINT "customers_team_id_teams_id_fk" FOREIGN KEY ("team_id") REFERENCES "public"."teams"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "order_items" ADD CONSTRAINT "order_items_order_id_orders_id_fk" FOREIGN KEY ("order_id") REFERENCES "public"."orders"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "order_items" ADD CONSTRAINT "order_items_service_id_services_id_fk" FOREIGN KEY ("service_id") REFERENCES "public"."services"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "order_status_history" ADD CONSTRAINT "order_status_history_order_id_orders_id_fk" FOREIGN KEY ("order_id") REFERENCES "public"."orders"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "order_status_history" ADD CONSTRAINT "order_status_history_changed_by_users_id_fk" FOREIGN KEY ("changed_by") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "orders" ADD CONSTRAINT "orders_team_id_teams_id_fk" FOREIGN KEY ("team_id") REFERENCES "public"."teams"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "orders" ADD CONSTRAINT "orders_outlet_id_outlets_id_fk" FOREIGN KEY ("outlet_id") REFERENCES "public"."outlets"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "orders" ADD CONSTRAINT "orders_customer_id_customers_id_fk" FOREIGN KEY ("customer_id") REFERENCES "public"."customers"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "orders" ADD CONSTRAINT "orders_created_by_users_id_fk" FOREIGN KEY ("created_by") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "outlets" ADD CONSTRAINT "outlets_team_id_teams_id_fk" FOREIGN KEY ("team_id") REFERENCES "public"."teams"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "payments" ADD CONSTRAINT "payments_order_id_orders_id_fk" FOREIGN KEY ("order_id") REFERENCES "public"."orders"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "payments" ADD CONSTRAINT "payments_received_by_users_id_fk" FOREIGN KEY ("received_by") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "service_prices" ADD CONSTRAINT "service_prices_service_id_services_id_fk" FOREIGN KEY ("service_id") REFERENCES "public"."services"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "service_prices" ADD CONSTRAINT "service_prices_outlet_id_outlets_id_fk" FOREIGN KEY ("outlet_id") REFERENCES "public"."outlets"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "services" ADD CONSTRAINT "services_team_id_teams_id_fk" FOREIGN KEY ("team_id") REFERENCES "public"."teams"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "team_members" ADD CONSTRAINT "team_members_outlet_id_outlets_id_fk" FOREIGN KEY ("outlet_id") REFERENCES "public"."outlets"("id") ON DELETE no action ON UPDATE no action;