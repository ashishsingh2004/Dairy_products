const mongoose = require('mongoose');
const Cow = require('./models/Cow');
const User = require('./models/User');
require('dotenv').config();

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI)
    .then(() => console.log('✅ MongoDB connected for seeding cows'))
    .catch((err) => console.error('MongoDB connection error:', err));

const seedCows = async () => {
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

        // Clear existing cows (optional - comment out if you want to keep existing)
        await Cow.deleteMany({});
        console.log('🗑️ Cleared existing cow listings');

        // Sample cow listings with actual cow images
        const cows = [
            {
                seller: seller._id,
                breed: 'Gir',
                age: 4,
                milkCapacity: 15,
                price: 75000,
                negotiable: true,
                description: 'Healthy Gir cow with excellent milk production. Regular vaccinations done. Very calm temperament.',
                location: { city: 'Pune', state: 'Maharashtra', pincode: '411001' },
                pregnancyStatus: 'pregnant',
                status: 'available',
                images: [
                    { url: 'https://images.unsplash.com/photo-1560493676-04071c5f467b?w=800&q=80', publicId: 'gir_1' }
                ]
            },
            {
                seller: seller._id,
                breed: 'Sahiwal',
                age: 3,
                milkCapacity: 12,
                price: 65000,
                negotiable: true,
                description: 'Prime Sahiwal breed cow. High milk yield with good fat content. Recently calved.',
                location: { city: 'Nashik', state: 'Maharashtra', pincode: '422001' },
                pregnancyStatus: 'recently_calved',
                status: 'available',
                images: [
                    { url: 'https://images.unsplash.com/photo-1572193704784-543c4f7e8033?w=800&q=80', publicId: 'sahiwal_1' }
                ]
            },
            {
                seller: seller._id,
                breed: 'HF',
                age: 5,
                milkCapacity: 20,
                price: 95000,
                negotiable: false,
                description: 'High-yielding Holstein Friesian cow. Excellent for commercial dairy farming. All health records available.',
                location: { city: 'Satara', state: 'Maharashtra', pincode: '415001' },
                pregnancyStatus: 'not_pregnant',
                status: 'available',
                images: [
                    { url: 'https://images.unsplash.com/photo-1559827260-dc66d52bef19?w=800&q=80', publicId: 'hf_1' }
                ]
            },
            {
                seller: seller._id,
                breed: 'Jersey',
                age: 3,
                milkCapacity: 18,
                price: 80000,
                negotiable: true,
                description: 'Beautiful Jersey cow with consistent milk production. Well-maintained and healthy.',
                location: { city: 'Kolhapur', state: 'Maharashtra', pincode: '416001' },
                pregnancyStatus: 'not_pregnant',
                status: 'available',
                images: [
                    { url: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=800&q=80', publicId: 'jersey_1' }
                ]
            },
            {
                seller: seller._id,
                breed: 'Gir',
                age: 6,
                milkCapacity: 14,
                price: 70000,
                negotiable: true,
                description: 'Mature Gir cow, excellent mother. Proven breeding history. Calm and easy to handle.',
                location: { city: 'Ahmednagar', state: 'Maharashtra', pincode: '414001' },
                pregnancyStatus: 'pregnant',
                status: 'available',
                images: [
                    { url: 'https://images.unsplash.com/photo-1585025961551-f0be6650c58a?w=800&q=80', publicId: 'gir_2' }
                ]
            },
            {
                seller: seller._id,
                breed: 'Red Sindhi',
                age: 4,
                milkCapacity: 13,
                price: 68000,
                negotiable: true,
                description: 'Pure Red Sindhi breed. Heat tolerant and disease resistant. Good for tropical climate.',
                location: { city: 'Solapur', state: 'Maharashtra', pincode: '413001' },
                pregnancyStatus: 'not_pregnant',
                status: 'available',
                images: [
                    { url: 'https://images.unsplash.com/photo-1549923746-c502d488b3ea?w=800&q=80', publicId: 'redsindhi_1' }
                ]
            },
            {
                seller: seller._id,
                breed: 'Tharparkar',
                age: 3,
                milkCapacity: 11,
                price: 60000,
                negotiable: true,
                description: 'Young Tharparkar cow with dual-purpose traits. Good for both milk and draught.',
                location: { city: 'Aurangabad', state: 'Maharashtra', pincode: '431001' },
                pregnancyStatus: 'recently_calved',
                status: 'available',
                images: [
                    { url: 'https://images.unsplash.com/photo-1516467508483-a7212febe31a?w=800&q=80', publicId: 'tharparkar_1' }
                ]
            },
            {
                seller: seller._id,
                breed: 'HF',
                age: 4,
                milkCapacity: 22,
                price: 110000,
                negotiable: false,
                description: 'Premium HF cow with exceptional milk yield. Perfect genetics and maintained on balanced diet.',
                location: { city: 'Mumbai', state: 'Maharashtra', pincode: '400001' },
                pregnancyStatus: 'pregnant',
                status: 'available',
                images: [
                    { url: 'https://images.unsplash.com/photo-1548550023-2bdb3c5beed7?w=800&q=80', publicId: 'hf_2' }
                ]
            },
            {
                seller: seller._id,
                breed: 'Jersey',
                age: 5,
                milkCapacity: 16,
                price: 75000,
                negotiable: true,
                description: 'Reliable Jersey cow with steady production. Good temperament and easy to maintain.',
                location: { city: 'Thane', state: 'Maharashtra', pincode: '400601' },
                pregnancyStatus: 'not_pregnant',
                status: 'available',
                images: [
                    { url: 'https://images.unsplash.com/photo-1602150313866-5c64808c9331?w=800&q=80', publicId: 'jersey_2' }
                ]
            },
            {
                seller: seller._id,
                breed: 'Sahiwal',
                age: 4,
                milkCapacity: 13,
                price: 72000,
                negotiable: true,
                description: 'Prime Sahiwal with good build and health. Regular deworming and vaccination up to date.',
                location: { city: 'Nagpur', state: 'Maharashtra', pincode: '440001' },
                pregnancyStatus: 'recently_calved',
                status: 'available',
                images: [
                    { url: 'https://images.unsplash.com/photo-1517433670267-08bbd4be890f?w=800&q=80', publicId: 'sahiwal_2' }
                ]
            },
            {
                seller: seller._id,
                breed: 'Ongole',
                age: 5,
                milkCapacity: 10,
                price: 85000,
                negotiable: true,
                description: 'Strong Ongole breed. Excellent for draught work and moderate milk production.',
                location: { city: 'Pune', state: 'Maharashtra', pincode: '411002' },
                pregnancyStatus: 'not_pregnant',
                status: 'available',
                images: [
                    { url: 'https://images.unsplash.com/photo-1544792983-0d6087f0bf26?w=800&q=80', publicId: 'ongole_1' }
                ]
            },
            {
                seller: seller._id,
                breed: 'Gir',
                age: 3,
                milkCapacity: 16,
                price: 82000,
                negotiable: true,
                description: 'Young and productive Gir cow. First calf recently weaned. Great investment for dairy farm.',
                location: { city: 'Kolhapur', state: 'Maharashtra', pincode: '416002' },
                pregnancyStatus: 'not_pregnant',
                status: 'available',
                images: [
                    { url: 'https://images.unsplash.com/photo-1500595046743-cd271d694d30?w=800&q=80', publicId: 'gir_3' }
                ]
            }
        ];

        // Insert all cows
        const createdCows = await Cow.insertMany(cows);
        console.log(`✅ Successfully seeded ${createdCows.length} cow listings!`);

        // Show summary
        console.log('\n📊 Cow Listings Summary:');
        const breedCount = {};
        createdCows.forEach(c => {
            breedCount[c.breed] = (breedCount[c.breed] || 0) + 1;
        });
        Object.entries(breedCount).forEach(([breed, count]) => {
            console.log(`   ${breed}: ${count} cows`);
        });

        console.log('\n🎉 Cow database seeding completed successfully!');
        console.log('🌐 Visit http://localhost:3000/cows to see the cow listings\n');

        process.exit(0);
    } catch (error) {
        console.error('❌ Error seeding cows:', error);
        process.exit(1);
    }
};

seedCows();
