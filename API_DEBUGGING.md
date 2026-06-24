# API Configuration - Debugging Checklist

## The Core Issue

Your frontend is making requests to:
- ❌ `https://vconect-properties-1.onrender.com/properties` 
- ✅ Should be: `https://vconect-properties-1.onrender.com/api/properties`

This means **`NEXT_PUBLIC_API_URL` is NOT being recognized by Vercel**.

---

## Step-by-Step Fix

### Step 1: Verify Vercel Environment Variable
1. Go to **https://vercel.com/dashboard**
2. Click on `vconect-properties` project
3. Click **Settings** (top menu)
4. Click **Environment Variables** (left sidebar)
5. **Look for**: `NEXT_PUBLIC_API_URL`
6. **Verify the value**: `https://vconect-properties-1.onrender.com/api`
   - Must have `/api` at the end
   - Must be the FULL URL

**If it's missing or wrong:**
- Add/Update it with: `https://vconect-properties-1.onrender.com/api`
- Make sure "Production" is selected in the environment dropdown

### Step 2: CRITICAL - Redeploy the Frontend
1. In Vercel dashboard, click **Deployments** (top menu)
2. Find the latest deployment (top of the list)
3. Click the **...** (three dots) on the right
4. Click **Redeploy**
5. **Wait 3-5 minutes** for the build to complete
6. Status should change from "Building" to "Ready"

### Step 3: Verify the Fix in Browser
1. Open: **https://vconect-properties.vercel.app/**
2. Open DevTools: **F12** → **Console** tab
3. **You should see**:
   ```
   🔍 API Configuration:
     NEXT_PUBLIC_API_URL: https://vconect-properties-1.onrender.com/api
     Final baseURL: https://vconect-properties-1.onrender.com/api
   ```

**If you see**:
```
   NEXT_PUBLIC_API_URL: undefined
```
→ Environment variable NOT set in Vercel. Go back to Step 1.

### Step 4: Clear Browser Cache
- Press: **Ctrl + Shift + Delete** (Windows) or **Cmd + Shift + Delete** (Mac)
- Select "Cookies and cached images/files"
- Click "Clear data"
- Refresh the page: **F5** or **Cmd + R**

### Step 5: Test the Endpoints
Open browser Console (F12) and run:
```javascript
// Test featured properties
fetch('https://vconect-properties-1.onrender.com/api/properties?isFeatured=true&limit=1')
  .then(r => r.json())
  .then(d => console.log('Featured:', d))
  .catch(e => console.error('Error:', e))

// Test latest listings
fetch('https://vconect-properties-1.onrender.com/api/properties?status=active&sort=newest&limit=1')
  .then(r => r.json())
  .then(d => console.log('Latest:', d))
  .catch(e => console.error('Error:', e))
```

Both should return property data, not "Route not found".

---

## Troubleshooting

### Issue: Still showing "Route not found"

**Solution checklist**:
1. ✅ Environment variable has `/api` suffix? 
2. ✅ Did you click "Redeploy" (not just "Deploy")?
3. ✅ Did you wait for build to complete?
4. ✅ Did you clear browser cache (Ctrl+Shift+Delete)?
5. ✅ Did you hard refresh (Ctrl+F5)?

### Issue: Still shows "NEXT_PUBLIC_API_URL: undefined" in console

**Solution**:
- Vercel dashboard might have a UI lag
- Try waiting 10 minutes
- Try logging out and back in to Vercel dashboard
- Try setting the variable again (delete and recreate)

### Issue: Getting CORS errors

**Solution**:
- Check Render backend: Settings → Environment Variables
- Verify: `FRONTEND_URL=https://vconect-properties.vercel.app`
- Go to Render dashboard → Your service
- Click **Manual Deploy** to redeploy backend

---

## Expected Result

Once fixed, you should see:
- ✅ Featured Properties loading
- ✅ Latest Listings loading
- ✅ Sign in/up endpoints working
- ✅ No "Route not found" errors
- ✅ Network requests going to correct URLs

---

## Quick Reference

| Component | URL |
|-----------|-----|
| Backend API | https://vconect-properties-1.onrender.com |
| Backend Health | https://vconect-properties-1.onrender.com/health |
| Frontend | https://vconect-properties.vercel.app |
| Vercel Dashboard | https://vercel.com/dashboard |
| Render Dashboard | https://dashboard.render.com |

---

## Key Reminders

⚠️ **Environment variables MUST be set in platform dashboards**, not in `.env` files for production!

⚠️ **After changing environment variables, you MUST redeploy** for changes to take effect!

⚠️ **Redeployment takes 3-5 minutes** - be patient!

⚠️ **Browser cache needs to be cleared** after redeploy!
