# MyPetEats - Deployment & Publishing Notes

## 🚀 Production Deployment Checklist

### Pre-Deployment Setup

- [ ] All environment variables configured in Vercel
- [ ] MongoDB Atlas connection verified
- [ ] Database indexes initialized
- [ ] Admin users created
- [ ] JWT_SECRET generated and set
- [ ] Test deployment on preview environment

---

## 📋 Environment Variables (Vercel)

### Required Variables

1. **MONGODB_URI**
   - Format: `mongodb+srv://Vercel-Admin-Vbt:<PASSWORD>@vbt.htnlvqx.mongodb.net/store?retryWrites=true&w=majority&appName=Vbt`
   - Generate using: `npm run format-mongodb-uri <password>`

2. **JWT_SECRET**
   - Generate using: `.\scripts\generate-jwt-secret-simple.ps1`
   - Or use: `GYGPythPHb4BNg8wxluXIJcfELGXSxNu7FzZDxBBmdAHrFnAF0OrmCW7VAkWWt7j`
   - Must be 64+ characters

3. **NODE_ENV**
   - Value: `production`

### Optional Variables

- `APP_ADMIN_TOKEN` - For legacy admin token authentication
- `RAZORPAY_KEY_ID` - If using payments
- `RAZORPAY_KEY_SECRET` - If using payments
- `RAZORPAY_WEBHOOK_SECRET` - If using webhooks

---

## 👥 Admin User Credentials

### Admin User 1
- **Name:** Admin User 1
- **Email:** admin1@mypeteats.in
- **Password:** `[Generated - See ADMIN_CREDENTIALS.md]`
- **Role:** admin
- **Access:** Full admin panel access

### Admin User 2
- **Name:** Admin User 2
- **Email:** admin2@mypeteats.in
- **Password:** `[Generated - See ADMIN_CREDENTIALS.md]`
- **Role:** admin
- **Access:** Full admin panel access

### Creating Admin Users

**Option 1: Using Setup Script (Recommended)**
```bash
node scripts/setup-admin-users.mjs
```

**Option 2: Using Create Admin Script**
```bash
# Admin User 1
node scripts/create-admin-user.mjs "Admin User 1" "password1" "admin1@mypeteats.in"

# Admin User 2
node scripts/create-admin-user.mjs "Admin User 2" "password2" "admin2@mypeteats.in"
```

**Option 3: Via API (After deployment)**
```bash
POST https://your-domain.vercel.app/api/auth/create-admin
Headers:
  x-admin-token: <APP_ADMIN_TOKEN>
Body:
{
  "name": "Admin User 1",
  "email": "admin1@mypeteats.in",
  "password": "secure-password-here"
}
```

---

## 🔐 Security Notes

### Password Requirements
- Minimum 6 characters
- Recommended: 16+ characters with mix of letters, numbers, and symbols
- Never commit passwords to repository
- Store credentials securely (password manager)

### Access Control
- Admin users can access `/admin` pages
- Admin users can manage products, orders, users
- Regular users can only access their own profile and orders

### Best Practices
- Change default passwords immediately after first login
- Use different passwords for each admin account
- Enable 2FA if available
- Rotate passwords regularly
- Monitor admin access logs

---

## 📦 Database Setup

### Initialize Database

1. **Create Indexes:**
   ```bash
   npm run init
   # or
   node scripts/init.mjs
   ```

2. **Seed Sample Products (Optional):**
   ```bash
   npm run seed
   # or
   node scripts/seed.mjs
   ```

3. **Rebuild Database (If needed):**
   ```bash
   npm run rebuild
   # or
   node scripts/rebuild.mjs
   ```

### Database Collections
- `products` - Product catalog
- `users` - User accounts
- `orders` - Customer orders
- `carts` - Shopping cart sessions

---

## 🌐 Vercel Deployment

### Deployment Steps

1. **Connect Repository:**
   - Go to Vercel Dashboard
   - Import GitHub repository: `mysupergreensin-netizen/mypeteats.in`

2. **Configure Environment Variables:**
   - Settings → Environment Variables
   - Add all required variables (see above)
   - Set for Production, Preview, and Development

3. **Deploy:**
   - Push to `main` branch triggers auto-deployment
   - Or manually trigger from Vercel dashboard

4. **Verify:**
   - Check health endpoint: `https://your-domain.vercel.app/api/health`
   - Test admin login: `https://your-domain.vercel.app/auth/login`
   - Verify database connection in function logs

### Post-Deployment

1. **Create Admin Users:**
   - Run setup script or use API endpoint
   - Save credentials securely

2. **Test Admin Panel:**
   - Login with admin credentials
   - Verify product management works
   - Test order management

3. **Monitor:**
   - Check Vercel function logs
   - Monitor MongoDB Atlas dashboard
   - Set up error alerts

---

## 🔧 Troubleshooting

### Common Issues

**JWT_SECRET Error:**
- Ensure `JWT_SECRET` is set in Vercel
- Must be set for Production environment
- Redeploy after adding variable

**MongoDB Connection Error:**
- Verify `MONGODB_URI` is correct
- Check password is URL-encoded
- Verify MongoDB Atlas Network Access (0.0.0.0/0)
- Ensure database name is included (`/store`)

**Admin Login Issues:**
- Verify admin users exist in database
- Check user role is set to 'admin'
- Verify password is correct
- Check JWT_SECRET is set

**500 Errors:**
- Check Vercel function logs
- Verify all environment variables are set
- Check database connection
- Verify indexes are created

---

## 📝 Important Files

- `DEPLOYMENT_NOTES.md` - This file
- `ADMIN_CREDENTIALS.md` - Admin user passwords (DO NOT COMMIT)
- `VERCEL_ENV_SETUP.md` - Environment variable setup guide
- `MONGODB_VERCEL_SETUP.md` - MongoDB connection setup
- `FIX_VERCEL_JWT_SECRET.md` - JWT_SECRET troubleshooting

---

## 🎯 Quick Reference

### Admin Panel URLs
- Admin Dashboard: `/admin`
- Products: `/admin/products`
- Orders: `/admin/orders`
- Users: `/admin/users`

### API Endpoints
- Health Check: `/api/health`
- Admin Login: `/api/auth/login`
- Create Admin: `/api/auth/create-admin` (requires token)

### Scripts
- Setup Admin Users: `node scripts/setup-admin-users.mjs`
- Create Single Admin: `node scripts/create-admin-user.mjs <name> <password> <email>`
- Initialize DB: `npm run init`
- Seed Products: `npm run seed`
- Rebuild DB: `npm run rebuild`

---

## ⚠️ Security Reminders

1. **Never commit:**
   - `.env` files
   - `ADMIN_CREDENTIALS.md` (if contains passwords)
   - Actual passwords in any file

2. **Always:**
   - Use strong, unique passwords
   - Store credentials in password manager
   - Rotate secrets regularly
   - Monitor access logs
   - Keep dependencies updated

3. **Production Checklist:**
   - [ ] All secrets in Vercel environment variables
   - [ ] No hardcoded credentials
   - [ ] HTTPS enabled
   - [ ] Error messages don't leak sensitive info
   - [ ] Rate limiting enabled
   - [ ] Database backups configured

---

**Last Updated:** $(date)
**Project:** MyPetEats
**Repository:** https://github.com/mysupergreensin-netizen/mypeteats.in
