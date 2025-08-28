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

variable "lemon_squeezy_webhook_secret" {
  description = "Lemon Squeezy webhook secret for signature validation"
  type        = string
  sensitive   = true
}

variable "lemon_squeezy_pro_product_id" {
  description = "Lemon Squeezy Pro/Premium product ID"
  type        = string
}

variable "lemon_squeezy_standard_product_id" {
  description = "Lemon Squeezy Standard product ID"
  type        = string
}