const mongoose = require('mongoose');

const orderSchema = new mongoose.Schema(
    {
        buyer: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: true,
        },
        items: [
            {
                product: {
                    type: mongoose.Schema.Types.ObjectId,
                    ref: 'Product',
                    required: true,
                },
                name: String, // Store product name for history
                quantity: {
                    type: Number,
                    required: true,
                    min: 1,
                },
                price: {
                    type: Number,
                    required: true,
                },
                unit: String,
                seller: {
                    type: mongoose.Schema.Types.ObjectId,
                    ref: 'User',
                },
            },
        ],
        shippingAddress: {
            street: { type: String, required: true },
            city: { type: String, required: true },
            state: { type: String, required: true },
            pincode: { type: String, required: true },
            phone: { type: String, required: true },
        },
        paymentInfo: {
            method: {
                type: String,
                enum: ['cod', 'online', 'upi'],
                default: 'cod',
            },
            razorpayOrderId: String,
            razorpayPaymentId: String,
            razorpaySignature: String,
        },
        paymentStatus: {
            type: String,
            enum: ['pending', 'completed', 'failed', 'refunded'],
            default: 'pending',
        },
        // Price breakdown
        itemsPrice: {
            type: Number,
            default: 0,
        },
        taxPrice: {
            type: Number,
            default: 0,
        },
        shippingPrice: {
            type: Number,
            default: 0,
        },
        totalAmount: {
            type: Number,
            required: true,
        },
        deliveryStatus: {
            type: String,
            enum: ['pending', 'confirmed', 'processing', 'dispatched', 'in_transit', 'delivered', 'cancelled'],
            default: 'pending',
        },
        statusHistory: [
            {
                status: String,
                timestamp: {
                    type: Date,
                    default: Date.now,
                },
                note: String,
            },
        ],
        trackingInfo: {
            trackingNumber: String,
            courier: String,
            estimatedDelivery: Date,
        },
        deliveredAt: Date,
        cancelledAt: Date,
        cancellationReason: String,
    },
    { timestamps: true }
);

// Add initial status to history
orderSchema.pre('save', function (next) {
    if (this.isNew) {
        this.statusHistory.push({
            status: this.deliveryStatus,
            timestamp: new Date(),
            note: 'Order created',
        });
    } else if (this.isModified('deliveryStatus')) {
        this.statusHistory.push({
            status: this.deliveryStatus,
            timestamp: new Date(),
            note: `Status changed to ${this.deliveryStatus}`,
        });

        if (this.deliveryStatus === 'delivered') {
            this.deliveredAt = new Date();
        } else if (this.deliveryStatus === 'cancelled') {
            this.cancelledAt = new Date();
        }
    }
    next();
});

// Calculate prices
orderSchema.methods.calculatePrices = function () {
    this.itemsPrice = this.items.reduce((acc, item) => acc + item.price * item.quantity, 0);
    this.taxPrice = Math.round(this.itemsPrice * 0.05); // 5% GST
    this.shippingPrice = this.itemsPrice > 500 ? 0 : 40; // Free shipping above ₹500
    this.totalAmount = this.itemsPrice + this.taxPrice + this.shippingPrice;
};

module.exports = mongoose.model('Order', orderSchema);

