# PowerShell script to set up .env file with required variables

$envFile = ".env"

Write-Host "=== MyPetEats Environment Setup ===" -ForegroundColor Cyan
Write-Host ""

# Check if .env exists
if (Test-Path $envFile) {
    Write-Host "Found existing .env file" -ForegroundColor Yellow
    $overwrite = Read-Host "Do you want to update it? (y/n)"
    if ($overwrite -ne "y" -and $overwrite -ne "Y") {
        Write-Host "Skipping .env update" -ForegroundColor Yellow
        exit 0
    }
} else {
    Write-Host "Creating new .env file..." -ForegroundColor Green
}

# Read existing .env if it exists
$envContent = @{}
if (Test-Path $envFile) {
    Get-Content $envFile | ForEach-Object {
        if ($_ -match '^\s*([^#=]+)=(.*)$') {
            $envContent[$matches[1].Trim()] = $matches[2].Trim()
        }
    }
}

# Generate JWT_SECRET if not set
if (-not $envContent.ContainsKey("JWT_SECRET") -or [string]::IsNullOrWhiteSpace($envContent["JWT_SECRET"])) {
    Write-Host "Generating JWT_SECRET..." -ForegroundColor Green
    $jwtSecret = -join ((65..90) + (97..122) + (48..57) | Get-Random -Count 64 | ForEach-Object {[char]$_})
    $envContent["JWT_SECRET"] = $jwtSecret
    Write-Host "  Generated JWT_SECRET" -ForegroundColor Gray
}

# Set defaults for other variables if not present
if (-not $envContent.ContainsKey("MONGODB_URI")) {
    $envContent["MONGODB_URI"] = "mongodb://mongo:27017/store"
    Write-Host "Set MONGODB_URI to default" -ForegroundColor Green
}

if (-not $envContent.ContainsKey("APP_ADMIN_TOKEN")) {
    $adminToken = -join ((65..90) + (97..122) + (48..57) | Get-Random -Count 32 | ForEach-Object {[char]$_})
    $envContent["APP_ADMIN_TOKEN"] = $adminToken
    Write-Host "Generated APP_ADMIN_TOKEN" -ForegroundColor Green
}

# Write .env file
$output = @()
$output += "# MongoDB Connection"
$output += "MONGODB_URI=$($envContent['MONGODB_URI'])"
$output += ""
$output += "# Admin Authentication (legacy token-based, optional if using user-based admin auth)"
$output += "APP_ADMIN_TOKEN=$($envContent['APP_ADMIN_TOKEN'])"
$output += ""
$output += "# JWT Secret for user authentication (REQUIRED)"
$output += "# Generate a strong random string for production"
$output += "JWT_SECRET=$($envContent['JWT_SECRET'])"

$output | Out-File -FilePath $envFile -Encoding utf8

Write-Host ""
Write-Host ".env file created/updated successfully!" -ForegroundColor Green
Write-Host ""
Write-Host "Next steps:" -ForegroundColor Cyan
Write-Host "1. Review the .env file and adjust values if needed"
Write-Host "2. Start Docker containers with:"
Write-Host "   docker compose -f docker-compose.yml -f docker-compose.dev.yml up --build"
Write-Host ""
