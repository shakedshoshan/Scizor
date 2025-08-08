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
      NODE_ENV = "production"
      OPENAI_API_KEY = var.openai_api_key
      FIREBASE_PROJECT_ID = var.firebase_project_id
      FIREBASE_PRIVATE_KEY = var.firebase_private_key
      FIREBASE_CLIENT_EMAIL = var.firebase_client_email
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
    command = <<-EOT
      mkdir -p ${path.module}/../dist_lambda
      cp -r ${path.module}/../dist/* ${path.module}/../dist_lambda/
      cp ${path.module}/../package.json ${path.module}/../dist_lambda/
      cd ${path.module}/../dist_lambda && npm install --production
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
