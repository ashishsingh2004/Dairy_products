const express = require('express');
const router = express.Router();
const Product = require('../models/Product');
const { protect } = require('../middleware/auth');
const { authorize } = require('../middleware/roleCheck');
const { upload } = require('../config/cloudinary');

// @route   GET /api/products/autocomplete
// @desc    Autocomplete product search
// @access  Public
router.get('/autocomplete', async (req, res) => {
    try {
        const { q } = req.query;

        if (!q || q.length < 2) {
            return res.json({ success: true, data: [] });
        }

        const products = await Product.find({
            status: 'approved',
            name: new RegExp(q, 'i'),
        })
            .select('name type price images')
            .limit(10);

        res.json({
            success: true,
            data: products,
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// @route   GET /api/products/featured
// @desc    Get featured products (high rated)
// @access  Public
router.get('/featured', async (req, res) => {
    try {
        const products = await Product.find({ status: 'approved' })
            .populate('seller', 'name')
            .sort({ averageRating: -1, numReviews: -1 })
            .limit(8);

        res.json({
            success: true,
            data: products,
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});


// @route   GET /api/products
// @desc    Get all products with filters
// @access  Public
router.get('/', async (req, res) => {
    try {
        const { type, city, state, minPrice, maxPrice, minRating, search, sortBy, page = 1, limit = 12 } = req.query;

        // Build query
        let query = { status: 'approved' };

        if (type) {
            query.type = type;
        }

        if (city) {
            query['location.city'] = new RegExp(city, 'i');
        }

        if (state) {
            query['location.state'] = new RegExp(state, 'i');
        }

        if (minPrice || maxPrice) {
            query.price = {};
            if (minPrice) query.price.$gte = Number(minPrice);
            if (maxPrice) query.price.$lte = Number(maxPrice);
        }

        if (minRating) {
            query.averageRating = { $gte: Number(minRating) };
        }

        if (search) {
            query.$or = [
                { name: new RegExp(search, 'i') },
                { description: new RegExp(search, 'i') },
            ];
        }

        // Sorting
        let sort = { createdAt: -1 }; // default: newest first
        if (sortBy === 'price_asc') {
            sort = { price: 1 };
        } else if (sortBy === 'price_desc') {
            sort = { price: -1 };
        } else if (sortBy === 'rating') {
            sort = { averageRating: -1, numReviews: -1 };
        } else if (sortBy === 'popular') {
            sort = { numReviews: -1, averageRating: -1 };
        }

        //Pagination
        const skip = (page - 1) * limit;
        const total = await Product.countDocuments(query);

        const products = await Product.find(query)
            .populate('seller', 'name email phone')
            .populate('certification')
            .sort(sort)
            .skip(skip)
            .limit(Number(limit));

        res.json({
            success: true,
            count: products.length,
            total,
            page: Number(page),
            pages: Math.ceil(total / limit),
            data: products,
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// @route   GET /api/products/:id
// @desc    Get single product
// @access  Public
router.get('/:id', async (req, res) => {
    try {
        const product = await Product.findById(req.params.id)
            .populate('seller', 'name email phone address')
            .populate('certification')
            .populate('ratings.user', 'name');

        if (!product) {
            return res.status(404).json({ message: 'Product not found' });
        }

        res.json(product);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// @route   POST /api/products
// @desc    Create a product
// @access  Private (Farmers only)
router.post('/', protect, authorize('farmer'), upload.array('images', 5), async (req, res) => {
    try {
        const {
            name,
            type,
            description,
            price,
            unit,
            fatPercentage,
            stock,
            location,
        } = req.body;

        // Process uploaded images
        const images = req.files
            ? req.files.map((file) => ({
                url: file.path,
                publicId: file.filename,
            }))
            : [];

        const product = await Product.create({
            seller: req.user._id,
            name,
            type,
            description,
            price,
            unit: unit || 'liter',
            fatPercentage: type === 'raw_milk' ? fatPercentage : undefined,
            stock,
            location: location ? JSON.parse(location) : {},
            images,
        });

        res.status(201).json({
            success: true,
            data: product,
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// @route   PUT /api/products/:id
// @desc    Update a product
// @access  Private (Farmers - own products only)
router.put('/:id', protect, authorize('farmer'), async (req, res) => {
    try {
        let product = await Product.findById(req.params.id);

        if (!product) {
            return res.status(404).json({ message: 'Product not found' });
        }

        // Check if user owns the product
        if (product.seller.toString() !== req.user._id.toString()) {
            return res.status(403).json({ message: 'Not authorized to update this product' });
        }

        product = await Product.findByIdAndUpdate(req.params.id, req.body, {
            new: true,
            runValidators: true,
        });

        res.json({
            success: true,
            data: product,
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// @route   DELETE /api/products/:id
// @desc    Delete a product
// @access  Private (Farmers - own products only)
router.delete('/:id', protect, authorize('farmer'), async (req, res) => {
    try {
        const product = await Product.findById(req.params.id);

        if (!product) {
            return res.status(404).json({ message: 'Product not found' });
        }

        // Check if user owns the product
        if (product.seller.toString() !== req.user._id.toString()) {
            return res.status(403).json({ message: 'Not authorized to delete this product' });
        }

        await product.deleteOne();

        res.json({
            success: true,
            message: 'Product removed',
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// @route   POST /api/products/:id/review
// @desc    Add a review to product
// @access  Private
router.post('/:id/review', protect, async (req, res) => {
    try {
        const { rating, comment } = req.body;

        const product = await Product.findById(req.params.id);

        if (!product) {
            return res.status(404).json({ message: 'Product not found' });
        }

        // Check if user already reviewed
        const alreadyReviewed = product.ratings.find(
            (r) => r.user.toString() === req.user._id.toString()
        );

        if (alreadyReviewed) {
            return res.status(400).json({ message: 'Product already reviewed' });
        }

        const review = {
            user: req.user._id,
            rating: Number(rating),
            comment,
        };

        product.ratings.push(review);
        product.updateRating();

        await product.save();

        res.status(201).json({
            success: true,
            message: 'Review added',
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

module.exports = router;
