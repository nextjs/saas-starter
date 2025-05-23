import { db } from './drizzle';
import { sql } from 'drizzle-orm';
import { challengeProgress } from './schema';

async function resetChallengeProgress() {
  console.log('Resetting challenge progress data...');
  
  try {
    // Delete all records from the challenge_progress table
    await db.delete(challengeProgress);
    console.log('All challenge progress records deleted.');
    
    console.log('Successfully reset challenge progress data.');
    return { success: true };
  } catch (error) {
    console.error('Error resetting challenge progress:', error);
    return { success: false, error };
  }
}

// Run the reset function if this file is executed directly
if (require.main === module) {
  resetChallengeProgress()
    .then(result => {
      console.log('Reset result:', result);
      process.exit(result.success ? 0 : 1);
    })
    .catch(err => {
      console.error('Reset failed:', err);
      process.exit(1);
    });
} 