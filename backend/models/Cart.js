const mongoose = require('mongoose');

const cartSchema = new mongoose.Schema(
    {
        user: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: true,
            unique: true,
        },
        items: [
            {
                product: {
                    type: mongoose.Schema.Types.ObjectId,
                    ref: 'Product',
                    required: true,
                },
                quantity: {
                    type: Number,
                    required: true,
                    min: 1,
                    default: 1,
                },
                // Price snapshot - lock price when added to cart
                priceSnapshot: {
                    type: Number,
                    required: true,
                },
                unitSnapshot: {
                    type: String,
                },
                nameSnapshot: {
                    type: String,
                },
                addedAt: {
                    type: Date,
                    default: Date.now,
                },
            },
        ],
        totalItems: {
            type: Number,
            default: 0,
        },
        totalPrice: {
            type: Number,
            default: 0,
        },
    },
    { timestamps: true }
);

// Calculate totals before saving
cartSchema.pre('save', function (next) {
    this.totalItems = this.items.reduce((acc, item) => acc + item.quantity, 0);
    this.totalPrice = this.items.reduce((acc, item) => acc + item.priceSnapshot * item.quantity, 0);
    next();
});

// Methods
cartSchema.methods.addItem = function (product, quantity) {
    const existingItemIndex = this.items.findIndex(
        (item) => item.product.toString() === product._id.toString()
    );

    if (existingItemIndex >= 0) {
        // Update quantity if item already exists
        this.items[existingItemIndex].quantity += quantity;
    } else {
        // Add new item
        this.items.push({
            product: product._id,
            quantity,
            priceSnapshot: product.price,
            unitSnapshot: product.unit,
            nameSnapshot: product.name,
        });
    }
};

cartSchema.methods.removeItem = function (productId) {
    this.items = this.items.filter((item) => item.product.toString() !== productId.toString());
};

cartSchema.methods.updateQuantity = function (productId, quantity) {
    const item = this.items.find((item) => item.product.toString() === productId.toString());
    if (item) {
        item.quantity = quantity;
    }
};

cartSchema.methods.clearCart = function () {
    this.items = [];
    this.totalItems = 0;
    this.totalPrice = 0;
};

module.exports = mongoose.model('Cart', cartSchema);
