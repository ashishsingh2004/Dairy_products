const express = require('express');
const router = express.Router();
const Subscription = require('../models/Subscription');
const Product = require('../models/Product');
const { protect } = require('../middleware/auth');

// @route   POST /api/subscriptions
// @desc    Create subscription
// @access  Private
router.post('/', protect, async (req, res) => {
    try {
        const {
            productId,
            quantity,
            deliveryTime,
            startDate,
            endDate,
            shippingAddress,
            paymentMethod,
        } = req.body;

        // Check if product exists
        const product = await Product.findById(productId);
        if (!product) {
            return res.status(404).json({ message: 'Product not found' });
        }

        const subscription = await Subscription.create({
            subscriber: req.user._id,
            product: productId,
            seller: product.seller,
            quantity,
            deliveryTime: deliveryTime || 'morning',
            startDate,
            endDate,
            shippingAddress,
            pricePerDelivery: product.price * quantity,
            paymentMethod: paymentMethod || 'cod',
        });

        res.status(201).json({
            success: true,
            data: subscription,
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// @route   GET /api/subscriptions
// @desc    Get user subscriptions
// @access  Private
router.get('/', protect, async (req, res) => {
    try {
        const subscriptions = await Subscription.find({ subscriber: req.user._id })
            .populate('product', 'name type price images')
            .populate('seller', 'name email phone')
            .sort({ createdAt: -1 });

        res.json({
            success: true,
            count: subscriptions.length,
            data: subscriptions,
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// @route   PUT /api/subscriptions/:id
// @desc    Update subscription status
// @access  Private
router.put('/:id', protect, async (req, res) => {
    try {
        const { status } = req.body;

        const subscription = await Subscription.findById(req.params.id);

        if (!subscription) {
            return res.status(404).json({ message: 'Subscription not found' });
        }

        // Check if user owns the subscription
        if (subscription.subscriber.toString() !== req.user._id.toString()) {
            return res.status(403).json({ message: 'Not authorized to update this subscription' });
        }

        subscription.status = status;
        await subscription.save();

        res.json({
            success: true,
            data: subscription,
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

module.exports = router;
