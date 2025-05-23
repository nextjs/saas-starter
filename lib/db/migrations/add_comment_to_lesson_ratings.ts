import { sql } from 'drizzle-orm';
import { db } from '../drizzle';

export async function addCommentToLessonRatings() {
  console.log('Adding comment column to lesson_ratings table...');
  
  try {
    // Directly try to add the column and handle errors appropriately
    try {
      await db.execute(sql`
        ALTER TABLE lesson_ratings 
        ADD COLUMN comment TEXT
      `);
      console.log('Successfully added comment column to lesson_ratings');
    } catch (err) {
      // Check if this is a "column already exists" error
      if (err.message && err.message.includes('already exists')) {
        console.log('comment column already exists in lesson_ratings');
      } else {
        // If it's another error, rethrow it
        throw err;
      }
    }
    
    return { success: true };
  } catch (error) {
    console.error('Error adding comment column to lesson_ratings:', error);
    return { success: false, error };
  }
}

// Run the migration if this file is executed directly
if (require.main === module) {
  addCommentToLessonRatings()
    .then(result => {
      console.log('Migration result:', result);
      process.exit(result.success ? 0 : 1);
    })
    .catch(err => {
      console.error('Migration failed:', err);
      process.exit(1);
    });
} 