# Scizor Terraform Infrastructure

This directory contains the Terraform configuration for deploying the Scizor serverless API on AWS.

## Prerequisites

1. **AWS CLI** installed and configured with appropriate credentials
2. **Terraform** installed (version 1.0 or later)
3. **AWS Account** with appropriate permissions
4. **S3 Bucket** for storing Terraform state (will be created automatically)
5. **DynamoDB Table** for state locking (will be created automatically)

## Quick Start

### 1. Initialize Terraform

```bash
cd backend/terraform
terraform init
```

### 2. Create a terraform.tfvars file

Create a `terraform.tfvars` file with your configuration:

```hcl
aws_region = "us-east-1"
aws_account_id = "123456789012"  # Your AWS Account ID
environment = "dev"
openai_api_key = "your-openai-api-key-here"
firebase_service_account_key_json = "{\"type\":\"service_account\",...}"  # Your Firebase service account JSON
```

### 3. Plan the deployment

```bash
terraform plan
```

### 4. Apply the configuration

```bash
terraform apply
```

## Infrastructure Components

- **S3 Backend**: Remote state storage with DynamoDB locking
- **Lambda Function**: Serverless function for your AI backend
- **API Gateway**: HTTP API with routes for your endpoints
- **IAM Roles**: Permissions for Lambda execution and Secrets Manager access
- **Secrets Manager**: Secure storage for API keys and credentials

## Files Overview

- `main.tf`: AWS provider configuration and S3 backend setup
- `variables.tf`: Input variables definition
- `iam.tf`: IAM roles and policies for Lambda
- `secrets.tf`: AWS Secrets Manager configuration
- `lambda.tf`: Lambda function definition
- `api_gateway.tf`: API Gateway configuration
- `outputs.tf`: Output values after deployment

## Important Notes

1. **State Management**: The configuration uses S3 backend for remote state storage. Make sure the S3 bucket name is unique across your AWS account.

2. **Secrets**: Sensitive data like API keys are stored in AWS Secrets Manager, not in Terraform state.

3. **Lambda Code**: The Lambda function uses a placeholder `dummy.zip` file. In production, you'll need to replace this with your actual code deployment process.

4. **Environment Variables**: The Lambda function receives secret ARNs as environment variables, which it can use to retrieve the actual secrets at runtime.

## Cleanup

To destroy all resources:

```bash
terraform destroy
```

⚠️ **Warning**: This will permanently delete all created resources! 