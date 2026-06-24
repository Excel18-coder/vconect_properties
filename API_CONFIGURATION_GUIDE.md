# Verification Steps for API Configuration

## Issue: "Route not found" errors

The frontend is trying to fetch from the wrong URLs. This is a **Vercel environment variable issue**.

### ✅ What to do:

1. **Go to Vercel Dashboard**
   - https://vercel.com/dashboard

2. **Select your project:** `vconect-properties`

3. **Go to Settings → Environment Variables**

4. **Verify the variable is set:**
   - Name: `NEXT_PUBLIC_API_URL`
   - Value: `https://vconect-properties-1.onrender.com/api`
   - Environment: `Production` (checked)

5. **IMPORTANT: Click "Redeploy"**
   - Go to Deployments tab
   - Find the latest deployment
   - Click the "..." menu
   - Select "Redeploy"
   - **Wait for the build to complete** (3-5 minutes)

### 🔍 Verify it worked:

1. Open your Vercel frontend: https://vconect-properties.vercel.app/
2. Open Browser DevTools (F12)
3. Go to Console tab
4. You should see: `API Base URL: https://vconect-properties-1.onrender.com/api`
5. If you see `localhost`, the environment variable isn't being used

### ✅ Backend is working:
- Health: https://vconect-properties-1.onrender.com/health ✅
- API: https://vconect-properties-1.onrender.com/api/properties ✅

### ⚠️ Common Issues:

**Issue:** Console shows `API Base URL: http://localhost:5000/api`
- **Solution:** Environment variable not set in Vercel
- Go to Vercel → Settings → Environment Variables
- Make sure `NEXT_PUBLIC_API_URL` is set to the Render URL

**Issue:** Still seeing "Route not found" after redeploy
- Clear browser cache (Ctrl+Shift+Delete)
- Wait 5 minutes for Vercel cache to clear
- Hard refresh (Ctrl+F5)

### 📝 Environment Variables Summary:

**Vercel Frontend (Set in Dashboard):**
- `NEXT_PUBLIC_API_URL` = `https://vconect-properties-1.onrender.com/api`

**Render Backend (Set in Dashboard):**
- `FRONTEND_URL` = `https://vconect-properties.vercel.app`
- `MONGO_URI` = Your MongoDB connection string
- `JWT_SECRET` = Your JWT secret
- All other variables as configured

---

**The key is: ALWAYS set environment variables in the platform's dashboard, not in .env files in production!**
