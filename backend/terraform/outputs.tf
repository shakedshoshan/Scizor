# scizor/terraform/outputs.tf
output "openai_secret_arn" {
  description = "ARN of the OpenAI API Key secret"
  value       = aws_secretsmanager_secret.openai_api_key_secret.arn
}

output "lambda_function_name" {
  description = "Name of the deployed Lambda function"
  value       = aws_lambda_function.ai_lambda.function_name
}

output "api_gateway_endpoint" {
  description = "Base URL of the API Gateway"
  value       = aws_apigatewayv2_api.http_api.api_endpoint
} 