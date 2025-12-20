# MongoDB Atlas Connection String for Vercel

## Quick Setup

### Option 1: Using the Helper Script

1. Run the helper script with your MongoDB password:
   ```bash
   npm run format-mongodb-uri <your-password>
   ```

   Or directly:
   ```bash
   node scripts/format-mongodb-uri.mjs <your-password>
   ```

2. The script will output a properly formatted connection string with:
   - URL-encoded password (handles special characters)
   - Database name included (`/store`)
   - Required query parameters (`retryWrites=true&w=majority`)
   - App name parameter

3. Copy the output and add it to Vercel as `MONGODB_URI`

### Option 2: Manual Formatting

If you prefer to format it manually, use this template:

```
mongodb+srv://Vercel-Admin-Vbt:<ENCODED_PASSWORD>@vbt.htnlvqx.mongodb.net/store?retryWrites=true&w=majority&appName=Vbt
```

**Important:** Replace `<ENCODED_PASSWORD>` with your password, but URL-encode any special characters:
- `@` → `%40`
- `#` → `%23`
- `%` → `%25`
- `&` → `%26`
- `/` → `%2F`
- `?` → `%3F`
- `=` → `%3D`
- `+` → `%2B`
- ` ` (space) → `%20`

## Adding to Vercel

1. Go to [Vercel Dashboard](https://vercel.com/dashboard)
2. Select your project (`mypeteats.in`)
3. Navigate to **Settings** → **Environment Variables**
4. Click **Add New**
5. Fill in:
   - **Key**: `MONGODB_URI`
   - **Value**: (paste the formatted connection string from the script)
   - **Environment**: Select **Production**, **Preview**, and **Development**
6. Click **Save**

## After Adding

1. **Redeploy** your project:
   - Go to **Deployments** tab
   - Click **⋯** (three dots) on the latest deployment
   - Click **Redeploy**
   - Or push a new commit to trigger auto-deployment

2. **Verify Connection**:
   - Visit `https://your-project.vercel.app/api/health`
   - Should return: `{ "status": "healthy", ... }`
   - Check Vercel function logs for `[DB] Connected to MongoDB`

## Troubleshooting

### Connection Timeout Errors

- Verify MongoDB Atlas Network Access allows connections from anywhere (0.0.0.0/0)
- Check that your password is correctly URL-encoded
- Verify the database name is included in the connection string (`/store`)

### Authentication Errors

- Double-check the username: `Vercel-Admin-Vbt`
- Verify the password is correct and properly encoded
- Ensure the MongoDB user has proper permissions

### Still Having Issues?

1. Check Vercel function logs for specific error messages
2. Test the connection string locally using MongoDB Compass
3. Verify all environment variables are set correctly in Vercel
