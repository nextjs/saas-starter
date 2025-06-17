import type { RateLimitConfig, RateLimitStrategy } from '../config';
import { getRateLimitConfig } from '../config';
import { db } from '@/lib/db/drizzle';
import { rateLimits } from '@/lib/db/schema';
import { eq, sql, lte } from 'drizzle-orm';

// Error types for better error handling
export class RateLimitError extends Error {
  constructor(message: string, public cause?: Error) {
    super(message);
    this.name = 'RateLimitError';
  }
}

export class DatabaseError extends RateLimitError {
  constructor(message: string, cause?: Error) {
    super(message, cause);
    this.name = 'DatabaseError';
  }
}

interface CleanupResult {
  id: string;
}

class DatabaseRateLimitStore {
  private cleanupInterval: NodeJS.Timeout;
  private metricsInterval: NodeJS.Timeout;
  private batchSize: number = 1000;
  private metrics = {
    operations: 0,
    errors: 0,
    retries: 0
  };

  constructor() {
    const config = getRateLimitConfig();
    this.cleanupInterval = setInterval(() => {
      this.cleanup();
    }, config.cleanupIntervalMs);

    // Log metrics periodically
    this.metricsInterval = setInterval(() => this.logMetrics(), 60000);
  }

  private async retry<T>(operation: () => Promise<T>): Promise<T> {
    const config = getRateLimitConfig();
    let lastError: Error | undefined;
    let delay = config.database.retryDelayMs;

    for (let attempt = 1; attempt <= config.database.maxRetries; attempt++) {
      try {
        this.metrics.operations++;
        const result = await operation();
        if (attempt > 1) this.metrics.retries++;
        return result;
      } catch (error) {
        this.metrics.errors++;
        lastError = error as Error;

        // Log the specific error for debugging
        console.error(
          `Rate limit database operation failed (attempt ${attempt}/${config.database.maxRetries}):`,
          {
            error: error instanceof Error ? error.message : String(error),
            stack: error instanceof Error ? error.stack : undefined,
            attempt,
            maxRetries: config.database.maxRetries
          }
        );

        if (attempt === config.database.maxRetries) break;

        // Exponential backoff with jitter
        delay = Math.min(
          delay * 2 * (0.9 + Math.random() * 0.2),
          5000 // Max 5 seconds
        );

        await new Promise((resolve) => setTimeout(resolve, delay));
      }
    }

    throw new DatabaseError(
      `Operation failed after ${
        config.database.maxRetries
      } retries. Last error: ${lastError?.message || 'Unknown error'}`,
      lastError
    );
  }

  private logMetrics() {
    const errorRate =
      this.metrics.operations > 0
        ? (this.metrics.errors / this.metrics.operations) * 100
        : 0;
    const retryRate =
      this.metrics.operations > 0
        ? (this.metrics.retries / this.metrics.operations) * 100
        : 0;

    console.log('Rate limit database metrics:', {
      ...this.metrics,
      errorRate: `${errorRate.toFixed(2)}%`,
      retryRate: `${retryRate.toFixed(2)}%`
    });
  }

  private async cleanup() {
    const now = new Date();
    let totalCleaned = 0;

    try {
      // Use retry logic for cleanup operations - simplified approach
      await this.retry(async () => {
        // First count the expired records
        const expiredCount = await db
          .select({ count: sql<number>`count(*)` })
          .from(rateLimits)
          .where(lte(rateLimits.resetTime, now));

        if (expiredCount[0]?.count > 0) {
          // Delete expired records
          await db.delete(rateLimits).where(lte(rateLimits.resetTime, now));

          totalCleaned = expiredCount[0].count;
        }
      });

      if (totalCleaned > 0) {
        console.log(
          `Rate limit cleanup: removed ${totalCleaned} expired entries from database`
        );
      }
    } catch (error) {
      console.error('Database cleanup failed:', error);
    }
  }

  async reset(key: string): Promise<void> {
    await this.retry(async () => {
      await db.delete(rateLimits).where(eq(rateLimits.id, key));
    });
  }

  async checkAndIncrement(key: string, config: RateLimitConfig) {
    const now = new Date();
    const resetTime = new Date(Date.now() + config.windowMs);

    return await this.retry(async () => {
      // First, try to get existing record with a transaction-like approach
      const existing = await db
        .select()
        .from(rateLimits)
        .where(eq(rateLimits.id, key))
        .limit(1);

      if (existing.length === 0) {
        // No existing record, try to insert
        try {
          await db.insert(rateLimits).values({
            id: key,
            count: 1,
            resetTime,
            updatedAt: now
          });

          return {
            allowed: 1 <= config.maxRequests,
            remaining: Math.max(0, config.maxRequests - 1),
            resetTime: resetTime.getTime(),
            totalHits: 1
          };
        } catch (insertError) {
          // Race condition - record was created by another request
          // Fall through to update logic below
        }
      }

      // Record exists or was just created, handle update
      const record =
        existing[0] ||
        (
          await db
            .select()
            .from(rateLimits)
            .where(eq(rateLimits.id, key))
            .limit(1)
        )[0];

      if (!record) {
        throw new DatabaseError('Failed to retrieve rate limit record');
      }

      // Check if window has expired
      if (record.resetTime <= now) {
        // Reset the window
        const result = await db
          .update(rateLimits)
          .set({
            count: 1,
            resetTime,
            updatedAt: now
          })
          .where(eq(rateLimits.id, key))
          .returning({
            count: rateLimits.count,
            resetTime: rateLimits.resetTime
          });

        if (result.length === 0) {
          throw new DatabaseError('Failed to reset rate limit record');
        }

        return {
          allowed: 1 <= config.maxRequests,
          remaining: Math.max(0, config.maxRequests - 1),
          resetTime: resetTime.getTime(),
          totalHits: 1
        };
      }

      // Increment count within existing window
      const newCount = record.count + 1;
      const result = await db
        .update(rateLimits)
        .set({
          count: newCount,
          updatedAt: now
        })
        .where(eq(rateLimits.id, key))
        .returning({
          count: rateLimits.count,
          resetTime: rateLimits.resetTime
        });

      if (result.length === 0) {
        throw new DatabaseError('Failed to increment rate limit record');
      }

      const updatedRecord = result[0];
      return {
        allowed: updatedRecord.count <= config.maxRequests,
        remaining: Math.max(0, config.maxRequests - updatedRecord.count),
        resetTime: updatedRecord.resetTime.getTime(),
        totalHits: updatedRecord.count
      };
    });
  }

  destroy() {
    clearInterval(this.cleanupInterval);
    clearInterval(this.metricsInterval);
  }
}

// Singleton instance with proper cleanup
let databaseStore: DatabaseRateLimitStore | null = null;
let cleanupRegistered = false;

function getStore(): DatabaseRateLimitStore {
  if (!databaseStore) {
    databaseStore = new DatabaseRateLimitStore();

    // Register cleanup handler only once
    if (!cleanupRegistered) {
      cleanupRegistered = true;

      // Multiple cleanup handlers for different scenarios
      const cleanup = () => {
        if (databaseStore) {
          databaseStore.destroy();
          databaseStore = null;
        }
      };

      process.on('beforeExit', cleanup);
      process.on('SIGINT', cleanup);
      process.on('SIGTERM', cleanup);
      process.on('uncaughtException', cleanup);
    }
  }
  return databaseStore;
}

export const databaseStrategy: RateLimitStrategy = {
  name: 'database',

  async check(key: string, config: RateLimitConfig) {
    return getStore().checkAndIncrement(key, config);
  },

  async reset(key: string) {
    await getStore().reset(key);
  }
};
