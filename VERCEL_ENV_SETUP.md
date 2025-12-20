# Quick Setup Guide for Vercel Environment Variables

## Required Environment Variables

You need to set these environment variables in Vercel for your application to work:

### 1. JWT_SECRET (Required)

**Generate a JWT_SECRET:**

**Option A: Using PowerShell (Windows)**
```powershell
.\scripts\generate-jwt-secret.ps1
```

**Option B: Using PowerShell one-liner**
```powershell
-join ((48..57) + (65..90) + (97..122) | Get-Random -Count 64 | ForEach-Object {[char]$_})
```

**Option C: Online Generator**
- Visit: https://www.random.org/strings/
- Length: 64
- Character set: Alphanumeric
- Generate and copy

**Add to Vercel:**
- Key: `JWT_SECRET`
- Value: (paste the generated 64-character string)
- Environment: Production, Preview, Development

### 2. MONGODB_URI (Required)

**Format your connection string:**

**Option A: Using the helper script**
```bash
npm run format-mongodb-uri <your-password>
```

**Option B: Manual format**
```
mongodb+srv://Vercel-Admin-Vbt:<ENCODED_PASSWORD>@vbt.htnlvqx.mongodb.net/store?retryWrites=true&w=majority&appName=Vbt
```

**Important:** URL-encode your password if it contains special characters:
- `@` → `%40`
- `#` → `%23`
- `%` → `%25`
- `&` → `%26`

**Add to Vercel:**
- Key: `MONGODB_URI`
- Value: (paste the formatted connection string)
- Environment: Production, Preview, Development

### 3. NODE_ENV (Optional but Recommended)

- Key: `NODE_ENV`
- Value: `production`
- Environment: Production

## Quick Setup Steps

1. **Generate JWT_SECRET:**
   ```powershell
   .\scripts\generate-jwt-secret.ps1
   ```

2. **Format MongoDB URI:**
   ```bash
   npm run format-mongodb-uri <your-mongodb-password>
   ```

3. **Add to Vercel:**
   - Go to: https://vercel.com/dashboard
   - Select your project
   - Settings → Environment Variables
   - Add each variable (JWT_SECRET, MONGODB_URI)
   - Select all environments (Production, Preview, Development)
   - Click Save

4. **Redeploy:**
   - Go to Deployments tab
   - Click ⋯ (three dots) on latest deployment
   - Click Redeploy
   - Or push a new commit

5. **Verify:**
   - Visit: `https://your-project.vercel.app/api/health`
   - Should return: `{ "status": "healthy" }`
   - Check Vercel logs for errors

## Troubleshooting

### JWT_SECRET Error
- ✅ Make sure JWT_SECRET is set in Vercel
- ✅ Verify it's set for Production environment
- ✅ Redeploy after adding the variable

### MongoDB Connection Error
- ✅ Verify MONGODB_URI includes database name (`/store`)
- ✅ Check password is URL-encoded if it has special characters
- ✅ Verify MongoDB Atlas Network Access allows connections from anywhere (0.0.0.0/0)

### Still Having Issues?
1. Check Vercel function logs
2. Verify all environment variables are set
3. Make sure you redeployed after adding variables
4. Check that variables are set for the correct environment (Production)
