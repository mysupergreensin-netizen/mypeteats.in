# Fix JWT_SECRET Error on Vercel

## Problem
You're seeing this error:
```
Error: JWT_SECRET is required in production. Please set it in your .env file.
```

This happens because the `JWT_SECRET` environment variable is not set in your Vercel deployment.

## Solution

### Step 1: Generate a Secure JWT_SECRET

You can generate a secure JWT_SECRET using any of these methods:

**Option 1: Using Node.js (if you have it installed)**
```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

**Option 2: Using OpenSSL (Linux/Mac/Git Bash)**
```bash
openssl rand -hex 32
```

**Option 3: Using PowerShell (Windows)**
```powershell
-join ((48..57) + (65..90) + (97..122) | Get-Random -Count 64 | ForEach-Object {[char]$_})
```

**Option 4: Online Generator**
Visit: https://www.random.org/strings/
- Length: 64
- Character set: Alphanumeric
- Generate and copy the result

### Step 2: Add JWT_SECRET to Vercel

1. Go to your Vercel project dashboard: https://vercel.com/dashboard
2. Select your project (`mypeteats.in`)
3. Go to **Settings** → **Environment Variables**
4. Click **Add New**
5. Fill in:
   - **Key**: `JWT_SECRET`
   - **Value**: (paste the generated secret from Step 1)
   - **Environment**: Select **Production**, **Preview**, and **Development** (or at least **Production**)
6. Click **Save**

### Step 3: Redeploy

After adding the environment variable, you need to redeploy:

1. Go to **Deployments** tab in Vercel
2. Click the **⋯** (three dots) menu on the latest deployment
3. Click **Redeploy**
4. Or simply push a new commit to trigger a new deployment

### Step 4: Verify

After redeployment, check:
1. Visit your Vercel URL
2. Check the function logs in Vercel dashboard
3. The error should be resolved

## Required Environment Variables for Vercel

Make sure you have these environment variables set in Vercel:

### Required:
- ✅ `JWT_SECRET` - **MUST be set** (this is what's missing)
- ✅ `MONGODB_URI` - MongoDB Atlas connection string
- ✅ `NODE_ENV` - Set to `production` for production

### Optional but Recommended:
- `APP_ADMIN_TOKEN` - For admin panel access
- `RAZORPAY_KEY_ID` - If using Razorpay payments
- `RAZORPAY_KEY_SECRET` - If using Razorpay payments
- `RAZORPAY_WEBHOOK_SECRET` - If using Razorpay webhooks

## Quick Checklist

- [ ] Generated a secure JWT_SECRET (64+ characters)
- [ ] Added JWT_SECRET to Vercel environment variables
- [ ] Selected "Production" environment (and Preview/Development if needed)
- [ ] Redeployed the application
- [ ] Verified the error is resolved

## Additional Notes

- **Never commit JWT_SECRET to your repository** - it should only be in Vercel environment variables
- **Use different secrets for different environments** (production, preview, development)
- **Rotate secrets regularly** for security
- The JWT_SECRET should be at least 32 characters long, but 64+ is recommended

## Fix for 500.html Error

If you're also seeing this error:
```
⨯ h [Error]: Failed to load static file for page: /500 ENOENT: no such file or directory, open '/var/task/.next/server/pages/500.html'
```

This is caused by the `output: 'standalone'` setting in `next.config.js` which is incompatible with Vercel's serverless functions. The configuration has been updated to automatically disable standalone mode when deploying to Vercel.

**The fix is already applied** - just commit and push the updated `next.config.js` file, and the error should be resolved after redeployment.

## Still Having Issues?

1. Check Vercel function logs for other errors
2. Verify all environment variables are set correctly
3. Make sure you redeployed after adding the variable
4. Check that `NODE_ENV=production` is set in Vercel
5. Ensure you've pushed the updated `next.config.js` (with conditional standalone output)

