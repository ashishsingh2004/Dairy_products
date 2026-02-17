---
description: Deploy application to production
---

# Dairy Marketplace Deployment Workflow

This workflow guides you through deploying the application to production using free hosting platforms.

## Prerequisites

Before deploying, ensure you have:
- ✅ All code committed to GitHub repository
- ✅ Production environment variables ready (see `.env.example` files)
- ✅ Accounts created on required platforms

---

## Phase 1: Set Up Cloud Services

### 1. MongoDB Atlas (Database)

1. Visit [mongodb.com/cloud/atlas](https://www.mongodb.com/cloud/atlas)
2. Sign up for free account
3. Create new cluster:
   - Choose **FREE** M0 tier
   - Select region closest to you
   - Click "Create Cluster"
4. Create database user:
   - Go to "Database Access"
   - Click "Add New Database User"
   - Choose password authentication
   - Set username and strong password
   - Grant "Read and write to any database" role
5. Whitelist IP addresses:
   - Go to "Network Access"
   - Click "Add IP Address"
   - Choose "Allow Access from Anywhere" (0.0.0.0/0)
   - Click "Confirm"
6. Get connection string:
   - Click "Connect" on your cluster
   - Choose "Connect your application"
   - Copy the connection string
   - Replace `<password>` with your database user password
   - Replace `myFirstDatabase` with `dairydb`

**Example**: `mongodb+srv://dbuser:mypassword@cluster0.xxxxx.mongodb.net/dairydb?retryWrites=true&w=majority`

### 2. Cloudinary (Image Storage)

1. Visit [cloudinary.com](https://cloudinary.com)
2. Sign up for free account
3. Go to Dashboard
4. Copy the following:
   - Cloud Name
   - API Key
   - API Secret

### 3. Razorpay (Payment Gateway)

1. Visit [razorpay.com](https://razorpay.com)
2. Sign up for account
3. Go to Settings > API Keys
4. Start with **Test Mode** keys (no KYC required):
   - Copy Key ID (starts with `rzp_test_`)
   - Copy Key Secret
5. For production mode (later):
   - Complete KYC verification
   - Generate Live mode keys

### 4. OpenAI API

1. Visit [platform.openai.com](https://platform.openai.com)
2. Sign up / Login
3. Go to Billing and add payment method
4. Go to API Keys section
5. Create new secret key
6. Copy the key (starts with `sk-`)

---

## Phase 2: Deploy Backend (Render)

### 1. Create Render Account

1. Visit [render.com](https://render.com)
2. Sign up with GitHub account
3. Authorize Render to access your repositories

### 2. Create Web Service

1. Click "New +" → "Web Service"
2. Connect your GitHub repository
3. Configure service:
   - **Name**: `dairy-marketplace-api` (or your choice)
   - **Region**: Choose closest to you
   - **Branch**: `main` (or your default branch)
   - **Root Directory**: `backend`
   - **Environment**: `Node`
   - **Build Command**: `npm install`
   - **Start Command**: `npm start`
   - **Instance Type**: `Free`

### 3. Add Environment Variables

Click "Advanced" → "Add Environment Variable" and add each:

```
NODE_ENV=production
PORT=5000
MONGODB_URI=<your-mongodb-atlas-connection-string>
JWT_SECRET=<generate-random-32-char-string>
CLOUDINARY_CLOUD_NAME=<your-cloudinary-cloud-name>
CLOUDINARY_API_KEY=<your-cloudinary-api-key>
CLOUDINARY_API_SECRET=<your-cloudinary-api-secret>
RAZORPAY_KEY_ID=<your-razorpay-key-id>
RAZORPAY_KEY_SECRET=<your-razorpay-key-secret>
OPENAI_API_KEY=<your-openai-api-key>
FRONTEND_URL=https://your-app-name.vercel.app
```

**Note**: For `JWT_SECRET`, generate a secure random string. You can use a password generator or run in terminal:
```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

### 4. Deploy Backend

1. Click "Create Web Service"
2. Wait for deployment (first deploy takes 5-10 minutes)
3. Once deployed, copy your backend URL:
   - Format: `https://dairy-marketplace-api.onrender.com`
4. Test backend: Visit `https://your-backend-url.onrender.com`
   - Should see welcome message with API endpoints

---

## Phase 3: Deploy Frontend (Vercel)

### 1. Create Vercel Account

1. Visit [vercel.com](https://vercel.com)
2. Sign up with GitHub account
3. Authorize Vercel to access repositories

### 2. Import Project

1. Click "Add New..." → "Project"
2. Import your GitHub repository
3. Configure project:
   - **Framework Preset**: Create React App
   - **Root Directory**: `frontend`
   - **Build Command**: `npm run build` (auto-detected)
   - **Output Directory**: `build` (auto-detected)

### 3. Add Environment Variables

Click "Environment Variables" and add:

```
REACT_APP_API_URL=https://your-backend-url.onrender.com/api
REACT_APP_RAZORPAY_KEY_ID=<your-razorpay-key-id>
```

**Important**: Replace `your-backend-url` with your actual Render backend URL from Phase 2.

### 4. Deploy Frontend

1. Click "Deploy"
2. Wait for build (takes 2-3 minutes)
3. Once deployed, get your frontend URL:
   - Format: `https://dairy-marketplace.vercel.app`

### 5. Update Backend CORS

1. Go back to Render dashboard
2. Open your backend service
3. Go to Environment variables
4. Update `FRONTEND_URL` to your Vercel URL:
   ```
   FRONTEND_URL=https://your-actual-app.vercel.app
   ```
5. Save changes (backend will auto-redeploy)

---

## Phase 4: Verification

### Test Basic Functionality

1. Open your Vercel frontend URL in browser
2. **Test Registration**:
   - Go to Register page
   - Create new account (choose role: Farmer/Consumer/Trader)
   - Should successfully create account
3. **Test Login**:
   - Login with your credentials
   - Should redirect to dashboard
4. **Test Marketplace**:
   - Browse products
   - Try search and filters
5. **Test Language Switching**:
   - Switch between English, Hindi, Marathi
   - Verify translations work

### Check Backend Logs

1. In Render dashboard, click "Logs"
2. Verify:
   - ✅ "Server running on port 5000"
   - ✅ "MongoDB Connected"
   - ✅ No error messages

### Check Database

1. In MongoDB Atlas, go to "Browse Collections"
2. Should see `dairydb` database with collections:
   - users
   - products (if any created)
   - orders (if any created)

---

## Troubleshooting

### Backend Issues

**Problem**: Backend not connecting to MongoDB
- Check MongoDB Atlas Network Access whitelist
- Verify connection string has correct password
- Check Render logs for specific error

**Problem**: 500 errors on API calls
- Check Render logs for error details
- Verify all environment variables are set
- Check database connection

### Frontend Issues

**Problem**: Cannot connect to backend
- Verify `REACT_APP_API_URL` is correct
- Check backend is deployed and running
- Open browser console for error details

**Problem**: Payment not working
- Verify you're using Razorpay TEST keys initially
- Check Razorpay key ID matches in both backend and frontend

---

## Future Deployments

### Update Backend

Render auto-deploys on GitHub push:
1. Make changes locally
2. Commit and push to GitHub
3. Render automatically rebuilds

### Update Frontend

Vercel auto-deploys on GitHub push:
1. Make changes locally
2. Commit and push to GitHub
3. Vercel automatically rebuilds

---

## Production Checklist

Before going fully live:
- [ ] Switch Razorpay from TEST to LIVE keys (after KYC)
- [ ] Set up custom domain (optional)
- [ ] Enable SSL certificate (auto by Vercel/Render)
- [ ] Set up monitoring and alerts
- [ ] Configure backup strategy for MongoDB
- [ ] Review security settings
- [ ] Test all critical user flows

---

**Deployment Complete! 🎉**

Your application is now live at:
- Frontend: `https://your-app.vercel.app`
- Backend: `https://your-api.onrender.com`
