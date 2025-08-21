# Scizor AI Backend - Terraform Infrastructure

This directory contains the Terraform configuration for deploying the Scizor AI Backend to AWS with secure JWT authentication.

## Architecture

- **API Gateway**: REST API with CORS support and secure AI endpoints
- **Lambda**: NestJS application running in serverless environment with JWT authentication
- **IAM**: Proper permissions for Lambda execution
- **Binary Media Types**: Configured for audio responses (text-to-speech endpoint)
- **Security**: JWT-based authentication for AI endpoints at application level

## Important Notes

### Security Model
The API uses a secure authentication model:
- **Secured Endpoints**: All AI endpoints (`enhance-prompt`, `generate-response`, `text-to-speech`, `translate`) require JWT authentication
- **Public Endpoints**: Health check endpoint (`/ai/health`) is public for monitoring
- **Authentication**: JWT tokens validated at application level using NestJS guards
- **Authorization Header**: Use `Authorization: Bearer <jwt_token>` for authenticated requests
- **Token Management**: Get tokens from `/auth/create-user-token` or `/auth/device/token` endpoints

### Text-to-Speech Endpoint
The text-to-speech endpoint (`/ai/text-to-speech`) is configured to handle binary audio responses:
- Binary media types are configured in API Gateway for audio formats
- The endpoint supports mp3, opus, aac, and flac audio formats
- Binary responses are properly handled through Lambda proxy integration
- **Requires JWT authentication** like other AI endpoints

## Deployment

1. Initialize the Terraform working directory:
   ```
   terraform init
   ```

2. Preview the changes:
   ```
   terraform plan
   ```

3. Apply the changes:
   ```
   terraform apply
   ```

4. To destroy the resources:
   ```
   terraform destroy
   ```

## Resources Created

- AWS Lambda function with Node.js 18.x runtime
- IAM role and policy attachments for the Lambda function
- API Gateway REST API with the following resources:
 - `/ai/enhance-prompt` (POST) - **Secured with JWT**
 - `/ai/generate-response` (POST) - **Secured with JWT**
 - `/ai/text-to-speech` (POST) - **Secured with JWT**
 - `/ai/translate` (POST) - **Secured with JWT**
 - `/ai/health` (GET) - **Public endpoint**
 - `/auth/create-user-token` (POST) - Authentication endpoint
 - `/auth/device/token` (POST) - Device authentication endpoint
 - `/auth/device/refresh` (POST) - Token refresh endpoint
 - `/payment/*` - Payment-related endpoints
- CORS (OPTIONS) for all endpoints
- API Gateway deployment and `prod` stage

## Outputs

- `api_gateway_url` - API execution ARN
- `api_endpoint` - Base URL for the deployed stage
- `enhance_prompt_endpoint` - Full URL for the enhance-prompt route (requires JWT)
- `generate_response_endpoint` - Full URL for the generate-response route (requires JWT)
- `text_to_speech_endpoint` - Full URL for the text-to-speech route (requires JWT)
- `translate_endpoint` - Full URL for the translate route (requires JWT)
- `health_endpoint` - Full URL for the health route (public)
- `lambda_function_name` - Name of the Lambda function
- `lambda_function_arn` - ARN of the Lambda function
- `authentication_info` - Security requirements and endpoint classifications

## Usage Examples

### Getting a JWT Token
```bash
# Create user token
curl -X POST https://your-api-gateway-url/auth/create-user-token \
  -H "Content-Type: application/json" \
  -d '{"user_id": "your-user-id"}'
```

### Using Secured AI Endpoints
```bash
# Example: Enhance prompt (requires JWT)
curl -X POST https://your-api-gateway-url/ai/enhance-prompt \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer your-jwt-token" \
  -d '{"prompt": "Write a story", "enhancementType": "creative"}'
```

### Public Health Check
```bash
# Health check (no authentication required)
curl https://your-api-gateway-url/ai/health
```

## Security Notes

- **JWT Secret**: Ensure `jwt_secret` variable is set with a strong secret (minimum 32 characters)
- **Token Validation**: All secured endpoints validate JWT tokens at the application level
- **Token Expiration**: Access tokens expire after 1 hour, refresh tokens after 7 days
- **CORS**: Configured for web browser compatibility
- **No Secrets in Git**: Do not commit real secrets to `terraform.tfvars`. Use environment variables, a secure secrets manager, or an example file (e.g., `terraform.tfvars.example`).
