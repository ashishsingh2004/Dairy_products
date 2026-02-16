const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema(
    {
        name: {
            type: String,
            required: [true, 'Please provide a name'],
            trim: true,
        },
        email: {
            type: String,
            required: [true, 'Please provide an email'],
            unique: true,
            lowercase: true,
            match: [/^\S+@\S+\.\S+$/, 'Please provide a valid email'],
        },
        password: {
            type: String,
            required: [true, 'Please provide a password'],
            minlength: 6,
            select: false,
        },
        role: {
            type: String,
            enum: ['farmer', 'consumer', 'trader', 'admin'],
            default: 'consumer',
        },
        phone: {
            type: String,
            trim: true,
        },
        address: {
            street: String,
            city: String,
            state: String,
            pincode: String,
            country: { type: String, default: 'India' },
        },
        languagePreference: {
            type: String,
            enum: ['en', 'hi', 'mr'],
            default: 'en',
        },
        kycStatus: {
            type: String,
            enum: ['not_submitted', 'pending', 'verified', 'rejected'],
            default: 'not_submitted',
        },
        kycDocuments: [
            {
                type: String,
                url: String,
            },
        ],
        isActive: {
            type: Boolean,
            default: true,
        },
        avatar: {
            type: String,
        },
    },
    { timestamps: true }
);

// Hash password before saving
userSchema.pre('save', async function (next) {
    if (!this.isModified('password')) {
        next();
    }
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
});

// Compare password method
userSchema.methods.matchPassword = async function (enteredPassword) {
    return await bcrypt.compare(enteredPassword, this.password);
};

module.exports = mongoose.model('User', userSchema);
