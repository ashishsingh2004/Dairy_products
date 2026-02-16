const express = require('express');
const router = express.Router();
const Order = require('../models/Order');
const Product = require('../models/Product');
const { protect } = require('../middleware/auth');
const { authorize } = require('../middleware/roleCheck');

// @route   GET /api/seller/analytics/sales
// @desc    Get seller sales analytics
// @access  Private (Seller/Farmer)
router.get('/analytics/sales', protect, authorize('farmer'), async (req, res) => {
    try {
        const { period = 'all', startDate, endDate } = req.query;

        // Build date filter
        let dateFilter = {};
        if (period === 'today') {
            const today = new Date();
            today.setHours(0, 0, 0, 0);
            dateFilter = { createdAt: { $gte: today } };
        } else if (period === 'week') {
            const weekAgo = new Date();
            weekAgo.setDate(weekAgo.getDate() - 7);
            dateFilter = { createdAt: { $gte: weekAgo } };
        } else if (period === 'month') {
            const monthAgo = new Date();
            monthAgo.setMonth(monthAgo.getMonth() - 1);
            dateFilter = { createdAt: { $gte: monthAgo } };
        } else if (startDate && endDate) {
            dateFilter = {
                createdAt: {
                    $gte: new Date(startDate),
                    $lte: new Date(endDate),
                },
            };
        }

        // Get all orders containing seller's products
        const orders = await Order.find({
            ...dateFilter,
            'items.seller': req.user._id,
            paymentStatus: 'completed',
        }).populate('items.product');

        // Calculate metrics
        let totalRevenue = 0;
        let totalOrders = orders.length;
        let totalItemsSold = 0;
        const productSales = {};

        orders.forEach((order) => {
            order.items.forEach((item) => {
                if (item.seller.toString() === req.user._id.toString()) {
                    const itemTotal = item.price * item.quantity;
                    totalRevenue += itemTotal;
                    totalItemsSold += item.quantity;

                    // Track sales by product
                    const prodId = item.product._id.toString();
                    if (!productSales[prodId]) {
                        productSales[prodId] = {
                            productName: item.name || item.product.name,
                            quantitySold: 0,
                            revenue: 0,
                        };
                    }
                    productSales[prodId].quantitySold += item.quantity;
                    productSales[prodId].revenue += itemTotal;
                }
            });
        });

        // Convert productSales object to array and sort by revenue
        const topProducts = Object.values(productSales)
            .sort((a, b) => b.revenue - a.revenue)
            .slice(0, 5);

        res.json({
            success: true,
            data: {
                totalRevenue,
                totalOrders,
                totalItemsSold,
                averageOrderValue: totalOrders > 0 ? totalRevenue / totalOrders : 0,
                topProducts,
            },
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// @route   GET /api/seller/analytics/revenue
// @desc    Get revenue by period (daily/monthly)
// @access  Private (Seller/Farmer)
router.get('/analytics/revenue', protect, authorize('farmer'), async (req, res) => {
    try {
        const { groupBy = 'day', limit = 30 } = req.query;

        const dateGroupFormat = groupBy === 'month'
            ? { year: { $year: '$createdAt' }, month: { $month: '$createdAt' } }
            : { year: { $year: '$createdAt' }, month: { $month: '$createdAt' }, day: { $dayOfMonth: '$createdAt' } };

        const revenue = await Order.aggregate([
            {
                $match: {
                    'items.seller': req.user._id,
                    paymentStatus: 'completed',
                },
            },
            { $unwind: '$items' },
            {
                $match: {
                    'items.seller': req.user._id,
                },
            },
            {
                $group: {
                    _id: dateGroupFormat,
                    revenue: {
                        $sum: { $multiply: ['$items.price', '$items.quantity'] },
                    },
                    orders: { $addToSet: '$_id' },
                },
            },
            {
                $project: {
                    date: '$_id',
                    revenue: 1,
                    orderCount: { $size: '$orders' },
                },
            },
            { $sort: { '_id.year': -1, '_id.month': -1, '_id.day': -1 } },
            { $limit: Number(limit) },
        ]);

        res.json({
            success: true,
            data: revenue,
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// @route   GET /api/seller/products/performance
// @desc    Get product performance metrics
// @access  Private (Seller/Farmer)
router.get('/products/performance', protect, authorize('farmer'), async (req, res) => {
    try {
        const products = await Product.find({ seller: req.user._id });

        const productMetrics = await Promise.all(
            products.map(async (product) => {
                // Get orders containing this product
                const orders = await Order.find({
                    'items.product': product._id,
                    paymentStatus: 'completed',
                });

                let totalSold = 0;
                let totalRevenue = 0;

                orders.forEach((order) => {
                    order.items.forEach((item) => {
                        if (item.product.toString() === product._id.toString()) {
                            totalSold += item.quantity;
                            totalRevenue += item.price * item.quantity;
                        }
                    });
                });

                return {
                    _id: product._id,
                    name: product.name,
                    type: product.type,
                    price: product.price,
                    stock: product.stock,
                    averageRating: product.averageRating,
                    numReviews: product.numReviews,
                    totalSold,
                    totalRevenue,
                    conversionRate: totalSold > 0 ? (totalSold / (totalSold + product.stock)) * 100 : 0,
                };
            })
        );

        // Sort by revenue
        productMetrics.sort((a, b) => b.totalRevenue - a.totalRevenue);

        res.json({
            success: true,
            data: productMetrics,
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// @route   GET /api/seller/orders
// @desc    Get orders for seller's products
// @access  Private (Seller/Farmer)
router.get('/orders', protect, authorize('farmer'), async (req, res) => {
    try {
        const { status } = req.query;

        let query = { 'items.seller': req.user._id };
        if (status) {
            query.deliveryStatus = status;
        }

        const orders = await Order.find(query)
            .populate('buyer', 'name email phone')
            .populate('items.product', 'name images')
            .sort({ createdAt: -1 });

        // Filter to only show items sold by this seller
        const filteredOrders = orders.map((order) => {
            const sellerItems = order.items.filter(
                (item) => item.seller.toString() === req.user._id.toString()
            );
            return {
                ...order.toObject(),
                items: sellerItems,
            };
        });

        res.json({
            success: true,
            count: filteredOrders.length,
            data: filteredOrders,
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// @route   GET /api/seller/inventory/alerts
// @desc    Get low stock alerts
// @access  Private (Seller/Farmer)
router.get('/inventory/alerts', protect, authorize('farmer'), async (req, res) => {
    try {
        const threshold = req.query.threshold || 10;

        const lowStockProducts = await Product.find({
            seller: req.user._id,
            stock: { $lte: Number(threshold), $gt: 0 },
            status: 'approved',
        }).select('name type stock price unit');

        const outOfStockProducts = await Product.find({
            seller: req.user._id,
            stock: 0,
            status: 'approved',
        }).select('name type stock price unit');

        res.json({
            success: true,
            data: {
                lowStock: lowStockProducts,
                outOfStock: outOfStockProducts,
                lowStockCount: lowStockProducts.length,
                outOfStockCount: outOfStockProducts.length,
            },
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

module.exports = router;
