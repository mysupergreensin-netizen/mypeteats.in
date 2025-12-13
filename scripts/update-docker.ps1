# PowerShell script to update Docker setup with Razorpay integration
# Run this script after adding Razorpay credentials to .env

Write-Host "=== MyPetEats Docker Update Script ===" -ForegroundColor Cyan
Write-Host ""

# Check if .env exists
if (-not (Test-Path ".env")) {
    Write-Host "ERROR: .env file not found!" -ForegroundColor Red
    Write-Host "Please create .env file with required variables first." -ForegroundColor Yellow
    exit 1
}

# Check for Razorpay variables
$envContent = Get-Content ".env" -Raw
$hasRazorpay = $envContent -match "RAZORPAY_KEY_ID"

if (-not $hasRazorpay) {
    Write-Host "WARNING: RAZORPAY_KEY_ID not found in .env" -ForegroundColor Yellow
    Write-Host "Razorpay integration will not work without these variables:" -ForegroundColor Yellow
    Write-Host "  - RAZORPAY_KEY_ID" -ForegroundColor Gray
    Write-Host "  - RAZORPAY_KEY_SECRET" -ForegroundColor Gray
    Write-Host "  - RAZORPAY_WEBHOOK_SECRET (optional)" -ForegroundColor Gray
    Write-Host ""
    $continue = Read-Host "Continue anyway? (y/n)"
    if ($continue -ne "y" -and $continue -ne "Y") {
        exit 0
    }
}

Write-Host "Stopping existing containers..." -ForegroundColor Green
docker compose down

Write-Host ""
Write-Host "Rebuilding Docker images (this may take a few minutes)..." -ForegroundColor Green
Write-Host "This will install the razorpay package and other dependencies." -ForegroundColor Gray
docker compose build --no-cache

if ($LASTEXITCODE -ne 0) {
    Write-Host ""
    Write-Host "ERROR: Build failed!" -ForegroundColor Red
    Write-Host "Check the error messages above." -ForegroundColor Yellow
    exit 1
}

Write-Host ""
Write-Host "Starting services..." -ForegroundColor Green
docker compose up -d

if ($LASTEXITCODE -ne 0) {
    Write-Host ""
    Write-Host "ERROR: Failed to start services!" -ForegroundColor Red
    exit 1
}

Write-Host ""
Write-Host "Waiting for services to be healthy..." -ForegroundColor Green
Start-Sleep -Seconds 10

Write-Host ""
Write-Host "Checking service status..." -ForegroundColor Green
docker compose ps

Write-Host ""
Write-Host "Verifying Razorpay package installation..." -ForegroundColor Green
$razorpayCheck = docker compose exec -T app npm list razorpay 2>&1
if ($razorpayCheck -match "razorpay@") {
    Write-Host "✓ Razorpay package installed successfully" -ForegroundColor Green
} else {
    Write-Host "⚠ Warning: Could not verify Razorpay package" -ForegroundColor Yellow
}

Write-Host ""
Write-Host "=== Update Complete ===" -ForegroundColor Cyan
Write-Host ""
Write-Host "Next steps:" -ForegroundColor Yellow
Write-Host "1. Check logs: docker compose logs -f app" -ForegroundColor Gray
Write-Host "2. Verify Razorpay env vars: docker compose exec app env | Select-String RAZORPAY" -ForegroundColor Gray
Write-Host "3. Test the application at http://localhost:9000" -ForegroundColor Gray
Write-Host "4. Test checkout flow with Razorpay" -ForegroundColor Gray
Write-Host ""
Write-Host "For development mode:" -ForegroundColor Yellow
Write-Host "  docker compose -f docker-compose.yml -f docker-compose.dev.yml up" -ForegroundColor Gray
Write-Host ""

