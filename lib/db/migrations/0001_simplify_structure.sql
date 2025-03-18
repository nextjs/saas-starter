-- Añadir campos de suscripción a usuarios
ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "stripe_customer_id" text UNIQUE;
ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "stripe_subscription_id" text UNIQUE;
ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "stripe_product_id" text;
ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "plan_name" varchar(50);
ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "subscription_status" varchar(20);

-- Eliminar la restricción de clave foránea en activity_logs para team_id
ALTER TABLE "activity_logs" DROP CONSTRAINT IF EXISTS "activity_logs_team_id_teams_id_fk";

-- Eliminar columna team_id de activity_logs
ALTER TABLE "activity_logs" DROP COLUMN IF EXISTS "team_id";

-- Eliminar tablas de invitaciones, miembros de equipo y equipos
DROP TABLE IF EXISTS "invitations";
DROP TABLE IF EXISTS "team_members";
DROP TABLE IF EXISTS "teams"; 