const mongoose = require('mongoose');

const productSchema = new mongoose.Schema(
    {
        seller: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: true,
        },
        name: {
            type: String,
            required: [true, 'Please provide a product name'],
            trim: true,
        },
        type: {
            type: String,
            enum: ['raw_milk', 'ghee', 'paneer', 'curd', 'butter', 'other'],
            required: true,
        },
        description: {
            type: String,
            required: [true, 'Please provide a description'],
        },
        price: {
            type: Number,
            required: [true, 'Please provide a price'],
            min: 0,
        },
        unit: {
            type: String,
            default: 'liter', // liter, kg, piece
        },
        // Specific to raw milk
        fatPercentage: {
            type: Number,
            min: 0,
            max: 100,
        },
        // General fields
        images: [
            {
                url: String,
                publicId: String,
            },
        ],
        stock: {
            type: Number,
            required: true,
            default: 0,
        },
        location: {
            city: String,
            state: String,
            pincode: String,
        },
        certification: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Certification',
        },
        isVerified: {
            type: Boolean,
            default: false,
        },
        ratings: [
            {
                user: {
                    type: mongoose.Schema.Types.ObjectId,
                    ref: 'User',
                },
                rating: {
                    type: Number,
                    min: 1,
                    max: 5,
                },
                comment: String,
                // Media attachments
                media: [
                    {
                        url: String,
                        type: {
                            type: String,
                            enum: ['image', 'video'],
                        },
                        publicId: String,
                    },
                ],
                // Helpful votes
                helpfulVotes: {
                    type: Number,
                    default: 0,
                },
                votedBy: [
                    {
                        type: mongoose.Schema.Types.ObjectId,
                        ref: 'User',
                    },
                ],
                // Seller response
                sellerResponse: {
                    text: String,
                    respondedAt: Date,
                },
                // Moderation
                moderationStatus: {
                    type: String,
                    enum: ['approved', 'pending', 'rejected'],
                    default: 'approved',
                },
                createdAt: {
                    type: Date,
                    default: Date.now,
                },
            },
        ],
        averageRating: {
            type: Number,
            default: 0,
        },
        numReviews: {
            type: Number,
            default: 0,
        },
        status: {
            type: String,
            enum: ['pending', 'approved', 'rejected'],
            default: 'approved', // Can be changed to 'pending' if admin approval needed
        },
    },
    { timestamps: true }
);

// Calculate average rating
productSchema.methods.updateRating = function () {
    if (this.ratings.length === 0) {
        this.averageRating = 0;
        this.numReviews = 0;
    } else {
        const sum = this.ratings.reduce((acc, item) => acc + item.rating, 0);
        this.averageRating = sum / this.ratings.length;
        this.numReviews = this.ratings.length;
    }
};

module.exports = mongoose.model('Product', productSchema);
