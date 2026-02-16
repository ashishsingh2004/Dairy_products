const StockHistory = require('../models/StockHistory');
const Product = require('../models/Product');

/**
 * Log stock change to history
 * @param {Object} params - Stock change parameters
 * @returns {Promise<StockHistory>}
 */
const logStockChange = async ({
    productId,
    type,
    quantity,
    previousStock,
    newStock,
    relatedTo = null,
    relatedModel = null,
    batch = null,
    reason = '',
    performedBy = null,
    notes = '',
}) => {
    try {
        const stockHistory = await StockHistory.create({
            product: productId,
            type,
            quantity,
            previousStock,
            newStock,
            relatedTo,
            relatedModel,
            batch,
            reason,
            performedBy,
            notes,
        });

        return stockHistory;
    } catch (error) {
        console.error('Error logging stock change:', error);
        throw error;
    }
};

/**
 * Update product stock and log the change
 * @param {Object} params - Stock update parameters
 * @returns {Promise<Object>} Updated product and stock history
 */
const updateStockWithHistory = async ({
    productId,
    quantityChange,
    type,
    relatedTo = null,
    relatedModel = null,
    batch = null,
    reason = '',
    performedBy = null,
    notes = '',
}) => {
    try {
        const product = await Product.findById(productId);
        if (!product) {
            throw new Error('Product not found');
        }

        const previousStock = product.stock;
        const newStock = previousStock + quantityChange;

        if (newStock < 0) {
            throw new Error('Insufficient stock');
        }

        // Update product stock
        product.stock = newStock;
        await product.save();

        // Log the change
        const stockHistory = await logStockChange({
            productId,
            type,
            quantity: Math.abs(quantityChange),
            previousStock,
            newStock,
            relatedTo,
            relatedModel,
            batch,
            reason,
            performedBy,
            notes,
        });

        return {
            product,
            stockHistory,
            previousStock,
            newStock,
        };
    } catch (error) {
        console.error('Error updating stock:', error);
        throw error;
    }
};

/**
 * Handle order stock reduction with history logging
 * @param {Object} order - Order object
 * @returns {Promise<Array>} Array of stock history records
 */
const handleOrderStockReduction = async (order) => {
    const stockHistories = [];

    for (const item of order.items) {
        try {
            const result = await updateStockWithHistory({
                productId: item.product,
                quantityChange: -item.quantity,
                type: 'sale',
                relatedTo: order._id,
                relatedModel: 'Order',
                reason: `Order #${order._id}`,
                performedBy: order.buyer,
            });

            stockHistories.push(result.stockHistory);
        } catch (error) {
            console.error(`Error updating stock for product ${item.product}:`, error);
            // Continue with other items even if one fails
        }
    }

    return stockHistories;
};

/**
 * Handle order cancellation stock restoration
 * @param {Object} order - Order object
 * @returns {Promise<Array>} Array of stock history records
 */
const handleOrderCancellationStockRestoration = async (order) => {
    const stockHistories = [];

    for (const item of order.items) {
        try {
            const result = await updateStockWithHistory({
                productId: item.product,
                quantityChange: item.quantity,
                type: 'return',
                relatedTo: order._id,
                relatedModel: 'Order',
                reason: `Order #${order._id} cancelled`,
                performedBy: order.buyer,
            });

            stockHistories.push(result.stockHistory);
        } catch (error) {
            console.error(`Error restoring stock for product ${item.product}:`, error);
        }
    }

    return stockHistories;
};

/**
 * Get expiring products
 * @param {Number} days - Number of days to look ahead
 * @param {ObjectId} sellerId - Optional seller ID filter
 * @returns {Promise<Array>} Array of expiring products
 */
const getExpiringProducts = async (days = 30, sellerId = null) => {
    const futureDate = new Date();
    futureDate.setDate(futureDate.getDate() + days);

    let query = {
        'batch.expiryDate': {
            $gte: new Date(),
            $lte: futureDate,
        },
    };

    if (sellerId) {
        const sellerProducts = await Product.find({ seller: sellerId }).select('_id');
        const productIds = sellerProducts.map((p) => p._id);
        query.product = { $in: productIds };
    }

    const expiringBatches = await StockHistory.find(query)
        .populate('product', 'name type unit seller')
        .sort({ 'batch.expiryDate': 1 });

    return expiringBatches;
};

module.exports = {
    logStockChange,
    updateStockWithHistory,
    handleOrderStockReduction,
    handleOrderCancellationStockRestoration,
    getExpiringProducts,
};
