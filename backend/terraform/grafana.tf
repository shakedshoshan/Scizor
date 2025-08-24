# Grafana Cloud integration for Scizor AI Backend monitoring
# This file configures Grafana Cloud to monitor AWS resources

#########################################
# Grafana Cloud Provider Setup         #
#########################################

# Configure Grafana provider for Cloud integration
provider "grafana" {
  alias                     = "cloud"
  cloud_access_policy_token = var.grafana_cloud_access_token
}

# Data source for Grafana Cloud stack
data "grafana_cloud_stack" "monitoring_stack" {
  provider = grafana.cloud
  slug     = var.grafana_stack_slug
}

#########################################
# AWS Account Integration               #
#########################################

# Connect AWS account to Grafana Cloud
resource "grafana_cloud_provider_aws_account" "scizor_aws_account" {
  provider = grafana.cloud
  
  stack_id = data.grafana_cloud_stack.monitoring_stack.id
  role_arn = aws_iam_role.grafana_cloudwatch_role.arn
  regions  = [var.aws_region]
}

#########################################
# CloudWatch Scrape Job Configuration  #
#########################################

# CloudWatch scrape job for API Gateway metrics
resource "grafana_cloud_provider_aws_cloudwatch_scrape_job" "api_gateway_scrape" {
  provider = grafana.cloud
  
  stack_id                = data.grafana_cloud_stack.monitoring_stack.id
  name                    = "scizor-ai-api-gateway-metrics"
  aws_account_resource_id = grafana_cloud_provider_aws_account.scizor_aws_account.resource_id
  export_tags             = true

  # API Gateway metrics
  service {
    name = "AWS/ApiGateway"
    
    metric {
      name       = "Count"
      statistics = ["Sum"]
    }
    
    metric {
      name       = "Latency"
      statistics = ["Average", "Maximum"]
    }
    
    metric {
      name       = "IntegrationLatency"
      statistics = ["Average", "Maximum"]
    }
    
    metric {
      name       = "4XXError"
      statistics = ["Sum"]
    }
    
    metric {
      name       = "5XXError"
      statistics = ["Sum"]
    }
    
    scrape_interval_seconds = 60
    
    resource_discovery_tag_filter {
      key   = "Service"
      value = "ScizorAI"
    }
    
    tags_to_add_to_metrics = ["Environment", "Service"]
  }

  static_labels = {
    "service"     = "scizor-ai"
    "environment" = var.environment
    "component"   = "api-gateway"
  }
}

# CloudWatch scrape job for Lambda metrics
resource "grafana_cloud_provider_aws_cloudwatch_scrape_job" "lambda_scrape" {
  provider = grafana.cloud
  
  stack_id                = data.grafana_cloud_stack.monitoring_stack.id
  name                    = "scizor-ai-lambda-metrics"
  aws_account_resource_id = grafana_cloud_provider_aws_account.scizor_aws_account.resource_id
  export_tags             = true

  # Lambda metrics
  service {
    name = "AWS/Lambda"
    
    metric {
      name       = "Invocations"
      statistics = ["Sum"]
    }
    
    metric {
      name       = "Duration"
      statistics = ["Average", "Maximum"]
    }
    
    metric {
      name       = "Errors"
      statistics = ["Sum"]
    }
    
    metric {
      name       = "Throttles"
      statistics = ["Sum"]
    }
    
    metric {
      name       = "ConcurrentExecutions"
      statistics = ["Maximum"]
    }
    
    scrape_interval_seconds = 60
    
    resource_discovery_tag_filter {
      key   = "Service"
      value = "ScizorAI"
    }
    
    tags_to_add_to_metrics = ["Environment", "Service"]
  }

  static_labels = {
    "service"     = "scizor-ai"
    "environment" = var.environment
    "component"   = "lambda"
  }
}

#########################################
# Custom Metrics for Application KPIs  #
#########################################

# Custom namespace for application-specific metrics
resource "grafana_cloud_provider_aws_cloudwatch_scrape_job" "custom_metrics_scrape" {
  provider = grafana.cloud
  
  stack_id                = data.grafana_cloud_stack.monitoring_stack.id
  name                    = "scizor-ai-custom-metrics"
  aws_account_resource_id = grafana_cloud_provider_aws_account.scizor_aws_account.resource_id
  export_tags             = true

  # Custom application metrics
  custom_namespace {
    name = "ScizorAI/Application"
    
    metric {
      name       = "UserRequests"
      statistics = ["Sum", "Average"]
    }
    
    metric {
      name       = "AIProcessingTime"
      statistics = ["Average", "Maximum"]
    }
    
    metric {
      name       = "AuthenticationAttempts"
      statistics = ["Sum"]
    }
    
    metric {
      name       = "FailedAuthentications"
      statistics = ["Sum"]
    }
    
    scrape_interval_seconds = 300
  }

  static_labels = {
    "service"     = "scizor-ai"
    "environment" = var.environment
    "component"   = "application"
  }
}
