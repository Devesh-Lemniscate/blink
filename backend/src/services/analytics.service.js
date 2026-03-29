import urlSchema from '../models/short_url.model.js';
import { trackAnalyticsEvent, getCachedAnalytics } from './cache.service.js';

/**
 * Analytics Service - Track and retrieve URL analytics
 */

/**
 * Parse User-Agent to get device info
 * @param {string} userAgent - User-Agent header
 * @returns {Object} - Device information
 */
const parseUserAgent = (userAgent = '') => {
    const ua = userAgent.toLowerCase();
    
    // Device type detection
    let deviceType = 'desktop';
    if (/mobile|android|iphone|ipad|ipod|blackberry|windows phone/i.test(ua)) {
        deviceType = 'mobile';
    } else if (/tablet|ipad/i.test(ua)) {
        deviceType = 'tablet';
    }
    
    // Browser detection
    let browser = 'unknown';
    if (ua.includes('firefox')) browser = 'Firefox';
    else if (ua.includes('edg')) browser = 'Edge';
    else if (ua.includes('chrome')) browser = 'Chrome';
    else if (ua.includes('safari')) browser = 'Safari';
    else if (ua.includes('opera') || ua.includes('opr')) browser = 'Opera';
    
    // OS detection
    let os = 'unknown';
    if (ua.includes('windows')) os = 'Windows';
    else if (ua.includes('mac')) os = 'macOS';
    else if (ua.includes('linux')) os = 'Linux';
    else if (ua.includes('android')) os = 'Android';
    else if (ua.includes('iphone') || ua.includes('ipad')) os = 'iOS';
    
    return { deviceType, browser, os };
};

/**
 * Get client IP address
 * @param {Object} req - Express request object
 * @returns {string} - Client IP
 */
const getClientIp = (req) => {
    return req.headers['x-forwarded-for']?.split(',')[0]?.trim() 
        || req.headers['x-real-ip'] 
        || req.connection?.remoteAddress 
        || req.ip 
        || 'unknown';
};

/**
 * Track a click event
 * @param {string} shortUrl - The short URL code
 * @param {Object} req - Express request object
 */
export const trackClick = async (shortUrl, req) => {
    const userAgent = req.headers['user-agent'] || '';
    const referer = req.headers['referer'] || req.headers['referrer'] || 'direct';
    const ip = getClientIp(req);
    const deviceInfo = parseUserAgent(userAgent);
    
    const eventData = {
        shortUrl,
        ip: ip.substring(0, ip.lastIndexOf('.')) + '.xxx', // Anonymize IP
        referer,
        ...deviceInfo,
    };
    
    // Track in Redis for real-time analytics (non-blocking)
    trackAnalyticsEvent(shortUrl, eventData).catch(err => 
        console.error('Failed to track analytics:', err.message)
    );
    
    // Also update MongoDB click analytics (async, non-blocking)
    updateMongoAnalytics(shortUrl, eventData).catch(err =>
        console.error('Failed to update MongoDB analytics:', err.message)
    );
};

/**
 * Update analytics in MongoDB
 * @param {string} shortUrl - The short URL code
 * @param {Object} eventData - Analytics event data
 */
const updateMongoAnalytics = async (shortUrl, eventData) => {
    await urlSchema.findOneAndUpdate(
        { short_url: shortUrl },
        {
            $push: {
                clickDetails: {
                    $each: [{
                        timestamp: new Date(),
                        deviceType: eventData.deviceType,
                        browser: eventData.browser,
                        os: eventData.os,
                        referer: eventData.referer,
                    }],
                    $slice: -1000, // Keep last 1000 clicks
                }
            }
        }
    );
};

/**
 * Get analytics for a URL
 * @param {string} shortUrl - The short URL code
 * @param {string} userId - User ID for authorization
 * @returns {Object} - Analytics data
 */
export const getUrlAnalytics = async (shortUrl, userId) => {
    // Get from MongoDB
    const url = await urlSchema.findOne({ short_url: shortUrl });
    
    if (!url) {
        throw new Error('URL not found');
    }
    
    // Check authorization
    if (url.user && url.user.toString() !== userId) {
        throw new Error('Unauthorized');
    }
    
    // Get real-time events from Redis
    const realtimeEvents = await getCachedAnalytics(shortUrl);
    
    // Compute analytics summary
    const clickDetails = url.clickDetails || [];
    
    const deviceBreakdown = clickDetails.reduce((acc, click) => {
        acc[click.deviceType] = (acc[click.deviceType] || 0) + 1;
        return acc;
    }, {});
    
    const browserBreakdown = clickDetails.reduce((acc, click) => {
        acc[click.browser] = (acc[click.browser] || 0) + 1;
        return acc;
    }, {});
    
    const osBreakdown = clickDetails.reduce((acc, click) => {
        acc[click.os] = (acc[click.os] || 0) + 1;
        return acc;
    }, {});
    
    // Clicks per day (last 7 days)
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    
    const clicksPerDay = clickDetails
        .filter(c => new Date(c.timestamp) >= sevenDaysAgo)
        .reduce((acc, click) => {
            const day = new Date(click.timestamp).toISOString().split('T')[0];
            acc[day] = (acc[day] || 0) + 1;
            return acc;
        }, {});
    
    return {
        shortUrl: url.short_url,
        fullUrl: url.full_url,
        totalClicks: url.clicks,
        createdAt: url.createdAt,
        analytics: {
            deviceBreakdown,
            browserBreakdown,
            osBreakdown,
            clicksPerDay,
            recentClicks: realtimeEvents.slice(0, 10),
        }
    };
};

/**
 * Get aggregated analytics for all user URLs
 * @param {string} userId - User ID
 * @returns {Object} - Aggregated analytics
 */
export const getUserAnalyticsSummary = async (userId) => {
    const urls = await urlSchema.find({ user: userId });
    
    const totalClicks = urls.reduce((sum, url) => sum + (url.clicks || 0), 0);
    const totalUrls = urls.length;
    
    // Aggregate device breakdown across all URLs
    const allClickDetails = urls.flatMap(url => url.clickDetails || []);
    
    const deviceBreakdown = allClickDetails.reduce((acc, click) => {
        acc[click.deviceType] = (acc[click.deviceType] || 0) + 1;
        return acc;
    }, {});
    
    // Top performing URLs
    const topUrls = urls
        .sort((a, b) => (b.clicks || 0) - (a.clicks || 0))
        .slice(0, 5)
        .map(url => ({
            shortUrl: url.short_url,
            fullUrl: url.full_url,
            clicks: url.clicks,
        }));
    
    return {
        totalUrls,
        totalClicks,
        deviceBreakdown,
        topUrls,
    };
};
