const BrandProfile = require('../models/BrandProfile');

const brandService = {
    // Get brands with advanced filtering and sorting
    async getBrands(query = {}) {
        const {
            page = 1,
            limit = 12,
            type,
            search,
            lat,
            lng,
            sort = 'newest'
        } = query;

        const filter = { isActive: true };

        if (type && type !== 'All') {
            filter.type = type.toLowerCase();
        }

        if (search) {
            // Use regex for more reliable search (works without text index)
            const searchRegex = new RegExp(search, 'i');
            filter.$or = [
                { name: searchRegex },
                { bio: searchRegex }
            ];
        }

        const skip = (parseInt(page) - 1) * parseInt(limit);
        const limitNum = parseInt(limit);

        // Handle Geolocation with aggregation pipeline
        if (sort === 'nearby' && lat && lng) {
            const pipeline = [
                {
                    $geoNear: {
                        near: {
                            type: 'Point',
                            coordinates: [parseFloat(lng), parseFloat(lat)]
                        },
                        distanceField: 'distance',
                        maxDistance: 50000, // 50km in meters
                        query: filter,
                        spherical: true
                    }
                },
                { $skip: skip },
                { $limit: limitNum },
                {
                    $lookup: {
                        from: 'users',
                        localField: 'user',
                        foreignField: '_id',
                        as: 'user',
                        pipeline: [{ $project: { name: 1, email: 1, verificationBadge: 1 } }]
                    }
                },
                { $unwind: { path: '$user', preserveNullAndEmptyArrays: true } }
            ];

            const brands = await BrandProfile.aggregate(pipeline);
            const total = await BrandProfile.countDocuments(filter);

            return {
                brands,
                totalPages: Math.ceil(total / limitNum),
                currentPage: parseInt(page),
                total
            };
        }

        // Non-geospatial queries
        let sortOption = {};
        if (sort === 'top' || sort === 'trending') {
            sortOption = { 'stats.followers': -1 };
        } else if (sort === 'newest') {
            sortOption = { createdAt: -1 };
        }

        const brands = await BrandProfile.find(filter)
            .populate('user', 'name email verificationBadge')
            .sort(sortOption)
            .limit(limitNum)
            .skip(skip);

        const total = await BrandProfile.countDocuments(filter);

        return {
            brands,
            totalPages: Math.ceil(total / limitNum),
            currentPage: parseInt(page),
            total
        };
    },

    // Get brand by ID
    async getBrandById(id) {
        // Atomically increment views and return the updated document
        const brand = await BrandProfile.findByIdAndUpdate(
            id,
            { $inc: { 'stats.views': 1 } },
            { new: true }
        ).populate('user', 'name email verificationBadge');

        if (!brand) throw new Error('Brand not found');
        return brand;
    },

    // Get brand by User ID
    async getBrandByUserId(userId) {
        const brand = await BrandProfile.findOne({ user: userId });
        // Return null if not found (don't throw), UI might handle "create profile" flow
        return brand;
    },

    // Create or Update Brand Profile
    async updateProfile(userId, data) {
        // Ensure user exists and is verified (logic usually in controller/middleware, but double check here if needed)
        // Upsert: Create if not exists
        const profile = await BrandProfile.findOneAndUpdate(
            { user: userId },
            { $set: data },
            { new: true, upsert: true, setDefaultsOnInsert: true }
        );
        return profile;
    }
};

module.exports = brandService;
