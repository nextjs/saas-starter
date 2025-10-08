import { chromium, FullConfig } from '@playwright/test';
import { db } from '../lib/db/drizzle';
import { users, teams, teamMembers, uploads, activityLogs } from '../lib/db/schema';
import { hashPassword } from '../lib/auth/session';

async function globalSetup(config: FullConfig) {
  console.log('🚀 Starting global test setup...');
  
  // Set up environment variables for tests
  // NODE_ENV is read-only, so we'll set it via global assignment
  (global as any).process = global.process || process;
  process.env.DATABASE_URL = process.env.DATABASE_URL || 'postgresql://postgres:postgres@localhost:54322/postgres';
  process.env.AUTH_SECRET = process.env.AUTH_SECRET || 'test-secret-key';
  
  // S3 LocalStack configuration
  process.env.S3_ACCESS_KEY_ID = 'test';
  process.env.S3_SECRET_ACCESS_KEY = 'test';
  process.env.S3_REGION = 'us-east-1';
  process.env.S3_BUCKET = 'test-bucket';
  process.env.S3_ENDPOINT = 'http://localhost:4566';
  process.env.USE_LOCAL_S3 = 'true';
  
  // Ensure environment variables are available globally
  global.process = global.process || process;
  
  // Ensure database is clean and seeded with test data
  await setupTestDatabase();
  
  // Verify the application is running
  await verifyApplicationHealth();
  
  console.log('✅ Global test setup completed');
}

async function setupTestDatabase() {
  console.log('🗄️ Setting up test database...');
  
  try {
    // Clean existing test data
    await db.delete(activityLogs);
    await db.delete(uploads);
    await db.delete(teamMembers);
    await db.delete(teams);
    await db.delete(users);
    
    // Create test users
    const testUsers = [
      {
        email: 'test@test.com',
        password: 'admin123',
        role: 'owner' as const,
        name: 'Test User'
      },
      {
        email: 'member@test.com',
        password: 'member123',
        role: 'member' as const,
        name: 'Test Member'
      },
      {
        email: 'admin@test.com',
        password: 'admin123',
        role: 'owner' as const,
        name: 'Test Admin'
      }
    ];
    
    const createdUsers = [];
    for (const userData of testUsers) {
      const passwordHash = await hashPassword(userData.password);
      
      const [user] = await db.insert(users).values({
        email: userData.email,
        passwordHash,
        role: userData.role,
        name: userData.name
      }).returning();
      
      createdUsers.push({ ...user, password: userData.password });
    }
    
    // Create test teams/spaces
    const testTeams = [
      {
        name: 'Blaupunkt',
        slug: 'blaupunkt',
        description: 'Blaupunkt Android tablet OTA images',
        s3Prefix: 'uploads/blaupunkt',
        isActive: true
      },
      {
        name: 'Test Team',
        slug: 'test-team',
        description: 'Test team for E2E testing',
        s3Prefix: 'uploads/test-team',
        isActive: true
      }
    ];
    
    const createdTeams = [];
    for (const teamData of testTeams) {
      const [team] = await db.insert(teams).values(teamData).returning();
      createdTeams.push(team);
    }
    
    // Create team memberships
    const ownerUser = createdUsers.find(u => u.role === 'owner');
    const memberUser = createdUsers.find(u => u.role === 'member');
    
    if (ownerUser && createdTeams.length > 0) {
      // Owner gets access to all teams
      for (const team of createdTeams) {
        await db.insert(teamMembers).values({
          userId: ownerUser.id,
          teamId: team.id,
          role: 'owner'
        });
      }
    }
    
    if (memberUser && createdTeams.length > 0) {
      // Member gets access to first team only
      await db.insert(teamMembers).values({
        userId: memberUser.id,
        teamId: createdTeams[0].id,
        role: 'member'
      });
    }
    
    // Store test data for use in tests
    process.env.TEST_USERS = JSON.stringify(createdUsers);
    process.env.TEST_TEAMS = JSON.stringify(createdTeams);
    
    console.log('✅ Test database setup completed');
    console.log(`   - Created ${createdUsers.length} test users`);
    console.log(`   - Created ${createdTeams.length} test teams`);
    
  } catch (error) {
    console.error('❌ Database setup failed:', error);
    throw error;
  }
}

async function verifyApplicationHealth() {
  console.log('🔍 Verifying application health...');
  
  const browser = await chromium.launch();
  const page = await browser.newPage();
  
  try {
    // Try to access the application
    const response = await page.goto('http://localhost:3000', { 
      waitUntil: 'networkidle',
      timeout: 30000 
    });
    
    if (!response || !response.ok()) {
      throw new Error(`Application not responding: ${response?.status()}`);
    }
    
    // Check if we can see the sign-in page elements (app redirects to sign-in)
    await page.waitForSelector('h2:has-text("Sign in"), h1', { timeout: 10000 });
    
    console.log('✅ Application is healthy and responding');
    
  } catch (error) {
    console.error('❌ Application health check failed:', error);
    throw error;
  } finally {
    await browser.close();
  }
}

export default globalSetup;
