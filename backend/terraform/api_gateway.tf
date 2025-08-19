########################################
# API Gateway: REST API and Resources  #
########################################

resource "aws_api_gateway_rest_api" "scizor_ai_api" {
  name        = "ScizorAIApi"
  description = "Scizor AI Backend API with enhance-prompt, generate-response, text-to-speech, translate, health, auth, and payment endpoints"
  
  # Add binary media types for audio responses
  binary_media_types = [
    "audio/mpeg",
    "audio/opus", 
    "audio/aac",
    "audio/flac",
    "audio/*",
    "application/octet-stream"
  ]
}

resource "aws_api_gateway_resource" "ai_resource" {
  rest_api_id = aws_api_gateway_rest_api.scizor_ai_api.id
  parent_id   = aws_api_gateway_rest_api.scizor_ai_api.root_resource_id
  path_part   = "ai"
}

locals {
  endpoints = {
    "enhance-prompt"  = { method = "POST" }
    "generate-response" = { method = "POST" }
    "text-to-speech"  = { method = "POST" }
    "translate"       = { method = "POST" }
    "health"          = { method = "GET" }
  }

  cors_enabled_endpoints = [
    "enhance-prompt",
    "generate-response",
    "text-to-speech",
    "translate",
  ]

  auth_endpoints = {
    # /auth/create-user-token (POST)
    "create-user-token" = { method = "POST", parent = "auth" }
    # /auth/user/{userId} (GET)
    "user"              = { method = "GET", parent = "auth", child = "{userId}" }
    # /auth/device/token (POST)
    "token"             = { method = "POST", parent = "auth/device" }
    # /auth/device/refresh (POST)
    "refresh"           = { method = "POST", parent = "auth/device" }
  }

  payment_endpoints = {
    # /payment/new-subscriber (POST)
    "new-subscriber" = { method = "POST", parent = "payment" }
    # /payment/return-to-free (POST)
    "return-to-free" = { method = "POST", parent = "payment" }
    # /payment/monthly-renew (POST)
    "monthly-renew"  = { method = "POST", parent = "payment" }
  }

  auth_cors_enabled = [
    "create-user-token",
    "token",
    "refresh",
  ]

  payment_cors_enabled = [
    "new-subscriber",
    "return-to-free",
    "monthly-renew",
  ]
}

resource "aws_api_gateway_resource" "endpoint_resources" {
  for_each   = local.endpoints
  rest_api_id = aws_api_gateway_rest_api.scizor_ai_api.id
  parent_id   = aws_api_gateway_resource.ai_resource.id
  path_part   = each.key
}

# -----------------------------
# Auth resources
# -----------------------------

resource "aws_api_gateway_resource" "auth_base" {
  rest_api_id = aws_api_gateway_rest_api.scizor_ai_api.id
  parent_id   = aws_api_gateway_rest_api.scizor_ai_api.root_resource_id
  path_part   = "auth"
}

resource "aws_api_gateway_resource" "auth_device" {
  rest_api_id = aws_api_gateway_rest_api.scizor_ai_api.id
  parent_id   = aws_api_gateway_resource.auth_base.id
  path_part   = "device"
}

resource "aws_api_gateway_resource" "payment_base" {
  rest_api_id = aws_api_gateway_rest_api.scizor_ai_api.id
  parent_id   = aws_api_gateway_rest_api.scizor_ai_api.root_resource_id
  path_part   = "payment"
}

resource "aws_api_gateway_resource" "auth_routes" {
  for_each = {
    for k, v in local.auth_endpoints : k => v if contains(["auth", "auth/device"], v.parent)
  }
  rest_api_id = aws_api_gateway_rest_api.scizor_ai_api.id
  parent_id   = each.value.parent == "auth" ? aws_api_gateway_resource.auth_base.id : aws_api_gateway_resource.auth_device.id
  path_part   = each.key
}

resource "aws_api_gateway_resource" "payment_routes" {
  for_each = local.payment_endpoints
  rest_api_id = aws_api_gateway_rest_api.scizor_ai_api.id
  parent_id   = aws_api_gateway_resource.payment_base.id
  path_part   = each.key
}

resource "aws_api_gateway_resource" "auth_routes_child" {
  for_each = {
    for k, v in local.auth_endpoints : k => v if contains(keys(v), "child")
  }
  rest_api_id = aws_api_gateway_rest_api.scizor_ai_api.id
  parent_id   = aws_api_gateway_resource.auth_routes[each.key].id
  path_part   = each.value.child
}

