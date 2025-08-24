# Variables for Scizor AI Backend

variable "openai_api_key" {
  description = "OpenAI API Key for AI operations"
  type        = string
  sensitive   = true
}

variable "firebase_project_id" {
  description = "Firebase Project ID for authentication and database"
  type        = string
}

variable "firebase_client_email" {
  description = "Firebase service account client email"
  type        = string
  default     = ""
}

variable "firebase_private_key" {
  description = "Firebase service account private key (single string). Accepts raw PEM with \\n or base64 string."
  type        = string
  sensitive   = true
  default     = ""
}

variable "aws_region" {
  description = "AWS region for deployment"
  type        = string
  default     = "us-east-1"
}

variable "environment" {
  description = "Environment name (dev, staging, prod)"
  type        = string
  default     = "prod"
}

variable "jwt_secret" {
  description = "JWT secret key for authentication tokens (minimum 32 characters)"
  type        = string
  sensitive   = true
}

# Grafana Cloud variables
variable "grafana_cloud_access_token" {
  description = "Grafana Cloud access policy token with required scopes"
  type        = string
  sensitive   = true
}

variable "grafana_stack_slug" {
  description = "Grafana Cloud stack slug/name for monitoring"
  type        = string
}

variable "grafana_service_account_key" {
  description = "Grafana service account key for dashboard management"
  type        = string
  sensitive   = true
}

variable "grafana_account_id" {
  description = "Grafana AWS account ID for cross-account access"
  type        = string
  default     = "008923505280"  # Grafana Labs AWS account ID
}

variable "grafana_external_id" {
  description = "External ID for Grafana cross-account role assumption"
  type        = string
  sensitive   = true
}