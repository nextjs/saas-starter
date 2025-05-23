import { db } from './drizzle';
import { sql } from 'drizzle-orm';
import { challengeProgress } from './schema';

async function debugChallengeProgress() {
  console.log('Debugging challenge_progress table...');
  
  try {
    // Check if the table exists
    const tableCheck = await db.execute(sql`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_name = 'challenge_progress'
      );
    `);
    
    console.log('Table exists check:', tableCheck);
    
    // Get all records from the table
    const records = await db.select().from(challengeProgress);
    
    console.log('Found', records.length, 'records in challenge_progress table');
    
    // Print each record
    records.forEach((record, index) => {
      console.log(`\nRecord #${index + 1}:`);
      console.log('  ID:', record.id);
      console.log('  User ID:', record.userId);
      console.log('  Challenge ID:', record.challengeId);
      console.log('  Last Completed Day:', record.lastCompletedDay);
      console.log('  Start Date:', record.startDate);
      console.log('  Day Completion Dates:', record.dayCompletionDates || '{}');
      console.log('  Created At:', record.createdAt);
      console.log('  Updated At:', record.updatedAt);
    });
    
    // Check the column structure
    const columnInfo = await db.execute(sql`
      SELECT column_name, data_type, is_nullable
      FROM information_schema.columns
      WHERE table_name = 'challenge_progress';
    `);
    
    console.log('\nColumn information:');
    console.log(columnInfo);
    
  } catch (error) {
    console.error('Error debugging challenge_progress:', error);
  }
}

// Run the debug function
debugChallengeProgress()
  .then(() => {
    console.log('Debug completed');
    process.exit(0);
  })
  .catch(err => {
    console.error('Debug failed:', err);
    process.exit(1);
  }); 