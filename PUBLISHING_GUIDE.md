# MyPetEats - Publishing Guide

## 🚀 Quick Start for Production Deployment

This guide will help you set up and publish your MyPetEats application to production.

---

## Step 1: Environment Variables Setup

### Generate JWT_SECRET

**Using PowerShell:**
```powershell
.\scripts\generate-jwt-secret-simple.ps1
```

**Or use this pre-generated value:**
```
GYGPythPHb4BNg8wxluXIJcfELGXSxNu7FzZDxBBmdAHrFnAF0OrmCW7VAkWWt7j
```

### Format MongoDB Connection String

**Using the helper script:**
```bash
npm run format-mongodb-uri <your-mongodb-password>
```

**Or manually format:**
```
mongodb+srv://Vercel-Admin-Vbt:<ENCODED_PASSWORD>@vbt.htnlvqx.mongodb.net/store?retryWrites=true&w=majority&appName=Vbt
```

**Important:** URL-encode special characters in your password:
- `@` → `%40`
- `#` → `%23`
- `%` → `%25`
- `&` → `%26`

### Add to Vercel

1. Go to: https://vercel.com/dashboard
2. Select your project: `mypeteats.in`
3. Navigate to: **Settings** → **Environment Variables**
4. Add these variables:

| Key | Value | Environment |
|-----|-------|-------------|
| `JWT_SECRET` | (Generated value above) | Production, Preview, Development |
| `MONGODB_URI` | (Formatted connection string) | Production, Preview, Development |
| `NODE_ENV` | `production` | Production |

5. Click **Save** for each variable

---

## Step 2: Create Admin Users

### Option A: Using Setup Script (Recommended)

Run this command to create 2 admin users with secure passwords:

```bash
npm run setup-admins
```

Or directly:
```bash
node scripts/setup-admin-users.mjs
```

**The script will:**
- Generate secure random passwords (16 characters)
- Create 2 admin users in the database
- Display credentials (SAVE THEM IMMEDIATELY)

### Option B: Manual Creation

Create admin users one by one:

```bash
# Admin User 1
node scripts/create-admin-user.mjs "Admin User 1" "YourSecurePassword1" "admin1@mypeteats.in"

# Admin User 2
node scripts/create-admin-user.mjs "Admin User 2" "YourSecurePassword2" "admin2@mypeteats.in"
```

### Option C: Via API (After Deployment)

After your site is deployed, you can create admins via API:

```bash
POST https://your-domain.vercel.app/api/auth/create-admin
Headers:
  x-admin-token: <APP_ADMIN_TOKEN>
Body:
{
  "name": "Admin User 1",
  "email": "admin1@mypeteats.in",
  "password": "YourSecurePassword1"
}
```

---

## Step 3: Save Admin Credentials

After running the setup script, **immediately** save the credentials:

1. Open `ADMIN_CREDENTIALS.md` (this file is gitignored)
2. Copy the generated passwords from the script output
3. Fill in the credentials in `ADMIN_CREDENTIALS.md`
4. Keep this file secure and local (DO NOT COMMIT TO GIT)

### Admin User Template

```
## Admin User 1
- **Name:** Admin User 1
- **Email:** admin1@mypeteats.in
- **Password:** [Paste generated password here]
- **Role:** admin

## Admin User 2
- **Name:** Admin User 2
- **Email:** admin2@mypeteats.in
- **Password:** [Paste generated password here]
- **Role:** admin
```

---

## Step 4: Initialize Database

### Create Indexes

```bash
npm run init
```

Or:
```bash
node scripts/init.mjs
```

### Seed Sample Products (Optional)

```bash
npm run seed
```

Or:
```bash
node scripts/seed.mjs
```

---

## Step 5: Deploy to Vercel

### Automatic Deployment

1. Push your code to GitHub:
   ```bash
   git add .
   git commit -m "Ready for production"
   git push
   ```

2. Vercel will automatically detect and deploy

### Manual Deployment

1. Go to Vercel Dashboard
2. Select your project
3. Go to **Deployments** tab
4. Click **Redeploy** on the latest deployment

---

## Step 6: Verify Deployment

### 1. Health Check

Visit: `https://your-domain.vercel.app/api/health`

Should return:
```json
{
  "status": "healthy",
  "timestamp": "...",
  "service": "mypeteats-api"
}
```

### 2. Test Admin Login

1. Visit: `https://your-domain.vercel.app/auth/login`
2. Enter admin email and password
3. Should redirect to admin dashboard

### 3. Check Admin Panel

1. Login with admin credentials
2. Navigate to: `/admin`
3. Verify you can:
   - View products
   - Create/edit products
   - View orders
   - Manage users

---

## 📋 Admin User Credentials Summary

After running the setup script, you'll have:

### Admin User 1
- **Email:** admin1@mypeteats.in
- **Password:** [Generated - 16 characters]
- **Access:** Full admin panel

### Admin User 2
- **Email:** admin2@mypeteats.in
- **Password:** [Generated - 16 characters]
- **Access:** Full admin panel

**⚠️ IMPORTANT:**
- Save these credentials immediately after generation
- Store in a password manager
- Change passwords after first login
- Never commit passwords to Git

---

## 🔐 Security Checklist

- [ ] JWT_SECRET is set in Vercel (64+ characters)
- [ ] MONGODB_URI is set in Vercel (with encoded password)
- [ ] Admin users created with strong passwords
- [ ] Credentials saved securely (password manager)
- [ ] Database indexes initialized
- [ ] Health check endpoint working
- [ ] Admin login tested and working
- [ ] No hardcoded secrets in code
- [ ] `.env` file is gitignored
- [ ] `ADMIN_CREDENTIALS.md` is gitignored

---

## 🆘 Troubleshooting

### Can't Login as Admin

1. Verify user exists in database
2. Check user role is 'admin'
3. Verify password is correct
4. Check JWT_SECRET is set in Vercel
5. Check Vercel function logs for errors

### Database Connection Issues

1. Verify MONGODB_URI is correct
2. Check password is URL-encoded
3. Verify MongoDB Atlas Network Access (0.0.0.0/0)
4. Check database name is included (`/store`)

### Environment Variables Not Working

1. Verify variables are set in Vercel
2. Check they're set for Production environment
3. Redeploy after adding variables
4. Check variable names are exact (case-sensitive)

---

## 📚 Additional Resources

- `DEPLOYMENT_NOTES.md` - Detailed deployment information
- `VERCEL_ENV_SETUP.md` - Environment variable setup guide
- `MONGODB_VERCEL_SETUP.md` - MongoDB connection guide
- `FIX_VERCEL_JWT_SECRET.md` - JWT_SECRET troubleshooting

---

## ✅ Post-Deployment Checklist

- [ ] Site is accessible
- [ ] Health check returns "healthy"
- [ ] Admin users can login
- [ ] Admin panel is accessible
- [ ] Products can be created/edited
- [ ] Orders can be viewed
- [ ] Database connection is stable
- [ ] No errors in Vercel logs
- [ ] All environment variables are set
- [ ] Credentials are saved securely

---

**Ready to Publish!** 🎉

After completing all steps, your MyPetEats application will be live and ready for use.

**Project Repository:** https://github.com/mysupergreensin-netizen/mypeteats.in
