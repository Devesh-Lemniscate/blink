import urlSchema from "../models/short_url.model.js";
import { ConflictError } from "../utils/errorHandler.js";
import { 
    getCachedUrl, 
    setCachedUrl, 
    invalidateCachedUrl,
    invalidateUserUrlsCache,
    incrementCachedClicks 
} from "../services/cache.service.js";

export const saveShortUrl = async (shortUrl, longUrl, userId) => {
    try {
        const newUrl = new urlSchema({
            full_url: longUrl,
            short_url: shortUrl
        });
        if (userId) {
            newUrl.user = userId;
            // Invalidate user's URL cache since they created a new one
            await invalidateUserUrlsCache(userId.toString());
        }
        await newUrl.save();
        
        // Cache the new URL
        await setCachedUrl(shortUrl, {
            full_url: longUrl,
            short_url: shortUrl,
            clicks: 0,
        });
    } catch (err) {
        if (err.code == 11000) {
            throw new ConflictError("Short URL already exists");
        }
        throw new Error(err);
    }
};

/**
 * Get short URL with Redis caching
 * Flow: Check cache -> If miss, query DB -> Cache result -> Return
 */
export const getShortUrl = async (shortUrl) => {
    // 1. Try to get from cache first (sub-10ms latency)
    const cached = await getCachedUrl(shortUrl);
    if (cached) {
        // Increment click in DB asynchronously (non-blocking)
        urlSchema.findOneAndUpdate(
            { short_url: shortUrl },
            { $inc: { clicks: 1 } }
        ).exec().catch(err => console.error('Click increment error:', err));
        
        // Increment cached clicks (non-blocking)
        incrementCachedClicks(shortUrl);
        
        return cached;
    }
    
    // 2. Cache miss - query database
    const url = await urlSchema.findOneAndUpdate(
        { short_url: shortUrl },
        { $inc: { clicks: 1 } },
        { new: true }
    );
    
    // 3. Cache the result for future requests
    if (url) {
        await setCachedUrl(shortUrl, {
            full_url: url.full_url,
            short_url: url.short_url,
            clicks: url.clicks,
        });
    }
    
    return url;
};

/**
 * Check if custom short URL exists (with caching)
 */
export const getCustomShortUrl = async (slug) => {
    // Check cache first
    const cached = await getCachedUrl(slug);
    if (cached) {
        return cached;
    }
    
    // Query database
    const url = await urlSchema.findOne({ short_url: slug });
    
    // Cache if found
    if (url) {
        await setCachedUrl(slug, {
            full_url: url.full_url,
            short_url: url.short_url,
            clicks: url.clicks,
        });
    }
    
    return url;
};

/**
 * Delete a short URL
 */
export const deleteShortUrl = async (shortUrl, userId) => {
    const result = await urlSchema.findOneAndDelete({ 
        short_url: shortUrl,
        user: userId 
    });
    
    if (result) {
        // Invalidate caches
        await invalidateCachedUrl(shortUrl);
        await invalidateUserUrlsCache(userId.toString());
    }
    
    return result;
};