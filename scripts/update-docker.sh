#!/bin/bash
# Bash script to update Docker setup with Razorpay integration
# Run this script after adding Razorpay credentials to .env

echo "=== MyPetEats Docker Update Script ==="
echo ""

# Check if .env exists
if [ ! -f ".env" ]; then
    echo "ERROR: .env file not found!"
    echo "Please create .env file with required variables first."
    exit 1
fi

# Check for Razorpay variables
if ! grep -q "RAZORPAY_KEY_ID" .env; then
    echo "WARNING: RAZORPAY_KEY_ID not found in .env"
    echo "Razorpay integration will not work without these variables:"
    echo "  - RAZORPAY_KEY_ID"
    echo "  - RAZORPAY_KEY_SECRET"
    echo "  - RAZORPAY_WEBHOOK_SECRET (optional)"
    echo ""
    read -p "Continue anyway? (y/n) " -n 1 -r
    echo ""
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        exit 0
    fi
fi

echo "Stopping existing containers..."
docker compose down

echo ""
echo "Rebuilding Docker images (this may take a few minutes)..."
echo "This will install the razorpay package and other dependencies."
docker compose build --no-cache

if [ $? -ne 0 ]; then
    echo ""
    echo "ERROR: Build failed!"
    echo "Check the error messages above."
    exit 1
fi

echo ""
echo "Starting services..."
docker compose up -d

if [ $? -ne 0 ]; then
    echo ""
    echo "ERROR: Failed to start services!"
    exit 1
fi

echo ""
echo "Waiting for services to be healthy..."
sleep 10

echo ""
echo "Checking service status..."
docker compose ps

echo ""
echo "Verifying Razorpay package installation..."
if docker compose exec -T app npm list razorpay 2>&1 | grep -q "razorpay@"; then
    echo "✓ Razorpay package installed successfully"
else
    echo "⚠ Warning: Could not verify Razorpay package"
fi

echo ""
echo "=== Update Complete ==="
echo ""
echo "Next steps:"
echo "1. Check logs: docker compose logs -f app"
echo "2. Verify Razorpay env vars: docker compose exec app env | grep RAZORPAY"
echo "3. Test the application at http://localhost:9000"
echo "4. Test checkout flow with Razorpay"
echo ""
echo "For development mode:"
echo "  docker compose -f docker-compose.yml -f docker-compose.dev.yml up"
echo ""

