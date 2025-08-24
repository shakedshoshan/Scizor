# Grafana Dashboard configuration for Scizor AI Backend monitoring
# This file creates a comprehensive dashboard for monitoring API performance

#########################################
# Grafana Dashboard Provider Setup     #
#########################################

# Configure Grafana provider for dashboard management
provider "grafana" {
  alias = "dashboard"
  url   = data.grafana_cloud_stack.monitoring_stack.url
  auth  = var.grafana_service_account_key
}

#########################################
# Monitoring Dashboard                  #
#########################################

# Main monitoring dashboard for Scizor AI Backend
resource "grafana_dashboard" "scizor_ai_monitoring" {
  provider = grafana.dashboard
  
  config_json = jsonencode({
    id    = null
    uid   = "scizor-ai-backend-monitoring"
    title = "Scizor AI Backend Monitoring"
    tags  = ["scizor-ai", "monitoring", "aws", "lambda", "api-gateway"]
    
    timezone      = "browser"
    schemaVersion = 30
    version       = 1
    refresh       = "30s"
    
    time = {
      from = "now-1h"
      to   = "now"
    }
    
    panels = [
      # API Gateway Request Count
      {
        id    = 1
        title = "API Gateway Requests"
        type  = "graph"
        gridPos = {
          h = 8
          w = 12
          x = 0
          y = 0
        }
        targets = [
          {
            expr = "sum(rate(aws_apigateway_count_sum[5m])) by (api_name)"
            legendFormat = "{{api_name}}"
          }
        ]
        yAxes = [
          {
            label = "Requests/sec"
            min   = 0
          },
          {
            show = false
          }
        ]
        legend = {
          show = true
        }
      },
      
      # API Gateway Latency
      {
        id    = 2
        title = "API Gateway Latency"
        type  = "graph"
        gridPos = {
          h = 8
          w = 12
          x = 12
          y = 0
        }
        targets = [
          {
            expr = "aws_apigateway_latency_average"
            legendFormat = "Average Latency"
          },
          {
            expr = "aws_apigateway_latency_maximum"
            legendFormat = "Max Latency"
          }
        ]
        yAxes = [
          {
            label = "Milliseconds"
            min   = 0
          },
          {
            show = false
          }
        ]
      },
      
      # Error Rates
      {
        id    = 3
        title = "Error Rates"
        type  = "graph"
        gridPos = {
          h = 8
          w = 12
          x = 0
          y = 8
        }
        targets = [
          {
            expr = "sum(rate(aws_apigateway_4_x_x_error_sum[5m]))"
            legendFormat = "4XX Errors"
          },
          {
            expr = "sum(rate(aws_apigateway_5_x_x_error_sum[5m]))"
            legendFormat = "5XX Errors"
          }
        ]
        yAxes = [
          {
            label = "Errors/sec"
            min   = 0
          },
          {
            show = false
          }
        ]
      },
      
      # Lambda Function Metrics
      {
        id    = 4
        title = "Lambda Function Performance"
        type  = "graph"
        gridPos = {
          h = 8
          w = 12
          x = 12
          y = 8
        }
        targets = [
          {
            expr = "aws_lambda_duration_average"
            legendFormat = "Average Duration"
          },
          {
            expr = "aws_lambda_duration_maximum"
            legendFormat = "Max Duration"
          }
        ]
        yAxes = [
          {
            label = "Milliseconds"
            min   = 0
          },
          {
            show = false
          }
        ]
      },
      
      # Lambda Invocations
      {
        id    = 5
        title = "Lambda Invocations"
        type  = "singlestat"
        gridPos = {
          h = 4
          w = 6
          x = 0
          y = 16
        }
        targets = [
          {
            expr = "sum(rate(aws_lambda_invocations_sum[5m]))"
          }
        ]
        valueName = "current"
        format    = "ops"
      },
      
      # Lambda Errors
      {
        id    = 6
        title = "Lambda Errors"
        type  = "singlestat"
        gridPos = {
          h = 4
          w = 6
          x = 6
          y = 16
        }
        targets = [
          {
            expr = "sum(rate(aws_lambda_errors_sum[5m]))"
          }
        ]
        valueName = "current"
        format    = "ops"
        colorBackground = true
        thresholds = "0,0.1"
        colors = ["green", "yellow", "red"]
      },
      
      # Lambda Concurrent Executions
      {
        id    = 7
        title = "Concurrent Executions"
        type  = "singlestat"
        gridPos = {
          h = 4
          w = 6
          x = 12
          y = 16
        }
        targets = [
          {
            expr = "aws_lambda_concurrent_executions_maximum"
          }
        ]
        valueName = "current"
        format    = "short"
      },
      
      # Success Rate
      {
        id    = 8
        title = "Success Rate"
        type  = "singlestat"
        gridPos = {
          h = 4
          w = 6
          x = 18
          y = 16
        }
        targets = [
          {
            expr = "(sum(rate(aws_apigateway_count_sum[5m])) - sum(rate(aws_apigateway_4_x_x_error_sum[5m])) - sum(rate(aws_apigateway_5_x_x_error_sum[5m]))) / sum(rate(aws_apigateway_count_sum[5m])) * 100"
          }
        ]
        valueName = "current"
        format    = "percent"
        decimals  = 2
        colorBackground = true
        thresholds = "95,99"
        colors = ["red", "yellow", "green"]
      }
    ]
    
    templating = {
      list = [
        {
          name       = "environment"
          type       = "constant"
          current = {
            value = var.environment
          }
        }
      ]
    }
  })
  
  depends_on = [
    grafana_cloud_provider_aws_cloudwatch_scrape_job.api_gateway_scrape,
    grafana_cloud_provider_aws_cloudwatch_scrape_job.lambda_scrape
  ]
}

