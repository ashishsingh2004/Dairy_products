const express = require('express');
const router = express.Router();
const Product = require('../models/Product');
const StockHistory = require('../models/StockHistory');
const Order = require('../models/Order');
const { protect } = require('../middleware/auth');
const { authorize } = require('../middleware/roleCheck');

// @route   POST /api/inventory/adjust
// @desc    Adjust product stock manually
// @access  Private (Seller/Admin)
router.post('/adjust', protect, authorize('farmer', 'admin'), async (req, res) => {
    try {
        const { productId, quantity, type, reason, batch, notes } = req.body;

        const product = await Product.findById(productId);
        if (!product) {
            return res.status(404).json({ message: 'Product not found' });
        }

        // Check authorization - seller can only adjust their own products
        if (req.user.role === 'farmer' && product.seller.toString() !== req.user._id.toString()) {
            return res.status(403).json({ message: 'Not authorized to adjust this product' });
        }

        const previousStock = product.stock;
        let adjustment = quantity;

        // Determine if adding or removing stock
        if (type === 'damaged' || type === 'expired' || type === 'sale') {
            adjustment = -Math.abs(quantity);
        }

        const newStock = previousStock + adjustment;

        if (newStock < 0) {
            return res.status(400).json({ message: 'Insufficient stock for this adjustment' });
        }

        // Update product stock
        product.stock = newStock;
        await product.save();

        // Create stock history record
        const stockHistory = await StockHistory.create({
            product: productId,
            type,
            quantity: Math.abs(adjustment),
            previousStock,
            newStock,
            batch,
            reason,
            notes,
            performedBy: req.user._id,
        });

        res.json({
            success: true,
            data: stockHistory,
            product: {
                _id: product._id,
                name: product.name,
                previousStock,
                newStock,
            },
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// @route   GET /api/inventory/history/:productId
// @desc    Get stock history for a product
// @access  Private (Seller/Admin)
router.get('/history/:productId', protect, authorize('farmer', 'admin'), async (req, res) => {
    try {
        const { startDate, endDate, type } = req.query;
        const product = await Product.findById(req.params.productId);

        if (!product) {
            return res.status(404).json({ message: 'Product not found' });
        }

        // Check authorization
        if (req.user.role === 'farmer' && product.seller.toString() !== req.user._id.toString()) {
            return res.status(403).json({ message: 'Not authorized' });
        }

        let query = { product: req.params.productId };

        if (type) {
            query.type = type;
        }

        if (startDate || endDate) {
            query.createdAt = {};
            if (startDate) query.createdAt.$gte = new Date(startDate);
            if (endDate) query.createdAt.$lte = new Date(endDate);
        }

        const history = await StockHistory.find(query)
            .populate('performedBy', 'name email')
            .sort({ createdAt: -1 })
            .limit(100);

        res.json({
            success: true,
            count: history.length,
            data: history,
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// @route   GET /api/inventory/expiring
// @desc    Get products with batches expiring soon
// @access  Private (Seller/Admin)
router.get('/expiring', protect, authorize('farmer', 'admin'), async (req, res) => {
    try {
        const { days = 30 } = req.query;
        const futureDate = new Date();
        futureDate.setDate(futureDate.getDate() + Number(days));

        let query = {
            'batch.expiryDate': {
                $gte: new Date(),
                $lte: futureDate,
            },
        };

        // If seller, only their products
        if (req.user.role === 'farmer') {
            const sellerProducts = await Product.find({ seller: req.user._id }).select('_id');
            const productIds = sellerProducts.map((p) => p._id);
            query.product = { $in: productIds };
        }

        const expiringBatches = await StockHistory.find(query)
            .populate('product', 'name type unit')
            .sort({ 'batch.expiryDate': 1 });

        // Group by product
        const grouped = {};
        expiringBatches.forEach((item) => {
            const prodId = item.product._id.toString();
            if (!grouped[prodId]) {
                grouped[prodId] = {
                    product: item.product,
                    batches: [],
                };
            }
            grouped[prodId].batches.push({
                batchNumber: item.batch.batchNumber,
                expiryDate: item.batch.expiryDate,
                quantity: item.quantity,
            });
        });

        res.json({
            success: true,
            count: Object.keys(grouped).length,
            data: Object.values(grouped),
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// @route   GET /api/inventory/reorder-suggestions
// @desc    Get auto-reorder suggestions based on sales velocity
// @access  Private (Seller/Admin)
router.get('/reorder-suggestions', protect, authorize('farmer', 'admin'), async (req, res) => {
    try {
        const { days = 30 } = req.query;

        // Get seller's products
        let productsQuery = req.user.role === 'farmer' ? { seller: req.user._id } : {};
        const products = await Product.find(productsQuery);

        const suggestions = [];

        for (const product of products) {
            // Calculate sales velocity (last 30 days)
            const startDate = new Date();
            startDate.setDate(startDate.getDate() - Number(days));

            const salesHistory = await StockHistory.find({
                product: product._id,
                type: 'sale',
                createdAt: { $gte: startDate },
            });

            const totalSold = salesHistory.reduce((sum, item) => sum + item.quantity, 0);
            const dailyAverage = totalSold / Number(days);
            const daysUntilStockout = product.stock > 0 ? product.stock / dailyAverage : 0;

            // Suggest reorder if stock will run out in less than 7 days
            if (daysUntilStockout < 7 && daysUntilStockout >= 0) {
                const suggestedOrderQuantity = Math.ceil(dailyAverage * 14); // 2 weeks supply

                suggestions.push({
                    product: {
                        _id: product._id,
                        name: product.name,
                        type: product.type,
                        currentStock: product.stock,
                    },
                    analytics: {
                        totalSoldLast30Days: totalSold,
                        dailyAverageSales: dailyAverage.toFixed(2),
                        daysUntilStockout: Math.floor(daysUntilStockout),
                    },
                    suggestion: {
                        reorderQuantity: suggestedOrderQuantity,
                        urgency: daysUntilStockout < 3 ? 'high' : daysUntilStockout < 5 ? 'medium' : 'low',
                    },
                });
            }
        }

        // Sort by urgency
        suggestions.sort((a, b) => {
            const urgencyOrder = { high: 0, medium: 1, low: 2 };
            return urgencyOrder[a.suggestion.urgency] - urgencyOrder[b.suggestion.urgency];
        });

        res.json({
            success: true,
            count: suggestions.length,
            data: suggestions,
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// @route   GET /api/inventory/analytics/:productId
// @desc    Get detailed inventory analytics for a product
// @access  Private (Seller/Admin)
router.get('/analytics/:productId', protect, authorize('farmer', 'admin'), async (req, res) => {
    try {
        const { days = 30 } = req.query;
        const product = await Product.findById(req.params.productId);

        if (!product) {
            return res.status(404).json({ message: 'Product not found' });
        }

        // Check authorization
        if (req.user.role === 'farmer' && product.seller.toString() !== req.user._id.toString()) {
            return res.status(403).json({ message: 'Not authorized' });
        }

        const startDate = new Date();
        startDate.setDate(startDate.getDate() - Number(days));

        const history = await StockHistory.find({
            product: req.params.productId,
            createdAt: { $gte: startDate },
        });

        // Calculate metrics
        const metrics = {
            totalPurchased: 0,
            totalSold: 0,
            totalDamaged: 0,
            totalExpired: 0,
            totalAdjustments: 0,
            totalReturns: 0,
        };

        history.forEach((item) => {
            switch (item.type) {
                case 'purchase':
                    metrics.totalPurchased += item.quantity;
                    break;
                case 'sale':
                    metrics.totalSold += item.quantity;
                    break;
                case 'damaged':
                    metrics.totalDamaged += item.quantity;
                    break;
                case 'expired':
                    metrics.totalExpired += item.quantity;
                    break;
                case 'adjustment':
                    metrics.totalAdjustments += item.quantity;
                    break;
                case 'return':
                    metrics.totalReturns += item.quantity;
                    break;
            }
        });

        // Calculate turnover rate
        const averageStock = (product.stock + (product.stock + metrics.totalPurchased - metrics.totalSold)) / 2;
        const turnoverRate = averageStock > 0 ? metrics.totalSold / averageStock : 0;

        // Calculate waste percentage
        const totalWaste = metrics.totalDamaged + metrics.totalExpired;
        const wastePercentage = metrics.totalPurchased > 0 ? (totalWaste / metrics.totalPurchased) * 100 : 0;

        res.json({
            success: true,
            product: {
                _id: product._id,
                name: product.name,
                currentStock: product.stock,
            },
            period: `Last ${days} days`,
            metrics,
            analytics: {
                turnoverRate: turnoverRate.toFixed(2),
                wastePercentage: wastePercentage.toFixed(2),
                dailyAverageSales: (metrics.totalSold / Number(days)).toFixed(2),
            },
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

module.exports = router;
