# Docker Update Guide - Razorpay Integration

This guide will help you update your Docker setup to include the new Razorpay payment integration.

## Prerequisites

- Docker Desktop installed and running
- Existing `.env` file with current configuration

## Step 1: Update Environment Variables

Add Razorpay credentials to your `.env` file:

```bash
# Existing variables (keep these)
MONGODB_URI=mongodb://mongo:27017/store
APP_ADMIN_TOKEN=your-secure-admin-token-here
JWT_SECRET=your-strong-jwt-secret-here
PORT=9000
NODE_ENV=production

# Add Razorpay variables
RAZORPAY_KEY_ID=rzp_test_xxxxxxxxxxxxx
RAZORPAY_KEY_SECRET=your_razorpay_key_secret_here
RAZORPAY_WEBHOOK_SECRET=your_webhook_secret_here
```

**To get Razorpay credentials:**
1. Sign up at https://razorpay.com
2. Go to Dashboard → Settings → API Keys
3. Generate test keys (or use live keys for production)
4. Copy Key ID and Key Secret

## Step 2: Rebuild Docker Images

The Docker images need to be rebuilt to include the new `razorpay` package.

### For Production:

```powershell
# Stop existing containers
docker compose down

# Rebuild images (this will install the razorpay package)
docker compose build --no-cache

# Start services
docker compose up -d

# Check logs to verify everything is working
docker compose logs -f app
```

### For Development:

```powershell
# Stop existing containers
docker compose -f docker-compose.yml -f docker-compose.dev.yml down

# Rebuild images
docker compose -f docker-compose.yml -f docker-compose.dev.yml build --no-cache

# Start services
docker compose -f docker-compose.yml -f docker-compose.dev.yml up -d

# Or run in foreground to see logs
docker compose -f docker-compose.yml -f docker-compose.dev.yml up
```

## Step 3: Verify Installation

1. **Check if Razorpay package is installed:**
   ```powershell
   docker compose exec app npm list razorpay
   ```

2. **Verify environment variables:**
   ```powershell
   # PowerShell (Windows)
   docker compose exec app env | Select-String RAZORPAY
   
   # Or use sh command
   docker compose exec app sh -c "env | grep RAZORPAY"
   ```

3. **Test the application:**
   - Navigate to http://localhost:9000
   - Add items to cart
   - Go to checkout
   - Verify Razorpay payment button appears

## Step 4: Initialize Database (if needed)

If you're setting up fresh or need to recreate indexes:

```powershell
# Create indexes (includes User model indexes)
docker compose run --rm app node scripts/init.mjs

# Seed sample products (optional)
docker compose run --rm app node scripts/seed.mjs
```

## Troubleshooting

### Issue: Docker Build Fails with npm install Error

**Symptoms:**
- Build fails with `npm install` exit code 1
- Error message: "process did not complete successfully"
- Build logs show npm warnings or errors

**Solutions:**

1. **Check npm install logs:**
   ```powershell
   docker compose build --progress=plain 2>&1 | Out-File -FilePath build.log -Encoding utf8
   ```
   Review `build.log` for specific package errors.

2. **Clear Docker cache and rebuild:**
   ```powershell
   docker compose build --no-cache --progress=plain
   ```

3. **Verify package-lock.json exists:**
   ```powershell
   Test-Path package-lock.json
   ```
   If missing, run `npm install` locally to generate it.

4. **Check for network issues:**
   - Ensure internet connection is stable
   - The Dockerfile now uses `npm ci` if `package-lock.json` exists (more reliable)
   - Falls back to `npm install --legacy-peer-deps` if needed

5. **Verify package.json is valid:**
   ```powershell
   node -e "require('./package.json')"
   ```

6. **Check Node.js version compatibility:**
   - Dockerfile uses Node 18
   - Verify your local Node version matches or is compatible
   - Check `package.json` engines field

7. **View detailed build logs:**
   ```powershell
   # Build with detailed progress output
   docker compose build --progress=plain --no-cache
   
   # Save build logs to file
   docker compose build --progress=plain 2>&1 | Out-File -FilePath build.log -Encoding utf8
   
   # View specific service build logs
   docker compose logs init
   docker compose logs app
   ```
   The Dockerfile now includes verbose npm logging (`--loglevel=verbose`) to help identify specific package installation issues.

### Issue: MongoDB Container is Unhealthy

**Symptoms:**
- Container status shows "unhealthy"
- Dependent services fail to start
- Error: "dependency failed to start: container mypeteats-mongo is unhealthy"

**Solutions:**

1. **Check MongoDB logs:**
   ```powershell
   docker compose logs mongo
   ```

2. **Increase health check start period:**
   - The health check `start_period` has been increased to 90s in `docker-compose.yml`
   - MongoDB may need more time to initialize on slower systems
   - Health check interval reduced to 10s for faster detection

