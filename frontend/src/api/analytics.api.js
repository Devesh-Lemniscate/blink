import axiosInstance from '../utils/axiosInstance';

/**
 * Get analytics for a specific URL
 * @param {string} shortUrl - The short URL code
 * @returns {Promise} - Analytics data
 */
export const getUrlAnalytics = async (shortUrl) => {
    const response = await axiosInstance.get(`/api/analytics/url/${shortUrl}`);
    return response.data;
};

/**
 * Get aggregated analytics summary for the user
 * @returns {Promise} - Summary analytics
 */
export const getAnalyticsSummary = async () => {
    const response = await axiosInstance.get('/api/analytics/summary');
    return response.data;
};

/**
 * Get system health status
 * @returns {Promise} - Health status including Redis connectivity
 */
export const getHealthStatus = async () => {
    const response = await axiosInstance.get('/api/analytics/health');
    return response.data;
};
