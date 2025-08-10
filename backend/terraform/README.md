# Terraform AWS Serverless API

This directory contains Terraform configuration for deploying a serverless API on AWS using Lambda and API Gateway.

## Project Structure

The Terraform configuration is organized into multiple files for better maintainability:

- `main.tf` - Main entry point (organizational only)
- `providers.tf` - AWS provider configuration
- `variables.tf` - Variable definitions
- `lambda.tf` - Lambda function and related resources
- `iam.tf` - IAM roles and policies
- `api_gateway.tf` - API Gateway configuration
- `outputs.tf` - Output values

## Usage

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
  - `/ai/health` (GET)
- CORS (OPTIONS) for the POST endpoints
- API Gateway deployment and `prod` stage

## Outputs

- `api_gateway_url` - API execution ARN
- `api_endpoint` - Base URL for the deployed stage
- `enhance_prompt_endpoint` - Full URL for the enhance-prompt route
- `generate_response_endpoint` - Full URL for the generate-response route
- `text_to_speech_endpoint` - Full URL for the text-to-speech route
- `health_endpoint` - Full URL for the health route
- `lambda_function_name` - Name of the Lambda function
- `lambda_function_arn` - ARN of the Lambda function

Note: Do not commit real secrets to `terraform.tfvars`. Use environment variables, a secure secrets manager, or an example file (e.g., `terraform.tfvars.example`).
