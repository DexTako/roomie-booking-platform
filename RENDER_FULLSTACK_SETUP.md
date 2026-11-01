# 🚀 Render Full-Stack Deployment Guide

## Overview
Deploy both frontend and backend together on Render. The backend serves the React frontend as static files.

**Benefits:**
- ✅ Single deployment URL
- ✅ No CORS issues (same domain)
- ✅ Simpler configuration
- ✅ Free tier includes both

---

## 📋 Prerequisites

1. GitHub repository pushed: ✅ https://github.com/DexTako/roomie-booking-platform
2. MongoDB Atlas database: ✅ Already configured
3. Render account: ✅ Already have backend running

---

## 🎯 Deployment Steps

### Option 1: Update Existing Backend Service (Recommended)

Since you already have a backend running at `https://roomie-booking-platform.onrender.com`, let's update it to serve the frontend too:

1. **Go to your Render service:**
   https://dashboard.render.com/web/srv-db1oaqdg1s2s73b4cvk0

2. **Update Settings:**
   - Click "Settings" tab
   - Scroll to "Build & Deploy"
   - Change **Root Directory** from `roomie-backend` to `.` (root)
   - Change **Build Command** to:
     ```bash
     cd roomie-backend && npm install && cd ../roomie-prototype && npm install && npm run build
     ```
   - Keep **Start Command** as:
     ```bash
     cd roomie-backend && npm start
     ```
   - Click "Save Changes"

3. **Update Environment Variables:**
   - Click "Environment" tab
   - Update `FRONTEND_URL` to: `https://roomie-booking-platform.onrender.com`
   - Keep all other variables the same
   - Click "Save Changes"

4. **Trigger Manual Deploy:**
   - Click "Manual Deploy" > "Deploy latest commit"
   - Wait 2-3 minutes for build to complete

5. **Test:**
   - Open: https://roomie-booking-platform.onrender.com
   - Should show your React frontend
   - API at: https://roomie-booking-platform.onrender.com/api

---

### Option 2: Create New Full-Stack Service (Alternative)

If you prefer a fresh start:

1. **Create New Web Service:**
   - Go to Render Dashboard
   - Click "New +" > "Web Service"
   - Connect to GitHub repo: `DexTako/roomie-booking-platform`

2. **Configure Service:**
   - **Name**: `roomie-fullstack`
   - **Region**: Singapore
   - **Branch**: main
   - **Root Directory**: `.` (leave empty/root)
   - **Runtime**: Node
   - **Build Command**:
     ```bash
     cd roomie-backend && npm install && cd ../roomie-prototype && npm install && npm run build
     ```
   - **Start Command**:
     ```bash
     cd roomie-backend && npm start
     ```
   - **Plan**: Free

3. **Add Environment Variables:**
   ```
   NODE_ENV=production
   NODE_VERSION=20
   MONGODB_URI=mongodb+srv://dexrodueldeguzman_db_user:BcSvSWBrmtYPA6OW@roomie-booking.aiqjbmz.mongodb.net/roomie-booking?retryWrites=true&w=majority
   JWT_SECRET=roomie_booking_jwt_super_secret_key_2024_production_ready
   FRONTEND_URL=https://roomie-fullstack.onrender.com
   GCASH_NUMBER=09454699002
   GCASH_ACCOUNT_NAME=Tyron Rex Manalo
   EMAIL_HOST=smtp.gmail.com
   EMAIL_PORT=587
   EMAIL_USER=dexrodueldeguzman@gmail.com
   EMAIL_PASS=unvrxkogykywckuw
   EMAIL_FROM=Roomie <dexrodueldeguzman@gmail.com>
   ```

4. **Click "Create Web Service"**

5. **Wait for deployment** (~3-5 minutes)

6. **Delete old backend-only service** (optional, to avoid confusion)

---

## ✅ Verification Checklist

After deployment completes:

- [ ] Frontend loads: https://roomie-booking-platform.onrender.com/
- [ ] API responds: https://roomie-booking-platform.onrender.com/api
- [ ] Health check: https://roomie-booking-platform.onrender.com/health
- [ ] View rooms page loads
- [ ] Sign up creates account
- [ ] Login works
- [ ] Booking flow completes
- [ ] Email notifications send
- [ ] 3D room viewer works (Room 1, 2)
- [ ] Payment methods work
- [ ] Receipt generation works

---

## 🗄️ Seed Database

Once deployed, seed the production database:

### Option A: Local Seed (Recommended)
```bash
cd roomie-backend
# Make sure .env has production MONGODB_URI
node scripts/seedDatabase.js
```

### Option B: Render Shell
1. Go to service dashboard
2. Click "Shell" tab
3. Run:
```bash
cd roomie-backend
node scripts/seedDatabase.js
```

---

## 🎨 Update Vercel (Optional)

If you want to keep Vercel as backup:

1. Add environment variable:
   - `VITE_API_URL=https://roomie-booking-platform.onrender.com/api`
2. Redeploy

Or just delete the Vercel deployment and use only Render.

---

## 🚨 Important Notes

### Room 3 Large Model (469MB)
- Not included in Git (too large)
- Team needs to extract from zip locally for development
- For production demo, either:
  - Upload to Render manually (if possible)
  - Disable Room 3 3D viewer for presentation
  - Host the GLB file on external storage (Cloudinary, S3)

### First Request After Sleep
- Free tier sleeps after 15 min inactivity
- First request takes 30-50 seconds to wake up
- Before presentation, wake it up by visiting the site

### Demo Accounts
Create these before presentation:
```bash
# In Render Shell or locally:
cd roomie-backend
node scripts/createAdminUser.js
```

Or manually via sign up + MongoDB Atlas role change.

---

## 🔧 Troubleshooting

### Build fails
- Check Render logs for errors
- Verify package.json in both folders
- Make sure node_modules are in .gitignore

### Frontend shows but API 404
- Check server.js has the static file serving code
- Verify build command completed successfully
- Check Render logs for errors

### CORS errors
- Update FRONTEND_URL to match your Render URL exactly
- Restart service after env var changes

### Database connection fails
- Check MongoDB Atlas IP whitelist (add 0.0.0.0/0 for Render)
- Verify MONGODB_URI is correct
- Check connection string has proper credentials

---

## 📊 Current Status

✅ **Backend**: Running at https://roomie-booking-platform.onrender.com
⏳ **Frontend**: Need to update to full-stack deployment
⏳ **Database**: Need to seed rooms

**Next Step**: Follow Option 1 above to update your existing service!

---

## 🎯 After Deployment

1. Seed the database
2. Create demo accounts
3. Test all features
4. Share the single URL with your team
5. Present with confidence! 🎉

**Single URL for everything**: https://roomie-booking-platform.onrender.com
