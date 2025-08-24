# Outputs for Scizor AI Backend

output "api_gateway_url" {
  description = "URL of the API Gateway"
  value       = aws_api_gateway_rest_api.scizor_ai_api.execution_arn
}

output "api_endpoint" {
  description = "Base URL for the API endpoints"
  value       = "https://${aws_api_gateway_rest_api.scizor_ai_api.id}.execute-api.${var.aws_region}.amazonaws.com/${aws_api_gateway_stage.scizor_ai_stage.stage_name}"
}

output "enhance_prompt_endpoint" {
  description = "Endpoint for prompt enhancement (requires JWT authentication)"
  value       = "https://${aws_api_gateway_rest_api.scizor_ai_api.id}.execute-api.${var.aws_region}.amazonaws.com/${aws_api_gateway_stage.scizor_ai_stage.stage_name}/ai/enhance-prompt"
}

output "generate_response_endpoint" {
  description = "Endpoint for response generation (requires JWT authentication)"
  value       = "https://${aws_api_gateway_rest_api.scizor_ai_api.id}.execute-api.${var.aws_region}.amazonaws.com/${aws_api_gateway_stage.scizor_ai_stage.stage_name}/ai/generate-response"
}

output "text_to_speech_endpoint" {
  description = "Endpoint for text-to-speech conversion (requires JWT authentication)"
  value       = "https://${aws_api_gateway_rest_api.scizor_ai_api.id}.execute-api.${var.aws_region}.amazonaws.com/${aws_api_gateway_stage.scizor_ai_stage.stage_name}/ai/text-to-speech"
}

output "translate_endpoint" {
  description = "Endpoint for text translation (requires JWT authentication)"
  value       = "https://${aws_api_gateway_rest_api.scizor_ai_api.id}.execute-api.${var.aws_region}.amazonaws.com/${aws_api_gateway_stage.scizor_ai_stage.stage_name}/ai/translate"
}

output "health_endpoint" {
  description = "Endpoint for health check (public, no authentication required)"
  value       = "https://${aws_api_gateway_rest_api.scizor_ai_api.id}.execute-api.${var.aws_region}.amazonaws.com/${aws_api_gateway_stage.scizor_ai_stage.stage_name}/ai/health"
}

output "lambda_function_name" {
  description = "Name of the Lambda function"
  value       = aws_lambda_function.scizor_ai_lambda.function_name
}

output "lambda_function_arn" {
  description = "ARN of the Lambda function"
  value       = aws_lambda_function.scizor_ai_lambda.arn
}

output "authentication_info" {
  description = "Authentication requirements for API endpoints"
  value = {
    secured_endpoints = ["enhance-prompt", "generate-response", "text-to-speech", "translate"]
    public_endpoints = ["health"]
    auth_method = "JWT Bearer token in Authorization header"
    auth_endpoints = ["auth/create-user-token", "auth/device/token", "auth/device/refresh"]
  }
}

# Monitoring outputs
output "grafana_cloudwatch_role_arn" {
  description = "ARN of the IAM role for Grafana CloudWatch access"
  value       = aws_iam_role.grafana_cloudwatch_role.arn
}

output "cloudwatch_log_groups" {
  description = "CloudWatch log groups for monitoring"
  value = {
    api_gateway = aws_cloudwatch_log_group.api_gateway_logs.name
    lambda      = aws_cloudwatch_log_group.lambda_logs.name
  }
}

output "monitoring_dashboard_url" {
  description = "URL to the Grafana monitoring dashboard"
  value       = try("${data.grafana_cloud_stack.monitoring_stack.url}/d/scizor-ai-backend-monitoring", "Configure Grafana Cloud first")
}

output "grafana_integration_info" {
  description = "Information for setting up Grafana Cloud integration"
  value = {
    role_arn          = aws_iam_role.grafana_cloudwatch_role.arn
    external_id_note  = "Use the external ID from your Grafana Cloud AWS integration setup"
    regions           = [var.aws_region]
    scrape_jobs = [
      "scizor-ai-api-gateway-metrics",
      "scizor-ai-lambda-metrics", 
      "scizor-ai-custom-metrics"
    ]
  }
}