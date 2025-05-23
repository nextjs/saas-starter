import { sql } from 'drizzle-orm';
import { db } from '../drizzle';

export async function addDayCompletionDatesColumn() {
  console.log('Adding day_completion_dates column to challenge_progress table...');
  
  try {
    // Directly try to add the column and handle errors appropriately
    // If the column already exists, PostgreSQL will throw an error
    try {
      await db.execute(sql`
        ALTER TABLE challenge_progress 
        ADD COLUMN day_completion_dates JSONB DEFAULT '{}'::jsonb
      `);
      console.log('Successfully added day_completion_dates column');
    } catch (err) {
      // Check if this is a "column already exists" error (PostgreSQL error code 42701)
      if (err.message && err.message.includes('already exists')) {
        console.log('day_completion_dates column already exists');
      } else {
        // If it's another error, rethrow it
        throw err;
      }
    }
    
    return { success: true };
  } catch (error) {
    console.error('Error adding day_completion_dates column:', error);
    return { success: false, error };
  }
}

// Run the migration if this file is executed directly
if (require.main === module) {
  addDayCompletionDatesColumn()
    .then(result => {
      console.log('Migration result:', result);
      process.exit(result.success ? 0 : 1);
    })
    .catch(err => {
      console.error('Migration failed:', err);
      process.exit(1);
    });
} 