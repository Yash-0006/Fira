const express = require('express');
const router = express.Router();
const dashboardService = require('../services/dashboardService');

// GET /api/dashboard/overview/:userId - Get complete dashboard overview
router.get('/overview/:userId', async (req, res) => {
    try {
        const { userId } = req.params;
        
        if (!userId) {
            return res.status(400).json({ error: 'User ID is required' });
        }

        const overview = await dashboardService.getOverviewStats(userId);
        res.json(overview);
    } catch (error) {
        console.error('Dashboard overview error:', error);
        res.status(500).json({ error: error.message });
    }
});

// GET /api/dashboard/stats/:userId - Get quick stats only
router.get('/stats/:userId', async (req, res) => {
    try {
        const { userId } = req.params;
        
        if (!userId) {
            return res.status(400).json({ error: 'User ID is required' });
        }

        const stats = await dashboardService.getQuickStats(userId);
        res.json(stats);
    } catch (error) {
        console.error('Dashboard stats error:', error);
        res.status(500).json({ error: error.message });
    }
});

module.exports = router;
