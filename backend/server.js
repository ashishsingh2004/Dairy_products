require('dotenv').config();
const express = require('express');
const cors = require('cors');
const connectDB = require('./config/db');
const { startSubscriptionScheduler } = require('./utils/subscriptionScheduler');

// Initialize express app
const app = express();

// Connect to database
connectDB();

// Start subscription scheduler (runs daily at 2 AM)
startSubscriptionScheduler();

// Middleware
const allowedOrigins = [
    'http://localhost:3000',
    process.env.FRONTEND_URL,
].filter(Boolean);

app.use(cors({
    origin: function (origin, callback) {
        // Allow requests with no origin (like mobile apps or curl)
        if (!origin) return callback(null, true);
        if (allowedOrigins.indexOf(origin) !== -1) {
            callback(null, true);
        } else {
            callback(new Error('Not allowed by CORS'));
        }
    },
    credentials: true,
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/products', require('./routes/products'));
app.use('/api/orders', require('./routes/orders'));
app.use('/api/cart', require('./routes/cart'));
app.use('/api/seller', require('./routes/sellerDashboard'));
app.use('/api/subscriptions', require('./routes/subscriptions'));
app.use('/api/notifications', require('./routes/notifications'));
app.use('/api/inventory', require('./routes/inventory'));
app.use('/api/cows', require('./routes/cows'));
app.use('/api/certifications', require('./routes/certifications'));
app.use('/api/chat', require('./routes/chat'));
app.use('/api/admin', require('./routes/admin'));

// Health check endpoint (for deployment platforms)
app.get('/health', (req, res) => {
    res.status(200).json({ status: 'ok', message: 'Server is healthy' });
});

// Welcome route
app.get('/', (req, res) => {
    res.json({
        message: 'Welcome to Dairy Marketplace API',
        version: '1.0.0',
        endpoints: {
            auth: '/api/auth',
            products: '/api/products',
            orders: '/api/orders',
            cart: '/api/cart',
            subscriptions: '/api/subscriptions',
            cows: '/api/cows',
            certifications: '/api/certifications',
            chat: '/api/chat',
            admin: '/api/admin',
        },
    });
});

// Error handling middleware
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(err.statusCode || 500).json({
        success: false,
        message: err.message || 'Server Error',
    });
});

// 404 handler
app.use((req, res) => {
    res.status(404).json({
        success: false,
        message: 'Route not found',
    });
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
    console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
});
