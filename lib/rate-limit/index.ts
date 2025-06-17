import type { RateLimitConfig, RateLimitStrategy } from './config';
import { defaultConfigs, getRateLimitConfig } from './config';
import { memoryStrategy } from './strategies/memory';
import { databaseStrategy, DatabaseError } from './strategies/database';
import { trackIpAddress } from '@/lib/db/queries';

// Strategy registry - only memory and database (simple and effective)
const strategies: Record<string, RateLimitStrategy> = {
  memory: memoryStrategy,
  database: databaseStrategy
};

// Trusted proxy configuration - SECURITY CRITICAL
// These should be configured based on your infrastructure
const TRUSTED_PROXIES = new Set([
  '127.0.0.1',
  '::1'
  // Add your actual trusted proxy IPs here:
  // AWS ALB: Configure based on your VPC
  // Cloudflare: https://www.cloudflare.com/ips/
  // Vercel: Configure based on deployment
  // Example: '203.0.113.0', '2001:db8::1'
]);

// Helper functions for IP validation - SECURITY CRITICAL
function isValidIp(ip: string): boolean {
  // IPv4 regex
  const ipv4Regex =
    /^(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$/;
  // IPv6 regex (simplified)
  const ipv6Regex = /^(?:[0-9a-fA-F]{1,4}:){7}[0-9a-fA-F]{1,4}$/;

  return ipv4Regex.test(ip) || ipv6Regex.test(ip);
}

function isPrivateIp(ip: string): boolean {
  // Check for private IP ranges
  const privateRanges = [
    /^10\./,
    /^172\.(1[6-9]|2[0-9]|3[0-1])\./,
    /^192\.168\./,
    /^127\./,
    /^::1$/,
    /^fc00:/,
    /^fe80:/
  ];

  return privateRanges.some((range) => range.test(ip));
}

function isInTrustedRange(ip: string): boolean {
  // Check if IP is in trusted CIDR ranges
  // This is a simplified implementation - use a proper CIDR library in production
  for (const trustedProxy of TRUSTED_PROXIES) {
    if (trustedProxy.includes('/')) {
      // CIDR notation - implement proper CIDR matching
      continue;
    }
    if (ip === trustedProxy) {
      return true;
    }
  }
  return false;
}

// Secure IP extraction with trusted proxy validation
function getIpFromRequest(request: Request): string {
  const forwardedFor = request.headers.get('x-forwarded-for');
  const realIp = request.headers.get('x-real-ip');
  const remoteAddr = request.headers.get('remote-addr') || 'unknown';

  // If no forwarded headers, use remote address
  if (!forwardedFor && !realIp) {
    return remoteAddr;
  }

  // Validate if the request comes from a trusted proxy
  const immediateClientIp = remoteAddr;
  if (
    !TRUSTED_PROXIES.has(immediateClientIp) &&
    !isInTrustedRange(immediateClientIp)
  ) {
    // Request doesn't come from trusted proxy, ignore forwarded headers
    return immediateClientIp;
  }

  // Extract the leftmost IP from X-Forwarded-For (the original client)
  if (forwardedFor) {
    const ips = forwardedFor.split(',').map((ip) => ip.trim());
    // Return the first non-private IP, or the first IP if all are private
    for (const ip of ips) {
      if (isValidIp(ip) && !isPrivateIp(ip)) {
        return ip;
      }
    }
    // If all IPs are private, return the first valid one
    for (const ip of ips) {
      if (isValidIp(ip)) {
        return ip;
      }
    }
  }

  // Fallback to X-Real-IP if available and valid
  if (realIp && isValidIp(realIp)) {
    return realIp;
  }

  return remoteAddr;
}

// Add rate limiting for unique IP tracking to prevent memory exhaustion
const IP_TRACKING_CACHE = new Map<string, number>();
const IP_TRACKING_LIMIT = 1000; // Max unique IPs to track per window
const IP_TRACKING_WINDOW = 60 * 1000; // 1 minute window

function shouldTrackIp(ip: string): boolean {
  const now = Date.now();
  const lastTracked = IP_TRACKING_CACHE.get(ip);

  // Clean up old entries periodically
  if (IP_TRACKING_CACHE.size > IP_TRACKING_LIMIT) {
    const cutoff = now - IP_TRACKING_WINDOW;
    for (const [cachedIp, timestamp] of IP_TRACKING_CACHE.entries()) {
      if (timestamp < cutoff) {
        IP_TRACKING_CACHE.delete(cachedIp);
      }
    }
  }

  // Only track if not recently tracked
  if (!lastTracked || now - lastTracked > IP_TRACKING_WINDOW) {
    IP_TRACKING_CACHE.set(ip, now);
    return true;
  }

  return false;
}

export interface RateLimitResult {
  success: boolean;
  limit: number;
  remaining: number;
  reset: number;
  totalHits: number;
}

export class RateLimiter {
  private strategy: RateLimitStrategy;
  private config: RateLimitConfig;

  constructor(config?: Partial<RateLimitConfig>, strategyName?: string) {
    const globalConfig = getRateLimitConfig();
    const strategyToUse = strategyName || globalConfig.strategy;

    this.strategy = strategies[strategyToUse];
    if (!this.strategy) {
      console.warn(
        `Rate limit strategy '${strategyToUse}' not found, falling back to memory`
      );
      this.strategy = strategies.memory;
    }

    this.config = {
      ...defaultConfigs.api,
      ...config
    };
  }

  async limit(request: Request, customKey?: string): Promise<RateLimitResult> {
    const globalConfig = getRateLimitConfig();

    // If rate limiting is disabled, allow all requests
    if (!globalConfig.enabled) {
      return {
        success: true,
        limit: this.config.maxRequests,
        remaining: this.config.maxRequests,
        reset: Date.now() + this.config.windowMs,
        totalHits: 0
      };
    }

    // Extract IP and track it (fire-and-forget for performance)
    const ip = getIpFromRequest(request);
    if (ip !== 'unknown' && shouldTrackIp(ip)) {
      // Don't await - track asynchronously to avoid blocking request
      trackIpAddress(ip).catch((error) =>
        console.error('Failed to track IP address:', error)
      );
    }

    // Use IP-based key for rate limiting
    const key = customKey || `ip:${ip}`;

    try {
      const result = await this.strategy.check(key, this.config);

      return {
        success: result.allowed,
        limit: this.config.maxRequests,
        remaining: result.remaining,
        reset: result.resetTime,
        totalHits: result.totalHits
      };
    } catch (error) {
      console.error('Rate limit check failed:', error);

      // Fail secure for database errors, fail open for other errors
      if (error instanceof DatabaseError) {
        // Database is down - fail secure (reject request)
        return {
          success: false,
          limit: this.config.maxRequests,
          remaining: 0,
          reset: Date.now() + this.config.windowMs,
          totalHits: this.config.maxRequests + 1
        };
      }

      // For memory strategy or other errors - fail open (allow request)
      return {
        success: true,
        limit: this.config.maxRequests,
        remaining: this.config.maxRequests,
        reset: Date.now() + this.config.windowMs,
        totalHits: 0
      };
    }
  }

  async reset(request: Request, customKey?: string): Promise<void> {
    const ip = getIpFromRequest(request);
    const key = customKey || `ip:${ip}`;

    if (this.strategy.reset) {
      try {
        await this.strategy.reset(key);
      } catch (error) {
        console.error('Failed to reset rate limit:', error);
        // Don't throw error for reset operations
      }
    }
  }
}

// Convenience functions for different endpoint types
export function createApiRateLimiter(config?: Partial<RateLimitConfig>) {
  return new RateLimiter({ ...defaultConfigs.api, ...config });
}

export function createAuthRateLimiter(config?: Partial<RateLimitConfig>) {
  return new RateLimiter({ ...defaultConfigs.auth, ...config });
}

export function createPublicRateLimiter(config?: Partial<RateLimitConfig>) {
  return new RateLimiter({ ...defaultConfigs.public, ...config });
}

// Default rate limiter instance
export const rateLimiter = new RateLimiter();

// Export the IP extraction function for reuse
export { getIpFromRequest };
