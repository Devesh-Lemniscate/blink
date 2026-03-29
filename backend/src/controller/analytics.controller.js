import wrapAsync from '../utils/tryCatchWrapper.js';
import { getUrlAnalytics, getUserAnalyticsSummary } from '../services/analytics.service.js';
import { getCacheStats } from '../services/cache.service.js';
import { isRedisAvailable } from '../config/redis.config.js';

/**
 * Get analytics for a specific URL
 */
export const getAnalytics = wrapAsync(async (req, res) => {
    const { shortUrl } = req.params;
    const userId = req.user?._id?.toString();
    
    const analytics = await getUrlAnalytics(shortUrl, userId);
    
    res.status(200).json({
        success: true,
        data: analytics,
    });
});

/**
 * Get aggregated analytics summary for the user
 */
export const getAnalyticsSummary = wrapAsync(async (req, res) => {
    const userId = req.user._id.toString();
    
    const summary = await getUserAnalyticsSummary(userId);
    
    res.status(200).json({
        success: true,
        data: summary,
    });
});

/**
 * Get system health status including Redis
 */
export const getHealthStatus = wrapAsync(async (req, res) => {
    const redisStatus = isRedisAvailable();
    const cacheStats = await getCacheStats();
    
    res.status(200).json({
        success: true,
        status: 'healthy',
        timestamp: new Date().toISOString(),
        services: {
            redis: {
                connected: redisStatus,
                ...cacheStats,
            },
            database: {
                connected: true, // If we reach here, DB is connected
            }
        }
    });
});
