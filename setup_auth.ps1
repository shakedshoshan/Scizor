# Scizor Authentication Security Setup Script (PowerShell)
# This script helps set up the secure authentication environment on Windows

Write-Host "🔐 Scizor Authentication Security Setup" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan

# Check if .env file exists
if (Test-Path ".env") {
    Write-Host "⚠️  .env file already exists. Backing up to .env.backup" -ForegroundColor Yellow
    Copy-Item ".env" ".env.backup"
}

# Generate secure secrets
Write-Host "🔑 Generating secure secrets..." -ForegroundColor Green

# Generate JWT secret (64 characters)
$JWT_SECRET = -join ((33..126) | Get-Random -Count 64 | ForEach-Object {[char]$_})

# Generate session secret (64 characters)
$SESSION_SECRET = -join ((33..126) | Get-Random -Count 64 | ForEach-Object {[char]$_})

# Create .env file
$envContent = @"
# Scizor Authentication Environment Configuration
# Generated on $(Get-Date)

# JWT Configuration
JWT_SECRET=$JWT_SECRET
SESSION_SECRET=$SESSION_SECRET

# Server Configuration
PORT=5000
NODE_ENV=development

# CORS Configuration
CORS_ORIGIN=http://localhost:3000,http://localhost:8080

# Rate Limiting
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100

# Security
BCRYPT_ROUNDS=12

# Database (configure as needed)
DATABASE_URL=your-database-connection-string

# Firebase (configure as needed)
FIREBASE_PROJECT_ID=your-firebase-project-id
FIREBASE_PRIVATE_KEY=your-firebase-private-key
FIREBASE_CLIENT_EMAIL=your-firebase-client-email

# Logging
LOG_LEVEL=info
LOG_FILE=logs/app.log
"@

$envContent | Out-File -FilePath ".env" -Encoding UTF8

Write-Host "✅ .env file created with secure secrets" -ForegroundColor Green
Write-Host ""
Write-Host "🔒 Security Configuration:" -ForegroundColor Cyan
Write-Host "  JWT Secret: $($JWT_SECRET.Substring(0,20)..." -ForegroundColor White
Write-Host "  Session Secret: $($SESSION_SECRET.Substring(0,20)..." -ForegroundColor White
Write-Host ""
Write-Host "⚠️  IMPORTANT SECURITY NOTES:" -ForegroundColor Yellow
Write-Host "  1. Keep your .env file secure and never commit it to version control" -ForegroundColor White
Write-Host "  2. Use different secrets for each environment (dev, staging, prod)" -ForegroundColor White
Write-Host "  3. Rotate secrets regularly in production" -ForegroundColor White
Write-Host "  4. Ensure HTTPS is enabled in production" -ForegroundColor White
Write-Host ""
Write-Host "🚀 Next steps:" -ForegroundColor Green
Write-Host "  1. Configure your database connection string" -ForegroundColor White
Write-Host "  2. Set up Firebase credentials" -ForegroundColor White
Write-Host "  3. Start your backend server" -ForegroundColor White
Write-Host "  4. Test the authentication flow" -ForegroundColor White
Write-Host ""
Write-Host "📚 For more information, see AUTHENTICATION_SECURITY_README.md" -ForegroundColor Cyan
