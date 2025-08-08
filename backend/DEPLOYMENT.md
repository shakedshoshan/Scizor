# Scizor AI Backend Deployment Guide

This guide explains how to deploy the existing AI controller endpoints to AWS using Terraform.

## Prerequisites

1. **AWS CLI** configured with appropriate permissions
2. **Terraform** installed (version 1.0+)
3. **Node.js** and npm installed
4. **OpenAI API Key** for AI operations
5. **Firebase Service Account** credentials

## Configuration

1. **Copy the example variables file:**
   ```bash
   cp terraform/terraform.tfvars.example terraform/terraform.tfvars
   ```

2. **Edit `terraform/terraform.tfvars` with your actual values:**
   ```hcl
   openai_api_key = "sk-your-actual-openai-api-key"
   firebase_project_id = "your-firebase-project-id"
   firebase_private_key = "-----BEGIN PRIVATE KEY-----\nYour actual private key\n-----END PRIVATE KEY-----\n"
   firebase_client_email = "firebase-adminsdk-xxxxx@your-project.iam.gserviceaccount.com"
   ```

## Deployment Steps

### Option 1: Using Terraform (Recommended)

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Build the application:**
   ```bash
   npm run build
   ```

3. **Deploy to AWS:**
   ```bash
   cd terraform
   terraform init
   terraform plan
   terraform apply
   ```

4. **Verify deployment:**
   After successful deployment, Terraform will output the API endpoints. You can test the health endpoint:
   ```bash
   curl $(terraform output -raw health_endpoint)
   ```

### Option 2: Manual Lambda Package Deployment

If you encounter issues with the Terraform deployment, you can build and deploy the Lambda package manually:

1. **Use the provided script:**
   ```bash
   chmod +x deploy_lambda.sh
   ./deploy_lambda.sh
   ```

2. **Deploy to an existing Lambda function:**
   ```bash
   aws lambda update-function-code \
     --function-name scizor-ai-backend \
     --zip-file fileb://lambda_package.zip
   ```

## API Endpoints

After deployment, you'll have access to these endpoints:

- **Enhance Prompt:** `POST /ai/enhance-prompt`
- **Generate Response:** `POST /ai/generate-response`
- **Text to Speech:** `POST /ai/text-to-speech`
- **Health Check:** `GET /ai/health`

## Environment Variables

The Lambda function will have these environment variables:
- `NODE_ENV`: Set to "production"
- `OPENAI_API_KEY`: Your OpenAI API key
- `FIREBASE_PROJECT_ID`: Your Firebase project ID
- `FIREBASE_PRIVATE_KEY`: Your Firebase private key
- `FIREBASE_CLIENT_EMAIL`: Your Firebase client email

## Testing the Deployment

1. **Health Check:**
   ```bash
   curl https://your-api-gateway-url/prod/ai/health
   ```

2. **Enhance Prompt:**
   ```bash
   curl -X POST https://your-api-gateway-url/prod/ai/enhance-prompt \
     -H "Content-Type: application/json" \
     -d '{"prompt": "Write a blog post about AI", "user_id": "test-user"}'
   ```

## Cleanup

To remove all deployed resources:
```bash
cd terraform
terraform destroy
```

## Troubleshooting

1. **Missing dependencies:** If you encounter errors about missing modules like `@nestjs/core`, ensure that the Lambda package is being built correctly. The deployment process should:
   - Create a `dist_lambda` directory
   - Copy compiled files from `dist`
   - Copy `package.json`
   - Install production dependencies

2. **Lambda function not found:** Ensure the build completed successfully and the `dist` folder contains the compiled files.

3. **Environment variables not set:** Check that your `terraform.tfvars` file is properly configured.

4. **CORS issues:** The API Gateway is configured with CORS support, but you may need to adjust the allowed origins for production.

5. **Timeout issues:** The Lambda function is configured with a 30-second timeout. Increase if needed for longer AI operations.

6. **Package size too large:** AWS Lambda has a deployment package size limit. If your package exceeds this limit, consider:
   - Using Lambda layers for dependencies
   - Removing unnecessary dependencies
   - Using AWS Lambda container images instead
