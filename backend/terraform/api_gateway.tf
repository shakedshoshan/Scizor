# Create the API Gateway REST API for Scizor AI Backend
resource "aws_api_gateway_rest_api" "scizor_ai_api" {
  name        = "ScizorAIApi"
  description = "Scizor AI Backend API with enhance-prompt, generate-response, and text-to-speech endpoints"
}

# Create the base resource for AI endpoints
resource "aws_api_gateway_resource" "ai_resource" {
  rest_api_id = aws_api_gateway_rest_api.scizor_ai_api.id
  parent_id   = aws_api_gateway_rest_api.scizor_ai_api.root_resource_id
  path_part   = "ai"
}

# Create resources for each AI endpoint
resource "aws_api_gateway_resource" "enhance_prompt_resource" {
  rest_api_id = aws_api_gateway_rest_api.scizor_ai_api.id
  parent_id   = aws_api_gateway_resource.ai_resource.id
  path_part   = "enhance-prompt"
}

resource "aws_api_gateway_resource" "generate_response_resource" {
  rest_api_id = aws_api_gateway_rest_api.scizor_ai_api.id
  parent_id   = aws_api_gateway_resource.ai_resource.id
  path_part   = "generate-response"
}

resource "aws_api_gateway_resource" "text_to_speech_resource" {
  rest_api_id = aws_api_gateway_rest_api.scizor_ai_api.id
  parent_id   = aws_api_gateway_resource.ai_resource.id
  path_part   = "text-to-speech"
}

resource "aws_api_gateway_resource" "health_resource" {
  rest_api_id = aws_api_gateway_rest_api.scizor_ai_api.id
  parent_id   = aws_api_gateway_resource.ai_resource.id
  path_part   = "health"
}

# Create methods for each endpoint
resource "aws_api_gateway_method" "enhance_prompt_method" {
  rest_api_id   = aws_api_gateway_rest_api.scizor_ai_api.id
  resource_id   = aws_api_gateway_resource.enhance_prompt_resource.id
  http_method   = "POST"
  authorization = "NONE"
}

resource "aws_api_gateway_method" "generate_response_method" {
  rest_api_id   = aws_api_gateway_rest_api.scizor_ai_api.id
  resource_id   = aws_api_gateway_resource.generate_response_resource.id
  http_method   = "POST"
  authorization = "NONE"
}

resource "aws_api_gateway_method" "text_to_speech_method" {
  rest_api_id   = aws_api_gateway_rest_api.scizor_ai_api.id
  resource_id   = aws_api_gateway_resource.text_to_speech_resource.id
  http_method   = "POST"
  authorization = "NONE"
}

resource "aws_api_gateway_method" "health_method" {
  rest_api_id   = aws_api_gateway_rest_api.scizor_ai_api.id
  resource_id   = aws_api_gateway_resource.health_resource.id
  http_method   = "GET"
  authorization = "NONE"
}

# Connect all methods to the Lambda Function
resource "aws_api_gateway_integration" "enhance_prompt_integration" {
  rest_api_id = aws_api_gateway_rest_api.scizor_ai_api.id
  resource_id = aws_api_gateway_resource.enhance_prompt_resource.id
  http_method = aws_api_gateway_method.enhance_prompt_method.http_method
  type        = "AWS_PROXY"
  integration_http_method = "POST"
  uri         = aws_lambda_function.scizor_ai_lambda.invoke_arn
}

resource "aws_api_gateway_integration" "generate_response_integration" {
  rest_api_id = aws_api_gateway_rest_api.scizor_ai_api.id
  resource_id = aws_api_gateway_resource.generate_response_resource.id
  http_method = aws_api_gateway_method.generate_response_method.http_method
  type        = "AWS_PROXY"
  integration_http_method = "POST"
  uri         = aws_lambda_function.scizor_ai_lambda.invoke_arn
}

