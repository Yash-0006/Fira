const express = require('express');
const router = express.Router();
const brandService = require('../services/brandService');
const postService = require('../services/postService');
const eventService = require('../services/eventService');
// const auth = require('../middleware/auth'); // Assuming auth middleware exists

// GET /api/brands - Get all brands with filters
router.get('/', async (req, res) => {
    try {
        const result = await brandService.getBrands(req.query);
        res.json(result);
    } catch (error) {
        console.error('Error fetching brands:', error);
        res.status(500).json({ error: error.message });
    }
});

// GET /api/brands/my-profile - Get current user's brand profile
router.get('/my-profile', async (req, res) => {
    // Assuming auth middleware sets req.user
    if (!req.query.userId) {
       return res.status(401).json({ error: 'User ID required (Auth middleware pending)' }); 
    }
    
    try {
        const profile = await brandService.getBrandByUserId(req.query.userId);
        res.json(profile);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// GET /api/brands/:id - Get brand by ID
router.get('/:id', async (req, res) => {
    try {
        const brand = await brandService.getBrandById(req.params.id);
        res.json(brand);
    } catch (error) {
        res.status(404).json({ error: error.message });
    }
});

// POST /api/brands - Create/Update profile
router.post('/', async (req, res) => {
    // Needs Auth
    const { userId, ...data } = req.body;
    if (!userId) return res.status(400).json({ error: 'User ID required' });

    try {
        const profile = await brandService.updateProfile(userId, data);
        res.json(profile);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
});

// GET /api/brands/:id/posts - Get brand posts
router.get('/:id/posts', async (req, res) => {
    try {
        const result = await postService.getBrandPosts(req.params.id, req.query.page, req.query.limit);
        res.json(result);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// POST /api/brands/:id/posts - Create brand post
router.post('/:id/posts', async (req, res) => {
    // Needs Auth and check if user owns brand
    // For now assuming req.body has necessary data or user is validated
    try {
        const post = await postService.createPost(req.params.id, req.body);
        res.status(201).json(post);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
});

// GET /api/brands/:id/events - Get brand events
router.get('/:id/events', async (req, res) => {
    try {
        const brand = await brandService.getBrandById(req.params.id);
        if (!brand) return res.status(404).json({ error: 'Brand not found' });
        
        // Use eventService to get events by organizer (brand.user._id)
        const events = await eventService.getEventsByOrganizer(brand.user._id);
        res.json(events);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

module.exports = router;