3. **Verify MongoDB is starting correctly:**
   ```powershell
   # Check container status
   docker compose ps mongo
   
   # Check health check status
   docker inspect mypeteats-mongo | Select-String -Pattern "Health" -Context 5
   ```

4. **Check for port conflicts:**
   ```powershell
   # Check if port 27017 is in use
   netstat -ano | findstr :27017
   ```

5. **Clear MongoDB volume and restart:**
   ```powershell
   # WARNING: This deletes all MongoDB data
   docker compose down -v
   docker compose up -d mongo
   ```

6. **Check volume permissions:**
   - On Linux/Mac, ensure Docker has write permissions to the volume
   - On Windows, ensure Docker Desktop has access to the volume location

7. **Manually test MongoDB connection:**
   ```powershell
   docker compose exec mongo mongosh --eval "db.adminCommand('ping')"
   ```

### Issue: Import Path Warnings During Build

**Symptoms:**
- Build shows warnings about unresolved imports
- Paths like `../../../../lib/db` show as unresolved

**Solutions:**

1. **Verify import paths are correct:**
   - Files in `pages/api/admin/*/` should use `../../../../` (4 levels up)
   - Files in `pages/api/*/` should use `../../../` (3 levels up)
   - Files in `pages/api/` should use `../../` (2 levels up)

2. **Check file structure:**
   ```powershell
   # Verify lib directory exists
   Test-Path lib/db.js
   
   # Verify models directory exists
   Test-Path models
   ```

3. **These warnings may be false positives:**
   - Next.js build system resolves paths correctly at runtime
   - If build completes successfully, warnings can be ignored
   - If build fails, check the actual error message

### Issue: "Payment gateway not configured" error

**Solution:**
- Verify Razorpay environment variables are set in `.env`
- Check they're loaded: `docker compose exec app env | Select-String RAZORPAY` (PowerShell) or `docker compose exec app sh -c "env | grep RAZORPAY"`
- Restart containers: `docker compose restart app`

### Issue: Razorpay script not loading

**Solution:**
- Check browser console for script loading errors
- Verify `RAZORPAY_KEY_ID` is set correctly
- Ensure you're accessing via HTTP/HTTPS (not file://)

### Issue: Build fails with "razorpay package not found"

**Solution:**
- Clear Docker cache and rebuild:
  ```powershell
  docker compose build --no-cache
  ```
- Verify `package.json` includes razorpay dependency
- Check build logs: `docker compose build 2>&1 | Out-File -FilePath build.log -Encoding utf8`

### Issue: Payment verification fails

**Solution:**
- Verify `RAZORPAY_KEY_SECRET` matches your Key ID
- Check that you're using test keys with test cards (or live keys in production)
- Review server logs: `docker compose logs app | Select-String -Pattern "razorpay" -CaseSensitive:$false`

## Quick Update Commands

### Update without losing data:

```powershell
# Rebuild and restart (preserves MongoDB data)
docker compose build
docker compose up -d
```

### Complete fresh start (WARNING: deletes all data):

```powershell
# Stop and remove everything
docker compose down -v

# Rebuild
docker compose build --no-cache

# Start fresh
docker compose up -d

# Initialize database
docker compose run --rm app node scripts/init.mjs
docker compose run --rm app node scripts/seed.mjs
```

## Production Deployment

For production deployment:

1. **Use Live Keys:**
   - Replace test keys (`rzp_test_...`) with live keys (`rzp_live_...`)
   - Update `RAZORPAY_KEY_ID` and `RAZORPAY_KEY_SECRET` in production `.env`

2. **Configure Webhook:**
   - Set webhook URL in Razorpay dashboard to your production domain
   - Example: `https://mypeteats.com/api/payments/webhook`
   - Copy webhook secret to `RAZORPAY_WEBHOOK_SECRET`

3. **Security:**
   - Never commit `.env` file to version control
   - Use Docker secrets or environment variable injection in production
   - Rotate keys regularly

## Verification Checklist

After updating, verify:

- [ ] Docker containers are running: `docker compose ps`
- [ ] Razorpay package is installed: `docker compose exec app npm list razorpay`
- [ ] Environment variables are set: `docker compose exec app env | Select-String RAZORPAY` (PowerShell)
- [ ] Application starts without errors: `docker compose logs app`
- [ ] Checkout page loads Razorpay button
- [ ] Test payment works with test card
- [ ] MongoDB container is healthy: `docker compose ps mongo`

## Next Steps

1. Test payment flow with test card: `4111 1111 1111 1111`
2. Verify order creation and payment confirmation
3. Check webhook is receiving events (if configured)
4. Monitor logs for any payment-related errors

For detailed Razorpay setup, see `RAZORPAY_SETUP.md`
