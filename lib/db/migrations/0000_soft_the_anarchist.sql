create table public.users (
  id uuid NOT NULL DEFAULT gen_random_uuid() ,
  name character varying(100) null,
  email character varying(255) not null,
  password_hash text not null,
  role character varying(20) not null default 'member'::character varying,
  created_at timestamp without time zone not null default now(),
  updated_at timestamp without time zone not null default now(),
  deleted_at timestamp without time zone null,
  constraint users_pkey primary key (id),
  constraint users_email_unique unique (email)
) TABLESPACE pg_default;

create table public.teams (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  name character varying(100) not null,
  created_at timestamp without time zone not null default now(),
  updated_at timestamp without time zone not null default now(),
  stripe_customer_id text null,
  stripe_subscription_id text null,
  stripe_product_id text null,
  plan_name character varying(50) null,
  subscription_status character varying(20) null,
  constraint teams_pkey primary key (id),
  constraint teams_stripe_customer_id_unique unique (stripe_customer_id),
  constraint teams_stripe_subscription_id_unique unique (stripe_subscription_id)
) TABLESPACE pg_default;

create table public.team_members (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  user_id uuid not null,
  team_id uuid not null,
  role character varying(50) not null,
  joined_at timestamp without time zone not null default now(),
  constraint team_members_pkey primary key (id),
  constraint team_members_team_id_teams_id_fk foreign KEY (team_id) references teams (id),
  constraint team_members_user_id_users_id_fk foreign KEY (user_id) references users (id)
) TABLESPACE pg_default;

create table public.password_reset_tokens (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  user_id uuid not null,
  token character varying(255) not null,
  expires_at timestamp without time zone not null,
  used boolean not null default false,
  created_at timestamp without time zone not null default now(),
  constraint password_reset_tokens_pkey primary key (id),
  constraint password_reset_tokens_token_key unique (token),
  constraint password_reset_tokens_user_id_fkey foreign KEY (user_id) references users (id) on delete CASCADE
) TABLESPACE pg_default;

create table public.user_progress (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  user_id uuid not null,
  lesson_id uuid not null,
  completed boolean not null default false,
  last_accessed timestamp without time zone not null default now(),
  created_at timestamp without time zone not null default now(),
  updated_at timestamp without time zone not null default now(),
  constraint user_progress_pkey primary key (id),
  constraint user_progress_user_id_users_id_fk foreign KEY (user_id) references users (id)
) TABLESPACE pg_default;


create table public.lesson_ratings (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  user_id uuid not null,
  user_name character varying(255) not null,
  ip_address character varying(45) not null,
  lesson_id uuid not null,
  rating integer not null,
  created_at timestamp without time zone not null default now(),
  updated_at timestamp without time zone not null default now(),
  constraint lesson_ratings_pkey primary key (id),
  constraint lesson_ratings_user_id_fkey foreign KEY (user_id) references users (id)
) TABLESPACE pg_default;

create index IF not exists idx_lesson_ratings_lesson_id on public.lesson_ratings using btree (lesson_id) TABLESPACE pg_default;

create index IF not exists idx_lesson_ratings_user_id on public.lesson_ratings using btree (user_id) TABLESPACE pg_default;


create table public.invitations (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  team_id uuid not null,
  email character varying(255) not null,
  role character varying(50) not null,
  invited_by uuid not null,
  invited_at timestamp without time zone not null default now(),
  status character varying(20) not null default 'pending'::character varying,
  constraint invitations_pkey primary key (id),
  constraint invitations_invited_by_users_id_fk foreign KEY (invited_by) references users (id),
  constraint invitations_team_id_teams_id_fk foreign KEY (team_id) references teams (id)
) TABLESPACE pg_default;



create table public.aiop_progress (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  user_id uuid not null,
  aiop_id character varying(255) not null,
  document_id uuid not null,
  completed boolean not null default true,
  created_at timestamp without time zone not null default now(),
  updated_at timestamp without time zone not null default now(),
  constraint aiop_progress_pkey primary key (id),
  constraint aiop_progress_user_id_fkey foreign KEY (user_id) references users (id)
) TABLESPACE pg_default;


create table public.aiguides_progress (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  user_id uuid not null,
  guide_id uuid not null,
  document_id uuid not null,
  completed boolean not null default true,
  created_at timestamp without time zone not null default now(),
  updated_at timestamp without time zone not null default now(),
  constraint aiguides_progress_pkey primary key (id),
  constraint aiguides_progress_user_id_fkey foreign KEY (user_id) references users (id)
) TABLESPACE pg_default;

create table public.activity_logs (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  team_id uuid not null,
  user_id uuid null,
  action text not null,
  timestamp timestamp without time zone not null default now(),
  ip_address character varying(45) null,
  constraint activity_logs_pkey primary key (id),
  constraint activity_logs_team_id_teams_id_fk foreign KEY (team_id) references teams (id),
  constraint activity_logs_user_id_users_id_fk foreign KEY (user_id) references users (id)
) TABLESPACE pg_default;



create table public.quiz_results (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  session_id character varying(255) not null,
  email character varying(255) null,
  registered_email character varying(255) null,
  user_id uuid null,
  current_step integer null,
  last_completed_step integer null,
  score integer null,
  answers json null,
  q1_gender text null,
  q2_age_group text null,
  q3_goal text null,
  q4_income_source text null,
  q5_work_hours text null,
  q7_income_range text null,
  q8_income_goal text null,
  q10_work_life_harmony text null,
  q11_passion_prevented text null,
  q12_flexibility_priority text null,
  q14_outside_employment text null,
  q15_contractor_consideration text null,
  q16_ai_experience text null,
  q17_ai_awareness text null,
  q20_marketing_capabilities text null,
  q24_monthly_income_goal text null,
  q26_daily_time_commitment text null,
  q19_professional_domains json null,
  q22_ai_platforms json null,
  q25_success_celebration json null,
  q1_completed_at timestamp without time zone null,
  q10_completed_at timestamp without time zone null,
  q20_completed_at timestamp without time zone null,
  q27_completed_at timestamp without time zone null,
  newsletter_opted_in boolean null default false,
  terms_accepted boolean null default false,
  created_at timestamp without time zone not null default now(),
  updated_at timestamp without time zone not null default now(),
  completed_at timestamp without time zone null,
  time_spent_seconds integer null,
  referrer text null,
  utm_source text null,
  utm_medium text null,
  utm_campaign text null,
  browser text null,
  device text null,
  constraint quiz_results_pkey primary key (id),
  constraint quiz_results_session_id_unique unique (session_id)
) TABLESPACE pg_default;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "activity_logs" ADD CONSTRAINT "activity_logs_team_id_teams_id_fk" FOREIGN KEY ("team_id") REFERENCES "public"."teams"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "activity_logs" ADD CONSTRAINT "activity_logs_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "invitations" ADD CONSTRAINT "invitations_team_id_teams_id_fk" FOREIGN KEY ("team_id") REFERENCES "public"."teams"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "invitations" ADD CONSTRAINT "invitations_invited_by_users_id_fk" FOREIGN KEY ("invited_by") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "team_members" ADD CONSTRAINT "team_members_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "team_members" ADD CONSTRAINT "team_members_team_id_teams_id_fk" FOREIGN KEY ("team_id") REFERENCES "public"."teams"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
