const mongoose = require('mongoose');

const subscriptionSchema = new mongoose.Schema(
    {
        subscriber: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: true,
        },
        product: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Product',
            required: true,
        },
        seller: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: true,
        },
        quantity: {
            type: Number,
            required: true,
            min: 1,
        },
        deliveryTime: {
            type: String,
            enum: ['morning', 'evening'],
            default: 'morning',
        },
        startDate: {
            type: Date,
            required: true,
        },
        endDate: {
            type: Date,
        },
        status: {
            type: String,
            enum: ['active', 'paused', 'cancelled', 'completed'],
            default: 'active',
        },
        shippingAddress: {
            street: String,
            city: String,
            state: String,
            pincode: String,
            phone: String,
        },
        pricePerDelivery: {
            type: Number,
            required: true,
        },
        paymentMethod: {
            type: String,
            enum: ['cod', 'prepaid'],
            default: 'cod',
        },
        // Delivery tracking
        nextDeliveryDate: {
            type: Date,
        },
        lastDeliveryDate: {
            type: Date,
        },
        deliveryCount: {
            type: Number,
            default: 0,
        },
    },
    { timestamps: true }
);

// Set initial next delivery date
subscriptionSchema.pre('save', function (next) {
    if (this.isNew && !this.nextDeliveryDate) {
        this.nextDeliveryDate = this.startDate;
    }
    next();
});

// Helper method to calculate next delivery date (daily)
subscriptionSchema.methods.calculateNextDeliveryDate = function () {
    const current = this.nextDeliveryDate || new Date();
    const next = new Date(current);
    next.setDate(next.getDate() + 1); // Daily delivery
    this.nextDeliveryDate = next;
};

// Helper method to skip next delivery
subscriptionSchema.methods.skipNextDelivery = function () {
    this.calculateNextDeliveryDate();
};

module.exports = mongoose.model('Subscription', subscriptionSchema);

