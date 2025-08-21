# Format Firebase private key for Lambda environment
locals {
  # Convert escaped newlines to actual newlines for Lambda environment
  firebase_private_key_formatted = replace(var.firebase_private_key, "\\n", "\n")
}

# Create the Lambda function for Scizor AI Backend
resource "aws_lambda_function" "scizor_ai_lambda" {
  function_name    = "scizor-ai-backend"
  handler          = "lambda.handler"
  runtime          = "nodejs18.x"
  role             = aws_iam_role.lambda_exec_role.arn
  filename         = data.archive_file.scizor_ai_zip.output_path
  source_code_hash = data.archive_file.scizor_ai_zip.output_base64sha256

  # Environment variables for the Lambda function
  environment {
    variables = {
      NODE_ENV            = "production"
      OPENAI_API_KEY      = var.openai_api_key
      FIREBASE_PROJECT_ID = var.firebase_project_id
      FIREBASE_CLIENT_EMAIL = var.firebase_client_email
      FIREBASE_PRIVATE_KEY  = local.firebase_private_key_formatted
      JWT_SECRET          = var.jwt_secret
    }
  }

  # Memory and timeout settings for AI operations
  memory_size = 1024
  timeout     = 30
}

# Archive the NestJS application with dependencies
data "archive_file" "scizor_ai_zip" {
  type        = "zip"
  source_dir  = "${path.module}/../dist_lambda"
  output_path = "${path.module}/scizor_ai_payload.zip"

  depends_on = [
    null_resource.prepare_lambda_package
  ]
}

# Prepare Lambda package with dependencies
resource "null_resource" "prepare_lambda_package" {
  triggers = {
    always_run = "${timestamp()}"
  }

  provisioner "local-exec" {
    interpreter = [
      "PowerShell",
      "-NoProfile",
      "-NonInteractive",
      "-ExecutionPolicy",
      "Bypass",
      "-Command"
    ]
    command = <<-EOT
      $ErrorActionPreference = 'Stop'
      $dist = Join-Path -Path "${path.module}" -ChildPath "../dist_lambda"
      if (Test-Path $dist) { Remove-Item -Recurse -Force $dist }
      New-Item -ItemType Directory -Force -Path $dist | Out-Null
      
      # Copy built application
      Copy-Item -Recurse -Force "${path.module}/../dist/*" -Destination $dist
      
      # Copy package files
      Copy-Item -Force "${path.module}/../package.json" -Destination $dist
      if (Test-Path "${path.module}/../package-lock.json") {
        Copy-Item -Force "${path.module}/../package-lock.json" -Destination $dist
      }
      
      # Install production dependencies
      Push-Location $dist
      Write-Host "Installing dependencies in $dist"
      if (Test-Path "package-lock.json") {
        npm ci --omit=dev --silent
      } else {
        npm install --production --silent
      }
      
      # Verify serverless-express is installed
      if (Test-Path "node_modules/@vendia/serverless-express") {
        Write-Host "✓ serverless-express found"
      } else {
        Write-Host "✗ serverless-express NOT found - checking node_modules"
        Get-ChildItem node_modules | ForEach-Object { Write-Host "  - $($_.Name)" }
        throw "serverless-express dependency missing"
      }
      Pop-Location
    EOT
  }
}

# Grant API Gateway permission to invoke the Lambda function
resource "aws_lambda_permission" "apigw_lambda" {
  statement_id  = "AllowAPIGatewayToInvoke"
  action        = "lambda:InvokeFunction"
  function_name = aws_lambda_function.scizor_ai_lambda.function_name
  principal     = "apigateway.amazonaws.com"

  # The source ARN ensures that only our specific API Gateway can invoke the function.
  source_arn = "${aws_api_gateway_rest_api.scizor_ai_api.execution_arn}/*/*"
}

# Note: No separate authorizer permission needed as authentication is handled at application level