#########################################
# Alerting Rules                        #
#########################################

# Folder for Scizor AI alerts
resource "grafana_folder" "scizor_alerts" {
  provider = grafana.dashboard
  
  title = "Scizor AI Alerts"
  uid   = "scizor-ai-alerts"
}

# Alert rule for high error rate
resource "grafana_rule_group" "scizor_ai_alerts" {
  provider = grafana.dashboard
  
  name             = "ScizorAI Critical Alerts"
  folder_uid       = grafana_folder.scizor_alerts.uid
  interval_seconds = 60

  rule {
    name      = "High API Error Rate"
    condition = "B"
    
    data {
      ref_id = "A"
      query_type = ""
      relative_time_range {
        from = 600
        to   = 0
      }
      model = jsonencode({
        expr = "sum(rate(aws_apigateway_4_x_x_error_sum[5m])) + sum(rate(aws_apigateway_5_x_x_error_sum[5m]))"
      })
    }
    
    data {
      ref_id = "B"
      query_type = ""
      relative_time_range {
        from = 0
        to   = 0
      }
      model = jsonencode({
        conditions = [
          {
            evaluator = {
              params = [0.1]
              type   = "gt"
            }
            operator = {
              type = "and"
            }
            query = {
              model = ""
              params = ["A", "5m", "now"]
            }
            reducer = {
              params = []
              type   = "last"
            }
            type = "query"
          }
        ]
        datasource = {
          type = "__expr__"
          uid  = "__expr__"
        }
        expression = "A"
        hide       = false
        refId      = "B"
        type       = "threshold"
      })
    }
    
    no_data_state  = "NoData"
    exec_err_state = "Alerting"
    for            = "5m"
    
    annotations = {
      description = "API error rate is above 0.1 errors per second"
      summary     = "High error rate detected in Scizor AI API"
    }
    
    labels = {
      severity = "critical"
      service  = "scizor-ai"
    }
  }

  rule {
    name      = "High Lambda Duration"
    condition = "B"
    
    data {
      ref_id = "A"
      query_type = ""
      relative_time_range {
        from = 600
        to   = 0
      }
      model = jsonencode({
        expr = "aws_lambda_duration_average"
      })
    }
    
    data {
      ref_id = "B"
      query_type = ""
      relative_time_range {
        from = 0
        to   = 0
      }
      model = jsonencode({
        conditions = [
          {
            evaluator = {
              params = [20000]  # 20 seconds
              type   = "gt"
            }
            operator = {
              type = "and"
            }
            query = {
              model = ""
              params = ["A", "5m", "now"]
            }
            reducer = {
              params = []
              type   = "last"
            }
            type = "query"
          }
        ]
        datasource = {
          type = "__expr__"
          uid  = "__expr__"
        }
        expression = "A"
        hide       = false
        refId      = "B"
        type       = "threshold"
      })
    }
    
    no_data_state  = "NoData"
    exec_err_state = "Alerting"
    for            = "3m"
    
    annotations = {
      description = "Lambda function duration is above 20 seconds"
      summary     = "High Lambda duration detected in Scizor AI"
    }
    
    labels = {
      severity = "warning"
      service  = "scizor-ai"
    }
  }
}
