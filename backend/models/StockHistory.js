const mongoose = require('mongoose');

const stockHistorySchema = new mongoose.Schema(
    {
        product: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Product',
            required: true,
        },
        type: {
            type: String,
            enum: ['purchase', 'sale', 'adjustment', 'return', 'damaged', 'expired'],
            required: true,
        },
        quantity: {
            type: Number,
            required: true,
        },
        previousStock: {
            type: Number,
            required: true,
        },
        newStock: {
            type: Number,
            required: true,
        },
        // Reference to the transaction that caused this change
        relatedTo: {
            type: mongoose.Schema.Types.ObjectId,
            refPath: 'relatedModel',
        },
        relatedModel: {
            type: String,
            enum: ['Order', 'Subscription', 'Manual'],
        },
        // Batch information
        batch: {
            batchNumber: String,
            expiryDate: Date,
            manufacturingDate: Date,
        },
        reason: String,
        performedBy: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
        },
        notes: String,
    },
    { timestamps: true }
);

// Index for efficient querying
stockHistorySchema.index({ product: 1, createdAt: -1 });
stockHistorySchema.index({ product: 1, type: 1 });
stockHistorySchema.index({ 'batch.expiryDate': 1 });

module.exports = mongoose.model('StockHistory', stockHistorySchema);
