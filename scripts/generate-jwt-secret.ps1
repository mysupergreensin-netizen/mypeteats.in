# Generate a secure JWT_SECRET for Vercel
# This script generates a 64-character random alphanumeric string

Write-Host "`n🔐 Generating JWT_SECRET...`n" -ForegroundColor Cyan

# Generate a 64-character random string using alphanumeric characters
$chars = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789"
$secret = ""
for ($i = 0; $i -lt 64; $i++) {
    $secret += $chars[(Get-Random -Maximum $chars.Length)]
}

Write-Host "✅ Generated JWT_SECRET:`n" -ForegroundColor Green
Write-Host $secret -ForegroundColor Yellow
Write-Host "`n📋 Copy this value and add it to Vercel:`n" -ForegroundColor Cyan
Write-Host "1. Go to Vercel Dashboard → Your Project → Settings → Environment Variables" -ForegroundColor White
Write-Host "2. Click 'Add New'" -ForegroundColor White
Write-Host "3. Fill in:" -ForegroundColor White
Write-Host "   Key: JWT_SECRET" -ForegroundColor White
Write-Host "   Value: $secret" -ForegroundColor Yellow
Write-Host "   Environment: Production, Preview, Development" -ForegroundColor White
Write-Host "4. Click Save" -ForegroundColor White
Write-Host "5. Redeploy your project`n" -ForegroundColor White

# Also copy to clipboard if possible
try {
    $secret | Set-Clipboard
    Write-Host "✅ JWT_SECRET has been copied to your clipboard!`n" -ForegroundColor Green
} catch {
    Write-Host "⚠️  Could not copy to clipboard. Please copy manually.`n" -ForegroundColor Yellow
}
