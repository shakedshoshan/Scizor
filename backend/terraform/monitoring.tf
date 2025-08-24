# CloudWatch monitoring and Grafana integration for Scizor AI Backend
# This file contains resources for monitoring API Gateway and Lambda function metrics

#########################################
# CloudWatch Log Groups and Metrics    #
#########################################

# CloudWatch Log Group for API Gateway
resource "aws_cloudwatch_log_group" "api_gateway_logs" {
  name              = "/aws/apigateway/scizor-ai-api"
  retention_in_days = 14

  tags = {
    Environment = var.environment
    Service     = "ScizorAI"
    Component   = "APIGateway"
  }
}

# CloudWatch Log Group for Lambda
resource "aws_cloudwatch_log_group" "lambda_logs" {
  name              = "/aws/lambda/scizor-ai-backend"
  retention_in_days = 14

  tags = {
    Environment = var.environment
    Service     = "ScizorAI"
    Component   = "Lambda"
  }
}

# Custom CloudWatch metrics for API monitoring
resource "aws_cloudwatch_metric_alarm" "api_error_rate" {
  alarm_name          = "scizor-ai-api-error-rate"
  comparison_operator = "GreaterThanThreshold"
  evaluation_periods  = "2"
  metric_name         = "4XXError"
  namespace           = "AWS/ApiGateway"
  period              = "120"
  statistic           = "Sum"
  threshold           = "10"
  alarm_description   = "This metric monitors API Gateway 4XX error rate"
  alarm_actions       = []

  dimensions = {
    ApiName = aws_api_gateway_rest_api.scizor_ai_api.name
  }

  tags = {
    Environment = var.environment
    Service     = "ScizorAI"
  }
}

resource "aws_cloudwatch_metric_alarm" "lambda_error_rate" {
  alarm_name          = "scizor-ai-lambda-error-rate"
  comparison_operator = "GreaterThanThreshold"
  evaluation_periods  = "2"
  metric_name         = "Errors"
  namespace           = "AWS/Lambda"
  period              = "60"
  statistic           = "Sum"
  threshold           = "5"
  alarm_description   = "This metric monitors Lambda function errors"
  alarm_actions       = []

  dimensions = {
    FunctionName = aws_lambda_function.scizor_ai_lambda.function_name
  }

  tags = {
    Environment = var.environment
    Service     = "ScizorAI"
  }
}

resource "aws_cloudwatch_metric_alarm" "lambda_duration" {
  alarm_name          = "scizor-ai-lambda-duration"
  comparison_operator = "GreaterThanThreshold"
  evaluation_periods  = "2"
  metric_name         = "Duration"
  namespace           = "AWS/Lambda"
  period              = "60"
  statistic           = "Average"
  threshold           = "25000"  # 25 seconds (function timeout is 30s)
  alarm_description   = "This metric monitors Lambda function duration"
  alarm_actions       = []

  dimensions = {
    FunctionName = aws_lambda_function.scizor_ai_lambda.function_name
  }

  tags = {
    Environment = var.environment
    Service     = "ScizorAI"
  }
}

#########################################
# IAM Role for Grafana CloudWatch Access #
#########################################

# IAM role for Grafana to access CloudWatch metrics
resource "aws_iam_role" "grafana_cloudwatch_role" {
  name = "ScizorAI-GrafanaCloudWatch-Role"

  assume_role_policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Action = "sts:AssumeRole"
        Effect = "Allow"
        Principal = {
          AWS = "arn:aws:iam::${var.grafana_account_id}:root"
        }
        Condition = {
          StringEquals = {
            "sts:ExternalId" = var.grafana_external_id
          }
        }
      }
    ]
  })

  tags = {
    Environment = var.environment
    Service     = "ScizorAI"
    Component   = "Monitoring"
  }
}

# IAM policy for Grafana CloudWatch access
resource "aws_iam_policy" "grafana_cloudwatch_policy" {
  name        = "ScizorAI-GrafanaCloudWatch-Policy"
  description = "Policy for Grafana to access CloudWatch metrics and logs"

  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Effect = "Allow"
        Action = [
          "cloudwatch:DescribeAlarmsForMetric",
          "cloudwatch:DescribeAlarmHistory",
          "cloudwatch:DescribeAlarms",
          "cloudwatch:ListMetrics",
          "cloudwatch:GetMetricStatistics",
          "cloudwatch:GetMetricData",
          "cloudwatch:GetInsightRuleReport"
        ]
        Resource = "*"
      },
      {
        Effect = "Allow"
        Action = [
          "logs:DescribeLogGroups",
          "logs:DescribeLogStreams",
          "logs:GetLogEvents",
          "logs:StartQuery",
          "logs:StopQuery",
          "logs:GetQueryResults"
        ]
        Resource = [
          aws_cloudwatch_log_group.api_gateway_logs.arn,
          aws_cloudwatch_log_group.lambda_logs.arn,
          "${aws_cloudwatch_log_group.api_gateway_logs.arn}:*",
          "${aws_cloudwatch_log_group.lambda_logs.arn}:*"
        ]
      },
      {
        Effect = "Allow"
        Action = [
          "ec2:DescribeRegions",
          "ec2:DescribeAvailabilityZones",
          "ec2:DescribeInstances"
        ]
        Resource = "*"
      }
    ]
  })

  tags = {
    Environment = var.environment
    Service     = "ScizorAI"
  }
}

# Attach policy to role
resource "aws_iam_role_policy_attachment" "grafana_cloudwatch_policy_attachment" {
  role       = aws_iam_role.grafana_cloudwatch_role.name
  policy_arn = aws_iam_policy.grafana_cloudwatch_policy.arn
}

#########################################
# API Gateway Detailed Logging         #
#########################################

# Enable API Gateway execution logging
resource "aws_api_gateway_account" "api_account" {
  cloudwatch_role_arn = aws_iam_role.api_gateway_cloudwatch_role.arn
}

# IAM role for API Gateway CloudWatch logging
resource "aws_iam_role" "api_gateway_cloudwatch_role" {
  name = "ScizorAI-APIGateway-CloudWatch-Role"

  assume_role_policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Action = "sts:AssumeRole"
        Effect = "Allow"
        Principal = {
          Service = "apigateway.amazonaws.com"
        }
      }
    ]
  })

  tags = {
    Environment = var.environment
    Service     = "ScizorAI"
  }
}

# Attach CloudWatch logs policy to API Gateway role
resource "aws_iam_role_policy_attachment" "api_gateway_cloudwatch_logs" {
  role       = aws_iam_role.api_gateway_cloudwatch_role.name
  policy_arn = "arn:aws:iam::aws:policy/service-role/AmazonAPIGatewayPushToCloudWatchLogs"
}

# Method settings for API Gateway logging
resource "aws_api_gateway_method_settings" "api_settings" {
  rest_api_id = aws_api_gateway_rest_api.scizor_ai_api.id
  stage_name  = aws_api_gateway_stage.scizor_ai_stage.stage_name
  method_path = "*/*"

  settings {
    logging_level      = "INFO"
    data_trace_enabled = true
    metrics_enabled    = true

    # Throttling settings
    throttling_rate_limit  = 1000
    throttling_burst_limit = 2000
  }

  depends_on = [aws_api_gateway_account.api_account]
}
