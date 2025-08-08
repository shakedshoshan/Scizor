# Terraform AWS Serverless API

This directory contains Terraform configuration for deploying a simple serverless API on AWS using Lambda and API Gateway.

## Project Structure

The Terraform configuration is organized into multiple files for better maintainability:

- `main.tf` - Main entry point (no resources defined here)
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

- AWS Lambda function with Python 3.9 runtime
- IAM role and policy for the Lambda function
- API Gateway REST API with a `/hello` endpoint
- API Gateway deployment and stage

## Outputs

- `invoke_url` - The URL to invoke the API endpoint
