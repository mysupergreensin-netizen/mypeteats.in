# Vercel Deployment Guide with MongoDB Atlas

This guide will help you deploy MyPetEats to Vercel and connect it to MongoDB Atlas.

## Prerequisites

- GitHub account (for connecting to Vercel)
- MongoDB Atlas account (free tier available)
- Vercel account (free tier available)

## Step 1: Set Up MongoDB Atlas

### 1.1 Create MongoDB Atlas Account

1. Go to [https://www.mongodb.com/cloud/atlas](https://www.mongodb.com/cloud/atlas)
2. Sign up for a free account
3. Create a new project (or use the default)

### 1.2 Create a Cluster

1. Click **"Build a Database"**
2. Choose **"M0 Free"** tier (free forever)
3. Select your preferred cloud provider and region (choose closest to your users)
4. Click **"Create"** (cluster creation takes 3-5 minutes)

### 1.3 Configure Database Access

1. Go to **Database Access** in the left sidebar
2. Click **"Add New Database User"**
3. Choose **"Password"** authentication
4. Create a username and strong password (save these securely)
5. Set user privileges to **"Atlas admin"** (or create custom role with read/write access)
6. Click **"Add User"**

### 1.4 Configure Network Access

1. Go to **Network Access** in the left sidebar
2. Click **"Add IP Address"**
3. For Vercel deployment, click **"Allow Access from Anywhere"** (or add Vercel's IP ranges)
   - This allows Vercel serverless functions to connect
   - For production, consider restricting to Vercel IP ranges
4. Click **"Confirm"**

### 1.5 Get Connection String

1. Go to **Database** in the left sidebar
2. Click **"Connect"** on your cluster
3. Choose **"Connect your application"**
4. Select **"Node.js"** and version **"5.5 or later"**
5. Copy the connection string (looks like: `mongodb+srv://username:password@cluster.mongodb.net/database?retryWrites=true&w=majority`)
6. Replace `<password>` with your database user password
7. Replace `<database>` with your database name (e.g., `store` or `mypeteats`)

**Example connection string:**
```
mongodb+srv://myuser:mypassword@cluster0.xxxxx.mongodb.net/store?retryWrites=true&w=majority
```

## Step 2: Deploy to Vercel

### 2.1 Connect Repository to Vercel

1. Go to [https://vercel.com](https://vercel.com)
2. Sign up or log in with your GitHub account
3. Click **"Add New Project"**
4. Import your GitHub repository
5. Select the repository containing MyPetEats

### 2.2 Configure Environment Variables

In the Vercel project settings, add these environment variables:

#### Required Variables

```bash
# MongoDB Atlas Connection String
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/store?retryWrites=true&w=majority

# JWT Secret (generate a strong random string)
JWT_SECRET=your-strong-jwt-secret-here-change-in-production

# Admin Authentication Token (optional, for legacy admin auth)
APP_ADMIN_TOKEN=your-secure-admin-token-here

# Razorpay Configuration (if using payments)
RAZORPAY_KEY_ID=rzp_test_xxxxxxxxxxxxx
RAZORPAY_KEY_SECRET=your_razorpay_key_secret_here
RAZORPAY_WEBHOOK_SECRET=your_webhook_secret_here
```

#### How to Add Environment Variables in Vercel

1. In your Vercel project dashboard, go to **Settings** → **Environment Variables**
2. Add each variable:
   - **Key**: Variable name (e.g., `MONGODB_URI`)
   - **Value**: Variable value (e.g., your MongoDB connection string)
   - **Environment**: Select **Production**, **Preview**, and **Development** as needed
3. Click **"Save"** for each variable

### 2.3 Configure Build Settings

Vercel should auto-detect Next.js, but verify these settings:

1. Go to **Settings** → **General**
2. **Framework Preset**: Next.js
3. **Build Command**: `npm run build` (default)
4. **Output Directory**: `.next` (default)
5. **Install Command**: `npm install` (default)

### 2.4 Deploy

1. Click **"Deploy"** in the Vercel dashboard
2. Wait for the build to complete (usually 2-5 minutes)
3. Your app will be live at `https://your-project.vercel.app`

## Step 3: Initialize Database

After deployment, you need to initialize your MongoDB Atlas database with indexes and optionally seed data.

### 3.1 Run Initialization Script

You can run the initialization script locally or create a Vercel serverless function:

**Option 1: Run Locally (Recommended)**

1. Create a `.env.local` file with your MongoDB Atlas connection string:
   ```bash
   MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/store?retryWrites=true&w=majority
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Run initialization:
   ```bash
   node scripts/init.mjs
   ```

4. (Optional) Seed sample products:
   ```bash
   node scripts/seed.mjs
   ```

**Option 2: Create Vercel API Route**

Create `pages/api/init-db.js`:

```javascript
import connectDB from '../../lib/db';
import Product from '../../models/Product';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  // Add security check (e.g., check for admin token)
  if (req.headers['x-admin-token'] !== process.env.APP_ADMIN_TOKEN) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  try {
    await connectDB();
    
    // Create indexes
    await Product.createIndexes();
    
    return res.status(200).json({ message: 'Database initialized successfully' });
  } catch (error) {
    console.error('Database initialization error:', error);
    return res.status(500).json({ error: 'Failed to initialize database' });
  }
}
```

Then call it once: `POST https://your-project.vercel.app/api/init-db` with header `x-admin-token: your-token`

## Step 4: Verify Deployment

### 4.1 Check Application

1. Visit your Vercel deployment URL
2. Verify the homepage loads correctly
3. Check that product pages load (if you seeded data)

### 4.2 Check Database Connection

1. Check Vercel function logs:
   - Go to **Deployments** → Select latest deployment → **Functions** tab
   - Look for `[DB] Connected to MongoDB` in logs

2. Test API endpoints:
   - Visit `https://your-project.vercel.app/api/health`
   - Should return `{ status: 'ok' }`

### 4.3 Test Admin Panel

1. Visit `https://your-project.vercel.app/admin`
2. Login with your admin credentials
3. Verify you can access admin features

## Troubleshooting

### Connection Timeout Errors

If you see MongoDB connection timeout errors:

1. **Check Network Access**: Ensure MongoDB Atlas allows connections from anywhere (or Vercel IP ranges)
2. **Verify Connection String**: Make sure password is URL-encoded if it contains special characters
3. **Check Vercel Logs**: Look for connection errors in function logs

### Environment Variables Not Working

1. **Verify Variables**: Check that all environment variables are set in Vercel dashboard
2. **Redeploy**: After adding environment variables, redeploy the application
3. **Check Variable Names**: Ensure variable names match exactly (case-sensitive)

### Build Failures

1. **Check Build Logs**: Review build logs in Vercel dashboard
2. **Verify Dependencies**: Ensure `package.json` has all required dependencies
3. **Node Version**: Vercel uses Node.js 18.x by default (compatible with this project)

### Database Index Errors

If you see index-related errors:

1. Run the initialization script: `node scripts/init.mjs`
2. Or manually create indexes in MongoDB Atlas Compass

## Security Best Practices

1. **Never commit `.env` files** to version control
2. **Use strong passwords** for MongoDB Atlas database users
3. **Restrict network access** to specific IP ranges in production (if possible)
4. **Rotate secrets regularly** (JWT_SECRET, APP_ADMIN_TOKEN)
5. **Use environment-specific variables** in Vercel (Production vs Preview)

## Updating Your Deployment

When you push changes to your GitHub repository:

1. Vercel automatically detects changes
2. Creates a new deployment
3. Runs build and deployment
4. Updates your production URL (if configured)

You can also trigger manual deployments from the Vercel dashboard.

## Monitoring

### Vercel Analytics

1. Enable Vercel Analytics in project settings
2. Monitor function execution times
3. Track API route performance

### MongoDB Atlas Monitoring

1. Use MongoDB Atlas dashboard to monitor:
   - Database performance
   - Connection metrics
   - Storage usage
   - Query performance

## Next Steps

1. **Set up custom domain** in Vercel project settings
2. **Configure webhooks** for Razorpay (if using payments)
3. **Set up monitoring** and alerts
4. **Enable Vercel Analytics** for performance tracking
5. **Configure preview deployments** for testing before production

## Support

- **Vercel Documentation**: [https://vercel.com/docs](https://vercel.com/docs)
- **MongoDB Atlas Documentation**: [https://docs.atlas.mongodb.com](https://docs.atlas.mongodb.com)
- **Next.js Documentation**: [https://nextjs.org/docs](https://nextjs.org/docs)
