const mongoose = require('mongoose');
const Product = require('./models/Product');
const User = require('./models/User');
require('dotenv').config();

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI)
    .then(() => console.log('✅ MongoDB connected for seeding'))
    .catch((err) => console.error('MongoDB connection error:', err));

const seedProducts = async () => {
    try {
        // Find or create a demo seller user
        let seller = await User.findOne({ email: 'farmer@demo.com' });

        if (!seller) {
            seller = await User.create({
                name: 'Demo Farmer',
                email: 'farmer@demo.com',
                password: 'password123', // Will be hashed by pre-save hook
                phone: '9876543210',
                role: 'farmer',
                address: 'Village Demo, Maharashtra, India'
            });
            console.log('✅ Created demo farmer user');
        }

        // Clear existing products (optional - comment out if you want to keep existing)
        await Product.deleteMany({});
        console.log('🗑️ Cleared existing products');

        // Sample dairy products
        const products = [
            // Raw Milk Products
            {
                seller: seller._id,
                name: 'Pure Cow Milk',
                type: 'raw_milk',
                description: 'Fresh cow milk from healthy, grass-fed cows. Rich in nutrients and delivered fresh every morning. Perfect for daily consumption.',
                price: 60,
                unit: 'liter',
                fatPercentage: 4.5,
                stock: 50,
                location: { city: 'Pune', state: 'Maharashtra', pincode: '411001' },
                isVerified: true,
                status: 'approved',
                averageRating: 4.8,
                numReviews: 24,
                images: [
                    { url: 'https://images.unsplash.com/photo-1563636619-e9143da7973b?w=500', publicId: 'milk_1' }
                ]
            },
            {
                seller: seller._id,
                name: 'A2 Buffalo Milk',
                type: 'raw_milk',
                description: 'Premium A2 buffalo milk with high fat content. Ideal for making traditional sweets and rich dairy products.',
                price: 80,
                unit: 'liter',
                fatPercentage: 7.0,
                stock: 30,
                location: { city: 'Nashik', state: 'Maharashtra', pincode: '422001' },
                isVerified: true,
                status: 'approved',
                averageRating: 4.9,
                numReviews: 18,
                images: [
                    { url: 'https://images.unsplash.com/photo-1550583724-b2692b85b150?w=500', publicId: 'milk_2' }
                ]
            },
            {
                seller: seller._id,
                name: 'Organic Farm Milk',
                type: 'raw_milk',
                description: 'Certified organic milk from cows fed only organic fodder. No hormones or antibiotics used.',
                price: 90,
                unit: 'liter',
                fatPercentage: 5.0,
                stock: 25,
                location: { city: 'Satara', state: 'Maharashtra', pincode: '415001' },
                isVerified: true,
                status: 'approved',
                averageRating: 5.0,
                numReviews: 32,
                images: [
                    { url: 'https://images.unsplash.com/photo-1628088062854-d1870b4553da?w=500', publicId: 'milk_3' }
                ]
            },

            // Ghee Products
            {
                seller: seller._id,
                name: 'Pure Desi Ghee',
                type: 'ghee',
                description: 'Traditional handmade ghee prepared using the bilona method. Rich aroma and authentic taste. Made from A2 cow milk.',
                price: 600,
                unit: 'kg',
                stock: 40,
                location: { city: 'Kolhapur', state: 'Maharashtra', pincode: '416001' },
                isVerified: true,
                status: 'approved',
                averageRating: 4.9,
                numReviews: 45,
                images: [
                    { url: 'https://images.unsplash.com/photo-1614511850890-e8e2fe59a0dc?w=500', publicId: 'ghee_1' }
                ]
            },
            {
                seller: seller._id,
                name: 'Buffalo Ghee',
                type: 'ghee',
                description: 'Rich buffalo ghee with distinct flavor. Perfect for traditional Indian cooking and festivals.',
                price: 550,
                unit: 'kg',
                stock: 35,
                location: { city: 'Ahmednagar', state: 'Maharashtra', pincode: '414001' },
                isVerified: true,
                status: 'approved',
                averageRating: 4.7,
                numReviews: 28,
                images: [
                    { url: 'https://images.unsplash.com/photo-1630409346241-e36a0a6d2d93?w=500', publicId: 'ghee_2' }
                ]
            },

            // Paneer Products
            {
                seller: seller._id,
                name: 'Fresh Cottage Paneer',
                type: 'paneer',
                description: 'Soft and fresh cottage cheese made daily. Perfect for curries, grilling, or salads. High protein content.',
                price: 400,
                unit: 'kg',
                stock: 20,
                location: { city: 'Mumbai', state: 'Maharashtra', pincode: '400001' },
                isVerified: true,
                status: 'approved',
                averageRating: 4.6,
                numReviews: 36,
                images: [
                    { url: 'https://images.unsplash.com/photo-1631452180519-c014fe946bc7?w=500', publicId: 'paneer_1' }
                ]
            },
            {
                seller: seller._id,
                name: 'Premium Paneer Cubes',
                type: 'paneer',
                description: 'Pre-cut paneer cubes ready to use. Made from pure cow milk. Ideal for quick cooking.',
                price: 420,
                unit: 'kg',
                stock: 15,
                location: { city: 'Thane', state: 'Maharashtra', pincode: '400601' },
                isVerified: true,
                status: 'approved',
                averageRating: 4.5,
                numReviews: 22,
                images: [
                    { url: 'https://images.unsplash.com/photo-1568454537842-d933259bb258?w=500', publicId: 'paneer_2' }
                ]
            },

            // Curd/Yogurt Products
            {
                seller: seller._id,
                name: 'Fresh Homemade Curd',
                type: 'curd',
                description: 'Traditional homemade curd with perfect consistency. Rich in probiotics and great for digestion.',
                price: 50,
                unit: 'liter',
                stock: 60,
                location: { city: 'Pune', state: 'Maharashtra', pincode: '411002' },
                isVerified: true,
                status: 'approved',
                averageRating: 4.8,
                numReviews: 52,
                images: [
                    { url: 'https://images.unsplash.com/photo-1488477181946-6428a0291777?w=500', publicId: 'curd_1' }
                ]
            },
            {
                seller: seller._id,
                name: 'Greek Yogurt',
                type: 'curd',
                description: 'Thick and creamy Greek-style yogurt. High protein, low fat. Perfect for healthy breakfast.',
                price: 80,
                unit: 'liter',
                stock: 25,
                location: { city: 'Mumbai', state: 'Maharashtra', pincode: '400002' },
                isVerified: true,
                status: 'approved',
                averageRating: 4.7,
                numReviews: 19,
                images: [
                    { url: 'https://images.unsplash.com/photo-1584735174965-ca5f8e5f2a39?w=500', publicId: 'curd_2' }
                ]
            },

            // Butter Products
            {
                seller: seller._id,
                name: 'Fresh White Butter',
                type: 'butter',
                description: 'Traditional makhan made from pure cow milk. Unsalted and fresh. Perfect for parathas and rotis.',
                price: 500,
                unit: 'kg',
                stock: 18,
                location: { city: 'Nagpur', state: 'Maharashtra', pincode: '440001' },
                isVerified: true,
                status: 'approved',
                averageRating: 4.9,
                numReviews: 41,
                images: [
                    { url: 'https://images.unsplash.com/photo-1589985270826-4b7bb135bc9d?w=500', publicId: 'butter_1' }
                ]
            },
            {
                seller: seller._id,
                name: 'Salted Table Butter',
                type: 'butter',
                description: 'Lightly salted butter for everyday use. Spreads easily on bread and perfect for cooking.',
                price: 450,
                unit: 'kg',
                stock: 30,
                location: { city: 'Aurangabad', state: 'Maharashtra', pincode: '431001' },
                isVerified: true,
                status: 'approved',
                averageRating: 4.6,
                numReviews: 33,
                images: [
                    { url: 'https://images.unsplash.com/photo-1596560548464-f010549b84d7?w=500', publicId: 'butter_2' }
                ]
            },

            // Additional Variety
            {
                seller: seller._id,
                name: 'Low-Fat Toned Milk',
                type: 'raw_milk',
                description: 'Health-conscious choice with reduced fat content but full nutrition. Perfect for diet-conscious consumers.',
                price: 55,
                unit: 'liter',
                fatPercentage: 3.0,
                stock: 45,
                location: { city: 'Solapur', state: 'Maharashtra', pincode: '413001' },
                isVerified: true,
                status: 'approved',
                averageRating: 4.4,
                numReviews: 15,
                images: [
                    { url: 'https://images.unsplash.com/photo-1550583724-b2692b85b150?w=500', publicId: 'milk_4' }
                ]
            },
            {
                seller: seller._id,
                name: 'Flavored Curd - Mango',
                type: 'curd',
                description: 'Delicious mango-flavored yogurt perfect for desserts. Made with real mango pulp and pure milk.',
                price: 70,
                unit: 'liter',
                stock: 20,
                location: { city: 'Pune', state: 'Maharashtra', pincode: '411003' },
                isVerified: true,
                status: 'approved',
                averageRating: 4.5,
                numReviews: 26,
                images: [
                    { url: 'https://images.unsplash.com/photo-1571212515791-3c0b102f70cc?w=500', publicId: 'curd_3' }
                ]
            },
            {
                seller: seller._id,
                name: 'Artisan Paneer',
                type: 'paneer',
                description: 'Handcrafted paneer with traditional techniques. Extra soft texture and premium quality.',
                price: 480,
                unit: 'kg',
                stock: 12,
                location: { city: 'Mumbai', state: 'Maharashtra', pincode: '400003' },
                isVerified: true,
                status: 'approved',
                averageRating: 5.0,
                numReviews: 8,
                images: [
                    { url: 'https://images.unsplash.com/photo-1612220374596-b471c1e97c21?w=500', publicId: 'paneer_3' }
                ]
            },
            {
                seller: seller._id,
                name: 'Cultured Butter',
                type: 'butter',
                description: 'European-style cultured butter with tangy flavor. Premium quality for baking and gourmet cooking.',
                price: 550,
                unit: 'kg',
                stock: 10,
                location: { city: 'Pune', state: 'Maharashtra', pincode: '411004' },
                isVerified: true,
                status: 'approved',
                averageRating: 4.8,
                numReviews: 12,
                images: [
                    { url: 'https://images.unsplash.com/photo-1632676710190-b0c3d6052fac?w=500', publicId: 'butter_3' }
                ]
            }
        ];

        // Insert all products
        const createdProducts = await Product.insertMany(products);
        console.log(`✅ Successfully seeded ${createdProducts.length} products!`);

        // Show summary
        console.log('\n📊 Product Summary:');
        const productTypes = {};
        createdProducts.forEach(p => {
            productTypes[p.type] = (productTypes[p.type] || 0) + 1;
        });
        Object.entries(productTypes).forEach(([type, count]) => {
            console.log(`   ${type}: ${count} products`);
        });

        console.log('\n🎉 Database seeding completed successfully!');
        console.log('🌐 Visit http://localhost:3000/products to see the products\n');

        process.exit(0);
    } catch (error) {
        console.error('❌ Error seeding products:', error);
        process.exit(1);
    }
};

seedProducts();
