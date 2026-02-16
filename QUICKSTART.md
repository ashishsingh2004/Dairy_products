# Quick Start Guide

## Prerequisites Check
- ✅ Node.js installed (v14+)
- ✅ MongoDB running (local or Atlas connection string ready)
- ✅ API keys ready:
  - Cloudinary account
  - Razorpay account  
  - OpenAI API key

## Step 1: Configure Environment Variables

### Backend Configuration
Open `backend/.env` and update:
```env
MONGODB_URI=<your_mongodb_connection_string>
JWT_SECRET=<your_secure_secret>
CLOUDINARY_CLOUD_NAME=<your_cloudinary_name>
CLOUDINARY_API_KEY=<your_key>
CLOUDINARY_API_SECRET=<your_secret>
RAZORPAY_KEY_ID=<your_razorpay_key>
RAZORPAY_KEY_SECRET=<your_razorpay_secret>
OPENAI_API_KEY=<your_openai_key>
```

### Frontend Configuration
The frontend `.env` is already configured for local development.

## Step 2: Start the Application

Open TWO terminal windows:

### Terminal 1 - Backend (Port 5000)
```bash
cd backend
npm run dev
```

You should see: "Server running on port 5000" and "MongoDB Connected"

### Terminal 2 - Frontend (Port 3000)
```bash
cd frontend
npm start
```

Browser will automatically open to http://localhost:3000

## Step 3: Test the Application

1. **Register a new account**
   - Navigate to http://localhost:3000/register
   - Choose your role (Farmer/Consumer/Trader)
   - Complete registration

2. **Explore Features**
   - Browse products at /products
   - Check cow trading at /cows
   - Try AI chatbot in dashboard
   - Test multilingual support (EN/HI/MR)

## Troubleshooting

### MongoDB Connection Error
- Make sure MongoDB is running locally OR
- Use MongoDB Atlas connection string

### Port Already in Use
- Backend: Change `PORT` in backend/.env
- Frontend: It will prompt you to use a different port

### API Errors
- Check that backend is running on port 5000
- Verify environment variables are set correctly

## What's Working Now

✅ User authentication (register/login)
✅ Product marketplace with filters
✅ Cow trading listings
✅ AI chatbot assistant
✅ Order management
✅ Multilingual support (3 languages)
✅ Role-based access control

## Next Steps for Production

1. Set up MongoDB Atlas for cloud database
2. Deploy backend to Heroku/Railway/AWS
3. Deploy frontend to Vercel/Netlify
4. Configure production environment variables
5. Set up SSL certificates
6. Enable email notifications

Enjoy your dairy marketplace platform! 🥛🐄

