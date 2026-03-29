import { getRedisClient, isRedisAvailable, CACHE_KEYS, CACHE_TTL } from '../config/redis.config.js';

/**
 * IP-based Rate Limiter with Redis
 * Falls back to in-memory store if Redis is unavailable
 */

// In-memory fallback store (for when Redis is unavailable)
const memoryStore = new Map();

// Clean up memory store periodically (every minute)
setInterval(() => {
    const now = Date.now();
    for (const [key, value] of memoryStore.entries()) {
        if (value.resetTime < now) {
            memoryStore.delete(key);
        }
    }
}, 60000);

/**
 * Rate limiter configuration
 */
const RATE_LIMIT_CONFIG = {
    windowMs: 60 * 1000,      // 1 minute window
    maxRequests: 100,          // Max requests per window
    maxRedirectRequests: 500,  // Higher limit for redirects
};

/**
 * Get client IP address
 */
const getClientIp = (req) => {
    return req.headers['x-forwarded-for']?.split(',')[0]?.trim() 
        || req.headers['x-real-ip'] 
        || req.connection?.remoteAddress 
        || req.ip 
        || 'unknown';
};

/**
 * Redis-based rate limiting
 */
const redisRateLimit = async (key, maxRequests, windowSeconds) => {
    const client = getRedisClient();
    
    const multi = client.multi();
    multi.incr(key);
    multi.expire(key, windowSeconds);
    
    const results = await multi.exec();
    const currentCount = results[0];
    
    return {
        allowed: currentCount <= maxRequests,
        current: currentCount,
        limit: maxRequests,
        remaining: Math.max(0, maxRequests - currentCount),
    };
};

/**
 * Memory-based rate limiting (fallback)
 */
const memoryRateLimit = (key, maxRequests, windowMs) => {
    const now = Date.now();
    const record = memoryStore.get(key);
    
    if (!record || record.resetTime < now) {
        memoryStore.set(key, {
            count: 1,
            resetTime: now + windowMs,
        });
        return {
            allowed: true,
            current: 1,
            limit: maxRequests,
            remaining: maxRequests - 1,
        };
    }
    
    record.count += 1;
    
    return {
        allowed: record.count <= maxRequests,
        current: record.count,
        limit: maxRequests,
        remaining: Math.max(0, maxRequests - record.count),
    };
};

/**
 * General API rate limiter middleware
 */
export const rateLimiter = async (req, res, next) => {
    const ip = getClientIp(req);
    const key = CACHE_KEYS.RATE_LIMIT(ip);
    
    try {
        let result;
        
        if (isRedisAvailable()) {
            result = await redisRateLimit(key, RATE_LIMIT_CONFIG.maxRequests, CACHE_TTL.RATE_LIMIT);
        } else {
            result = memoryRateLimit(key, RATE_LIMIT_CONFIG.maxRequests, RATE_LIMIT_CONFIG.windowMs);
        }
        
        // Set rate limit headers
        res.set({
            'X-RateLimit-Limit': result.limit,
            'X-RateLimit-Remaining': result.remaining,
            'X-RateLimit-Reset': Math.ceil(Date.now() / 1000) + CACHE_TTL.RATE_LIMIT,
        });
        
        if (!result.allowed) {
            return res.status(429).json({
                error: 'Too Many Requests',
                message: 'Rate limit exceeded. Please try again later.',
                retryAfter: CACHE_TTL.RATE_LIMIT,
            });
        }
        
        next();
    } catch (error) {
        // If rate limiting fails, allow the request (fail-open)
        console.error('Rate limiter error:', error.message);
        next();
    }
};

/**
 * Stricter rate limiter for auth endpoints
 */
export const authRateLimiter = async (req, res, next) => {
    const ip = getClientIp(req);
    const key = `${CACHE_KEYS.RATE_LIMIT(ip)}:auth`;
    const maxRequests = 10; // 10 auth attempts per minute
    
    try {
        let result;
        
        if (isRedisAvailable()) {
            result = await redisRateLimit(key, maxRequests, CACHE_TTL.RATE_LIMIT);
        } else {
            result = memoryRateLimit(key, maxRequests, RATE_LIMIT_CONFIG.windowMs);
        }
        
        res.set({
            'X-RateLimit-Limit': result.limit,
            'X-RateLimit-Remaining': result.remaining,
        });
        
        if (!result.allowed) {
            return res.status(429).json({
                error: 'Too Many Requests',
                message: 'Too many authentication attempts. Please try again later.',
                retryAfter: CACHE_TTL.RATE_LIMIT,
            });
        }
        
        next();
    } catch (error) {
        console.error('Auth rate limiter error:', error.message);
        next();
    }
};

/**
 * Lenient rate limiter for redirects (higher limits)
 */
export const redirectRateLimiter = async (req, res, next) => {
    const ip = getClientIp(req);
    const key = `${CACHE_KEYS.RATE_LIMIT(ip)}:redirect`;
    
    try {
        let result;
        
        if (isRedisAvailable()) {
            result = await redisRateLimit(key, RATE_LIMIT_CONFIG.maxRedirectRequests, CACHE_TTL.RATE_LIMIT);
        } else {
            result = memoryRateLimit(key, RATE_LIMIT_CONFIG.maxRedirectRequests, RATE_LIMIT_CONFIG.windowMs);
        }
        
        if (!result.allowed) {
            return res.status(429).json({
                error: 'Too Many Requests',
                message: 'Rate limit exceeded for redirects.',
            });
        }
        
        next();
    } catch (error) {
        console.error('Redirect rate limiter error:', error.message);
        next();
    }
};

export default rateLimiter;
