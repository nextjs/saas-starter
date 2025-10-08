import { FullConfig } from '@playwright/test';
import { db } from '../lib/db/drizzle';
import { users, teams, teamMembers, uploads, activityLogs, invitations } from '../lib/db/schema';

async function globalTeardown(config: FullConfig) {
  console.log('🧹 Starting global test teardown...');
  
  try {
    // Clean up test data
    await cleanupTestDatabase();
    
    console.log('✅ Global test teardown completed');
  } catch (error) {
    console.error('❌ Global teardown failed:', error);
    // Don't throw error to avoid masking test failures
  }
}

async function cleanupTestDatabase() {
  console.log('🗑️ Cleaning up test database...');
  
  try {
    // Delete in reverse order of dependencies
    await db.delete(activityLogs);
    await db.delete(uploads);
    await db.delete(invitations);
    await db.delete(teamMembers);
    await db.delete(teams);
    await db.delete(users);
    
    console.log('✅ Test database cleaned up');
  } catch (error) {
    console.error('❌ Database cleanup failed:', error);
    throw error;
  }
}

export default globalTeardown;
