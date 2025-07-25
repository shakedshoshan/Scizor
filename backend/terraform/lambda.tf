# scizor/terraform/lambda.tf
resource "aws_lambda_function" "ai_lambda" {
  function_name = "scizor-ai-backend-${var.environment}"
  role          = aws_iam_role.lambda_exec_role.arn
  handler       = "dist/main.handler" # This will be updated by Serverless
  runtime       = "nodejs18.x"
  timeout       = 30
  memory_size   = 256
  publish       = true # Publish new versions

  # Placeholder for actual code package. Serverless will update this.
  # For initial `terraform apply`, you might need a dummy zip.
  filename      = "dummy.zip" # This will be overwritten by Serverless
  source_code_hash = filebase64sha256("dummy.zip") # This will be overwritten by Serverless

  environment {
    variables = {
      NODE_ENV = var.environment
      # Reference secrets via SSM Parameter Store integration
      OPENAI_API_KEY_SECRET_ARN = aws_secretsmanager_secret.openai_api_key_secret.arn
    }
  }

  tracing_config {
    mode = "Active" # Enable X-Ray tracing
  }

  tags = {
    Project = "Scizor"
    Environment = var.environment
  }
} 