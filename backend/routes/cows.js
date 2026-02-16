const express = require('express');
const router = express.Router();
const Cow = require('../models/Cow');
const { protect } = require('../middleware/auth');
const { authorize } = require('../middleware/roleCheck');
const { upload } = require('../config/cloudinary');

// @route   GET /api/cows
// @desc    Get all cows with filters
// @access  Public
router.get('/', async (req, res) => {
    try {
        const { breed, minPrice, maxPrice, city, state, status } = req.query;

        let query = {};

        if (breed) {
            query.breed = breed;
        }

        if (minPrice || maxPrice) {
            query.price = {};
            if (minPrice) query.price.$gte = Number(minPrice);
            if (maxPrice) query.price.$lte = Number(maxPrice);
        }

        if (city) {
            query['location.city'] = new RegExp(city, 'i');
        }

        if (state) {
            query['location.state'] = new RegExp(state, 'i');
        }

        if (status) {
            query.status = status;
        } else {
            query.status = 'available'; // Default to available
        }

        const cows = await Cow.find(query)
            .populate('seller', 'name email phone')
            .sort({ createdAt: -1 });

        res.json({
            success: true,
            count: cows.length,
            data: cows,
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// @route   GET /api/cows/:id
// @desc    Get single cow
// @access  Public
router.get('/:id', async (req, res) => {
    try {
        const cow = await Cow.findById(req.params.id)
            .populate('seller', 'name email phone address');

        if (!cow) {
            return res.status(404).json({ message: 'Cow not found' });
        }

        res.json(cow);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// @route   POST /api/cows
// @desc    Post a cow for sale
// @access  Private (Farmers/Traders)
router.post('/', protect, authorize('farmer', 'trader'), upload.fields([
    { name: 'images', maxCount: 5 },
    { name: 'healthRecords', maxCount: 5 }
]), async (req, res) => {
    try {
        const {
            breed,
            age,
            milkCapacity,
            price,
            negotiable,
            description,
            location,
            pregnancyStatus,
        } = req.body;

        const images = req.files && req.files['images']
            ? req.files['images'].map((file) => ({
                url: file.path,
                publicId: file.filename,
            }))
            : [];

        const healthRecords = req.files && req.files['healthRecords']
            ? req.files['healthRecords'].map((file) => ({
                url: file.path,
                publicId: file.filename,
                documentType: 'medical_report',
            }))
            : [];

        const cow = await Cow.create({
            seller: req.user._id,
            breed,
            age,
            milkCapacity,
            price,
            negotiable: negotiable !== undefined ? negotiable : true,
            description,
            location: location ? JSON.parse(location) : {},
            pregnancyStatus,
            images,
            healthRecords,
        });

        res.status(201).json({
            success: true,
            data: cow,
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// @route   PUT /api/cows/:id
// @desc    Update cow listing
// @access  Private (Own listings only)
router.put('/:id', protect, async (req, res) => {
    try {
        let cow = await Cow.findById(req.params.id);

        if (!cow) {
            return res.status(404).json({ message: 'Cow not found' });
        }

        // Check if user owns the listing
        if (cow.seller.toString() !== req.user._id.toString()) {
            return res.status(403).json({ message: 'Not authorized to update this listing' });
        }

        cow = await Cow.findByIdAndUpdate(req.params.id, req.body, {
            new: true,
            runValidators: true,
        });

        res.json({
            success: true,
            data: cow,
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// @route   DELETE /api/cows/:id
// @desc    Delete cow listing
// @access  Private (Own listings only)
router.delete('/:id', protect, async (req, res) => {
    try {
        const cow = await Cow.findById(req.params.id);

        if (!cow) {
            return res.status(404).json({ message: 'Cow not found' });
        }

        // Check if user owns the listing
        if (cow.seller.toString() !== req.user._id.toString()) {
            return res.status(403).json({ message: 'Not authorized to delete this listing' });
        }

        await cow.deleteOne();

        res.json({
            success: true,
            message: 'Cow listing removed',
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

module.exports = router;
