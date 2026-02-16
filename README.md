# 🥛 Dairy Product Marketplace Platform

A comprehensive full-stack web application connecting dairy farmers, consumers, and traders. Built with the MERN stack (MongoDB, Express, React, Node.js).

## ✨ Features

### 1. **User Management Module**
- User registration with role selection (Farmer/Consumer/Trader/Admin)
- JWT-based authentication
- Profile management
- KYC verification system
- Role-based access control (RBAC)

### 2. **Marketplace Module (Milk & Dairy Products)**
- Raw milk listing with fat percentage tracking
- Dairy product catalog (ghee, paneer, curd, butter)
- Advanced search and filtering (location, price, rating)
- Shopping cart functionality
- Order management and tracking
- Ratings and reviews system
- Razorpay payment gateway integration
- Daily milk delivery subscription model
- Dynamic pricing based on quality certification

### 3. **AI Knowledge Hub (Chatbot)**
- OpenAI-powered chatbot assistant
- Expert advice on:
  - Cow diseases and symptoms
  - Vaccination schedules
  - Feed nutrition
  - Breeding cycles
  - Milk production optimization
- Conversation history management

### 4. **Cow Trading Module**
- Post cattle for sale with detailed information
- Browse cows by breed (Gir, Sahiwal, HF, Jersey, etc.)
- Upload health records and medical documents
- Price negotiation feature
- Comprehensive breed filtering

### 5. **Quality Certification Module**
- Upload milk fat test reports
- Lab certification verification
- Admin approval workflow
- "Verified Quality" badge system
- Premium pricing for certified products

### 6. **Multilingual Support**
- English (EN)
- Hindi (HI)
- Marathi (MR)
- Easy language switching
- Persistent language preference

### 7. **Admin Panel**
- User management dashboard
- Product approval system
- Certification verification
- Platform analytics (users, orders, revenue)
- Fraud monitoring

## 🚀 Technology Stack

### Backend
- **Runtime**: Node.js
- **Framework**: Express.js
- **Database**: MongoDB with Mongoose
- **Authentication**: JWT (JSON Web Tokens)
- **File Storage**: Cloudinary
- **Payment**: Razorpay
- **AI**: OpenAI API
- **Real-time**: Socket.io (for chat)

### Frontend
- **Library**: React.js
- **Routing**: React Router v6
- **State Management**: Context API
- **HTTP Client**: Axios
- **Internationalization**: i18next

## 📦 Installation

### Prerequisites
- Node.js (v14 or higher)
- MongoDB (local or Atlas)
- Cloudinary account
- Razorpay account
- OpenAI API key

### Backend Setup

```bash
# Navigate to backend directory
cd backend

# Install dependencies
npm install

# Create .env file and configure
cp .env.example .env

# Update .env with your credentials:
# - MONGODB_URI
# - JWT_SECRET
# - CLOUDINARY credentials
# - RAZORPAY credentials
# - OPENAI_API_KEY

# Start backend server
npm run dev
```

Backend will run on `http://localhost:5000`

### Frontend Setup

```bash
# Navigate to frontend directory
cd frontend

# Install dependencies
npm install

# Create .env file
# Add REACT_APP_API_URL=http://localhost:5000/api

# Start frontend development server
npm start
```

Frontend will run on `http://localhost:3000`

## 📁 Project Structure

```
dairyproduct-project/
├── backend/
│   ├── config/           # Database, JWT, Cloudinary config
│   ├── models/           # Mongoose schemas
│   ├── routes/           # API endpoints
│   ├── middleware/       # Auth, role check middleware
│   ├── services/         # Business logic (AI chat, payments)
│   └── server.js         # Express app entry point
│
└── frontend/
    ├── src/
    │   ├── components/   # React components
    │   ├── pages/        # Page components
    │   ├── context/      # React context (Auth)
    │   ├── services/     # API service layer
    │   ├── i18n/         # Translations (EN/HI/MR)
    │   └── App.js        # Main app component
    └── public/
```

## 🔑 API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user
- `GET /api/auth/profile` - Get user profile
- `PUT /api/auth/profile` - Update profile
- `POST /api/auth/kyc` - Submit KYC documents

### Products
- `GET /api/products` - Get all products (with filters)
- `GET /api/products/:id` - Get product details
- `POST /api/products` - Create product (Farmers only)
- `PUT /api/products/:id` - Update product
- `DELETE /api/products/:id` - Delete product
- `POST /api/products/:id/review` - Add review

### Orders
- `POST /api/orders/create-razorpay-order` - Create payment order
- `POST /api/orders/verify-payment` - Verify payment
- `POST /api/orders` - Create order
- `GET /api/orders` - Get user orders
- `GET /api/orders/:id` - Get order details
- `PUT /api/orders/:id/status` - Update order status

### Cow Trading
- `GET /api/cows` - Browse cows (with filters)
- `GET /api/cows/:id` - Get cow details
- `POST /api/cows` - Post cow for sale
- `PUT /api/cows/:id` - Update listing
- `DELETE /api/cows/:id` - Delete listing

### AI Chatbot
- `POST /api/chat` - Send message to AI
- `DELETE /api/chat/history` - Clear chat history

### Certifications
- `POST /api/certifications` - Upload certification
- `GET /api/certifications/product/:id` - Get certification
- `PUT /api/certifications/:id/verify` - Verify (Admin)

### Admin
- `GET /api/admin/users` - Get all users
- `PUT /api/admin/users/:id/status` - Activate/deactivate user
- `PUT /api/admin/users/:id/kyc` - Verify KYC
- `GET /api/admin/products/pending` - Pending products
- `PUT /api/admin/products/:id/approve` - Approve product
- `GET /api/admin/certifications/pending` - Pending certifications
- `GET /api/admin/analytics` - Platform analytics

## 🎨 Features Highlights

### For Farmers
- List dairy products with quality certifications
- Post cattle for sale with health records
- Track orders and manage inventory
- Get AI assistance for farming queries

### For Consumers
- Buy fresh dairy products from verified farmers
- Subscribe to daily milk delivery
- Rate and review products
- Secure payment with Razorpay

### For Traders
- Buy and sell cattle
- Access to marketplace
- Negotiation features

### For Admins
- Comprehensive dashboard with analytics
- User and product management
- Quality certification verification
- Fraud monitoring

## 🌍 Multilingual Support

The platform supports:
- **English** - Default language
- **Hindi** (हिंदी) - For Hindi-speaking users
- **Marathi** (मराठी) - Regional language support

Users can switch languages easily from the navigation bar.

## 🔐 Security Features

- Password hashing with bcrypt
- JWT-based authentication
- Protected API routes
- Role-based access control
- Secure file uploads with Cloudinary
- Payment verification with Razorpay signatures

## 📱 Future Enhancements

1. **IoT Integration**
   - Smart sensors for cattle health monitoring
   - Real-time alerts for abnormal readings
   - Automated data collection

2. **Mobile App**
   - React Native mobile application
   - Voice-to-text for rural usability

3. **Advanced Features**
   - Real-time chat between buyers and sellers
   - Video calls for cattle inspection
   - Blockchain for supply chain transparency

## 📄 License

MIT License

## 👥 Contributors

Built for comprehensive dairy marketplace ecosystem.

## 📞 Support

For issues and questions, please open an issue on GitHub.

---

**Happy Trading! 🐄🥛**
