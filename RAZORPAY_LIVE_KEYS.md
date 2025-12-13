# Where to Add Razorpay Live Keys

## Location: `.env` File

Add your **live** Razorpay Key ID and Key Secret to the `.env` file in the project root directory.

## Step-by-Step Instructions

### 1. Open or Create `.env` File

The `.env` file should be in the root of your project:
```
D:\Projects\mypeteats\.env
```

If it doesn't exist, create it.

### 2. Add Your Live Razorpay Keys

Add these three lines to your `.env` file:

```env
RAZORPAY_KEY_ID=rzp_live_xxxxxxxxxxxxx
RAZORPAY_KEY_SECRET=your_live_key_secret_here
RAZORPAY_WEBHOOK_SECRET=your_webhook_secret_here
```

### 3. Complete `.env` File Example

Your complete `.env` file should look like this:

```env
# MongoDB Connection
MONGODB_URI=mongodb://mongo:27017/store

# Admin Authentication Token
APP_ADMIN_TOKEN=your-secure-admin-token-here

# JWT Secret for user authentication
JWT_SECRET=your-strong-jwt-secret-here

# Razorpay Payment Gateway - LIVE KEYS
RAZORPAY_KEY_ID=rzp_live_xxxxxxxxxxxxx
RAZORPAY_KEY_SECRET=your_live_key_secret_here
RAZORPAY_WEBHOOK_SECRET=your_webhook_secret_here

# Server Port
PORT=9000

# Environment
NODE_ENV=production
```

## Important Notes

### 🔑 Key Format

- **Test Keys**: Start with `rzp_test_` (e.g., `rzp_test_1234567890`)
- **Live Keys**: Start with `rzp_live_` (e.g., `rzp_live_1234567890`)

For production, use **live keys** that start with `rzp_live_`.

### 📍 Where to Get Live Keys

1. Go to: https://dashboard.razorpay.com
2. Log in to your Razorpay account
3. Navigate to: **Settings** → **API Keys**
4. Switch to **Live Mode** (toggle in top right)
5. Click **Generate Key** if you haven't already
6. Copy:
   - **Key ID** → paste as `RAZORPAY_KEY_ID`
   - **Key Secret** → paste as `RAZORPAY_KEY_SECRET`

### 🔐 Webhook Secret

To get the webhook secret:

1. Go to: **Settings** → **Webhooks**
2. Create or edit your webhook URL: `https://yourdomain.com/api/payments/webhook`
3. Copy the **Webhook Secret** → paste as `RAZORPAY_WEBHOOK_SECRET`

## After Adding Keys

### If Using Docker:

1. **Rebuild containers** to load new environment variables:
   ```powershell
   docker compose down
   docker compose build --no-cache
   docker compose up -d
   ```

2. **Verify keys are loaded**:
   ```powershell
   # PowerShell
   docker compose exec app env | Select-String RAZORPAY
   
   # Or
   docker compose exec app sh -c "env | grep RAZORPAY"
   ```

### If Running Locally (without Docker):

1. **Restart your development server**:
   ```bash
   npm run dev
   ```

2. The keys will be automatically loaded from `.env`

## Security Reminders

⚠️ **IMPORTANT:**
- ✅ **DO** add `.env` to `.gitignore` (already done)
- ❌ **NEVER** commit `.env` file to Git
- ❌ **NEVER** share your live keys publicly
- ✅ **DO** use different keys for test and production
- ✅ **DO** rotate keys regularly for security

## Verification

After adding keys, verify they're working:

1. **Check environment variables are loaded**:
   ```powershell
   # Docker - PowerShell (Windows)
   docker compose exec app env | Select-String RAZORPAY
   
   # Docker - Alternative (works in PowerShell too)
   docker compose exec app sh -c "env | grep RAZORPAY"
   
   # Local
   # Keys should be available in process.env
   ```

2. **Test payment flow**:
   - Go to http://localhost:9000
   - Add items to cart
   - Go to checkout
   - Click "Proceed to Payment"
   - You should see Razorpay payment form

3. **Check server logs** for any errors:
   ```powershell
   docker compose logs -f app
   ```

## Troubleshooting

### "Payment gateway not configured" error

- ✅ Check `.env` file exists in project root
- ✅ Verify keys are spelled correctly (no typos)
- ✅ Ensure no extra spaces around `=` sign
- ✅ Restart Docker containers after adding keys
- ✅ Check logs: `docker compose logs app | grep -i razorpay`

### Keys not loading in Docker

- Rebuild containers: `docker compose build --no-cache`
- Check `.env` file is in project root (same directory as `docker-compose.yml`)
- Verify no syntax errors in `.env` file

### Test vs Live Keys

- **Test keys** (`rzp_test_...`) work with test cards only
- **Live keys** (`rzp_live_...`) process real payments
- Make sure you're using the correct key type for your environment

## Quick Reference

| Variable | Example Value | Where to Get |
|----------|---------------|--------------|
| `RAZORPAY_KEY_ID` | `rzp_live_1234567890` | Dashboard → Settings → API Keys |
| `RAZORPAY_KEY_SECRET` | `abc123def456...` | Dashboard → Settings → API Keys |
| `RAZORPAY_WEBHOOK_SECRET` | `whsec_xyz789...` | Dashboard → Settings → Webhooks |

---

**File Location**: `D:\Projects\mypeteats\.env`

