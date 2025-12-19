const Post = require('../models/Post');
const BrandProfile = require('../models/BrandProfile');
// const notificationService = require('./notificationService'); // Pending implementation

const postService = {
    // Create a new post
    async createPost(brandId, data) {
        const post = await Post.create({
            brand: brandId,
            content: data.content,
            images: data.images || []
        });

        // Trigger Notification (Mock for now or implement if notificationService exists)
        // await notificationService.notifyFollowers(brandId, post);

        return post;
    },

    // Get posts for a brand
    async getBrandPosts(brandId, page = 1, limit = 10) {
        const posts = await Post.find({ brand: brandId })
            .sort({ createdAt: -1 })
            .populate('brand', 'name profilePhoto')
            .limit(parseInt(limit))
            .skip((parseInt(page) - 1) * parseInt(limit));
        
        const total = await Post.countDocuments({ brand: brandId });

        return {
            posts,
            hasMore: total > page * limit
        };
    }
};

module.exports = postService;
