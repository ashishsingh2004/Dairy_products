const mongoose = require('mongoose');

const cowSchema = new mongoose.Schema(
    {
        seller: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: true,
        },
        breed: {
            type: String,
            required: [true, 'Please specify the breed'],
            enum: ['Gir', 'Sahiwal', 'HF', 'Jersey', 'Ongole', 'Tharparkar', 'Red Sindhi', 'Other'],
        },
        age: {
            type: Number,
            required: [true, 'Please specify the age'],
            min: 0,
        },
        milkCapacity: {
            type: Number,
            required: [true, 'Please specify milk capacity per day'],
            min: 0,
        },
        price: {
            type: Number,
            required: [true, 'Please specify the price'],
            min: 0,
        },
        negotiable: {
            type: Boolean,
            default: true,
        },
        description: {
            type: String,
            required: true,
        },
        healthRecords: [
            {
                url: String,
                publicId: String,
                documentType: {
                    type: String,
                    enum: ['vaccination', 'medical_report', 'certificate', 'other'],
                },
            },
        ],
        images: [
            {
                url: String,
                publicId: String,
            },
        ],
        location: {
            city: String,
            state: String,
            pincode: String,
        },
        status: {
            type: String,
            enum: ['available', 'sold', 'reserved'],
            default: 'available',
        },
        pregnancyStatus: {
            type: String,
            enum: ['not_pregnant', 'pregnant', 'recently_calved'],
        },
    },
    { timestamps: true }
);

module.exports = mongoose.model('Cow', cowSchema);
