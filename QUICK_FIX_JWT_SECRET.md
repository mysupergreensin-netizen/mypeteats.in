# Quick Fix: JWT_SECRET Error on Vercel

## The Problem
You're seeing this error:
```
Error: JWT_SECRET is required in Vercel. Please set it in your Vercel environment variables.
```

This happens because the `JWT_SECRET` environment variable is not set in your Vercel deployment.

## Solution (5 Minutes)

### Step 1: Get Your JWT_SECRET Value

**Option A: Use the generated value (recommended)**
```
GYGPythPHb4BNg8wxluXIJcfELGXSxNu7FzZDxBBmdAHrFnAF0OrmCW7VAkWWt7j
```

**Option B: Generate a new one**
Run this PowerShell command:
```powershell
.\scripts\generate-jwt-secret-simple.ps1
```

### Step 2: Add to Vercel (IMPORTANT!)

1. **Go to Vercel Dashboard:**
   - Visit: https://vercel.com/dashboard
   - Click on your project: `mypeteats.in`

2. **Navigate to Environment Variables:**
   - Click **Settings** (in the top menu)
   - Click **Environment Variables** (in the left sidebar)

3. **Add JWT_SECRET:**
   - Click **Add New** button
   - **Key:** `JWT_SECRET`
   - **Value:** `GYGPythPHb4BNg8wxluXIJcfELGXSxNu7FzZDxBBmdAHrFnAF0OrmCW7VAkWWt7j`
   - **Environment:** 
     - ✅ Check **Production**
     - ✅ Check **Preview** 
     - ✅ Check **Development**
   - Click **Save**

4. **Also Add MONGODB_URI (if not already added):**
   - Click **Add New** again
   - **Key:** `MONGODB_URI`
   - **Value:** `mongodb+srv://Vercel-Admin-Vbt:<YOUR_PASSWORD>@vbt.htnlvqx.mongodb.net/store?retryWrites=true&w=majority&appName=Vbt`
     - Replace `<YOUR_PASSWORD>` with your actual MongoDB password (URL-encoded if it has special characters)
   - **Environment:** Production, Preview, Development
   - Click **Save**

### Step 3: REDEPLOY (CRITICAL!)

**You MUST redeploy after adding environment variables!**

**Option A: Redeploy from Dashboard (Fastest)**
1. Go to **Deployments** tab
2. Find the latest deployment
3. Click the **⋯** (three dots) menu
4. Click **Redeploy**
5. Wait for deployment to complete (2-3 minutes)

**Option B: Trigger by Push (Alternative)**
- Push any commit to your GitHub repository
- Vercel will automatically redeploy

### Step 4: Verify It's Fixed

1. **Wait for deployment to complete** (check the Deployments tab)
2. **Visit your site:** `https://your-project.vercel.app`
3. **Check health endpoint:** `https://your-project.vercel.app/api/health`
   - Should return: `{ "status": "healthy" }`
4. **Check function logs:**
   - Go to Deployments → Latest → Functions tab
   - Look for any errors
   - Should see: `[DB] Connected to MongoDB` (if MONGODB_URI is also set)

## Common Mistakes

❌ **Adding the variable but NOT redeploying**
- Environment variables only take effect after redeployment
- Always redeploy after adding/changing environment variables

❌ **Setting variable for wrong environment**
- Make sure you check **Production** when adding the variable
- Preview and Development are optional but recommended

❌ **Typo in variable name**
- Must be exactly: `JWT_SECRET` (case-sensitive)
- No spaces, no extra characters

❌ **Not waiting for deployment**
- Wait 2-3 minutes for deployment to complete
- Check the deployment status in Vercel dashboard

## Still Not Working?

1. **Double-check the variable is set:**
   - Go to Settings → Environment Variables
   - Verify `JWT_SECRET` is listed
   - Verify it's set for **Production** environment

2. **Check deployment logs:**
   - Go to Deployments → Latest deployment
   - Click on the deployment
   - Check the **Build Logs** and **Function Logs** tabs
   - Look for any errors

3. **Try redeploying again:**
   - Sometimes a second redeploy helps
   - Make sure the deployment completes successfully

4. **Verify the value:**
   - The JWT_SECRET should be 64 characters long
   - No spaces or line breaks
   - Copy-paste it carefully

## Quick Checklist

- [ ] JWT_SECRET added to Vercel environment variables
- [ ] Variable set for **Production** environment (at minimum)
- [ ] MONGODB_URI also added (if using database)
- [ ] **Redeployed the project** (this is critical!)
- [ ] Waited for deployment to complete
- [ ] Verified health endpoint works
- [ ] Checked function logs for errors

## Need Help?

If you're still seeing the error after following all steps:
1. Take a screenshot of your Vercel Environment Variables page
2. Check the deployment logs and share any errors
3. Verify the deployment completed successfully