resource "aws_api_gateway_method" "endpoint" {
  for_each     = local.endpoints
  rest_api_id  = aws_api_gateway_rest_api.scizor_ai_api.id
  resource_id  = aws_api_gateway_resource.endpoint_resources[each.key].id
  http_method  = each.value.method
  authorization = "NONE"
}

resource "aws_api_gateway_method" "auth" {
  for_each     = local.auth_endpoints
  rest_api_id  = aws_api_gateway_rest_api.scizor_ai_api.id
  resource_id  = contains(keys(each.value), "child") ? aws_api_gateway_resource.auth_routes_child[each.key].id : aws_api_gateway_resource.auth_routes[each.key].id
  http_method  = each.value.method
  authorization = "NONE"
}

resource "aws_api_gateway_method" "payment" {
  for_each     = local.payment_endpoints
  rest_api_id  = aws_api_gateway_rest_api.scizor_ai_api.id
  resource_id  = aws_api_gateway_resource.payment_routes[each.key].id
  http_method  = each.value.method
  authorization = "NONE"
}

resource "aws_api_gateway_integration" "endpoint" {
  for_each                = local.endpoints
  rest_api_id             = aws_api_gateway_rest_api.scizor_ai_api.id
  resource_id             = aws_api_gateway_resource.endpoint_resources[each.key].id
  http_method             = aws_api_gateway_method.endpoint[each.key].http_method
  type                    = "AWS_PROXY"
  integration_http_method = "POST"
  uri                     = aws_lambda_function.scizor_ai_lambda.invoke_arn
}

resource "aws_api_gateway_integration" "auth" {
  for_each                = local.auth_endpoints
  rest_api_id             = aws_api_gateway_rest_api.scizor_ai_api.id
  resource_id             = contains(keys(each.value), "child") ? aws_api_gateway_resource.auth_routes_child[each.key].id : aws_api_gateway_resource.auth_routes[each.key].id
  http_method             = aws_api_gateway_method.auth[each.key].http_method
  type                    = "AWS_PROXY"
  integration_http_method = "POST"
  uri                     = aws_lambda_function.scizor_ai_lambda.invoke_arn
}

resource "aws_api_gateway_integration" "payment" {
  for_each                = local.payment_endpoints
  rest_api_id             = aws_api_gateway_rest_api.scizor_ai_api.id
  resource_id             = aws_api_gateway_resource.payment_routes[each.key].id
  http_method             = aws_api_gateway_method.payment[each.key].http_method
  type                    = "AWS_PROXY"
  integration_http_method = "POST"
  uri                     = aws_lambda_function.scizor_ai_lambda.invoke_arn
}

########################################
# CORS (OPTIONS) for selected endpoints #
########################################

resource "aws_api_gateway_method" "options" {
  for_each     = toset(local.cors_enabled_endpoints)
  rest_api_id  = aws_api_gateway_rest_api.scizor_ai_api.id
  resource_id  = aws_api_gateway_resource.endpoint_resources[each.key].id
  http_method  = "OPTIONS"
  authorization = "NONE"
}

resource "aws_api_gateway_method" "auth_options" {
  for_each     = toset(local.auth_cors_enabled)
  rest_api_id  = aws_api_gateway_rest_api.scizor_ai_api.id
  resource_id  = aws_api_gateway_resource.auth_routes[each.key].id
  http_method  = "OPTIONS"
  authorization = "NONE"
}

resource "aws_api_gateway_method" "payment_options" {
  for_each     = toset(local.payment_cors_enabled)
  rest_api_id  = aws_api_gateway_rest_api.scizor_ai_api.id
  resource_id  = aws_api_gateway_resource.payment_routes[each.key].id
  http_method  = "OPTIONS"
  authorization = "NONE"
}

resource "aws_api_gateway_integration" "options_integration" {
  for_each   = toset(local.cors_enabled_endpoints)
  rest_api_id = aws_api_gateway_rest_api.scizor_ai_api.id
  resource_id = aws_api_gateway_resource.endpoint_resources[each.key].id
  http_method = aws_api_gateway_method.options[each.key].http_method
  type        = "MOCK"

  request_templates = {
    "application/json" = "{\"statusCode\": 200}"
  }
}

resource "aws_api_gateway_integration" "auth_options_integration" {
  for_each   = toset(local.auth_cors_enabled)
  rest_api_id = aws_api_gateway_rest_api.scizor_ai_api.id
  resource_id = aws_api_gateway_resource.auth_routes[each.key].id
  http_method = aws_api_gateway_method.auth_options[each.key].http_method
  type        = "MOCK"

  request_templates = {
    "application/json" = "{\"statusCode\": 200}"
  }
}

