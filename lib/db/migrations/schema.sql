-- Quiz Results Schema
-- This table stores detailed information about user quiz interactions
-- Each step's answer is stored in individual columns for better querying
-- The table also includes analytics and timing information

CREATE TABLE quiz_results (
  id SERIAL PRIMARY KEY,
  session_id VARCHAR(255) NOT NULL UNIQUE,
  
  -- User identification
  email VARCHAR(255),
  registered_email VARCHAR(255),
  user_id INTEGER, -- Optional link to users table
  
  -- Quiz step answers (single choice questions have text values)
  step_1_answer TEXT,
  step_2_answer TEXT,
  step_3_answer TEXT,
  step_4_answer TEXT,
  step_5_answer TEXT,
  step_6_answer TEXT,
  step_7_answer TEXT,
  step_8_answer TEXT,
  step_9_answer TEXT,
  step_10_answer TEXT,
  step_11_answer TEXT,
  step_12_answer TEXT,
  step_13_answer TEXT,
  step_14_answer TEXT,
  step_15_answer TEXT,
  step_16_answer TEXT,
  step_17_answer TEXT,
  step_18_answer TEXT,
  step_19_answer TEXT,
  step_20_answer TEXT,
  step_21_answer TEXT,
  step_22_answer TEXT,
  step_23_answer TEXT,
  step_24_answer TEXT,
  step_25_answer TEXT,
  step_26_answer TEXT,
  step_27_answer TEXT,
  step_28_answer TEXT,
  step_29_answer TEXT,
  step_30_answer TEXT,
  
  -- Multi-choice answers are stored as arrays
  step_1_multi_answers TEXT[],
  step_2_multi_answers TEXT[],
  step_3_multi_answers TEXT[],
  step_4_multi_answers TEXT[],
  step_5_multi_answers TEXT[],
  
  -- Key step completion timestamps
  step_1_completed_at TIMESTAMP,
  step_5_completed_at TIMESTAMP,
  step_10_completed_at TIMESTAMP,
  step_15_completed_at TIMESTAMP,
  step_20_completed_at TIMESTAMP,
  step_25_completed_at TIMESTAMP,
  step_30_completed_at TIMESTAMP,
  
  -- Form data
  newsletter_opted_in BOOLEAN DEFAULT FALSE,
  terms_accepted BOOLEAN DEFAULT FALSE,
  
  -- Quiz progress
  current_step INTEGER,
  last_completed_step INTEGER,
  score INTEGER,
  
  -- Full JSON backup
  answers JSONB, -- Stores all answers in JSON format as backup
  
  -- Timing and session information
  started_at TIMESTAMP DEFAULT NOW(),
  time_spent_seconds INTEGER,
  
  -- Tracking data
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP,
  completed_at TIMESTAMP,
  
  -- Analytics data
  referrer TEXT,
  utm_source TEXT,
  utm_medium TEXT,
  utm_campaign TEXT,
  user_agent TEXT,
  browser TEXT,
  device TEXT,
  ip_address TEXT
);

-- Indexes for faster querying
CREATE INDEX idx_quiz_results_session_id ON quiz_results (session_id);
CREATE INDEX idx_quiz_results_email ON quiz_results (email);
CREATE INDEX idx_quiz_results_completed_at ON quiz_results (completed_at);
CREATE INDEX idx_quiz_results_last_completed_step ON quiz_results (last_completed_step);

-- Comments on table and key columns
COMMENT ON TABLE quiz_results IS 'Stores all quiz responses with individual columns for each step';
COMMENT ON COLUMN quiz_results.session_id IS 'Unique identifier for the quiz session';
COMMENT ON COLUMN quiz_results.answers IS 'Full JSON backup of all quiz answers';
COMMENT ON COLUMN quiz_results.last_completed_step IS 'Last step number that was fully completed';
COMMENT ON COLUMN quiz_results.time_spent_seconds IS 'Total time spent on the quiz in seconds';

-- Add function to automatically update the updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_quiz_results_updated_at
BEFORE UPDATE ON quiz_results
FOR EACH ROW
EXECUTE PROCEDURE update_updated_at_column(); 