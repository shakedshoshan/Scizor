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

variable "firebase_private_key" {
  description = "Firebase Private Key for service account"
  type        = string
  sensitive   = true
}

variable "firebase_client_email" {
  description = "Firebase Client Email for service account"
  type        = string
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
