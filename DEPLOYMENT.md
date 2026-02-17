# 🚀 Deployment Guide - Quick Reference

## Your Application Stack
- **Frontend**: React (deployed on Vercel)
- **Backend**: Node.js/Express (deployed on Render)
- **Database**: MongoDB Atlas
- **Services**: Cloudinary, Razorpay, OpenAI

---

## 📋 Step-by-Step Deployment

### 1️⃣ Set Up Cloud Services (30 mins)

#### MongoDB Atlas
1. Sign up: [mongodb.com/cloud/atlas](https://www.mongodb.com/cloud/atlas)
2. Create M0 FREE cluster
3. Database Access → Create user with password
4. Network Access → Allow 0.0.0.0/0
5. Copy connection string, replace password & database name with `dairydb`

#### Cloudinary
1. Sign up: [cloudinary.com](https://cloudinary.com)
2. Copy from Dashboard: Cloud Name, API Key, API Secret

#### Razorpay
1. Sign up: [razorpay.com](https://razorpay.com)
2. Use **Test Mode** keys (Settings → API Keys)
3. Copy: Key ID (`rzp_test_xxx`) and Secret

#### OpenAI
1. Sign up: [platform.openai.com](https://platform.openai.com)
2. Add billing method
3. Create API key (starts with `sk-`)

---

### 2️⃣ Deploy Backend to Render (20 mins)

1. **Sign up**: [render.com](https://render.com) with GitHub
2. **New Web Service** → Connect your repo
3. **Configure**:
   - Name: `dairy-marketplace-api`
   - Root Directory: `backend`
   - Build: `npm install`
   - Start: `npm start`
   - Free tier
4. **Add Environment Variables**:
   ```
   NODE_ENV=production
   PORT=5000
   MONGODB_URI=<from-mongodb-atlas>
   JWT_SECRET=<random-32-char-string>
   CLOUDINARY_CLOUD_NAME=<from-cloudinary>
   CLOUDINARY_API_KEY=<from-cloudinary>
   CLOUDINARY_API_SECRET=<from-cloudinary>
   RAZORPAY_KEY_ID=<from-razorpay>
   RAZORPAY_KEY_SECRET=<from-razorpay>
   OPENAI_API_KEY=<from-openai>
   FRONTEND_URL=https://your-app.vercel.app
   ```
5. **Deploy** → Copy your backend URL

---

### 3️⃣ Deploy Frontend to Vercel (15 mins)

1. **Sign up**: [vercel.com](https://vercel.com) with GitHub
2. **Import Project** → Select your repo
3. **Configure**:
   - Framework: Create React App
   - Root Directory: `frontend`
4. **Add Environment Variables**:
   ```
   REACT_APP_API_URL=https://your-backend.onrender.com/api
   REACT_APP_RAZORPAY_KEY_ID=<your-razorpay-test-key>
   ```
5. **Deploy** → Get your frontend URL

---

### 4️⃣ Update Backend CORS (5 mins)

1. Go back to Render → Your service
2. Update environment variable:
   ```
   FRONTEND_URL=https://your-actual-frontend.vercel.app
   ```
3. Service will auto-redeploy

---

## ✅ Verification Checklist

Visit your Vercel URL and test:
- [ ] Registration page works
- [ ] Login successful
- [ ] Products page loads
- [ ] Language switching (EN/HI/MR)
- [ ] AI chatbot responds (if OpenAI configured)

Check Render logs:
- [ ] "Server running on port 5000"
- [ ] "MongoDB Connected"

---

## 🔧 Troubleshooting

**Backend won't start**: Check Render logs for errors
**MongoDB connection failed**: Verify Network Access allows 0.0.0.0/0
**Frontend can't reach API**: Check REACT_APP_API_URL in Vercel
**CORS errors**: Verify FRONTEND_URL matches Vercel URL exactly

---

## 📝 After Deployment

- Frontend URL: `https://your-app.vercel.app`
- Backend URL: `https://your-api.onrender.com`
- Auto-deploys on GitHub push

For detailed instructions, see: [.agent/workflows/deploy.md](file:///c:/Users/ashis/Desktop/Dairyproduct%20project/.agent/workflows/deploy.md)
