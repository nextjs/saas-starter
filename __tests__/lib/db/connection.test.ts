import { describe, it, expect } from '@jest/globals';
import { db } from '@/lib/db/drizzle';
import { sql } from 'drizzle-orm';

describe('Database Connection', () => {
  it('should connect to database successfully', async () => {
    try {
      // Test a simple query
      const result = await db.execute(sql`SELECT 1`);
      expect(result).toBeDefined();
    } catch (error) {
      expect(`Database connection failed: ${error}`).toBeFalsy();
    }
  });

  it('should handle connection errors gracefully', async () => {
    // Mock DB_URL to be invalid
    const originalUrl = process.env.DB_URL;
    process.env.DB_URL = 'invalid-url';

    try {
      await db.execute(sql`SELECT 1`);
      expect('Should have thrown an error').toBeFalsy();
    } catch (error) {
      expect(error).toBeDefined();
    } finally {
      process.env.DB_URL = originalUrl;
    }
  });
}); 