resource "aws_api_gateway_integration" "payment_options_integration" {
  for_each   = toset(local.payment_cors_enabled)
  rest_api_id = aws_api_gateway_rest_api.scizor_ai_api.id
  resource_id = aws_api_gateway_resource.payment_routes[each.key].id
  http_method = aws_api_gateway_method.payment_options[each.key].http_method
  type        = "MOCK"

  request_templates = {
    "application/json" = "{\"statusCode\": 200}"
  }
}

resource "aws_api_gateway_method_response" "options_response" {
  for_each   = toset(local.cors_enabled_endpoints)
  rest_api_id = aws_api_gateway_rest_api.scizor_ai_api.id
  resource_id = aws_api_gateway_resource.endpoint_resources[each.key].id
  http_method = aws_api_gateway_method.options[each.key].http_method
  status_code = "200"

  response_parameters = {
    "method.response.header.Access-Control-Allow-Headers" = true
    "method.response.header.Access-Control-Allow-Methods" = true
    "method.response.header.Access-Control-Allow-Origin"  = true
  }
}

resource "aws_api_gateway_method_response" "auth_options_response" {
  for_each   = toset(local.auth_cors_enabled)
  rest_api_id = aws_api_gateway_rest_api.scizor_ai_api.id
  resource_id = aws_api_gateway_resource.auth_routes[each.key].id
  http_method = aws_api_gateway_method.auth_options[each.key].http_method
  status_code = "200"

  response_parameters = {
    "method.response.header.Access-Control-Allow-Headers" = true
    "method.response.header.Access-Control-Allow-Methods" = true
    "method.response.header.Access-Control-Allow-Origin"  = true
  }
}

resource "aws_api_gateway_method_response" "payment_options_response" {
  for_each   = toset(local.payment_cors_enabled)
  rest_api_id = aws_api_gateway_rest_api.scizor_ai_api.id
  resource_id = aws_api_gateway_resource.payment_routes[each.key].id
  http_method = aws_api_gateway_method.payment_options[each.key].http_method
  status_code = "200"

  response_parameters = {
    "method.response.header.Access-Control-Allow-Headers" = true
    "method.response.header.Access-Control-Allow-Methods" = true
    "method.response.header.Access-Control-Allow-Origin"  = true
  }
}

resource "aws_api_gateway_integration_response" "options_integration_response" {
  for_each   = toset(local.cors_enabled_endpoints)
  rest_api_id = aws_api_gateway_rest_api.scizor_ai_api.id
  resource_id = aws_api_gateway_resource.endpoint_resources[each.key].id
  http_method = aws_api_gateway_method.options[each.key].http_method
  status_code = aws_api_gateway_method_response.options_response[each.key].status_code

  response_parameters = {
    "method.response.header.Access-Control-Allow-Headers" = "'Content-Type,X-Amz-Date,Authorization,X-Api-Key,X-Amz-Security-Token'"
    "method.response.header.Access-Control-Allow-Methods" = "'GET,OPTIONS,POST,PUT'"
    "method.response.header.Access-Control-Allow-Origin"  = "'*'"
  }
}

resource "aws_api_gateway_integration_response" "auth_options_integration_response" {
  for_each   = toset(local.auth_cors_enabled)
  rest_api_id = aws_api_gateway_rest_api.scizor_ai_api.id
  resource_id = aws_api_gateway_resource.auth_routes[each.key].id
  http_method = aws_api_gateway_method.auth_options[each.key].http_method
  status_code = aws_api_gateway_method_response.auth_options_response[each.key].status_code

  response_parameters = {
    "method.response.header.Access-Control-Allow-Headers" = "'Content-Type,X-Amz-Date,Authorization,X-Api-Key,X-Amz-Security-Token'"
    "method.response.header.Access-Control-Allow-Methods" = "'GET,OPTIONS,POST,PUT'"
    "method.response.header.Access-Control-Allow-Origin"  = "'*'"
  }
}

resource "aws_api_gateway_integration_response" "payment_options_integration_response" {
  for_each   = toset(local.payment_cors_enabled)
  rest_api_id = aws_api_gateway_rest_api.scizor_ai_api.id
  resource_id = aws_api_gateway_resource.payment_routes[each.key].id
  http_method = aws_api_gateway_method.payment_options[each.key].http_method
  status_code = aws_api_gateway_method_response.payment_options_response[each.key].status_code

  response_parameters = {
    "method.response.header.Access-Control-Allow-Headers" = "'Content-Type,X-Amz-Date,Authorization,X-Api-Key,X-Amz-Security-Token'"
    "method.response.header.Access-Control-Allow-Methods" = "'GET,OPTIONS,POST,PUT'"
    "method.response.header.Access-Control-Allow-Origin"  = "'*'"
  }
}



