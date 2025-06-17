import type { RateLimitConfig, RateLimitStrategy } from '../config';
import { getRateLimitConfig } from '../config';

interface RateLimitEntry {
  count: number;
  resetTime: number;
  lastAccessed: number;
  next?: RateLimitEntry;
  prev?: RateLimitEntry;
}

interface MemoryStore {
  [key: string]: RateLimitEntry;
}

class LRUCache {
  private head?: RateLimitEntry;
  private tail?: RateLimitEntry;
  private store: MemoryStore = {};
  private size: number = 0;
  private maxSize: number;
  private memoryLimit: number;

  constructor(maxSize: number, memoryLimitMB: number = 100) {
    this.maxSize = maxSize;
    this.memoryLimit = memoryLimitMB * 1024 * 1024;
  }

  private moveToFront(entry: RateLimitEntry) {
    if (entry === this.head) return;

    // Remove from current position
    if (entry.prev) entry.prev.next = entry.next;
    if (entry.next) entry.next.prev = entry.prev;
    if (entry === this.tail) this.tail = entry.prev;

    // Move to front
    entry.next = this.head;
    entry.prev = undefined;
    if (this.head) this.head.prev = entry;
    this.head = entry;
    if (!this.tail) this.tail = entry;
  }

  private removeLRU() {
    if (!this.tail) return;

    const key = Object.keys(this.store).find(
      (k) => this.store[k] === this.tail
    );
    if (key) {
      delete this.store[key];
      this.size--;
    }

    this.tail = this.tail.prev;
    if (this.tail) this.tail.next = undefined;
    else this.head = undefined;
  }

  set(key: string, value: Omit<RateLimitEntry, 'next' | 'prev'>) {
    let entry = this.store[key];

    if (entry) {
      entry.count = value.count;
      entry.resetTime = value.resetTime;
      entry.lastAccessed = value.lastAccessed;
      this.moveToFront(entry);
      return;
    }

    entry = { ...value, next: undefined, prev: undefined };
    this.store[key] = entry;

    if (this.head) {
      entry.next = this.head;
      this.head.prev = entry;
    }
    this.head = entry;
    if (!this.tail) this.tail = entry;

    this.size++;

    // Check size limit only - memory pressure is checked separately
    if (this.size > this.maxSize) {
      this.removeLRU();
    }
  }

  get(key: string): RateLimitEntry | undefined {
    const entry = this.store[key];
    if (entry) {
      entry.lastAccessed = Date.now();
      this.moveToFront(entry);
    }
    return entry;
  }

  delete(key: string) {
    const entry = this.store[key];
    if (!entry) return;

    if (entry.prev) entry.prev.next = entry.next;
    if (entry.next) entry.next.prev = entry.prev;
    if (entry === this.head) this.head = entry.next;
    if (entry === this.tail) this.tail = entry.prev;

    delete this.store[key];
    this.size--;
  }

  clear() {
    this.store = {};
    this.head = undefined;
    this.tail = undefined;
    this.size = 0;
  }

  getEntries(): MemoryStore {
    return this.store;
  }

  getSize(): number {
    return this.size;
  }

  getMemoryUsage(): { entries: number; estimatedBytes: number } {
    // More accurate cache-specific memory estimation
    const entrySize = 80; // Approximate bytes per entry (key + values + pointers)
    return {
      entries: this.size,
      estimatedBytes: this.size * entrySize
    };
  }
}

class MemoryRateLimitStore {
  private cache: LRUCache;
  private cleanupInterval: NodeJS.Timeout;
  private metricsInterval: NodeJS.Timeout;
  private metrics = {
    hits: 0,
    misses: 0,
    evictions: 0
  };

  constructor() {
    const config = getRateLimitConfig();

    // Use configuration values
    this.cache = new LRUCache(
      config.memory.maxEntries,
      config.memory.maxMemoryMB
    );

    this.cleanupInterval = setInterval(() => {
      this.cleanup();
    }, config.cleanupIntervalMs);

    // Log metrics periodically
    this.metricsInterval = setInterval(() => this.logMetrics(), 60000);
  }

  private cleanup() {
    const now = Date.now();
    let cleaned = 0;

    // Get entries and clean up expired ones
    const entries = this.cache.getEntries();
    Object.entries(entries).forEach(([key, entry]) => {
      if (entry.resetTime <= now) {
        this.cache.delete(key);
        cleaned++;
        this.metrics.evictions++;
      }
    });

    if (cleaned > 0) {
      const memUsage = this.cache.getMemoryUsage();
      console.log(
        `Rate limit cleanup: removed ${cleaned} entries, current cache size: ${
          memUsage.entries
        } entries, estimated memory: ${Math.round(
          memUsage.estimatedBytes / 1024
        )}KB`
      );
    }
  }

  private logMetrics() {
    const total = this.metrics.hits + this.metrics.misses;
    const hitRate = total > 0 ? (this.metrics.hits / total) * 100 : 0;

    console.log('Rate limit memory metrics:', {
      ...this.metrics,
      hitRate: `${hitRate.toFixed(2)}%`,
      cacheSize: this.cache.getSize(),
      memoryUsage: this.cache.getMemoryUsage()
    });
  }

  async increment(key: string, resetTime: number): Promise<number> {
    const now = Date.now();
    const entry = this.cache.get(key);

    if (!entry || entry.resetTime <= now) {
      this.metrics.misses++;
      this.cache.set(key, {
        count: 1,
        resetTime,
        lastAccessed: now
      });
      return 1;
    }

    this.metrics.hits++;
    entry.count++;
    entry.lastAccessed = now;
    return entry.count;
  }

  async reset(key: string): Promise<void> {
    this.cache.delete(key);
  }

  destroy() {
    clearInterval(this.cleanupInterval);
    clearInterval(this.metricsInterval);
    this.cache.clear();
  }
}

// Singleton instance with proper cleanup
let memoryStore: MemoryRateLimitStore | null = null;
let cleanupRegistered = false;

function getStore(): MemoryRateLimitStore {
  if (!memoryStore) {
    memoryStore = new MemoryRateLimitStore();

    // Register cleanup handler only once
    if (!cleanupRegistered) {
      cleanupRegistered = true;

      // Multiple cleanup handlers for different scenarios
      const cleanup = () => {
        if (memoryStore) {
          memoryStore.destroy();
          memoryStore = null;
        }
      };

      process.on('beforeExit', cleanup);
      process.on('SIGINT', cleanup);
      process.on('SIGTERM', cleanup);
      process.on('uncaughtException', cleanup);
    }
  }
  return memoryStore;
}

export const memoryStrategy: RateLimitStrategy = {
  name: 'memory',

  async check(key: string, config: RateLimitConfig) {
    const now = Date.now();
    const resetTime = now + config.windowMs;

    const currentCount = await getStore().increment(key, resetTime);

    return {
      allowed: currentCount <= config.maxRequests,
      remaining: Math.max(0, config.maxRequests - currentCount),
      resetTime,
      totalHits: currentCount
    };
  },

  async reset(key: string) {
    await getStore().reset(key);
  }
};
