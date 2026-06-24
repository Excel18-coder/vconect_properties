# VConnect Properties - Complete Redeployment Guide

This guide walks you through redeploying your project to Render (backend) and Vercel (frontend).

---

## Prerequisites

Before starting, ensure you have:
- GitHub account with your repository
- Render account (https://render.com)
- Vercel account (https://vercel.com)
- Git installed and configured

---

## Phase 1: Deploy Backend to Render

### Step 1: Push Latest Code to GitHub
```bash
cd /home/crash/Downloads/projects/vconect_properties
git add .
git commit -m "Deploy: backend and frontend setup"
git push origin main
```

### Step 2: Create New Web Service on Render

1. Go to https://dashboard.render.com
2. Click **"New +"** → Select **"Web Service"**
3. Connect your GitHub repository (select `vconect_properties`)
4. Configure the service:
   - **Name:** `vconect-properties-backend`
   - **Branch:** `main`
   - **Root Directory:** `backend`
   - **Runtime:** `Node`
   - **Build Command:** `npm install && npm run build`
   - **Start Command:** `npm start`

### Step 3: Add Environment Variables on Render

In the Render dashboard, go to **Environment** and add:

```
PORT=5000
NODE_ENV=production

MONGO_URI=mongodb+srv://vconectproperties_db_user:kBJdx9erlmYZfOOo@vconect.yil9kha.mongodb.net/?appName=vconect
JWT_SECRET=your_super_secret_jwt_key_change_in_production
JWT_EXPIRES_IN=7d

CLOUDINARY_CLOUD_NAME=jcdspfp0
CLOUDINARY_API_KEY=128227525181798
CLOUDINARY_API_SECRET=-DWiP0SUDyJiPwCjO4UFqta44B0

FRONTEND_URL=https://vconect-properties.vercel.app
```

### Step 4: Deploy Backend
- Click **"Create Web Service"**
- Wait for deployment to complete (5-10 minutes)
- You'll get a URL like: `https://vconect-properties-XXXX.onrender.com`
- **Note the URL** - you'll need it for the frontend

### Step 5: Verify Backend is Running
```bash
curl https://your-render-url.onrender.com/health
# Should return: {"status":"ok","timestamp":"..."}
```

---

## Phase 2: Deploy Frontend to Vercel

### Step 1: Create New Project on Vercel

1. Go to https://vercel.com/dashboard
2. Click **"Add New"** → **"Project"**
3. Select your GitHub repository `vconect_properties`
4. Configure the project:
   - **Framework Preset:** Next.js
   - **Root Directory:** `frontend`
   - **Build Command:** `next build`
   - **Output Directory:** `.next`

### Step 2: Add Environment Variables on Vercel

In the Vercel project settings, go to **Settings → Environment Variables** and add:

```
NEXT_PUBLIC_API_URL=https://your-render-url.onrender.com/api
```

**Replace `your-render-url` with your actual Render backend URL from Step 1.4**

### Step 3: Deploy Frontend
- Click **"Deploy"**
- Wait for deployment to complete (3-5 minutes)
- You'll get a URL like: `https://vconect-properties.vercel.app`

### Step 4: Verify Frontend is Running
- Visit your Vercel URL in browser
- Check browser console for any errors
- Verify data is loading (Featured Properties, Latest Listings)

---

## Phase 3: Update Backend CORS for Frontend URL

### Step 1: Get Your Final Vercel URL
After frontend deploys, you'll have your final Vercel URL.

### Step 2: Update Backend (if URL changed)
Edit [backend/src/server.ts](backend/src/server.ts) and ensure your Vercel URL is in the `allowedOrigins`:

```typescript
const allowedOrigins = [
    'https://vconect-properties.vercel.app',  // Your Vercel URL
    'http://localhost:3000',
    'http://localhost:3001',
    'http://localhost:5173',
    process.env.FRONTEND_URL
].filter(Boolean);
```

### Step 3: Push and Redeploy Backend (if changed)
```bash
git add backend/src/server.ts
git commit -m "Update CORS with new Vercel URL"
git push origin main
```

Render will auto-redeploy. Wait 2-3 minutes.

---

## Verification Checklist

### ✅ Backend Verification
```bash
# Test health endpoint
curl https://your-render-url.onrender.com/health

# Test properties endpoint
curl "https://your-render-url.onrender.com/api/properties?limit=1"

# Test auth endpoint
curl -X POST "https://your-render-url.onrender.com/api/auth/login" \
  -H "Content-Type: application/json" \
  -d '{"email":"test@test.com","password":"test"}'
```

### ✅ Frontend Verification
1. Visit your Vercel URL
2. Check **Browser Console** (F12 → Console)
3. Verify no "Route not found" errors
4. Check that:
   - ✅ Featured Properties section is loading
   - ✅ Latest Listings section is loading
   - ✅ Navigation works
   - ✅ Sign In / Sign Up buttons work

### ✅ Connection Test
1. Click "Sign In"
2. Try entering credentials
3. Check Network tab (F12 → Network)
4. Verify requests go to your Render backend URL
5. Check response status is not 404

---

## Troubleshooting

### Issue: "Route not found" errors in console

**Solution:** 
1. Go to Vercel project settings
2. Verify `NEXT_PUBLIC_API_URL` is set correctly
3. Check it matches your Render backend URL with `/api` suffix
4. Redeploy frontend: Click "Redeploy" button

### Issue: CORS errors

**Solution:**
1. Check Render environment variable `FRONTEND_URL`
2. It should match your Vercel URL exactly
3. Redeploy backend after updating

### Issue: Backend not responding

**Solution:**
1. Check Render logs: Dashboard → Select service → Logs
2. Verify all environment variables are set
3. Check MongoDB URI is correct
4. Try manual redeploy from Render dashboard

### Issue: Cloudinary not working

**Solution:**
1. Verify Cloudinary credentials in Render environment:
   - `CLOUDINARY_CLOUD_NAME`
   - `CLOUDINARY_API_KEY`
   - `CLOUDINARY_API_SECRET`
2. Check they're exactly as provided

---

## Environment Variables Reference

### Backend (.env file or Render settings)
| Variable | Value | Required |
|----------|-------|----------|
| PORT | 5000 | Yes |
| NODE_ENV | production | Yes |
| MONGO_URI | Your MongoDB connection string | Yes |
| JWT_SECRET | Secret key for tokens | Yes |
| JWT_EXPIRES_IN | 7d | No |
| CLOUDINARY_CLOUD_NAME | Your Cloudinary cloud name | Yes |
| CLOUDINARY_API_KEY | Your Cloudinary API key | Yes |
| CLOUDINARY_API_SECRET | Your Cloudinary API secret | Yes |
| FRONTEND_URL | Your Vercel frontend URL | Yes |

### Frontend (.env.local or Vercel settings)
| Variable | Value | Required |
|----------|-------|----------|
| NEXT_PUBLIC_API_URL | `{RENDER_URL}/api` | Yes |

---

## Auto-Deployment Setup

### Render Auto-Deploy
- Automatically deploys when you push to `main` branch
- No configuration needed
- Check Render dashboard for build status

### Vercel Auto-Deploy
- Automatically deploys when you push to `main` branch
- Can also preview pull requests
- Check Vercel dashboard for build status

---

## Quick Reference URLs

After deployment, save these:
- **Backend:** https://vconect-properties-XXXX.onrender.com
- **Frontend:** https://vconect-properties.vercel.app
- **Render Dashboard:** https://dashboard.render.com
- **Vercel Dashboard:** https://vercel.com/dashboard

---

## Support

If you need help:
1. Check the troubleshooting section above
2. Review logs in Render/Vercel dashboards
3. Verify all environment variables are correct
4. Ensure MongoDB and Cloudinary credentials are valid

---

**Ready to deploy?** Start with **Phase 1** above!
