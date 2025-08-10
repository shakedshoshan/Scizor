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
  description = "Endpoint for prompt enhancement"
  value       = "https://${aws_api_gateway_rest_api.scizor_ai_api.id}.execute-api.${var.aws_region}.amazonaws.com/${aws_api_gateway_stage.scizor_ai_stage.stage_name}/ai/enhance-prompt"
}

output "generate_response_endpoint" {
  description = "Endpoint for response generation"
  value       = "https://${aws_api_gateway_rest_api.scizor_ai_api.id}.execute-api.${var.aws_region}.amazonaws.com/${aws_api_gateway_stage.scizor_ai_stage.stage_name}/ai/generate-response"
}

output "text_to_speech_endpoint" {
  description = "Endpoint for text-to-speech conversion"
  value       = "https://${aws_api_gateway_rest_api.scizor_ai_api.id}.execute-api.${var.aws_region}.amazonaws.com/${aws_api_gateway_stage.scizor_ai_stage.stage_name}/ai/text-to-speech"
}

output "health_endpoint" {
  description = "Endpoint for health check"
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
