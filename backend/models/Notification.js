const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema(
    {
        user: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: true,
        },
        type: {
            type: String,
            enum: ['order', 'payment', 'product', 'system', 'review'],
            required: true,
        },
        title: {
            type: String,
            required: true,
        },
        message: {
            type: String,
            required: true,
        },
        relatedId: {
            type: mongoose.Schema.Types.ObjectId,
            refPath: 'relatedModel',
        },
        relatedModel: {
            type: String,
            enum: ['Order', 'Product', 'Payment'],
        },
        isRead: {
            type: Boolean,
            default: false,
        },
        readAt: Date,
    },
    { timestamps: true }
);

// Index for efficient querying
notificationSchema.index({ user: 1, createdAt: -1 });
notificationSchema.index({ user: 1, isRead: 1 });

module.exports = mongoose.model('Notification', notificationSchema);
