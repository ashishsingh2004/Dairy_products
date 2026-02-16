const express = require('express');
const router = express.Router();
const User = require('../models/User');
const Product = require('../models/Product');
const Order = require('../models/Order');
const Certification = require('../models/Certification');
const { protect } = require('../middleware/auth');
const { authorize } = require('../middleware/roleCheck');

// @route   GET /api/admin/users
// @desc    Get all users
// @access  Private (Admin only)
router.get('/users', protect, authorize('admin'), async (req, res) => {
    try {
        const { role, kycStatus, isActive } = req.query;

        let query = {};
        if (role) query.role = role;
        if (kycStatus) query.kycStatus = kycStatus;
        if (isActive !== undefined) query.isActive = isActive === 'true';

        const users = await User.find(query).select('-password').sort({ createdAt: -1 });

        res.json({
            success: true,
            count: users.length,
            data: users,
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// @route   PUT /api/admin/users/:id/status
// @desc    Activate/Deactivate user
// @access  Private (Admin only)
router.put('/users/:id/status', protect, authorize('admin'), async (req, res) => {
    try {
        const { isActive } = req.body;

        const user = await User.findByIdAndUpdate(
            req.params.id,
            { isActive },
            { new: true }
        ).select('-password');

        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        res.json({
            success: true,
            data: user,
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// @route   PUT /api/admin/users/:id/kyc
// @desc    Verify KYC
// @access  Private (Admin only)
router.put('/users/:id/kyc', protect, authorize('admin'), async (req, res) => {
    try {
        const { kycStatus } = req.body;

        const user = await User.findByIdAndUpdate(
            req.params.id,
            { kycStatus },
            { new: true }
        ).select('-password');

        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        res.json({
            success: true,
            data: user,
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// @route   GET /api/admin/products/pending
// @desc    Get pending products
// @access  Private (Admin only)
router.get('/products/pending', protect, authorize('admin'), async (req, res) => {
    try {
        const products = await Product.find({ status: 'pending' })
            .populate('seller', 'name email phone')
            .sort({ createdAt: -1 });

        res.json({
            success: true,
            count: products.length,
            data: products,
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// @route   PUT /api/admin/products/:id/approve
// @desc    Approve/Reject product
// @access  Private (Admin only)
router.put('/products/:id/approve', protect, authorize('admin'), async (req, res) => {
    try {
        const { status } = req.body; // 'approved' or 'rejected'

        const product = await Product.findByIdAndUpdate(
            req.params.id,
            { status },
            { new: true }
        );

        if (!product) {
            return res.status(404).json({ message: 'Product not found' });
        }

        res.json({
            success: true,
            data: product,
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// @route   GET /api/admin/certifications/pending
// @desc    Get pending certifications
// @access  Private (Admin only)
router.get('/certifications/pending', protect, authorize('admin'), async (req, res) => {
    try {
        const certifications = await Certification.find({ verificationStatus: 'pending' })
            .populate('farmer', 'name email phone')
            .populate('product', 'name type')
            .sort({ createdAt: -1 });

        res.json({
            success: true,
            count: certifications.length,
            data: certifications,
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// @route   GET /api/admin/analytics
// @desc    Get platform analytics
// @access  Private (Admin only)
router.get('/analytics', protect, authorize('admin'), async (req, res) => {
    try {
        const totalUsers = await User.countDocuments();
        const totalFarmers = await User.countDocuments({ role: 'farmer' });
        const totalConsumers = await User.countDocuments({ role: 'consumer' });
        const totalTraders = await User.countDocuments({ role: 'trader' });

        const totalProducts = await Product.countDocuments({ status: 'approved' });
        const totalOrders = await Order.countDocuments();

        const completedOrders = await Order.countDocuments({ paymentStatus: 'completed' });

        // Calculate total revenue
        const revenueData = await Order.aggregate([
            { $match: { paymentStatus: 'completed' } },
            { $group: { _id: null, totalRevenue: { $sum: '$totalAmount' } } },
        ]);

        const totalRevenue = revenueData.length > 0 ? revenueData[0].totalRevenue : 0;

        res.json({
            success: true,
            data: {
                users: {
                    total: totalUsers,
                    farmers: totalFarmers,
                    consumers: totalConsumers,
                    traders: totalTraders,
                },
                products: totalProducts,
                orders: {
                    total: totalOrders,
                    completed: completedOrders,
                },
                revenue: totalRevenue,
            },
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

module.exports = router;
