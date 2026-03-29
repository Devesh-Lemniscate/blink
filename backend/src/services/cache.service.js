import { getRedisClient, isRedisAvailable, CACHE_KEYS, CACHE_TTL } from '../config/redis.config.js';

/**
 * Cache Service - Graceful Redis caching with fallback
 * All methods are non-blocking and fail gracefully if Redis is unavailable
 */

/**
 * Get cached URL data
 * @param {string} shortUrl - The short URL code
 * @returns {Object|null} - Cached URL data or null
 */
export const getCachedUrl = async (shortUrl) => {
    if (!isRedisAvailable()) return null;
    
    try {
        const client = getRedisClient();
        const cached = await client.get(CACHE_KEYS.SHORT_URL(shortUrl));
        
        if (cached) {
            console.log(`📦 Cache HIT for: ${shortUrl}`);
            return JSON.parse(cached);
        }
        
        console.log(`📭 Cache MISS for: ${shortUrl}`);
        return null;
    } catch (error) {
        console.error('Cache get error:', error.message);
        return null;
    }
};

/**
 * Cache URL data
 * @param {string} shortUrl - The short URL code
 * @param {Object} urlData - URL data to cache
 * @param {number} ttl - Time to live in seconds
 */
export const setCachedUrl = async (shortUrl, urlData, ttl = CACHE_TTL.SHORT_URL) => {
    if (!isRedisAvailable()) return;
    
    try {
        const client = getRedisClient();
        await client.setEx(
            CACHE_KEYS.SHORT_URL(shortUrl),
            ttl,
            JSON.stringify(urlData)
        );
        console.log(`💾 Cached URL: ${shortUrl}`);
    } catch (error) {
        console.error('Cache set error:', error.message);
    }
};

/**
 * Invalidate cached URL
 * @param {string} shortUrl - The short URL code to invalidate
 */
export const invalidateCachedUrl = async (shortUrl) => {
    if (!isRedisAvailable()) return;
    
    try {
        const client = getRedisClient();
        await client.del(CACHE_KEYS.SHORT_URL(shortUrl));
        console.log(`🗑️  Invalidated cache: ${shortUrl}`);
    } catch (error) {
        console.error('Cache invalidation error:', error.message);
    }
};

/**
 * Increment click count in cache (async, non-blocking)
 * @param {string} shortUrl - The short URL code
 */
export const incrementCachedClicks = async (shortUrl) => {
    if (!isRedisAvailable()) return;
    
    try {
        const client = getRedisClient();
        const key = CACHE_KEYS.SHORT_URL(shortUrl);
        const cached = await client.get(key);
        
        if (cached) {
            const urlData = JSON.parse(cached);
            urlData.clicks = (urlData.clicks || 0) + 1;
            await client.setEx(key, CACHE_TTL.SHORT_URL, JSON.stringify(urlData));
        }
    } catch (error) {
        console.error('Cache increment error:', error.message);
    }
};

/**
 * Cache user's URLs list
 * @param {string} userId - User ID
 * @param {Array} urls - Array of URL objects
 */
export const setCachedUserUrls = async (userId, urls) => {
    if (!isRedisAvailable()) return;
    
    try {
        const client = getRedisClient();
        await client.setEx(
            CACHE_KEYS.USER_URLS(userId),
            CACHE_TTL.USER_URLS,
            JSON.stringify(urls)
        );
    } catch (error) {
        console.error('Cache user URLs error:', error.message);
    }
};

/**
 * Get cached user's URLs list
 * @param {string} userId - User ID
 * @returns {Array|null} - Cached URLs or null
 */
export const getCachedUserUrls = async (userId) => {
    if (!isRedisAvailable()) return null;
    
    try {
        const client = getRedisClient();
        const cached = await client.get(CACHE_KEYS.USER_URLS(userId));
        return cached ? JSON.parse(cached) : null;
    } catch (error) {
        console.error('Cache get user URLs error:', error.message);
        return null;
    }
};

/**
 * Invalidate user's URLs cache
 * @param {string} userId - User ID
 */
export const invalidateUserUrlsCache = async (userId) => {
    if (!isRedisAvailable()) return;
    
    try {
        const client = getRedisClient();
        await client.del(CACHE_KEYS.USER_URLS(userId));
    } catch (error) {
        console.error('Cache invalidate user URLs error:', error.message);
    }
};

/**
 * Track analytics event in Redis (for real-time dashboard)
 * @param {string} shortUrl - The short URL code
 * @param {Object} eventData - Analytics event data
 */
export const trackAnalyticsEvent = async (shortUrl, eventData) => {
    if (!isRedisAvailable()) return;
    
    try {
        const client = getRedisClient();
        const key = CACHE_KEYS.URL_ANALYTICS(shortUrl);
        
        // Store recent analytics events (keep last 100)
        await client.lPush(key, JSON.stringify({
            ...eventData,
            timestamp: new Date().toISOString()
        }));
        await client.lTrim(key, 0, 99);
        await client.expire(key, CACHE_TTL.URL_ANALYTICS * 12); // 1 hour
    } catch (error) {
        console.error('Analytics tracking error:', error.message);
    }
};

/**
 * Get analytics events from cache
 * @param {string} shortUrl - The short URL code
 * @returns {Array} - Array of analytics events
 */
export const getCachedAnalytics = async (shortUrl) => {
    if (!isRedisAvailable()) return [];
    
    try {
        const client = getRedisClient();
        const events = await client.lRange(CACHE_KEYS.URL_ANALYTICS(shortUrl), 0, -1);
        return events.map(e => JSON.parse(e));
    } catch (error) {
        console.error('Get analytics error:', error.message);
        return [];
    }
};

/**
 * Get cache statistics
 * @returns {Object} - Cache stats
 */
export const getCacheStats = async () => {
    if (!isRedisAvailable()) {
        return { available: false, message: 'Redis not connected' };
    }
    
    try {
        const client = getRedisClient();
        const info = await client.info('stats');
        return { 
            available: true, 
            info: info.split('\n').reduce((acc, line) => {
                const [key, value] = line.split(':');
                if (key && value) acc[key.trim()] = value.trim();
                return acc;
            }, {})
        };
    } catch (error) {
        return { available: false, error: error.message };
    }
};
