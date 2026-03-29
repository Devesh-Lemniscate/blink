import express from 'express';
import { getAnalytics, getAnalyticsSummary, getHealthStatus } from '../controller/analytics.controller.js';
import { authMiddleware } from '../middleware/auth.middleware.js';

const router = express.Router();

// Get analytics for a specific URL (requires auth)
router.get('/url/:shortUrl', authMiddleware, getAnalytics);

// Get aggregated analytics summary for user (requires auth)
router.get('/summary', authMiddleware, getAnalyticsSummary);

// Health check endpoint (public)
router.get('/health', getHealthStatus);

export default router;