resource "aws_api_gateway_integration" "text_to_speech_integration" {
  rest_api_id = aws_api_gateway_rest_api.scizor_ai_api.id
  resource_id = aws_api_gateway_resource.text_to_speech_resource.id
  http_method = aws_api_gateway_method.text_to_speech_method.http_method
  type        = "AWS_PROXY"
  integration_http_method = "POST"
  uri         = aws_lambda_function.scizor_ai_lambda.invoke_arn
}

resource "aws_api_gateway_integration" "health_integration" {
  rest_api_id = aws_api_gateway_rest_api.scizor_ai_api.id
  resource_id = aws_api_gateway_resource.health_resource.id
  http_method = aws_api_gateway_method.health_method.http_method
  type        = "AWS_PROXY"
  integration_http_method = "POST"
  uri         = aws_lambda_function.scizor_ai_lambda.invoke_arn
}

# Create OPTIONS methods for CORS support
resource "aws_api_gateway_method" "enhance_prompt_options" {
  rest_api_id   = aws_api_gateway_rest_api.scizor_ai_api.id
  resource_id   = aws_api_gateway_resource.enhance_prompt_resource.id
  http_method   = "OPTIONS"
  authorization = "NONE"
}

resource "aws_api_gateway_method" "generate_response_options" {
  rest_api_id   = aws_api_gateway_rest_api.scizor_ai_api.id
  resource_id   = aws_api_gateway_resource.generate_response_resource.id
  http_method   = "OPTIONS"
  authorization = "NONE"
}

resource "aws_api_gateway_method" "text_to_speech_options" {
  rest_api_id   = aws_api_gateway_rest_api.scizor_ai_api.id
  resource_id   = aws_api_gateway_resource.text_to_speech_resource.id
  http_method   = "OPTIONS"
  authorization = "NONE"
}

# Create OPTIONS integrations for CORS
resource "aws_api_gateway_integration" "enhance_prompt_options_integration" {
  rest_api_id = aws_api_gateway_rest_api.scizor_ai_api.id
  resource_id = aws_api_gateway_resource.enhance_prompt_resource.id
  http_method = aws_api_gateway_method.enhance_prompt_options.http_method
  type        = "MOCK"
  
  request_templates = {
    "application/json" = "{\"statusCode\": 200}"
  }
}

resource "aws_api_gateway_integration" "generate_response_options_integration" {
  rest_api_id = aws_api_gateway_rest_api.scizor_ai_api.id
  resource_id = aws_api_gateway_resource.generate_response_resource.id
  http_method = aws_api_gateway_method.generate_response_options.http_method
  type        = "MOCK"
  
  request_templates = {
    "application/json" = "{\"statusCode\": 200}"
  }
}

resource "aws_api_gateway_integration" "text_to_speech_options_integration" {
  rest_api_id = aws_api_gateway_rest_api.scizor_ai_api.id
  resource_id = aws_api_gateway_resource.text_to_speech_resource.id
  http_method = aws_api_gateway_method.text_to_speech_options.http_method
  type        = "MOCK"
  
  request_templates = {
    "application/json" = "{\"statusCode\": 200}"
  }
}

# Create method responses for CORS
resource "aws_api_gateway_method_response" "enhance_prompt_options_response" {
  rest_api_id = aws_api_gateway_rest_api.scizor_ai_api.id
  resource_id = aws_api_gateway_resource.enhance_prompt_resource.id
  http_method = aws_api_gateway_method.enhance_prompt_options.http_method
  status_code = "200"
  
  response_parameters = {
    "method.response.header.Access-Control-Allow-Headers" = true
    "method.response.header.Access-Control-Allow-Methods" = true
    "method.response.header.Access-Control-Allow-Origin"  = true
  }
}

resource "aws_api_gateway_method_response" "generate_response_options_response" {
  rest_api_id = aws_api_gateway_rest_api.scizor_ai_api.id
  resource_id = aws_api_gateway_resource.generate_response_resource.id
  http_method = aws_api_gateway_method.generate_response_options.http_method
  status_code = "200"
  
  response_parameters = {
    "method.response.header.Access-Control-Allow-Headers" = true
    "method.response.header.Access-Control-Allow-Methods" = true
    "method.response.header.Access-Control-Allow-Origin"  = true
  }
}

