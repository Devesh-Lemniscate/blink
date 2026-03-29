import { createClient } from 'redis';

let redisClient = null;
let isRedisConnected = false;

/**
 * Initialize Redis connection
 * Redis is optional - app works without it but with reduced performance
 */
export const connectRedis = async () => {
    // Skip if Redis URL is not configured
    if (!process.env.REDIS_URL) {
        console.log('⚠️  Redis URL not configured - running without cache (reduced performance)');
        return null;
    }

    try {
        redisClient = createClient({
            url: process.env.REDIS_URL,
            socket: {
                connectTimeout: 5000,
                lazyConnect: true,
            }
        });

        redisClient.on('error', (err) => {
            console.error('Redis Client Error:', err.message);
            isRedisConnected = false;
        });

        redisClient.on('connect', () => {
            console.log('🚀 Redis connected successfully');
            isRedisConnected = true;
        });

        redisClient.on('disconnect', () => {
            console.log('⚠️  Redis disconnected');
            isRedisConnected = false;
        });

        await redisClient.connect();
        isRedisConnected = true;
        return redisClient;
    } catch (error) {
        console.error('⚠️  Redis connection failed:', error.message);
        console.log('📦 Falling back to database-only mode');
        isRedisConnected = false;
        return null;
    }
};

/**
 * Get Redis client instance
 */
export const getRedisClient = () => redisClient;

/**
 * Check if Redis is available
 */
export const isRedisAvailable = () => isRedisConnected && redisClient !== null;

/**
 * Cache keys configuration
 */
export const CACHE_KEYS = {
    SHORT_URL: (shortUrl) => `url:${shortUrl}`,
    URL_ANALYTICS: (shortUrl) => `analytics:${shortUrl}`,
    USER_URLS: (userId) => `user:${userId}:urls`,
    RATE_LIMIT: (ip) => `ratelimit:${ip}`,
};

/**
 * Default TTL values (in seconds)
 */
export const CACHE_TTL = {
    SHORT_URL: 3600,        // 1 hour - URL mappings
    URL_ANALYTICS: 300,     // 5 minutes - Analytics data
    USER_URLS: 600,         // 10 minutes - User's URL list
    RATE_LIMIT: 60,         // 1 minute - Rate limiting window
};

export default redisClient;
