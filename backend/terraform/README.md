# Scizor AI Backend - Terraform Infrastructure

This directory contains the Terraform configuration for deploying the Scizor AI Backend to AWS.

## Architecture

- **API Gateway**: REST API with CORS support
- **Lambda**: NestJS application running in serverless environment
- **IAM**: Proper permissions for Lambda execution
- **Binary Media Types**: Configured for audio responses (text-to-speech endpoint)

## Important Notes

### Text-to-Speech Endpoint
The text-to-speech endpoint (`/ai/text-to-speech`) is configured to handle binary audio responses:
- Binary media types are configured in API Gateway for audio formats
- The endpoint supports mp3, opus, aac, and flac audio formats
- Binary responses are properly handled through Lambda proxy integration

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
  - `/ai/enhance-prompt` (POST)
  - `/ai/generate-response` (POST)
  - `/ai/text-to-speech` (POST)
  - `/ai/translate` (POST)
  - `/ai/health` (GET)
- CORS (OPTIONS) for the POST endpoints
- API Gateway deployment and `prod` stage

## Outputs

- `api_gateway_url` - API execution ARN
- `api_endpoint` - Base URL for the deployed stage
- `enhance_prompt_endpoint` - Full URL for the enhance-prompt route
- `generate_response_endpoint` - Full URL for the generate-response route
- `text_to_speech_endpoint` - Full URL for the text-to-speech route
- `translate_endpoint` - Full URL for the translate route
- `health_endpoint` - Full URL for the health route
- `lambda_function_name` - Name of the Lambda function
- `lambda_function_arn` - ARN of the Lambda function

Note: Do not commit real secrets to `terraform.tfvars`. Use environment variables, a secure secrets manager, or an example file (e.g., `terraform.tfvars.example`).