resource "aws_api_gateway_method_response" "text_to_speech_options_response" {
  rest_api_id = aws_api_gateway_rest_api.scizor_ai_api.id
  resource_id = aws_api_gateway_resource.text_to_speech_resource.id
  http_method = aws_api_gateway_method.text_to_speech_options.http_method
  status_code = "200"
  
  response_parameters = {
    "method.response.header.Access-Control-Allow-Headers" = true
    "method.response.header.Access-Control-Allow-Methods" = true
    "method.response.header.Access-Control-Allow-Origin"  = true
  }
}

# Create integration responses for CORS
resource "aws_api_gateway_integration_response" "enhance_prompt_options_integration_response" {
  rest_api_id = aws_api_gateway_rest_api.scizor_ai_api.id
  resource_id = aws_api_gateway_resource.enhance_prompt_resource.id
  http_method = aws_api_gateway_method.enhance_prompt_options.http_method
  status_code = aws_api_gateway_method_response.enhance_prompt_options_response.status_code
  
  response_parameters = {
    "method.response.header.Access-Control-Allow-Headers" = "'Content-Type,X-Amz-Date,Authorization,X-Api-Key,X-Amz-Security-Token'"
    "method.response.header.Access-Control-Allow-Methods" = "'GET,OPTIONS,POST,PUT'"
    "method.response.header.Access-Control-Allow-Origin"  = "'*'"
  }
}

resource "aws_api_gateway_integration_response" "generate_response_options_integration_response" {
  rest_api_id = aws_api_gateway_rest_api.scizor_ai_api.id
  resource_id = aws_api_gateway_resource.generate_response_resource.id
  http_method = aws_api_gateway_method.generate_response_options.http_method
  status_code = aws_api_gateway_method_response.generate_response_options_response.status_code
  
  response_parameters = {
    "method.response.header.Access-Control-Allow-Headers" = "'Content-Type,X-Amz-Date,Authorization,X-Api-Key,X-Amz-Security-Token'"
    "method.response.header.Access-Control-Allow-Methods" = "'GET,OPTIONS,POST,PUT'"
    "method.response.header.Access-Control-Allow-Origin"  = "'*'"
  }
}

resource "aws_api_gateway_integration_response" "text_to_speech_options_integration_response" {
  rest_api_id = aws_api_gateway_rest_api.scizor_ai_api.id
  resource_id = aws_api_gateway_resource.text_to_speech_resource.id
  http_method = aws_api_gateway_method.text_to_speech_options.http_method
  status_code = aws_api_gateway_method_response.text_to_speech_options_response.status_code
  
  response_parameters = {
    "method.response.header.Access-Control-Allow-Headers" = "'Content-Type,X-Amz-Date,Authorization,X-Api-Key,X-Amz-Security-Token'"
    "method.response.header.Access-Control-Allow-Methods" = "'GET,OPTIONS,POST,PUT'"
    "method.response.header.Access-Control-Allow-Origin"  = "'*'"
  }
}

# Deploy the API Gateway
resource "aws_api_gateway_deployment" "scizor_ai_deployment" {
  rest_api_id = aws_api_gateway_rest_api.scizor_ai_api.id
  
  # This triggers a new deployment every time the Lambda integration changes.
  triggers = {
    redeployment = sha1(jsonencode([
      aws_api_gateway_integration.enhance_prompt_integration,
      aws_api_gateway_integration.generate_response_integration,
      aws_api_gateway_integration.text_to_speech_integration,
      aws_api_gateway_integration.health_integration
    ]))
  }

  lifecycle {
    create_before_destroy = true
  }
}

# Create a Stage for the Deployment
resource "aws_api_gateway_stage" "scizor_ai_stage" {
  deployment_id = aws_api_gateway_deployment.scizor_ai_deployment.id
  rest_api_id   = aws_api_gateway_rest_api.scizor_ai_api.id
  stage_name    = "prod"
}
