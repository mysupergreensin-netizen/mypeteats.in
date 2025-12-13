# Quick Setup Guide

## Prerequisites

- Docker Desktop installed and running
- No Node.js installation required!

## Step-by-Step Setup

### 1. Create `.env` file

Create a `.env` file in the project root with:

```env
MONGODB_URI=mongodb://mongo:27017/store
APP_ADMIN_TOKEN=your-strong-random-token-here
JWT_SECRET=your-strong-jwt-secret-here
RAZORPAY_KEY_ID=your-razorpay-key-id
RAZORPAY_KEY_SECRET=your-razorpay-key-secret
RAZORPAY_WEBHOOK_SECRET=your-razorpay-webhook-secret
PORT=9000
NODE_ENV=production
```

**Generate a secure token:**
```bash
# On Linux/Mac
openssl rand -hex 32

# Or use: https://www.random.org/strings/
```

### 2. Build Docker Images

```bash
docker compose build
```

### 3. Start Services

**Production mode:**
```bash
docker compose up -d
```

**Development mode (with hot reload):**
```bash
docker compose -f docker-compose.yml -f docker-compose.dev.yml up
```

### 4. Initialize Database

```bash
# Create indexes
docker compose run --rm app node scripts/init.js

# Seed sample products
docker compose run --rm app node scripts/seed.js
```

### 5. Access the Application

- **Homepage:** http://localhost:9000
- **Admin Panel:** http://localhost:9000/admin
  - Login with your `APP_ADMIN_TOKEN` from `.env`

## Common Commands

```bash
# View logs
docker compose logs -f app
docker compose logs -f mongo

# Stop services
docker compose down

# Stop and remove volumes (WARNING: deletes data)
docker compose down -v

# Rebuild after code changes
docker compose build --no-cache
docker compose up -d

# Access MongoDB shell
docker compose exec mongo mongosh store

# Run scripts
docker compose run --rm app node scripts/seed.js
```

## Troubleshooting

### Port 9000 already in use
Change `PORT` in `.env` and update port mapping in `docker-compose.yml`

### MongoDB connection errors
1. Check MongoDB is running: `docker compose ps`
2. Verify `MONGODB_URI` in `.env` is correct
3. Check logs: `docker compose logs mongo`

### Build failures
```bash
# Clear cache and rebuild
docker compose build --no-cache
```

### Admin token not working
1. Verify token in `.env` matches what you're entering
2. Clear browser sessionStorage
3. Check logs: `docker compose logs app`

## Next Steps

1. Customize product schema in `models/Product.js` if needed
2. Update homepage styling in `pages/index.js`
3. Configure production environment variables
4. Set up MongoDB backups
5. Deploy to production (see README.md)

