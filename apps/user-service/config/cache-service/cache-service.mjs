import { createHash } from 'crypto';
import { createClient } from 'redis';
import redisMock from 'redis-mock';

export class CacheService {
  constructor(settings) {
    this.client = null;
    this.cacheTTL = settings.cache_ttl || 60;
    this.cachePrefix = settings.cache_prefix || 'cache';
    this.settings = settings;
  }

  /**
   * Connect to Redis, either using a real Redis instance (with host/port)
   * or using an in-memory mock Redis.
   */
  async connectRedis() {
    try {
      if (this.settings.cache_mode === 'redis') {
        // Connect to real Redis server
        this.client = createClient({
          socket: {
            host: this.settings.redis_host,
            port: this.settings.redis_port,
          },
        });
        await this.client.connect();
        console.log(`Connected to Redis: ${this.settings.redis_host}:${this.settings.redis_port}`);
      } else {
        // Use in-memory Redis mock if cache_mode is not 'redis'
        this.client = redisMock.createClient();
        console.log(`Connected to in-memory Redis mock: ${this.client.options.host}:${this.client.options.port}`);
      }
    } catch (err) {
      console.error('Error Cache Connection:', err);
    }
  }

  /**
   * Generates a unique key for caching based on the request payload.
   */
  generateCacheKey(payload) {
    const hash = createHash('sha256').update(JSON.stringify(payload)).digest('hex');
    return `${this.cachePrefix}:${hash}`;
  }

  /**
   * Set a value in the Redis cache with the specified TTL.
   */
  async setCache(key, value, ttl = this.cacheTTL) {
    const ttlSeconds = Math.ceil(ttl / 1000); // Convert milliseconds to seconds
    await this.client.setEx(key, ttlSeconds, JSON.stringify(value));
  }

  /**
   * Get a value from the Redis cache.
   */
  async getCache(key) {
    console.log(`Getting cache for key: ${key}`);
    const cachedData = await this.client.get(key);
    return cachedData ? JSON.parse(cachedData) : null;
  }

  /**
   * Invalidate a specific cache entry.
   */
  async invalidateCache(key) {
    await this.client.del(key);
  }

  /**
   * Invalidate multiple cache entries by an array of keys.
   */
  async invalidateMultipleCaches(keys) {
    const promises = keys.map((key) => this.client.del(key));
    return Promise.allSettled(promises);
  }

  /**
   * Middleware to cache responses for express routes.
   */
  cacheMiddleware(ttl) {
    return async (req, res, next) => {
      // console.log(`Request URL: ${req.originalUrl}`, `Request Body: ${JSON.stringify(req.body)}`);
      const key = this.generateCacheKey({ path: req.originalUrl, body: req.body });
      // console.log(`Cache key: ${key}`);

      const cachedResponse = await this.getCache(key);
      if (cachedResponse) {
        // console.log(`Cache hit for key: ${key}`);
        return res.status(200).json(JSON.parse(cachedResponse));
      }

      // Modify res.send to cache the response
      const originalSend = res.send.bind(res);
      res.send = (body) => {
        this.setCache(key, body, ttl);
        originalSend(body);
      };
      next();
    };
  }

  /**
   * Gracefully closes the Redis connection.
   */
  async close() {
    if (this.client) {
      try {
        await this.client.quit();
        console.log('Redis connection closed.');
      } catch (error) {
        console.error('Error closing Redis connection:', error);
      }
    }
  }
}
