# 🚀 StarGPT Deployment Guide

This guide covers multiple deployment options for your StarGPT application.

## 📋 Pre-Deployment Checklist

- ✅ MongoDB Atlas database set up
- ✅ Gemini API key obtained
- ✅ Code pushed to GitHub
- ✅ Environment variables ready

## 🌟 Recommended: Railway (Full-Stack)

**Best for beginners - deploys both frontend and backend together**

### Steps:
1. Go to [Railway.app](https://railway.app)
2. Sign up with GitHub
3. **New Project → Deploy from GitHub repo**
4. Select your `starGPT` repository
5. **Add Environment Variables:**
   ```
   GEMINI_API_KEY=your_api_key
   GEMINI_MODEL=gemini-2.5-flash-lite
   MONGO_URI=your_mongodb_connection_string
   JWT_SECRET=your_jwt_secret
   NODE_ENV=production
   ```
6. Railway will automatically detect and deploy both services

---

## 🔥 Option 2: Vercel + Railway (Separate Services)

### Frontend on Vercel:
1. Go to [Vercel.com](https://vercel.com)
2. **New Project → Import Git Repository**
3. Select your repo
4. **Framework Preset:** Vite
5. **Root Directory:** `frontend`
6. **Build Command:** `npm run build`
7. **Output Directory:** `dist`
8. **Environment Variables:**
   ```
   VITE_API_URL=https://your-backend-url.railway.app
   ```

### Backend on Railway:
1. Go to [Railway.app](https://railway.app)
2. **New Project → Deploy from GitHub repo**
3. **Root Directory:** `backend`
4. Add all environment variables listed above

---

## 🌐 Option 3: Netlify + Render

### Frontend on Netlify:
1. Go to [Netlify.com](https://netlify.com)
2. **New site from Git**
3. **Base directory:** `frontend`
4. **Build command:** `npm run build`
5. **Publish directory:** `frontend/dist`

### Backend on Render:
1. Go to [Render.com](https://render.com)
2. **New → Web Service**
3. **Root Directory:** `backend`
4. **Build Command:** `npm install`
5. **Start Command:** `npm start`

---

## 🔴 Option 4: Heroku (Traditional)

### Prerequisites:
```bash
npm install -g heroku
heroku login
```

### Deploy:
```bash
# Create Heroku app
heroku create your-stargpt-app

# Add environment variables
heroku config:set GEMINI_API_KEY=your_api_key
heroku config:set GEMINI_MODEL=gemini-2.5-flash-lite
heroku config:set MONGO_URI=your_mongodb_connection_string
heroku config:set JWT_SECRET=your_jwt_secret
heroku config:set NODE_ENV=production

# Deploy
git push heroku main
```

---

## 🗄️ Database Setup (MongoDB Atlas)

1. Go to [MongoDB Atlas](https://cloud.mongodb.com)
2. Create a free cluster
3. **Database Access → Add Database User**
4. **Network Access → Add IP Address** (0.0.0.0/0 for all)
5. **Connect → Connect your application**
6. Copy the connection string

---

## 🔑 Environment Variables for Production

```env
# Required for all deployments
GEMINI_API_KEY=your_gemini_api_key
GEMINI_MODEL=gemini-2.5-flash-lite
MONGO_URI=mongodb+srv://username:password@cluster.mongodb.net/stargpt
JWT_SECRET=your_super_secure_jwt_secret_here
NODE_ENV=production
PORT=5000

# Optional
CORS_ORIGIN=https://your-frontend-domain.com
```

---

## 🔧 Frontend API Configuration

Update your frontend API base URL for production:

**Create `frontend/src/config.js`:**
```javascript
const config = {
  API_BASE_URL: process.env.NODE_ENV === 'production' 
    ? 'https://your-backend-url.com/api'
    : 'http://localhost:5000/api'
};

export default config;
```

---

## ✅ Post-Deployment Checklist

- [ ] Frontend loads correctly
- [ ] Backend health check works (`/health`)
- [ ] User registration/login works
- [ ] Chat functionality works
- [ ] Environment variables are set
- [ ] HTTPS is enabled
- [ ] Database connection is working

---

## 🐛 Common Deployment Issues

### 1. **Build Fails**
```
Error: Module not found
```
**Solution:** Make sure all dependencies are in `package.json`

### 2. **API Connection Failed**
```
Network Error
```
**Solution:** Check CORS settings and API URL configuration

### 3. **Database Connection Error**
```
MongoNetworkError
```
**Solution:** Verify MongoDB Atlas IP whitelist and connection string

### 4. **Environment Variables Not Working**
```
undefined is not a function
```
**Solution:** Double-check all environment variables are set in deployment platform

---

## 🚀 Quick Deploy Commands

**Railway:**
```bash
npm install -g @railway/cli
railway login
railway link
railway up
```

**Vercel:**
```bash
npm install -g vercel
cd frontend
vercel --prod
```

**Heroku:**
```bash
git add .
git commit -m "Deploy to production"
git push heroku main
```

---

## 📊 Monitoring Your Deployment

- **Railway:** Built-in logs and metrics
- **Vercel:** Analytics dashboard
- **Heroku:** `heroku logs --tail`
- **Render:** Real-time logs in dashboard

---

## 🔄 Continuous Deployment

Most platforms support automatic deployment when you push to GitHub:

1. **Connect your GitHub repository**
2. **Enable auto-deploy from main branch**
3. **Set up environment variables**
4. **Push changes to trigger deployment**

---

Your StarGPT is now ready for the world! 🌍✨