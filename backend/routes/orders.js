const express = require('express');
const router = express.Router();
const Razorpay = require('razorpay');
const crypto = require('crypto');
const Order = require('../models/Order');
const Product = require('../models/Product');
const { protect } = require('../middleware/auth');

// Initialize Razorpay
const razorpay = new Razorpay({
    key_id: process.env.RAZORPAY_KEY_ID,
    key_secret: process.env.RAZORPAY_KEY_SECRET,
});

// @route   POST /api/orders/create-razorpay-order
// @desc    Create Razorpay order
// @access  Private
router.post('/create-razorpay-order', protect, async (req, res) => {
    try {
        const { amount } = req.body;

        const options = {
            amount: amount * 100, // amount in smallest currency unit (paise)
            currency: 'INR',
            receipt: `receipt_${Date.now()}`,
        };

        const razorpayOrder = await razorpay.orders.create(options);

        res.json({
            success: true,
            orderId: razorpayOrder.id,
            amount: razorpayOrder.amount,
            currency: razorpayOrder.currency,
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// @route   POST /api/orders/verify-payment
// @desc    Verify Razorpay payment
// @access  Private
router.post('/verify-payment', protect, async (req, res) => {
    try {
        const { razorpayOrderId, razorpayPaymentId, razorpaySignature } = req.body;

        const sign = razorpayOrderId + '|' + razorpayPaymentId;
        const expectedSign = crypto
            .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
            .update(sign.toString())
            .digest('hex');

        if (razorpaySignature === expectedSign) {
            res.json({
                success: true,
                message: 'Payment verified successfully',
            });
        } else {
            res.status(400).json({
                success: false,
                message: 'Invalid payment signature',
            });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// @route   POST /api/orders
// @desc    Create new order
// @access  Private
router.post('/', protect, async (req, res) => {
    try {
        const {
            items,
            shippingAddress,
            paymentInfo,
            totalAmount,
        } = req.body;

        // Validate stock availability and enrich items with product details
        const enrichedItems = [];
        for (const item of items) {
            const product = await Product.findById(item.product);
            if (!product) {
                return res.status(404).json({ message: `Product ${item.product} not found` });
            }
            if (product.stock < item.quantity) {
                return res.status(400).json({
                    message: `Insufficient stock for ${product.name}`,
                });
            }
            enrichedItems.push({
                ...item,
                name: product.name,
                unit: product.unit,
            });
        }

        // Create order
        const order = new Order({
            buyer: req.user._id,
            items: enrichedItems,
            shippingAddress,
            paymentInfo,
        });

        // Calculate prices
        order.calculatePrices();

        // Set payment status based on method
        if (paymentInfo.method === 'cod') {
            order.paymentStatus = 'pending';
        } else if (paymentInfo.razorpayPaymentId) {
            order.paymentStatus = 'completed';
        }

        await order.save();

        // Update product stock
        for (const item of items) {
            const product = await Product.findById(item.product);
            product.stock -= item.quantity;
            await product.save();
        }

        res.status(201).json({
            success: true,
            data: order,
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// @route   GET /api/orders
// @desc    Get user orders
// @access  Private
router.get('/', protect, async (req, res) => {
    try {
        const orders = await Order.find({ buyer: req.user._id })
            .populate('items.product', 'name type price images')
            .populate('items.seller', 'name email phone')
            .sort({ createdAt: -1 });

        res.json({
            success: true,
            count: orders.length,
            data: orders,
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// @route   GET /api/orders/:id
// @desc    Get order by ID
// @access  Private
router.get('/:id', protect, async (req, res) => {
    try {
        const order = await Order.findById(req.params.id)
            .populate('items.product', 'name type price images')
            .populate('items.seller', 'name email phone')
            .populate('buyer', 'name email phone');

        if (!order) {
            return res.status(404).json({ message: 'Order not found' });
        }

        // Check if user is buyer or seller of any item
        const isBuyer = order.buyer._id.toString() === req.user._id.toString();
        const isSeller = order.items.some(
            (item) => item.seller._id.toString() === req.user._id.toString()
        );

        if (!isBuyer && !isSeller && req.user.role !== 'admin') {
            return res.status(403).json({ message: 'Not authorized to view this order' });
        }

        res.json(order);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// @route   PUT /api/orders/:id/status
// @desc    Update order delivery status
// @access  Private (Seller/Admin)
router.put('/:id/status', protect, async (req, res) => {
    try {
        const { deliveryStatus, trackingInfo } = req.body;

        const order = await Order.findById(req.params.id);

        if (!order) {
            return res.status(404).json({ message: 'Order not found' });
        }

        // Check authorization
        const isSeller = order.items.some(
            (item) => item.seller.toString() === req.user._id.toString()
        );

        if (!isSeller && req.user.role !== 'admin') {
            return res.status(403).json({ message: 'Not authorized to update this order' });
        }

        order.deliveryStatus = deliveryStatus || order.deliveryStatus;
        if (trackingInfo) {
            order.trackingInfo = trackingInfo;
        }

        if (deliveryStatus === 'delivered') {
            order.deliveredAt = Date.now();
        }

        await order.save();

        res.json({
            success: true,
            data: order,
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// @route   PUT /api/orders/:id/cancel
// @desc    Cancel order
// @access  Private (Buyer only)
router.put('/:id/cancel', protect, async (req, res) => {
    try {
        const { cancellationReason } = req.body;

        const order = await Order.findById(req.params.id);

        if (!order) {
            return res.status(404).json({ message: 'Order not found' });
        }

        // Check if user is the buyer
        if (order.buyer.toString() !== req.user._id.toString()) {
            return res.status(403).json({ message: 'Not authorized to cancel this order' });
        }

        // Check if order can be cancelled
        if (['delivered', 'cancelled'].includes(order.deliveryStatus)) {
            return res.status(400).json({
                message: `Cannot cancel order with status: ${order.deliveryStatus}`,
            });
        }

        // Restore stock
        for (const item of order.items) {
            const product = await Product.findById(item.product);
            if (product) {
                product.stock += item.quantity;
                await product.save();
            }
        }

        order.deliveryStatus = 'cancelled';
        order.cancellationReason = cancellationReason || 'Customer request';
        order.cancelledAt = Date.now();

        await order.save();

        res.json({
            success: true,
            message: 'Order cancelled successfully',
            data: order,
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

module.exports = router;

