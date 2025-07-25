# scizor/terraform/api_gateway.tf
resource "aws_apigatewayv2_api" "http_api" {
  name          = "scizor-ai-api-${var.environment}"
  protocol_type = "HTTP"
  tags = {
    Project = "Scizor"
    Environment = var.environment
  }
}

resource "aws_apigatewayv2_integration" "ai_lambda_integration" {
  api_id           = aws_apigatewayv2_api.http_api.id
  integration_type = "AWS_PROXY"
  integration_uri  = aws_lambda_function.ai_lambda.invoke_arn
  integration_method = "POST" # Lambda proxy integration uses POST
}

resource "aws_apigatewayv2_route" "enhance_prompt_route" {
  api_id    = aws_apigatewayv2_api.http_api.id
  route_key = "POST /ai/enhance-prompt"
  target    = "integrations/${aws_apigatewayv2_integration.ai_lambda_integration.id}"
}

resource "aws_apigatewayv2_route" "generate_response_route" {
  api_id    = aws_apigatewayv2_api.http_api.id
  route_key = "POST /ai/generate-response"
  target    = "integrations/${aws_apigatewayv2_integration.ai_lambda_integration.id}"
}

resource "aws_apigatewayv2_stage" "default_stage" {
  api_id      = aws_apigatewayv2_api.http_api.id
  name        = "$default" # Default stage for HTTP APIs
  auto_deploy = true
  tags = {
    Project = "Scizor"
    Environment = var.environment
  }
}

resource "aws_lambda_permission" "apigateway_lambda_permission" {
  statement_id  = "AllowExecutionFromAPIGateway"
  action        = "lambda:InvokeFunction"
  function_name = aws_lambda_function.ai_lambda.function_name
  principal     = "apigateway.amazonaws.com"
  source_arn    = "${aws_apigatewayv2_api.http_api.execution_arn}/*/*"
} 