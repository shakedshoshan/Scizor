#!/bin/bash
# Script to build and deploy the Lambda package

set -e  # Exit on any error

echo "🚀 Building Lambda package for Scizor AI Backend..."

# Clean up any previous build artifacts
echo "🧹 Cleaning up previous builds..."
rm -rf dist_lambda
mkdir -p dist_lambda

# Build the NestJS application
echo "🔨 Building NestJS application..."
npm run build

# Copy the compiled files to the Lambda package directory
echo "📦 Preparing Lambda package..."
cp -r dist/* dist_lambda/
cp package.json dist_lambda/

# Install production dependencies in the Lambda package
echo "📚 Installing production dependencies..."
cd dist_lambda
npm install --production
cd ..

# Create the deployment package
echo "🗜️ Creating deployment package..."
cd dist_lambda
zip -r ../lambda_package.zip .
cd ..

echo "✅ Lambda package created: lambda_package.zip"
echo "📊 Package size: $(du -h lambda_package.zip | cut -f1)"

# Check if the package size is too large for Lambda
MAX_SIZE_MB=50
PACKAGE_SIZE_KB=$(du -k lambda_package.zip | cut -f1)
PACKAGE_SIZE_MB=$((PACKAGE_SIZE_KB / 1024))

if [ $PACKAGE_SIZE_MB -gt $MAX_SIZE_MB ]; then
  echo "⚠️ Warning: Package size ($PACKAGE_SIZE_MB MB) exceeds Lambda's recommended limit ($MAX_SIZE_MB MB)"
  echo "Consider using Lambda Layers or container images for large dependencies."
else
  echo "✅ Package size is within Lambda's limits"
fi

echo ""
echo "To deploy manually to AWS Lambda:"
echo "aws lambda update-function-code --function-name scizor-ai-backend --zip-file fileb://lambda_package.zip"
