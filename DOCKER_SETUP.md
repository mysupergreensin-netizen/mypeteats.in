# Docker Setup Guide for MyPetEats

## Prerequisites
- Docker Desktop installed and running
- Docker Compose v2+ installed

## Quick Start

### 1. Create Environment File

Create a `.env` file in the project root:

```bash
# Copy the example file
cp .env.example .env
```

Then edit `.env` and set your values:

```env
MONGODB_URI=mongodb://mongo:27017/store
APP_ADMIN_TOKEN=your-strong-admin-token-here
JWT_SECRET=your-strong-jwt-secret-here-change-in-production
RAZORPAY_KEY_ID=your-razorpay-key-id
RAZORPAY_KEY_SECRET=your-razorpay-key-secret
RAZORPAY_WEBHOOK_SECRET=your-razorpay-webhook-secret
```

**Important**: 
- `JWT_SECRET` is required for user authentication. Use a strong random string in production.
- `APP_ADMIN_TOKEN` is optional if you're using user-based admin authentication.

### 2. Development Mode (Hot Reload)

Start the development stack:

```powershell
docker compose -f docker-compose.yml -f docker-compose.dev.yml up --build
```

Or in the background:

```powershell
docker compose -f docker-compose.yml -f docker-compose.dev.yml up -d --build
```

The app will be available at: **http://localhost:9000**

### 3. Production Mode

Build and start the production stack:

```powershell
docker compose up --build -d
```

The app will be available at: **http://localhost:9000**

### 4. Initialize Database Indexes (Optional)

If you want to ensure database indexes are created:

```powershell
docker compose run --rm app node scripts/init.mjs
```

### 5. Seed Sample Products (Optional)

```powershell
docker compose run --rm app node scripts/seed.mjs
```

## Common Commands

### View Logs
```powershell
# All services
docker compose -f docker-compose.yml -f docker-compose.dev.yml logs -f

# App only
docker compose -f docker-compose.yml -f docker-compose.dev.yml logs -f app

# MongoDB only
docker compose -f docker-compose.yml -f docker-compose.dev.yml logs -f mongo
```

### Stop Containers
```powershell
docker compose -f docker-compose.yml -f docker-compose.dev.yml down
```

### Stop and Remove Volumes (Clean Slate)
```powershell
docker compose -f docker-compose.yml -f docker-compose.dev.yml down -v
```

### Rebuild After Code Changes
```powershell
docker compose -f docker-compose.yml -f docker-compose.dev.yml build --no-cache app
docker compose -f docker-compose.yml -f docker-compose.dev.yml up -d
```

### Access MongoDB Shell
```powershell
docker compose exec mongo mongosh store
```

### Create Admin User

After the app is running, create your first admin user:

```powershell
$body = @{
  name     = "Admin User"
  email    = "admin@mypeteats.in"
  password = "YourStrongPassword123"
} | ConvertTo-Json

Invoke-RestMethod `
  -Uri "http://localhost:9000/api/auth/create-admin" `
  -Method Post `
  -Headers @{ "Content-Type" = "application/json"; "x-admin-token" = "your-strong-admin-token-here" } `
  -Body $body
```

Replace `your-strong-admin-token-here` with your actual `APP_ADMIN_TOKEN` from `.env`.

## Troubleshooting

### Port Already in Use
If port 9000 is already in use, change it in `docker-compose.yml`:
```yaml
ports:
  - "9001:9000"  # Change 9001 to any available port
```

### MongoDB Connection Issues
- Ensure MongoDB container is healthy: `docker compose ps`
- Check MongoDB logs: `docker compose logs mongo`
- Verify `MONGODB_URI` in `.env` matches the service name `mongo`

### App Not Starting
- Check app logs: `docker compose logs app`
- Ensure all environment variables are set in `.env`
- Rebuild the image: `docker compose build --no-cache app`

### Next.js Compilation Errors
- Clear `.next` directory: `docker compose exec app rm -rf .next`
- Restart the container: `docker compose restart app`

## Services

- **app**: Next.js application (port 9000)
- **mongo**: MongoDB database (port 27017 in dev, internal only in prod)
- **init**: One-time database initialization (production only)

## Volumes

- `mongo-data`: Persistent MongoDB data storage

