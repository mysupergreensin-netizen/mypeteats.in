# Simple JWT_SECRET Generator
$random = New-Object System.Random
$chars = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789"
$secret = ""
for ($i = 0; $i -lt 64; $i++) {
    $secret += $chars[$random.Next(0, $chars.Length)]
}
Write-Output $secret
