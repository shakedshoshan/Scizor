# Create the API Gateway REST API
resource "aws_api_gateway_rest_api" "hello_world_api" {
  name        = "HelloWorldApi"
  description = "A simple 'Hello World' API"
}

# Create a Resource and a Method for the API Gateway
resource "aws_api_gateway_resource" "hello_world_resource" {
  rest_api_id = aws_api_gateway_rest_api.hello_world_api.id
  parent_id   = aws_api_gateway_rest_api.hello_world_api.root_resource_id
  path_part   = "hello"
}

resource "aws_api_gateway_method" "hello_world_method" {
  rest_api_id   = aws_api_gateway_rest_api.hello_world_api.id
  resource_id   = aws_api_gateway_resource.hello_world_resource.id
  http_method   = "GET"
  authorization = "NONE"
}

# Connect the API Gateway to the Lambda Function
resource "aws_api_gateway_integration" "lambda_integration" {
  rest_api_id = aws_api_gateway_rest_api.hello_world_api.id
  resource_id = aws_api_gateway_resource.hello_world_resource.id
  http_method = aws_api_gateway_method.hello_world_method.http_method
  type        = "AWS_PROXY"
  integration_http_method = "POST"
  uri         = aws_lambda_function.hello_world_lambda.invoke_arn
}

# Deploy the API Gateway
resource "aws_api_gateway_deployment" "hello_world_deployment" {
  rest_api_id = aws_api_gateway_rest_api.hello_world_api.id
  
  # This triggers a new deployment every time the Lambda integration changes.
  triggers = {
    redeployment = sha1(jsonencode(aws_api_gateway_integration.lambda_integration))
  }

  lifecycle {
    create_before_destroy = true
  }
}

# Create a Stage for the Deployment
resource "aws_api_gateway_stage" "hello_world_stage" {
  deployment_id = aws_api_gateway_deployment.hello_world_deployment.id
  rest_api_id   = aws_api_gateway_rest_api.hello_world_api.id
  stage_name    = "prod"
}
