# Rate Limiting

Production-ready rate limiting for Next.js applications with both memory and database strategies.

## Features

- **Memory Strategy**: Fast in-memory LRU cache with automatic cleanup (default)
- **Database Strategy**: Persistent PostgreSQL-based limiting with retry logic
- **IP-based tracking**: Automatic request tracking by IP address
- **Server Actions support**: Rate limiting for Next.js server actions with proper navigation handling
- **Configurable limits**: Per-endpoint and global configuration

## Quick Start

### Environment Variables

```bash
# Basic configuration
RATE_LIMIT_ENABLED=true                    # Enable/disable (default: true)
RATE_LIMIT_STRATEGY=memory                 # memory|database (default: memory)

# Advanced configuration (optional)
RATE_LIMIT_CLEANUP_INTERVAL=900000         # Cleanup interval in ms (default: 15min)
RATE_LIMIT_MAX_MEMORY_MB=100               # Memory limit for cache (default: 100MB)
RATE_LIMIT_MAX_ENTRIES=10000               # Max cache entries (default: 10k)
RATE_LIMIT_DB_MAX_RETRIES=3                # Database retry attempts (default: 3)
RATE_LIMIT_DB_RETRY_DELAY=100              # Base retry delay in ms (default: 100ms)
```

### API Routes

```typescript
import { withRateLimit, withAuthRateLimit } from '@/lib/rate-limit/utils';

// Standard API (100 req/15min)
export const GET = withRateLimit(async (request) => {
  return Response.json({ message: 'Hello' });
});

// Auth endpoints (5 req/15min)
export const POST = withAuthRateLimit(async (request) => {
  return Response.json({ success: true });
});
```

### Server Actions

```typescript
import { withSignInRateLimit, withSignUpRateLimit } from '@/lib/rate-limit/server-actions';

export const signIn = withSignInRateLimit(async (formData) => {
  // Your sign-in logic
  // redirect() and other Next.js navigation functions work properly
  redirect('/dashboard');
});

export const signUp = withSignUpRateLimit(async (formData) => {
  // Your sign-up logic
});
```

## Default Limits

- **API endpoints**: 100 requests per 15 minutes
- **Auth endpoints**: 5 requests per 15 minutes  
- **Public endpoints**: 500 requests per 5 minutes

## Database Setup

If using the database strategy, ensure your migrations are up to date:

```bash
pnpm db:migrate  # or your migration command
```

The system automatically creates the required `rate_limits` and `ip_addresses` tables.

## Error Handling

- **Database strategy**: Fails secure (rejects requests) if database is unavailable
- **Memory strategy**: Fails open (allows requests) on errors
- **Automatic retries**: Database operations use exponential backoff
- **Navigation support**: Next.js `redirect()` and `notFound()` work properly in wrapped server actions
- **Metrics**: Built-in performance and error rate monitoring

## Security

⚠️ **IMPORTANT**: This implementation includes security fixes for production use. Please read the [Security Guide](./SECURITY.md) for:

- Critical security vulnerabilities that were fixed
- Production configuration requirements
- Security best practices and monitoring
- Testing recommendations

**Before deploying to production**, ensure you:
1. Configure trusted proxy IPs correctly
2. Review security considerations
3. Implement monitoring and alerting
4. Test security scenarios 