import { z } from 'zod';

export interface RateLimitConfig {
  windowMs: number; // Time window in milliseconds
  maxRequests: number; // Maximum requests per window
  message?: string;
  statusCode?: number;
  headers?: boolean;
}

export interface RateLimitStrategy {
  name: string;
  check: (
    key: string,
    config: RateLimitConfig
  ) => Promise<{
    allowed: boolean;
    remaining: number;
    resetTime: number;
    totalHits: number;
  }>;
  reset?: (key: string) => Promise<void>;
}

// Environment variable schema with enhanced options
const envSchema = z.object({
  RATE_LIMIT_ENABLED: z
    .string()
    .transform((val) => val !== 'false')
    .default('true'),
  RATE_LIMIT_STRATEGY: z.enum(['memory', 'database']).default('memory'),
  RATE_LIMIT_CLEANUP_INTERVAL: z
    .string()
    .transform((val) => parseInt(val, 10))
    .default('900000'), // 15 minutes
  RATE_LIMIT_MAX_MEMORY_MB: z
    .string()
    .transform((val) => parseInt(val, 10))
    .default('100'), // 100MB default
  RATE_LIMIT_MAX_ENTRIES: z
    .string()
    .transform((val) => parseInt(val, 10))
    .default('10000'), // 10k entries default
  RATE_LIMIT_DB_MAX_RETRIES: z
    .string()
    .transform((val) => parseInt(val, 10))
    .default('3'),
  RATE_LIMIT_DB_RETRY_DELAY: z
    .string()
    .transform((val) => parseInt(val, 10))
    .default('100') // 100ms base delay
});

// Validate environment variables
const env = envSchema.parse(process.env);

// Default configurations with more granular control
export const defaultConfigs = {
  // General API endpoints
  api: {
    windowMs: 15 * 60 * 1000, // 15 minutes
    maxRequests: 100,
    message: 'Too many requests, please try again later.',
    statusCode: 429,
    headers: true
  } as RateLimitConfig,

  // Authentication endpoints (more restrictive)
  auth: {
    windowMs: 15 * 60 * 1000, // 15 minutes
    maxRequests: 5,
    message: 'Too many authentication attempts, please try again later.',
    statusCode: 429,
    headers: true
  } as RateLimitConfig,

  // Public endpoints (more permissive)
  public: {
    windowMs: 5 * 60 * 1000, // 5 minutes
    maxRequests: 500,
    message: 'Rate limit exceeded.',
    statusCode: 429,
    headers: true
  } as RateLimitConfig
} as const;

// Global configuration
export interface GlobalConfig {
  enabled: boolean;
  strategy: 'memory' | 'database';
  cleanupIntervalMs: number;
  memory: {
    maxMemoryMB: number;
    maxEntries: number;
  };
  database: {
    maxRetries: number;
    retryDelayMs: number;
  };
}

// Get global configuration
export function getRateLimitConfig(): GlobalConfig {
  return {
    enabled: env.RATE_LIMIT_ENABLED,
    strategy: env.RATE_LIMIT_STRATEGY,
    cleanupIntervalMs: env.RATE_LIMIT_CLEANUP_INTERVAL,
    memory: {
      maxMemoryMB: env.RATE_LIMIT_MAX_MEMORY_MB,
      maxEntries: env.RATE_LIMIT_MAX_ENTRIES
    },
    database: {
      maxRetries: env.RATE_LIMIT_DB_MAX_RETRIES,
      retryDelayMs: env.RATE_LIMIT_DB_RETRY_DELAY
    }
  };
}
