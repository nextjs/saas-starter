import postgres from 'postgres';
import dotenv from 'dotenv';

dotenv.config();

// Funkcja tworząca tabelę quiz_results
async function createQuizResultsTable() {
  let sql: ReturnType<typeof postgres> | null = null;
  
  try {
    console.log('Creating quiz_results table with detailed question columns...');
    
    // Połącz z bazą danych
    const connectionString = process.env.POSTGRES_URL;
    if (!connectionString) {
      throw new Error('POSTGRES_URL environment variable is not set');
    }
    
    sql = postgres(connectionString);
    
    // Sprawdź czy tabela już istnieje
    const tableExists = await sql`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_schema = 'public'
        AND table_name = 'quiz_results'
      );
    `;
    
    if (tableExists[0].exists) {
      console.log('Table quiz_results already exists, skipping creation');
      return;
    }
    
    // Utwórz tabelę quiz_results
    await sql`
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
        
        -- Single choice question answers
        "q1_gender" text, -- What is your gender?
        "q2_age_group" text, -- What is your age group? 
        "q3_goal" text, -- What is your goal?
        "q4_income_source" text, -- What is your current income source?
        "q5_work_hours" text, -- How many hours do you typically work each day?
        "q7_income_range" text, -- What is your current income range?
        "q8_income_goal" text, -- What is your ideal income goal?
        "q10_work_life_harmony" text, -- Is achieving harmony important?
        "q11_passion_prevented" text, -- Do professional obligations prevent passions?
        "q12_flexibility_priority" text, -- Is flexibility a priority?
        "q14_outside_employment" text, -- Activities outside traditional employment?
        "q15_contractor_consideration" text, -- Independent contractor consideration?
        "q16_ai_experience" text, -- AI experience level?
        "q17_ai_awareness" text, -- AI efficiency awareness?
        "q20_marketing_capabilities" text, -- Marketing capabilities?
        "q24_monthly_income_goal" text, -- Monthly income goal?
        "q26_daily_time_commitment" text, -- Daily time commitment?
        
        -- Multi-choice question answers
        "q19_professional_domains" json, -- Professional domains of interest?
        "q22_ai_platforms" json, -- AI platforms used?
        "q25_success_celebration" json, -- Success celebration plans?
        
        -- Milestone timestamps
        "q1_completed_at" timestamp,
        "q10_completed_at" timestamp,
        "q20_completed_at" timestamp,
        "q27_completed_at" timestamp,
        
        -- Form data
        "newsletter_opted_in" boolean DEFAULT false,
        "terms_accepted" boolean DEFAULT false,
        
        -- Timing information
        "created_at" timestamp DEFAULT now() NOT NULL,
        "updated_at" timestamp DEFAULT now() NOT NULL,
        "completed_at" timestamp,
        "time_spent_seconds" integer,
        
        -- Analytics data
        "referrer" text,
        "utm_source" text,
        "utm_medium" text,
        "utm_campaign" text,
        "browser" text,
        "device" text,
        
        CONSTRAINT "quiz_results_session_id_unique" UNIQUE("session_id")
      );
    `;
    
    console.log('Successfully created quiz_results table with all question columns!');
  } catch (error) {
    console.error('Error creating quiz_results table:', error);
  } finally {
    if (sql) {
      await sql.end();
      console.log('Database connection closed');
    }
  }
}

// Uruchom funkcję
createQuizResultsTable(); 