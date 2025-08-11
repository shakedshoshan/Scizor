#!/bin/bash

# Scizor Authentication Setup Script
# This script helps set up the secure authentication environment

echo "🔐 Scizor Authentication Security Setup"
echo "========================================"

# Check if .env file exists
if [ -f ".env" ]; then
    echo "⚠️  .env file already exists. Backing up to .env.backup"
    cp .env .env.backup
fi

# Generate secure secrets
echo "🔑 Generating secure secrets..."

# Generate JWT secret (64 characters)
JWT_SECRET=$(openssl rand -base64 48 | tr -d "=+/" | cut -c1-64)

# Generate session secret (64 characters)
SESSION_SECRET=$(openssl rand -base64 48 | tr -d "=+/" | cut -c1-64)

# Create .env file
cat > .env << EOF
# Scizor Authentication Environment Configuration
# Generated on $(date)

# JWT Configuration
JWT_SECRET=${JWT_SECRET}
SESSION_SECRET=${SESSION_SECRET}

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
EOF

echo "✅ .env file created with secure secrets"
echo ""
echo "🔒 Security Configuration:"
echo "  JWT Secret: ${JWT_SECRET:0:20}..."
echo "  Session Secret: ${SESSION_SECRET:0:20}..."
echo ""
echo "⚠️  IMPORTANT SECURITY NOTES:"
echo "  1. Keep your .env file secure and never commit it to version control"
echo "  2. Use different secrets for each environment (dev, staging, prod)"
echo "  3. Rotate secrets regularly in production"
echo "  4. Ensure HTTPS is enabled in production"
echo ""
echo "🚀 Next steps:"
echo "  1. Configure your database connection string"
echo "  2. Set up Firebase credentials"
echo "  3. Start your backend server"
echo "  4. Test the authentication flow"
echo ""
echo "📚 For more information, see AUTHENTICATION_SECURITY_README.md"
