const axios = require('axios');

const API_URL = 'http://localhost:5000/api';

// Sample dairy products data
const sampleProducts = [
    {
        name: 'Pure Cow Milk',
        type: 'raw_milk',
        description: 'Fresh cow milk from healthy, grass-fed cows. Rich in nutrients and delivered fresh every morning.',
        price: 60,
        unit: 'liter',
        fatPercentage: 4.5,
        stock: 50,
        location: { city: 'Pune', state: 'Maharashtra', pincode: '411001' }
    },
    {
        name: 'A2 Buffalo Milk',
        type: 'raw_milk',
        description: 'Premium A2 buffalo milk with high fat content. Ideal for making traditional sweets.',
        price: 80,
        unit: 'liter',
        fatPercentage: 7.0,
        stock: 30,
        location: { city: 'Nashik', state: 'Maharashtra', pincode: '422001' }
    },
    {
        name: 'Pure Desi Ghee',
        type: 'ghee',
        description: 'Traditional handmade ghee prepared using the bilona method. Rich aroma and authentic taste.',
        price: 600,
        unit: 'kg',
        stock: 40,
        location: { city: 'Kolhapur', state: 'Maharashtra', pincode: '416001' }
    },
    {
        name: 'Fresh Cottage Paneer',
        type: 'paneer',
        description: 'Soft and fresh cottage cheese made daily. Perfect for curries, grilling, or salads.',
        price: 400,
        unit: 'kg',
        stock: 20,
        location: { city: 'Mumbai', state: 'Maharashtra', pincode: '400001' }
    },
    {
        name: 'Fresh Homemade Curd',
        type: 'curd',
        description: 'Traditional homemade curd with perfect consistency. Rich in probiotics.',
        price: 50,
        unit: 'liter',
        stock: 60,
        location: { city: 'Pune', state: 'Maharashtra', pincode: '411002' }
    },
    {
        name: 'Fresh White Butter',
        type: 'butter',
        description: 'Traditional makhan made from pure cow milk. Unsalted and fresh.',
        price: 500,
        unit: 'kg',
        stock: 18,
        location: { city: 'Nagpur', state: 'Maharashtra', pincode: '440001' }
    },
    {
        name: 'Organic Farm Milk',
        type: 'raw_milk',
        description: 'Certified organic milk from cows fed only organic fodder. No hormones or antibiotics.',
        price: 90,
        unit: 'liter',
        fatPercentage: 5.0,
        stock: 25,
        location: { city: 'Satara', state: 'Maharashtra', pincode: '415001' }
    },
    {
        name: 'Buffalo Ghee',
        type: 'ghee',
        description: 'Rich buffalo ghee with distinct flavor. Perfect for traditional Indian cooking.',
        price: 550,
        unit: 'kg',
        stock: 35,
        location: { city: 'Ahmednagar', state: 'Maharashtra', pincode: '414001' }
    },
    {
        name: 'Premium Paneer Cubes',
        type: 'paneer',
        description: 'Pre-cut paneer cubes ready to use. Made from pure cow milk.',
        price: 420,
        unit: 'kg',
        stock: 15,
        location: { city: 'Thane', state: 'Maharashtra', pincode: '400601' }
    },
    {
        name: 'Greek Yogurt',
        type: 'curd',
        description: 'Thick and creamy Greek-style yogurt. High protein, low fat.',
        price: 80,
        unit: 'liter',
        stock: 25,
        location: { city: 'Mumbai', state: 'Maharashtra', pincode: '400002' }
    }
];

async function addProductsDirectly() {
    const mongoose = require('mongoose');
    const Product = require('./models/Product');
    const User = require('./models/User');
    require('dotenv').config();

    try {
        // Connect to MongoDB
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('✅ Connected to MongoDB');

        // Find or create a demo farmer
        let farmer = await User.findOne({ email: 'farmer@demo.com' });

        if (!farmer) {
            const bcrypt = require('bcryptjs');
            const salt = await bcrypt.genSalt(10);
            const hashedPassword = await bcrypt.hash('password123', salt);

            farmer = await User.create({
                name: 'Demo Farmer',
                email: 'farmer@demo.com',
                password: hashedPassword,
                phone: '9876543210',
                role: 'farmer',
                address: 'Demo Village, Maharashtra'
            });
            console.log('✅ Created demo farmer account');
        }

        console.log('📦 Adding products...');
        let addedCount = 0;

        for (const productData of sampleProducts) {
            const product = await Product.create({
                ...productData,
                seller: farmer._id,
                status: 'approved',
                isVerified: true,
                averageRating: 4.5 + Math.random() * 0.5,
                numReviews: Math.floor(Math.random() * 30) + 10,
                images: [{
                    url: 'https://via.placeholder.com/400x300?text=' + productData.name.replace(/ /g, '+'),
                    publicId: 'demo_' + productData.name.toLowerCase().replace(/ /g, '_')
                }]
            });
            addedCount++;
            console.log(`   ✓ Added: ${product.name}`);
        }

        console.log(`\n✅ Successfully added ${addedCount} products!`);
        console.log('🌐 Visit http://localhost:3000/products to see them\n');

        process.exit(0);
    } catch (error) {
        console.error('❌ Error:', error.message);
        process.exit(1);
    }
}

// Run the function
addProductsDirectly();