#########################
# Deployment and Stage  #
#########################

resource "aws_api_gateway_deployment" "scizor_ai_deployment" {
  rest_api_id = aws_api_gateway_rest_api.scizor_ai_api.id

  triggers = {
    redeployment = sha1(jsonencode([
      for i in concat(
        values(aws_api_gateway_integration.endpoint),
        values(aws_api_gateway_integration.auth),
        values(aws_api_gateway_integration.payment)
      ) : i.id
    ]))
  }

  lifecycle {
    create_before_destroy = true
  }
}

resource "aws_api_gateway_stage" "scizor_ai_stage" {
  deployment_id = aws_api_gateway_deployment.scizor_ai_deployment.id
  rest_api_id   = aws_api_gateway_rest_api.scizor_ai_api.id
  stage_name    = "prod"
}

################
# Move blocks  #
################

moved {
  from = aws_api_gateway_resource.enhance_prompt_resource
  to   = aws_api_gateway_resource.endpoint_resources["enhance-prompt"]
}

moved {
  from = aws_api_gateway_resource.generate_response_resource
  to   = aws_api_gateway_resource.endpoint_resources["generate-response"]
}

moved {
  from = aws_api_gateway_resource.text_to_speech_resource
  to   = aws_api_gateway_resource.endpoint_resources["text-to-speech"]
}

moved {
  from = aws_api_gateway_resource.health_resource
  to   = aws_api_gateway_resource.endpoint_resources["health"]
}

moved {
  from = aws_api_gateway_method.enhance_prompt_method
  to   = aws_api_gateway_method.endpoint["enhance-prompt"]
}

moved {
  from = aws_api_gateway_method.generate_response_method
  to   = aws_api_gateway_method.endpoint["generate-response"]
}

moved {
  from = aws_api_gateway_method.text_to_speech_method
  to   = aws_api_gateway_method.endpoint["text-to-speech"]
}

moved {
  from = aws_api_gateway_method.health_method
  to   = aws_api_gateway_method.endpoint["health"]
}

moved {
  from = aws_api_gateway_integration.enhance_prompt_integration
  to   = aws_api_gateway_integration.endpoint["enhance-prompt"]
}

moved {
  from = aws_api_gateway_integration.generate_response_integration
  to   = aws_api_gateway_integration.endpoint["generate-response"]
}

moved {
  from = aws_api_gateway_integration.text_to_speech_integration
  to   = aws_api_gateway_integration.endpoint["text-to-speech"]
}

moved {
  from = aws_api_gateway_integration.health_integration
  to   = aws_api_gateway_integration.endpoint["health"]
}

moved {
  from = aws_api_gateway_method.enhance_prompt_options
  to   = aws_api_gateway_method.options["enhance-prompt"]
}

moved {
  from = aws_api_gateway_method.generate_response_options
  to   = aws_api_gateway_method.options["generate-response"]
}

moved {
  from = aws_api_gateway_method.text_to_speech_options
  to   = aws_api_gateway_method.options["text-to-speech"]
}

moved {
  from = aws_api_gateway_integration.enhance_prompt_options_integration
  to   = aws_api_gateway_integration.options_integration["enhance-prompt"]
}

moved {
  from = aws_api_gateway_integration.generate_response_options_integration
  to   = aws_api_gateway_integration.options_integration["generate-response"]
}

moved {
  from = aws_api_gateway_integration.text_to_speech_options_integration
  to   = aws_api_gateway_integration.options_integration["text-to-speech"]
}

moved {
  from = aws_api_gateway_method_response.enhance_prompt_options_response
  to   = aws_api_gateway_method_response.options_response["enhance-prompt"]
}

moved {
  from = aws_api_gateway_method_response.generate_response_options_response
  to   = aws_api_gateway_method_response.options_response["generate-response"]
}

moved {
  from = aws_api_gateway_method_response.text_to_speech_options_response
  to   = aws_api_gateway_method_response.options_response["text-to-speech"]
}

moved {
  from = aws_api_gateway_integration_response.enhance_prompt_options_integration_response
  to   = aws_api_gateway_integration_response.options_integration_response["enhance-prompt"]
}

moved {
  from = aws_api_gateway_integration_response.generate_response_options_integration_response
  to   = aws_api_gateway_integration_response.options_integration_response["generate-response"]
}

moved {
  from = aws_api_gateway_integration_response.text_to_speech_options_integration_response
  to   = aws_api_gateway_integration_response.options_integration_response["text-to-speech"]
}
